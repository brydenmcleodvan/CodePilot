
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type SuggestedQuery = {
  text: string;
  icon: string;
};

const suggestedQueries: SuggestedQuery[] = [
  { text: "What does my heart rate data indicate?", icon: "ri-heart-pulse-line" },
  { text: "How can I improve my sleep quality?", icon: "ri-moon-line" },
  { text: "Should I be concerned about my blood pressure?", icon: "ri-pulse-line" },
  { text: "What diet recommendations do you have for me?", icon: "ri-restaurant-line" }
];

export default function AIHealthAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // On component mount, display a welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Hello! I\'m your personal health assistant. How can I help you today?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleQuerySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // In a production app, this would call your actual AI endpoint
      // Simulating API call for demo purposes
      setTimeout(() => {
        generateResponse(query);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
    
    setQuery('');
  };

  const generateResponse = (userQuery: string) => {
    // Simulate an AI response based on the query
    let response = '';
    
    const lowercaseQuery = userQuery.toLowerCase();
    
    if (lowercaseQuery.includes('heart rate') || lowercaseQuery.includes('pulse')) {
      response = "Based on your recent health data, your heart rate has been relatively stable. Your resting heart rate averages 68 BPM, which is within the healthy range. Continue your current exercise routine to maintain cardiovascular health.";
    } 
    else if (lowercaseQuery.includes('sleep') || lowercaseQuery.includes('rest')) {
      response = "Your sleep patterns show you're averaging 6.5 hours per night. For optimal health, try to increase this to 7-8 hours. I've noticed your sleep is interrupted at around 2 AM most nights - reducing screen time before bed might help with this.";
    }
    else if (lowercaseQuery.includes('blood pressure') || lowercaseQuery.includes('hypertension')) {
      response = "Your last recorded blood pressure was 124/82, which is slightly elevated but not in the hypertension range. I recommend monitoring this regularly and considering reducing sodium intake in your diet.";
    }
    else if (lowercaseQuery.includes('diet') || lowercaseQuery.includes('nutrition') || lowercaseQuery.includes('food')) {
      response = "Looking at your health profile, I'd recommend increasing your intake of omega-3 fatty acids and fiber. Your recent data suggests you might benefit from more leafy greens and whole grains in your diet. Would you like some specific meal suggestions?";
    }
    else {
      response = "Thank you for your question. To provide personalized health insights, I'd need to analyze more of your health data. Could you connect your health devices or be more specific about your question?";
    }
    
    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSuggestedQuery = (text: string) => {
    setQuery(text);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-primary/10">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2 text-primary">
          <i className="ri-robot-line text-2xl"></i>
          Health AI Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your health data and get personalized insights
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                  <span className="text-sm text-gray-500">Analyzing health data...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <div className="p-4 border-t">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQueries.map((suggestion, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              onClick={() => handleSuggestedQuery(suggestion.text)}
              className="text-xs flex items-center"
            >
              <i className={`${suggestion.icon} mr-1`}></i>
              {suggestion.text.length > 20 
                ? `${suggestion.text.substring(0, 20)}...` 
                : suggestion.text
              }
            </Button>
          ))}
        </div>
        
        <form onSubmit={handleQuerySubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your health data..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <i className="ri-loader-4-line animate-spin"></i>
            ) : (
              <i className="ri-send-plane-fill"></i>
            )}
          </Button>
        </form>
      </div>
      
      <CardFooter className="bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>Powered by Healthmap AI</span>
        <Button variant="ghost" size="sm" className="text-xs">
          <i className="ri-information-line mr-1"></i>
          How we use your data
        </Button>
      </CardFooter>
    </Card>
  );
}
