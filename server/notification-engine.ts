/**
 * Dynamic Notifications & Nudges Engine
 * Provides timely, relevant prompts based on user behavior and health patterns
 * Supports missed goal nudges, AI wellness prompts, and sync issue alerts
 */

import { storage } from './storage';
import { HealthGoal, HealthMetric } from '@shared/schema';

export interface NotificationTrigger {
  id: string;
  type: 'missed_goal' | 'ai_wellness' | 'sync_issue' | 'achievement' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  conditions: {
    timeWindow?: number; // hours
    goalTypes?: string[];
    metricTypes?: string[];
    streakThreshold?: number;
    lastActivityThreshold?: number; // hours since last activity
  };
  message: {
    title: string;
    body: string;
    actionText?: string;
    actionUrl?: string;
  };
  deliveryChannels: ('push' | 'email' | 'in_app')[];
  cooldownPeriod: number; // hours before same notification can be sent again
}

export interface UserNotification {
  id: string;
  userId: number;
  triggerId: string;
  type: string;
  title: string;
  body: string;
  actionText?: string;
  actionUrl?: string;
  priority: string;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  deliveredVia: string[];
}

export class NotificationEngine {
  private triggers: NotificationTrigger[] = [
    // Missed Goal Nudges
    {
      id: 'missed-steps-retry',
      type: 'missed_goal',
      priority: 'medium',
      conditions: {
        timeWindow: 24,
        goalTypes: ['steps'],
        streakThreshold: 0
      },
      message: {
        title: '🚶‍♀️ Step Goal Missed',
        body: 'Want to retry your step goal today? Even a short walk counts!',
        actionText: 'Log Steps',
        actionUrl: '/health-goals'
      },
      deliveryChannels: ['push', 'in_app'],
      cooldownPeriod: 12
    },
    {
      id: 'missed-sleep-reminder',
      type: 'missed_goal',
      priority: 'high',
      conditions: {
        timeWindow: 48,
        goalTypes: ['sleep'],
        streakThreshold: 0
      },
      message: {
        title: '😴 Sleep Goal Missed',
        body: 'Good sleep is crucial for your health. Let\'s get back on track tonight!',
        actionText: 'Set Sleep Reminder',
        actionUrl: '/health-goals'
      },
      deliveryChannels: ['push', 'in_app'],
      cooldownPeriod: 24
    },

    // AI Wellness Nudges
    {
      id: 'stress-breathing',
      type: 'ai_wellness',
      priority: 'medium',
      conditions: {
        timeWindow: 6,
        metricTypes: ['heart_rate', 'stress']
      },
      message: {
        title: '🧘‍♀️ Feeling Stressed?',
        body: 'Your metrics suggest elevated stress. Try a 5-minute breathing exercise.',
        actionText: 'Start Breathing',
        actionUrl: '/wellness/breathing'
      },
      deliveryChannels: ['push', 'in_app'],
      cooldownPeriod: 8
    },
    {
      id: 'hydration-reminder',
      type: 'ai_wellness',
      priority: 'low',
      conditions: {
        timeWindow: 4,
        goalTypes: ['water_intake']
      },
      message: {
        title: '💧 Hydration Check',
        body: 'Haven\'t logged water in a while. Time for a refreshing drink!',
        actionText: 'Log Water',
        actionUrl: '/health-goals'
      },
      deliveryChannels: ['in_app'],
      cooldownPeriod: 6
    },

    // Sync Issue Alerts
    {
      id: 'device-sync-oura',
      type: 'sync_issue',
      priority: 'medium',
      conditions: {
        lastActivityThreshold: 24,
        metricTypes: ['sleep', 'heart_rate']
      },
      message: {
        title: '⌚ Sync Issue Detected',
        body: 'We haven\'t seen data from your Oura Ring since yesterday. Check your connection.',
        actionText: 'Check Sync',
        actionUrl: '/integrations'
      },
      deliveryChannels: ['push', 'in_app'],
      cooldownPeriod: 12
    },
    {
      id: 'device-sync-apple-watch',
      type: 'sync_issue',
      priority: 'medium',
      conditions: {
        lastActivityThreshold: 24,
        metricTypes: ['steps', 'exercise']
      },
      message: {
        title: '📱 Apple Watch Sync Issue',
        body: 'Your Apple Watch hasn\'t synced activity data recently. Let\'s reconnect.',
        actionText: 'Fix Sync',
        actionUrl: '/integrations'
      },
      deliveryChannels: ['push', 'in_app'],
      cooldownPeriod: 12
    },

    // Achievement Celebrations
    {
      id: 'streak-milestone',
      type: 'achievement',
      priority: 'high',
      conditions: {
        streakThreshold: 7
      },
      message: {
        title: '🔥 Amazing Streak!',
        body: 'You\'ve hit a 7-day streak! Your consistency is paying off beautifully.',
        actionText: 'View Progress',
        actionUrl: '/health-goals'
      },
      deliveryChannels: ['push', 'in_app', 'email'],
      cooldownPeriod: 168 // Once per week
    },

    // Smart Reminders
    {
      id: 'evening-reflection',
      type: 'reminder',
      priority: 'low',
      conditions: {
        timeWindow: 24
      },
      message: {
        title: '🌙 Evening Check-in',
        body: 'How was your day? Take a moment to log your wellness metrics.',
        actionText: 'Quick Log',
        actionUrl: '/health-goals'
      },
      deliveryChannels: ['in_app'],
      cooldownPeriod: 24
    }
  ];

  /**
   * Check and generate notifications for a user
   */
  async checkAndGenerateNotifications(userId: number): Promise<UserNotification[]> {
    const newNotifications: UserNotification[] = [];
    
    for (const trigger of this.triggers) {
      if (await this.shouldTriggerNotification(userId, trigger)) {
        const notification = await this.createNotification(userId, trigger);
        if (notification) {
          newNotifications.push(notification);
        }
      }
    }

    return newNotifications;
  }

  /**
   * Check if a notification should be triggered for a user
   */
  private async shouldTriggerNotification(userId: number, trigger: NotificationTrigger): Promise<boolean> {
    // Check cooldown period
    if (await this.isInCooldownPeriod(userId, trigger.id, trigger.cooldownPeriod)) {
      return false;
    }

    // Check specific conditions based on trigger type
    switch (trigger.type) {
      case 'missed_goal':
        return await this.checkMissedGoalConditions(userId, trigger);
      case 'ai_wellness':
        return await this.checkAIWellnessConditions(userId, trigger);
      case 'sync_issue':
        return await this.checkSyncIssueConditions(userId, trigger);
      case 'achievement':
        return await this.checkAchievementConditions(userId, trigger);
      case 'reminder':
        return await this.checkReminderConditions(userId, trigger);
      default:
        return false;
    }
  }

  /**
   * Check if user has missed goals based on trigger conditions
   */
  private async checkMissedGoalConditions(userId: number, trigger: NotificationTrigger): Promise<boolean> {
    const goals = await storage.getHealthGoals(userId);
    const relevantGoals = goals.filter(goal => 
      !trigger.conditions.goalTypes || trigger.conditions.goalTypes.includes(goal.metricType)
    );

    for (const goal of relevantGoals) {
      const progressData = await storage.getGoalProgress(goal.id);
      const recentProgress = progressData.filter(p => {
        const hoursAgo = (new Date().getTime() - p.date.getTime()) / (1000 * 60 * 60);
        return hoursAgo <= (trigger.conditions.timeWindow || 24);
      });

      // Check if goal was missed in the time window
      const missedDays = recentProgress.filter(p => !p.achieved).length;
      if (missedDays > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check AI wellness conditions based on health metrics
   */
  private async checkAIWellnessConditions(userId: number, trigger: NotificationTrigger): Promise<boolean> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const timeWindow = trigger.conditions.timeWindow || 24;
    
    const recentMetrics = healthMetrics.filter(metric => {
      const hoursAgo = (new Date().getTime() - metric.timestamp.getTime()) / (1000 * 60 * 60);
      return hoursAgo <= timeWindow;
    });

    // Check for stress indicators
    if (trigger.id === 'stress-breathing') {
      const heartRateMetrics = recentMetrics.filter(m => m.metricType === 'heart_rate');
      const avgHeartRate = heartRateMetrics.length > 0 
        ? heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length
        : 0;
      
      return avgHeartRate > 90; // Elevated heart rate threshold
    }

    // Check for hydration gaps
    if (trigger.id === 'hydration-reminder') {
      const waterMetrics = recentMetrics.filter(m => m.metricType === 'water_intake');
      return waterMetrics.length === 0; // No water logged recently
    }

    return false;
  }

  /**
   * Check for device sync issues
   */
  private async checkSyncIssueConditions(userId: number, trigger: NotificationTrigger): Promise<boolean> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const threshold = trigger.conditions.lastActivityThreshold || 24;
    
    // Check for gaps in expected metric types
    const relevantMetrics = trigger.conditions.metricTypes || [];
    
    for (const metricType of relevantMetrics) {
      const lastMetric = healthMetrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      if (!lastMetric) {
        continue;
      }
      
      const hoursAgo = (new Date().getTime() - lastMetric.timestamp.getTime()) / (1000 * 60 * 60);
      if (hoursAgo > threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for achievement milestones
   */
  private async checkAchievementConditions(userId: number, trigger: NotificationTrigger): Promise<boolean> {
    const goals = await storage.getHealthGoals(userId);
    
    for (const goal of goals) {
      const progressData = await storage.getGoalProgress(goal.id);
      
      // Calculate current streak
      let currentStreak = 0;
      const sortedProgress = progressData.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      for (const progress of sortedProgress) {
        if (progress.achieved) {
          currentStreak++;
        } else {
          break;
        }
      }

      const streakThreshold = trigger.conditions.streakThreshold || 7;
      if (currentStreak === streakThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check reminder conditions (time-based)
   */
  private async checkReminderConditions(userId: number, trigger: NotificationTrigger): Promise<boolean> {
    const now = new Date();
    
    // Evening reflection (7-9 PM)
    if (trigger.id === 'evening-reflection') {
      const hour = now.getHours();
      return hour >= 19 && hour <= 21;
    }

    return false;
  }

  /**
   * Check if notification is in cooldown period
   */
  private async isInCooldownPeriod(userId: number, triggerId: string, cooldownHours: number): Promise<boolean> {
    // This would check the database for the last notification of this type
    // For now, we'll assume it's not in cooldown
    return false;
  }

  /**
   * Create a notification for a user
   */
  private async createNotification(userId: number, trigger: NotificationTrigger): Promise<UserNotification | null> {
    const notification: UserNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      triggerId: trigger.id,
      type: trigger.type,
      title: trigger.message.title,
      body: trigger.message.body,
      actionText: trigger.message.actionText,
      actionUrl: trigger.message.actionUrl,
      priority: trigger.priority,
      createdAt: new Date(),
      deliveredVia: []
    };

    // Here you would save to database and trigger delivery
    // await storage.saveNotification(notification);
    
    return notification;
  }

  /**
   * Get pending notifications for a user
   */
  async getPendingNotifications(userId: number): Promise<UserNotification[]> {
    // This would fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // Update notification in database
  }

  /**
   * Mark notification as dismissed
   */
  async dismissNotification(notificationId: string): Promise<void> {
    // Update notification in database
  }

  /**
   * Cron job function to check all users for notifications
   */
  async processAllUserNotifications(): Promise<void> {
    // This would be called by a cron job
    // Get all active users and check for notifications
    console.log('Processing notifications for all users...');
  }
}

export const notificationEngine = new NotificationEngine();