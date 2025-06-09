/**
 * Coach Insights Engine
 * Provides comprehensive client analytics for human coaches and AI-hybrid coaching
 * Tracks adherence patterns, goal progress, and generates automated insights
 */

import { storage } from './storage';
import { HealthGoal, HealthMetric, GoalProgress } from '@shared/schema';

export interface ClientOverview {
  userId: number;
  username: string;
  email: string;
  enrollmentDate: Date;
  lastActive: Date;
  coachingPlan: string;
  riskLevel: 'low' | 'medium' | 'high';
  overallAdherence: number;
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  weeklyEngagement: number;
}

export interface AdherencePattern {
  userId: number;
  period: 'weekly' | 'monthly';
  dateRange: { start: string; end: string };
  overallAdherence: number;
  goalBreakdown: {
    goalId: number;
    goalType: string;
    adherence: number;
    missedDays: number;
    consistencyScore: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];
  weeklyPattern: {
    dayOfWeek: string;
    adherenceRate: number;
  }[];
  insights: string[];
}

export interface FocusArea {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  clientsAffected: number;
  suggestedActions: string[];
  expectedOutcome: string;
  timeframe: string;
}

export interface WeeklyReview {
  clientId: number;
  weekRange: { start: string; end: string };
  summary: string;
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  nextWeekFocus: string[];
  adherenceScore: number;
  moodTrend: string;
  engagementLevel: 'high' | 'medium' | 'low';
  coachNotes?: string;
}

export interface CoachDashboardData {
  overview: {
    totalClients: number;
    activeClients: number;
    atRiskClients: number;
    avgAdherence: number;
    weeklyGoalsCompleted: number;
    upcomingCheckIns: number;
  };
  recentActivity: {
    timestamp: Date;
    clientName: string;
    action: string;
    status: 'positive' | 'neutral' | 'concerning';
  }[];
  focusAreas: FocusArea[];
  clientAlerts: {
    clientId: number;
    clientName: string;
    alertType: 'missed_checkin' | 'low_adherence' | 'declining_trend' | 'goal_achieved';
    message: string;
    urgency: 'high' | 'medium' | 'low';
    timestamp: Date;
  }[];
}

export class CoachInsightsEngine {

  /**
   * Get comprehensive dashboard data for a coach
   */
  async getCoachDashboard(coachId: number): Promise<CoachDashboardData> {
    // In a real implementation, this would query clients assigned to the coach
    const clients = await this.getCoachClients(coachId);
    
    const overview = await this.calculateOverviewMetrics(clients);
    const recentActivity = await this.getRecentClientActivity(clients);
    const focusAreas = await this.identifyFocusAreas(clients);
    const clientAlerts = await this.generateClientAlerts(clients);

    return {
      overview,
      recentActivity,
      focusAreas,
      clientAlerts
    };
  }

  /**
   * Get detailed adherence patterns for a client
   */
  async getClientAdherencePattern(userId: number, period: 'weekly' | 'monthly' = 'weekly'): Promise<AdherencePattern> {
    const goals = await storage.getHealthGoals(userId);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (period === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000);

    const goalBreakdown = await Promise.all(goals.map(async (goal) => {
      const progressData = await storage.getGoalProgress(goal.id);
      const periodProgress = progressData.filter(p => p.date >= startDate && p.date <= endDate);
      
      const adherence = periodProgress.length > 0 
        ? (periodProgress.filter(p => p.achieved).length / periodProgress.length) * 100
        : 0;
      
      const missedDays = periodProgress.filter(p => !p.achieved).length;
      const consistencyScore = this.calculateConsistencyScore(periodProgress);
      const trend = this.calculateTrend(progressData);

      return {
        goalId: goal.id,
        goalType: goal.metricType,
        adherence: Math.round(adherence),
        missedDays,
        consistencyScore,
        trend
      };
    }));

    const overallAdherence = goalBreakdown.length > 0
      ? Math.round(goalBreakdown.reduce((sum, g) => sum + g.adherence, 0) / goalBreakdown.length)
      : 0;

    const weeklyPattern = await this.calculateWeeklyPattern(userId, startDate, endDate);
    const insights = this.generateAdherenceInsights(goalBreakdown, weeklyPattern, overallAdherence);

    return {
      userId,
      period,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      overallAdherence,
      goalBreakdown,
      weeklyPattern,
      insights
    };
  }

  /**
   * Generate AI-powered weekly review for a client
   */
  async generateWeeklyReview(clientId: number, coachNotes?: string): Promise<WeeklyReview> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const adherencePattern = await this.getClientAdherencePattern(clientId, 'weekly');
    const goals = await storage.getHealthGoals(clientId);
    const healthMetrics = await storage.getHealthMetrics(clientId);
    
    // Calculate weekly metrics
    const weeklyMetrics = healthMetrics.filter(m => 
      m.timestamp >= startDate && m.timestamp <= endDate
    );

    const achievements = this.identifyWeeklyAchievements(adherencePattern, goals);
    const challenges = this.identifyWeeklyChallenges(adherencePattern);
    const recommendations = await this.generateWeeklyRecommendations(adherencePattern, weeklyMetrics);
    const nextWeekFocus = this.suggestNextWeekFocus(adherencePattern, challenges);

    const summary = this.generateWeeklySummary(
      adherencePattern.overallAdherence,
      achievements,
      challenges,
      weeklyMetrics.length
    );

    const moodTrend = this.analyzeMoodTrend(weeklyMetrics);
    const engagementLevel = this.calculateEngagementLevel(weeklyMetrics.length, adherencePattern.overallAdherence);

    return {
      clientId,
      weekRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      summary,
      achievements,
      challenges,
      recommendations,
      nextWeekFocus,
      adherenceScore: adherencePattern.overallAdherence,
      moodTrend,
      engagementLevel,
      coachNotes
    };
  }

  /**
   * Identify focus areas across all clients
   */
  async identifyFocusAreas(clients: ClientOverview[]): Promise<FocusArea[]> {
    const focusAreas: FocusArea[] = [];

    // Analyze common patterns across clients
    const lowAdherenceClients = clients.filter(c => c.overallAdherence < 60).length;
    const inactiveClients = clients.filter(c => {
      const daysSinceActive = (new Date().getTime() - c.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive > 3;
    }).length;

    if (lowAdherenceClients > 0) {
      focusAreas.push({
        priority: 'critical',
        category: 'Adherence',
        title: 'Low Goal Adherence',
        description: `${lowAdherenceClients} clients showing low adherence rates (<60%)`,
        clientsAffected: lowAdherenceClients,
        suggestedActions: [
          'Schedule one-on-one check-ins',
          'Review and adjust goal difficulty',
          'Implement micro-goals strategy',
          'Increase motivation through challenges'
        ],
        expectedOutcome: 'Improve adherence by 20-30% within 2 weeks',
        timeframe: '2 weeks'
      });
    }

    if (inactiveClients > 0) {
      focusAreas.push({
        priority: 'high',
        category: 'Engagement',
        title: 'Client Re-engagement',
        description: `${inactiveClients} clients haven't been active in 3+ days`,
        clientsAffected: inactiveClients,
        suggestedActions: [
          'Send personalized check-in messages',
          'Offer flexible goal adjustments',
          'Share success stories from other clients',
          'Implement push notification strategy'
        ],
        expectedOutcome: 'Re-engage 70% of inactive clients',
        timeframe: '1 week'
      });
    }

    return focusAreas.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Private helper methods
   */
  private async getCoachClients(coachId: number): Promise<ClientOverview[]> {
    // Sample client data - in a real implementation, this would query the database
    return [
      {
        userId: 1,
        username: 'client1',
        email: 'client1@example.com',
        enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        coachingPlan: 'Weight Loss Program',
        riskLevel: 'low',
        overallAdherence: 85,
        activeGoals: 4,
        completedGoals: 2,
        currentStreak: 12,
        weeklyEngagement: 6
      },
      {
        userId: 2,
        username: 'client2',
        email: 'client2@example.com',
        enrollmentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        coachingPlan: 'Fitness Enhancement',
        riskLevel: 'medium',
        overallAdherence: 45,
        activeGoals: 3,
        completedGoals: 1,
        currentStreak: 2,
        weeklyEngagement: 3
      },
      {
        userId: 3,
        username: 'client3',
        email: 'client3@example.com',
        enrollmentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
        coachingPlan: 'Wellness Maintenance',
        riskLevel: 'low',
        overallAdherence: 92,
        activeGoals: 5,
        completedGoals: 8,
        currentStreak: 28,
        weeklyEngagement: 7
      }
    ];
  }

  private async calculateOverviewMetrics(clients: ClientOverview[]) {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => {
      const daysSinceActive = (new Date().getTime() - c.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 1;
    }).length;
    const atRiskClients = clients.filter(c => c.riskLevel === 'high' || c.overallAdherence < 50).length;
    const avgAdherence = Math.round(clients.reduce((sum, c) => sum + c.overallAdherence, 0) / totalClients);
    const weeklyGoalsCompleted = clients.reduce((sum, c) => sum + c.completedGoals, 0);

    return {
      totalClients,
      activeClients,
      atRiskClients,
      avgAdherence,
      weeklyGoalsCompleted,
      upcomingCheckIns: Math.floor(totalClients * 0.3) // 30% have upcoming check-ins
    };
  }

  private async getRecentClientActivity(clients: ClientOverview[]) {
    // Sample recent activity data
    return [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        clientName: clients[0]?.username || 'Client1',
        action: 'Completed daily step goal',
        status: 'positive' as const
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        clientName: clients[1]?.username || 'Client2',
        action: 'Missed sleep goal for 2nd day',
        status: 'concerning' as const
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        clientName: clients[2]?.username || 'Client3',
        action: 'Logged workout session',
        status: 'positive' as const
      }
    ];
  }

  private async generateClientAlerts(clients: ClientOverview[]) {
    const alerts = [];
    
    for (const client of clients) {
      if (client.overallAdherence < 50) {
        alerts.push({
          clientId: client.userId,
          clientName: client.username,
          alertType: 'low_adherence' as const,
          message: `Adherence dropped to ${client.overallAdherence}% - needs immediate attention`,
          urgency: 'high' as const,
          timestamp: new Date()
        });
      }
      
      const daysSinceActive = (new Date().getTime() - client.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive > 3) {
        alerts.push({
          clientId: client.userId,
          clientName: client.username,
          alertType: 'missed_checkin' as const,
          message: `No activity for ${Math.floor(daysSinceActive)} days`,
          urgency: 'medium' as const,
          timestamp: new Date()
        });
      }
    }

    return alerts.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  private calculateConsistencyScore(progressData: GoalProgress[]): number {
    if (progressData.length === 0) return 0;
    
    // Calculate consistency based on achievement patterns
    let consistencyScore = 0;
    let consecutiveAchievements = 0;
    
    for (const progress of progressData.sort((a, b) => a.date.getTime() - b.date.getTime())) {
      if (progress.achieved) {
        consecutiveAchievements++;
        consistencyScore += Math.min(consecutiveAchievements, 5); // Cap bonus at 5
      } else {
        consecutiveAchievements = 0;
      }
    }
    
    return Math.round((consistencyScore / (progressData.length * 3)) * 100);
  }

  private calculateTrend(progressData: GoalProgress[]): 'improving' | 'declining' | 'stable' {
    if (progressData.length < 6) return 'stable';
    
    const sorted = progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
    const recent = sorted.slice(-3);
    const previous = sorted.slice(-6, -3);
    
    const recentRate = recent.filter(p => p.achieved).length / recent.length;
    const previousRate = previous.filter(p => p.achieved).length / previous.length;
    
    if (recentRate > previousRate + 0.2) return 'improving';
    if (recentRate < previousRate - 0.2) return 'declining';
    return 'stable';
  }

  private async calculateWeeklyPattern(userId: number, startDate: Date, endDate: Date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const pattern = days.map(day => ({ dayOfWeek: day, adherenceRate: 0 }));
    
    // Sample pattern calculation
    const goals = await storage.getHealthGoals(userId);
    for (const goal of goals) {
      const progressData = await storage.getGoalProgress(goal.id);
      const periodProgress = progressData.filter(p => p.date >= startDate && p.date <= endDate);
      
      days.forEach((day, index) => {
        const dayProgress = periodProgress.filter(p => p.date.getDay() === index);
        if (dayProgress.length > 0) {
          const dayRate = dayProgress.filter(p => p.achieved).length / dayProgress.length;
          pattern[index].adherenceRate = Math.round(dayRate * 100);
        }
      });
    }
    
    return pattern;
  }

  private generateAdherenceInsights(goalBreakdown: any[], weeklyPattern: any[], overallAdherence: number): string[] {
    const insights: string[] = [];
    
    if (overallAdherence >= 80) {
      insights.push('Excellent adherence across all goals - client is highly motivated');
    } else if (overallAdherence >= 60) {
      insights.push('Good adherence with room for improvement in consistency');
    } else {
      insights.push('Low adherence indicates need for goal adjustment or motivation strategies');
    }
    
    const strugglingGoals = goalBreakdown.filter(g => g.adherence < 50);
    if (strugglingGoals.length > 0) {
      insights.push(`Struggling most with: ${strugglingGoals.map(g => g.goalType).join(', ')}`);
    }
    
    const bestDay = weeklyPattern.reduce((best, day) => 
      day.adherenceRate > best.adherenceRate ? day : best
    );
    insights.push(`Strongest performance on ${bestDay.dayOfWeek}s (${bestDay.adherenceRate}%)`);
    
    return insights;
  }

  private identifyWeeklyAchievements(adherencePattern: AdherencePattern, goals: HealthGoal[]): string[] {
    const achievements: string[] = [];
    
    if (adherencePattern.overallAdherence >= 80) {
      achievements.push('Maintained excellent goal adherence (80%+)');
    }
    
    adherencePattern.goalBreakdown.forEach(goal => {
      if (goal.adherence === 100) {
        achievements.push(`Perfect week for ${goal.goalType} goal`);
      } else if (goal.trend === 'improving') {
        achievements.push(`Showing improvement in ${goal.goalType}`);
      }
    });
    
    return achievements;
  }

  private identifyWeeklyChallenges(adherencePattern: AdherencePattern): string[] {
    const challenges: string[] = [];
    
    adherencePattern.goalBreakdown.forEach(goal => {
      if (goal.adherence < 50) {
        challenges.push(`Low adherence for ${goal.goalType} (${goal.adherence}%)`);
      } else if (goal.trend === 'declining') {
        challenges.push(`Declining trend in ${goal.goalType}`);
      }
    });
    
    return challenges;
  }

  private async generateWeeklyRecommendations(adherencePattern: AdherencePattern, weeklyMetrics: HealthMetric[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (adherencePattern.overallAdherence < 60) {
      recommendations.push('Consider reducing goal difficulty or breaking into smaller micro-goals');
      recommendations.push('Schedule more frequent check-ins for motivation');
    }
    
    const lowEngagement = weeklyMetrics.length < 3;
    if (lowEngagement) {
      recommendations.push('Encourage daily logging through reminders or gamification');
    }
    
    return recommendations;
  }

  private suggestNextWeekFocus(adherencePattern: AdherencePattern, challenges: string[]): string[] {
    const focus: string[] = [];
    
    if (challenges.length > 0) {
      const strugglingGoal = adherencePattern.goalBreakdown.find(g => g.adherence < 50);
      if (strugglingGoal) {
        focus.push(`Priority: Improve ${strugglingGoal.goalType} consistency`);
      }
    }
    
    focus.push('Maintain current successful habits');
    focus.push('Celebrate small wins to build momentum');
    
    return focus;
  }

  private generateWeeklySummary(adherence: number, achievements: string[], challenges: string[], engagementCount: number): string {
    if (adherence >= 80) {
      return `Excellent week with strong adherence (${adherence}%). ${achievements.length} key achievements. Client is maintaining great momentum and staying highly engaged.`;
    } else if (adherence >= 60) {
      return `Good progress this week with ${adherence}% adherence. Some challenges present but overall trajectory is positive. Focus on consistency improvements.`;
    } else {
      return `Challenging week with ${adherence}% adherence. ${challenges.length} areas need attention. Recommend adjusting approach and increasing support.`;
    }
  }

  private analyzeMoodTrend(weeklyMetrics: HealthMetric[]): string {
    // Simple mood analysis based on activity levels
    if (weeklyMetrics.length >= 5) return 'Engaged and active';
    if (weeklyMetrics.length >= 3) return 'Moderately engaged';
    return 'Low engagement';
  }

  private calculateEngagementLevel(metricsCount: number, adherence: number): 'high' | 'medium' | 'low' {
    if (metricsCount >= 5 && adherence >= 70) return 'high';
    if (metricsCount >= 3 && adherence >= 50) return 'medium';
    return 'low';
  }
}

export const coachInsightsEngine = new CoachInsightsEngine();