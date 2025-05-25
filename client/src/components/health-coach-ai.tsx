import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Heart,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

interface CoachingResponse {
  message: string;
  tone: 'encouraging' | 'motivational' | 'analytical' | 'supportive';
  suggestions: string[];
  followUpQuestions: string[];
  confidenceLevel: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'coach' | 'system';
  content: string;
  response?: CoachingResponse;
  timestamp: Date;
}

interface WeeklySummary {
  summary: CoachingResponse;
  weekRange: {
    start: string;
    end: string;
  };
}

const quickQuestions = [
  "Why didn't I hit my step goal this week?",
  "How can I improve my sleep quality?",
  "What's the best time to exercise for me?",
  "How do I stay consistent with my health goals?",
  "Why am I struggling with my water intake goal?",
  "What should I focus on to improve my overall health?",
  "How can I build better health habits?",
  "What's causing my energy levels to drop?"
];

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  type: 'system',
  content: "👋 Hi! I'm your AI Health Coach. I analyze your health patterns and provide personalized guidance to help you reach your goals. Ask me anything about your health journey!",
  timestamp: new Date()
};

export default function HealthCoachAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch weekly summary on component mount
  const { data: weeklySummary } = useQuery<WeeklySummary>({
    queryKey: ['/api/ai-health-coach/weekly-summary'],
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const askCoachMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/ai-health-coach/ask', { question });
      return response.json();
    },
    onSuccess: (data) => {
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        type: 'coach',
        content: data.response.message,
        response: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, coachMessage]);
    },
    onError: (error) => {
      console.error('Error asking coach:', error);
      const errorMessage: ChatMessage = {
        id: `coach-error-${Date.now()}`,
        type: 'coach',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add weekly summary message when available
  useEffect(() => {
    if (weeklySummary && messages.length === 1) {
      const summaryMessage: ChatMessage = {
        id: 'weekly-summary',
        type: 'coach',
        content: `📊 Here's your weekly health summary: ${weeklySummary.summary.message}`,
        response: weeklySummary.summary,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, summaryMessage]);
    }
  }, [weeklySummary, messages.length]);

  const handleSendMessage = (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear input
    if (!question) setInputValue('');

    // Ask AI coach
    askCoachMutation.mutate(messageText);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'encouraging': return <Heart className="h-4 w-4 text-green-500" />;
      case 'motivational': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'analytical': return <Lightbulb className="h-4 w-4 text-purple-500" />;
      case 'supportive': return <Sparkles className="h-4 w-4 text-yellow-500" />;
      default: return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'encouraging': return 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'motivational': return 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'analytical': return 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'supportive': return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-50 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Chat with your AI Health Coach
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ask questions about your health goals and get personalized advice
            </p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Zap className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Message Card */}
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <Card className={`${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                      <CardContent className="p-4">
                        {/* Message Header */}
                        <div className="flex items-start space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-blue-500' 
                              : message.type === 'system'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className={`h-4 w-4 ${message.type === 'system' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${
                                message.type === 'user' 
                                  ? 'text-white' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {message.type === 'user' ? 'You' : message.type === 'system' ? 'Health Coach' : 'AI Health Coach'}
                              </span>
                              <span className={`text-xs ${
                                message.type === 'user' 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="space-y-3">
                          <p className={`${
                            message.type === 'user' 
                              ? 'text-white' 
                              : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {message.content}
                          </p>
                          
                          {/* Coach Response Details */}
                          {message.response && (
                            <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                              {/* Tone and Confidence */}
                              <div className="flex items-center justify-between">
                                <Badge className={getToneColor(message.response.tone)}>
                                  {getToneIcon(message.response.tone)}
                                  <span className="ml-1 capitalize">{message.response.tone}</span>
                                </Badge>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>{message.response.confidenceLevel}% confident</span>
                                </div>
                              </div>

                              {/* Action Suggestions */}
                              {message.response.suggestions.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Lightbulb className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                      Action Steps
                                    </span>
                                  </div>
                                  <ul className="space-y-1">
                                    {message.response.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-200">
                                        <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                                        <span>{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Follow-up Questions */}
                              {message.response.followUpQuestions.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    🤔 You might also ask:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {message.response.followUpQuestions.map((question, idx) => (
                                      <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7 text-left"
                                        onClick={() => handleQuickQuestion(question)}
                                      >
                                        {question}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Message */}
            {askCoachMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Questions (shown when conversation is empty) */}
            {messages.length <= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    What would you like to know?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Choose a question below or ask me anything about your health goals
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto p-4 whitespace-normal"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Section */}
        <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about your health goals, patterns, or how to improve..."
                className="pr-12 h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={askCoachMutation.isPending}
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || askCoachMutation.isPending}
              className="h-10 px-4"
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send • AI responses are based on your actual health data
          </p>
        </div>
      </div>
    </div>
  );
}