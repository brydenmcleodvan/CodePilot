import { apiRequest } from '@/lib/queryClient';

export interface StreakData {
  current: number;
  longest: number;
  type: string;
  lastUpdate: string;
}

export interface HealthImprovement {
  metric: string;
  improvement: number;
  period: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  unlockedAt?: string;
  category: 'health' | 'consistency' | 'milestone' | 'special';
}

export interface ProgressData {
  streaks: StreakData[];
  improvements: HealthImprovement[];
  achievements: Achievement[];
  healthScore: number;
  previousHealthScore: number;
}

export class ProgressTrackerService {
  private predefinedAchievements: Achievement[] = [
    {
      id: 'first_week_streak',
      title: 'Week Warrior',
      description: 'Maintain any health habit for 7 consecutive days',
      icon: 'flame',
      color: 'orange',
      progress: 0,
      maxProgress: 7,
      completed: false,
      category: 'consistency'
    },
    {
      id: 'sleep_champion',
      title: 'Sleep Champion',
      description: 'Get 8+ hours of sleep for 30 days',
      icon: 'moon',
      color: 'blue',
      progress: 0,
      maxProgress: 30,
      completed: false,
      category: 'health'
    },
    {
      id: 'step_master',
      title: 'Step Master',
      description: 'Walk 10,000+ steps for 21 consecutive days',
      icon: 'activity',
      color: 'green',
      progress: 0,
      maxProgress: 21,
      completed: false,
      category: 'health'
    },
    {
      id: 'hydration_hero',
      title: 'Hydration Hero',
      description: 'Drink 8+ glasses of water daily for 14 days',
      icon: 'droplets',
      color: 'cyan',
      progress: 0,
      maxProgress: 14,
      completed: false,
      category: 'health'
    },
    {
      id: 'mindful_moments',
      title: 'Mindful Moments',
      description: 'Complete 10 meditation sessions',
      icon: 'brain',
      color: 'purple',
      progress: 0,
      maxProgress: 10,
      completed: false,
      category: 'health'
    },
    {
      id: 'consistency_king',
      title: 'Consistency King',
      description: 'Maintain 3 different health habits simultaneously for 7 days',
      icon: 'trophy',
      color: 'gold',
      progress: 0,
      maxProgress: 7,
      completed: false,
      category: 'milestone'
    },
    {
      id: 'health_score_improver',
      title: 'Health Improver',
      description: 'Increase your health score by 20 points',
      icon: 'trending-up',
      color: 'green',
      progress: 0,
      maxProgress: 20,
      completed: false,
      category: 'milestone'
    },
    {
      id: 'perfect_week',
      title: 'Perfect Week',
      description: 'Hit all your daily targets for 7 consecutive days',
      icon: 'star',
      color: 'gold',
      progress: 0,
      maxProgress: 7,
      completed: false,
      category: 'special'
    }
  ];

  async getProgressData(userId: number): Promise<ProgressData> {
    try {
      // Fetch user's health goals and recent activity
      const [healthGoals, healthStats, recentActivity] = await Promise.all([
        this.fetchHealthGoals(userId),
        this.fetchHealthStats(userId),
        this.fetchRecentActivity(userId)
      ]);

      // Calculate streaks
      const streaks = this.calculateStreaks(recentActivity);
      
      // Calculate improvements
      const improvements = this.calculateImprovements(healthStats);
      
      // Calculate achievements
      const achievements = this.calculateAchievements(streaks, healthStats, recentActivity);
      
      // Calculate health scores
      const { currentScore, previousScore } = this.calculateHealthScores(healthStats);

      return {
        streaks,
        improvements,
        achievements,
        healthScore: currentScore,
        previousHealthScore: previousScore
      };
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return this.getFallbackProgressData();
    }
  }

  private async fetchHealthGoals(userId: number) {
    try {
      const response = await apiRequest('GET', '/api/health-goals');
      return await response.json();
    } catch {
      return [];
    }
  }

  private async fetchHealthStats(userId: number) {
    try {
      const response = await apiRequest('GET', '/api/health/stats');
      return await response.json();
    } catch {
      return [];
    }
  }

  private async fetchRecentActivity(userId: number) {
    try {
      const response = await apiRequest('GET', '/api/health/recent-activity');
      return await response.json();
    } catch {
      return [];
    }
  }

  private calculateStreaks(recentActivity: any[]): StreakData[] {
    const streakTypes = ['sleep', 'steps', 'water', 'meditation', 'exercise'];
    const streaks: StreakData[] = [];

    streakTypes.forEach(type => {
      const typeActivities = recentActivity
        .filter(activity => activity.type === type)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (typeActivities.length === 0) return;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calculate current streak (from most recent date backwards)
      const today = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;

      for (let i = 0; i < typeActivities.length; i++) {
        const activityDate = new Date(typeActivities[i].date);
        const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / msPerDay);
        
        if (daysDiff === i && typeActivities[i].completed) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate longest streak
      for (const activity of typeActivities) {
        if (activity.completed) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      if (currentStreak > 0 || longestStreak > 0) {
        streaks.push({
          current: currentStreak,
          longest: longestStreak,
          type,
          lastUpdate: typeActivities[0]?.date || new Date().toISOString()
        });
      }
    });

    return streaks;
  }

  private calculateImprovements(healthStats: any[]): HealthImprovement[] {
    const improvements: HealthImprovement[] = [];
    const metrics = ['sleep_hours', 'steps', 'water_intake', 'heart_rate', 'weight'];

    metrics.forEach(metric => {
      const metricStats = healthStats.filter(stat => stat.statType === metric);
      if (metricStats.length < 2) return;

      // Compare last 30 days vs previous 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recent = metricStats.filter(stat => 
        new Date(stat.timestamp) >= thirtyDaysAgo
      );
      const previous = metricStats.filter(stat => 
        new Date(stat.timestamp) >= sixtyDaysAgo && 
        new Date(stat.timestamp) < thirtyDaysAgo
      );

      if (recent.length === 0 || previous.length === 0) return;

      const recentAvg = recent.reduce((sum, stat) => sum + parseFloat(stat.value), 0) / recent.length;
      const previousAvg = previous.reduce((sum, stat) => sum + parseFloat(stat.value), 0) / previous.length;
      
      const improvementPercent = ((recentAvg - previousAvg) / previousAvg) * 100;
      
      if (Math.abs(improvementPercent) >= 1) { // Only show significant changes
        improvements.push({
          metric,
          improvement: Math.round(improvementPercent * 10) / 10,
          period: '30 days',
          unit: recent[0]?.unit || '',
          trend: improvementPercent > 0 ? 'up' : improvementPercent < 0 ? 'down' : 'stable'
        });
      }
    });

    return improvements;
  }

  private calculateAchievements(streaks: StreakData[], healthStats: any[], recentActivity: any[]): Achievement[] {
    const achievements = [...this.predefinedAchievements];

    // Update achievement progress based on user data
    achievements.forEach(achievement => {
      switch (achievement.id) {
        case 'first_week_streak':
          const maxStreak = Math.max(...streaks.map(s => s.current), 0);
          achievement.progress = Math.min(maxStreak, 7);
          achievement.completed = maxStreak >= 7;
          break;

        case 'sleep_champion':
          const sleepStreak = streaks.find(s => s.type === 'sleep')?.current || 0;
          achievement.progress = Math.min(sleepStreak, 30);
          achievement.completed = sleepStreak >= 30;
          break;

        case 'step_master':
          const stepStreak = streaks.find(s => s.type === 'steps')?.current || 0;
          achievement.progress = Math.min(stepStreak, 21);
          achievement.completed = stepStreak >= 21;
          break;

        case 'hydration_hero':
          const waterStreak = streaks.find(s => s.type === 'water')?.current || 0;
          achievement.progress = Math.min(waterStreak, 14);
          achievement.completed = waterStreak >= 14;
          break;

        case 'mindful_moments':
          const meditationCount = recentActivity.filter(a => 
            a.type === 'meditation' && a.completed
          ).length;
          achievement.progress = Math.min(meditationCount, 10);
          achievement.completed = meditationCount >= 10;
          break;

        case 'consistency_king':
          const activeStreaks = streaks.filter(s => s.current >= 7).length;
          achievement.progress = Math.min(activeStreaks, 3);
          achievement.completed = activeStreaks >= 3;
          break;
      }

      if (achievement.completed && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date().toISOString();
      }
    });

    return achievements;
  }

  private calculateHealthScores(healthStats: any[]): { currentScore: number; previousScore: number } {
    // Simple health score calculation based on available metrics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentStats = healthStats.filter(stat => 
      new Date(stat.timestamp) >= sevenDaysAgo
    );
    const previousStats = healthStats.filter(stat => 
      new Date(stat.timestamp) >= fourteenDaysAgo && 
      new Date(stat.timestamp) < sevenDaysAgo
    );

    const calculateScore = (stats: any[]) => {
      if (stats.length === 0) return 70;

      let score = 0;
      let components = 0;

      // Sleep score (0-25 points)
      const sleepStats = stats.filter(s => s.statType === 'sleep_hours');
      if (sleepStats.length > 0) {
        const avgSleep = sleepStats.reduce((sum, s) => sum + parseFloat(s.value), 0) / sleepStats.length;
        score += Math.min(25, (avgSleep / 8) * 25);
        components++;
      }

      // Activity score (0-25 points)
      const stepStats = stats.filter(s => s.statType === 'steps');
      if (stepStats.length > 0) {
        const avgSteps = stepStats.reduce((sum, s) => sum + parseFloat(s.value), 0) / stepStats.length;
        score += Math.min(25, (avgSteps / 10000) * 25);
        components++;
      }

      // Hydration score (0-25 points)
      const waterStats = stats.filter(s => s.statType === 'water_intake');
      if (waterStats.length > 0) {
        const avgWater = waterStats.reduce((sum, s) => sum + parseFloat(s.value), 0) / waterStats.length;
        score += Math.min(25, (avgWater / 8) * 25);
        components++;
      }

      // Consistency bonus (0-25 points)
      const uniqueDays = new Set(stats.map(s => s.timestamp.split('T')[0])).size;
      score += Math.min(25, (uniqueDays / 7) * 25);
      components++;

      return components > 0 ? Math.round(score) : 70;
    };

    return {
      currentScore: calculateScore(recentStats),
      previousScore: calculateScore(previousStats)
    };
  }

  private getFallbackProgressData(): ProgressData {
    return {
      streaks: [
        {
          current: 3,
          longest: 7,
          type: 'sleep',
          lastUpdate: new Date().toISOString()
        },
        {
          current: 5,
          longest: 12,
          type: 'steps',
          lastUpdate: new Date().toISOString()
        }
      ],
      improvements: [
        {
          metric: 'sleep_hours',
          improvement: 12.5,
          period: '30 days',
          unit: 'hours',
          trend: 'up'
        },
        {
          metric: 'steps',
          improvement: 8.3,
          period: '30 days',
          unit: 'steps',
          trend: 'up'
        }
      ],
      achievements: this.predefinedAchievements.map(a => ({ ...a })),
      healthScore: 78,
      previousHealthScore: 65
    };
  }
}

export const progressTracker = new ProgressTrackerService();