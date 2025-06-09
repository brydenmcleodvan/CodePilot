/**
 * Enhanced Streak Counter with Recovery Logic
 * Tracks consecutive days and provides grace periods for better UX
 */

interface StreakData {
  userId: number;
  goalId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  graceDaysUsed: number;
  maxGraceDays: number;
  streakStartDate: string;
}

interface StreakRecoveryOptions {
  graceDaysAllowed: number;
  weeklyRecoveryEnabled: boolean;
  perfectWeekBonus: boolean;
}

export class StreakCounter {
  private streaks: Map<string, StreakData> = new Map();
  private defaultOptions: StreakRecoveryOptions = {
    graceDaysAllowed: 1, // Allow 1 grace day per week
    weeklyRecoveryEnabled: true,
    perfectWeekBonus: true
  };

  /**
   * Update streak for a completed goal
   */
  async recordGoalCompletion(
    userId: number, 
    goalId: string, 
    completionDate: string = new Date().toISOString().split('T')[0]
  ): Promise<StreakData> {
    const streakKey = `${userId}_${goalId}`;
    let streak = this.streaks.get(streakKey);

    if (!streak) {
      streak = {
        userId,
        goalId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: completionDate,
        graceDaysUsed: 0,
        maxGraceDays: this.defaultOptions.graceDaysAllowed,
        streakStartDate: completionDate
      };
    } else {
      const lastDate = new Date(streak.lastCompletedDate);
      const currentDate = new Date(completionDate);
      const daysDifference = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDifference === 1) {
        // Consecutive day - extend streak
        streak.currentStreak++;
        streak.lastCompletedDate = completionDate;
      } else if (daysDifference > 1 && daysDifference <= (1 + streak.maxGraceDays - streak.graceDaysUsed)) {
        // Within grace period - maintain streak but use grace days
        const graceDaysNeeded = daysDifference - 1;
        streak.graceDaysUsed += graceDaysNeeded;
        streak.currentStreak++;
        streak.lastCompletedDate = completionDate;
      } else {
        // Streak broken - start new streak
        streak.currentStreak = 1;
        streak.graceDaysUsed = 0;
        streak.streakStartDate = completionDate;
        streak.lastCompletedDate = completionDate;
      }

      // Update longest streak record
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    }

    this.streaks.set(streakKey, streak);
    
    // Check for weekly bonuses
    await this.checkWeeklyBonus(streak);
    
    return streak;
  }

  /**
   * Get current streak data for a goal
   */
  getStreak(userId: number, goalId: string): StreakData | null {
    const streakKey = `${userId}_${goalId}`;
    return this.streaks.get(streakKey) || null;
  }

  /**
   * Check if user qualifies for streak recovery (grace day refresh)
   */
  private async checkWeeklyBonus(streak: StreakData): Promise<void> {
    const startDate = new Date(streak.streakStartDate);
    const currentDate = new Date(streak.lastCompletedDate);
    const weeksPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    // Reset grace days weekly if enabled
    if (this.defaultOptions.weeklyRecoveryEnabled && weeksPassed > 0) {
      const weeksCompleted = Math.floor(streak.currentStreak / 7);
      const potentialGraceDays = weeksCompleted * this.defaultOptions.graceDaysAllowed;
      
      if (potentialGraceDays > streak.graceDaysUsed) {
        streak.maxGraceDays = this.defaultOptions.graceDaysAllowed + (potentialGraceDays - streak.graceDaysUsed);
      }
    }

    // Perfect week bonus
    if (this.defaultOptions.perfectWeekBonus && streak.currentStreak % 7 === 0 && streak.graceDaysUsed === 0) {
      streak.maxGraceDays += 1; // Bonus grace day for perfect week
    }
  }

  /**
   * Use a grace day to repair a broken streak
   */
  async useGraceDay(userId: number, goalId: string, missedDate: string): Promise<{ success: boolean; message: string }> {
    const streakKey = `${userId}_${goalId}`;
    const streak = this.streaks.get(streakKey);

    if (!streak) {
      return { success: false, message: "No active streak found" };
    }

    if (streak.graceDaysUsed >= streak.maxGraceDays) {
      return { success: false, message: "No grace days remaining" };
    }

    const lastDate = new Date(streak.lastCompletedDate);
    const missedDateObj = new Date(missedDate);
    const daysDifference = Math.floor((missedDateObj.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference !== 1) {
      return { success: false, message: "Grace day can only be used for immediately missed days" };
    }

    // Apply grace day
    streak.graceDaysUsed++;
    streak.lastCompletedDate = missedDate;
    
    this.streaks.set(streakKey, streak);
    
    return { 
      success: true, 
      message: `Grace day applied. ${streak.maxGraceDays - streak.graceDaysUsed} grace days remaining.` 
    };
  }

  /**
   * Get streak statistics for a user
   */
  getUserStreakStats(userId: number): {
    totalActiveStreaks: number;
    longestStreak: number;
    totalGraceDaysUsed: number;
    averageStreakLength: number;
  } {
    const userStreaks = Array.from(this.streaks.values()).filter(s => s.userId === userId);
    
    return {
      totalActiveStreaks: userStreaks.filter(s => s.currentStreak > 0).length,
      longestStreak: Math.max(...userStreaks.map(s => s.longestStreak), 0),
      totalGraceDaysUsed: userStreaks.reduce((sum, s) => sum + s.graceDaysUsed, 0),
      averageStreakLength: userStreaks.length > 0 
        ? userStreaks.reduce((sum, s) => sum + s.currentStreak, 0) / userStreaks.length 
        : 0
    };
  }

  /**
   * Get users who need streak recovery encouragement
   */
  getStreaksAtRisk(): Array<{ userId: number; goalId: string; daysMissed: number; graceDaysAvailable: number }> {
    const today = new Date();
    const atRiskStreaks: Array<{ userId: number; goalId: string; daysMissed: number; graceDaysAvailable: number }> = [];

    for (const streak of this.streaks.values()) {
      const lastCompleted = new Date(streak.lastCompletedDate);
      const daysSinceCompletion = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCompletion > 1 && streak.currentStreak > 0) {
        const graceDaysAvailable = streak.maxGraceDays - streak.graceDaysUsed;
        
        if (daysSinceCompletion <= graceDaysAvailable + 1) {
          atRiskStreaks.push({
            userId: streak.userId,
            goalId: streak.goalId,
            daysMissed: daysSinceCompletion - 1,
            graceDaysAvailable
          });
        }
      }
    }

    return atRiskStreaks;
  }
}

export const streakCounter = new StreakCounter();