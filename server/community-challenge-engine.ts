/**
 * Community Challenges Engine
 * Creates social motivation through team challenges, leaderboards, and rewards
 * Supports individual and group challenges with real-time progress tracking
 */

import { storage } from './storage';
import { HealthMetric } from '@shared/schema';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  category: 'steps' | 'sleep' | 'exercise' | 'hydration' | 'mixed';
  target: {
    value: number;
    unit: string;
    metric: string;
  };
  duration: {
    startDate: Date;
    endDate: Date;
    durationDays: number;
  };
  participants: ChallengeParticipant[];
  teams?: ChallengeTeam[];
  rewards: ChallengeReward[];
  status: 'upcoming' | 'active' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
  createdBy: number;
  createdAt: Date;
}

export interface ChallengeParticipant {
  userId: number;
  username: string;
  teamId?: string;
  joinedAt: Date;
  currentProgress: number;
  dailyProgress: { date: string; value: number }[];
  rank: number;
  badges: string[];
  isActive: boolean;
}

export interface ChallengeTeam {
  id: string;
  name: string;
  members: ChallengeParticipant[];
  totalProgress: number;
  averageProgress: number;
  rank: number;
  badge?: string;
}

export interface ChallengeReward {
  id: string;
  type: 'badge' | 'ai_compliment' | 'unlockable_content' | 'points';
  title: string;
  description: string;
  icon: string;
  criteria: {
    position?: number; // 1st, 2nd, 3rd place
    percentage?: number; // completion percentage
    streak?: number; // consecutive days
  };
  content?: {
    badgeImage?: string;
    unlockableFeature?: string;
    aiCompliment?: string;
    pointsValue?: number;
  };
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  teamId?: string;
  teamName?: string;
  progress: number;
  progressPercentage: number;
  rank: number;
  dailyAverage: number;
  streak: number;
  badges: string[];
  lastActive: Date;
}

export class CommunityChallengeEngine {

  /**
   * Create a new community challenge
   */
  async createChallenge(challengeData: Partial<Challenge>, creatorId: number): Promise<Challenge> {
    const challenge: Challenge = {
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: challengeData.title || 'Health Challenge',
      description: challengeData.description || 'A community health challenge',
      type: challengeData.type || 'community',
      category: challengeData.category || 'steps',
      target: challengeData.target || { value: 10000, unit: 'steps', metric: 'steps' },
      duration: challengeData.duration || {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        durationDays: 7
      },
      participants: [],
      teams: challengeData.type === 'team' ? [] : undefined,
      rewards: this.generateDefaultRewards(challengeData.category || 'steps'),
      status: 'upcoming',
      difficulty: challengeData.difficulty || 'medium',
      isPublic: challengeData.isPublic ?? true,
      createdBy: creatorId,
      createdAt: new Date()
    };

    return challenge;
  }

  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(userId: number): Promise<Challenge[]> {
    // In a real implementation, this would query the database
    // For now, return sample challenges
    return [
      {
        id: 'challenge_weekly_steps',
        title: 'Walk 30km This Week',
        description: 'Join your community in walking 30 kilometers over 7 days!',
        type: 'community',
        category: 'steps',
        target: { value: 30000, unit: 'steps', metric: 'steps' },
        duration: {
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          durationDays: 7
        },
        participants: await this.generateSampleParticipants(),
        rewards: this.generateDefaultRewards('steps'),
        status: 'active',
        difficulty: 'medium',
        isPublic: true,
        createdBy: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'challenge_team_hydration',
        title: 'Team Hydration Heroes',
        description: 'Work with your team to collectively drink 500 glasses of water!',
        type: 'team',
        category: 'hydration',
        target: { value: 500, unit: 'glasses', metric: 'water_intake' },
        duration: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          durationDays: 14
        },
        participants: await this.generateSampleParticipants(),
        teams: await this.generateSampleTeams(),
        rewards: this.generateDefaultRewards('hydration'),
        status: 'active',
        difficulty: 'easy',
        isPublic: true,
        createdBy: 1,
        createdAt: new Date()
      }
    ];
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: number, teamId?: string): Promise<boolean> {
    // In a real implementation, this would update the database
    console.log(`User ${userId} joining challenge ${challengeId}${teamId ? ` on team ${teamId}` : ''}`);
    return true;
  }

  /**
   * Leave a challenge
   */
  async leaveChallenge(challengeId: string, userId: number): Promise<boolean> {
    // In a real implementation, this would update the database
    console.log(`User ${userId} leaving challenge ${challengeId}`);
    return true;
  }

  /**
   * Update challenge progress for a user
   */
  async updateChallengeProgress(userId: number, metric: string, value: number, date: Date): Promise<void> {
    // This would be called whenever a user logs health data
    // Update progress in all active challenges that track this metric
    const activeChallenges = await this.getActiveChallenges(userId);
    
    for (const challenge of activeChallenges) {
      if (challenge.target.metric === metric) {
        await this.updateUserProgressInChallenge(challenge.id, userId, value, date);
      }
    }
  }

  /**
   * Get leaderboard for a challenge
   */
  async getChallengeLeaderboard(challengeId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    // Sample leaderboard data
    const sampleLeaderboard: LeaderboardEntry[] = [
      {
        userId: 1,
        username: 'FitnessChamp',
        progress: 28500,
        progressPercentage: 95,
        rank: 1,
        dailyAverage: 5700,
        streak: 5,
        badges: ['streak_master', 'top_performer'],
        lastActive: new Date()
      },
      {
        userId: 2,
        username: 'WalkingWarrior',
        progress: 26200,
        progressPercentage: 87,
        rank: 2,
        dailyAverage: 5240,
        streak: 4,
        badges: ['consistent_walker'],
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        userId: 3,
        username: 'HealthyHabits',
        progress: 24800,
        progressPercentage: 83,
        rank: 3,
        dailyAverage: 4960,
        streak: 6,
        badges: ['streak_master'],
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        userId: 4,
        username: 'StepCounter',
        progress: 22100,
        progressPercentage: 74,
        rank: 4,
        dailyAverage: 4420,
        streak: 2,
        badges: [],
        lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        userId: 5,
        username: 'ActiveUser',
        progress: 19800,
        progressPercentage: 66,
        rank: 5,
        dailyAverage: 3960,
        streak: 3,
        badges: ['newcomer'],
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];

    return sampleLeaderboard.slice(0, limit);
  }

  /**
   * Get team leaderboard for team challenges
   */
  async getTeamLeaderboard(challengeId: string): Promise<ChallengeTeam[]> {
    // Sample team leaderboard
    return [
      {
        id: 'team_1',
        name: 'Step Squad',
        members: [],
        totalProgress: 95200,
        averageProgress: 23800,
        rank: 1,
        badge: 'team_champions'
      },
      {
        id: 'team_2',
        name: 'Walking Warriors',
        members: [],
        totalProgress: 87600,
        averageProgress: 21900,
        rank: 2,
        badge: 'silver_steppers'
      },
      {
        id: 'team_3',
        name: 'Healthy Hustlers',
        members: [],
        totalProgress: 82400,
        averageProgress: 20600,
        rank: 3,
        badge: 'bronze_brigade'
      }
    ];
  }

  /**
   * Award rewards to challenge participants
   */
  async awardChallengeRewards(challengeId: string): Promise<void> {
    const leaderboard = await this.getChallengeLeaderboard(challengeId);
    
    // Award completion rewards
    for (const entry of leaderboard) {
      if (entry.progressPercentage >= 100) {
        await this.awardReward(entry.userId, 'completion_badge', challengeId);
      }
      
      if (entry.rank <= 3) {
        await this.awardReward(entry.userId, `place_${entry.rank}`, challengeId);
      }
      
      if (entry.streak >= 7) {
        await this.awardReward(entry.userId, 'streak_master', challengeId);
      }
    }
  }

  /**
   * Generate AI compliments for achievements
   */
  generateAICompliment(achievement: string, progress: number): string {
    const compliments = {
      completion: [
        `🎉 Incredible! You've completed the challenge! Your dedication is truly inspiring.`,
        `🌟 Amazing work! You've crossed the finish line with flying colors!`,
        `🏆 Outstanding achievement! You've shown what real commitment looks like.`
      ],
      streak: [
        `🔥 Your consistency is on fire! ${Math.floor(progress)} days in a row is phenomenal!`,
        `⚡ You're unstoppable! This streak shows your incredible willpower.`,
        `💪 What a streak! You're building habits that will last a lifetime.`
      ],
      progress: [
        `📈 Fantastic progress! You're ${progress}% of the way there!`,
        `🚀 Keep it up! Your momentum is building beautifully.`,
        `⭐ Every step counts, and you're taking all the right ones!`
      ]
    };

    const category = achievement as keyof typeof compliments;
    const messages = compliments[category] || compliments.progress;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Private helper methods
   */
  private generateDefaultRewards(category: string): ChallengeReward[] {
    return [
      {
        id: 'completion_badge',
        type: 'badge',
        title: 'Challenge Completed',
        description: 'Successfully completed the challenge!',
        icon: '🏆',
        criteria: { percentage: 100 },
        content: { badgeImage: '/badges/completion.svg' }
      },
      {
        id: 'place_1',
        type: 'badge',
        title: 'First Place Champion',
        description: 'Achieved 1st place in the challenge!',
        icon: '🥇',
        criteria: { position: 1 },
        content: { badgeImage: '/badges/gold.svg' }
      },
      {
        id: 'place_2',
        type: 'badge',
        title: 'Silver Medalist',
        description: 'Achieved 2nd place in the challenge!',
        icon: '🥈',
        criteria: { position: 2 },
        content: { badgeImage: '/badges/silver.svg' }
      },
      {
        id: 'place_3',
        type: 'badge',
        title: 'Bronze Achievement',
        description: 'Achieved 3rd place in the challenge!',
        icon: '🥉',
        criteria: { position: 3 },
        content: { badgeImage: '/badges/bronze.svg' }
      },
      {
        id: 'streak_master',
        type: 'ai_compliment',
        title: 'Streak Master',
        description: 'Maintained a 7-day streak!',
        icon: '🔥',
        criteria: { streak: 7 },
        content: { aiCompliment: 'Your consistency is incredible! This streak shows true dedication.' }
      }
    ];
  }

  private async generateSampleParticipants(): Promise<ChallengeParticipant[]> {
    return [
      {
        userId: 1,
        username: 'FitnessChamp',
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        currentProgress: 28500,
        dailyProgress: [
          { date: '2025-01-23', value: 5200 },
          { date: '2025-01-24', value: 6100 },
          { date: '2025-01-25', value: 5800 }
        ],
        rank: 1,
        badges: ['streak_master'],
        isActive: true
      },
      {
        userId: 2,
        username: 'WalkingWarrior',
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        currentProgress: 26200,
        dailyProgress: [
          { date: '2025-01-23', value: 4800 },
          { date: '2025-01-24', value: 5400 },
          { date: '2025-01-25', value: 5200 }
        ],
        rank: 2,
        badges: [],
        isActive: true
      }
    ];
  }

  private async generateSampleTeams(): Promise<ChallengeTeam[]> {
    return [
      {
        id: 'team_1',
        name: 'Step Squad',
        members: [],
        totalProgress: 95200,
        averageProgress: 23800,
        rank: 1,
        badge: 'team_champions'
      },
      {
        id: 'team_2',
        name: 'Walking Warriors',
        members: [],
        totalProgress: 87600,
        averageProgress: 21900,
        rank: 2
      }
    ];
  }

  private async updateUserProgressInChallenge(challengeId: string, userId: number, value: number, date: Date): Promise<void> {
    // Update user's progress in the specific challenge
    console.log(`Updating progress for user ${userId} in challenge ${challengeId}: +${value}`);
  }

  private async awardReward(userId: number, rewardType: string, challengeId: string): Promise<void> {
    // Award a specific reward to a user
    console.log(`Awarding ${rewardType} to user ${userId} for challenge ${challengeId}`);
  }
}

export const communityChallengeEngine = new CommunityChallengeEngine();