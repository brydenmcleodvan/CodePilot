import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Phone, 
  Mail, 
  Clock,
  User,
  Bot,
  Paperclip,
  Star,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function CustomerSupportChat({ isOpen, onClose, userPlan = 'basic' }) {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'ticket', 'faq'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const messagesEndRef = useRef(null);

  // Get support options based on subscription tier
  const supportOptions = {
    basic: {
      channels: ['email', 'faq'],
      responseTime: '24-48 hours',
      features: ['Email support', 'Knowledge base', 'Community forum']
    },
    premium: {
      channels: ['email', 'chat', 'faq'],
      responseTime: '4-8 hours',
      features: ['Priority email', 'Live chat', 'Phone support', 'Knowledge base']
    },
    pro: {
      channels: ['email', 'chat', 'phone', 'faq'],
      responseTime: '1-2 hours',
      features: ['Dedicated support', 'Priority phone', 'Live chat', 'Account manager']
    }
  };

  const currentSupport = supportOptions[userPlan] || supportOptions.basic;

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'bot',
        content: `Hi! I'm here to help with your Healthmap questions. ${
          userPlan === 'pro' ? 'As a Pro user, you have priority support!' : 
          userPlan === 'premium' ? 'As a Premium user, you have priority access to our support team.' :
          'I can help you with common questions or connect you with our support team.'
        }`,
        timestamp: new Date(),
        options: [
          'Billing & Subscription',
          'Technical Issues', 
          'Feature Questions',
          'Account Settings'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userPlan]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const res = await apiRequest('POST', '/api/support/chat', messageData);
      return res.json();
    },
    onSuccess: (response) => {
      const botMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        options: response.options || []
      };
      setMessages(prev => [...prev, botMessage]);
    }
  });

  // Create support ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      const res = await apiRequest('POST', '/api/support/tickets', {
        ...ticketData,
        userPlan,
        priority: userPlan === 'pro' ? 'high' : userPlan === 'premium' ? 'medium' : 'low'
      });
      return res.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Support Ticket Created",
        description: `Ticket #${response.ticketId} has been created. Expected response: ${currentSupport.responseTime}`,
      });
      setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
      setCurrentView('chat');
    }
  });

  // Get FAQ data
  const { data: faqData = [] } = useQuery({
    queryKey: ['/api/support/faq'],
    queryFn: async () => {
      // This would connect to your knowledge base
      return [
        {
          id: 1,
          question: "How do I upgrade my subscription?",
          answer: "You can upgrade your subscription anytime from Settings > Subscription. All upgrades are prorated.",
          category: "billing",
          helpful: 23
        },
        {
          id: 2,
          question: "How do I connect my Apple Watch?",
          answer: "Go to Settings > Devices and select 'Apple Watch'. Follow the authorization prompts in the Health app.",
          category: "technical",
          helpful: 18
        },
        {
          id: 3,
          question: "Can I export my health data?",
          answer: "Premium and Pro users can export their complete health data from Settings > Data Export.",
          category: "features",
          helpful: 15
        },
        {
          id: 4,
          question: "How do I cancel my subscription?",
          answer: "You can cancel anytime from Settings > Subscription > Manage Plan. Your access continues until the current billing period ends.",
          category: "billing",
          helpful: 12
        }
      ];
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI or human support based on plan
    sendMessageMutation.mutate({
      message: newMessage,
      userPlan,
      context: messages.slice(-5) // Send recent context
    });
    
    setNewMessage('');
  };

  const handleQuickOption = (option) => {
    setNewMessage(option);
    handleSendMessage();
  };

  const handleCreateTicket = () => {
    if (!ticketForm.subject || !ticketForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the subject and description fields.",
        variant: "destructive",
      });
      return;
    }
    
    createTicketMutation.mutate(ticketForm);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 right-4 z-50 ${
        isMinimized ? 'w-80' : 'w-96'
      } max-h-[600px] shadow-2xl`}
    >
      <Card className="h-full flex flex-col">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Support</CardTitle>
                <p className="text-xs text-blue-100">
                  {userPlan === 'pro' ? 'Priority Support' : 
                   userPlan === 'premium' ? 'Premium Support' : 'General Support'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="flex space-x-2 mt-3">
              {['chat', 'ticket', 'faq'].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    currentView === view 
                      ? 'bg-white text-blue-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Chat View */}
            {currentView === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg p-3`}>
                        <div className="flex items-start space-x-2">
                          {message.type === 'bot' && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        {message.options && message.options.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.options.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickOption(option)}
                                className="block w-full text-left px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {userPlan !== 'basic' && (
                    <div className="mt-2 text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentView('ticket')}
                        className="text-xs"
                      >
                        Need more help? Create a ticket
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Ticket View */}
            {currentView === 'ticket' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={ticketForm.category} 
                    onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billing">Billing & Subscription</SelectItem>
                      <SelectItem value="technical">Technical Issues</SelectItem>
                      <SelectItem value="features">Feature Questions</SelectItem>
                      <SelectItem value="account">Account Settings</SelectItem>
                      <SelectItem value="data">Data & Privacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide details about your issue..."
                    rows={4}
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Expected Response Time</span>
                  </div>
                  <p className="text-blue-700">{currentSupport.responseTime}</p>
                </div>
                
                <Button 
                  onClick={handleCreateTicket}
                  disabled={createTicketMutation.isPending}
                  className="w-full"
                >
                  {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            )}

            {/* FAQ View */}
            {currentView === 'faq' && (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-sm">Frequently Asked Questions</h3>
                {faqData.map((faq) => (
                  <Card key={faq.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                      <p className="text-xs text-gray-600 mb-2">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Star className="h-3 w-3" />
                          <span>{faq.helpful} helpful</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}

        {/* Support Options Footer */}
        {!isMinimized && (
          <div className="border-t p-3 bg-gray-50">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>Available support:</span>
                <div className="flex space-x-1">
                  {currentSupport.channels.includes('email') && <Mail className="h-3 w-3" />}
                  {currentSupport.channels.includes('phone') && <Phone className="h-3 w-3" />}
                  {currentSupport.channels.includes('chat') && <MessageCircle className="h-3 w-3" />}
                </div>
              </div>
              <p>Response time: {currentSupport.responseTime}</p>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Support button to trigger chat
export function SupportButton({ userPlan }) {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowChat(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      <CustomerSupportChat 
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        userPlan={userPlan}
      />
    </>
  );
}