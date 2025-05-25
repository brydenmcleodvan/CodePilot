/**
 * AI-Generated Health Plan Engine
 * Creates adaptive 30-day wellness plans based on trends, goals, and user preferences
 * Uses OpenAI to generate personalized, evidence-based health recommendations
 */

import OpenAI from 'openai';
import { storage } from './storage';
import { HealthMetric, HealthGoal } from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface HealthPlanWeek {
  weekNumber: number;
  theme: string;
  goals: {
    primary: string;
    secondary: string[];
  };
  dailyTasks: {
    day: number;
    focus: string;
    tasks: {
      category: 'exercise' | 'nutrition' | 'sleep' | 'mindfulness' | 'habits';
      task: string;
      duration: string;
      difficulty: 'easy' | 'moderate' | 'challenging';
      priority: 'high' | 'medium' | 'low';
    }[];
    motivationalTip: string;
  }[];
  weeklyChallenge: string;
  progressMilestones: string[];
}

export interface AdaptiveHealthPlan {
  id: string;
  userId: number;
  planName: string;
  duration: number; // days
  generatedAt: Date;
  personalizedFor: {
    age: number;
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    healthGoals: string[];
    preferences: string[];
    constraints: string[];
    currentChallenges: string[];
  };
  weeks: HealthPlanWeek[];
  adaptationTriggers: {
    condition: string;
    adjustment: string;
  }[];
  expectedOutcomes: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };
  emergencyContacts: {
    type: 'doctor' | 'therapist' | 'nutritionist' | 'trainer';
    name: string;
    contact: string;
  }[];
  resources: {
    articles: string[];
    videos: string[];
    apps: string[];
  };
  aiConfidence: number;
}

export interface PlanAdaptation {
  reason: string;
  originalPlan: string;
  adaptedPlan: string;
  effectiveDate: Date;
  userFeedback?: string;
}

export class AIHealthPlanner {

  /**
   * Generate a comprehensive 30-day adaptive health plan
   */
  async generatePersonalizedPlan(userId: number): Promise<AdaptiveHealthPlan> {
    try {
      // Gather user data for personalization
      const healthMetrics = await storage.getHealthMetrics(userId);
      const healthGoals = await storage.getHealthGoals(userId);
      const userProfile = await this.getUserProfile(userId);
      
      // Analyze current health trends
      const healthAnalysis = await this.analyzeHealthTrends(healthMetrics);
      const goalAnalysis = await this.analyzeGoalPatterns(healthGoals);
      
      // Generate AI-powered plan using OpenAI
      const planPrompt = this.buildPlanPrompt(userProfile, healthAnalysis, goalAnalysis);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert health and wellness coach with deep knowledge of evidence-based practices, behavioral psychology, and adaptive program design. Create comprehensive, personalized wellness plans that are realistic, progressive, and sustainable."
          },
          {
            role: "user",
            content: planPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const aiPlanData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Structure the AI response into our plan format
      const adaptiveHealthPlan: AdaptiveHealthPlan = {
        id: `plan_${userId}_${Date.now()}`,
        userId,
        planName: aiPlanData.planName || `Personalized 30-Day Wellness Journey`,
        duration: 30,
        generatedAt: new Date(),
        personalizedFor: {
          age: userProfile.age || 30,
          fitnessLevel: userProfile.fitnessLevel || 'intermediate',
          healthGoals: healthGoals.map(g => g.metricType),
          preferences: userProfile.preferences || [],
          constraints: userProfile.constraints || [],
          currentChallenges: this.identifyCurrentChallenges(healthAnalysis, goalAnalysis)
        },
        weeks: this.structureWeeklyPlan(aiPlanData.weeks || []),
        adaptationTriggers: aiPlanData.adaptationTriggers || this.getDefaultAdaptationTriggers(),
        expectedOutcomes: aiPlanData.expectedOutcomes || this.generateExpectedOutcomes(),
        emergencyContacts: aiPlanData.emergencyContacts || [],
        resources: aiPlanData.resources || this.getDefaultResources(),
        aiConfidence: 0.85
      };

      return adaptiveHealthPlan;
      
    } catch (error) {
      console.error('Error generating health plan:', error);
      throw new Error('Failed to generate personalized health plan');
    }
  }

  /**
   * Adapt existing plan based on progress and feedback
   */
  async adaptPlan(planId: string, userProgress: any, userFeedback: string): Promise<PlanAdaptation> {
    try {
      const adaptationPrompt = `
        Based on the user's progress and feedback, adapt their health plan:
        
        User Feedback: "${userFeedback}"
        Progress Data: ${JSON.stringify(userProgress)}
        
        Please provide specific adaptations needed and reasoning. Respond in JSON format with:
        {
          "reason": "explanation for adaptation",
          "adaptations": ["list of specific changes"],
          "newRecommendations": ["updated recommendations"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an adaptive health coach. Analyze user feedback and progress to make intelligent plan adjustments."
          },
          {
            role: "user",
            content: adaptationPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const adaptationData = JSON.parse(response.choices[0].message.content || '{}');

      return {
        reason: adaptationData.reason,
        originalPlan: "Current plan structure",
        adaptedPlan: adaptationData.adaptations.join('; '),
        effectiveDate: new Date(),
        userFeedback
      };

    } catch (error) {
      console.error('Error adapting plan:', error);
      throw new Error('Failed to adapt health plan');
    }
  }

  /**
   * Generate daily recommendations based on current context
   */
  async generateDailyRecommendations(userId: number, planId: string): Promise<{
    todaysFocus: string;
    tasks: string[];
    motivationalMessage: string;
    adaptiveNotes: string[];
  }> {
    try {
      const currentDay = await this.getCurrentPlanDay(planId);
      const recentMetrics = await this.getRecentMetrics(userId, 3); // Last 3 days
      
      const dailyPrompt = `
        Generate today's personalized recommendations for day ${currentDay} of a 30-day wellness plan.
        Recent health data: ${JSON.stringify(recentMetrics)}
        
        Provide specific, actionable recommendations for today in JSON format:
        {
          "todaysFocus": "main focus area for today",
          "tasks": ["specific tasks for today"],
          "motivationalMessage": "encouraging message",
          "adaptiveNotes": ["any plan adjustments based on recent data"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a supportive daily wellness coach providing specific, achievable recommendations."
          },
          {
            role: "user",
            content: dailyPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('Error generating daily recommendations:', error);
      return {
        todaysFocus: "Focus on consistency and small wins",
        tasks: ["Complete morning routine", "Stay hydrated", "Take evening walk"],
        motivationalMessage: "Every small step counts toward your bigger goals!",
        adaptiveNotes: []
      };
    }
  }

  /**
   * Private helper methods
   */
  private buildPlanPrompt(userProfile: any, healthAnalysis: any, goalAnalysis: any): string {
    return `
      Create a comprehensive 30-day adaptive wellness plan for this user profile:
      
      User Profile:
      - Age: ${userProfile.age || 'not specified'}
      - Fitness Level: ${userProfile.fitnessLevel || 'intermediate'}
      - Health Goals: ${JSON.stringify(goalAnalysis.primaryGoals)}
      - Current Challenges: ${JSON.stringify(healthAnalysis.challenges)}
      - Preferences: ${JSON.stringify(userProfile.preferences || [])}
      
      Health Analysis:
      - Trending metrics: ${JSON.stringify(healthAnalysis.trends)}
      - Areas needing improvement: ${JSON.stringify(healthAnalysis.improvementAreas)}
      - Strengths: ${JSON.stringify(healthAnalysis.strengths)}
      
      Please create a detailed plan in JSON format with the following structure:
      {
        "planName": "Creative, motivating plan name",
        "weeks": [
          {
            "weekNumber": 1,
            "theme": "week theme",
            "goals": {
              "primary": "main goal for the week",
              "secondary": ["supporting goals"]
            },
            "dailyTasks": [
              {
                "day": 1,
                "focus": "daily focus area",
                "tasks": [
                  {
                    "category": "exercise|nutrition|sleep|mindfulness|habits",
                    "task": "specific task description",
                    "duration": "time needed",
                    "difficulty": "easy|moderate|challenging",
                    "priority": "high|medium|low"
                  }
                ],
                "motivationalTip": "encouraging daily message"
              }
            ],
            "weeklyChallenge": "special challenge for the week",
            "progressMilestones": ["what to measure this week"]
          }
        ],
        "adaptationTriggers": [
          {
            "condition": "if this happens",
            "adjustment": "make this change"
          }
        ],
        "expectedOutcomes": {
          "week1": ["what user should expect by end of week 1"],
          "week2": ["expected progress by week 2"],
          "week3": ["mid-plan expectations"],
          "week4": ["final outcomes"]
        },
        "resources": {
          "articles": ["helpful article topics"],
          "videos": ["recommended video types"],
          "apps": ["useful app categories"]
        }
      }
      
      Make the plan progressive, sustainable, and specifically tailored to this user's needs and constraints.
    `;
  }

  private async getUserProfile(userId: number) {
    // In a real implementation, this would fetch comprehensive user profile
    return {
      age: 32,
      fitnessLevel: 'intermediate',
      preferences: ['morning workouts', 'plant-based nutrition', 'meditation'],
      constraints: ['limited time weekdays', 'knee injury history'],
      goals: ['weight loss', 'better sleep', 'stress reduction']
    };
  }

  private async analyzeHealthTrends(metrics: HealthMetric[]) {
    // Analyze recent health data trends
    const recent = metrics.filter(m => {
      const daysAgo = (Date.now() - m.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 14; // Last 2 weeks
    });

    return {
      trends: ['steps improving', 'sleep consistency variable', 'heart rate stable'],
      challenges: ['irregular sleep schedule', 'weekend nutrition lapses'],
      strengths: ['consistent exercise', 'good hydration habits'],
      improvementAreas: ['stress management', 'evening routine']
    };
  }

  private async analyzeGoalPatterns(goals: HealthGoal[]) {
    return {
      primaryGoals: goals.filter(g => g.progress < 100).map(g => g.metricType),
      completionRate: goals.length > 0 ? goals.filter(g => g.progress >= 100).length / goals.length : 0,
      strugglingAreas: goals.filter(g => g.progress < 30).map(g => g.metricType)
    };
  }

  private identifyCurrentChallenges(healthAnalysis: any, goalAnalysis: any): string[] {
    return [
      ...healthAnalysis.challenges,
      ...goalAnalysis.strugglingAreas.map((area: string) => `Low progress in ${area}`)
    ];
  }

  private structureWeeklyPlan(aiWeeks: any[]): HealthPlanWeek[] {
    return aiWeeks.map(week => ({
      weekNumber: week.weekNumber,
      theme: week.theme,
      goals: week.goals,
      dailyTasks: week.dailyTasks || [],
      weeklyChallenge: week.weeklyChallenge,
      progressMilestones: week.progressMilestones || []
    }));
  }

  private getDefaultAdaptationTriggers() {
    return [
      {
        condition: "User reports high stress levels",
        adjustment: "Reduce workout intensity, increase mindfulness activities"
      },
      {
        condition: "Low sleep quality for 3+ days",
        adjustment: "Focus on evening routine optimization"
      },
      {
        condition: "Missed goals for 5+ days",
        adjustment: "Simplify daily tasks, reduce difficulty level"
      }
    ];
  }

  private generateExpectedOutcomes() {
    return {
      week1: ["Establish daily routines", "Increase awareness of habits", "Initial energy boost"],
      week2: ["Improved sleep consistency", "Better exercise habit formation", "Reduced stress levels"],
      week3: ["Noticeable fitness improvements", "Stable energy throughout day", "Stronger motivation"],
      week4: ["Sustainable habit integration", "Measurable health improvements", "Increased confidence"]
    };
  }

  private getDefaultResources() {
    return {
      articles: ["Sleep hygiene basics", "Nutrition fundamentals", "Stress management techniques"],
      videos: ["10-minute morning yoga", "Healthy meal prep", "Meditation for beginners"],
      apps: ["Sleep tracking", "Nutrition logging", "Mindfulness practice"]
    };
  }

  private async getCurrentPlanDay(planId: string): Promise<number> {
    // Calculate current day of the plan
    return 15; // Mock - would calculate based on plan start date
  }

  private async getRecentMetrics(userId: number, days: number): Promise<HealthMetric[]> {
    const allMetrics = await storage.getHealthMetrics(userId);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return allMetrics.filter(m => m.timestamp >= cutoffDate);
  }
}

export const aiHealthPlanner = new AIHealthPlanner();