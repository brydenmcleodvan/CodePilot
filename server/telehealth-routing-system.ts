/**
 * Telehealth Routing System - Live Care Layer
 * Automatically connects users to medical professionals based on AI risk flags and health data
 */

import { riskDetectionEngine } from './risk-detection-engine.js';
import { healthReportGenerator } from './health-report-generator.js';
import { storage } from './storage.js';

export interface TelehealthProvider {
  id: string;
  name: string;
  specialty: string[];
  availability: {
    timezone: string;
    schedule: {
      [day: string]: { start: string; end: string; }[];
    };
  };
  credentials: {
    license: string;
    certifications: string[];
    experience: string;
  };
  rating: number;
  consultationTypes: ('emergency' | 'routine' | 'follow-up' | 'mental-health')[];
  languages: string[];
  profilePhoto?: string;
  bio: string;
}

export interface TelehealthSession {
  id: string;
  userId: number;
  providerId: string;
  type: 'emergency' | 'routine' | 'follow-up' | 'mental-health';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  scheduledAt: Date;
  duration: number; // minutes
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  meetingUrl?: string;
  sessionNotes?: string;
  followUpRequired: boolean;
  cost: number;
  healthSummaryGenerated: boolean;
  triggerEvent?: {
    type: 'ai_alert' | 'user_request' | 'coach_referral';
    description: string;
    severity: string;
  };
}

export interface TelehealthTriage {
  userId: number;
  healthFlags: string[];
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  recommendedSpecialty: string;
  reasonForReferral: string;
  suggestedProviders: TelehealthProvider[];
  autoSchedule: boolean;
  estimatedWaitTime: string;
}

export class TelehealthRoutingSystem {
  private providers: Map<string, TelehealthProvider> = new Map();
  private activeSessions: Map<string, TelehealthSession> = new Map();
  
  // Specialty mapping based on health flags
  private readonly specialtyRouting = {
    // Cardiovascular specialists
    'high_heart_rate': 'cardiologist',
    'irregular_heartbeat': 'cardiologist',
    'hypertension_risk': 'cardiologist',
    'cardiac_anomaly': 'cardiologist',
    
    // Endocrinology specialists
    'diabetes_risk': 'endocrinologist',
    'high_glucose': 'endocrinologist',
    'metabolic_syndrome': 'endocrinologist',
    'thyroid_dysfunction': 'endocrinologist',
    
    // Mental health specialists
    'depression_risk': 'mental_health_therapist',
    'anxiety_elevated': 'mental_health_therapist',
    'stress_chronic': 'mental_health_therapist',
    'sleep_disorder': 'mental_health_therapist',
    
    // General practitioners
    'weight_gain_rapid': 'general_practitioner',
    'activity_decline': 'general_practitioner',
    'general_wellness': 'general_practitioner',
    'routine_checkup': 'general_practitioner',
    
    // Specialists
    'sleep_apnea_risk': 'sleep_specialist',
    'nutrition_deficiency': 'nutritionist',
    'fitness_plateau': 'fitness_trainer'
  };

  private readonly urgencyLevels = {
    critical: {
      flags: ['cardiac_emergency', 'severe_hypertension', 'diabetic_crisis'],
      maxWaitTime: 15, // minutes
      autoSchedule: true
    },
    high: {
      flags: ['high_heart_rate', 'irregular_heartbeat', 'high_glucose'],
      maxWaitTime: 60, // minutes
      autoSchedule: false
    },
    medium: {
      flags: ['weight_gain_rapid', 'activity_decline', 'sleep_disorder'],
      maxWaitTime: 240, // 4 hours
      autoSchedule: false
    },
    low: {
      flags: ['general_wellness', 'routine_checkup'],
      maxWaitTime: 1440, // 24 hours
      autoSchedule: false
    }
  };

  constructor() {
    this.initializeProviders();
  }

  /**
   * Main triage function - analyzes health data and routes to appropriate care
   */
  async performTriage(userId: number, healthFlags: string[], triggerEvent?: any): Promise<TelehealthTriage> {
    try {
      // Determine urgency level
      const urgencyLevel = this.determineUrgency(healthFlags);
      
      // Find appropriate specialty
      const recommendedSpecialty = this.determineSpecialty(healthFlags);
      
      // Get available providers
      const suggestedProviders = await this.findAvailableProviders(recommendedSpecialty, urgencyLevel);
      
      // Generate reason for referral
      const reasonForReferral = this.generateReferralReason(healthFlags, urgencyLevel);
      
      // Determine if auto-scheduling is needed
      const autoSchedule = urgencyLevel === 'critical';
      
      // Calculate estimated wait time
      const estimatedWaitTime = this.calculateWaitTime(urgencyLevel, suggestedProviders);

      const triage: TelehealthTriage = {
        userId,
        healthFlags,
        urgencyLevel,
        recommendedSpecialty,
        reasonForReferral,
        suggestedProviders,
        autoSchedule,
        estimatedWaitTime
      };

      // Log triage decision
      console.log(`Telehealth triage for user ${userId}:`, {
        urgency: urgencyLevel,
        specialty: recommendedSpecialty,
        flags: healthFlags,
        autoSchedule
      });

      // If critical, automatically attempt to schedule
      if (autoSchedule && suggestedProviders.length > 0) {
        await this.attemptEmergencyScheduling(userId, triage, triggerEvent);
      }

      return triage;

    } catch (error) {
      console.error('Telehealth triage error:', error);
      
      // Fallback to general practitioner for any error
      return {
        userId,
        healthFlags,
        urgencyLevel: 'medium',
        recommendedSpecialty: 'general_practitioner',
        reasonForReferral: 'Health monitoring alert - requires medical review',
        suggestedProviders: await this.findAvailableProviders('general_practitioner', 'medium'),
        autoSchedule: false,
        estimatedWaitTime: '4 hours'
      };
    }
  }

  /**
   * Schedule a telehealth session
   */
  async scheduleSession(
    userId: number,
    providerId: string,
    type: TelehealthSession['type'],
    urgency: TelehealthSession['urgency'],
    preferredTime?: Date,
    triggerEvent?: any
  ): Promise<TelehealthSession> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Generate pre-visit health summary
    const healthSummary = await this.generatePreVisitSummary(userId);

    const session: TelehealthSession = {
      id: `session_${Date.now()}_${userId}`,
      userId,
      providerId,
      type,
      urgency,
      scheduledAt: preferredTime || this.getNextAvailableSlot(provider),
      duration: this.getSessionDuration(type, urgency),
      status: 'scheduled',
      meetingUrl: await this.generateMeetingUrl(providerId),
      followUpRequired: urgency === 'critical' || urgency === 'high',
      cost: this.calculateSessionCost(type, urgency, provider),
      healthSummaryGenerated: true,
      triggerEvent
    };

    this.activeSessions.set(session.id, session);

    // Send notifications
    await this.sendSessionNotifications(session, provider, healthSummary);

    console.log(`Telehealth session scheduled: ${session.id} for user ${userId} with ${provider.name}`);

    return session;
  }

  /**
   * Generate comprehensive pre-visit summary
   */
  async generatePreVisitSummary(userId: number): Promise<string> {
    try {
      // Get user's health data
      const user = await storage.getUser(userId);
      const healthMetrics = await storage.getUserHealthMetrics(userId);
      const healthGoals = await storage.getUserGoals(userId);
      const recentAlerts = await this.getRecentHealthAlerts(userId);

      // Generate summary using health report generator
      const summary = await healthReportGenerator.generateSummaryReport(
        user,
        healthMetrics,
        healthGoals,
        'physician' // Professional format for doctors
      );

      return summary;

    } catch (error) {
      console.error('Pre-visit summary generation error:', error);
      return 'Health summary generation failed - manual review required';
    }
  }

  /**
   * Determine urgency level based on health flags
   */
  private determineUrgency(healthFlags: string[]): 'critical' | 'high' | 'medium' | 'low' {
    for (const [level, config] of Object.entries(this.urgencyLevels)) {
      if (healthFlags.some(flag => config.flags.includes(flag))) {
        return level as 'critical' | 'high' | 'medium' | 'low';
      }
    }
    return 'low';
  }

  /**
   * Determine appropriate medical specialty
   */
  private determineSpecialty(healthFlags: string[]): string {
    const specialtyCount: { [key: string]: number } = {};

    healthFlags.forEach(flag => {
      const specialty = this.specialtyRouting[flag] || 'general_practitioner';
      specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
    });

    // Return specialty with highest count
    return Object.entries(specialtyCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general_practitioner';
  }

  /**
   * Find available providers for specialty and urgency
   */
  private async findAvailableProviders(
    specialty: string,
    urgency: 'critical' | 'high' | 'medium' | 'low'
  ): Promise<TelehealthProvider[]> {
    const providers = Array.from(this.providers.values())
      .filter(provider => 
        provider.specialty.includes(specialty) ||
        provider.specialty.includes('general_practitioner')
      )
      .sort((a, b) => b.rating - a.rating);

    // For critical urgency, return all available providers
    if (urgency === 'critical') {
      return providers.slice(0, 5);
    }

    // For other urgencies, filter by availability
    return providers.slice(0, 3);
  }

  /**
   * Generate human-readable referral reason
   */
  private generateReferralReason(healthFlags: string[], urgency: string): string {
    const flagDescriptions = {
      'high_heart_rate': 'elevated heart rate detected',
      'irregular_heartbeat': 'irregular heart rhythm patterns',
      'high_glucose': 'blood glucose levels above normal range',
      'diabetes_risk': 'elevated diabetes risk indicators',
      'hypertension_risk': 'blood pressure concerns',
      'depression_risk': 'mental health screening flags',
      'anxiety_elevated': 'elevated anxiety indicators',
      'weight_gain_rapid': 'significant weight changes',
      'sleep_disorder': 'sleep pattern irregularities',
      'activity_decline': 'decreased physical activity levels'
    };

    const descriptions = healthFlags
      .map(flag => flagDescriptions[flag] || flag.replace(/_/g, ' '))
      .join(', ');

    const urgencyText = {
      critical: 'Immediate medical attention required due to',
      high: 'Prompt medical consultation recommended for',
      medium: 'Medical review suggested for',
      low: 'Routine consultation for'
    };

    return `${urgencyText[urgency]} ${descriptions}. AI health monitoring has flagged these concerns for professional evaluation.`;
  }

  /**
   * Calculate estimated wait time
   */
  private calculateWaitTime(urgency: string, providers: TelehealthProvider[]): string {
    const baseWaitTimes = {
      critical: '5-15 minutes',
      high: '30-60 minutes',
      medium: '2-4 hours',
      low: '24-48 hours'
    };

    if (providers.length === 0) {
      return 'No providers available';
    }

    return baseWaitTimes[urgency] || baseWaitTimes.medium;
  }

  /**
   * Attempt emergency scheduling for critical cases
   */
  private async attemptEmergencyScheduling(
    userId: number,
    triage: TelehealthTriage,
    triggerEvent?: any
  ): Promise<void> {
    if (triage.suggestedProviders.length === 0) {
      console.error(`No emergency providers available for user ${userId}`);
      return;
    }

    try {
      const session = await this.scheduleSession(
        userId,
        triage.suggestedProviders[0].id,
        'emergency',
        'critical',
        new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        triggerEvent
      );

      console.log(`Emergency session auto-scheduled: ${session.id}`);

    } catch (error) {
      console.error('Emergency scheduling failed:', error);
    }
  }

  /**
   * Generate secure meeting URL
   */
  private async generateMeetingUrl(providerId: string): Promise<string> {
    // In production, integrate with Doxy.me, Zoom Health, or custom WebRTC
    // For now, return a placeholder secure URL
    const sessionId = `hm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return `https://secure.healthmap.video/session/${sessionId}`;
  }

  /**
   * Calculate session cost based on type and urgency
   */
  private calculateSessionCost(
    type: TelehealthSession['type'],
    urgency: TelehealthSession['urgency'],
    provider: TelehealthProvider
  ): number {
    const baseCosts = {
      emergency: 150,
      routine: 75,
      'follow-up': 50,
      'mental-health': 100
    };

    const urgencyMultiplier = {
      critical: 1.5,
      high: 1.2,
      medium: 1.0,
      low: 0.8
    };

    return Math.round(baseCosts[type] * urgencyMultiplier[urgency]);
  }

  /**
   * Get session duration based on type and urgency
   */
  private getSessionDuration(type: TelehealthSession['type'], urgency: string): number {
    const durations = {
      emergency: 30,
      routine: 20,
      'follow-up': 15,
      'mental-health': 45
    };

    return durations[type] || 20;
  }

  /**
   * Get next available slot for provider
   */
  private getNextAvailableSlot(provider: TelehealthProvider): Date {
    // Simplified - in production, check actual calendar availability
    return new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  }

  /**
   * Send session notifications
   */
  private async sendSessionNotifications(
    session: TelehealthSession,
    provider: TelehealthProvider,
    healthSummary: string
  ): Promise<void> {
    try {
      const user = await storage.getUser(session.userId);
      
      // Send email to user
      console.log(`Sending session confirmation to ${user.email}`);
      
      // Send health summary to provider
      console.log(`Sending pre-visit summary to provider ${provider.name}`);
      
      // In production, implement actual email sending here

    } catch (error) {
      console.error('Notification sending failed:', error);
    }
  }

  /**
   * Get recent health alerts for user
   */
  private async getRecentHealthAlerts(userId: number): Promise<any[]> {
    // Get recent alerts from risk detection engine
    try {
      const healthMetrics = await storage.getUserHealthMetrics(userId);
      const alerts = riskDetectionEngine.detectAnomalies(healthMetrics[0], healthMetrics[1]);
      return alerts.slice(0, 5); // Last 5 alerts
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }

  /**
   * Initialize sample providers
   */
  private initializeProviders(): void {
    const sampleProviders: TelehealthProvider[] = [
      {
        id: 'dr_smith_cardio',
        name: 'Dr. Sarah Smith',
        specialty: ['cardiologist', 'general_practitioner'],
        availability: {
          timezone: 'EST',
          schedule: {
            'monday': [{ start: '09:00', end: '17:00' }],
            'tuesday': [{ start: '09:00', end: '17:00' }],
            'wednesday': [{ start: '09:00', end: '17:00' }],
            'thursday': [{ start: '09:00', end: '17:00' }],
            'friday': [{ start: '09:00', end: '15:00' }]
          }
        },
        credentials: {
          license: 'MD-12345',
          certifications: ['Board Certified Cardiologist', 'Internal Medicine'],
          experience: '15 years'
        },
        rating: 4.8,
        consultationTypes: ['emergency', 'routine', 'follow-up'],
        languages: ['English', 'Spanish'],
        bio: 'Experienced cardiologist specializing in preventive cardiac care and heart disease management.'
      },
      {
        id: 'dr_jones_endo',
        name: 'Dr. Michael Jones',
        specialty: ['endocrinologist'],
        availability: {
          timezone: 'EST',
          schedule: {
            'monday': [{ start: '08:00', end: '16:00' }],
            'wednesday': [{ start: '08:00', end: '16:00' }],
            'friday': [{ start: '08:00', end: '16:00' }]
          }
        },
        credentials: {
          license: 'MD-23456',
          certifications: ['Board Certified Endocrinologist', 'Diabetes Specialist'],
          experience: '12 years'
        },
        rating: 4.9,
        consultationTypes: ['routine', 'follow-up'],
        languages: ['English'],
        bio: 'Diabetes and metabolic disorder specialist with focus on preventive endocrinology.'
      },
      {
        id: 'dr_williams_mental',
        name: 'Dr. Lisa Williams',
        specialty: ['mental_health_therapist'],
        availability: {
          timezone: 'EST',
          schedule: {
            'monday': [{ start: '10:00', end: '18:00' }],
            'tuesday': [{ start: '10:00', end: '18:00' }],
            'wednesday': [{ start: '10:00', end: '18:00' }],
            'thursday': [{ start: '10:00', end: '18:00' }]
          }
        },
        credentials: {
          license: 'LCSW-34567',
          certifications: ['Licensed Clinical Social Worker', 'Cognitive Behavioral Therapy'],
          experience: '10 years'
        },
        rating: 4.7,
        consultationTypes: ['routine', 'mental-health'],
        languages: ['English', 'French'],
        bio: 'Licensed therapist specializing in anxiety, depression, and stress management.'
      }
    ];

    sampleProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });

    console.log(`Initialized ${sampleProviders.length} telehealth providers`);
  }

  // Public methods for API endpoints
  async getTriage(userId: number, healthFlags: string[]): Promise<TelehealthTriage> {
    return this.performTriage(userId, healthFlags);
  }

  async getAvailableProviders(specialty?: string): Promise<TelehealthProvider[]> {
    if (specialty) {
      return Array.from(this.providers.values())
        .filter(provider => provider.specialty.includes(specialty));
    }
    return Array.from(this.providers.values());
  }

  async getSession(sessionId: string): Promise<TelehealthSession | undefined> {
    return this.activeSessions.get(sessionId);
  }

  async getUserSessions(userId: number): Promise<TelehealthSession[]> {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);
  }
}

// Export singleton instance
export const telehealthRoutingSystem = new TelehealthRoutingSystem();