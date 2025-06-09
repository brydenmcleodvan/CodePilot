import { Request, Response } from 'express';

interface ChatMessage {
  role: string;
  content: string;
}

interface PerplexityRequest {
  messages: ChatMessage[];
}

// Handle requests to the Perplexity API
export async function handlePerplexityRequest(req: Request, res: Response) {
  try {
    const { messages } = req.body as PerplexityRequest;
    
    // Check if the API key is available
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Perplexity API key is not configured. Please add the PERPLEXITY_API_KEY to your environment variables.'
      });
    }

    // Format messages for Perplexity API
    // Ensure we have a system message first
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add a system message if not present
    if (!formattedMessages.some(msg => msg.role === 'system')) {
      formattedMessages.unshift({
        role: 'system',
        content: 'You are a helpful health assistant providing accurate, science-based information about health, wellness, nutrition, fitness, and medical topics. Always include appropriate disclaimers when providing health advice.'
      });
    }

    // Call the Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: formattedMessages,
        temperature:.25,
        max_tokens: 1024,
        search_recency_filter: 'month'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      return res.status(response.status).json({ 
        error: `Perplexity API returned an error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error processing Perplexity request:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}