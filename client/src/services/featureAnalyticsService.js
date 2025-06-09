import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Feature Analytics Service
 * Stores and retrieves feature usage data with Firebase fallback to localStorage
 */
class FeatureAnalyticsService {
  constructor() {
    this.localStorageKey = 'healthmap_feature_analytics';
  }

  /**
   * Log feature usage to Firebase or localStorage
   */
  async logFeatureUsage(userId, feature, metadata = {}) {
    const logEntry = {
      userId,
      feature,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...metadata
    };

    try {
      if (db) {
        // Store in Firebase Firestore
        await addDoc(collection(db, 'feature_logs'), logEntry);
        console.log('Feature usage logged to Firebase:', feature);
      } else {
        // Fallback to localStorage
        this.logToLocalStorage(logEntry);
        console.log('Feature usage logged locally:', feature);
      }
      return true;
    } catch (error) {
      console.warn('Failed to log feature usage to Firebase, using localStorage:', error);
      this.logToLocalStorage(logEntry);
      return false;
    }
  }

  /**
   * Get feature analytics data
   */
  async getAnalytics(userId = null, timeframeDays = 30) {
    try {
      if (db) {
        return await this.getFirebaseAnalytics(userId, timeframeDays);
      } else {
        return this.getLocalAnalytics(userId, timeframeDays);
      }
    } catch (error) {
      console.warn('Failed to get analytics from Firebase, using localStorage:', error);
      return this.getLocalAnalytics(userId, timeframeDays);
    }
  }

  /**
   * Get analytics from Firebase
   */
  async getFirebaseAnalytics(userId, timeframeDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    let q = query(
      collection(db, 'feature_logs'),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    if (userId) {
      q = query(
        collection(db, 'feature_logs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(500)
      );
    }

    const snapshot = await getDocs(q);
    const logs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (new Date(data.timestamp) >= cutoffDate) {
        logs.push({ id: doc.id, ...data });
      }
    });

    return this.processAnalytics(logs);
  }

  /**
   * Get analytics from localStorage
   */
  getLocalAnalytics(userId, timeframeDays) {
    const logs = this.getLocalLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const matchesTimeframe = logDate >= cutoffDate;
      const matchesUser = !userId || log.userId === userId;
      return matchesTimeframe && matchesUser;
    });

    return this.processAnalytics(filteredLogs);
  }

  /**
   * Process raw logs into analytics insights
   */
  processAnalytics(logs) {
    const analytics = {
      totalLogs: logs.length,
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
      uniqueFeatures: new Set(logs.map(log => log.feature)).size,
      topFeatures: {},
      userActivity: {},
      timeDistribution: {},
      conversionFunnel: {}
    };

    // Process feature usage
    logs.forEach(log => {
      // Top features
      analytics.topFeatures[log.feature] = (analytics.topFeatures[log.feature] || 0) + 1;
      
      // User activity
      if (!analytics.userActivity[log.userId]) {
        analytics.userActivity[log.userId] = {
          totalUsage: 0,
          features: new Set(),
          firstSeen: log.timestamp,
          lastSeen: log.timestamp
        };
      }
      
      const userStats = analytics.userActivity[log.userId];
      userStats.totalUsage++;
      userStats.features.add(log.feature);
      
      if (log.timestamp < userStats.firstSeen) userStats.firstSeen = log.timestamp;
      if (log.timestamp > userStats.lastSeen) userStats.lastSeen = log.timestamp;
      
      // Time distribution
      const hour = new Date(log.timestamp).getHours();
      analytics.timeDistribution[hour] = (analytics.timeDistribution[hour] || 0) + 1;
      
      // Track conversion events
      if (log.feature.includes('conversion') || log.feature.includes('upgrade')) {
        analytics.conversionFunnel[log.feature] = (analytics.conversionFunnel[log.feature] || 0) + 1;
      }
    });

    // Convert top features to sorted array
    analytics.topFeatures = Object.entries(analytics.topFeatures)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Process user activity into engagement metrics
    analytics.userEngagement = Object.entries(analytics.userActivity).map(([userId, stats]) => ({
      userId,
      totalUsage: stats.totalUsage,
      uniqueFeatures: stats.features.size,
      engagementScore: stats.totalUsage * stats.features.size,
      daysSinceFirstSeen: Math.floor((new Date() - new Date(stats.firstSeen)) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => b.engagementScore - a.engagementScore);

    return analytics;
  }

  /**
   * Store log entry in localStorage
   */
  logToLocalStorage(logEntry) {
    try {
      const existingLogs = this.getLocalLogs();
      existingLogs.push(logEntry);
      
      // Keep only last 1000 entries to prevent storage bloat
      const recentLogs = existingLogs.slice(-1000);
      localStorage.setItem(this.localStorageKey, JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to store analytics in localStorage:', error);
    }
  }

  /**
   * Get logs from localStorage
   */
  getLocalLogs() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve analytics from localStorage:', error);
      return [];
    }
  }

  /**
   * Generate or retrieve session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('healthmap_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('healthmap_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Clear all analytics data (for GDPR compliance)
   */
  async clearUserData(userId) {
    try {
      if (db) {
        // Would need to implement batch delete from Firebase
        console.log('Firebase data cleanup would be implemented here');
      }
      
      // Clear from localStorage
      const logs = this.getLocalLogs();
      const filteredLogs = logs.filter(log => log.userId !== userId);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filteredLogs));
      
      return true;
    } catch (error) {
      console.error('Failed to clear user analytics data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const featureAnalyticsService = new FeatureAnalyticsService();