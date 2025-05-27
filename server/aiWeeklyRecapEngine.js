/**
 * AI-Generated Weekly Recap Engine
 * Creates personalized, natural language health summaries using OpenAI
 */

const OpenAI = require('openai');
const { insightCorrelationEngine } = require('./insightCorrelationEngine');
const { backgroundTaskQueue } = require('./backgroundTaskQueue');

class AIWeeklyRecapEngine {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.userRecaps = new Map();
    this.recapTemplates = {
      sleep: "Your sleep this week averaged {average} hours, with your best night being {best} hours on {bestDay}.",
      exercise: "You stayed active with {totalMinutes} minutes of exercise across {activeDays} days.",
      recovery: "Your recovery metrics show {trend}, particularly your HRV which {hrvTrend}.",
      nutrition: "Your glucose levels were most stable on days when you {pattern}.",
      mood: "Your mood patterns indicate {insight}, especially in relation to {factor}."
    };
  }

  /**
   * Generate comprehensive weekly recap for user
   */
  async generateWeeklyRecap(userId, weekOffset = 0) {
    try {
      // Get user's health data for the week
      const weekData = await this.getWeeklyHealthData(userId, weekOffset);
      
      if (!weekData || weekData.length < 3) {
        return {
          success: false,
          message: 'Insufficient data for weekly recap',
          requiredDays: 3,
          actualDays: weekData?.length || 0
        };
      }

      // Get correlations and insights
      const insights = await insightCorrelationEngine.analyzeUserCorrelations(userId, 7);
      
      // Analyze weekly trends
      const weeklyAnalysis = this.analyzeWeeklyTrends(weekData);
      
      // Generate AI-powered recap
      const recap = await this.generateAIRecap(weekData, weeklyAnalysis, insights.insights || []);
      
      // Store and return recap
      this.cacheWeeklyRecap(userId, recap);
      
      return {
        success: true,
        recap,
        weekData: weeklyAnalysis,
        insights: insights.insights?.length || 0,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Weekly recap generation error:', error);
      throw new Error(`Failed to generate weekly recap: ${error.message}`);
    }
  }

  /**
   * Analyze weekly trends in health data
   */
  analyzeWeeklyTrends(weekData) {
    const analysis = {
      sleep: this.analyzeSleepTrends(weekData),
      exercise: this.analyzeExerciseTrends(weekData),
      recovery: this.analyzeRecoveryTrends(weekData),
      nutrition: this.analyzeNutritionTrends(weekData),
      mood: this.analyzeMoodTrends(weekData),
      overall: this.analyzeOverallTrends(weekData)
    };

    return analysis;
  }

  /**
   * Generate AI-powered natural language recap
   */
  async generateAIRecap(weekData, analysis, insights) {
    if (!this.openai) {
      // Fallback to template-based recap if OpenAI not available
      return this.generateTemplateRecap(analysis, insights);
    }

    try {
      const prompt = this.buildRecapPrompt(weekData, analysis, insights);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a friendly, knowledgeable health coach creating personalized weekly health summaries. 
            Write in a warm, encouraging tone that celebrates progress and provides actionable insights. 
            Keep summaries concise but meaningful, focusing on patterns and practical recommendations. 
            Use specific numbers and dates when relevant, and always end with positive encouragement.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7
      });

      const response = JSON.parse(completion.choices[0].message.content);
      
      return {
        type: 'ai_generated',
        title: response.title || 'Your Weekly Health Recap',
        summary: response.summary,
        highlights: response.highlights || [],
        recommendations: response.recommendations || [],
        nextWeekFocus: response.nextWeekFocus,
        tone: 'encouraging',
        model: 'gpt-4o',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('OpenAI recap generation failed:', error);
      // Fallback to template-based recap
      return this.generateTemplateRecap(analysis, insights);
    }
  }

  /**
   * Build comprehensive prompt for OpenAI
   */
  buildRecapPrompt(weekData, analysis, insights) {
    return `Create a personalized weekly health recap based on this user's data:

WEEKLY HEALTH DATA:
- Sleep: Average ${analysis.sleep.average.toFixed(1)} hours (range: ${analysis.sleep.min.toFixed(1)}-${analysis.sleep.max.toFixed(1)} hours)
- Exercise: ${analysis.exercise.totalMinutes} minutes across ${analysis.exercise.activeDays} days
- Heart Rate Variability: ${analysis.recovery.hrvTrend} (average: ${analysis.recovery.avgHRV.toFixed(1)})
- Mood Score: ${analysis.mood.averageScore.toFixed(1)}/10 (${analysis.mood.trend})
- Overall Trend: ${analysis.overall.direction}

KEY INSIGHTS DISCOVERED:
${insights.map(insight => `- ${insight.message}`).join('\n')}

NOTABLE PATTERNS:
- Best sleep night: ${analysis.sleep.bestDay}
- Most active day: ${analysis.exercise.mostActiveDay}
- Recovery pattern: ${analysis.recovery.pattern}
- Mood correlations: ${analysis.mood.correlations}

Please create a JSON response with:
{
  "title": "Engaging title for the week",
  "summary": "2-3 sentence overview of the week's health journey",
  "highlights": ["3-4 specific positive achievements or interesting discoveries"],
  "recommendations": ["2-3 actionable suggestions for improvement"],
  "nextWeekFocus": "One key area to focus on next week"
}

Make it personal, encouraging, and actionable. Use specific data points and celebrate progress.`;
  }

  /**
   * Fallback template-based recap generation
   */
  generateTemplateRecap(analysis, insights) {
    const highlights = [];
    const recommendations = [];
    
    // Sleep highlights
    if (analysis.sleep.average >= 7) {
      highlights.push(`Great sleep consistency with ${analysis.sleep.average.toFixed(1)} hours average`);
    } else {
      recommendations.push(`Aim for 7+ hours of sleep - you averaged ${analysis.sleep.average.toFixed(1)} hours this week`);
    }
    
    // Exercise highlights
    if (analysis.exercise.activeDays >= 3) {
      highlights.push(`Stayed active ${analysis.exercise.activeDays} days with ${analysis.exercise.totalMinutes} total minutes`);
    } else {
      recommendations.push(`Try to be active at least 3 days per week - you exercised ${analysis.exercise.activeDays} days`);
    }
    
    // Recovery insights
    if (analysis.recovery.hrvTrend === 'improving') {
      highlights.push(`Your recovery metrics are trending upward`);
    }
    
    // Add correlation insights
    insights.slice(0, 2).forEach(insight => {
      if (insight.actionable) {
        recommendations.push(insight.message);
      } else {
        highlights.push(insight.message);
      }
    });

    return {
      type: 'template_generated',
      title: 'Your Weekly Health Recap',
      summary: `This week you averaged ${analysis.sleep.average.toFixed(1)} hours of sleep and stayed active for ${analysis.exercise.totalMinutes} minutes. ${analysis.overall.direction === 'improving' ? 'Your overall health metrics are trending positively!' : 'Keep building healthy habits for continued progress.'}`,
      highlights: highlights.slice(0, 4),
      recommendations: recommendations.slice(0, 3),
      nextWeekFocus: this.determineNextWeekFocus(analysis),
      tone: 'encouraging',
      model: 'template',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Analyze sleep trends
   */
  analyzeSleepTrends(weekData) {
    const sleepValues = weekData.map(d => d.sleep_duration).filter(v => v !== undefined);
    
    if (sleepValues.length === 0) {
      return { average: 0, min: 0, max: 0, trend: 'no_data', bestDay: 'Unknown' };
    }
    
    const average = sleepValues.reduce((sum, val) => sum + val, 0) / sleepValues.length;
    const min = Math.min(...sleepValues);
    const max = Math.max(...sleepValues);
    
    // Find best sleep day
    const bestSleepIndex = weekData.findIndex(d => d.sleep_duration === max);
    const bestDay = bestSleepIndex !== -1 ? 
      new Date(weekData[bestSleepIndex].date).toLocaleDateString('en-US', { weekday: 'long' }) : 
      'Unknown';
    
    // Determine trend
    const firstHalf = sleepValues.slice(0, Math.floor(sleepValues.length / 2));
    const secondHalf = sleepValues.slice(Math.floor(sleepValues.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let trend = 'stable';
    if (secondAvg > firstAvg + 0.5) trend = 'improving';
    else if (secondAvg < firstAvg - 0.5) trend = 'declining';
    
    return { average, min, max, trend, bestDay };
  }

  /**
   * Analyze exercise trends
   */
  analyzeExerciseTrends(weekData) {
    const exerciseValues = weekData.map(d => d.exercise_duration || 0);
    const totalMinutes = exerciseValues.reduce((sum, val) => sum + val, 0);
    const activeDays = exerciseValues.filter(val => val > 0).length;
    
    // Find most active day
    const maxExercise = Math.max(...exerciseValues);
    const mostActiveIndex = weekData.findIndex(d => (d.exercise_duration || 0) === maxExercise);
    const mostActiveDay = mostActiveIndex !== -1 ? 
      new Date(weekData[mostActiveIndex].date).toLocaleDateString('en-US', { weekday: 'long' }) : 
      'None';
    
    return { totalMinutes, activeDays, mostActiveDay, avgDaily: totalMinutes / 7 };
  }

  /**
   * Analyze recovery trends
   */
  analyzeRecoveryTrends(weekData) {
    const hrvValues = weekData.map(d => d.heart_rate_variability).filter(v => v !== undefined);
    
    if (hrvValues.length === 0) {
      return { avgHRV: 0, hrvTrend: 'no_data', pattern: 'insufficient_data' };
    }
    
    const avgHRV = hrvValues.reduce((sum, val) => sum + val, 0) / hrvValues.length;
    
    // Calculate trend
    const firstHalf = hrvValues.slice(0, Math.floor(hrvValues.length / 2));
    const secondHalf = hrvValues.slice(Math.floor(hrvValues.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let hrvTrend = 'stable';
    if (secondAvg > firstAvg + 2) hrvTrend = 'improving';
    else if (secondAvg < firstAvg - 2) hrvTrend = 'declining';
    
    const pattern = avgHRV > 35 ? 'good_recovery' : avgHRV > 25 ? 'moderate_recovery' : 'needs_attention';
    
    return { avgHRV, hrvTrend, pattern };
  }

  /**
   * Analyze nutrition trends
   */
  analyzeNutritionTrends(weekData) {
    const glucoseValues = weekData.map(d => d.glucose_level).filter(v => v !== undefined);
    
    if (glucoseValues.length === 0) {
      return { avgGlucose: 0, stability: 'no_data', pattern: 'insufficient_data' };
    }
    
    const avgGlucose = glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length;
    const variance = glucoseValues.reduce((sum, val) => sum + Math.pow(val - avgGlucose, 2), 0) / glucoseValues.length;
    const stability = variance < 100 ? 'stable' : variance < 400 ? 'moderate' : 'variable';
    
    return { avgGlucose, stability, variance };
  }

  /**
   * Analyze mood trends
   */
  analyzeMoodTrends(weekData) {
    const moodValues = weekData.map(d => d.mood_score).filter(v => v !== undefined);
    
    if (moodValues.length === 0) {
      return { averageScore: 0, trend: 'no_data', correlations: 'insufficient_data' };
    }
    
    const averageScore = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length;
    
    // Simple trend analysis
    const firstHalf = moodValues.slice(0, Math.floor(moodValues.length / 2));
    const secondHalf = moodValues.slice(Math.floor(moodValues.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let trend = 'stable';
    if (secondAvg > firstAvg + 0.5) trend = 'improving';
    else if (secondAvg < firstAvg - 0.5) trend = 'declining';
    
    return { averageScore, trend, correlations: 'analyzing_patterns' };
  }

  /**
   * Analyze overall trends
   */
  analyzeOverallTrends(weekData) {
    // Simple composite score based on multiple metrics
    let improvingMetrics = 0;
    let totalMetrics = 0;
    
    const sleep = this.analyzeSleepTrends(weekData);
    if (sleep.trend === 'improving') improvingMetrics++;
    if (sleep.trend !== 'no_data') totalMetrics++;
    
    const recovery = this.analyzeRecoveryTrends(weekData);
    if (recovery.hrvTrend === 'improving') improvingMetrics++;
    if (recovery.hrvTrend !== 'no_data') totalMetrics++;
    
    const mood = this.analyzeMoodTrends(weekData);
    if (mood.trend === 'improving') improvingMetrics++;
    if (mood.trend !== 'no_data') totalMetrics++;
    
    const improvementRatio = totalMetrics > 0 ? improvingMetrics / totalMetrics : 0;
    
    let direction = 'stable';
    if (improvementRatio >= 0.6) direction = 'improving';
    else if (improvementRatio <= 0.3) direction = 'needs_attention';
    
    return { direction, improvementRatio, improvingMetrics, totalMetrics };
  }

  /**
   * Determine next week's focus area
   */
  determineNextWeekFocus(analysis) {
    // Prioritize based on which area needs most improvement
    if (analysis.sleep.average < 7) {
      return 'Focus on getting 7+ hours of sleep consistently';
    } else if (analysis.exercise.activeDays < 3) {
      return 'Aim for at least 3 active days next week';
    } else if (analysis.recovery.pattern === 'needs_attention') {
      return 'Prioritize recovery with stress management and rest days';
    } else if (analysis.mood.averageScore < 6) {
      return 'Explore activities that boost your mood and energy';
    } else {
      return 'Continue building on your healthy habits';
    }
  }

  /**
   * Get weekly health data (mock implementation)
   */
  async getWeeklyHealthData(userId, weekOffset = 0) {
    // In production, this would fetch real user data from database
    // Generate realistic mock data for the past week
    const data = [];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 * (weekOffset + 1)));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      
      // Generate realistic correlated data
      const baseStress = Math.random() * 5; // 0-5 stress level
      const sleepHours = 7 + Math.random() * 2 - baseStress * 0.3; // Sleep affected by stress
      
      data.push({
        date: date.toISOString(),
        sleep_duration: Math.max(5, sleepHours),
        exercise_duration: Math.random() * 60,
        heart_rate_variability: 30 + sleepHours * 2 + Math.random() * 5,
        glucose_level: 90 + (8 - sleepHours) * 3 + Math.random() * 15,
        mood_score: 6 + sleepHours * 0.5 - baseStress + Math.random() * 2,
        stress_level: baseStress + Math.random() * 2
      });
    }
    
    return data;
  }

  /**
   * Cache weekly recap
   */
  cacheWeeklyRecap(userId, recap) {
    const weekKey = this.getWeekKey(new Date());
    const userKey = `${userId}_${weekKey}`;
    
    this.userRecaps.set(userKey, {
      recap,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  }

  /**
   * Get cached recap
   */
  getCachedRecap(userId, weekOffset = 0) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (7 * weekOffset));
    const weekKey = this.getWeekKey(targetDate);
    const userKey = `${userId}_${weekKey}`;
    
    const cached = this.userRecaps.get(userKey);
    
    if (!cached || cached.expiresAt < new Date()) {
      return null;
    }
    
    return cached.recap;
  }

  /**
   * Generate week key for caching
   */
  getWeekKey(date) {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}_W${week}`;
  }

  /**
   * Get ISO week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  /**
   * Schedule weekly recap generation for all users
   */
  async scheduleWeeklyRecaps() {
    // This would be called by a cron job to generate recaps for all users
    console.log('Scheduling weekly recap generation for all users');
    
    // Queue background task for all active users
    await backgroundTaskQueue.addTask('generate_weekly_recaps', {
      batchProcess: true,
      scheduledAt: new Date().toISOString()
    }, 'system');
  }
}

// Export singleton instance
const aiWeeklyRecapEngine = new AIWeeklyRecapEngine();

module.exports = {
  AIWeeklyRecapEngine,
  aiWeeklyRecapEngine
};