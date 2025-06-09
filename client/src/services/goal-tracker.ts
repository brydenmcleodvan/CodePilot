/**
 * Daily Goal Tracking Service
 * Handles progress tracking and achievement logging for health goals
 */

interface DailyProgress {
  userId: number;
  goalId: string;
  goalType: string;
  achievedValue: number;
  targetValue: number;
  date: string;
  achieved: boolean;
}

export class GoalTracker {
  /**
   * Track daily progress for a specific goal
   */
  static async trackDailyGoal(
    goalId: string,
    goalType: string,
    achievedValue: number,
    targetValue: number
  ): Promise<void> {
    try {
      const progressData = {
        goalId,
        goalType,
        achievedValue,
        targetValue,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        achieved: achievedValue >= targetValue
      };

      const response = await fetch('/api/goal-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error('Failed to track goal progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking daily goal:', error);
      throw error;
    }
  }

  /**
   * Get progress history for a specific goal
   */
  static async getGoalProgress(goalId: string, days: number = 30): Promise<DailyProgress[]> {
    try {
      const response = await fetch(`/api/goal-progress/${goalId}?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch goal progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching goal progress:', error);
      throw error;
    }
  }

  /**
   * Get current streak for a goal
   */
  static async getCurrentStreak(goalId: string): Promise<number> {
    try {
      const response = await fetch(`/api/goal-progress/${goalId}/streak`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch goal streak');
      }

      const data = await response.json();
      return data.streak || 0;
    } catch (error) {
      console.error('Error fetching goal streak:', error);
      return 0;
    }
  }

  /**
   * Calculate completion percentage for a goal over a time period
   */
  static async getCompletionRate(goalId: string, days: number = 7): Promise<number> {
    try {
      const progress = await this.getGoalProgress(goalId, days);
      const totalDays = progress.length;
      const achievedDays = progress.filter(p => p.achieved).length;
      
      return totalDays > 0 ? Math.round((achievedDays / totalDays) * 100) : 0;
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      return 0;
    }
  }

  /**
   * Update goal progress with current day's achievement
   */
  static async updateTodayProgress(
    goalId: string,
    achievedValue: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch('/api/goal-progress/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId,
          achievedValue,
          date: today
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }
}