/**
 * Smart Coaching Marketplace
 * Connects users with certified health coaches for personalized guidance
 */

class SmartCoachingMarketplace {
  constructor() {
    this.coaches = new Map();
    this.coachingSessions = new Map();
    this.matchmakingEngine = new CoachMatchmakingEngine();
    this.commissionRate = 0.15; // 15% platform commission
    this.specialties = [
      'weight_loss', 'muscle_building', 'nutrition', 'mental_health',
      'sleep_optimization', 'stress_management', 'chronic_disease',
      'sports_performance', 'women_health', 'seniors_wellness'
    ];
  }

  /**
   * Register a new health coach on the platform
   */
  async registerCoach(coachData) {
    try {
      const coach = {
        id: `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...coachData,
        status: 'pending_verification',
        rating: 0,
        totalSessions: 0,
        earnings: 0,
        verificationDocuments: coachData.certifications || [],
        availability: {
          timezone: coachData.timezone || 'UTC',
          schedule: coachData.schedule || {},
          maxClientsPerWeek: coachData.maxClients || 20
        },
        specialties: coachData.specialties || [],
        pricing: {
          hourlyRate: coachData.hourlyRate || 75,
          packageDeals: coachData.packages || [],
          acceptsInsurance: coachData.acceptsInsurance || false
        },
        createdAt: new Date().toISOString()
      };

      this.coaches.set(coach.id, coach);

      // Queue verification process
      await this.queueCoachVerification(coach.id);

      return {
        success: true,
        coachId: coach.id,
        message: 'Coach registration submitted for verification',
        estimatedVerificationTime: '3-5 business days'
      };

    } catch (error) {
      console.error('Coach registration error:', error);
      throw new Error(`Failed to register coach: ${error.message}`);
    }
  }

  /**
   * Find matching coaches for a user based on their health profile
   */
  async findMatchingCoaches(userId, userPreferences = {}) {
    try {
      // Get user's health data and goals
      const userProfile = await this.getUserHealthProfile(userId);
      
      // Use matchmaking engine to find compatible coaches
      const matches = await this.matchmakingEngine.findMatches(userProfile, userPreferences);
      
      // Enhance matches with real-time availability
      const enhancedMatches = await Promise.all(
        matches.map(async (match) => {
          const availability = await this.getCoachAvailability(match.coachId);
          return {
            ...match,
            nextAvailable: availability.nextSlot,
            responseTime: availability.avgResponseTime,
            currentLoad: availability.currentClients
          };
        })
      );

      // Sort by compatibility score and availability
      enhancedMatches.sort((a, b) => {
        if (a.compatibilityScore !== b.compatibilityScore) {
          return b.compatibilityScore - a.compatibilityScore;
        }
        return a.currentLoad - b.currentLoad; // Prefer less busy coaches
      });

      return {
        success: true,
        matches: enhancedMatches.slice(0, 10), // Top 10 matches
        totalMatches: enhancedMatches.length,
        matchingCriteria: userPreferences
      };

    } catch (error) {
      console.error('Coach matching error:', error);
      throw new Error(`Failed to find matching coaches: ${error.message}`);
    }
  }

  /**
   * Book a coaching session
   */
  async bookCoachingSession(userId, coachId, sessionData) {
    try {
      const coach = this.coaches.get(coachId);
      if (!coach || coach.status !== 'verified') {
        throw new Error('Coach not available');
      }

      // Check coach availability
      const isAvailable = await this.checkCoachAvailability(coachId, sessionData.scheduledTime);
      if (!isAvailable) {
        throw new Error('Coach not available at requested time');
      }

      const session = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        coachId,
        type: sessionData.type || 'consultation', // consultation, follow_up, package
        scheduledTime: sessionData.scheduledTime,
        duration: sessionData.duration || 60, // minutes
        status: 'scheduled',
        price: this.calculateSessionPrice(coach, sessionData),
        platform: sessionData.platform || 'video_call',
        goals: sessionData.goals || [],
        healthDataAccess: sessionData.shareHealthData || false,
        notes: sessionData.notes || '',
        createdAt: new Date().toISOString()
      };

      this.coachingSessions.set(session.id, session);

      // Process payment
      const paymentResult = await this.processSessionPayment(session);
      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // Send notifications
      await this.sendSessionNotifications(session);

      // Update coach availability
      await this.updateCoachAvailability(coachId, sessionData.scheduledTime, sessionData.duration);

      return {
        success: true,
        sessionId: session.id,
        session,
        paymentId: paymentResult.paymentId,
        message: 'Coaching session booked successfully'
      };

    } catch (error) {
      console.error('Session booking error:', error);
      throw new Error(`Failed to book session: ${error.message}`);
    }
  }

  /**
   * Get anonymized user data for coaches
   */
  async getAnonymizedUserData(userId, coachId, sessionId) {
    try {
      // Verify coach has permission to access this user's data
      const session = this.coachingSessions.get(sessionId);
      if (!session || session.coachId !== coachId || session.userId !== userId) {
        throw new Error('Unauthorized access to user data');
      }

      if (!session.healthDataAccess) {
        return {
          success: false,
          message: 'User has not granted health data access'
        };
      }

      // Get user's health data and anonymize it
      const healthData = await this.getUserHealthData(userId);
      const anonymizedData = this.anonymizeHealthData(healthData, userId);

      return {
        success: true,
        data: anonymizedData,
        dataTypes: ['sleep', 'exercise', 'nutrition', 'mood', 'vitals'],
        timeframe: '30 days',
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Data access error:', error);
      throw new Error(`Failed to get user data: ${error.message}`);
    }
  }

  /**
   * Send message between coach and client
   */
  async sendCoachingMessage(sessionId, senderId, message, messageType = 'text') {
    try {
      const session = this.coachingSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Verify sender is part of this session
      if (senderId !== session.userId && senderId !== session.coachId) {
        throw new Error('Unauthorized message sender');
      }

      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        senderId,
        senderType: senderId === session.coachId ? 'coach' : 'client',
        content: message,
        type: messageType, // text, image, document, workout_plan, meal_plan
        timestamp: new Date().toISOString(),
        read: false
      };

      // Store message (in production, this would go to database)
      if (!session.messages) {
        session.messages = [];
      }
      session.messages.push(messageData);

      // Send real-time notification
      await this.sendMessageNotification(messageData, session);

      return {
        success: true,
        messageId: messageData.id,
        message: messageData
      };

    } catch (error) {
      console.error('Message sending error:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Complete coaching session and handle ratings
   */
  async completeCoachingSession(sessionId, completionData) {
    try {
      const session = this.coachingSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update session
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      session.duration = completionData.actualDuration || session.duration;
      session.outcome = completionData.outcome || '';
      session.nextSteps = completionData.nextSteps || [];

      // Process ratings
      if (completionData.clientRating) {
        await this.processClientRating(session.coachId, completionData.clientRating);
      }

      // Calculate and distribute earnings
      const earnings = await this.calculateCoachEarnings(session);
      await this.processCoachPayment(session.coachId, earnings);

      // Update coach stats
      await this.updateCoachStats(session.coachId, session);

      return {
        success: true,
        session,
        coachEarnings: earnings,
        message: 'Session completed successfully'
      };

    } catch (error) {
      console.error('Session completion error:', error);
      throw new Error(`Failed to complete session: ${error.message}`);
    }
  }

  /**
   * Get coach analytics and earnings
   */
  async getCoachAnalytics(coachId, timeframe = '30d') {
    try {
      const coach = this.coaches.get(coachId);
      if (!coach) {
        throw new Error('Coach not found');
      }

      // Get sessions for timeframe
      const sessions = Array.from(this.coachingSessions.values())
        .filter(session => session.coachId === coachId)
        .filter(session => this.isWithinTimeframe(session.createdAt, timeframe));

      const analytics = {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        totalEarnings: sessions.reduce((sum, s) => sum + (s.coachEarnings || 0), 0),
        averageRating: coach.rating,
        clientRetentionRate: this.calculateRetentionRate(coachId, sessions),
        popularTimeSlots: this.getPopularTimeSlots(sessions),
        clientDemographics: this.getClientDemographics(sessions),
        performanceMetrics: {
          responseTime: this.calculateAvgResponseTime(coachId),
          sessionCompletionRate: this.calculateCompletionRate(sessions),
          clientSatisfactionScore: this.calculateSatisfactionScore(sessions)
        }
      };

      return {
        success: true,
        analytics,
        coach: {
          id: coach.id,
          name: coach.name,
          specialties: coach.specialties,
          totalClients: coach.totalSessions
        }
      };

    } catch (error) {
      console.error('Analytics error:', error);
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  // Helper methods

  async queueCoachVerification(coachId) {
    // Mock verification process
    console.log(`Queuing verification for coach ${coachId}`);
    // In production, this would trigger a background verification process
  }

  async getUserHealthProfile(userId) {
    // Mock user profile - in production, fetch from database
    return {
      goals: ['weight_loss', 'better_sleep'],
      currentConditions: [],
      preferredCommunication: 'video',
      budget: 100,
      availability: 'evenings',
      experience: 'beginner'
    };
  }

  async getCoachAvailability(coachId) {
    // Mock availability - in production, check real calendar
    return {
      nextSlot: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      avgResponseTime: '2 hours',
      currentClients: Math.floor(Math.random() * 15)
    };
  }

  async checkCoachAvailability(coachId, scheduledTime) {
    // Mock availability check
    return true;
  }

  calculateSessionPrice(coach, sessionData) {
    const basePrice = coach.pricing.hourlyRate;
    const duration = sessionData.duration || 60;
    return (basePrice * duration) / 60;
  }

  async processSessionPayment(session) {
    // Mock payment processing
    return {
      success: true,
      paymentId: `pay_${Date.now()}`
    };
  }

  async sendSessionNotifications(session) {
    console.log(`Sending notifications for session ${session.id}`);
  }

  async updateCoachAvailability(coachId, time, duration) {
    console.log(`Updating availability for coach ${coachId}`);
  }

  async getUserHealthData(userId) {
    // Mock health data
    return {
      sleep: { average: 7.2, trend: 'improving' },
      exercise: { weeklyMinutes: 180, type: 'cardio' },
      nutrition: { calories: 2000, protein: 120 },
      mood: { average: 7.5, stability: 'good' }
    };
  }

  anonymizeHealthData(data, userId) {
    // Remove personally identifiable information
    return {
      ...data,
      userId: `user_${btoa(userId).substr(0, 8)}`, // Anonymized ID
      generatedAt: new Date().toISOString()
    };
  }

  async sendMessageNotification(message, session) {
    console.log(`Sending message notification for session ${session.id}`);
  }

  async processClientRating(coachId, rating) {
    const coach = this.coaches.get(coachId);
    if (coach) {
      // Update running average
      const totalRatings = coach.totalSessions || 1;
      coach.rating = ((coach.rating * (totalRatings - 1)) + rating.score) / totalRatings;
    }
  }

  async calculateCoachEarnings(session) {
    const grossEarnings = session.price;
    const platformFee = grossEarnings * this.commissionRate;
    return {
      gross: grossEarnings,
      platformFee,
      net: grossEarnings - platformFee
    };
  }

  async processCoachPayment(coachId, earnings) {
    console.log(`Processing payment of $${earnings.net} for coach ${coachId}`);
  }

  async updateCoachStats(coachId, session) {
    const coach = this.coaches.get(coachId);
    if (coach) {
      coach.totalSessions = (coach.totalSessions || 0) + 1;
      coach.earnings = (coach.earnings || 0) + session.coachEarnings?.net || 0;
    }
  }

  isWithinTimeframe(date, timeframe) {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return new Date(date) >= cutoff;
  }

  calculateRetentionRate(coachId, sessions) {
    // Mock calculation
    return 0.85; // 85% retention rate
  }

  getPopularTimeSlots(sessions) {
    // Mock popular times
    return ['9:00 AM', '1:00 PM', '7:00 PM'];
  }

  getClientDemographics(sessions) {
    // Mock demographics
    return {
      ageGroups: { '25-35': 40, '36-45': 35, '46-55': 25 },
      goals: { weight_loss: 50, muscle_building: 30, wellness: 20 }
    };
  }

  calculateAvgResponseTime(coachId) {
    return '1.5 hours';
  }

  calculateCompletionRate(sessions) {
    if (sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.status === 'completed').length;
    return completed / sessions.length;
  }

  calculateSatisfactionScore(sessions) {
    // Mock satisfaction score
    return 4.7;
  }
}

/**
 * Coach Matchmaking Engine
 * Uses AI to match coaches with clients based on compatibility
 */
class CoachMatchmakingEngine {
  async findMatches(userProfile, preferences) {
    // Mock matching algorithm - in production, this would use ML
    const mockMatches = [
      {
        coachId: 'coach_001',
        name: 'Sarah Johnson',
        specialties: ['weight_loss', 'nutrition'],
        rating: 4.8,
        hourlyRate: 85,
        experience: '5 years',
        compatibilityScore: 0.92,
        bio: 'Certified nutritionist specializing in sustainable weight loss',
        languages: ['English', 'Spanish'],
        avatar: '/api/placeholder/coach-1.jpg'
      },
      {
        coachId: 'coach_002',
        name: 'Mike Chen',
        specialties: ['sleep_optimization', 'stress_management'],
        rating: 4.9,
        hourlyRate: 95,
        experience: '8 years',
        compatibilityScore: 0.87,
        bio: 'Sleep specialist and wellness coach',
        languages: ['English', 'Mandarin'],
        avatar: '/api/placeholder/coach-2.jpg'
      }
    ];

    return mockMatches;
  }
}

// Export singleton instance
const smartCoachingMarketplace = new SmartCoachingMarketplace();

module.exports = {
  SmartCoachingMarketplace,
  smartCoachingMarketplace
};