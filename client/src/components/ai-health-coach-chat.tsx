import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Heart,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  type: 'user' | 'coach';
  content: string;
  response?: CoachingResponse;
  timestamp: Date;
}

const quickQuestions = [
  "Why didn't I hit my step goal this week?",
  "How can I improve my sleep quality?",
  "What's the best time to exercise for me?",
  "How do I stay consistent with my health goals?",
  "Why am I struggling with my water intake goal?"
];

export default function AIHealthCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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
        content: "I'm having trouble connecting right now. Please try again later!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

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

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
    >
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <span>AI Health Coach</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Hi! I'm your AI Health Coach. Ask me anything about your health goals!
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'coach' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="space-y-2">
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Coach Response Details */}
                        {message.response && (
                          <div className="space-y-2">
                            {/* Tone Badge */}
                            <div className="flex items-center space-x-1">
                              {getToneIcon(message.response.tone)}
                              <Badge variant="secondary" className="text-xs">
                                {message.response.tone}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {message.response.confidenceLevel}% confident
                              </span>
                            </div>

                            {/* Suggestions */}
                            {message.response.suggestions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">💡 Try this:</p>
                                <ul className="text-xs space-y-1">
                                  {message.response.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start space-x-1">
                                      <span>•</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Follow-up Questions */}
                            {message.response.followUpQuestions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">🤔 Consider:</p>
                                {message.response.followUpQuestions.map((question, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 mt-1 mr-1"
                                    onClick={() => handleQuickQuestion(question)}
                                  >
                                    {question}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {askCoachMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length === 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick questions:
              </p>
              <div className="space-y-1">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs h-8"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your health goals..."
              className="text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || askCoachMutation.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}