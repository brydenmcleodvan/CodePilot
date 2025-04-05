import React, { useState, useEffect } from 'react';
import { 
  HeadphonesIcon, Calendar, MessageSquare, VideoIcon, 
  Bot, Send, Mic, RefreshCw, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { healthResponses, queryPerplexityAPI } from "@/lib/utils";

// Define type for chat messages
interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

// Define type for API status
type ApiStatus = 'loading' | 'available' | 'unavailable';

export function HealthCoach() {
  // State for AI assistant chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: "Hello! I'm your AI Health Assistant. I can help answer health questions, provide wellness tips, and offer guidance on your health journey. How can I assist you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');
  
  // Set API status to unavailable for demo purposes
  useEffect(() => {
    // For demo purposes, we'll always use the fallback responses
    setApiStatus('unavailable');
  }, []);

  // Handle sending a message to the AI assistant
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Create a properly typed user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage
    };
    
    // Add user message to chat
    const newMessages: ChatMessage[] = [
      ...messages,
      userMessage
    ];
    
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Use Perplexity API if available, otherwise use fallback responses
      if (apiStatus === 'available') {
        // Send messages to Perplexity API
        const response = await queryPerplexityAPI(newMessages);
        
        // Add response to chat
        const updatedMessages: ChatMessage[] = [
          ...newMessages,
          { role: 'system', content: response }
        ];
        
        setMessages(updatedMessages);
      } else {
        // Use fallback responses
        setTimeout(() => {
          const randomResponse = healthResponses[Math.floor(Math.random() * healthResponses.length)];
          
          const updatedMessages: ChatMessage[] = [
            ...newMessages,
            { role: 'system', content: randomResponse }
          ];
          
          setMessages(updatedMessages);
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message to chat
      const updatedMessages: ChatMessage[] = [
        ...newMessages,
        { 
          role: 'system', 
          content: "I'm sorry, I'm having trouble responding right now. Please try again later."
        }
      ];
      
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <HeadphonesIcon className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Health Coach</h1>
      </div>

      <Tabs defaultValue="coach" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coach" className="flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4" />
            <span>Human Coach</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="coach">
          <p className="text-lg mb-8">
            Get personalized guidance from certified health professionals to achieve your wellness goals.
          </p>
        </TabsContent>
        
        <TabsContent value="ai">
          <p className="text-lg mb-8">
            Need quick health guidance? Chat with our AI Health Assistant for instant answers and wellness tips.
          </p>
          
          {/* AI Assistant Chat UI */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Chat header */}
            <div className="bg-primary p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold">AI Health Assistant</h3>
                <p className="text-xs opacity-90">Available 24/7 for your health questions</p>
              </div>
              <button 
                className="ml-auto p-2 rounded-full hover:bg-primary-dark text-white"
                onClick={() => {
                  // Reset chat to initial state
                  setMessages([{
                    role: 'system',
                    content: "Hello! I'm your AI Health Assistant. I can help answer health questions, provide wellness tips, and offer guidance on your health journey. How can I assist you today?"
                  }]);
                  setInputMessage('');
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="p-4 h-96 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white border rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-lg p-3 bg-white border rounded-tl-none">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about diet, exercise, sleep, stress management..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Powered by {apiStatus === 'available' ? 'Perplexity AI' : 'HealthMap AI'} - Not a substitute for professional medical advice</span>
                </div>
              </div>
              
              {apiStatus === 'loading' && (
                <div className="mt-2 flex justify-center">
                  <span className="text-xs flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    Checking API availability...
                  </span>
                </div>
              )}
              
              {apiStatus === 'unavailable' && (
                <div className="mt-2">
                  <div className="py-2 px-3 rounded border bg-amber-50 border-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Using fallback responses</p>
                      <p className="text-xs text-amber-600">
                        API connection unavailable. Using pre-defined responses.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Suggested questions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Suggested Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "How much sleep should I get each night?",
                "What foods can help reduce inflammation?",
                "How can I improve my stress management?",
                "What exercises are good for lower back pain?",
                "How much water should I drink daily?",
                "What are signs of vitamin D deficiency?"
              ].map((question, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  className="justify-start h-auto py-3 hover:bg-gray-50"
                  onClick={() => {
                    setInputMessage(question);
                    // Trigger send message after a short delay
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Assigned Coach</h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">AC</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Alex Chen</h3>
              <p className="text-sm text-muted-foreground mb-1">Certified Nutrition & Fitness Coach</p>
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-2">4.9 (128 reviews)</span>
              </div>
            </div>
          </div>

          <p className="mb-6">
            "I focus on creating sustainable lifestyle changes tailored to your unique needs. Together, we'll build habits that last a lifetime."
          </p>

          <div className="flex gap-3">
            <Button className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>

          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Weekly Check-in</h3>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Tomorrow</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">10:00 AM - 10:30 AM</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <VideoIcon className="w-3 h-3" />
                  Join
                </Button>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Nutrition Plan Review</h3>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Next Week</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Tuesday, 2:00 PM - 3:00 PM</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled>Join</Button>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Coaching Plan</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Current Focus Areas:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-md">
              <p className="font-medium">Stress Management</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-4/5" />
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <p className="font-medium">Nutrition Planning</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-1/2" />
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <p className="font-medium">Exercise Routine</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-2/3" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Recent Notes:</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm mb-2">
              <strong>Last session (May 2):</strong> Discussed improving sleep hygiene. Client is making progress with evening routine. Recommended reducing screen time by 30 minutes before bed.
            </p>
            <p className="text-sm">
              <strong>Action items:</strong> Track sleep quality for the next week, practice 5-minute meditation before bed, limit caffeine after 2pm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCoach;