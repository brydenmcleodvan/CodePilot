/**
 * Custom Alerts Engine Backend
 * Processes user-defined health alert rules and triggers notifications
 */

const { rateLimitingService } = require('./rateLimitingService');
const { backgroundTaskQueue } = require('./backgroundTaskQueue');

class CustomAlertsEngine {
  constructor() {
    this.alerts = new Map(); // In production, this would be database storage
    this.alertHistory = new Map();
    this.isMonitoring = false;
    
    // Alert processing intervals
    this.processingIntervals = {
      immediate: 30000,    // 30 seconds
      short: 300000,       // 5 minutes  
      medium: 900000,      // 15 minutes
      long: 3600000        // 1 hour
    };
    
    this.startMonitoring();
  }

  /**
   * Create a new custom alert
   */
  async createAlert(userId, alertData) {
    // Validate alert data
    const validation = this.validateAlertData(alertData);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Check user limits
    const userAlerts = Array.from(this.alerts.values()).filter(alert => alert.userId === userId);
    if (userAlerts.length >= 10) {
      throw new Error('Maximum number of alerts reached (10 per user)');
    }

    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: alertData.name,
      metric: alertData.metric,
      condition: alertData.condition,
      value: parseFloat(alertData.value) || null,
      duration: alertData.duration,
      priority: alertData.priority || 'medium',
      notificationMethods: alertData.notificationMethods || ['push'],
      isActive: alertData.isActive !== false,
      createdAt: new Date(),
      lastTriggered: null,
      triggerCount: 0,
      lastChecked: null,
      conditionMet: false,
      conditionMetSince: null
    };

    this.alerts.set(alert.id, alert);
    console.log(`Alert created: ${alert.id} for user ${userId}`);
    
    return alert;
  }

  /**
   * Update existing alert
   */
  async updateAlert(alertId, userId, alertData) {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.userId !== userId) {
      throw new Error('Alert not found or access denied');
    }

    const validation = this.validateAlertData(alertData);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Update alert properties
    Object.assign(alert, {
      name: alertData.name,
      metric: alertData.metric,
      condition: alertData.condition,
      value: parseFloat(alertData.value) || null,
      duration: alertData.duration,
      priority: alertData.priority,
      notificationMethods: alertData.notificationMethods,
      isActive: alertData.isActive,
      updatedAt: new Date()
    });

    this.alerts.set(alertId, alert);
    return alert;
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId, userId) {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.userId !== userId) {
      throw new Error('Alert not found or access denied');
    }

    this.alerts.delete(alertId);
    return true;
  }

  /**
   * Get user alerts
   */
  getUserAlerts(userId) {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .map(alert => ({
        ...alert,
        triggeredToday: this.getTodayTriggerCount(alert.id)
      }));
  }

  /**
   * Toggle alert active state
   */
  async toggleAlert(alertId, userId, isActive) {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.userId !== userId) {
      throw new Error('Alert not found or access denied');
    }

    alert.isActive = isActive;
    alert.updatedAt = new Date();
    
    this.alerts.set(alertId, alert);
    return alert;
  }

  /**
   * Process health data and check alerts
   */
  async processHealthData(userId, healthData) {
    const userAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId && alert.isActive);

    const triggeredAlerts = [];

    for (const alert of userAlerts) {
      const shouldTrigger = await this.evaluateAlert(alert, healthData);
      
      if (shouldTrigger) {
        await this.triggerAlert(alert);
        triggeredAlerts.push(alert);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Evaluate if alert condition is met
   */
  async evaluateAlert(alert, healthData) {
    const metricValue = healthData[alert.metric];
    if (metricValue === undefined || metricValue === null) {
      return false;
    }

    const now = new Date();
    let conditionMet = false;

    // Evaluate condition
    switch (alert.condition) {
      case 'above':
        conditionMet = metricValue > alert.value;
        break;
      case 'below':
        conditionMet = metricValue < alert.value;
        break;
      case 'equals':
        conditionMet = Math.abs(metricValue - alert.value) < 0.01;
        break;
      case 'trend_up':
        conditionMet = await this.checkTrend(alert.userId, alert.metric, 'up');
        break;
      case 'trend_down':
        conditionMet = await this.checkTrend(alert.userId, alert.metric, 'down');
        break;
      default:
        return false;
    }

    // Handle duration requirements
    if (alert.duration && conditionMet) {
      if (!alert.conditionMet) {
        // Condition just became true
        alert.conditionMet = true;
        alert.conditionMetSince = now;
        return false; // Don't trigger yet
      } else {
        // Check if duration has passed
        const durationMs = this.parseDuration(alert.duration);
        const timeSinceConditionMet = now - alert.conditionMetSince;
        
        if (timeSinceConditionMet >= durationMs) {
          alert.conditionMet = false; // Reset for next time
          alert.conditionMetSince = null;
          return true;
        }
        return false;
      }
    } else if (!conditionMet) {
      // Reset condition state if no longer met
      alert.conditionMet = false;
      alert.conditionMetSince = null;
      return false;
    }

    return conditionMet && !alert.duration;
  }

  /**
   * Check trend for metric
   */
  async checkTrend(userId, metric, direction) {
    // Get recent data points for trend analysis
    const recentData = await this.getRecentMetricData(userId, metric, 7); // Last 7 days
    
    if (recentData.length < 3) {
      return false; // Need at least 3 data points
    }

    // Calculate simple trend
    const values = recentData.map(d => d.value);
    const trend = this.calculateTrend(values);
    
    return direction === 'up' ? trend > 0.1 : trend < -0.1;
  }

  /**
   * Calculate trend from values array
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = n * (n - 1) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Trigger alert notification
   */
  async triggerAlert(alert) {
    const now = new Date();
    
    // Check cooldown period to prevent spam
    if (alert.lastTriggered) {
      const timeSinceLastTrigger = now - alert.lastTriggered;
      const cooldownMs = this.getCooldownPeriod(alert.priority);
      
      if (timeSinceLastTrigger < cooldownMs) {
        return false; // Still in cooldown
      }
    }

    alert.lastTriggered = now;
    alert.triggerCount++;

    // Log alert trigger
    console.log(`Alert triggered: ${alert.id} (${alert.name}) for user ${alert.userId}`);
    
    // Store in history
    this.recordAlertTrigger(alert);

    // Send notifications
    await this.sendNotifications(alert);

    return true;
  }

  /**
   * Send notifications for triggered alert
   */
  async sendNotifications(alert) {
    const notifications = [];

    for (const method of alert.notificationMethods) {
      try {
        switch (method) {
          case 'push':
            await this.sendPushNotification(alert);
            notifications.push({ method: 'push', success: true });
            break;
          case 'email':
            await this.sendEmailNotification(alert);
            notifications.push({ method: 'email', success: true });
            break;
          default:
            console.warn(`Unknown notification method: ${method}`);
        }
      } catch (error) {
        console.error(`Failed to send ${method} notification:`, error);
        notifications.push({ method, success: false, error: error.message });
      }
    }

    return notifications;
  }

  /**
   * Send push notification
   */
  async sendPushNotification(alert) {
    const message = this.formatAlertMessage(alert);
    
    // Queue push notification task
    await backgroundTaskQueue.addTask('push_notification', {
      userId: alert.userId,
      title: `Health Alert: ${alert.name}`,
      body: message,
      priority: alert.priority,
      alertId: alert.id
    }, alert.userId);
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(alert) {
    const message = this.formatAlertMessage(alert, 'email');
    
    // Queue email task
    await backgroundTaskQueue.addTask('email_alert', {
      userId: alert.userId,
      subject: `Health Alert: ${alert.name}`,
      content: message,
      priority: alert.priority,
      alertId: alert.id
    }, alert.userId);
  }

  /**
   * Format alert message
   */
  formatAlertMessage(alert, format = 'push') {
    const metricName = alert.metric.replace('_', ' ');
    let message = `Your ${metricName}`;

    switch (alert.condition) {
      case 'above':
        message += ` is above ${alert.value}`;
        break;
      case 'below':
        message += ` is below ${alert.value}`;
        break;
      case 'equals':
        message += ` equals ${alert.value}`;
        break;
      case 'trend_up':
        message += ` is trending upward`;
        break;
      case 'trend_down':
        message += ` is trending downward`;
        break;
    }

    if (alert.duration) {
      message += ` for ${alert.duration.replace('_', ' ')}`;
    }

    if (format === 'email') {
      message += `.\n\nThis is an automated alert from your Healthmap monitoring system.`;
    }

    return message;
  }

  /**
   * Start monitoring loop
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Start different monitoring intervals
    setInterval(() => this.checkImmediateAlerts(), this.processingIntervals.immediate);
    setInterval(() => this.processScheduledChecks(), this.processingIntervals.medium);
    
    console.log('Custom alerts monitoring started');
  }

  /**
   * Check alerts that need immediate processing
   */
  async checkImmediateAlerts() {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.isActive && !alert.duration);

    for (const alert of activeAlerts) {
      try {
        // Get latest health data for user
        const healthData = await this.getLatestHealthData(alert.userId);
        if (healthData) {
          await this.evaluateAlert(alert, healthData);
        }
      } catch (error) {
        console.error(`Error checking immediate alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Process scheduled alert checks
   */
  async processScheduledChecks() {
    const durationAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.isActive && alert.duration);

    for (const alert of durationAlerts) {
      try {
        const healthData = await this.getLatestHealthData(alert.userId);
        if (healthData) {
          const shouldTrigger = await this.evaluateAlert(alert, healthData);
          if (shouldTrigger) {
            await this.triggerAlert(alert);
          }
        }
      } catch (error) {
        console.error(`Error checking duration alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Helper methods
   */
  validateAlertData(data) {
    if (!data.name || data.name.trim().length === 0) {
      return { valid: false, message: 'Alert name is required' };
    }
    
    if (!data.metric) {
      return { valid: false, message: 'Health metric is required' };
    }
    
    if (!data.condition) {
      return { valid: false, message: 'Alert condition is required' };
    }
    
    if (['above', 'below', 'equals'].includes(data.condition) && !data.value) {
      return { valid: false, message: 'Threshold value is required for this condition' };
    }
    
    return { valid: true };
  }

  parseDuration(duration) {
    const durations = {
      '15_minutes': 15 * 60 * 1000,
      '1_hour': 60 * 60 * 1000,
      '3_hours': 3 * 60 * 60 * 1000,
      '1_day': 24 * 60 * 60 * 1000,
      '3_days': 3 * 24 * 60 * 60 * 1000,
      '1_week': 7 * 24 * 60 * 60 * 1000
    };
    return durations[duration] || 0;
  }

  getCooldownPeriod(priority) {
    const cooldowns = {
      'high': 5 * 60 * 1000,    // 5 minutes
      'medium': 30 * 60 * 1000, // 30 minutes
      'low': 2 * 60 * 60 * 1000 // 2 hours
    };
    return cooldowns[priority] || cooldowns.medium;
  }

  recordAlertTrigger(alert) {
    const historyKey = `${alert.id}_${new Date().toDateString()}`;
    const history = this.alertHistory.get(historyKey) || [];
    history.push({
      triggeredAt: new Date(),
      alertName: alert.name,
      condition: alert.condition,
      value: alert.value
    });
    this.alertHistory.set(historyKey, history);
  }

  getTodayTriggerCount(alertId) {
    const historyKey = `${alertId}_${new Date().toDateString()}`;
    const history = this.alertHistory.get(historyKey) || [];
    return history.length;
  }

  async getLatestHealthData(userId) {
    // In production, this would fetch from your health data storage
    // For now, return mock data structure
    return {
      heart_rate: 72 + Math.random() * 20,
      hrv: 35 + Math.random() * 10,
      glucose: 90 + Math.random() * 30,
      blood_pressure: 120 + Math.random() * 20,
      weight: 70 + Math.random() * 5,
      sleep: 7 + Math.random() * 2
    };
  }

  async getRecentMetricData(userId, metric, days) {
    // Mock data for trend analysis
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date,
        value: 70 + Math.random() * 20 + (i * Math.random() * 2) // Slight upward trend
      });
    }
    return data;
  }
}

// Export singleton instance
const customAlertsEngine = new CustomAlertsEngine();

module.exports = {
  CustomAlertsEngine,
  customAlertsEngine
};