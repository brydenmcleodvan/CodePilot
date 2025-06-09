/**
 * Risk Detection Engine
 * Real-time monitoring of wearable inputs with anomaly detection and emergency alerts
 */

class RiskDetectionEngine {
  constructor() {
    this.activeAlerts = new Map();
    this.userBaselines = new Map();
    this.riskThresholds = new Map();
    this.alertHistory = new Map();
    
    // Risk detection parameters for different health metrics
    this.riskParameters = {
      heart_rate: {
        name: 'Heart Rate Monitoring',
        unit: 'bpm',
        thresholds: {
          critical: {
            min: 40,  // Severe bradycardia
            max: 180, // Severe tachycardia
            description: 'Potentially life-threatening heart rate'
          },
          warning: {
            min: 50,  // Bradycardia
            max: 150, // Tachycardia
            description: 'Abnormal heart rate detected'
          },
          info: {
            deviation_percentage: 0.30, // 30% from baseline
            description: 'Heart rate outside normal pattern'
          }
        },
        emergency_conditions: ['sustained_tachycardia', 'severe_bradycardia', 'irregular_rhythm'],
        baseline_calculation: 'rolling_average_7_days',
        monitoring_frequency: 'continuous'
      },
      
      blood_oxygen: {
        name: 'Blood Oxygen Saturation',
        unit: '%',
        thresholds: {
          critical: {
            min: 85, // Severe hypoxemia
            max: 100,
            description: 'Dangerously low oxygen levels'
          },
          warning: {
            min: 90, // Mild hypoxemia
            max: 100,
            description: 'Low oxygen saturation detected'
          },
          info: {
            min: 95,
            max: 100,
            description: 'Oxygen levels below optimal range'
          }
        },
        emergency_conditions: ['severe_hypoxemia', 'rapid_desaturation'],
        baseline_calculation: 'daily_average',
        monitoring_frequency: 'continuous'
      },
      
      body_temperature: {
        name: 'Body Temperature',
        unit: '°F',
        thresholds: {
          critical: {
            min: 95.0,  // Hypothermia
            max: 104.0, // Hyperthermia
            description: 'Dangerous body temperature'
          },
          warning: {
            min: 96.0,  // Mild hypothermia
            max: 102.0, // High fever
            description: 'Abnormal body temperature'
          },
          info: {
            min: 97.0,
            max: 100.4,
            description: 'Temperature outside normal range'
          }
        },
        emergency_conditions: ['hyperthermia', 'severe_hypothermia'],
        baseline_calculation: 'personal_average',
        monitoring_frequency: 'periodic'
      },
      
      blood_pressure: {
        name: 'Blood Pressure',
        unit: 'mmHg',
        thresholds: {
          critical: {
            systolic_min: 70,  // Severe hypotension
            systolic_max: 200,  // Hypertensive crisis
            diastolic_min: 40,
            diastolic_max: 120,
            description: 'Dangerous blood pressure levels'
          },
          warning: {
            systolic_min: 90,   // Hypotension
            systolic_max: 180,  // Severe hypertension
            diastolic_min: 60,
            diastolic_max: 110,
            description: 'Blood pressure outside safe range'
          },
          info: {
            systolic_min: 100,
            systolic_max: 140,  // Stage 1 hypertension
            diastolic_min: 65,
            diastolic_max: 90,
            description: 'Elevated blood pressure detected'
          }
        },
        emergency_conditions: ['hypertensive_crisis', 'severe_hypotension'],
        baseline_calculation: 'weekly_average',
        monitoring_frequency: 'periodic'
      },
      
      heart_rate_variability: {
        name: 'Heart Rate Variability',
        unit: 'ms',
        thresholds: {
          warning: {
            min: 10,  // Very low HRV
            max: 200, // Extremely high HRV
            description: 'Abnormal heart rate variability'
          },
          info: {
            deviation_percentage: 0.40, // 40% from baseline
            description: 'HRV outside personal normal range'
          }
        },
        emergency_conditions: ['severely_reduced_hrv'],
        baseline_calculation: 'rolling_average_14_days',
        monitoring_frequency: 'daily'
      }
    };

    // Alert severity levels with response protocols
    this.alertSeverity = {
      info: {
        name: 'Informational',
        color: 'blue',
        action_required: false,
        notification_method: 'in_app',
        escalation_time: null,
        description: 'Health metric outside normal range but not concerning'
      },
      warning: {
        name: 'Warning',
        color: 'orange',
        action_required: true,
        notification_method: 'push_notification',
        escalation_time: 30, // minutes
        description: 'Health metric indicates potential health concern'
      },
      critical: {
        name: 'Critical',
        color: 'red',
        action_required: true,
        notification_method: 'immediate_all',
        escalation_time: 5, // minutes
        description: 'Health metric indicates serious health risk'
      }
    };

    this.initializeRiskEngine();
  }

  /**
   * Process real-time wearable data and detect anomalies
   */
  async processWearableData(userId, deviceData) {
    try {
      const alerts = [];
      const timestamp = new Date().toISOString();

      // Process each metric in the device data
      for (const [metric, value] of Object.entries(deviceData)) {
        if (this.riskParameters[metric]) {
          const alert = await this.analyzeMetric(userId, metric, value, timestamp);
          if (alert) {
            alerts.push(alert);
          }
        }
      }

      // Check for pattern-based risks
      const patternAlerts = await this.analyzePatterns(userId, deviceData, timestamp);
      alerts.push(...patternAlerts);

      // Process and store alerts
      for (const alert of alerts) {
        await this.processAlert(userId, alert);
      }

      return {
        success: true,
        alerts_generated: alerts.length,
        alerts,
        processed_metrics: Object.keys(deviceData),
        timestamp
      };

    } catch (error) {
      console.error('Wearable data processing error:', error);
      throw new Error(`Failed to process wearable data: ${error.message}`);
    }
  }

  /**
   * Analyze individual metric for anomalies
   */
  async analyzeMetric(userId, metric, value, timestamp) {
    try {
      const parameters = this.riskParameters[metric];
      const userBaseline = await this.getUserBaseline(userId, metric);
      
      // Check critical thresholds
      const criticalViolation = this.checkCriticalThresholds(metric, value, parameters.thresholds.critical);
      if (criticalViolation) {
        return this.createAlert(userId, metric, value, 'critical', criticalViolation.reason, timestamp);
      }

      // Check warning thresholds
      const warningViolation = this.checkWarningThresholds(metric, value, parameters.thresholds.warning);
      if (warningViolation) {
        return this.createAlert(userId, metric, value, 'warning', warningViolation.reason, timestamp);
      }

      // Check baseline deviation for info alerts
      if (userBaseline && parameters.thresholds.info.deviation_percentage) {
        const deviationPercent = Math.abs(value - userBaseline.average) / userBaseline.average;
        if (deviationPercent > parameters.thresholds.info.deviation_percentage) {
          return this.createAlert(
            userId, 
            metric, 
            value, 
            'info', 
            `${Math.round(deviationPercent * 100)}% deviation from personal baseline`,
            timestamp
          );
        }
      }

      return null;

    } catch (error) {
      console.error('Metric analysis error:', error);
      return null;
    }
  }

  /**
   * Create alert object with proper formatting
   */
  createAlert(userId, metric, value, severity, reason, timestamp) {
    const parameters = this.riskParameters[metric];
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      alert_id: alertId,
      user_id: userId,
      metric_name: metric,
      metric_display_name: parameters.name,
      current_value: value,
      unit: parameters.unit,
      severity,
      reason,
      timestamp,
      requires_action: this.alertSeverity[severity].action_required,
      notification_method: this.alertSeverity[severity].notification_method,
      escalation_time: this.alertSeverity[severity].escalation_time,
      status: 'active',
      acknowledged: false,
      resolved: false
    };
  }

  /**
   * Process and store alert with notifications
   */
  async processAlert(userId, alert) {
    try {
      // Store alert in active alerts
      const userAlerts = this.activeAlerts.get(userId) || [];
      userAlerts.push(alert);
      this.activeAlerts.set(userId, userAlerts);

      // Store in alert history
      const userHistory = this.alertHistory.get(userId) || [];
      userHistory.push(alert);
      this.alertHistory.set(userId, userHistory);

      // Send notifications based on severity
      await this.sendAlertNotifications(userId, alert);

      // Log to Firestore (in production)
      await this.logAlertToFirestore(alert);

      // Check for emergency conditions
      if (alert.severity === 'critical') {
        await this.handleEmergencyAlert(userId, alert);
      }

      return {
        success: true,
        alert_processed: true,
        notifications_sent: true
      };

    } catch (error) {
      console.error('Alert processing error:', error);
      throw new Error(`Failed to process alert: ${error.message}`);
    }
  }

  /**
   * Send notifications based on alert severity
   */
  async sendAlertNotifications(userId, alert) {
    try {
      const notificationMethods = {
        in_app: () => this.sendInAppNotification(userId, alert),
        push_notification: () => this.sendPushNotification(userId, alert),
        immediate_all: () => this.sendAllNotifications(userId, alert)
      };

      const method = this.alertSeverity[alert.severity].notification_method;
      if (notificationMethods[method]) {
        await notificationMethods[method]();
      }

      return { success: true };

    } catch (error) {
      console.error('Notification sending error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle emergency-level alerts
   */
  async handleEmergencyAlert(userId, alert) {
    try {
      // Get user's emergency contacts and preferences
      const emergencyContacts = await this.getUserEmergencyContacts(userId);
      const alertPreferences = await this.getUserAlertPreferences(userId);

      // Send emergency notifications
      if (alertPreferences.emergency_sms_enabled && emergencyContacts.sms) {
        await this.sendEmergencySMS(emergencyContacts.sms, alert);
      }

      if (alertPreferences.emergency_email_enabled && emergencyContacts.email) {
        await this.sendEmergencyEmail(emergencyContacts.email, alert);
      }

      // Log emergency escalation
      console.log(`Emergency alert escalated for user ${userId}: ${alert.reason}`);

      return { success: true, emergency_notifications_sent: true };

    } catch (error) {
      console.error('Emergency alert handling error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's current health alerts
   */
  async getUserAlerts(userId, severity = null) {
    try {
      const userAlerts = this.activeAlerts.get(userId) || [];
      
      let filteredAlerts = userAlerts.filter(alert => alert.status === 'active');
      
      if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
      }

      // Sort by severity and timestamp
      filteredAlerts.sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      return {
        success: true,
        alerts: filteredAlerts,
        total_active: filteredAlerts.length,
        by_severity: {
          critical: filteredAlerts.filter(a => a.severity === 'critical').length,
          warning: filteredAlerts.filter(a => a.severity === 'warning').length,
          info: filteredAlerts.filter(a => a.severity === 'info').length
        }
      };

    } catch (error) {
      console.error('Get user alerts error:', error);
      throw new Error(`Failed to get user alerts: ${error.message}`);
    }
  }

  /**
   * Acknowledge or resolve alert
   */
  async updateAlertStatus(userId, alertId, action) {
    try {
      const userAlerts = this.activeAlerts.get(userId) || [];
      const alertIndex = userAlerts.findIndex(alert => alert.alert_id === alertId);
      
      if (alertIndex === -1) {
        throw new Error('Alert not found');
      }

      const alert = userAlerts[alertIndex];
      
      switch (action) {
        case 'acknowledge':
          alert.acknowledged = true;
          alert.acknowledged_at = new Date().toISOString();
          break;
        case 'resolve':
          alert.resolved = true;
          alert.resolved_at = new Date().toISOString();
          alert.status = 'resolved';
          break;
        case 'dismiss':
          alert.status = 'dismissed';
          alert.dismissed_at = new Date().toISOString();
          break;
      }

      userAlerts[alertIndex] = alert;
      this.activeAlerts.set(userId, userAlerts);

      return {
        success: true,
        alert_updated: true,
        action_taken: action,
        alert_status: alert.status
      };

    } catch (error) {
      console.error('Alert status update error:', error);
      throw new Error(`Failed to update alert status: ${error.message}`);
    }
  }

  // Helper methods for risk detection

  checkCriticalThresholds(metric, value, thresholds) {
    if (metric === 'blood_pressure') {
      // Handle blood pressure as compound metric
      if (value.systolic < thresholds.systolic_min || value.systolic > thresholds.systolic_max ||
          value.diastolic < thresholds.diastolic_min || value.diastolic > thresholds.diastolic_max) {
        return { reason: `Blood pressure ${value.systolic}/${value.diastolic} is in critical range` };
      }
    } else {
      if (value < thresholds.min || value > thresholds.max) {
        return { reason: `${this.riskParameters[metric].name} ${value}${this.riskParameters[metric].unit} is in critical range` };
      }
    }
    return null;
  }

  checkWarningThresholds(metric, value, thresholds) {
    if (metric === 'blood_pressure') {
      if (value.systolic < thresholds.systolic_min || value.systolic > thresholds.systolic_max ||
          value.diastolic < thresholds.diastolic_min || value.diastolic > thresholds.diastolic_max) {
        return { reason: `Blood pressure ${value.systolic}/${value.diastolic} is in warning range` };
      }
    } else {
      if (value < thresholds.min || value > thresholds.max) {
        return { reason: `${this.riskParameters[metric].name} ${value}${this.riskParameters[metric].unit} is in warning range` };
      }
    }
    return null;
  }

  async getUserBaseline(userId, metric) {
    // In production, calculate from historical data
    return {
      average: 72, // Example baseline heart rate
      standard_deviation: 8,
      sample_size: 100,
      last_updated: new Date().toISOString()
    };
  }

  async logAlertToFirestore(alert) {
    // In production, log to Firestore user_alerts collection
    console.log(`Alert logged to Firestore: ${alert.alert_id}`);
    return { success: true };
  }

  async sendInAppNotification(userId, alert) {
    console.log(`In-app notification sent to user ${userId}: ${alert.reason}`);
    return { success: true };
  }

  async sendPushNotification(userId, alert) {
    console.log(`Push notification sent to user ${userId}: ${alert.reason}`);
    return { success: true };
  }

  async sendAllNotifications(userId, alert) {
    await this.sendInAppNotification(userId, alert);
    await this.sendPushNotification(userId, alert);
    console.log(`All notifications sent to user ${userId}: ${alert.reason}`);
    return { success: true };
  }

  async sendEmergencySMS(phoneNumber, alert) {
    // In production, integrate with Twilio or similar SMS service
    console.log(`Emergency SMS sent to ${phoneNumber}: HEALTH ALERT - ${alert.reason}`);
    return { success: true };
  }

  async sendEmergencyEmail(email, alert) {
    // In production, integrate with SendGrid or similar email service
    console.log(`Emergency email sent to ${email}: Health Alert - ${alert.reason}`);
    return { success: true };
  }

  async getUserEmergencyContacts(userId) {
    // Return user's emergency contact information
    return {
      sms: '+1234567890',
      email: 'emergency@example.com'
    };
  }

  async getUserAlertPreferences(userId) {
    // Return user's alert notification preferences
    return {
      emergency_sms_enabled: true,
      emergency_email_enabled: true,
      push_notifications_enabled: true
    };
  }

  initializeRiskEngine() {
    console.log('Risk Detection Engine initialized with real-time monitoring capabilities');
  }
}

// Export singleton instance
const riskDetectionEngine = new RiskDetectionEngine();

module.exports = {
  RiskDetectionEngine,
  riskDetectionEngine
};