
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AIHealthAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async () => {
    setIsLoading(true);
    try {
      const result = await fetch('/api/health/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await result.json();
      setResponse(data.response);
    } catch (error) {
      setResponse('Sorry, I had trouble processing that request.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="ri-robot-line text-primary"></i>
          AI Health Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your health..."
            className="flex-1"
          />
          <Button onClick={handleQuery} disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Ask'}
          </Button>
        </div>
        {response && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
