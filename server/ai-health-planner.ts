/**
 * Advanced AI Health Planner
 * Generates 30-day AI wellness programs based on data trends, habits, and user preferences
 * Provides daily step-by-step advice that adapts based on progress and performance
 */

import OpenAI from 'openai';
import { storage } from './storage';
import { HealthMetric, HealthGoal, User } from '@shared/schema';

// Initialize OpenAI with error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI API not available:', error);
}

export interface UserHealthProfile {
  userId: number;
  demographics: {
    age?: number;
    gender?: string;
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  currentHabits: {
    exerciseFrequency: number; // days per week
    sleepAverage: number; // hours per night
    stepsAverage: number; // daily average
    activeGoals: string[];
    preferredActivities: string[];
  };
  healthMetrics: {
    recentAverages: {
      heartRate: number;
      steps: number;
      sleep: number;
      weight?: number;
    };
    trends: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
  };
  pastPerformance: {
    goalCompletionRate: number; // 0-100%
    consistencyScore: number; // 0-100%
    preferredChallengeLevel: 'easy' | 'moderate' | 'challenging';
    mostSuccessfulStrategies: string[];
  };
  preferences: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
    workoutDuration: 'short' | 'medium' | 'long'; // 15min, 30min, 60min+
    focusAreas: string[];
    motivationStyle: 'achievement' | 'social' | 'wellness' | 'competition';
  };
}

export interface DailyPlan {
  day: number;
  date: Date;
  theme: string;
  primaryFocus: string;
  tasks: {
    id: string;
    type: 'exercise' | 'nutrition' | 'mindfulness' | 'sleep' | 'habit';
    title: string;
    description: string;
    duration: number; // minutes
    difficulty: 'easy' | 'moderate' | 'challenging';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
    instructions: string[];
    adaptations: {
      easier: string;
      harder: string;
    };
    trackingMetric?: string;
    motivationalNote: string;
  }[];
  adaptiveElements: {
    weatherBackup: string;
    timeConstraints: string;
    energyLevelAdjustment: string;
  };
  progressMilestones: string[];
  reflectionPrompts: string[];
}

export interface AIHealthPlan {
  id: string;
  userId: number;
  title: string;
  description: string;
  duration: number; // days
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  objectives: {
    primary: string;
    secondary: string[];
    measurableGoals: {
      metric: string;
      target: number;
      unit: string;
      timeframe: string;
    }[];
  };
  adaptationStrategy: {
    performanceThresholds: {
      excellent: number;
      good: number;
      needsImprovement: number;
    };
    adjustmentTriggers: string[];
    progressIndicators: string[];
  };
  dailyPlans: DailyPlan[];
  weeklyThemes: {
    week: number;
    theme: string;
    focus: string;
    expectedOutcomes: string[];
  }[];
  personalizedElements: {
    motivationalStyle: string;
    challengeLevel: string;
    preferredActivities: string[];
    adaptationFactors: string[];
  };
  progressTracking: {
    dailyCheckins: string[];
    weeklyAssessments: string[];
    adaptationPoints: number[];
  };
}

export interface PlanAdaptation {
  planId: string;
  day: number;
  adaptationType: 'difficulty_increase' | 'difficulty_decrease' | 'focus_shift' | 'schedule_adjustment';
  reason: string;
  changes: {
    original: string;
    adapted: string;
    reasoning: string;
  }[];
  confidence: number;
}

export class AIHealthPlanner {
  private openai: OpenAI | null = null;

  constructor() {
    this.openai = openai;
  }

  /**
   * Generate a comprehensive 30-day AI health plan
   */
  async generateHealthPlan(userId: number, planGoals: string[]): Promise<AIHealthPlan> {
    // Build comprehensive user profile
    const userProfile = await this.buildUserHealthProfile(userId);
    
    // Generate AI-powered plan structure
    const planStructure = await this.generatePlanStructure(userProfile, planGoals);
    
    // Create detailed daily plans
    const dailyPlans = await this.generateDailyPlans(userProfile, planStructure);
    
    // Define adaptation strategy
    const adaptationStrategy = this.createAdaptationStrategy(userProfile);

    const plan: AIHealthPlan = {
      id: `plan-${userId}-${Date.now()}`,
      userId,
      title: planStructure.title,
      description: planStructure.description,
      duration: 30,
      createdAt: new Date(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      objectives: planStructure.objectives,
      adaptationStrategy,
      dailyPlans,
      weeklyThemes: planStructure.weeklyThemes,
      personalizedElements: {
        motivationalStyle: userProfile.preferences.motivationStyle,
        challengeLevel: userProfile.pastPerformance.preferredChallengeLevel,
        preferredActivities: userProfile.currentHabits.preferredActivities,
        adaptationFactors: planStructure.adaptationFactors
      },
      progressTracking: {
        dailyCheckins: [
          'How did today\'s activities feel?',
          'What was your energy level?',
          'Any challenges or wins?'
        ],
        weeklyAssessments: [
          'Overall progress satisfaction',
          'Areas needing adjustment',
          'Motivation level check'
        ],
        adaptationPoints: [7, 14, 21] // Days when plan auto-adapts
      }
    };

    return plan;
  }

  /**
   * Adapt an existing plan based on user progress
   */
  async adaptPlan(planId: string, currentDay: number, progressData: any): Promise<PlanAdaptation> {
    const userProfile = await this.buildUserHealthProfile(progressData.userId);
    
    // Analyze performance vs expectations
    const performanceAnalysis = this.analyzePerformance(progressData, currentDay);
    
    // Generate AI-powered adaptations
    const adaptations = await this.generateAdaptations(userProfile, performanceAnalysis, currentDay);

    return {
      planId,
      day: currentDay,
      adaptationType: adaptations.type,
      reason: adaptations.reason,
      changes: adaptations.changes,
      confidence: adaptations.confidence
    };
  }

  /**
   * Generate daily step-by-step advice
   */
  async generateDailyAdvice(userId: number, planId: string, day: number): Promise<{
    advice: string;
    adaptiveInstructions: string[];
    motivationalMessage: string;
    focusTips: string[];
  }> {
    const userProfile = await this.buildUserHealthProfile(userId);
    
    if (!this.openai) {
      return this.getFallbackDailyAdvice(userProfile, day);
    }

    try {
      const prompt = this.buildDailyAdvicePrompt(userProfile, day);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert health coach providing personalized daily advice. Focus on actionable, encouraging guidance that adapts to the user's progress and preferences. Respond in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        advice: result.advice || 'Focus on consistency over perfection today.',
        adaptiveInstructions: result.adaptiveInstructions || [],
        motivationalMessage: result.motivationalMessage || 'You\'re making great progress!',
        focusTips: result.focusTips || []
      };
    } catch (error) {
      console.error('Error generating daily advice:', error);
      return this.getFallbackDailyAdvice(userProfile, day);
    }
  }

  /**
   * Build comprehensive user health profile
   */
  private async buildUserHealthProfile(userId: number): Promise<UserHealthProfile> {
    const user = await storage.getUser(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);

    // Calculate current habits from recent data
    const recentMetrics = healthMetrics
      .filter(m => m.timestamp >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const currentHabits = this.analyzeCurrentHabits(recentMetrics);
    const healthMetricsSummary = this.analyzeHealthMetrics(recentMetrics);
    const pastPerformance = this.analyzePastPerformance(healthGoals, recentMetrics);

    return {
      userId,
      demographics: {
        age: (user as any)?.age || 30,
        gender: (user as any)?.gender || 'not_specified',
        activityLevel: this.determineActivityLevel(recentMetrics),
        fitnessLevel: this.determineFitnessLevel(recentMetrics, healthGoals)
      },
      currentHabits,
      healthMetrics: healthMetricsSummary,
      pastPerformance,
      preferences: {
        timeOfDay: (user as any)?.preferredTime || 'morning',
        workoutDuration: (user as any)?.workoutDuration || 'medium',
        focusAreas: healthGoals.map(g => g.metricType),
        motivationStyle: (user as any)?.motivationStyle || 'wellness'
      }
    };
  }

  /**
   * Generate AI-powered plan structure
   */
  private async generatePlanStructure(userProfile: UserHealthProfile, planGoals: string[]): Promise<any> {
    if (!this.openai) {
      return this.getFallbackPlanStructure(userProfile, planGoals);
    }

    try {
      const prompt = this.buildPlanStructurePrompt(userProfile, planGoals);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert wellness coach creating personalized 30-day health plans. Design comprehensive, achievable programs that adapt to user preferences and capabilities. Respond in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
        temperature: 0.8
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        title: result.title || `Personalized 30-Day Wellness Journey`,
        description: result.description || 'A comprehensive plan tailored to your goals and preferences.',
        objectives: result.objectives || this.getDefaultObjectives(planGoals),
        weeklyThemes: result.weeklyThemes || this.getDefaultWeeklyThemes(),
        adaptationFactors: result.adaptationFactors || ['progress_rate', 'adherence', 'feedback']
      };
    } catch (error) {
      console.error('Error generating plan structure:', error);
      return this.getFallbackPlanStructure(userProfile, planGoals);
    }
  }

  /**
   * Generate detailed daily plans
   */
  private async generateDailyPlans(userProfile: UserHealthProfile, planStructure: any): Promise<DailyPlan[]> {
    const dailyPlans: DailyPlan[] = [];
    
    for (let day = 1; day <= 30; day++) {
      const weekNumber = Math.ceil(day / 7);
      const weekTheme = planStructure.weeklyThemes[weekNumber - 1] || planStructure.weeklyThemes[0];
      
      const dailyPlan = await this.generateSingleDayPlan(userProfile, day, weekTheme);
      dailyPlans.push(dailyPlan);
    }
    
    return dailyPlans;
  }

  /**
   * Generate a single day's plan
   */
  private async generateSingleDayPlan(userProfile: UserHealthProfile, day: number, weekTheme: any): Promise<DailyPlan> {
    const date = new Date();
    date.setDate(date.getDate() + day - 1);
    
    // Determine day intensity and focus
    const intensity = this.getDayIntensity(day, userProfile.pastPerformance.preferredChallengeLevel);
    const primaryFocus = this.getDayFocus(day, weekTheme, userProfile.preferences.focusAreas);
    
    // Generate tasks based on user profile and day requirements
    const tasks = this.generateDayTasks(userProfile, day, primaryFocus, intensity);

    return {
      day,
      date,
      theme: weekTheme.theme,
      primaryFocus,
      tasks,
      adaptiveElements: {
        weatherBackup: 'Indoor alternatives available for all outdoor activities',
        timeConstraints: 'All activities can be modified for 15-60 minute sessions',
        energyLevelAdjustment: 'Difficulty can be scaled based on daily energy levels'
      },
      progressMilestones: this.getDayMilestones(day),
      reflectionPrompts: [
        'What felt most energizing today?',
        'How can I build on today\'s success tomorrow?',
        'What would I adjust about today\'s plan?'
      ]
    };
  }

  /**
   * Analyze current habits from metrics
   */
  private analyzeCurrentHabits(metrics: HealthMetric[]) {
    const exerciseMetrics = metrics.filter(m => m.metricType === 'exercise' || m.metricType === 'workout');
    const sleepMetrics = metrics.filter(m => m.metricType === 'sleep');
    const stepsMetrics = metrics.filter(m => m.metricType === 'steps');

    return {
      exerciseFrequency: Math.max(1, Math.floor(exerciseMetrics.length / 4)), // per week
      sleepAverage: sleepMetrics.length > 0 
        ? sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length 
        : 7.5,
      stepsAverage: stepsMetrics.length > 0 
        ? stepsMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stepsMetrics.length 
        : 8000,
      activeGoals: ['fitness', 'wellness'],
      preferredActivities: ['walking', 'strength_training', 'yoga']
    };
  }

  /**
   * Analyze health metrics trends
   */
  private analyzeHealthMetrics(metrics: HealthMetric[]) {
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];
    const recentAverages: any = {};
    const trends = { improving: [], declining: [], stable: [] };

    metricTypes.forEach(type => {
      const typeMetrics = metrics.filter(m => m.metricType === type);
      if (typeMetrics.length > 0) {
        const average = typeMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / typeMetrics.length;
        recentAverages[type] = Math.round(average);
        
        // Simple trend analysis
        if (typeMetrics.length >= 7) {
          const recent = typeMetrics.slice(0, 3).reduce((sum, m) => sum + parseFloat(m.value), 0) / 3;
          const older = typeMetrics.slice(-3).reduce((sum, m) => sum + parseFloat(m.value), 0) / 3;
          
          if (recent > older * 1.05) {
            trends.improving.push(type);
          } else if (recent < older * 0.95) {
            trends.declining.push(type);
          } else {
            trends.stable.push(type);
          }
        }
      }
    });

    return {
      recentAverages: {
        heartRate: recentAverages.heart_rate || 75,
        steps: recentAverages.steps || 8000,
        sleep: recentAverages.sleep || 7.5,
        weight: recentAverages.weight
      },
      trends
    };
  }

  /**
   * Analyze past performance from goals
   */
  private analyzePastPerformance(goals: HealthGoal[], metrics: HealthMetric[]) {
    let completedGoals = 0;
    let totalGoals = goals.length;
    
    goals.forEach(goal => {
      const relevantMetrics = metrics.filter(m => m.metricType === goal.metricType);
      if (relevantMetrics.length > 0) {
        const average = relevantMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / relevantMetrics.length;
        // Simplified goal completion check
        if (average >= parseFloat(goal.goalValue as string) * 0.8) {
          completedGoals++;
        }
      }
    });

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 75;
    
    return {
      goalCompletionRate: Math.round(completionRate),
      consistencyScore: Math.min(95, Math.max(60, completionRate + 10)),
      preferredChallengeLevel: completionRate > 80 ? 'challenging' : completionRate > 60 ? 'moderate' : 'easy',
      mostSuccessfulStrategies: ['gradual_progression', 'consistency_focus', 'habit_stacking']
    };
  }

  /**
   * Helper methods for plan generation
   */
  private determineActivityLevel(metrics: HealthMetric[]): 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' {
    const stepsMetrics = metrics.filter(m => m.metricType === 'steps');
    if (stepsMetrics.length === 0) return 'lightly_active';
    
    const avgSteps = stepsMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stepsMetrics.length;
    
    if (avgSteps < 5000) return 'sedentary';
    if (avgSteps < 8000) return 'lightly_active';
    if (avgSteps < 12000) return 'moderately_active';
    return 'very_active';
  }

  private determineFitnessLevel(metrics: HealthMetric[], goals: HealthGoal[]): 'beginner' | 'intermediate' | 'advanced' {
    const exerciseGoals = goals.filter(g => g.metricType === 'exercise' || g.metricType === 'workout');
    const recentExercise = metrics.filter(m => 
      (m.metricType === 'exercise' || m.metricType === 'workout') &&
      m.timestamp >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    );
    
    if (exerciseGoals.length >= 3 && recentExercise.length >= 8) return 'advanced';
    if (exerciseGoals.length >= 2 && recentExercise.length >= 4) return 'intermediate';
    return 'beginner';
  }

  private getDayIntensity(day: number, preferredLevel: string): 'easy' | 'moderate' | 'challenging' {
    // Gradual intensity progression with rest days
    if (day % 7 === 0) return 'easy'; // Rest day every 7th day
    
    const weekNumber = Math.ceil(day / 7);
    if (weekNumber === 1) return preferredLevel === 'challenging' ? 'moderate' : 'easy';
    if (weekNumber === 2) return preferredLevel === 'easy' ? 'easy' : 'moderate';
    
    // Adaptive intensity based on preference and week
    if (preferredLevel === 'challenging') {
      return day % 3 === 0 ? 'challenging' : 'moderate';
    }
    return preferredLevel as 'easy' | 'moderate' | 'challenging';
  }

  private getDayFocus(day: number, weekTheme: any, focusAreas: string[]): string {
    const focuses = ['strength', 'cardio', 'flexibility', 'mindfulness', 'nutrition'];
    return focuses[(day - 1) % focuses.length];
  }

  private generateDayTasks(userProfile: UserHealthProfile, day: number, focus: string, intensity: string) {
    const tasks = [];
    
    // Main exercise task
    tasks.push({
      id: `task-${day}-exercise`,
      type: 'exercise' as const,
      title: `${focus.charAt(0).toUpperCase() + focus.slice(1)} Focus`,
      description: `Tailored ${focus} workout for ${intensity} intensity`,
      duration: userProfile.preferences.workoutDuration === 'short' ? 20 : 
                userProfile.preferences.workoutDuration === 'long' ? 60 : 30,
      difficulty: intensity,
      timeOfDay: userProfile.preferences.timeOfDay,
      instructions: this.getExerciseInstructions(focus, intensity),
      adaptations: {
        easier: `Reduce intensity by 20% or shorten duration`,
        harder: `Add extra sets or increase resistance`
      },
      trackingMetric: focus === 'cardio' ? 'heart_rate' : 'duration',
      motivationalNote: this.getMotivationalNote(userProfile.preferences.motivationStyle, day)
    });

    // Nutrition task
    tasks.push({
      id: `task-${day}-nutrition`,
      type: 'nutrition' as const,
      title: 'Mindful Nutrition',
      description: 'Focus on balanced, energizing meals',
      duration: 10,
      difficulty: 'easy' as const,
      timeOfDay: 'anytime' as const,
      instructions: [
        'Plan meals with protein, healthy fats, and complex carbs',
        'Stay hydrated throughout the day',
        'Practice mindful eating during one meal'
      ],
      adaptations: {
        easier: 'Focus on just one healthy meal today',
        harder: 'Track macronutrients and meal timing'
      },
      motivationalNote: 'Fuel your body like the amazing machine it is!'
    });

    return tasks;
  }

  private getExerciseInstructions(focus: string, intensity: string): string[] {
    const instructions: Record<string, string[]> = {
      strength: [
        'Warm up for 5 minutes',
        'Perform compound movements',
        'Focus on proper form',
        'Cool down and stretch'
      ],
      cardio: [
        'Start with gentle warm-up',
        'Maintain target heart rate',
        'Include interval training',
        'End with cool-down walk'
      ],
      flexibility: [
        'Begin with light movement',
        'Hold stretches for 30 seconds',
        'Focus on breathing',
        'Include full-body stretches'
      ]
    };
    
    return instructions[focus] || instructions.strength;
  }

  private getMotivationalNote(style: string, day: number): string {
    const notes: Record<string, string[]> = {
      achievement: [
        'Every rep brings you closer to your goals!',
        'You\'re building strength and resilience!',
        'Celebrate this commitment to yourself!'
      ],
      wellness: [
        'Listen to your body and honor its needs',
        'This movement is a gift to your future self',
        'Focus on how great you feel afterward'
      ],
      social: [
        'Your commitment inspires others around you',
        'Share your progress with your support network',
        'Remember, you\'re part of a wellness community'
      ]
    };
    
    const styleNotes = notes[style] || notes.wellness;
    return styleNotes[day % styleNotes.length];
  }

  private getDayMilestones(day: number): string[] {
    const milestones = [];
    
    if (day === 1) milestones.push('🎯 Started your wellness journey!');
    if (day === 7) milestones.push('🏆 Completed your first week!');
    if (day === 14) milestones.push('💪 Two weeks of commitment!');
    if (day === 21) milestones.push('⭐ Three weeks - habits are forming!');
    if (day === 30) milestones.push('🎉 30-day journey complete!');
    
    if (day % 5 === 0 && !milestones.length) {
      milestones.push(`✨ ${day} days of dedication!`);
    }
    
    return milestones;
  }

  private analyzePerformance(progressData: any, currentDay: number) {
    // Simplified performance analysis
    return {
      adherenceRate: progressData.completedTasks / progressData.totalTasks || 0.8,
      satisfactionScore: progressData.averageRating || 8,
      energyLevels: progressData.energyTrend || 'stable',
      challengeLevel: progressData.perceivedDifficulty || 'appropriate'
    };
  }

  private async generateAdaptations(userProfile: UserHealthProfile, performance: any, day: number) {
    // AI-powered adaptation logic
    let adaptationType: 'difficulty_increase' | 'difficulty_decrease' | 'focus_shift' | 'schedule_adjustment' = 'difficulty_increase';
    let reason = 'User is performing well and ready for increased challenge';
    
    if (performance.adherenceRate < 0.6) {
      adaptationType = 'difficulty_decrease';
      reason = 'Reduce intensity to improve adherence';
    } else if (performance.satisfactionScore < 6) {
      adaptationType = 'focus_shift';
      reason = 'Adjust activities to better match preferences';
    }
    
    return {
      type: adaptationType,
      reason,
      changes: [{
        original: 'Current plan structure',
        adapted: 'Modified based on performance data',
        reasoning: reason
      }],
      confidence: 0.85
    };
  }

  private createAdaptationStrategy(userProfile: UserHealthProfile) {
    return {
      performanceThresholds: {
        excellent: 90,
        good: 75,
        needsImprovement: 60
      },
      adjustmentTriggers: [
        'Low adherence rate (< 60%)',
        'Consistently low energy ratings',
        'User feedback indicating difficulty',
        'Plateau in progress metrics'
      ],
      progressIndicators: [
        'Task completion rate',
        'Subjective well-being scores',
        'Objective health metrics improvement',
        'User engagement and feedback'
      ]
    };
  }

  /**
   * Fallback methods when AI is not available
   */
  private getFallbackDailyAdvice(userProfile: UserHealthProfile, day: number) {
    return {
      advice: `Day ${day}: Focus on consistency over perfection. Build on yesterday's progress and listen to your body.`,
      adaptiveInstructions: [
        'Start with a 5-minute warm-up',
        'Adjust intensity based on your energy level',
        'Remember to stay hydrated',
        'End with 5 minutes of stretching'
      ],
      motivationalMessage: `You're ${day} days into building a healthier you. Every step counts!`,
      focusTips: [
        'Quality over quantity in your movements',
        'Breathe deeply and stay present',
        'Celebrate small wins throughout the day'
      ]
    };
  }

  private buildDailyAdvicePrompt(userProfile: UserHealthProfile, day: number): string {
    return `Generate personalized daily health advice for day ${day} of a 30-day plan.

User Profile:
- Activity Level: ${userProfile.demographics.activityLevel}
- Fitness Level: ${userProfile.demographics.fitnessLevel}
- Preferred Time: ${userProfile.preferences.timeOfDay}
- Motivation Style: ${userProfile.preferences.motivationStyle}
- Current Trends: Improving - ${userProfile.healthMetrics.trends.improving.join(', ')}

Please provide JSON with:
- advice: Main guidance for the day
- adaptiveInstructions: 3-4 specific action items
- motivationalMessage: Encouraging message
- focusTips: 2-3 mindset or technique tips`;
  }

  private buildPlanStructurePrompt(userProfile: UserHealthProfile, goals: string[]): string {
    return `Create a 30-day health plan structure for a user with these characteristics:

Profile:
- Activity Level: ${userProfile.demographics.activityLevel}
- Fitness Level: ${userProfile.demographics.fitnessLevel}
- Goals: ${goals.join(', ')}
- Preferred Activities: ${userProfile.currentHabits.preferredActivities.join(', ')}
- Motivation Style: ${userProfile.preferences.motivationStyle}

Generate JSON with:
- title: Engaging plan name
- description: Brief overview
- objectives: {primary: string, secondary: string[], measurableGoals: array}
- weeklyThemes: 4 weekly themes with focus areas
- adaptationFactors: Key factors for plan adjustments`;
  }

  private getFallbackPlanStructure(userProfile: UserHealthProfile, goals: string[]) {
    return {
      title: 'Personalized 30-Day Wellness Journey',
      description: 'A comprehensive plan designed to build sustainable healthy habits based on your preferences and goals.',
      objectives: this.getDefaultObjectives(goals),
      weeklyThemes: this.getDefaultWeeklyThemes(),
      adaptationFactors: ['progress_rate', 'adherence', 'user_feedback', 'energy_levels']
    };
  }

  private getDefaultObjectives(goals: string[]) {
    return {
      primary: 'Build sustainable healthy habits',
      secondary: [
        'Improve fitness and energy levels',
        'Establish consistent routines',
        'Enhance overall well-being'
      ],
      measurableGoals: goals.map(goal => ({
        metric: goal,
        target: 80, // 80% improvement/adherence
        unit: 'percent',
        timeframe: '30 days'
      }))
    };
  }

  private getDefaultWeeklyThemes() {
    return [
      {
        week: 1,
        theme: 'Foundation Building',
        focus: 'Establishing routines and baseline habits',
        expectedOutcomes: ['Consistent daily movement', 'Better sleep schedule', 'Mindful eating habits']
      },
      {
        week: 2,
        theme: 'Momentum Building',
        focus: 'Increasing activity levels and variety',
        expectedOutcomes: ['Improved endurance', 'More energy', 'Stronger habits']
      },
      {
        week: 3,
        theme: 'Challenge and Growth',
        focus: 'Pushing boundaries and building resilience',
        expectedOutcomes: ['Increased strength', 'Better stress management', 'Confidence boost']
      },
      {
        week: 4,
        theme: 'Integration and Sustainability',
        focus: 'Creating long-term lifestyle changes',
        expectedOutcomes: ['Sustainable routines', 'Improved metrics', 'Lasting motivation']
      }
    ];
  }
}

export const aiHealthPlanner = new AIHealthPlanner();