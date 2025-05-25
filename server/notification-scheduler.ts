/**
 * Notification Scheduler - Cron jobs for dynamic notifications
 * Automatically checks for notification triggers and sends timely nudges
 */

import { notificationEngine } from './notification-engine';

export class NotificationScheduler {
  private intervals: NodeJS.Timeout[] = [];

  /**
   * Start all notification check intervals
   */
  public startScheduler(): void {
    console.log('🔔 Starting notification scheduler...');

    // Check for missed goals every 2 hours
    const missedGoalInterval = setInterval(async () => {
      console.log('⏰ Checking for missed goal notifications...');
      await this.checkMissedGoalNotifications();
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    this.intervals.push(missedGoalInterval);

    // Check for AI wellness nudges every hour
    const aiWellnessInterval = setInterval(async () => {
      console.log('🧘 Checking for AI wellness notifications...');
      await this.checkAIWellnessNotifications();
    }, 60 * 60 * 1000); // 1 hour
    
    this.intervals.push(aiWellnessInterval);

    // Check for sync issues every 6 hours
    const syncIssueInterval = setInterval(async () => {
      console.log('📱 Checking for device sync notifications...');
      await this.checkSyncIssueNotifications();
    }, 6 * 60 * 60 * 1000); // 6 hours
    
    this.intervals.push(syncIssueInterval);

    // Check for achievements every 30 minutes
    const achievementInterval = setInterval(async () => {
      console.log('🏆 Checking for achievement notifications...');
      await this.checkAchievementNotifications();
    }, 30 * 60 * 1000); // 30 minutes
    
    this.intervals.push(achievementInterval);

    // Check for evening reminders at 7 PM daily
    const reminderInterval = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 19 && now.getMinutes() === 0) { // 7:00 PM
        console.log('🌙 Sending evening reminder notifications...');
        await this.checkReminderNotifications();
      }
    }, 60 * 1000); // Check every minute
    
    this.intervals.push(reminderInterval);

    console.log('✅ Notification scheduler started successfully');
  }

  /**
   * Stop all notification intervals
   */
  public stopScheduler(): void {
    console.log('🛑 Stopping notification scheduler...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('✅ Notification scheduler stopped');
  }

  /**
   * Check for missed goal notifications for all users
   */
  private async checkMissedGoalNotifications(): Promise<void> {
    try {
      // In a real implementation, you would get all active users
      // For now, we'll process the notification engine directly
      await notificationEngine.processAllUserNotifications();
    } catch (error) {
      console.error('Error checking missed goal notifications:', error);
    }
  }

  /**
   * Check for AI wellness notifications
   */
  private async checkAIWellnessNotifications(): Promise<void> {
    try {
      await notificationEngine.processAllUserNotifications();
    } catch (error) {
      console.error('Error checking AI wellness notifications:', error);
    }
  }

  /**
   * Check for device sync issue notifications
   */
  private async checkSyncIssueNotifications(): Promise<void> {
    try {
      await notificationEngine.processAllUserNotifications();
    } catch (error) {
      console.error('Error checking sync issue notifications:', error);
    }
  }

  /**
   * Check for achievement notifications
   */
  private async checkAchievementNotifications(): Promise<void> {
    try {
      await notificationEngine.processAllUserNotifications();
    } catch (error) {
      console.error('Error checking achievement notifications:', error);
    }
  }

  /**
   * Check for reminder notifications
   */
  private async checkReminderNotifications(): Promise<void> {
    try {
      await notificationEngine.processAllUserNotifications();
    } catch (error) {
      console.error('Error checking reminder notifications:', error);
    }
  }

  /**
   * Manually trigger notification check for specific user
   */
  public async triggerUserNotificationCheck(userId: number): Promise<void> {
    try {
      console.log(`🔔 Manually checking notifications for user ${userId}...`);
      const notifications = await notificationEngine.checkAndGenerateNotifications(userId);
      console.log(`✅ Generated ${notifications.length} notifications for user ${userId}`);
    } catch (error) {
      console.error(`Error checking notifications for user ${userId}:`, error);
    }
  }
}

export const notificationScheduler = new NotificationScheduler();