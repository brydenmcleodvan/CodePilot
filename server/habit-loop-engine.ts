/**
 * Habit Loops & Micro Goals Engine
 * Creates sustainable behavior change through AI-recommended micro goals
 * Tracks habit formation progress and unlocks achievement levels
 */

import { storage } from './storage';
import { HealthGoal, GoalProgress } from '@shared/schema';

export interface MicroGoal {
  id: string;
  parentGoalId?: number;
  type: 'frequency' | 'streak' | 'volume' | 'consistency';
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: Date;
  completedAt?: Date;
  isActive: boolean;
}

export interface HabitLoop {
  id: string;
  goalId: number;
  habitName: string;
  category: string;
  currentLevel: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  microGoals: MicroGoal[];
  nextMilestone: {
    level: number;
    xpRequired: number;
    reward: string;
  };
  weeklyPattern: number[]; // 7 days, 0-1 completion rate
  insights: string[];
}

export interface HabitRecommendation {
  id: string;
  type: 'micro_goal' | 'habit_stack' | 'environment_design' | 'time_optimization';
  title: string;
  description: string;
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeToForm: number; // days
  suggestedMicroGoals: MicroGoal[];
  category: string;
  priority: number;
}

export class HabitLoopEngine {

  /**
   * Analyze missed goals and recommend new habits
   */
  async generateHabitRecommendations(userId: number): Promise<HabitRecommendation[]> {
    const goals = await storage.getHealthGoals(userId);
    const recommendations: HabitRecommendation[] = [];

    for (const goal of goals) {
      const progressData = await storage.getGoalProgress(goal.id);
      const recentProgress = this.getRecentProgress(progressData, 14); // Last 2 weeks
      
      const completionRate = this.calculateCompletionRate(recentProgress);
      
      if (completionRate < 0.5) { // Less than 50% completion
        const recommendation = await this.createHabitRecommendation(goal, completionRate, recentProgress);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Create micro goals for a specific habit
   */
  async createMicroGoals(goalId: number, difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Promise<MicroGoal[]> {
    const goal = await storage.getHealthGoal(goalId);
    if (!goal) return [];

    const microGoals: MicroGoal[] = [];
    
    // Create progressive micro goals based on goal type
    switch (goal.metricType) {
      case 'steps':
        microGoals.push(...this.createStepsMicroGoals(goal, difficulty));
        break;
      case 'sleep':
        microGoals.push(...this.createSleepMicroGoals(goal, difficulty));
        break;
      case 'water_intake':
        microGoals.push(...this.createHydrationMicroGoals(goal, difficulty));
        break;
      case 'exercise':
        microGoals.push(...this.createExerciseMicroGoals(goal, difficulty));
        break;
      default:
        microGoals.push(this.createGenericMicroGoal(goal, difficulty));
    }

    return microGoals;
  }

  /**
   * Get habit loop status for a user's goals
   */
  async getHabitLoops(userId: number): Promise<HabitLoop[]> {
    const goals = await storage.getHealthGoals(userId);
    const habitLoops: HabitLoop[] = [];

    for (const goal of goals) {
      const progressData = await storage.getGoalProgress(goal.id);
      const habitLoop = await this.createHabitLoop(goal, progressData);
      habitLoops.push(habitLoop);
    }

    return habitLoops;
  }

  /**
   * Create habit loop from goal and progress data
   */
  private async createHabitLoop(goal: HealthGoal, progressData: GoalProgress[]): Promise<HabitLoop> {
    const currentStreak = this.calculateCurrentStreak(progressData);
    const longestStreak = this.calculateLongestStreak(progressData);
    const completionRate = this.calculateCompletionRate(progressData);
    const weeklyPattern = this.calculateWeeklyPattern(progressData);
    
    // Calculate XP and level based on progress
    const totalXP = this.calculateXP(progressData);
    const currentLevel = this.calculateLevel(totalXP);
    const nextMilestone = this.getNextMilestone(currentLevel, totalXP);
    
    // Generate micro goals
    const microGoals = await this.createMicroGoals(goal.id);
    
    // Generate insights
    const insights = this.generateHabitInsights(progressData, completionRate, currentStreak);

    return {
      id: `habit_${goal.id}`,
      goalId: goal.id,
      habitName: `${goal.metricType} habit`,
      category: goal.metricType,
      currentLevel,
      totalXP,
      currentStreak,
      longestStreak,
      completionRate: Math.round(completionRate * 100),
      microGoals,
      nextMilestone,
      weeklyPattern,
      insights
    };
  }

  /**
   * Create habit recommendation based on missed goals
   */
  private async createHabitRecommendation(
    goal: HealthGoal, 
    completionRate: number, 
    recentProgress: GoalProgress[]
  ): Promise<HabitRecommendation | null> {
    const failurePattern = this.analyzeFailurePattern(recentProgress);
    
    let recommendation: HabitRecommendation;

    if (failurePattern === 'inconsistent_timing') {
      recommendation = {
        id: `rec_${goal.id}_timing`,
        type: 'time_optimization',
        title: `Optimize ${goal.metricType} timing`,
        description: `Create a consistent time for your ${goal.metricType} routine`,
        reasoning: `Your ${goal.metricType} completion varies by day. Setting a specific time increases success by 40%.`,
        difficulty: 'easy',
        estimatedTimeToForm: 21,
        suggestedMicroGoals: await this.createTimingMicroGoals(goal),
        category: goal.metricType,
        priority: 8
      };
    } else if (failurePattern === 'overwhelming_target') {
      recommendation = {
        id: `rec_${goal.id}_micro`,
        type: 'micro_goal',
        title: `Break down ${goal.metricType} into smaller steps`,
        description: `Start with tiny wins to build momentum`,
        reasoning: `Your current target might be too ambitious. Starting smaller increases success by 60%.`,
        difficulty: 'easy',
        estimatedTimeToForm: 14,
        suggestedMicroGoals: await this.createMicroGoals(goal.id, 'easy'),
        category: goal.metricType,
        priority: 9
      };
    } else {
      recommendation = {
        id: `rec_${goal.id}_stack`,
        type: 'habit_stack',
        title: `Stack ${goal.metricType} with existing habits`,
        description: `Link your new habit to something you already do consistently`,
        reasoning: `Habit stacking leverages existing neural pathways to build new behaviors faster.`,
        difficulty: 'medium',
        estimatedTimeToForm: 30,
        suggestedMicroGoals: await this.createHabitStackMicroGoals(goal),
        category: goal.metricType,
        priority: 7
      };
    }

    return recommendation;
  }

  /**
   * Create micro goals for different goal types
   */
  private createStepsMicroGoals(goal: HealthGoal, difficulty: string): MicroGoal[] {
    const targetSteps = typeof goal.goalValue === 'number' ? goal.goalValue : parseInt(String(goal.goalValue));
    
    const microGoals: MicroGoal[] = [];
    
    if (difficulty === 'easy') {
      microGoals.push({
        id: `micro_${goal.id}_1`,
        parentGoalId: goal.id,
        type: 'frequency',
        title: 'Walk 3 times this week',
        description: 'Take a walk on 3 different days this week, any distance counts',
        targetValue: 3,
        unit: 'days',
        timeframe: 'weekly',
        difficulty: 'easy',
        category: 'steps',
        createdAt: new Date(),
        isActive: true
      });
      
      microGoals.push({
        id: `micro_${goal.id}_2`,
        parentGoalId: goal.id,
        type: 'volume',
        title: `Take ${Math.round(targetSteps * 0.3)} steps daily`,
        description: 'Start with a smaller daily step goal to build the habit',
        targetValue: Math.round(targetSteps * 0.3),
        unit: 'steps',
        timeframe: 'daily',
        difficulty: 'easy',
        category: 'steps',
        createdAt: new Date(),
        isActive: true
      });
    }

    return microGoals;
  }

  private createSleepMicroGoals(goal: HealthGoal, difficulty: string): MicroGoal[] {
    const microGoals: MicroGoal[] = [];
    
    if (difficulty === 'easy') {
      microGoals.push({
        id: `micro_${goal.id}_sleep_1`,
        parentGoalId: goal.id,
        type: 'consistency',
        title: 'Set bedtime alarm for 3 nights',
        description: 'Set an alarm 30 minutes before your target bedtime',
        targetValue: 3,
        unit: 'nights',
        timeframe: 'weekly',
        difficulty: 'easy',
        category: 'sleep',
        createdAt: new Date(),
        isActive: true
      });
      
      microGoals.push({
        id: `micro_${goal.id}_sleep_2`,
        parentGoalId: goal.id,
        type: 'streak',
        title: 'No screens 30 minutes before bed',
        description: 'Create a phone-free wind-down routine',
        targetValue: 2,
        unit: 'consecutive days',
        timeframe: 'daily',
        difficulty: 'easy',
        category: 'sleep',
        createdAt: new Date(),
        isActive: true
      });
    }

    return microGoals;
  }

  private createHydrationMicroGoals(goal: HealthGoal, difficulty: string): MicroGoal[] {
    const microGoals: MicroGoal[] = [];
    
    microGoals.push({
      id: `micro_${goal.id}_water_1`,
      parentGoalId: goal.id,
      type: 'frequency',
      title: 'Drink water with each meal',
      description: 'Have a glass of water with breakfast, lunch, and dinner',
      targetValue: 3,
      unit: 'times per day',
      timeframe: 'daily',
      difficulty: 'easy',
      category: 'water_intake',
      createdAt: new Date(),
      isActive: true
    });

    return microGoals;
  }

  private createExerciseMicroGoals(goal: HealthGoal, difficulty: string): MicroGoal[] {
    const microGoals: MicroGoal[] = [];
    
    microGoals.push({
      id: `micro_${goal.id}_exercise_1`,
      parentGoalId: goal.id,
      type: 'frequency',
      title: 'Move for 5 minutes twice this week',
      description: 'Any movement counts - stretching, dancing, walking',
      targetValue: 2,
      unit: 'sessions',
      timeframe: 'weekly',
      difficulty: 'easy',
      category: 'exercise',
      createdAt: new Date(),
      isActive: true
    });

    return microGoals;
  }

  private createGenericMicroGoal(goal: HealthGoal, difficulty: string): MicroGoal {
    return {
      id: `micro_${goal.id}_generic`,
      parentGoalId: goal.id,
      type: 'frequency',
      title: `Practice ${goal.metricType} 2x this week`,
      description: `Focus on ${goal.metricType} twice this week to build consistency`,
      targetValue: 2,
      unit: 'times',
      timeframe: 'weekly',
      difficulty: 'easy',
      category: goal.metricType,
      createdAt: new Date(),
      isActive: true
    };
  }

  /**
   * Helper methods for calculations
   */
  private getRecentProgress(progressData: GoalProgress[], days: number): GoalProgress[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return progressData.filter(p => p.date >= cutoffDate);
  }

  private calculateCompletionRate(progressData: GoalProgress[]): number {
    if (progressData.length === 0) return 0;
    const achieved = progressData.filter(p => p.achieved).length;
    return achieved / progressData.length;
  }

  private calculateCurrentStreak(progressData: GoalProgress[]): number {
    const sorted = progressData.sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    
    for (const progress of sorted) {
      if (progress.achieved) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(progressData: GoalProgress[]): number {
    const sorted = progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (const progress of sorted) {
      if (progress.achieved) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  }

  private calculateWeeklyPattern(progressData: GoalProgress[]): number[] {
    const pattern = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    progressData.forEach(progress => {
      const dayOfWeek = progress.date.getDay();
      counts[dayOfWeek]++;
      if (progress.achieved) {
        pattern[dayOfWeek]++;
      }
    });
    
    return pattern.map((achieved, i) => counts[i] > 0 ? achieved / counts[i] : 0);
  }

  private calculateXP(progressData: GoalProgress[]): number {
    let xp = 0;
    
    progressData.forEach(progress => {
      if (progress.achieved) {
        xp += 10; // Base XP for completion
        
        // Bonus XP for streaks
        const streak = this.calculateCurrentStreak(progressData.slice(0, progressData.indexOf(progress) + 1));
        if (streak >= 7) xp += 50; // Weekly streak bonus
        if (streak >= 30) xp += 100; // Monthly streak bonus
      }
    });
    
    return xp;
  }

  private calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / 100) + 1;
  }

  private getNextMilestone(currentLevel: number, totalXP: number) {
    const nextLevel = currentLevel + 1;
    const xpRequired = nextLevel * 100 - totalXP;
    
    const rewards = [
      'Habit Beginner Badge',
      'Consistency Champion',
      'Streak Master',
      'Wellness Warrior',
      'Health Hero'
    ];
    
    return {
      level: nextLevel,
      xpRequired,
      reward: rewards[Math.min(nextLevel - 2, rewards.length - 1)] || 'Achievement Unlocked'
    };
  }

  private generateHabitInsights(progressData: GoalProgress[], completionRate: number, currentStreak: number): string[] {
    const insights: string[] = [];
    
    if (currentStreak >= 7) {
      insights.push(`🔥 Amazing! You're on a ${currentStreak}-day streak!`);
    }
    
    if (completionRate > 0.8) {
      insights.push('🎯 You\'re crushing this habit! Keep up the excellent work.');
    } else if (completionRate > 0.6) {
      insights.push('📈 Good progress! Small tweaks could help you reach 80% consistency.');
    } else {
      insights.push('💪 Every attempt builds the neural pathway. Keep experimenting!');
    }
    
    const weeklyPattern = this.calculateWeeklyPattern(progressData);
    const bestDay = weeklyPattern.indexOf(Math.max(...weeklyPattern));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (weeklyPattern[bestDay] > 0.7) {
      insights.push(`⭐ ${dayNames[bestDay]}s are your strongest day!`);
    }
    
    return insights;
  }

  private analyzeFailurePattern(recentProgress: GoalProgress[]): string {
    const completionRate = this.calculateCompletionRate(recentProgress);
    const weeklyPattern = this.calculateWeeklyPattern(recentProgress);
    const variance = this.calculateVariance(weeklyPattern);
    
    if (variance > 0.3) return 'inconsistent_timing';
    if (completionRate < 0.3) return 'overwhelming_target';
    return 'needs_trigger';
  }

  private calculateVariance(pattern: number[]): number {
    const mean = pattern.reduce((sum, val) => sum + val, 0) / pattern.length;
    const variance = pattern.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pattern.length;
    return Math.sqrt(variance);
  }

  private async createTimingMicroGoals(goal: HealthGoal): Promise<MicroGoal[]> {
    return [{
      id: `timing_${goal.id}`,
      parentGoalId: goal.id,
      type: 'consistency',
      title: `Do ${goal.metricType} at the same time for 3 days`,
      description: 'Pick a specific time and stick to it for 3 consecutive days',
      targetValue: 3,
      unit: 'consecutive days',
      timeframe: 'daily',
      difficulty: 'easy',
      category: goal.metricType,
      createdAt: new Date(),
      isActive: true
    }];
  }

  private async createHabitStackMicroGoals(goal: HealthGoal): Promise<MicroGoal[]> {
    return [{
      id: `stack_${goal.id}`,
      parentGoalId: goal.id,
      type: 'consistency',
      title: `Link ${goal.metricType} to an existing habit`,
      description: 'After I [existing habit], I will [new habit]',
      targetValue: 5,
      unit: 'days',
      timeframe: 'weekly',
      difficulty: 'medium',
      category: goal.metricType,
      createdAt: new Date(),
      isActive: true
    }];
  }
}

export const habitLoopEngine = new HabitLoopEngine();