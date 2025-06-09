/**
 * Telehealth & Specialist Matching Engine
 * Connects users with healthcare professionals based on health data patterns
 * Matches with sleep coaches, trainers, nutritionists, and specialists
 */

import { storage } from './storage';
import { HealthMetric, HealthGoal } from '@shared/schema';

export interface HealthcareSpecialist {
  id: string;
  name: string;
  specialty: 'sleep_coach' | 'fitness_trainer' | 'nutritionist' | 'mental_health_therapist' | 'cardiologist' | 'endocrinologist' | 'general_practitioner';
  credentials: string[];
  experience: number; // years
  rating: number; // 1-5 stars
  reviewCount: number;
  availability: {
    timezone: string;
    schedule: {
      day: string;
      hours: { start: string; end: string; };
    }[];
    nextAvailable: Date;
  };
  services: {
    type: 'consultation' | 'ongoing_coaching' | 'assessment' | 'therapy_session';
    duration: number; // minutes
    price: number;
    description: string;
  }[];
  expertise: string[];
  languages: string[];
  telehealth: {
    platforms: string[];
    hasVideoConsultation: boolean;
    hasMessaging: boolean;
    hasPhoneConsultation: boolean;
  };
  matchingFactors: {
    ageGroups: string[];
    conditions: string[];
    goals: string[];
    experience: string[];
  };
  bio: string;
  education: string[];
  certifications: string[];
}

export interface MatchingCriteria {
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  preferredSpecialty: string[];
  healthConcerns: string[];
  goals: string[];
  budget: {
    min: number;
    max: number;
  };
  availability: {
    preferredTimes: string[];
    timezone: string;
  };
  preferences: {
    gender?: string;
    ageRange?: string;
    language: string;
    consultationType: 'video' | 'phone' | 'messaging';
  };
}

export interface SpecialistMatch {
  specialist: HealthcareSpecialist;
  matchScore: number; // 0-100
  matchReasons: string[];
  recommendedService: string;
  estimatedOutcome: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  dataInsights: {
    relevantMetrics: string[];
    concerningTrends: string[];
    strengthAreas: string[];
  };
  nextSteps: string[];
  costEstimate: {
    consultation: number;
    ongoingProgram?: number;
    insurance?: boolean;
  };
}

export interface ConsultationBooking {
  id: string;
  userId: number;
  specialistId: string;
  scheduledAt: Date;
  duration: number;
  serviceType: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  agenda: string[];
  preparationNotes: string[];
  healthDataSummary: string;
}

export class TelehealthMatchingEngine {

  /**
   * Find best specialist matches based on user's health data and preferences
   */
  async findSpecialistMatches(
    userId: number, 
    criteria: MatchingCriteria
  ): Promise<SpecialistMatch[]> {
    
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);
    const healthAnalysis = await this.analyzeHealthForMatching(healthMetrics, healthGoals);
    
    const availableSpecialists = await this.getAvailableSpecialists();
    const matches: SpecialistMatch[] = [];

    for (const specialist of availableSpecialists) {
      const matchScore = this.calculateMatchScore(specialist, criteria, healthAnalysis);
      
      if (matchScore >= 60) { // Only show good matches
        const match: SpecialistMatch = {
          specialist,
          matchScore,
          matchReasons: this.generateMatchReasons(specialist, criteria, healthAnalysis),
          recommendedService: this.selectBestService(specialist, criteria, healthAnalysis),
          estimatedOutcome: this.estimateOutcome(specialist, healthAnalysis),
          urgencyLevel: this.assessUrgency(healthAnalysis, criteria),
          dataInsights: {
            relevantMetrics: this.getRelevantMetrics(specialist, healthMetrics),
            concerningTrends: healthAnalysis.concerningTrends,
            strengthAreas: healthAnalysis.strengths
          },
          nextSteps: this.generateNextSteps(specialist, healthAnalysis),
          costEstimate: this.estimateCosts(specialist, criteria)
        };
        
        matches.push(match);
      }
    }

    // Sort by match score and urgency
    return matches.sort((a, b) => {
      const urgencyWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyWeight[b.urgencyLevel] - urgencyWeight[a.urgencyLevel];
      return urgencyDiff !== 0 ? urgencyDiff * 10 : b.matchScore - a.matchScore;
    });
  }

  /**
   * Generate intelligent consultation agenda based on user's health data
   */
  async generateConsultationAgenda(
    userId: number,
    specialistId: string,
    serviceType: string
  ): Promise<{
    agenda: string[];
    preparationNotes: string[];
    dataToShare: string[];
    questionsToAsk: string[];
  }> {
    
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);
    const specialist = await this.getSpecialistById(specialistId);
    
    if (!specialist) {
      throw new Error('Specialist not found');
    }

    const recentMetrics = healthMetrics.filter(m => {
      const daysAgo = (Date.now() - m.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30; // Last 30 days
    });

    const agenda = this.buildAgendaForSpecialty(specialist.specialty, recentMetrics, healthGoals);
    const preparationNotes = this.generatePreparationNotes(specialist.specialty, recentMetrics);
    const dataToShare = this.selectRelevantDataToShare(specialist.specialty, recentMetrics);
    const questionsToAsk = this.suggestQuestionsToAsk(specialist.specialty, healthGoals);

    return {
      agenda,
      preparationNotes,
      dataToShare,
      questionsToAsk
    };
  }

  /**
   * Book consultation with specialist
   */
  async bookConsultation(
    userId: number,
    specialistId: string,
    scheduledAt: Date,
    serviceType: string
  ): Promise<ConsultationBooking> {
    
    const agendaData = await this.generateConsultationAgenda(userId, specialistId, serviceType);
    const healthSummary = await this.generateHealthDataSummary(userId);

    const booking: ConsultationBooking = {
      id: `booking_${Date.now()}`,
      userId,
      specialistId,
      scheduledAt,
      duration: 60, // Default 60 minutes
      serviceType,
      status: 'scheduled',
      agenda: agendaData.agenda,
      preparationNotes: agendaData.preparationNotes,
      healthDataSummary: healthSummary
    };

    // In a real implementation, this would integrate with calendar systems
    return booking;
  }

  /**
   * Private helper methods
   */
  private async analyzeHealthForMatching(metrics: HealthMetric[], goals: HealthGoal[]) {
    const recentMetrics = metrics.filter(m => {
      const daysAgo = (Date.now() - m.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 14; // Last 2 weeks
    });

    // Analyze metrics for patterns
    const sleepMetrics = recentMetrics.filter(m => m.metricType === 'sleep');
    const exerciseMetrics = recentMetrics.filter(m => m.metricType === 'steps' || m.metricType === 'exercise');
    const heartRateMetrics = recentMetrics.filter(m => m.metricType === 'heart_rate');
    const moodMetrics = recentMetrics.filter(m => m.metricType === 'mood' || m.metricType === 'stress_level');

    const concerningTrends = [];
    const strengths = [];

    // Sleep analysis
    if (sleepMetrics.length > 0) {
      const avgSleep = sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length;
      if (avgSleep < 6.5) {
        concerningTrends.push('Chronic sleep deprivation');
      } else if (avgSleep >= 7.5) {
        strengths.push('Good sleep duration');
      }
    }

    // Exercise analysis
    if (exerciseMetrics.length > 0) {
      const avgSteps = exerciseMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / exerciseMetrics.length;
      if (avgSteps < 5000) {
        concerningTrends.push('Low physical activity');
      } else if (avgSteps >= 8000) {
        strengths.push('Good activity levels');
      }
    }

    // Heart rate analysis
    if (heartRateMetrics.length > 0) {
      const avgHR = heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length;
      if (avgHR > 85) {
        concerningTrends.push('Elevated resting heart rate');
      }
    }

    return {
      concerningTrends,
      strengths,
      primaryConcerns: this.identifyPrimaryConcerns(concerningTrends, goals),
      recommendedSpecialties: this.suggestSpecialties(concerningTrends, goals)
    };
  }

  private async getAvailableSpecialists(): Promise<HealthcareSpecialist[]> {
    // In a real implementation, this would query a database of healthcare providers
    return [
      {
        id: 'sleep_coach_1',
        name: 'Dr. Sarah Chen',
        specialty: 'sleep_coach',
        credentials: ['PhD Sleep Medicine', 'CBTI Certified'],
        experience: 8,
        rating: 4.9,
        reviewCount: 127,
        availability: {
          timezone: 'PST',
          schedule: [
            { day: 'Monday', hours: { start: '09:00', end: '17:00' } },
            { day: 'Wednesday', hours: { start: '09:00', end: '17:00' } },
            { day: 'Friday', hours: { start: '09:00', end: '17:00' } }
          ],
          nextAvailable: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
        services: [
          {
            type: 'consultation',
            duration: 60,
            price: 150,
            description: 'Comprehensive sleep assessment and personalized plan'
          },
          {
            type: 'ongoing_coaching',
            duration: 45,
            price: 120,
            description: 'Weekly coaching sessions for sleep optimization'
          }
        ],
        expertise: ['Sleep disorders', 'Insomnia', 'Sleep hygiene', 'Circadian rhythm disorders'],
        languages: ['English', 'Mandarin'],
        telehealth: {
          platforms: ['Zoom', 'Teams', 'Custom platform'],
          hasVideoConsultation: true,
          hasMessaging: true,
          hasPhoneConsultation: true
        },
        matchingFactors: {
          ageGroups: ['25-35', '35-45', '45-55'],
          conditions: ['insomnia', 'sleep_apnea', 'irregular_sleep'],
          goals: ['better_sleep', 'sleep_optimization', 'energy_improvement'],
          experience: ['tech_workers', 'shift_workers', 'entrepreneurs']
        },
        bio: 'Specializing in sleep optimization for busy professionals and entrepreneurs.',
        education: ['PhD Sleep Medicine - Stanford', 'MD - UCSF'],
        certifications: ['Board Certified Sleep Medicine', 'CBTI Certification']
      },
      {
        id: 'fitness_trainer_1',
        name: 'Marcus Johnson',
        specialty: 'fitness_trainer',
        credentials: ['NASM-CPT', 'Corrective Exercise Specialist'],
        experience: 6,
        rating: 4.7,
        reviewCount: 89,
        availability: {
          timezone: 'EST',
          schedule: [
            { day: 'Tuesday', hours: { start: '06:00', end: '20:00' } },
            { day: 'Thursday', hours: { start: '06:00', end: '20:00' } },
            { day: 'Saturday', hours: { start: '08:00', end: '16:00' } }
          ],
          nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        services: [
          {
            type: 'assessment',
            duration: 90,
            price: 100,
            description: 'Comprehensive fitness assessment and program design'
          },
          {
            type: 'ongoing_coaching',
            duration: 60,
            price: 80,
            description: 'Personal training and accountability coaching'
          }
        ],
        expertise: ['Weight loss', 'Strength training', 'Injury prevention', 'Functional movement'],
        languages: ['English', 'Spanish'],
        telehealth: {
          platforms: ['Zoom', 'FaceTime', 'Custom app'],
          hasVideoConsultation: true,
          hasMessaging: true,
          hasPhoneConsultation: false
        },
        matchingFactors: {
          ageGroups: ['20-30', '30-40', '40-50'],
          conditions: ['obesity', 'low_fitness', 'injury_recovery'],
          goals: ['weight_loss', 'strength_gain', 'fitness_improvement'],
          experience: ['beginners', 'intermediate', 'injury_recovery']
        },
        bio: 'Helping people build sustainable fitness habits and overcome physical limitations.',
        education: ['Exercise Science BS - University of Florida'],
        certifications: ['NASM-CPT', 'Corrective Exercise Specialist', 'Nutrition Coach']
      },
      {
        id: 'nutritionist_1',
        name: 'Emily Rodriguez, RD',
        specialty: 'nutritionist',
        credentials: ['Registered Dietitian', 'Sports Nutrition Specialist'],
        experience: 10,
        rating: 4.8,
        reviewCount: 156,
        availability: {
          timezone: 'CST',
          schedule: [
            { day: 'Monday', hours: { start: '08:00', end: '18:00' } },
            { day: 'Wednesday', hours: { start: '08:00', end: '18:00' } },
            { day: 'Friday', hours: { start: '08:00', end: '14:00' } }
          ],
          nextAvailable: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        services: [
          {
            type: 'consultation',
            duration: 75,
            price: 130,
            description: 'Comprehensive nutrition assessment and meal planning'
          },
          {
            type: 'ongoing_coaching',
            duration: 45,
            price: 90,
            description: 'Ongoing nutrition coaching and support'
          }
        ],
        expertise: ['Weight management', 'Sports nutrition', 'Digestive health', 'Meal planning'],
        languages: ['English', 'Spanish'],
        telehealth: {
          platforms: ['Zoom', 'Teams'],
          hasVideoConsultation: true,
          hasMessaging: true,
          hasPhoneConsultation: true
        },
        matchingFactors: {
          ageGroups: ['25-35', '35-45', '45-55', '55-65'],
          conditions: ['obesity', 'diabetes', 'digestive_issues', 'eating_disorders'],
          goals: ['weight_loss', 'muscle_gain', 'energy_improvement', 'health_optimization'],
          experience: ['athletes', 'busy_professionals', 'families']
        },
        bio: 'Registered Dietitian specializing in sustainable nutrition strategies for busy lifestyles.',
        education: ['MS Nutrition - Texas A&M', 'BS Dietetics - UT Austin'],
        certifications: ['Registered Dietitian', 'Sports Nutrition Specialist', 'Intuitive Eating Counselor']
      }
    ];
  }

  private calculateMatchScore(
    specialist: HealthcareSpecialist,
    criteria: MatchingCriteria,
    healthAnalysis: any
  ): number {
    let score = 0;

    // Specialty match (40% weight)
    if (criteria.preferredSpecialty.includes(specialist.specialty)) {
      score += 40;
    } else if (healthAnalysis.recommendedSpecialties.includes(specialist.specialty)) {
      score += 30;
    }

    // Health concerns match (30% weight)
    const concernMatch = criteria.healthConcerns.filter(concern =>
      specialist.expertise.some(exp => exp.toLowerCase().includes(concern.toLowerCase()))
    ).length;
    score += (concernMatch / criteria.healthConcerns.length) * 30;

    // Availability match (15% weight)
    if (specialist.availability.nextAvailable <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      score += 15;
    } else if (specialist.availability.nextAvailable <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) {
      score += 10;
    }

    // Rating and experience (15% weight)
    score += (specialist.rating / 5) * 10;
    score += Math.min(specialist.experience / 10, 1) * 5;

    return Math.round(score);
  }

  private generateMatchReasons(
    specialist: HealthcareSpecialist,
    criteria: MatchingCriteria,
    healthAnalysis: any
  ): string[] {
    const reasons = [];

    if (criteria.preferredSpecialty.includes(specialist.specialty)) {
      reasons.push(`Matches your preferred specialty: ${specialist.specialty.replace('_', ' ')}`);
    }

    if (specialist.rating >= 4.5) {
      reasons.push(`Highly rated (${specialist.rating}/5) with ${specialist.reviewCount} reviews`);
    }

    if (specialist.experience >= 5) {
      reasons.push(`Experienced professional with ${specialist.experience} years in practice`);
    }

    const matchingExpertise = specialist.expertise.filter(exp =>
      criteria.healthConcerns.some(concern => exp.toLowerCase().includes(concern.toLowerCase()))
    );
    
    if (matchingExpertise.length > 0) {
      reasons.push(`Specializes in: ${matchingExpertise.join(', ')}`);
    }

    return reasons;
  }

  private selectBestService(
    specialist: HealthcareSpecialist,
    criteria: MatchingCriteria,
    healthAnalysis: any
  ): string {
    if (criteria.urgency === 'high' || criteria.urgency === 'urgent') {
      return specialist.services.find(s => s.type === 'consultation')?.description || 'Initial consultation';
    }
    
    return specialist.services.find(s => s.type === 'ongoing_coaching')?.description || 
           specialist.services[0]?.description || 'Consultation';
  }

  private estimateOutcome(specialist: HealthcareSpecialist, healthAnalysis: any): string {
    const outcomes = {
      sleep_coach: 'Improved sleep quality and energy levels within 4-6 weeks',
      fitness_trainer: 'Noticeable strength and fitness improvements within 6-8 weeks',
      nutritionist: 'Better energy and potential weight changes within 4-6 weeks',
      mental_health_therapist: 'Improved stress management and mood within 6-8 weeks'
    };
    
    return outcomes[specialist.specialty] || 'Personalized health improvements based on your goals';
  }

  private assessUrgency(healthAnalysis: any, criteria: MatchingCriteria): 'low' | 'medium' | 'high' | 'urgent' {
    if (criteria.urgency === 'urgent') return 'urgent';
    
    const criticalConcerns = ['chronic_sleep_deprivation', 'elevated_heart_rate', 'severe_mood_issues'];
    const hasCriticalConcerns = healthAnalysis.concerningTrends.some((trend: string) =>
      criticalConcerns.some(critical => trend.toLowerCase().includes(critical.toLowerCase()))
    );
    
    if (hasCriticalConcerns) return 'high';
    if (healthAnalysis.concerningTrends.length >= 2) return 'medium';
    return 'low';
  }

  private getRelevantMetrics(specialist: HealthcareSpecialist, metrics: HealthMetric[]): string[] {
    const relevantMetrics: Record<string, string[]> = {
      sleep_coach: ['sleep', 'heart_rate_variability', 'stress_level'],
      fitness_trainer: ['steps', 'heart_rate', 'weight', 'exercise'],
      nutritionist: ['weight', 'energy_level', 'water_intake', 'nutrition'],
      mental_health_therapist: ['mood', 'stress_level', 'sleep', 'anxiety']
    };
    
    const relevant = relevantMetrics[specialist.specialty] || [];
    return metrics
      .filter(m => relevant.includes(m.metricType))
      .map(m => m.metricType)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  private generateNextSteps(specialist: HealthcareSpecialist, healthAnalysis: any): string[] {
    return [
      'Book initial consultation',
      'Prepare health data summary',
      'List specific goals and concerns',
      'Schedule follow-up appointments',
      'Begin recommended program'
    ];
  }

  private estimateCosts(specialist: HealthcareSpecialist, criteria: MatchingCriteria) {
    const consultation = specialist.services.find(s => s.type === 'consultation')?.price || 100;
    const ongoing = specialist.services.find(s => s.type === 'ongoing_coaching')?.price;
    
    return {
      consultation,
      ongoingProgram: ongoing ? ongoing * 4 : undefined, // 4 sessions
      insurance: false // Would check insurance coverage
    };
  }

  private identifyPrimaryConcerns(concerningTrends: string[], goals: HealthGoal[]): string[] {
    return concerningTrends.concat(goals.filter(g => g.progress < 30).map(g => g.metricType));
  }

  private suggestSpecialties(concerningTrends: string[], goals: HealthGoal[]): string[] {
    const specialties = [];
    
    if (concerningTrends.some(t => t.includes('sleep'))) {
      specialties.push('sleep_coach');
    }
    if (concerningTrends.some(t => t.includes('activity') || t.includes('fitness'))) {
      specialties.push('fitness_trainer');
    }
    if (concerningTrends.some(t => t.includes('weight') || t.includes('nutrition'))) {
      specialties.push('nutritionist');
    }
    if (concerningTrends.some(t => t.includes('stress') || t.includes('mood'))) {
      specialties.push('mental_health_therapist');
    }
    
    return specialties;
  }

  private async getSpecialistById(specialistId: string): Promise<HealthcareSpecialist | null> {
    const specialists = await this.getAvailableSpecialists();
    return specialists.find(s => s.id === specialistId) || null;
  }

  private buildAgendaForSpecialty(specialty: string, metrics: HealthMetric[], goals: HealthGoal[]): string[] {
    const agendas: Record<string, string[]> = {
      sleep_coach: [
        'Review sleep patterns and quality trends',
        'Discuss current sleep routine and environment',
        'Identify sleep disruption factors',
        'Create personalized sleep optimization plan',
        'Set sleep hygiene goals and tracking methods'
      ],
      fitness_trainer: [
        'Assess current fitness level and limitations',
        'Review exercise history and preferences',
        'Discuss specific fitness goals',
        'Design personalized workout program',
        'Plan progression and accountability check-ins'
      ],
      nutritionist: [
        'Review current eating patterns and habits',
        'Analyze nutritional gaps and imbalances',
        'Discuss food preferences and restrictions',
        'Create personalized meal planning strategy',
        'Set nutrition goals and tracking methods'
      ]
    };
    
    return agendas[specialty] || ['Comprehensive health assessment', 'Goal setting', 'Personalized plan creation'];
  }

  private generatePreparationNotes(specialty: string, metrics: HealthMetric[]): string[] {
    return [
      'Compile last 30 days of health data',
      'List current medications and supplements',
      'Note specific concerns or symptoms',
      'Prepare questions about your health goals',
      'Have recent lab results available if applicable'
    ];
  }

  private selectRelevantDataToShare(specialty: string, metrics: HealthMetric[]): string[] {
    const dataToShare: Record<string, string[]> = {
      sleep_coach: ['Sleep duration and quality', 'Bedtime and wake time patterns', 'Sleep environment factors'],
      fitness_trainer: ['Activity levels and exercise history', 'Heart rate trends', 'Strength and mobility assessments'],
      nutritionist: ['Eating patterns and meal timing', 'Food preferences and restrictions', 'Energy levels throughout day']
    };
    
    return dataToShare[specialty] || ['General health metrics', 'Goal progress', 'Lifestyle factors'];
  }

  private suggestQuestionsToAsk(specialty: string, goals: HealthGoal[]): string[] {
    const questions: Record<string, string[]> = {
      sleep_coach: [
        'What is the most effective sleep schedule for my lifestyle?',
        'How can I improve my sleep quality naturally?',
        'What sleep tracking methods do you recommend?'
      ],
      fitness_trainer: [
        'What type of exercise program best fits my goals?',
        'How can I stay motivated and consistent?',
        'What should I expect in terms of progress timeline?'
      ],
      nutritionist: [
        'What eating pattern works best for my lifestyle?',
        'How can I improve my energy levels through nutrition?',
        'What supplements, if any, would benefit me?'
      ]
    };
    
    return questions[specialty] || ['What should I expect from our work together?', 'How will we track progress?'];
  }

  private async generateHealthDataSummary(userId: number): Promise<string> {
    const metrics = await storage.getHealthMetrics(userId);
    const goals = await storage.getHealthGoals(userId);
    
    return `Health Summary: ${metrics.length} recorded metrics over recent period. ${goals.length} active health goals with varying progress levels. Key areas of focus include sleep optimization, fitness improvement, and stress management.`;
  }
}

export const telehealthMatchingEngine = new TelehealthMatchingEngine();