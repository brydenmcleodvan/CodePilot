/**
 * Firebase Admin SDK Configuration
 * Provides server-side Firebase operations with enhanced security
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses service account key from environment)
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Fallback for development without Firebase
      console.log('Firebase Admin not configured - using local storage fallback');
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error.message);
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;
const auth = admin.apps.length > 0 ? admin.auth() : null;

/**
 * Firestore Security Operations
 */
class FirebaseSecurityService {
  constructor() {
    this.db = db;
    this.auth = auth;
  }

  /**
   * Verify user authentication and permissions
   */
  async verifyUserAccess(req, requiredRole = 'user') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No authentication token provided');
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await this.auth.verifyIdToken(token);
      
      // Get user role from custom claims or Firestore
      const userRole = decodedToken.role || await this.getUserRole(decodedToken.uid);
      
      // Check role permissions
      const roleHierarchy = {
        'user': 1,
        'premium': 2,
        'provider': 3,
        'admin': 4
      };

      const userLevel = roleHierarchy[userRole] || 1;
      const requiredLevel = roleHierarchy[requiredRole] || 1;

      if (userLevel < requiredLevel) {
        throw new Error(`Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`);
      }

      return {
        uid: decodedToken.uid,
        role: userRole,
        permissions: decodedToken.permissions || []
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Get user role from Firestore
   */
  async getUserRole(uid) {
    if (!this.db) return 'user';
    
    try {
      const userDoc = await this.db.collection('users').doc(uid).get();
      return userDoc.exists ? userDoc.data().role || 'user' : 'user';
    } catch (error) {
      console.warn('Failed to get user role:', error);
      return 'user';
    }
  }

  /**
   * Secure support ticket creation
   */
  async createSupportTicket(ticketData, userAuth) {
    if (!this.db) {
      throw new Error('Firebase not configured');
    }

    const ticket = {
      userId: userAuth.uid,
      subject: ticketData.subject,
      message: ticketData.message,
      category: ticketData.category || 'general',
      priority: this.calculatePriority(ticketData, userAuth.role),
      status: 'open',
      userRole: userAuth.role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        userAgent: ticketData.userAgent,
        ipAddress: ticketData.ipAddress,
        currentUrl: ticketData.currentUrl
      }
    };

    const docRef = await this.db.collection('support_tickets').add(ticket);
    
    // Trigger email notification
    await this.triggerSupportEmailAlert(docRef.id, ticket);
    
    return { id: docRef.id, ...ticket };
  }

  /**
   * Secure feature analytics logging
   */
  async logFeatureUsage(analyticsData, userAuth) {
    if (!this.db) {
      throw new Error('Firebase not configured');
    }

    const logEntry = {
      userId: userAuth.uid,
      feature: analyticsData.feature,
      metadata: analyticsData.metadata || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userRole: userAuth.role,
      sessionId: analyticsData.sessionId
    };

    await this.db.collection('feature_logs').add(logEntry);
    
    // Update user analytics summary
    await this.updateUserAnalyticsSummary(userAuth.uid, analyticsData.feature);
    
    return logEntry;
  }

  /**
   * Calculate ticket priority based on user role and category
   */
  calculatePriority(ticketData, userRole) {
    const rolePriority = {
      'user': 1,
      'premium': 2,
      'provider': 3,
      'admin': 4
    };
    
    const categoryPriority = {
      'general': 1,
      'technical': 2,
      'billing': 3,
      'urgent': 4
    };
    
    const roleScore = rolePriority[userRole] || 1;
    const categoryScore = categoryPriority[ticketData.category] || 1;
    
    const totalScore = roleScore + categoryScore;
    
    if (totalScore >= 6) return 'high';
    if (totalScore >= 4) return 'medium';
    return 'low';
  }

  /**
   * Trigger email alert for support staff
   */
  async triggerSupportEmailAlert(ticketId, ticketData) {
    try {
      // This would trigger a Cloud Function or integrate with your email service
      const emailData = {
        type: 'support_ticket_created',
        ticketId,
        priority: ticketData.priority,
        category: ticketData.category,
        subject: ticketData.subject,
        userRole: ticketData.userRole,
        timestamp: new Date().toISOString()
      };

      // Queue email notification
      if (this.db) {
        await this.db.collection('email_queue').add(emailData);
      }
      
      console.log(`Support ticket email alert queued: ${ticketId}`);
    } catch (error) {
      console.error('Failed to trigger support email alert:', error);
    }
  }

  /**
   * Update user analytics summary for performance
   */
  async updateUserAnalyticsSummary(userId, feature) {
    if (!this.db) return;

    try {
      const summaryRef = this.db.collection('user_analytics_summary').doc(userId);
      
      await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(summaryRef);
        
        if (doc.exists) {
          const data = doc.data();
          const featureCount = data.featureUsage[feature] || 0;
          
          transaction.update(summaryRef, {
            totalUsage: (data.totalUsage || 0) + 1,
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            [`featureUsage.${feature}`]: featureCount + 1
          });
        } else {
          transaction.set(summaryRef, {
            userId,
            totalUsage: 1,
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            featureUsage: { [feature]: 1 },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    } catch (error) {
      console.warn('Failed to update user analytics summary:', error);
    }
  }

  /**
   * Get aggregated analytics data
   */
  async getAggregatedAnalytics(timeframe = 30) {
    if (!this.db) {
      throw new Error('Firebase not configured');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);

    try {
      // Get feature usage aggregation
      const featureLogsQuery = this.db.collection('feature_logs')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(cutoffDate));
      
      const featureLogsSnapshot = await featureLogsQuery.get();
      
      const analytics = {
        totalLogs: featureLogsSnapshot.size,
        uniqueUsers: new Set(),
        featureUsage: {},
        userEngagement: {},
        conversionEvents: []
      };

      featureLogsSnapshot.forEach(doc => {
        const data = doc.data();
        analytics.uniqueUsers.add(data.userId);
        
        // Count feature usage
        analytics.featureUsage[data.feature] = (analytics.featureUsage[data.feature] || 0) + 1;
        
        // Track conversion events
        if (data.feature.includes('conversion') || data.feature.includes('upgrade')) {
          analytics.conversionEvents.push({
            userId: data.userId,
            feature: data.feature,
            timestamp: data.timestamp
          });
        }
      });

      analytics.uniqueUsers = analytics.uniqueUsers.size;
      
      return analytics;
    } catch (error) {
      console.error('Failed to get aggregated analytics:', error);
      throw error;
    }
  }
}

// Export Firebase services
module.exports = {
  admin,
  db,
  auth,
  FirebaseSecurityService
};