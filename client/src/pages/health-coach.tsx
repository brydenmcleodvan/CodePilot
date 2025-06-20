import React, { useState, useEffect } from 'react';
import { 
  HeadphonesIcon, Calendar, MessageSquare, VideoIcon, 
  Bot, Send, Mic, RefreshCw, Sparkles, AlertCircle,
  ChevronUp, ChevronDown, LineChart, Users, Award,
  Utensils, FileText, Play, BookOpen, Target, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { healthResponses, queryPerplexityAPI } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isExpanded, setIsExpanded] = useState(false);
  
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

      {/* Additional features in collapsible section */}
      <div className="mt-12">
        <Collapsible 
          className="border rounded-lg bg-white shadow overflow-hidden"
          open={isExpanded}
          onOpenChange={setIsExpanded}
        >
          <CollapsibleTrigger className="w-full flex justify-between items-center p-4 hover:bg-gray-50">
            <h2 className="text-xl font-semibold">Coaching Resources & Tools</h2>
            <div className="text-primary">
              {/* Animated icon */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 border-t">
              <Tabs defaultValue="analytics">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
                  <TabsTrigger value="analytics" className="flex items-center gap-1.5">
                    <LineChart className="w-4 h-4" />
                    <span>Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger value="community" className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Community</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Resources</span>
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Challenges</span>
                  </TabsTrigger>
                  <TabsTrigger value="assessments" className="flex items-center gap-1.5">
                    <ScrollText className="w-4 h-4" />
                    <span>Assessments</span>
                  </TabsTrigger>
                </TabsList>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <h3 className="text-lg font-medium mb-4">Health Progress Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-primary" />
                        Progress Charts
                      </h4>
                      <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Interactive progress charts will appear here</p>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" className="text-xs">Sleep</Button>
                        <Button size="sm" variant="outline" className="text-xs">Nutrition</Button>
                        <Button size="sm" variant="outline" className="text-xs">Activity</Button>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Health Insights
                      </h4>
                      <ul className="space-y-2">
                        <li className="border-l-2 border-green-500 pl-3 py-1 text-sm">
                          Sleep quality improved by 15% this month
                        </li>
                        <li className="border-l-2 border-amber-500 pl-3 py-1 text-sm">
                          Stress levels increased during work days
                        </li>
                        <li className="border-l-2 border-blue-500 pl-3 py-1 text-sm">
                          Water intake consistently below target
                        </li>
                        <li className="border-l-2 border-purple-500 pl-3 py-1 text-sm">
                          Exercise consistency improved on weekends
                        </li>
                      </ul>
                      <Button size="sm" variant="outline" className="w-full mt-4 text-xs">
                        View all insights
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                  <h3 className="text-lg font-medium mb-4">Community & Support</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Group Coaching
                      </h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between mb-1">
                            <p className="font-medium text-sm">Plant-Based Nutrition</p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 rounded-full">8 members</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Next session: Wednesday, 6PM</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between mb-1">
                            <p className="font-medium text-sm">Stress Management</p>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 rounded-full">12 members</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Next session: Friday, 5PM</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Browse all groups
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Success Stories
                      </h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Sarah J.</p>
                          <p className="text-xs text-muted-foreground mb-2">"Lost 15 lbs and improved sleep quality in 3 months"</p>
                          <div className="flex">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-yellow-400 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Michael T.</p>
                          <p className="text-xs text-muted-foreground mb-2">"Lowered blood pressure through diet changes and stress management"</p>
                          <div className="flex">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-yellow-400 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content">
                  <h3 className="text-lg font-medium mb-4">Health Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Articles
                      </h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">The Science of Sleep</p>
                          <p className="text-xs text-muted-foreground">5 min read • Sleep</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Anti-inflammatory Foods</p>
                          <p className="text-xs text-muted-foreground">8 min read • Nutrition</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Mindfulness for Beginners</p>
                          <p className="text-xs text-muted-foreground">6 min read • Mental Health</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          View all articles
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Play className="h-4 w-4 text-primary" />
                        Videos
                      </h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">5-Minute Desk Stretches</p>
                          <p className="text-xs text-muted-foreground">5:23 • Exercise</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Guided Meditation for Stress</p>
                          <p className="text-xs text-muted-foreground">10:15 • Mental Health</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Meal Prep Basics</p>
                          <p className="text-xs text-muted-foreground">8:47 • Nutrition</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          View all videos
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        Recipes
                      </h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Mediterranean Bowl</p>
                          <p className="text-xs text-muted-foreground">25 min • 420 cal</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Green Smoothie</p>
                          <p className="text-xs text-muted-foreground">5 min • 180 cal</p>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p className="font-medium text-sm">Overnight Oats</p>
                          <p className="text-xs text-muted-foreground">10 min • 350 cal</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          View all recipes
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Challenges Tab */}
                <TabsContent value="challenges">
                  <h3 className="text-lg font-medium mb-4">Wellness Challenges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-primary/40 rounded-md p-4 relative bg-primary/5">
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium py-1 px-2 rounded-bl-md">Active</div>
                      <h4 className="font-medium mb-3">7-Day Hydration Challenge</h4>
                      <p className="text-sm text-muted-foreground mb-3">Drink 8 glasses of water daily for one week to build better hydration habits.</p>
                      <div className="mb-3">
                        <p className="text-xs mb-1">Progress: 4/7 days</p>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-full bg-primary rounded-full w-[57%]" />
                        </div>
                      </div>
                      <Button size="sm" className="w-full text-xs">
                        Log today
                      </Button>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">21-Day Meditation</h4>
                      <p className="text-sm text-muted-foreground mb-3">Practice meditation for 10 minutes daily to reduce stress and improve focus.</p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Start challenge
                      </Button>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">Step Challenge</h4>
                      <p className="text-sm text-muted-foreground mb-3">Reach 8,000 steps daily for 14 days to boost your cardiovascular health.</p>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Start challenge
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Browse all challenges
                    </Button>
                  </div>
                </TabsContent>

                {/* Assessments Tab */}
                <TabsContent value="assessments">
                  <h3 className="text-lg font-medium mb-4">Health Assessments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">Available Assessments</h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Sleep Quality Assessment</p>
                            <p className="text-xs text-muted-foreground">5 minutes • 10 questions</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            Start
                          </Button>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Stress & Mood Evaluation</p>
                            <p className="text-xs text-muted-foreground">7 minutes • 15 questions</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            Start
                          </Button>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Nutrition Habits Assessment</p>
                            <p className="text-xs text-muted-foreground">10 minutes • 20 questions</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            Start
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-3">Previous Results</h4>
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between mb-1">
                            <p className="font-medium text-sm">Sleep Quality Assessment</p>
                            <span className="text-xs">Apr 15, 2025</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">Score: 72/100</p>
                            <Button size="sm" variant="ghost" className="text-xs h-7">
                              View details
                            </Button>
                          </div>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between mb-1">
                            <p className="font-medium text-sm">Stress & Mood Evaluation</p>
                            <span className="text-xs">Mar 22, 2025</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">Score: 65/100</p>
                            <Button size="sm" variant="ghost" className="text-xs h-7">
                              View details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

export default HealthCoach;