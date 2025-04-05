import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ChatMessage {
  role: string;
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Function to interact with Perplexity API
export async function queryPerplexityAPI(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch('/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Perplexity API');
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error('Error querying Perplexity API:', error);
    throw error;
  }
}

// Fallback responses for when the API isn't available
export const healthResponses = [
  "Based on general health guidelines, adults should aim for 7-9 hours of sleep per night for optimal health. If you're consistently getting less, it may be worth examining your sleep hygiene practices.",
  "While I can provide general information, it's always best to consult with your healthcare provider about specific diet recommendations for your situation. Generally, a balanced diet rich in vegetables, fruits, lean proteins, and whole grains is beneficial for most people.",
  "Regular physical activity is important for overall health. The CDC recommends at least 150 minutes of moderate-intensity exercise per week, along with muscle-strengthening activities twice a week.",
  "Stress management techniques like deep breathing, meditation, physical activity, and ensuring adequate rest can help improve your overall wellbeing. Consider which approaches might work best for your lifestyle.",
  "Staying hydrated is important for many bodily functions. While individual needs vary, a general guideline is about 8 cups (64 ounces) of water daily, but this can vary based on your activity level, climate, and other factors.",
  "Anti-inflammatory foods include fatty fish like salmon, olive oil, nuts, seeds, colorful fruits and vegetables, and spices like turmeric and ginger. These may help reduce chronic inflammation in the body.",
  "For lower back pain, gentle stretches like knee-to-chest, cat-cow yoga poses, and exercises that strengthen core muscles can be helpful. Always start slowly and stop if pain increases.",
  "Signs of vitamin D deficiency may include fatigue, bone pain, muscle weakness, mood changes, and increased susceptibility to infections. A blood test can confirm if your levels are low.",
  "To improve sleep quality, consider maintaining a consistent sleep schedule, creating a restful environment, limiting screen time before bed, avoiding caffeine in the afternoon/evening, and developing a calming pre-sleep routine."
];
