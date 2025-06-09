/**
 * Health Summary Engine
 * Analyzes health patterns and generates personalized weekly/daily summaries
 * Provides intelligent insights about changes, alerts, and achievements
 */

import { storage } from './storage';
import { HealthGoal, HealthMetric, GoalProgress } from '@shared/schema';

export interface HealthChange {
  metric: string;
  change: number;
  unit: string;
  direction: 'up' | 'down' | 'stable';
  significance: 'major' | 'moderate' | 'minor';
  description: string;
}

export interface HealthAlert {
  type: 'warning' | 'concern' | 'celebration';
  metric: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
}

export interface HealthWin {
  type: 'streak' | 'improvement' | 'goal_achieved' | 'milestone';
  title: string;
  description: string;
  impact: string;
}

export interface HealthSummary {
  period: 'daily' | 'weekly';
  dateRange: {
    start: string;
    end: string;
  };
  overallScore: number;
  topChanges: HealthChange[];
  alerts: HealthAlert[];
  wins: HealthWin[];
  goalProgress: {
    achieved: number;
    total: number;
    percentage: number;
  };
  keyInsight: string;
  motivationalMessage: string;
  trendAnalysis: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
}

export class HealthSummaryEngine {
  
  /**
   * Generate weekly health summary for a user
   */
  async generateWeeklySummary(userId: number): Promise<HealthSummary> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const goals = await storage.getHealthGoals(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);

    // Get current week data vs previous week for comparison
    const currentWeekData = await this.getWeeklyMetrics(userId, startDate, endDate);
    const previousWeekStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekData = await this.getWeeklyMetrics(userId, previousWeekStart, startDate);

    // Analyze changes
    const topChanges = this.analyzeChanges(currentWeekData, previousWeekData);
    
    // Generate alerts
    const alerts = await this.generateAlerts(userId, currentWeekData, goals);
    
    // Identify wins
    const wins = await this.identifyWins(userId, goals, currentWeekData);
    
    // Calculate goal progress
    const goalProgress = await this.calculateGoalProgress(userId, goals, startDate, endDate);
    
    // Generate insights
    const keyInsight = this.generateKeyInsight(topChanges, alerts, wins, goalProgress);
    const motivationalMessage = this.generateMotivationalMessage(wins, goalProgress, topChanges);
    
    // Trend analysis
    const trendAnalysis = this.analyzeTrends(topChanges);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(goalProgress, topChanges, alerts);

    return {
      period: 'weekly',
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      overallScore,
      topChanges,
      alerts,
      wins,
      goalProgress,
      keyInsight,
      motivationalMessage,
      trendAnalysis
    };
  }

  /**
   * Generate daily health summary for a user
   */
  async generateDailySummary(userId: number): Promise<HealthSummary> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const goals = await storage.getHealthGoals(userId);
    
    // Get today's data vs yesterday for comparison
    const todayData = await this.getDailyMetrics(userId, today);
    const yesterdayData = await this.getDailyMetrics(userId, yesterday);

    // Analyze changes
    const topChanges = this.analyzeChanges(todayData, yesterdayData);
    
    // Generate alerts
    const alerts = await this.generateAlerts(userId, todayData, goals);
    
    // Identify wins
    const wins = await this.identifyWins(userId, goals, todayData);
    
    // Calculate goal progress for today
    const goalProgress = await this.calculateGoalProgress(userId, goals, today, today);
    
    // Generate insights
    const keyInsight = this.generateKeyInsight(topChanges, alerts, wins, goalProgress);
    const motivationalMessage = this.generateMotivationalMessage(wins, goalProgress, topChanges);
    
    // Trend analysis
    const trendAnalysis = this.analyzeTrends(topChanges);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(goalProgress, topChanges, alerts);

    return {
      period: 'daily',
      dateRange: {
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      overallScore,
      topChanges,
      alerts,
      wins,
      goalProgress,
      keyInsight,
      motivationalMessage,
      trendAnalysis
    };
  }

  /**
   * Get weekly aggregated metrics
   */
  private async getWeeklyMetrics(userId: number, startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    
    // Filter metrics within date range
    const weekMetrics = healthMetrics.filter(metric => 
      metric.timestamp >= startDate && metric.timestamp <= endDate
    );

    // Aggregate by metric type
    const aggregated: Record<string, number[]> = {};
    
    weekMetrics.forEach(metric => {
      if (!aggregated[metric.metricType]) {
        aggregated[metric.metricType] = [];
      }
      aggregated[metric.metricType].push(parseFloat(metric.value));
    });

    // Calculate averages
    const averages: Record<string, number> = {};
    Object.keys(aggregated).forEach(metricType => {
      const values = aggregated[metricType];
      averages[metricType] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return averages;
  }

  /**
   * Get daily metrics
   */
  private async getDailyMetrics(userId: number, date: Date): Promise<Record<string, number>> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    
    // Filter metrics for specific date
    const dayMetrics = healthMetrics.filter(metric => 
      metric.timestamp.toDateString() === date.toDateString()
    );

    const dailyData: Record<string, number> = {};
    
    dayMetrics.forEach(metric => {
      dailyData[metric.metricType] = parseFloat(metric.value);
    });

    return dailyData;
  }

  /**
   * Analyze changes between two periods
   */
  private analyzeChanges(currentData: Record<string, number>, previousData: Record<string, number>): HealthChange[] {
    const changes: HealthChange[] = [];

    Object.keys(currentData).forEach(metric => {
      if (previousData[metric] !== undefined) {
        const currentValue = currentData[metric];
        const previousValue = previousData[metric];
        const change = currentValue - previousValue;
        const percentChange = Math.abs(change / previousValue) * 100;

        let direction: 'up' | 'down' | 'stable' = 'stable';
        if (change > 0) direction = 'up';
        else if (change < 0) direction = 'down';

        let significance: 'major' | 'moderate' | 'minor' = 'minor';
        if (percentChange > 20) significance = 'major';
        else if (percentChange > 10) significance = 'moderate';

        const description = this.generateChangeDescription(metric, change, direction, significance);

        changes.push({
          metric,
          change,
          unit: this.getMetricUnit(metric),
          direction,
          significance,
          description
        });
      }
    });

    // Sort by significance and magnitude
    return changes
      .filter(change => change.significance !== 'minor' || Math.abs(change.change) > 0.1)
      .sort((a, b) => {
        const significanceOrder = { major: 3, moderate: 2, minor: 1 };
        return significanceOrder[b.significance] - significanceOrder[a.significance];
      })
      .slice(0, 3); // Top 3 changes
  }

  /**
   * Generate health alerts based on current data
   */
  private async generateAlerts(userId: number, currentData: Record<string, number>, goals: HealthGoal[]): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = [];

    // Check for concerning values
    if (currentData.sleep && currentData.sleep < 6) {
      alerts.push({
        type: 'warning',
        metric: 'sleep',
        message: 'Your sleep duration is below recommended levels',
        priority: 'high',
        actionable: true,
        suggestedAction: 'Set a consistent bedtime routine'
      });
    }

    if (currentData.heart_rate && currentData.heart_rate > 100) {
      alerts.push({
        type: 'concern',
        metric: 'heart_rate',
        message: 'Elevated resting heart rate detected',
        priority: 'medium',
        actionable: true,
        suggestedAction: 'Consider stress management techniques'
      });
    }

    // Check goal performance
    for (const goal of goals) {
      const currentValue = currentData[goal.metricType];
      if (currentValue !== undefined) {
        const target = typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue));
        
        if (goal.goalType === 'minimum' && currentValue < target * 0.7) {
          alerts.push({
            type: 'warning',
            metric: goal.metricType,
            message: `You're significantly below your ${goal.metricType} goal`,
            priority: 'medium',
            actionable: true,
            suggestedAction: 'Adjust your daily routine'
          });
        }
      }
    }

    return alerts.slice(0, 3); // Top 3 alerts
  }

  /**
   * Identify health wins and achievements
   */
  private async identifyWins(userId: number, goals: HealthGoal[], currentData: Record<string, number>): Promise<HealthWin[]> {
    const wins: HealthWin[] = [];

    // Check for goal achievements
    for (const goal of goals) {
      const currentValue = currentData[goal.metricType];
      if (currentValue !== undefined) {
        const target = typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue));
        
        if (
          (goal.goalType === 'minimum' && currentValue >= target) ||
          (goal.goalType === 'maximum' && currentValue <= target) ||
          (goal.goalType === 'target' && Math.abs(currentValue - target) <= target * 0.1)
        ) {
          wins.push({
            type: 'goal_achieved',
            title: `${goal.metricType} goal achieved!`,
            description: `You hit your ${goal.metricType} target of ${target} ${goal.unit}`,
            impact: 'Excellent progress towards better health!'
          });
        }
      }
    }

    // Check for improvements
    if (currentData.sleep && currentData.sleep >= 8) {
      wins.push({
        type: 'improvement',
        title: 'Great sleep quality!',
        description: 'You got optimal sleep duration',
        impact: 'Better recovery and energy levels'
      });
    }

    return wins.slice(0, 3); // Top 3 wins
  }

  /**
   * Calculate goal progress for a period
   */
  private async calculateGoalProgress(userId: number, goals: HealthGoal[], startDate: Date, endDate: Date): Promise<{ achieved: number; total: number; percentage: number }> {
    let achieved = 0;
    const total = goals.length;

    for (const goal of goals) {
      const progressData = await storage.getGoalProgress(goal.id);
      const periodProgress = progressData.filter(p => p.date >= startDate && p.date <= endDate);
      
      if (periodProgress.length > 0) {
        const achievedDays = periodProgress.filter(p => p.achieved).length;
        const successRate = achievedDays / periodProgress.length;
        
        if (successRate >= 0.7) { // 70% success rate considered achieved
          achieved++;
        }
      }
    }

    return {
      achieved,
      total,
      percentage: total > 0 ? Math.round((achieved / total) * 100) : 0
    };
  }

  /**
   * Generate key insight from all data
   */
  private generateKeyInsight(changes: HealthChange[], alerts: HealthAlert[], wins: HealthWin[], goalProgress: any): string {
    if (wins.length > 0) {
      return `Great progress this week! ${wins[0].title} Keep building on this momentum.`;
    }
    
    if (alerts.length > 0 && alerts[0].priority === 'high') {
      return `Focus needed: ${alerts[0].message} This could impact your overall wellness.`;
    }
    
    if (changes.length > 0 && changes[0].significance === 'major') {
      const change = changes[0];
      return `Notable change: ${change.description} Monitor this trend closely.`;
    }
    
    if (goalProgress.percentage >= 70) {
      return `Solid consistency! You're achieving ${goalProgress.percentage}% of your health goals.`;
    }
    
    return 'Keep working on your health habits. Small consistent steps lead to big results.';
  }

  /**
   * Generate motivational message
   */
  private generateMotivationalMessage(wins: HealthWin[], goalProgress: any, changes: HealthChange[]): string {
    if (goalProgress.percentage >= 80) {
      return '🔥 You\'re crushing it! Your dedication to health is paying off beautifully.';
    }
    
    if (wins.length >= 2) {
      return '🌟 Multiple wins this week! You\'re building incredible healthy habits.';
    }
    
    if (goalProgress.percentage >= 50) {
      return '💪 Good progress! You\'re more than halfway to your weekly health goals.';
    }
    
    if (changes.some(c => c.direction === 'up' && this.isPositiveChange(c.metric, c.direction))) {
      return '📈 Positive trends detected! Your efforts are making a real difference.';
    }
    
    return '🚀 Every step counts! Focus on one goal at a time and build momentum.';
  }

  /**
   * Analyze trends across metrics
   */
  private analyzeTrends(changes: HealthChange[]): { improving: string[]; declining: string[]; stable: string[] } {
    const improving: string[] = [];
    const declining: string[] = [];
    const stable: string[] = [];

    changes.forEach(change => {
      if (this.isPositiveChange(change.metric, change.direction)) {
        improving.push(change.metric);
      } else if (change.direction === 'stable') {
        stable.push(change.metric);
      } else {
        declining.push(change.metric);
      }
    });

    return { improving, declining, stable };
  }

  /**
   * Calculate overall health score
   */
  private calculateOverallScore(goalProgress: any, changes: HealthChange[], alerts: HealthAlert[]): number {
    let score = goalProgress.percentage; // Base score from goal achievement
    
    // Adjust for positive changes
    changes.forEach(change => {
      if (this.isPositiveChange(change.metric, change.direction)) {
        if (change.significance === 'major') score += 10;
        else if (change.significance === 'moderate') score += 5;
      } else if (!this.isPositiveChange(change.metric, change.direction)) {
        if (change.significance === 'major') score -= 10;
        else if (change.significance === 'moderate') score -= 5;
      }
    });

    // Adjust for alerts
    alerts.forEach(alert => {
      if (alert.priority === 'high') score -= 15;
      else if (alert.priority === 'medium') score -= 10;
      else score -= 5;
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Helper functions
   */
  private getMetricUnit(metric: string): string {
    const units: Record<string, string> = {
      sleep: 'hours',
      steps: 'steps',
      heart_rate: 'bpm',
      weight: 'lbs',
      water_intake: 'oz',
      exercise: 'minutes'
    };
    return units[metric] || 'units';
  }

  private generateChangeDescription(metric: string, change: number, direction: string, significance: string): string {
    const absChange = Math.abs(change);
    const unit = this.getMetricUnit(metric);
    
    if (direction === 'up') {
      return `${metric} increased by ${absChange.toFixed(1)} ${unit}`;
    } else if (direction === 'down') {
      return `${metric} decreased by ${absChange.toFixed(1)} ${unit}`;
    }
    return `${metric} remained stable`;
  }

  private isPositiveChange(metric: string, direction: string): boolean {
    const positiveUpMetrics = ['sleep', 'steps', 'water_intake', 'exercise'];
    const positiveDownMetrics = ['weight', 'heart_rate'];
    
    if (positiveUpMetrics.includes(metric)) {
      return direction === 'up';
    } else if (positiveDownMetrics.includes(metric)) {
      return direction === 'down';
    }
    
    return false; // Neutral for unknown metrics
  }
}

export const healthSummaryEngine = new HealthSummaryEngine();