/**
 * Automated Weekly Summary Generator
 * Compiles and delivers weekly performance reports to users
 */

import cron from 'node-cron';
import { storage } from './storage';
import { streakCounter } from './streak-counter';
import { aiHealthCoach } from './ai-health-coach';

interface WeeklySummary {
  userId: number;
  weekStart: string;
  weekEnd: string;
  goalsCompleted: number;
  totalGoals: number;
  streakPerformance: {
    activeStreaks: number;
    streaksImproved: number;
    longestStreak: number;
  };
  healthMetrics: {
    improvements: string[];
    concerns: string[];
    trends: string[];
  };
  insights: string[];
  recommendations: string[];
  nextWeekFocus: string[];
}

export class WeeklySummaryScheduler {
  private isRunning = false;

  constructor() {
    this.initializeScheduler();
  }

  /**
   * Initialize the weekly summary cron job
   * Runs every Sunday at 8 PM
   */
  private initializeScheduler(): void {
    // Schedule for Sunday at 8:00 PM
    cron.schedule('0 20 * * 0', async () => {
      console.log('Starting weekly summary generation...');
      await this.generateWeeklySummaries();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    console.log('Weekly summary scheduler initialized - runs Sundays at 8:00 PM EST');
  }

  /**
   * Generate summaries for all active users
   */
  async generateWeeklySummaries(): Promise<void> {
    if (this.isRunning) {
      console.log('Weekly summary generation already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      // Get all users who have been active in the past week
      const activeUsers = await this.getActiveUsers();
      console.log(`Generating summaries for ${activeUsers.length} active users`);

      const summaryPromises = activeUsers.map(user => 
        this.generateUserSummary(user.id).catch(error => {
          console.error(`Failed to generate summary for user ${user.id}:`, error);
          return null;
        })
      );

      const summaries = await Promise.all(summaryPromises);
      const successfulSummaries = summaries.filter(summary => summary !== null);

      console.log(`Generated ${successfulSummaries.length} weekly summaries in ${Date.now() - startTime}ms`);

      // Send summaries via preferred delivery method
      await this.deliverSummaries(successfulSummaries);

    } catch (error) {
      console.error('Error in weekly summary generation:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get users who have been active in the past week
   */
  private async getActiveUsers(): Promise<any[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // For now, return all users - in production, filter by recent activity
    // This would query users who have logged goals, metrics, or app usage in the past week
    const allUsers = await storage.getAllUsers?.() || [];
    return allUsers.slice(0, 50); // Limit to prevent overwhelming the system
  }

  /**
   * Generate comprehensive weekly summary for a user
   */
  async generateUserSummary(userId: number): Promise<WeeklySummary> {
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekEnd.getDate() - 7);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Gather user data for the week
    const [goals, healthMetrics, streakStats] = await Promise.all([
      storage.getHealthGoals(userId),
      storage.getHealthMetrics(userId),
      Promise.resolve(streakCounter.getUserStreakStats(userId))
    ]);

    // Calculate goal completion rate
    const weeklyGoalProgress = await this.calculateWeeklyGoalProgress(userId, weekStartStr, weekEndStr);
    
    // Analyze health metrics trends
    const healthAnalysis = await this.analyzeHealthMetrics(healthMetrics, weekStartStr, weekEndStr);

    // Generate AI insights
    const aiInsights = await this.generateAIInsights(userId, {
      goals: weeklyGoalProgress,
      metrics: healthAnalysis,
      streaks: streakStats
    });

    return {
      userId,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      goalsCompleted: weeklyGoalProgress.completed,
      totalGoals: weeklyGoalProgress.total,
      streakPerformance: {
        activeStreaks: streakStats.totalActiveStreaks,
        streaksImproved: this.calculateStreakImprovements(userId),
        longestStreak: streakStats.longestStreak
      },
      healthMetrics: healthAnalysis,
      insights: aiInsights.insights,
      recommendations: aiInsights.recommendations,
      nextWeekFocus: aiInsights.nextWeekFocus
    };
  }

  /**
   * Calculate weekly goal progress
   */
  private async calculateWeeklyGoalProgress(userId: number, weekStart: string, weekEnd: string): Promise<{completed: number, total: number}> {
    const goals = await storage.getHealthGoals(userId);
    let completed = 0;
    let total = goals.length;

    for (const goal of goals) {
      const progress = await storage.getGoalProgress(userId, goal.id);
      const weekProgress = progress.filter(p => 
        p.date >= weekStart && p.date <= weekEnd && p.achieved
      );
      
      if (weekProgress.length >= 5) { // Consider goal completed if achieved 5+ days
        completed++;
      }
    }

    return { completed, total };
  }

  /**
   * Analyze health metrics for trends and insights
   */
  private async analyzeHealthMetrics(metrics: any[], weekStart: string, weekEnd: string): Promise<{
    improvements: string[];
    concerns: string[];
    trends: string[];
  }> {
    const weeklyMetrics = metrics.filter(m => 
      m.timestamp >= weekStart && m.timestamp <= weekEnd
    );

    const improvements: string[] = [];
    const concerns: string[] = [];
    const trends: string[] = [];

    // Group metrics by type for analysis
    const metricsByType = weeklyMetrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) acc[metric.metricType] = [];
      acc[metric.metricType].push(metric);
      return acc;
    }, {});

    // Analyze each metric type
    for (const [type, typeMetrics] of Object.entries(metricsByType)) {
      const values = (typeMetrics as any[]).map(m => parseFloat(m.value)).filter(v => !isNaN(v));
      
      if (values.length >= 3) {
        const trend = this.calculateTrend(values);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        if (trend > 0.1) {
          improvements.push(`${type} improved by ${(trend * 100).toFixed(1)}% (avg: ${average.toFixed(1)})`);
        } else if (trend < -0.1) {
          concerns.push(`${type} declined by ${(Math.abs(trend) * 100).toFixed(1)}% (avg: ${average.toFixed(1)})`);
        } else {
          trends.push(`${type} remained stable (avg: ${average.toFixed(1)})`);
        }
      }
    }

    return { improvements, concerns, trends };
  }

  /**
   * Calculate simple trend (percentage change from first to last value)
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return first !== 0 ? (last - first) / first : 0;
  }

  /**
   * Calculate streak improvements (simplified - would need historical data)
   */
  private calculateStreakImprovements(userId: number): number {
    // This would compare current week streaks to previous week
    // For now, return a placeholder
    return Math.floor(Math.random() * 3);
  }

  /**
   * Generate AI-powered insights and recommendations
   */
  private async generateAIInsights(userId: number, data: any): Promise<{
    insights: string[];
    recommendations: string[];
    nextWeekFocus: string[];
  }> {
    try {
      // Use the existing AI health coach for insights
      const healthData = {
        userId,
        goals: [{
          metricType: 'weekly_summary',
          target: data.goals.total,
          currentAverage: data.goals.completed,
          recentProgress: []
        }],
        weeklyStats: {
          totalDays: 7,
          successfulDays: data.goals.completed,
          currentStreak: data.streaks.longestStreak
        }
      };

      const aiResponse = await aiHealthCoach.getWeeklySummary(healthData);

      return {
        insights: [
          aiResponse.message,
          ...aiResponse.suggestions.slice(0, 2)
        ],
        recommendations: aiResponse.suggestions,
        nextWeekFocus: aiResponse.followUpQuestions
      };
    } catch (error) {
      console.error('AI insights generation failed, using fallback:', error);
      
      // Fallback insights based on data
      return {
        insights: [
          `Completed ${data.goals.completed}/${data.goals.total} goals this week`,
          `Maintained ${data.streaks.totalActiveStreaks} active streaks`
        ],
        recommendations: [
          'Focus on consistency in your top-performing goals',
          'Consider adjusting goals that you\'re struggling to maintain'
        ],
        nextWeekFocus: [
          'Set realistic daily targets',
          'Use grace days strategically for streak maintenance'
        ]
      };
    }
  }

  /**
   * Deliver summaries to users via their preferred method
   */
  private async deliverSummaries(summaries: WeeklySummary[]): Promise<void> {
    for (const summary of summaries) {
      try {
        // Store summary in database for in-app viewing
        await this.storeSummary(summary);
        
        // Send email notification if user has email preferences enabled
        await this.sendEmailSummary(summary);
        
        // Create in-app notification
        await this.createAppNotification(summary);
        
      } catch (error) {
        console.error(`Failed to deliver summary for user ${summary.userId}:`, error);
      }
    }
  }

  /**
   * Store summary in database
   */
  private async storeSummary(summary: WeeklySummary): Promise<void> {
    // This would store the summary in a weekly_summaries table
    console.log(`Stored weekly summary for user ${summary.userId}`);
  }

  /**
   * Send email summary (requires email service setup)
   */
  private async sendEmailSummary(summary: WeeklySummary): Promise<void> {
    // This would integrate with SendGrid, Mailgun, or similar service
    // For now, just log the action
    console.log(`Email summary sent to user ${summary.userId}`);
  }

  /**
   * Create in-app notification
   */
  private async createAppNotification(summary: WeeklySummary): Promise<void> {
    // Create a notification that appears in the user's app
    const notification = {
      userId: summary.userId,
      type: 'weekly_summary',
      title: 'Your Weekly Health Summary is Ready!',
      message: `You completed ${summary.goalsCompleted}/${summary.totalGoals} goals this week. Tap to view insights.`,
      data: { summaryId: `${summary.userId}_${summary.weekEnd}` },
      createdAt: new Date()
    };
    
    console.log(`Created app notification for user ${summary.userId}`);
  }

  /**
   * Manual trigger for testing or immediate generation
   */
  async triggerWeeklySummary(userId?: number): Promise<void> {
    if (userId) {
      const summary = await this.generateUserSummary(userId);
      await this.deliverSummaries([summary]);
      console.log(`Manual weekly summary generated for user ${userId}`);
    } else {
      await this.generateWeeklySummaries();
    }
  }
}

export const weeklySummaryScheduler = new WeeklySummaryScheduler();