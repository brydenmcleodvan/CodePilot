import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Send,
  Loader2,
  MessageCircle,
  Target,
  TrendingUp,
  Heart,
  Moon,
  Activity,
  User,
  Bot,
  Lightbulb,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
}

interface HealthContext {
  heartRate: { avg: number; recent: number; trend: 'up' | 'down' | 'stable' };
  sleep: { avgHours: number; quality: 'good' | 'fair' | 'poor'; recentNights: number };
  activity: { avgSteps: number; weeklyActive: number; trend: 'up' | 'down' | 'stable' };
  hrv: { avg: number; recent: number; status: 'excellent' | 'good' | 'fair' | 'poor' };
  glucose: { avg: number; recent: number; inRange: number };
  connectedDevices: string[];
}

interface HealthAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  userHealthContext: HealthContext;
}

const suggestionTemplates = [
  "Want to set a sleep goal based on your recent patterns?",
  "Would you like tips to improve your heart rate variability?",
  "Should we create a personalized activity plan?",
  "Want to track your progress over the next week?",
  "Would you like meditation recommendations for better recovery?",
  "Should we set up reminders for your health goals?",
];

export default function HealthAIChat({ isOpen, onClose, userHealthContext }: HealthAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm your personal health AI assistant. I can analyze your health data and provide personalized insights. I see you're tracking data from ${userHealthContext.connectedDevices.join(', ')}. What would you like to know about your health?`,
      role: 'assistant',
      timestamp: new Date(),
      suggestions: [
        "How is my sleep affecting my recovery?",
        "What does my heart rate trend mean?",
        "How can I improve my fitness levels?",
        "Am I getting enough quality sleep?",
      ],
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/health-ai/chat', {
        message,
        healthContext: userHealthContext,
        conversationHistory: messages.slice(-5), // Send last 5 messages for context
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        suggestions: data.suggestions || [],
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      setIsTyping(false);
      toast({
        title: 'Chat Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    chatMutation.mutate(currentMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Health AI Assistant</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Personalized insights based on your health data
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Health Context Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              HR: {userHealthContext.heartRate.avg} bpm
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Moon className="h-3 w-3 mr-1" />
              Sleep: {userHealthContext.sleep.avgHours}h avg
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Steps: {userHealthContext.activity.avgSteps.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              HRV: {userHealthContext.hrv.avg}ms
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Suggestions */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex justify-start"
              >
                <div className="space-y-2 max-w-[80%]">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Lightbulb className="h-4 w-4" />
                    <span>Quick suggestions:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="flex space-x-3 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex space-x-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health data..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || chatMutation.isPending}
              size="icon"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • AI responses are based on your connected health data
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example usage component
export function HealthAIChatButton({ userHealthContext }: { userHealthContext: HealthContext }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Ask Health AI</span>
      </Button>

      <HealthAIChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userHealthContext={userHealthContext}
      />
    </>
  );
}

// Sample health context for testing
export const sampleHealthContext: HealthContext = {
  heartRate: { avg: 72, recent: 74, trend: 'stable' },
  sleep: { avgHours: 7.5, quality: 'good', recentNights: 7 },
  activity: { avgSteps: 8543, weeklyActive: 4, trend: 'up' },
  hrv: { avg: 45, recent: 42, status: 'good' },
  glucose: { avg: 95, recent: 88, inRange: 85 },
  connectedDevices: ['Apple Watch', 'Oura Ring', 'iPhone'],
};