/**
 * Usage Analytics Module
 * Tracks feature adoption, upgrade funnel, and user engagement for business insights
 */

class UsageAnalytics {
  constructor() {
    this.events = [];
    this.userSessions = new Map();
    this.featureUsage = new Map();
    this.conversionFunnel = new Map();
    
    // Initialize analytics categories
    this.eventTypes = {
      USER_ACTION: 'user_action',
      FEATURE_ACCESS: 'feature_access',
      SUBSCRIPTION_EVENT: 'subscription_event',
      ONBOARDING_STEP: 'onboarding_step',
      BLOCKED_FEATURE: 'blocked_feature',
      UPGRADE_PROMPT: 'upgrade_prompt'
    };
  }

  /**
   * Track user event for analytics
   */
  trackEvent(userId, eventType, eventName, properties = {}) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType,
      eventName,
      properties,
      timestamp: new Date(),
      sessionId: this.getOrCreateSession(userId),
      userAgent: properties.userAgent || 'unknown',
      ipAddress: properties.ipAddress || '0.0.0.0'
    };

    this.events.push(event);
    this.updateFeatureUsage(eventName, userId);
    this.updateConversionFunnel(userId, eventName);

    console.log(`Analytics Event: ${eventName} by User ${userId}`);
    return event.id;
  }

  /**
   * Track onboarding progress
   */
  trackOnboardingStep(userId, stepName, stepData = {}) {
    return this.trackEvent(userId, this.eventTypes.ONBOARDING_STEP, `onboarding_${stepName}`, {
      step: stepName,
      ...stepData
    });
  }

  /**
   * Track feature access attempts (successful and blocked)
   */
  trackFeatureAccess(userId, featureName, accessGranted, subscriptionRequired = null) {
    const eventName = accessGranted ? `feature_accessed_${featureName}` : `feature_blocked_${featureName}`;
    
    return this.trackEvent(
      userId, 
      accessGranted ? this.eventTypes.FEATURE_ACCESS : this.eventTypes.BLOCKED_FEATURE,
      eventName,
      {
        feature: featureName,
        accessGranted,
        subscriptionRequired,
        userPlan: this.getUserPlan(userId)
      }
    );
  }

  /**
   * Track subscription-related events
   */
  trackSubscriptionEvent(userId, eventName, subscriptionData = {}) {
    return this.trackEvent(userId, this.eventTypes.SUBSCRIPTION_EVENT, eventName, {
      ...subscriptionData,
      timestamp: new Date()
    });
  }

  /**
   * Track upgrade prompts and responses
   */
  trackUpgradePrompt(userId, promptType, userResponse = null, targetPlan = null) {
    return this.trackEvent(userId, this.eventTypes.UPGRADE_PROMPT, `upgrade_prompt_${promptType}`, {
      promptType,
      userResponse, // 'clicked', 'dismissed', 'converted'
      targetPlan,
      currentPlan: this.getUserPlan(userId)
    });
  }

  /**
   * Get or create user session
   */
  getOrCreateSession(userId) {
    const existingSession = this.userSessions.get(userId);
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    if (existingSession && (Date.now() - existingSession.lastActivity) < sessionTimeout) {
      existingSession.lastActivity = Date.now();
      return existingSession.id;
    }
    
    // Create new session
    const sessionId = `session_${Date.now()}_${userId}`;
    this.userSessions.set(userId, {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      userId
    });
    
    return sessionId;
  }

  /**
   * Update feature usage statistics
   */
  updateFeatureUsage(eventName, userId) {
    if (!this.featureUsage.has(eventName)) {
      this.featureUsage.set(eventName, {
        totalUsage: 0,
        uniqueUsers: new Set(),
        lastUsed: null
      });
    }
    
    const usage = this.featureUsage.get(eventName);
    usage.totalUsage++;
    usage.uniqueUsers.add(userId);
    usage.lastUsed = new Date();
  }

  /**
   * Update conversion funnel tracking
   */
  updateConversionFunnel(userId, eventName) {
    if (!this.conversionFunnel.has(userId)) {
      this.conversionFunnel.set(userId, {
        events: [],
        funnelStage: 'visitor',
        firstSeen: new Date(),
        lastActivity: new Date()
      });
    }
    
    const userFunnel = this.conversionFunnel.get(userId);
    userFunnel.events.push({ eventName, timestamp: new Date() });
    userFunnel.lastActivity = new Date();
    
    // Update funnel stage based on events
    this.updateFunnelStage(userId, eventName);
  }

  /**
   * Update user's position in conversion funnel
   */
  updateFunnelStage(userId, eventName) {
    const userFunnel = this.conversionFunnel.get(userId);
    
    // Define funnel stages and progression rules
    const funnelProgression = {
      'visitor': 'engaged', // Any meaningful interaction
      'engaged': 'interested', // Multiple feature uses or goal setting
      'interested': 'considering', // Blocked feature attempts or upgrade prompts
      'considering': 'subscribed', // Actual subscription
      'subscribed': 'advocate' // High usage and feature adoption
    };
    
    // Determine stage progression
    if (eventName.includes('feature_blocked') && userFunnel.funnelStage === 'engaged') {
      userFunnel.funnelStage = 'considering';
    } else if (eventName.includes('subscription_created')) {
      userFunnel.funnelStage = 'subscribed';
    } else if (eventName.includes('onboarding_goals') && userFunnel.funnelStage === 'visitor') {
      userFunnel.funnelStage = 'engaged';
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  getAnalyticsDashboard(timeframe = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);
    
    const recentEvents = this.events.filter(event => event.timestamp >= cutoffDate);
    
    return {
      overview: this.getOverviewMetrics(recentEvents),
      featureAdoption: this.getFeatureAdoptionMetrics(),
      conversionFunnel: this.getConversionFunnelMetrics(),
      subscriptionMetrics: this.getSubscriptionMetrics(recentEvents),
      userEngagement: this.getUserEngagementMetrics(recentEvents),
      upgradeOpportunities: this.getUpgradeOpportunities()
    };
  }

  /**
   * Get overview metrics
   */
  getOverviewMetrics(events) {
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const totalEvents = events.length;
    const avgEventsPerUser = uniqueUsers > 0 ? (totalEvents / uniqueUsers).toFixed(2) : 0;
    
    return {
      totalEvents,
      uniqueUsers,
      avgEventsPerUser,
      mostActiveDay: this.getMostActiveDay(events),
      topEvents: this.getTopEvents(events, 5)
    };
  }

  /**
   * Get feature adoption metrics
   */
  getFeatureAdoptionMetrics() {
    const features = [];
    
    this.featureUsage.forEach((usage, featureName) => {
      features.push({
        feature: featureName,
        totalUsage: usage.totalUsage,
        uniqueUsers: usage.uniqueUsers.size,
        lastUsed: usage.lastUsed,
        adoptionRate: this.calculateAdoptionRate(usage.uniqueUsers.size)
      });
    });
    
    return features.sort((a, b) => b.totalUsage - a.totalUsage);
  }

  /**
   * Get conversion funnel metrics
   */
  getConversionFunnelMetrics() {
    const funnelStats = {
      visitor: 0,
      engaged: 0,
      interested: 0,
      considering: 0,
      subscribed: 0,
      advocate: 0
    };
    
    this.conversionFunnel.forEach(userFunnel => {
      funnelStats[userFunnel.funnelStage]++;
    });
    
    const totalUsers = this.conversionFunnel.size;
    
    return {
      counts: funnelStats,
      percentages: {
        visitor: totalUsers > 0 ? ((funnelStats.visitor / totalUsers) * 100).toFixed(1) : 0,
        engaged: totalUsers > 0 ? ((funnelStats.engaged / totalUsers) * 100).toFixed(1) : 0,
        interested: totalUsers > 0 ? ((funnelStats.interested / totalUsers) * 100).toFixed(1) : 0,
        considering: totalUsers > 0 ? ((funnelStats.considering / totalUsers) * 100).toFixed(1) : 0,
        subscribed: totalUsers > 0 ? ((funnelStats.subscribed / totalUsers) * 100).toFixed(1) : 0,
        advocate: totalUsers > 0 ? ((funnelStats.advocate / totalUsers) * 100).toFixed(1) : 0
      },
      conversionRate: totalUsers > 0 ? ((funnelStats.subscribed / totalUsers) * 100).toFixed(2) : 0
    };
  }

  /**
   * Get subscription-related metrics
   */
  getSubscriptionMetrics(events) {
    const subscriptionEvents = events.filter(e => e.eventType === this.eventTypes.SUBSCRIPTION_EVENT);
    const blockedFeatureEvents = events.filter(e => e.eventType === this.eventTypes.BLOCKED_FEATURE);
    const upgradePromptEvents = events.filter(e => e.eventType === this.eventTypes.UPGRADE_PROMPT);
    
    return {
      subscriptionSignups: subscriptionEvents.filter(e => e.eventName.includes('created')).length,
      subscriptionCancellations: subscriptionEvents.filter(e => e.eventName.includes('cancelled')).length,
      blockedFeatureAttempts: blockedFeatureEvents.length,
      upgradePromptsShown: upgradePromptEvents.length,
      upgradePromptClickRate: this.calculateUpgradeClickRate(upgradePromptEvents),
      mostBlockedFeatures: this.getMostBlockedFeatures(blockedFeatureEvents)
    };
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics(events) {
    const userActivity = {};
    
    events.forEach(event => {
      if (!userActivity[event.userId]) {
        userActivity[event.userId] = {
          totalEvents: 0,
          uniqueDays: new Set(),
          lastActivity: null
        };
      }
      
      userActivity[event.userId].totalEvents++;
      userActivity[event.userId].uniqueDays.add(event.timestamp.toDateString());
      userActivity[event.userId].lastActivity = event.timestamp;
    });
    
    const engagementScores = Object.values(userActivity).map(activity => ({
      totalEvents: activity.totalEvents,
      activeDays: activity.uniqueDays.size,
      engagementScore: activity.totalEvents * activity.uniqueDays.size
    }));
    
    return {
      avgEventsPerUser: engagementScores.length > 0 ? 
        (engagementScores.reduce((sum, u) => sum + u.totalEvents, 0) / engagementScores.length).toFixed(2) : 0,
      avgActiveDays: engagementScores.length > 0 ? 
        (engagementScores.reduce((sum, u) => sum + u.activeDays, 0) / engagementScores.length).toFixed(2) : 0,
      highlyEngagedUsers: engagementScores.filter(u => u.engagementScore > 50).length,
      lowEngagementUsers: engagementScores.filter(u => u.engagementScore < 10).length
    };
  }

  /**
   * Identify upgrade opportunities
   */
  getUpgradeOpportunities() {
    const opportunities = [];
    
    this.conversionFunnel.forEach((userFunnel, userId) => {
      if (userFunnel.funnelStage === 'considering') {
        const blockedAttempts = userFunnel.events.filter(e => 
          e.eventName.includes('feature_blocked')
        ).length;
        
        if (blockedAttempts >= 3) {
          opportunities.push({
            userId,
            reason: 'Multiple blocked feature attempts',
            urgency: 'high',
            blockedAttempts,
            lastActivity: userFunnel.lastActivity
          });
        }
      }
    });
    
    return opportunities.sort((a, b) => b.blockedAttempts - a.blockedAttempts);
  }

  /**
   * Helper methods
   */
  getUserPlan(userId) {
    // Would integrate with subscription manager
    return 'basic'; // Default assumption
  }

  calculateAdoptionRate(uniqueUsers) {
    const totalUsers = this.conversionFunnel.size;
    return totalUsers > 0 ? ((uniqueUsers / totalUsers) * 100).toFixed(1) : 0;
  }

  getMostActiveDay(events) {
    const dailyCounts = {};
    events.forEach(event => {
      const day = event.timestamp.toDateString();
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    
    return Object.entries(dailyCounts)
      .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  }

  getTopEvents(events, limit) {
    const eventCounts = {};
    events.forEach(event => {
      eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
    });
    
    return Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  calculateUpgradeClickRate(upgradeEvents) {
    const shown = upgradeEvents.filter(e => e.properties.userResponse !== 'dismissed').length;
    const clicked = upgradeEvents.filter(e => e.properties.userResponse === 'clicked').length;
    
    return shown > 0 ? ((clicked / shown) * 100).toFixed(1) : 0;
  }

  getMostBlockedFeatures(blockedEvents, limit = 5) {
    const featureCounts = {};
    blockedEvents.forEach(event => {
      const feature = event.properties.feature;
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });
    
    return Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([feature, count]) => ({ feature, count }));
  }
}

// Export singleton instance
const usageAnalytics = new UsageAnalytics();

module.exports = {
  UsageAnalytics,
  usageAnalytics
};