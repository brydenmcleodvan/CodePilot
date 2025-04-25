// We'll use the fetch API instead of the OpenAI SDK
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to make OpenAI API calls
async function callOpenAIAPI(messages: any[], options: any = {}) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not set");
    }
    
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.max_tokens,
        response_format: options.response_format || { type: "json_object" },
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Types for health data
export interface HealthData {
  steps?: number;
  sleepHours?: number;
  mood?: number; // 1-10 scale
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  heartRate?: {
    resting?: number;
    max?: number;
    min?: number;
  };
  weight?: number;
  waterIntake?: number; // in ml
  stressLevel?: number; // 1-10 scale
  workout?: {
    duration?: number; // in minutes
    intensity?: number; // 1-10 scale
    type?: string;
  };
  [key: string]: any; // Allow for other health metrics
}

export interface HealthInsight {
  type: "coaching" | "correlation" | "mood" | "general";
  message: string;
  confidence: number; // 0-1 scale
  relatedMetrics: string[];
  actionable: boolean;
  suggestedAction?: string;
}

// Smart Coaching Assistant
export async function generateCoachingInsights(
  healthData: HealthData[],
  focusArea?: string
): Promise<HealthInsight[]> {
  try {
    // Prepare the data for the API request
    const recentData = healthData.slice(-7); // Last 7 days of data
    
    // Create a system prompt for coaching
    const systemPrompt = `You are an AI health coach providing personalized guidance based on health data. 
    Focus on actionable insights that are specific and backed by health science. 
    ${focusArea ? `The user is particularly interested in improving their ${focusArea}.` : ""}
    Keep suggestions positive, encouraging, and realistic.`;
    
    // Format the data for the API
    const userPrompt = `
    Here is my recent health data for the past 7 days:
    ${JSON.stringify(recentData, null, 2)}
    
    Based on this data, please provide 2-3 specific coaching insights to help me improve my health.
    Each insight should include:
    1. A specific observation based on the data
    2. A clear connection to how it affects my health
    3. A concrete, actionable recommendation
    
    Focus on the most impactful changes I could make based on my data trends.
    `;
    
    // Call OpenAI API
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    const response = await callOpenAIAPI(messages, {
      temperature: 0.3, // Lower temperature for more factual responses
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseContent = response.choices[0].message.content || "{}";
    const parsedInsights = JSON.parse(responseContent);
    
    // Transform the parsed insights into our HealthInsight format
    const insights: HealthInsight[] = parsedInsights.insights.map((insight: any) => ({
      type: "coaching",
      message: insight.message || insight.observation,
      confidence: insight.confidence || 0.8,
      relatedMetrics: insight.relatedMetrics || [],
      actionable: true,
      suggestedAction: insight.recommendation || insight.action
    }));
    
    return insights;
  } catch (error) {
    console.error("Error generating coaching insights:", error);
    return [{
      type: "coaching",
      message: "We're having trouble generating personalized insights right now. Try again later.",
      confidence: 0,
      relatedMetrics: [],
      actionable: false
    }];
  }
}

// Correlational Insights Engine
export function generateCorrelationalInsights(
  healthData: HealthData[]
): HealthInsight[] {
  try {
    if (healthData.length < 7) {
      return [{
        type: "correlation",
        message: "We need more data to generate meaningful correlations. Keep tracking your health!",
        confidence: 0.5,
        relatedMetrics: [],
        actionable: false
      }];
    }

    const insights: HealthInsight[] = [];
    
    // Step and Sleep Correlation
    if (healthData.some(d => d.steps) && healthData.some(d => d.sleepHours)) {
      const stepsData = healthData.filter(d => d.steps && d.sleepHours);
      const goodDays = stepsData.filter(d => (d.mood || 0) >= 7);
      
      if (goodDays.length >= 3) {
        const avgStepsOnGoodDays = goodDays.reduce((sum, d) => sum + (d.steps || 0), 0) / goodDays.length;
        const avgSleepOnGoodDays = goodDays.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / goodDays.length;
        
        insights.push({
          type: "correlation",
          message: `You feel best when you hit around ${Math.round(avgStepsOnGoodDays).toLocaleString()} steps and ${avgSleepOnGoodDays.toFixed(1)} hours of sleep.`,
          confidence: 0.7,
          relatedMetrics: ["steps", "sleep", "mood"],
          actionable: true,
          suggestedAction: `Try to aim for ${Math.round(avgStepsOnGoodDays / 1000) * 1000} steps and ${Math.round(avgSleepOnGoodDays * 2) / 2} hours of sleep daily.`
        });
      }
    }
    
    // Hydration and Energy Correlation
    if (healthData.some(d => d.waterIntake) && healthData.some(d => d.mood)) {
      const hydrationData = healthData.filter(d => d.waterIntake && d.mood);
      
      if (hydrationData.length >= 5) {
        const highHydrationDays = hydrationData.filter(d => (d.waterIntake || 0) > 2000);
        const lowHydrationDays = hydrationData.filter(d => (d.waterIntake || 0) <= 2000);
        
        if (highHydrationDays.length >= 2 && lowHydrationDays.length >= 2) {
          const avgMoodHighHydration = highHydrationDays.reduce((sum, d) => sum + (d.mood || 0), 0) / highHydrationDays.length;
          const avgMoodLowHydration = lowHydrationDays.reduce((sum, d) => sum + (d.mood || 0), 0) / lowHydrationDays.length;
          
          if (avgMoodHighHydration > avgMoodLowHydration + 1) {
            insights.push({
              type: "correlation",
              message: `Your mood is notably better (${avgMoodHighHydration.toFixed(1)} vs ${avgMoodLowHydration.toFixed(1)}) on days when you drink more water.`,
              confidence: 0.65,
              relatedMetrics: ["waterIntake", "mood"],
              actionable: true,
              suggestedAction: "Try to drink at least 2 liters of water daily to maintain good energy levels and mood."
            });
          }
        }
      }
    }
    
    // Exercise and Sleep Quality Correlation
    if (healthData.some(d => d.workout?.duration) && healthData.some(d => d.sleepHours)) {
      const exerciseData = healthData.filter(d => d.workout?.duration && d.sleepHours);
      
      if (exerciseData.length >= 5) {
        const exerciseDays = exerciseData.filter(d => (d.workout?.duration || 0) >= 30);
        const nonExerciseDays = exerciseData.filter(d => (d.workout?.duration || 0) < 30 || !d.workout?.duration);
        
        if (exerciseDays.length >= 2 && nonExerciseDays.length >= 2) {
          const avgSleepExerciseDays = exerciseDays.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / exerciseDays.length;
          const avgSleepNonExerciseDays = nonExerciseDays.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / nonExerciseDays.length;
          
          if (Math.abs(avgSleepExerciseDays - avgSleepNonExerciseDays) > 0.5) {
            const better = avgSleepExerciseDays > avgSleepNonExerciseDays;
            insights.push({
              type: "correlation",
              message: `You ${better ? "sleep better" : "may sleep less"} on days when you exercise for 30+ minutes (${avgSleepExerciseDays.toFixed(1)} vs ${avgSleepNonExerciseDays.toFixed(1)} hours).`,
              confidence: 0.6,
              relatedMetrics: ["workout", "sleep"],
              actionable: true,
              suggestedAction: better 
                ? "Try to maintain regular exercise for better sleep quality." 
                : "Consider timing your workouts earlier in the day to avoid sleep disruption."
            });
          }
        }
      }
    }
    
    // If no correlations found, return a default message
    if (insights.length === 0) {
      insights.push({
        type: "correlation",
        message: "Keep tracking your health data consistently to reveal patterns and correlations.",
        confidence: 0.5,
        relatedMetrics: [],
        actionable: false
      });
    }
    
    return insights;
  } catch (error) {
    console.error("Error generating correlational insights:", error);
    return [{
      type: "correlation",
      message: "We're having trouble analyzing correlations in your health data. Try again later.",
      confidence: 0,
      relatedMetrics: [],
      actionable: false
    }];
  }
}

// Mood Tracker Analysis
export async function analyzeMoodPatterns(
  moodData: { date: string; mood: number; notes?: string; activities?: string[] }[]
): Promise<HealthInsight[]> {
  try {
    if (moodData.length < 5) {
      return [{
        type: "mood",
        message: "Keep tracking your mood daily to receive personalized insights about your emotional patterns.",
        confidence: 0.5,
        relatedMetrics: ["mood"],
        actionable: false
      }];
    }

    // Prepare the data for the API request
    const systemPrompt = `You are an AI wellness assistant specialized in mood analysis. 
    Analyze the user's mood data to identify patterns, triggers, and potential ways to improve emotional wellbeing. 
    Be supportive, empathetic, and provide science-backed insights. Focus on actionable advice.`;
    
    const userPrompt = `
    Here is my recent mood tracking data:
    ${JSON.stringify(moodData, null, 2)}
    
    Please analyze this data and provide:
    1. Any patterns you notice in my mood fluctuations
    2. Potential triggers that might be affecting my mood (based on notes and activities)
    3. 2-3 specific, actionable suggestions to help stabilize or improve my mood
    
    Format the response as JSON with these categories: patterns, triggers, and suggestions.
    `;
    
    // Call OpenAI API
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    const response = await callOpenAIAPI(messages, {
      temperature: 0.4,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseContent = response.choices[0].message.content || "{}";
    const analysis = JSON.parse(responseContent);
    
    // Transform into insights
    const insights: HealthInsight[] = [];
    
    // Add pattern insight
    if (analysis.patterns) {
      insights.push({
        type: "mood",
        message: typeof analysis.patterns === 'string' 
          ? analysis.patterns 
          : Array.isArray(analysis.patterns) 
            ? analysis.patterns[0] 
            : "Your mood shows some consistent patterns over time.",
        confidence: 0.7,
        relatedMetrics: ["mood"],
        actionable: false
      });
    }
    
    // Add trigger insights
    if (analysis.triggers && Array.isArray(analysis.triggers)) {
      analysis.triggers.slice(0, 2).forEach((trigger: string) => {
        insights.push({
          type: "mood",
          message: `Potential mood trigger: ${trigger}`,
          confidence: 0.6,
          relatedMetrics: ["mood", "activities"],
          actionable: true,
          suggestedAction: "Consider tracking when this occurs and developing a response plan."
        });
      });
    }
    
    // Add suggestion insights
    if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
      analysis.suggestions.slice(0, 3).forEach((suggestion: string) => {
        insights.push({
          type: "mood",
          message: suggestion,
          confidence: 0.8,
          relatedMetrics: ["mood"],
          actionable: true,
          suggestedAction: suggestion
        });
      });
    }
    
    // If no analysis was generated
    if (insights.length === 0) {
      insights.push({
        type: "mood",
        message: "Based on your mood tracking, try to notice what activities and situations boost your mood.",
        confidence: 0.5,
        relatedMetrics: ["mood"],
        actionable: true,
        suggestedAction: "Identify one activity that consistently improves your mood and make time for it this week."
      });
    }
    
    return insights;
  } catch (error) {
    console.error("Error analyzing mood patterns:", error);
    return [{
      type: "mood",
      message: "We're having trouble analyzing your mood data right now. Try again later.",
      confidence: 0,
      relatedMetrics: ["mood"],
      actionable: false
    }];
  }
}

// Generate General Health Insights
export async function generateGeneralHealthInsights(
  userProfile: any
): Promise<HealthInsight[]> {
  try {
    // Create a system prompt for general health insights
    const systemPrompt = `You are an AI health assistant providing personalized health insights. 
    Based on the user's profile data, provide general health guidance that is evidence-based and actionable.
    Focus on holistic health, considering physical, mental, and social wellbeing.`;
    
    // Format the data for the API
    const userPrompt = `
    Here is my health profile:
    ${JSON.stringify(userProfile, null, 2)}
    
    Please provide 2-3 general health insights and recommendations tailored to my profile.
    Each insight should be:
    1. Relevant to my specific health situation
    2. Evidence-based and factual
    3. Actionable with a clear suggestion
    
    Format the response as JSON with these categories: insights (array of objects with message and action properties).
    `;
    
    // Call OpenAI API
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    const response = await callOpenAIAPI(messages, {
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseContent = response.choices[0].message.content || "{}";
    const parsedResponse = JSON.parse(responseContent);
    
    // Transform into insights
    const insights: HealthInsight[] = [];
    
    if (parsedResponse.insights && Array.isArray(parsedResponse.insights)) {
      parsedResponse.insights.forEach((insight: any) => {
        insights.push({
          type: "general",
          message: insight.message,
          confidence: 0.8,
          relatedMetrics: insight.relatedMetrics || [],
          actionable: true,
          suggestedAction: insight.action
        });
      });
    }
    
    // If no insights were generated
    if (insights.length === 0) {
      insights.push({
        type: "general",
        message: "Regular health check-ups are essential for preventive care and early detection of potential issues.",
        confidence: 0.9,
        relatedMetrics: ["general"],
        actionable: true,
        suggestedAction: "Schedule your annual check-up if you haven't done so in the past year."
      });
    }
    
    return insights;
  } catch (error) {
    console.error("Error generating general health insights:", error);
    return [{
      type: "general",
      message: "We're having trouble generating health insights right now. Try again later.",
      confidence: 0,
      relatedMetrics: [],
      actionable: false
    }];
  }
}