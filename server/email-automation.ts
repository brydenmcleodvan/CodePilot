/**
 * Weekly Email Automation System
 * Automatically generates and sends health reports to users
 * Integrates with all health intelligence engines for comprehensive insights
 */

import cron from 'node-cron';
import { storage } from './storage';
import { doctorReportGenerator } from './doctor-report-generator';
import { healthScoreEngine } from './health-score-engine';
import { riskDetectionEngine } from './risk-detection-engine';
import { clinicalDecisionSupport } from './clinical-decision-support';
import { populationComparisonEngine } from './population-comparison-engine';

// Email service integration (placeholder for SendGrid)
interface EmailService {
  sendEmail(to: string, subject: string, content: EmailContent): Promise<boolean>;
}

interface EmailContent {
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
}

interface WeeklyReportData {
  user: any;
  healthScore: any;
  riskAssessment: any;
  clinicalInsights: any;
  populationComparison: any;
  weeklyTrends: {
    scoreChange: number;
    keyMetricChanges: Array<{
      metric: string;
      change: number;
      significance: string;
    }>;
    achievements: string[];
    recommendations: string[];
  };
}

class EmailAutomationService {
  private emailService: EmailService;
  private isEnabled: boolean = false;

  constructor() {
    // Initialize email service (SendGrid integration)
    this.emailService = {
      sendEmail: async (to: string, subject: string, content: EmailContent) => {
        // TODO: Implement actual SendGrid integration
        console.log(`Email would be sent to ${to}: ${subject}`);
        return true;
      }
    };
  }

  /**
   * Initialize weekly email automation
   */
  public startWeeklyAutomation(): void {
    if (this.isEnabled) {
      console.log('Weekly email automation already running');
      return;
    }

    // Schedule for every Monday at 8:00 AM
    cron.schedule('0 8 * * 1', async () => {
      await this.processWeeklyReports();
    }, {
      timezone: 'America/New_York' // Configure based on user preferences
    });

    this.isEnabled = true;
    console.log('Weekly email automation started - emails will be sent every Monday at 8:00 AM');
  }

  /**
   * Process and send weekly reports for all eligible users
   */
  private async processWeeklyReports(): Promise<void> {
    try {
      const users = await this.getUsersWithAutoEmailEnabled();
      console.log(`Processing weekly reports for ${users.length} users`);

      for (const user of users) {
        try {
          await this.generateAndSendWeeklyReport(user);
          await this.delay(1000); // Rate limiting between emails
        } catch (error) {
          console.error(`Failed to send weekly report for user ${user.id}:`, error);
        }
      }

      console.log('Weekly report processing completed');
    } catch (error) {
      console.error('Error in weekly report processing:', error);
    }
  }

  /**
   * Generate and send comprehensive weekly report for a user
   */
  private async generateAndSendWeeklyReport(user: any): Promise<void> {
    try {
      // Gather comprehensive health data
      const reportData = await this.gatherWeeklyReportData(user.id);
      
      // Generate email content
      const emailContent = this.generateEmailContent(reportData);
      
      // Generate PDF attachment
      const pdfReport = await this.generatePDFAttachment(reportData);
      
      // Send email
      const subject = this.generateEmailSubject(reportData);
      
      await this.emailService.sendEmail(user.email, subject, {
        html: emailContent.html,
        text: emailContent.text,
        attachments: pdfReport ? [{
          filename: `health-report-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfReport,
          type: 'application/pdf'
        }] : undefined
      });

      console.log(`Weekly report sent successfully to ${user.email}`);
    } catch (error) {
      console.error(`Error generating weekly report for user ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Gather comprehensive health data for weekly report
   */
  private async gatherWeeklyReportData(userId: number): Promise<WeeklyReportData> {
    const user = await storage.getUser(userId);
    
    // Get current health score
    const healthScore = await healthScoreEngine.calculateHealthScore(userId);
    
    // Get risk assessment
    const riskAssessment = await riskDetectionEngine.performRiskAssessment(userId);
    
    // Get clinical insights
    const clinicalInsights = await clinicalDecisionSupport.generateClinicalReport(userId);
    
    // Get population comparison
    const populationComparison = await populationComparisonEngine.generateComparisonReport(userId);
    
    // Calculate weekly trends
    const weeklyTrends = await this.calculateWeeklyTrends(userId, healthScore);

    return {
      user,
      healthScore,
      riskAssessment,
      clinicalInsights,
      populationComparison,
      weeklyTrends
    };
  }

  /**
   * Calculate weekly trends and changes
   */
  private async calculateWeeklyTrends(userId: number, currentScore: any) {
    const weekAgoMetrics = await storage.getHealthMetrics(userId);
    const lastWeekMetrics = weekAgoMetrics.filter(m => 
      m.timestamp >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
      m.timestamp < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    // Calculate score change (simplified - would need historical score data)
    const scoreChange = 0; // Placeholder

    // Calculate key metric changes
    const keyMetricChanges = this.calculateMetricChanges(weekAgoMetrics);

    // Generate achievements
    const achievements = this.generateAchievements(currentScore, weekAgoMetrics);

    // Generate recommendations
    const recommendations = this.generateWeeklyRecommendations(currentScore, keyMetricChanges);

    return {
      scoreChange,
      keyMetricChanges,
      achievements,
      recommendations
    };
  }

  /**
   * Calculate changes in key metrics
   */
  private calculateMetricChanges(metrics: any[]): Array<{
    metric: string;
    change: number;
    significance: string;
  }> {
    const changes = [];
    const metricTypes = ['heart_rate', 'sleep', 'steps', 'weight'];
    
    for (const metricType of metricTypes) {
      const typeMetrics = metrics.filter(m => m.metricType === metricType);
      if (typeMetrics.length >= 2) {
        const recent = typeMetrics.slice(0, 3);
        const previous = typeMetrics.slice(3, 6);
        
        if (recent.length > 0 && previous.length > 0) {
          const recentAvg = recent.reduce((sum, m) => sum + parseFloat(m.value), 0) / recent.length;
          const previousAvg = previous.reduce((sum, m) => sum + parseFloat(m.value), 0) / previous.length;
          const change = ((recentAvg - previousAvg) / previousAvg) * 100;
          
          changes.push({
            metric: metricType,
            change: Math.round(change * 10) / 10,
            significance: Math.abs(change) > 10 ? 'significant' : Math.abs(change) > 5 ? 'moderate' : 'minimal'
          });
        }
      }
    }

    return changes;
  }

  /**
   * Generate achievements based on progress
   */
  private generateAchievements(healthScore: any, metrics: any[]): string[] {
    const achievements = [];

    if (healthScore.overallScore >= 80) {
      achievements.push('🎉 Excellent health score maintained');
    }

    if (healthScore.breakdown.some((b: any) => b.status === 'excellent')) {
      achievements.push('⭐ Outstanding performance in key health metrics');
    }

    // Check for consistent sleep
    const sleepMetrics = metrics.filter(m => m.metricType === 'sleep');
    if (sleepMetrics.length >= 7) {
      const avgSleep = sleepMetrics.slice(0, 7).reduce((sum, m) => sum + parseFloat(m.value), 0) / 7;
      if (avgSleep >= 7.5) {
        achievements.push('😴 Consistent healthy sleep pattern');
      }
    }

    // Check for activity goals
    const stepMetrics = metrics.filter(m => m.metricType === 'steps');
    if (stepMetrics.length >= 7) {
      const dailySteps = stepMetrics.slice(0, 7).map(m => parseFloat(m.value));
      if (dailySteps.filter(steps => steps >= 10000).length >= 5) {
        achievements.push('🚶 Active lifestyle goal achieved');
      }
    }

    return achievements.length > 0 ? achievements : ['📈 Keep up the great progress!'];
  }

  /**
   * Generate personalized weekly recommendations
   */
  private generateWeeklyRecommendations(healthScore: any, metricChanges: any[]): string[] {
    const recommendations = [];

    // Based on health score
    if (healthScore.overallScore < 70) {
      recommendations.push('Focus on improving overall health metrics this week');
    }

    // Based on metric changes
    const negativeChanges = metricChanges.filter(c => c.change < -5);
    if (negativeChanges.length > 0) {
      recommendations.push(`Monitor ${negativeChanges[0].metric} - showing decline`);
    }

    // General wellness recommendations
    recommendations.push('Maintain consistent sleep schedule');
    recommendations.push('Stay hydrated and eat balanced meals');

    return recommendations;
  }

  /**
   * Generate email subject line
   */
  private generateEmailSubject(reportData: WeeklyReportData): string {
    const { healthScore, riskAssessment } = reportData;
    
    if (riskAssessment.activeAlerts.length > 0) {
      return `🚨 Healthmap Weekly Report - Health Alerts Detected`;
    }
    
    if (healthScore.overallScore >= 80) {
      return `🎉 Healthmap Weekly Report - Excellent Health Score (${healthScore.overallScore})`;
    }
    
    if (healthScore.overallScore >= 60) {
      return `📊 Healthmap Weekly Report - Health Score: ${healthScore.overallScore}`;
    }
    
    return `💙 Healthmap Weekly Report - Let's Improve Together`;
  }

  /**
   * Generate HTML email content
   */
  private generateEmailContent(reportData: WeeklyReportData): { html: string; text: string } {
    const { user, healthScore, riskAssessment, weeklyTrends } = reportData;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Weekly Health Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
            .score-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px; }
            .score-number { font-size: 48px; font-weight: bold; color: ${healthScore.overallScore >= 80 ? '#10b981' : healthScore.overallScore >= 60 ? '#f59e0b' : '#ef4444'}; }
            .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
            .metric-item { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
            .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .achievement-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .recommendation-box { background: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .cta-button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your Weekly Health Report</h1>
            <p>Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div class="score-card">
            <h2>Overall Health Score</h2>
            <div class="score-number">${healthScore.overallScore}</div>
            <p>${healthScore.category.toUpperCase()}</p>
            ${weeklyTrends.scoreChange !== 0 ? `<p>Change from last week: ${weeklyTrends.scoreChange > 0 ? '+' : ''}${weeklyTrends.scoreChange}</p>` : ''}
          </div>

          ${riskAssessment.activeAlerts.length > 0 ? `
            <div class="alert-box">
              <h3>⚠️ Health Alerts</h3>
              <p>You have ${riskAssessment.activeAlerts.length} active health alert(s). Please review your detailed report and consider consulting your healthcare provider.</p>
            </div>
          ` : ''}

          ${weeklyTrends.achievements.length > 0 ? `
            <div class="achievement-box">
              <h3>🎉 This Week's Achievements</h3>
              <ul>
                ${weeklyTrends.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="metric-grid">
            ${healthScore.breakdown.slice(0, 4).map((metric: any) => `
              <div class="metric-item">
                <h4>${metric.metricType.replace('_', ' ').toUpperCase()}</h4>
                <p style="color: ${metric.status === 'excellent' ? '#10b981' : metric.status === 'good' ? '#f59e0b' : '#ef4444'};">
                  ${Math.round(metric.normalizedScore)}
                </p>
              </div>
            `).join('')}
          </div>

          <div class="recommendation-box">
            <h3>📋 This Week's Recommendations</h3>
            <ul>
              ${weeklyTrends.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-healthmap-domain.com'}/summary" class="cta-button">View Full Report</a>
            <a href="${process.env.FRONTEND_URL || 'https://your-healthmap-domain.com'}/dashboard" class="cta-button">Update Metrics</a>
          </div>

          <div class="footer">
            <p>This report was automatically generated by Healthmap.</p>
            <p>Questions? Reply to this email or visit our <a href="${process.env.FRONTEND_URL || 'https://your-healthmap-domain.com'}/support">support center</a>.</p>
            <p><a href="${process.env.FRONTEND_URL || 'https://your-healthmap-domain.com'}/settings/notifications">Manage email preferences</a></p>
          </div>
        </body>
      </html>
    `;

    const text = `
      HEALTHMAP WEEKLY HEALTH REPORT
      
      Hello ${user.username || 'there'},
      
      Here's your weekly health summary:
      
      OVERALL HEALTH SCORE: ${healthScore.overallScore} (${healthScore.category.toUpperCase()})
      ${weeklyTrends.scoreChange !== 0 ? `Change from last week: ${weeklyTrends.scoreChange > 0 ? '+' : ''}${weeklyTrends.scoreChange}` : ''}
      
      ${riskAssessment.activeAlerts.length > 0 ? `
      ⚠️ HEALTH ALERTS:
      You have ${riskAssessment.activeAlerts.length} active health alert(s). Please review your detailed report.
      ` : ''}
      
      ${weeklyTrends.achievements.length > 0 ? `
      🎉 THIS WEEK'S ACHIEVEMENTS:
      ${weeklyTrends.achievements.map(achievement => `• ${achievement}`).join('\n')}
      ` : ''}
      
      📋 RECOMMENDATIONS FOR THIS WEEK:
      ${weeklyTrends.recommendations.map(rec => `• ${rec}`).join('\n')}
      
      View your full report: ${process.env.FRONTEND_URL || 'https://your-healthmap-domain.com'}/summary
      
      ---
      This report was automatically generated by Healthmap.
      Manage email preferences: ${process.env.FRONTEND_URL || 'https://your-healthmap-domain.com'}/settings/notifications
    `;

    return { html, text };
  }

  /**
   * Generate PDF attachment
   */
  private async generatePDFAttachment(reportData: WeeklyReportData): Promise<string | null> {
    try {
      const doctorReport = await doctorReportGenerator.generateDoctorReport(reportData.user.id, 'summary');
      const pdfData = doctorReportGenerator.formatForPDF(doctorReport);
      
      // Convert to base64 string for email attachment
      return Buffer.from(JSON.stringify(pdfData, null, 2)).toString('base64');
    } catch (error) {
      console.error('Error generating PDF attachment:', error);
      return null;
    }
  }

  /**
   * Get users who have enabled weekly email reports
   */
  private async getUsersWithAutoEmailEnabled(): Promise<any[]> {
    // TODO: Add user preference for email automation
    // For now, return all users (would filter by preferences in production)
    const allUsers = await storage.getUsers();
    return allUsers.filter(user => user.email && user.preferences?.weeklyEmailReports !== false);
  }

  /**
   * Utility function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop the automation service
   */
  public stopWeeklyAutomation(): void {
    this.isEnabled = false;
    console.log('Weekly email automation stopped');
  }

  /**
   * Manual trigger for testing
   */
  public async sendTestReport(userId: number): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.generateAndSendWeeklyReport(user);
  }
}

// Export singleton instance
export const emailAutomationService = new EmailAutomationService();

// Auto-start when server starts (optional)
if (process.env.NODE_ENV === 'production') {
  emailAutomationService.startWeeklyAutomation();
}