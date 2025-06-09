/**
 * AI Health Coach - Conversational health coaching using OpenAI
 * Provides personalized, friendly coaching based on user's health data and questions
 */

import OpenAI from 'openai';

interface UserHealthData {
  userId: number;
  goals: {
    metricType: string;
    target: number;
    unit: string;
    timeframe: string;
    currentAverage: number;
    recentProgress: {
      date: string;
      value: number;
      achieved: boolean;
    }[];
  }[];
  weeklyStats: {
    totalDays: number;
    successfulDays: number;
    currentStreak: number;
  };
  userProfile?: {
    age?: number;
    activityLevel?: string;
    preferences?: string[];
  };
}

interface CoachingResponse {
  message: string;
  tone: 'encouraging' | 'motivational' | 'analytical' | 'supportive';
  suggestions: string[];
  followUpQuestions: string[];
  confidenceLevel: number;
}

export class AIHealthCoach {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required for AI Health Coach');
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Get AI coaching response for user's health question
   */
  async getCoachingResponse(
    userQuestion: string,
    healthData: UserHealthData
  ): Promise<CoachingResponse> {
    try {
      // Build context prompt with user's health data
      const contextPrompt = this.buildContextPrompt(healthData);
      
      // Create the coaching prompt
      const coachingPrompt = `${contextPrompt}

The user asks: "${userQuestion}"

As a friendly, knowledgeable health coach, provide:
1. A warm, encouraging response that addresses their specific question
2. One key observation about their data
3. A small, actionable suggestion they can implement today
4. Keep it conversational and avoid being overly technical

Respond in JSON format:
{
  "message": "Your main coaching response (2-3 sentences max)",
  "tone": "encouraging|motivational|analytical|supportive",
  "suggestions": ["specific actionable suggestion"],
  "followUpQuestions": ["relevant follow-up question"],
  "confidenceLevel": number (0-100)
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a supportive, knowledgeable health coach. You provide personalized, actionable advice in a warm, encouraging tone. Keep responses concise but meaningful. Focus on small, achievable steps rather than overwhelming changes."
          },
          {
            role: "user",
            content: coachingPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: result.message || "I'm here to help you with your health goals! Could you share more details about what you'd like to improve?",
        tone: result.tone || 'supportive',
        suggestions: result.suggestions || [],
        followUpQuestions: result.followUpQuestions || [],
        confidenceLevel: Math.min(100, Math.max(0, result.confidenceLevel || 80))
      };

    } catch (error) {
      console.error('Error getting AI coaching response:', error);
      
      // Fallback response if AI fails
      return this.getFallbackResponse(userQuestion, healthData);
    }
  }

  /**
   * Generate weekly progress summary with AI insights
   */
  async getWeeklySummary(healthData: UserHealthData): Promise<CoachingResponse> {
    try {
      const contextPrompt = this.buildContextPrompt(healthData);
      
      const summaryPrompt = `${contextPrompt}

Provide a weekly progress summary for this user. Focus on:
1. Celebrating wins and progress made
2. Identifying the biggest opportunity for improvement
3. One specific action to focus on next week

Keep it motivational and forward-looking.

Respond in JSON format:
{
  "message": "Weekly summary with encouragement (3-4 sentences)",
  "tone": "motivational",
  "suggestions": ["one specific action for next week"],
  "followUpQuestions": ["question to help them reflect"],
  "confidenceLevel": number (0-100)
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an encouraging health coach providing weekly progress summaries. Focus on progress made and actionable next steps. Be positive and motivational."
          },
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 400
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: result.message || "You're making progress on your health journey! Keep up the great work.",
        tone: 'motivational',
        suggestions: result.suggestions || ["Focus on consistency with your most important goal"],
        followUpQuestions: result.followUpQuestions || ["What's the biggest challenge you faced this week?"],
        confidenceLevel: Math.min(100, Math.max(0, result.confidenceLevel || 85))
      };

    } catch (error) {
      console.error('Error generating weekly summary:', error);
      return this.getGenericWeeklySummary(healthData);
    }
  }

  /**
   * Build context prompt with user's health data
   */
  private buildContextPrompt(healthData: UserHealthData): string {
    let context = "You are coaching a user with the following health data:\n\n";
    
    // Add goal data
    if (healthData.goals.length > 0) {
      context += "Goals and Current Progress:\n";
      healthData.goals.forEach(goal => {
        const progressPercentage = goal.target > 0 ? Math.round((goal.currentAverage / goal.target) * 100) : 0;
        context += `- ${goal.metricType}: ${goal.currentAverage.toFixed(1)}${goal.unit} average (Goal: ${goal.target}${goal.unit}) - ${progressPercentage}% of target\n`;
      });
      context += "\n";
    }

    // Add weekly stats
    if (healthData.weeklyStats) {
      const successRate = Math.round((healthData.weeklyStats.successfulDays / healthData.weeklyStats.totalDays) * 100);
      context += `Weekly Performance:\n`;
      context += `- Success rate: ${successRate}% (${healthData.weeklyStats.successfulDays}/${healthData.weeklyStats.totalDays} days)\n`;
      context += `- Current streak: ${healthData.weeklyStats.currentStreak} days\n\n`;
    }

    // Add user profile context
    if (healthData.userProfile) {
      context += "User Profile:\n";
      if (healthData.userProfile.age) {
        context += `- Age: ${healthData.userProfile.age}\n`;
      }
      if (healthData.userProfile.activityLevel) {
        context += `- Activity level: ${healthData.userProfile.activityLevel}\n`;
      }
      context += "\n";
    }

    return context;
  }

  /**
   * Provide fallback response when AI fails
   */
  private getFallbackResponse(userQuestion: string, healthData: UserHealthData): CoachingResponse {
    const lowerQuestion = userQuestion.toLowerCase();
    
    if (lowerQuestion.includes('step') || lowerQuestion.includes('walk') || lowerQuestion.includes('activity')) {
      return {
        message: "I notice you're asking about your activity goals. Consistency is key - even small improvements add up over time!",
        tone: 'encouraging',
        suggestions: ["Try adding a 10-minute walk to your daily routine"],
        followUpQuestions: ["What time of day works best for you to be more active?"],
        confidenceLevel: 75
      };
    }
    
    if (lowerQuestion.includes('sleep')) {
      return {
        message: "Sleep is crucial for overall health. Small changes to your bedtime routine can make a big difference!",
        tone: 'supportive',
        suggestions: ["Try setting a consistent bedtime and avoiding screens 30 minutes before"],
        followUpQuestions: ["What usually keeps you up later than you'd like?"],
        confidenceLevel: 75
      };
    }

    // Generic encouraging response
    return {
      message: "I'm here to help you reach your health goals! Every small step counts, and consistency is more important than perfection.",
      tone: 'supportive',
      suggestions: ["Focus on your most important goal first and build from there"],
      followUpQuestions: ["What's your biggest health priority right now?"],
      confidenceLevel: 70
    };
  }

  /**
   * Generic weekly summary when AI fails
   */
  private getGenericWeeklySummary(healthData: UserHealthData): CoachingResponse {
    const successRate = healthData.weeklyStats.totalDays > 0 
      ? Math.round((healthData.weeklyStats.successfulDays / healthData.weeklyStats.totalDays) * 100)
      : 0;

    let message = "You're making progress on your health journey! ";
    
    if (successRate >= 70) {
      message += `With a ${successRate}% success rate this week, you're building great habits. `;
    } else if (successRate >= 50) {
      message += `You hit your goals ${successRate}% of the time this week - that's solid progress! `;
    } else {
      message += `This week was challenging, but every day is a new opportunity to improve. `;
    }

    message += "Keep focusing on consistency, and you'll see the results compound over time.";

    return {
      message,
      tone: 'motivational',
      suggestions: ["Choose one goal to focus on most this coming week"],
      followUpQuestions: ["What worked well for you this week that you want to continue?"],
      confidenceLevel: 80
    };
  }

  /**
   * Get quick coaching tip based on specific metric
   */
  getQuickTip(metricType: string, currentValue: number, target: number): string {
    const deficit = target - currentValue;
    
    switch (metricType.toLowerCase()) {
      case 'sleep':
        if (deficit > 0) {
          return `You're ${deficit.toFixed(1)} hours short of your sleep goal. Try setting a bedtime alarm to wind down 30 minutes earlier!`;
        }
        return "Great sleep consistency! Your body thanks you for prioritizing rest.";
        
      case 'steps':
        if (deficit > 0) {
          return `You need about ${Math.round(deficit)} more steps daily. A 10-15 minute walk usually adds 1,000-1,500 steps!`;
        }
        return "Excellent activity level! You're crushing your step goals.";
        
      case 'water_intake':
        if (deficit > 0) {
          return `Try adding ${deficit.toFixed(1)} more glasses of water. Set hourly reminders or keep a water bottle visible!`;
        }
        return "Perfect hydration! Your body is well-fueled.";
        
      default:
        if (deficit > 0) {
          return `You're close to your goal! Small, consistent improvements will get you there.`;
        }
        return "You're hitting your targets! Keep up the excellent work.";
    }
  }
}

export const aiHealthCoach = new AIHealthCoach();