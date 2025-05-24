/**
 * Health Goal Logic Engine
 * Evaluates user progress against their health goals using real metric data
 * Provides intelligent status assessment and actionable recommendations
 */

import { HealthGoal, GoalProgress, HealthMetric } from '@shared/schema';

export interface GoalEvaluationResult {
  goalId: number;
  metricType: string;
  progress: number;
  target: number;
  status: 'on_track' | 'behind' | 'ahead' | 'completed' | 'at_risk';
  percentage: number;
  daysCompleted: number;
  totalDays: number;
  streak: number;
  recommendation: string;
  nextMilestone: string;
  riskFactors: string[];
}

export interface GoalEvaluationSummary {
  [goalId: string]: GoalEvaluationResult;
}

export class GoalEngine {
  
  /**
   * Main evaluation function - analyzes all user goals against their metric data
   */
  public evaluateUserGoals(
    userGoals: HealthGoal[], 
    metricData: HealthMetric[], 
    progressHistory: GoalProgress[]
  ): GoalEvaluationSummary {
    const results: GoalEvaluationSummary = {};

    for (const goal of userGoals) {
      if (goal.status === 'active') {
        const evaluation = this.evaluateIndividualGoal(goal, metricData, progressHistory);
        results[goal.id.toString()] = evaluation;
      }
    }

    return results;
  }

  /**
   * Evaluate a single goal against user's metric data
   */
  private evaluateIndividualGoal(
    goal: HealthGoal, 
    metricData: HealthMetric[], 
    progressHistory: GoalProgress[]
  ): GoalEvaluationResult {
    
    // Filter metrics relevant to this goal
    const relevantMetrics = metricData.filter(metric => 
      metric.metricType === goal.metricType
    );

    // Get progress history for this specific goal
    const goalProgress = progressHistory.filter(progress => 
      progress.goalId === goal.id
    );

    // Calculate timeframe boundaries
    const timeframeBounds = this.calculateTimeframeBounds(goal.timeframe);
    const relevantProgress = goalProgress.filter(progress =>
      new Date(progress.date) >= timeframeBounds.start &&
      new Date(progress.date) <= timeframeBounds.end
    );

    // Calculate current progress metrics
    const progressMetrics = this.calculateProgressMetrics(
      goal, relevantMetrics, relevantProgress, timeframeBounds
    );

    // Determine goal status
    const status = this.determineGoalStatus(goal, progressMetrics);

    // Calculate streak
    const streak = this.calculateStreak(goalProgress);

    // Generate recommendation
    const recommendation = this.generateRecommendation(goal, progressMetrics, status);

    // Calculate next milestone
    const nextMilestone = this.calculateNextMilestone(goal, progressMetrics);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(goal, progressMetrics, relevantMetrics);

    return {
      goalId: goal.id,
      metricType: goal.metricType,
      progress: progressMetrics.currentValue,
      target: progressMetrics.targetValue,
      status,
      percentage: progressMetrics.percentage,
      daysCompleted: progressMetrics.achievedDays,
      totalDays: progressMetrics.totalDays,
      streak,
      recommendation,
      nextMilestone,
      riskFactors
    };
  }

  /**
   * Calculate timeframe boundaries based on goal timeframe
   */
  private calculateTimeframeBounds(timeframe: string): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (timeframe) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return { start, end };
  }

  /**
   * Calculate progress metrics for a goal
   */
  private calculateProgressMetrics(
    goal: HealthGoal,
    metrics: HealthMetric[],
    progress: GoalProgress[],
    timeframeBounds: { start: Date; end: Date }
  ) {
    const targetValue = typeof goal.goalValue === 'object' ? 
      (goal.goalValue as any).max || (goal.goalValue as any).min || (goal.goalValue as any).target :
      goal.goalValue as number;

    // Get recent metrics within timeframe
    const recentMetrics = metrics.filter(metric =>
      new Date(metric.timestamp) >= timeframeBounds.start &&
      new Date(metric.timestamp) <= timeframeBounds.end
    );

    let currentValue = 0;
    let achievedDays = 0;
    let totalDays = this.calculateTotalDays(goal.timeframe);

    if (goal.timeframe === 'daily') {
      // For daily goals, use the most recent value
      if (recentMetrics.length > 0) {
        const latestMetric = recentMetrics.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        currentValue = parseFloat(latestMetric.value);
      }
      
      // Check if today's goal was achieved
      const todayProgress = progress.filter(p => {
        const progressDate = new Date(p.date);
        const today = new Date();
        return progressDate.toDateString() === today.toDateString();
      });
      
      achievedDays = todayProgress.length > 0 && todayProgress[0].achieved ? 1 : 0;
      totalDays = 1;
    } else {
      // For weekly/monthly goals, calculate based on progress entries
      achievedDays = progress.filter(p => p.achieved).length;
      
      // Calculate average or cumulative value based on goal type
      if (recentMetrics.length > 0) {
        if (goal.metricType === 'steps') {
          // For steps, calculate daily average
          currentValue = recentMetrics.reduce((sum, metric) => 
            sum + parseFloat(metric.value), 0) / recentMetrics.length;
        } else {
          // For other metrics, use average
          currentValue = recentMetrics.reduce((sum, metric) => 
            sum + parseFloat(metric.value), 0) / recentMetrics.length;
        }
      }
    }

    // Calculate percentage based on goal type
    let percentage = 0;
    if (goal.goalType === 'minimum') {
      percentage = (currentValue / targetValue) * 100;
    } else if (goal.goalType === 'maximum') {
      percentage = currentValue <= targetValue ? 100 : (targetValue / currentValue) * 100;
    } else if (goal.goalType === 'target') {
      if (goal.timeframe === 'daily') {
        percentage = (currentValue / targetValue) * 100;
      } else {
        percentage = (achievedDays / totalDays) * 100;
      }
    }

    return {
      currentValue,
      targetValue,
      percentage: Math.min(percentage, 100),
      achievedDays,
      totalDays,
      recentMetrics
    };
  }

  /**
   * Determine goal status based on progress metrics
   */
  private determineGoalStatus(
    goal: HealthGoal, 
    progressMetrics: any
  ): 'on_track' | 'behind' | 'ahead' | 'completed' | 'at_risk' {
    const { percentage, achievedDays, totalDays } = progressMetrics;

    if (percentage >= 100) {
      return 'completed';
    }

    // Calculate expected progress for timeframe
    const now = new Date();
    const timeframeBounds = this.calculateTimeframeBounds(goal.timeframe);
    const timeframeProgress = (now.getTime() - timeframeBounds.start.getTime()) / 
                             (timeframeBounds.end.getTime() - timeframeBounds.start.getTime());
    
    const expectedPercentage = timeframeProgress * 100;

    if (percentage >= expectedPercentage * 1.2) {
      return 'ahead';
    } else if (percentage >= expectedPercentage * 0.8) {
      return 'on_track';
    } else if (percentage >= expectedPercentage * 0.5) {
      return 'behind';
    } else {
      return 'at_risk';
    }
  }

  /**
   * Calculate consecutive achievement streak
   */
  private calculateStreak(progressHistory: GoalProgress[]): number {
    if (progressHistory.length === 0) return 0;

    const sortedProgress = progressHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    for (const progress of sortedProgress) {
      if (progress.achieved) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate personalized recommendation based on goal status
   */
  private generateRecommendation(
    goal: HealthGoal,
    progressMetrics: any,
    status: string
  ): string {
    const { currentValue, targetValue, percentage } = progressMetrics;
    const gap = targetValue - currentValue;

    if (status === 'completed') {
      return `Excellent! You've achieved your ${goal.metricType} goal. Consider setting a new challenge.`;
    }

    switch (goal.metricType) {
      case 'sleep':
        if (status === 'behind' || status === 'at_risk') {
          return `You need ${gap.toFixed(1)} more hours of sleep. Try going to bed 30 minutes earlier tonight.`;
        }
        return `Great sleep progress! Maintain your current bedtime routine.`;

      case 'steps':
        if (status === 'behind' || status === 'at_risk') {
          return `${Math.round(gap)} more steps needed. Take a 15-minute walk or use stairs instead of elevators.`;
        }
        return `Excellent activity level! Keep up the movement throughout the day.`;

      case 'heart_rate':
        if (goal.goalType === 'maximum' && status === 'behind') {
          return `Heart rate is above target. Try deep breathing exercises and reduce caffeine intake.`;
        }
        return `Heart rate is within healthy range. Continue your current fitness routine.`;

      case 'weight':
        if (status === 'behind' || status === 'at_risk') {
          return `Progress toward weight goal is slower than expected. Consider reviewing your nutrition plan.`;
        }
        return `Weight progress is on track. Maintain your current healthy habits.`;

      default:
        return `You're ${percentage.toFixed(0)}% toward your goal. Keep up the consistent effort!`;
    }
  }

  /**
   * Calculate next milestone for motivation
   */
  private calculateNextMilestone(goal: HealthGoal, progressMetrics: any): string {
    const { currentValue, targetValue, percentage } = progressMetrics;

    if (percentage >= 100) {
      return 'Goal completed! Time for a new challenge.';
    }

    const milestones = [25, 50, 75, 90, 100];
    const nextMilestone = milestones.find(m => m > percentage) || 100;
    
    if (goal.timeframe === 'daily') {
      const remaining = targetValue - currentValue;
      return `${remaining.toFixed(1)} ${goal.unit} to reach today's goal`;
    } else {
      return `${nextMilestone}% milestone - ${Math.ceil((nextMilestone - percentage) / 100 * progressMetrics.totalDays)} more successful days needed`;
    }
  }

  /**
   * Identify potential risk factors affecting goal achievement
   */
  private identifyRiskFactors(
    goal: HealthGoal,
    progressMetrics: any,
    metrics: HealthMetric[]
  ): string[] {
    const riskFactors: string[] = [];
    const { percentage } = progressMetrics;

    // General risk factors based on progress
    if (percentage < 30) {
      riskFactors.push('Significantly behind target');
    }

    // Check for data gaps
    const recentDays = 7;
    const recentMetrics = metrics.filter(metric => {
      const metricDate = new Date(metric.timestamp);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - recentDays);
      return metricDate >= cutoff;
    });

    if (recentMetrics.length < recentDays * 0.5) {
      riskFactors.push('Inconsistent data tracking');
    }

    // Metric-specific risk factors
    switch (goal.metricType) {
      case 'sleep':
        const avgSleep = recentMetrics.length > 0 ? 
          recentMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / recentMetrics.length : 0;
        if (avgSleep < 6) {
          riskFactors.push('Chronic sleep deprivation detected');
        }
        break;

      case 'steps':
        const avgSteps = recentMetrics.length > 0 ? 
          recentMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / recentMetrics.length : 0;
        if (avgSteps < 5000) {
          riskFactors.push('Sedentary lifestyle pattern');
        }
        break;
    }

    return riskFactors;
  }

  /**
   * Calculate total days in current timeframe
   */
  private calculateTotalDays(timeframe: string): number {
    switch (timeframe) {
      case 'daily':
        return 1;
      case 'weekly':
        return 7;
      case 'monthly':
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      default:
        return 1;
    }
  }

  /**
   * Check if goal needs attention based on multiple factors
   */
  public prioritizeGoalsForIntervention(evaluations: GoalEvaluationSummary): string[] {
    const prioritizedGoals: string[] = [];

    for (const [goalId, evaluation] of Object.entries(evaluations)) {
      let priorityScore = 0;

      // Status-based scoring
      if (evaluation.status === 'at_risk') priorityScore += 10;
      else if (evaluation.status === 'behind') priorityScore += 7;
      else if (evaluation.status === 'completed') priorityScore -= 5;

      // Risk factors scoring
      priorityScore += evaluation.riskFactors.length * 3;

      // Streak impact (losing streak is bad)
      if (evaluation.streak === 0) priorityScore += 5;

      // Time sensitivity (closer to deadline = higher priority)
      if (evaluation.percentage < 50 && evaluation.metricType !== 'daily') {
        priorityScore += 5;
      }

      if (priorityScore >= 10) {
        prioritizedGoals.push(goalId);
      }
    }

    return prioritizedGoals.sort((a, b) => {
      const scoreA = this.calculatePriorityScore(evaluations[a]);
      const scoreB = this.calculatePriorityScore(evaluations[b]);
      return scoreB - scoreA;
    });
  }

  private calculatePriorityScore(evaluation: GoalEvaluationResult): number {
    let score = 0;
    
    if (evaluation.status === 'at_risk') score += 10;
    else if (evaluation.status === 'behind') score += 7;
    
    score += evaluation.riskFactors.length * 3;
    
    if (evaluation.streak === 0) score += 5;
    if (evaluation.percentage < 30) score += 8;
    
    return score;
  }
}

// Export singleton instance
export const goalEngine = new GoalEngine();