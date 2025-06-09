/**
 * Cloud Functions for Healthmap Backend
 * Handles email alerts, analytics aggregation, and automated processes
 */

const { FirebaseSecurityService } = require('./firebase-admin');
const securityService = new FirebaseSecurityService();

/**
 * Email Alert System for Support Tickets
 */
class EmailAlertService {
  constructor() {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    this.supportEmail = 'support@healthmap.ai';
    this.adminEmail = 'admin@healthmap.ai';
  }

  /**
   * Process support ticket email alerts
   */
  async processSupportTicketAlert(ticketData) {
    try {
      const emailContent = this.generateSupportTicketEmail(ticketData);
      
      // Determine recipient based on priority and category
      const recipients = this.getTicketRecipients(ticketData);
      
      for (const recipient of recipients) {
        await this.sendEmail({
          to: recipient.email,
          subject: `[${ticketData.priority.toUpperCase()}] New Support Ticket: ${ticketData.subject}`,
          html: emailContent,
          category: 'support_ticket'
        });
      }
      
      console.log(`Support ticket email alerts sent for ticket: ${ticketData.ticketId}`);
      return true;
    } catch (error) {
      console.error('Failed to send support ticket alert:', error);
      return false;
    }
  }

  /**
   * Generate HTML email content for support tickets
   */
  generateSupportTicketEmail(ticketData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Support Ticket</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Ticket Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Ticket ID:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketData.ticketId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Priority:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                  <span style="background: ${this.getPriorityColor(ticketData.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${ticketData.priority.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Category:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketData.category}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">User Role:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketData.userRole}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Created:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(ticketData.timestamp).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Subject</h3>
            <p style="font-size: 16px; margin: 0;">${ticketData.subject}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6;">${ticketData.message}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://healthmap.ai/admin/tickets/${ticketData.ticketId}" 
               style="background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Ticket in Admin Panel
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated message from Healthmap Support System</p>
        </div>
      </div>
    `;
  }

  /**
   * Get appropriate recipients based on ticket priority and category
   */
  getTicketRecipients(ticketData) {
    const recipients = [];
    
    // Base support team
    recipients.push({ email: this.supportEmail, role: 'support' });
    
    // Add admin for high priority or billing issues
    if (ticketData.priority === 'high' || ticketData.category === 'billing') {
      recipients.push({ email: this.adminEmail, role: 'admin' });
    }
    
    // Add specialized teams based on category
    const specializedEmails = {
      'technical': 'tech@healthmap.ai',
      'billing': 'billing@healthmap.ai',
      'provider': 'providers@healthmap.ai'
    };
    
    if (specializedEmails[ticketData.category]) {
      recipients.push({ 
        email: specializedEmails[ticketData.category], 
        role: ticketData.category 
      });
    }
    
    return recipients;
  }

  /**
   * Get color for priority badges
   */
  getPriorityColor(priority) {
    const colors = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  }

  /**
   * Send email via SendGrid or fallback service
   */
  async sendEmail({ to, subject, html, category }) {
    try {
      if (this.sendGridApiKey) {
        // Use SendGrid if configured
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(this.sendGridApiKey);
        
        const msg = {
          to,
          from: 'noreply@healthmap.ai',
          subject,
          html,
          categories: [category]
        };
        
        await sgMail.send(msg);
        console.log(`Email sent via SendGrid to: ${to}`);
      } else {
        // Fallback to email queue for later processing
        console.log(`Email queued for: ${to} - Subject: ${subject}`);
        
        // Store in database for manual processing or alternative email service
        if (securityService.db) {
          await securityService.db.collection('pending_emails').add({
            to,
            subject,
            html,
            category,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

/**
 * Analytics Aggregation Service
 */
class AnalyticsAggregationService {
  constructor() {
    this.db = securityService.db;
  }

  /**
   * Weekly analytics aggregation
   */
  async aggregateWeeklyAnalytics() {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      const analytics = await this.calculateWeeklyMetrics(weekStart);
      
      // Store aggregated data
      await this.storeWeeklyAnalytics(analytics);
      
      // Generate insights and alerts
      await this.generateInsights(analytics);
      
      console.log('Weekly analytics aggregation completed');
      return analytics;
    } catch (error) {
      console.error('Failed to aggregate weekly analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate weekly metrics
   */
  async calculateWeeklyMetrics(weekStart) {
    if (!this.db) {
      throw new Error('Database not available for analytics');
    }

    const weekEnd = new Date();
    
    // Get feature usage data
    const featureLogsQuery = this.db.collection('feature_logs')
      .where('timestamp', '>=', weekStart)
      .where('timestamp', '<=', weekEnd);
    
    const featureLogsSnapshot = await featureLogsQuery.get();
    
    const metrics = {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalEvents: featureLogsSnapshot.size,
      uniqueUsers: new Set(),
      featurePopularity: {},
      userEngagement: {},
      conversionFunnel: {},
      churnRisk: [],
      goalConversions: {
        goalsSet: 0,
        goalsCompleted: 0,
        conversionRate: 0
      }
    };

    // Process feature logs
    featureLogsSnapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      
      metrics.uniqueUsers.add(userId);
      
      // Count feature usage
      metrics.featurePopularity[data.feature] = (metrics.featurePopularity[data.feature] || 0) + 1;
      
      // Track user engagement
      if (!metrics.userEngagement[userId]) {
        metrics.userEngagement[userId] = {
          totalEvents: 0,
          uniqueFeatures: new Set(),
          lastActivity: data.timestamp
        };
      }
      
      metrics.userEngagement[userId].totalEvents++;
      metrics.userEngagement[userId].uniqueFeatures.add(data.feature);
      
      // Track conversion funnel
      if (data.feature.includes('onboarding')) {
        metrics.conversionFunnel.onboarding = (metrics.conversionFunnel.onboarding || 0) + 1;
      } else if (data.feature.includes('goal_set')) {
        metrics.goalConversions.goalsSet++;
      } else if (data.feature.includes('goal_completed')) {
        metrics.goalConversions.goalsCompleted++;
      } else if (data.feature.includes('subscription')) {
        metrics.conversionFunnel.subscription = (metrics.conversionFunnel.subscription || 0) + 1;
      }
    });

    // Calculate derived metrics
    metrics.uniqueUsers = metrics.uniqueUsers.size;
    metrics.avgEventsPerUser = metrics.uniqueUsers > 0 ? metrics.totalEvents / metrics.uniqueUsers : 0;
    
    // Calculate goal conversion rate
    if (metrics.goalConversions.goalsSet > 0) {
      metrics.goalConversions.conversionRate = 
        (metrics.goalConversions.goalsCompleted / metrics.goalConversions.goalsSet) * 100;
    }
    
    // Identify churn risk users (inactive for 7+ days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    Object.entries(metrics.userEngagement).forEach(([userId, engagement]) => {
      if (engagement.lastActivity < oneWeekAgo && engagement.totalEvents < 5) {
        metrics.churnRisk.push({
          userId,
          daysSinceLastActivity: Math.floor((Date.now() - engagement.lastActivity) / (1000 * 60 * 60 * 24)),
          engagementScore: engagement.totalEvents * engagement.uniqueFeatures.size
        });
      }
    });

    return metrics;
  }

  /**
   * Store weekly analytics
   */
  async storeWeeklyAnalytics(analytics) {
    if (!this.db) return;

    const weekKey = `week_${analytics.weekStart.split('T')[0]}`;
    
    await this.db.collection('weekly_analytics').doc(weekKey).set({
      ...analytics,
      generatedAt: new Date().toISOString()
    });
  }

  /**
   * Generate insights and alerts from analytics
   */
  async generateInsights(analytics) {
    const insights = [];
    
    // Feature adoption insights
    const topFeatures = Object.entries(analytics.featurePopularity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    insights.push({
      type: 'feature_adoption',
      title: 'Top Features This Week',
      data: topFeatures,
      priority: 'info'
    });
    
    // Churn risk alert
    if (analytics.churnRisk.length > 0) {
      insights.push({
        type: 'churn_risk',
        title: `${analytics.churnRisk.length} Users at Risk of Churning`,
        data: analytics.churnRisk.slice(0, 10),
        priority: 'warning'
      });
    }
    
    // Goal conversion insights
    if (analytics.goalConversions.conversionRate < 50) {
      insights.push({
        type: 'goal_conversion',
        title: 'Low Goal Completion Rate',
        data: analytics.goalConversions,
        priority: 'warning',
        recommendation: 'Consider improving goal-setting UX or adding motivation features'
      });
    }
    
    // Store insights
    if (this.db) {
      await this.db.collection('analytics_insights').add({
        insights,
        weekStart: analytics.weekStart,
        generatedAt: new Date().toISOString()
      });
    }
    
    return insights;
  }
}

/**
 * Automated Health Reminders
 */
class HealthReminderService {
  constructor() {
    this.emailService = new EmailAlertService();
  }

  /**
   * Send medication reminders
   */
  async sendMedicationReminders() {
    if (!securityService.db) return;

    try {
      // Get users with medication schedules
      const medicationsQuery = securityService.db.collectionGroup('medications')
        .where('reminderEnabled', '==', true)
        .where('nextReminder', '<=', new Date());

      const snapshot = await medicationsQuery.get();
      
      const reminderPromises = [];
      
      snapshot.forEach(doc => {
        const medication = doc.data();
        reminderPromises.push(this.sendMedicationReminder(medication));
      });

      await Promise.all(reminderPromises);
      console.log(`Sent ${reminderPromises.length} medication reminders`);
    } catch (error) {
      console.error('Failed to send medication reminders:', error);
    }
  }

  /**
   * Send individual medication reminder
   */
  async sendMedicationReminder(medication) {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; text-align: center;">
        <div style="background: #4A90E2; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">💊 Medication Reminder</h2>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="margin-top: 0;">Time to take your medication</h3>
          <p style="font-size: 18px; font-weight: bold; color: #333;">${medication.name}</p>
          <p style="color: #666;">Dosage: ${medication.dosage}</p>
          <p style="color: #666;">Time: ${new Date().toLocaleTimeString()}</p>
          <a href="https://healthmap.ai/medications" style="background: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
            Mark as Taken
          </a>
        </div>
      </div>
    `;

    return this.emailService.sendEmail({
      to: medication.userEmail,
      subject: `💊 Medication Reminder: ${medication.name}`,
      html: emailContent,
      category: 'medication_reminder'
    });
  }
}

// Export services
module.exports = {
  EmailAlertService,
  AnalyticsAggregationService,
  HealthReminderService
};