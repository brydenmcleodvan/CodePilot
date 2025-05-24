/**
 * Health Habit Streak Tracking Engine
 * Calculates consecutive days of goal achievement to motivate users
 */

interface MetricDataPoint {
  date: string;
  value: number;
  source?: string;
}

interface StreakGoal {
  type: 'min' | 'max' | 'target' | 'range';
  target: number | { min: number; max: number };
  unit: string;
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastAchievementDate: string | null;
  achievementRate: number; // percentage of days goal was met
  streakHistory: {
    date: string;
    achieved: boolean;
    value: number;
    streakCount: number;
  }[];
}

export class StreakEngine {
  /**
   * Calculate current and longest streak for a given goal
   */
  calculateStreak(metricData: MetricDataPoint[], goal: StreakGoal): StreakResult {
    if (!metricData || metricData.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakStartDate: null,
        lastAchievementDate: null,
        achievementRate: 0,
        streakHistory: []
      };
    }

    // Sort data by date (most recent first)
    const sortedData = [...metricData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let achievementCount = 0;
    let streakStartDate: string | null = null;
    let lastAchievementDate: string | null = null;
    
    const streakHistory: StreakResult['streakHistory'] = [];

    // Calculate streaks and track history
    for (let i = 0; i < sortedData.length; i++) {
      const dataPoint = sortedData[i];
      const goalMet = this.isGoalMet(dataPoint.value, goal);

      if (goalMet) {
        achievementCount++;
        lastAchievementDate = dataPoint.date;
        
        // For current streak (from most recent backwards)
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
          if (currentStreak === 1) {
            streakStartDate = dataPoint.date;
          }
        }
        
        // For longest streak calculation
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        // Reset current streak if we hit a miss from the beginning
        if (currentStreak > 0 && i < currentStreak) {
          currentStreak = 0;
          streakStartDate = null;
        }
        tempStreak = 0;
      }

      streakHistory.push({
        date: dataPoint.date,
        achieved: goalMet,
        value: dataPoint.value,
        streakCount: goalMet ? tempStreak : 0
      });
    }

    const achievementRate = (achievementCount / sortedData.length) * 100;

    return {
      currentStreak,
      longestStreak,
      streakStartDate,
      lastAchievementDate,
      achievementRate: Math.round(achievementRate * 100) / 100,
      streakHistory: streakHistory.reverse() // Return in chronological order
    };
  }

  /**
   * Check if a value meets the goal criteria
   */
  private isGoalMet(value: number, goal: StreakGoal): boolean {
    switch (goal.type) {
      case 'min':
        return value >= (goal.target as number);
      case 'max':
        return value <= (goal.target as number);
      case 'target':
        // Allow 5% tolerance for target goals
        const target = goal.target as number;
        const tolerance = target * 0.05;
        return Math.abs(value - target) <= tolerance;
      case 'range':
        const range = goal.target as { min: number; max: number };
        return value >= range.min && value <= range.max;
      default:
        return false;
    }
  }

  /**
   * Get streak insights and motivational messages
   */
  getStreakInsights(streakResult: StreakResult, goalType: string): {
    message: string;
    level: 'excellent' | 'good' | 'needs-improvement';
    motivationalTip: string;
    nextMilestone: number;
  } {
    const { currentStreak, longestStreak, achievementRate } = streakResult;
    
    let level: 'excellent' | 'good' | 'needs-improvement';
    let message: string;
    let motivationalTip: string;

    // Determine performance level
    if (currentStreak >= 7 && achievementRate >= 80) {
      level = 'excellent';
      message = `Amazing! You're on a ${currentStreak}-day streak!`;
      motivationalTip = "You're building incredible healthy habits. Keep this momentum going!";
    } else if (currentStreak >= 3 && achievementRate >= 60) {
      level = 'good';
      message = `Great progress with your ${currentStreak}-day streak!`;
      motivationalTip = "You're developing consistent habits. Try to extend your streak!";
    } else {
      level = 'needs-improvement';
      message = currentStreak > 0 ? 
        `You have a ${currentStreak}-day streak going!` : 
        "Ready to start a new streak?";
      motivationalTip = "Small consistent steps lead to big results. Focus on today!";
    }

    // Calculate next milestone
    const nextMilestone = currentStreak < 7 ? 7 : 
                         currentStreak < 14 ? 14 : 
                         currentStreak < 30 ? 30 : 
                         currentStreak < 90 ? 90 : 
                         Math.ceil((currentStreak + 1) / 30) * 30;

    return {
      message,
      level,
      motivationalTip,
      nextMilestone
    };
  }

  /**
   * Predict streak continuation probability based on historical data
   */
  getStreakPrediction(streakHistory: StreakResult['streakHistory']): {
    continuationProbability: number;
    riskFactors: string[];
    recommendations: string[];
  } {
    if (streakHistory.length < 7) {
      return {
        continuationProbability: 50,
        riskFactors: ['Insufficient data for prediction'],
        recommendations: ['Focus on building consistent daily habits']
      };
    }

    const recentWeek = streakHistory.slice(-7);
    const achievementRate = recentWeek.filter(day => day.achieved).length / 7;
    const trendingUp = this.isStreakTrendingUp(streakHistory.slice(-14));
    
    let probability = achievementRate * 100;
    
    // Adjust based on trends
    if (trendingUp) probability += 15;
    
    // Risk factors
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    
    if (achievementRate < 0.6) {
      riskFactors.push('Recent inconsistency in goal achievement');
      recommendations.push('Set smaller, more achievable daily targets');
    }
    
    if (!trendingUp) {
      riskFactors.push('Declining achievement trend');
      recommendations.push('Review your routine and identify obstacles');
    }
    
    return {
      continuationProbability: Math.min(Math.max(probability, 0), 100),
      riskFactors,
      recommendations
    };
  }

  /**
   * Check if streak is trending upward
   */
  private isStreakTrendingUp(recentData: StreakResult['streakHistory']): boolean {
    if (recentData.length < 4) return true;
    
    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));
    
    const firstHalfRate = firstHalf.filter(d => d.achieved).length / firstHalf.length;
    const secondHalfRate = secondHalf.filter(d => d.achieved).length / secondHalf.length;
    
    return secondHalfRate >= firstHalfRate;
  }
}

export const streakEngine = new StreakEngine();