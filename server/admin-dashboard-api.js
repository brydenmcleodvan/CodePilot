/**
 * Admin Dashboard API
 * Provides analytics and support ticket management for business insights
 */

const { usageAnalytics } = require('./usage-analytics');

class AdminDashboardAPI {
  constructor() {
    this.supportTickets = [];
    this.featureUsageLogs = [];
    this.userAnalytics = new Map();
  }

  /**
   * Log feature usage for analytics tracking
   */
  logFeatureUsage(userId, featureName, metadata = {}) {
    const usageLog = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      featureName,
      timestamp: new Date(),
      metadata: {
        userAgent: metadata.userAgent || 'unknown',
        sessionId: metadata.sessionId,
        duration: metadata.duration,
        success: metadata.success !== false, // Default to true unless explicitly false
        errorMessage: metadata.errorMessage,
        ...metadata
      }
    };

    this.featureUsageLogs.push(usageLog);
    
    // Update user analytics
    if (!this.userAnalytics.has(userId)) {
      this.userAnalytics.set(userId, {
        totalFeatureUsage: 0,
        featuresUsed: new Set(),
        lastActivity: null,
        engagementScore: 0
      });
    }
    
    const userStats = this.userAnalytics.get(userId);
    userStats.totalFeatureUsage++;
    userStats.featuresUsed.add(featureName);
    userStats.lastActivity = new Date();
    userStats.engagementScore = userStats.totalFeatureUsage * userStats.featuresUsed.size;

    // Track with usage analytics system
    usageAnalytics.trackEvent(userId, 'feature_usage', featureName, metadata);
    
    console.log(`Feature Usage: ${featureName} by User ${userId}`);
    return usageLog.id;
  }

  /**
   * Create support ticket
   */
  createSupportTicket(ticketData) {
    const ticket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: ticketData.userId,
      subject: ticketData.subject,
      category: ticketData.category || 'general',
      priority: this.calculatePriority(ticketData),
      description: ticketData.description,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: null,
      userPlan: ticketData.userPlan || 'basic',
      responses: [],
      metadata: {
        userAgent: ticketData.userAgent,
        ipAddress: ticketData.ipAddress,
        currentUrl: ticketData.currentUrl
      }
    };

    this.supportTickets.push(ticket);
    
    // Track support ticket creation
    usageAnalytics.trackEvent(
      ticketData.userId, 
      'support_ticket', 
      'ticket_created',
      { ticketId: ticket.id, category: ticket.category, priority: ticket.priority }
    );
    
    console.log(`Support Ticket Created: ${ticket.id} by User ${ticketData.userId}`);
    return ticket;
  }

  /**
   * Calculate ticket priority based on user plan and category
   */
  calculatePriority(ticketData) {
    const planPriority = {
      'basic': 1,
      'premium': 2,
      'pro': 3
    };
    
    const categoryPriority = {
      'billing': 3,
      'technical': 2,
      'features': 1,
      'general': 1
    };
    
    const userPlanScore = planPriority[ticketData.userPlan] || 1;
    const categoryScore = categoryPriority[ticketData.category] || 1;
    
    const totalScore = userPlanScore + categoryScore;
    
    if (totalScore >= 5) return 'high';
    if (totalScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  getAnalyticsDashboard(timeframe = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);
    
    const recentUsage = this.featureUsageLogs.filter(log => log.timestamp >= cutoffDate);
    const recentTickets = this.supportTickets.filter(ticket => ticket.createdAt >= cutoffDate);
    
    return {
      overview: this.getOverviewMetrics(recentUsage, recentTickets),
      featureAnalytics: this.getFeatureAnalytics(recentUsage),
      userEngagement: this.getUserEngagementMetrics(),
      supportMetrics: this.getSupportMetrics(recentTickets),
      revenueInsights: this.getRevenueInsights(recentUsage),
      topUsers: this.getTopUsers(),
      alerts: this.getSystemAlerts()
    };
  }

  /**
   * Get overview metrics
   */
  getOverviewMetrics(recentUsage, recentTickets) {
    const uniqueUsers = new Set(recentUsage.map(log => log.userId)).size;
    const totalFeatureUsage = recentUsage.length;
    const avgUsagePerUser = uniqueUsers > 0 ? (totalFeatureUsage / uniqueUsers).toFixed(2) : 0;
    
    return {
      totalUsers: this.userAnalytics.size,
      activeUsers: uniqueUsers,
      totalFeatureUsage,
      avgUsagePerUser,
      openTickets: recentTickets.filter(t => t.status === 'open').length,
      avgResponseTime: this.calculateAvgResponseTime(recentTickets)
    };
  }

  /**
   * Get feature analytics
   */
  getFeatureAnalytics(recentUsage) {
    const featureStats = {};
    
    recentUsage.forEach(log => {
      if (!featureStats[log.featureName]) {
        featureStats[log.featureName] = {
          totalUsage: 0,
          uniqueUsers: new Set(),
          successRate: [],
          avgDuration: []
        };
      }
      
      const stats = featureStats[log.featureName];
      stats.totalUsage++;
      stats.uniqueUsers.add(log.userId);
      stats.successRate.push(log.metadata.success ? 1 : 0);
      
      if (log.metadata.duration) {
        stats.avgDuration.push(log.metadata.duration);
      }
    });
    
    // Process statistics
    const features = Object.entries(featureStats).map(([name, stats]) => ({
      name,
      totalUsage: stats.totalUsage,
      uniqueUsers: stats.uniqueUsers.size,
      successRate: stats.successRate.length > 0 ? 
        (stats.successRate.reduce((a, b) => a + b, 0) / stats.successRate.length * 100).toFixed(1) : 100,
      avgDuration: stats.avgDuration.length > 0 ?
        (stats.avgDuration.reduce((a, b) => a + b, 0) / stats.avgDuration.length).toFixed(2) : null,
      adoptionRate: this.userAnalytics.size > 0 ? 
        ((stats.uniqueUsers.size / this.userAnalytics.size) * 100).toFixed(1) : 0
    }));
    
    return features.sort((a, b) => b.totalUsage - a.totalUsage);
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics() {
    const engagementLevels = { low: 0, medium: 0, high: 0 };
    const planDistribution = { basic: 0, premium: 0, pro: 0 };
    
    this.userAnalytics.forEach(userStats => {
      // Engagement levels based on score
      if (userStats.engagementScore >= 50) engagementLevels.high++;
      else if (userStats.engagementScore >= 20) engagementLevels.medium++;
      else engagementLevels.low++;
    });
    
    return {
      engagementDistribution: engagementLevels,
      planDistribution,
      avgFeaturesPerUser: this.userAnalytics.size > 0 ?
        Array.from(this.userAnalytics.values())
          .reduce((sum, user) => sum + user.featuresUsed.size, 0) / this.userAnalytics.size : 0,
      avgEngagementScore: this.userAnalytics.size > 0 ?
        Array.from(this.userAnalytics.values())
          .reduce((sum, user) => sum + user.engagementScore, 0) / this.userAnalytics.size : 0
    };
  }

  /**
   * Get support metrics
   */
  getSupportMetrics(recentTickets) {
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const categoryCounts = {};
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    
    recentTickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
      categoryCounts[ticket.category] = (categoryCounts[ticket.category] || 0) + 1;
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
    });
    
    return {
      totalTickets: recentTickets.length,
      statusDistribution: statusCounts,
      categoryDistribution: categoryCounts,
      priorityDistribution: priorityCounts,
      avgResponseTime: this.calculateAvgResponseTime(recentTickets),
      resolutionRate: recentTickets.length > 0 ?
        ((statusCounts.resolved + statusCounts.closed) / recentTickets.length * 100).toFixed(1) : 100
    };
  }

  /**
   * Get revenue insights
   */
  getRevenueInsights(recentUsage) {
    // Analyze feature usage patterns that indicate upgrade potential
    const upgradeIndicators = {};
    
    recentUsage.forEach(log => {
      const userId = log.userId;
      if (!upgradeIndicators[userId]) {
        upgradeIndicators[userId] = {
          premiumFeatureAttempts: 0,
          exportAttempts: 0,
          telehealthAttempts: 0,
          upgradeScore: 0
        };
      }
      
      const indicators = upgradeIndicators[userId];
      
      // Track premium feature usage patterns
      if (log.featureName.includes('ai_insights')) indicators.premiumFeatureAttempts++;
      if (log.featureName.includes('export')) indicators.exportAttempts++;
      if (log.featureName.includes('telehealth')) indicators.telehealthAttempts++;
      
      // Calculate upgrade score
      indicators.upgradeScore = 
        (indicators.premiumFeatureAttempts * 2) +
        (indicators.exportAttempts * 3) +
        (indicators.telehealthAttempts * 2);
    });
    
    const highPotentialUsers = Object.entries(upgradeIndicators)
      .filter(([_, indicators]) => indicators.upgradeScore >= 10)
      .length;
    
    return {
      upgradeOpportunities: highPotentialUsers,
      avgUpgradeScore: Object.values(upgradeIndicators).length > 0 ?
        Object.values(upgradeIndicators)
          .reduce((sum, indicators) => sum + indicators.upgradeScore, 0) / 
          Object.values(upgradeIndicators).length : 0,
      premiumFeatureUsage: recentUsage.filter(log => 
        log.featureName.includes('ai_insights') || 
        log.featureName.includes('telehealth')
      ).length
    };
  }

  /**
   * Get top users by engagement
   */
  getTopUsers(limit = 10) {
    return Array.from(this.userAnalytics.entries())
      .map(([userId, stats]) => ({
        userId,
        engagementScore: stats.engagementScore,
        totalFeatureUsage: stats.totalFeatureUsage,
        featuresUsed: stats.featuresUsed.size,
        lastActivity: stats.lastActivity
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  }

  /**
   * Get system alerts
   */
  getSystemAlerts() {
    const alerts = [];
    
    // High priority tickets alert
    const highPriorityTickets = this.supportTickets.filter(t => 
      t.priority === 'high' && t.status === 'open'
    ).length;
    
    if (highPriorityTickets > 0) {
      alerts.push({
        type: 'warning',
        message: `${highPriorityTickets} high-priority support tickets need attention`,
        action: 'View Tickets'
      });
    }
    
    // Low engagement users
    const lowEngagementUsers = Array.from(this.userAnalytics.values())
      .filter(stats => stats.engagementScore < 5).length;
    
    if (lowEngagementUsers > 0) {
      alerts.push({
        type: 'info',
        message: `${lowEngagementUsers} users have low engagement - consider onboarding improvements`,
        action: 'View Users'
      });
    }
    
    return alerts;
  }

  /**
   * Helper methods
   */
  calculateAvgResponseTime(tickets) {
    const resolvedTickets = tickets.filter(t => 
      t.status === 'resolved' || t.status === 'closed'
    );
    
    if (resolvedTickets.length === 0) return 'N/A';
    
    const totalResponseTime = resolvedTickets.reduce((sum, ticket) => {
      const responseTime = ticket.updatedAt - ticket.createdAt;
      return sum + responseTime;
    }, 0);
    
    const avgResponseTime = totalResponseTime / resolvedTickets.length;
    const hours = Math.round(avgResponseTime / (1000 * 60 * 60));
    
    return `${hours} hours`;
  }

  /**
   * Get support tickets with filtering and pagination
   */
  getSupportTickets(filters = {}, page = 1, limit = 20) {
    let filteredTickets = [...this.supportTickets];
    
    // Apply filters
    if (filters.status) {
      filteredTickets = filteredTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
    }
    if (filters.category) {
      filteredTickets = filteredTickets.filter(t => t.category === filters.category);
    }
    
    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => b.createdAt - a.createdAt);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + limit);
    
    return {
      tickets: paginatedTickets,
      totalCount: filteredTickets.length,
      totalPages: Math.ceil(filteredTickets.length / limit),
      currentPage: page
    };
  }
}

// Export singleton instance
const adminDashboardAPI = new AdminDashboardAPI();

module.exports = {
  AdminDashboardAPI,
  adminDashboardAPI
};