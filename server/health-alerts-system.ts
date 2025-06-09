/**
 * Health Alerts System
 * Detects critical trends from connected services and generates actionable alerts
 */

import { storage } from './storage';
import { streakCounter } from './streak-counter';

interface HealthAlert {
  id: string;
  userId: number;
  type: 'critical_metric' | 'missed_goals' | 'symptom_pattern' | 'device_disconnect' | 'medication_reminder';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  metadata: {
    metricType?: string;
    values?: number[];
    timeframe?: string;
    thresholds?: { min?: number; max?: number };
    deviceSource?: string;
    goalId?: string;
    symptomPattern?: string[];
    recommendations?: string[];
  };
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  escalatedTo?: string[]; // healthcare provider IDs
}

interface AlertRule {
  id: string;
  name: string;
  type: HealthAlert['type'];
  enabled: boolean;
  conditions: {
    metricType?: string;
    thresholdHigh?: number;
    thresholdLow?: number;
    consecutiveDays?: number;
    missedGoalDays?: number;
    symptomFrequency?: number;
    deviceInactivityHours?: number;
  };
  severity: HealthAlert['severity'];
  escalateAfterHours?: number;
  notificationChannels: ('app' | 'email' | 'sms' | 'provider')[];
}

export class HealthAlertsSystem {
  private alerts: Map<string, HealthAlert> = new Map();
  private alertRules: AlertRule[] = [
    {
      id: 'blood_pressure_high',
      name: 'High Blood Pressure Alert',
      type: 'critical_metric',
      enabled: true,
      conditions: {
        metricType: 'blood_pressure_systolic',
        thresholdHigh: 140,
        consecutiveDays: 3
      },
      severity: 'high',
      escalateAfterHours: 6,
      notificationChannels: ['app', 'provider']
    },
    {
      id: 'heart_rate_abnormal',
      name: 'Abnormal Heart Rate',
      type: 'critical_metric',
      enabled: true,
      conditions: {
        metricType: 'heart_rate',
        thresholdHigh: 100,
        thresholdLow: 50,
        consecutiveDays: 2
      },
      severity: 'medium',
      escalateAfterHours: 12,
      notificationChannels: ['app', 'email']
    },
    {
      id: 'goal_streak_broken',
      name: 'Critical Goal Streak Broken',
      type: 'missed_goals',
      enabled: true,
      conditions: {
        missedGoalDays: 7
      },
      severity: 'medium',
      notificationChannels: ['app', 'email']
    },
    {
      id: 'device_disconnected',
      name: 'Health Device Disconnected',
      type: 'device_disconnect',
      enabled: true,
      conditions: {
        deviceInactivityHours: 48
      },
      severity: 'low',
      notificationChannels: ['app']
    },
    {
      id: 'pain_pattern_detected',
      name: 'Recurring Pain Pattern',
      type: 'symptom_pattern',
      enabled: true,
      conditions: {
        symptomFrequency: 5
      },
      severity: 'medium',
      escalateAfterHours: 24,
      notificationChannels: ['app', 'provider']
    }
  ];

  /**
   * Monitor health data and trigger alerts based on rules
   */
  async monitorHealthData(): Promise<void> {
    try {
      const users = await storage.getAllUsers?.() || [];
      
      for (const user of users) {
        await this.checkUserAlerts(user.id);
      }
    } catch (error) {
      console.error('Error monitoring health data:', error);
    }
  }

  /**
   * Check alerts for a specific user
   */
  async checkUserAlerts(userId: number): Promise<HealthAlert[]> {
    const triggeredAlerts: HealthAlert[] = [];

    try {
      for (const rule of this.alertRules.filter(r => r.enabled)) {
        const alert = await this.evaluateRule(userId, rule);
        if (alert) {
          await this.triggerAlert(alert);
          triggeredAlerts.push(alert);
        }
      }
    } catch (error) {
      console.error(`Error checking alerts for user ${userId}:`, error);
    }

    return triggeredAlerts;
  }

  /**
   * Evaluate a specific alert rule for a user
   */
  private async evaluateRule(userId: number, rule: AlertRule): Promise<HealthAlert | null> {
    switch (rule.type) {
      case 'critical_metric':
        return await this.evaluateMetricRule(userId, rule);
      case 'missed_goals':
        return await this.evaluateGoalRule(userId, rule);
      case 'device_disconnect':
        return await this.evaluateDeviceRule(userId, rule);
      case 'symptom_pattern':
        return await this.evaluateSymptomRule(userId, rule);
      default:
        return null;
    }
  }

  /**
   * Evaluate metric-based alert rules
   */
  private async evaluateMetricRule(userId: number, rule: AlertRule): Promise<HealthAlert | null> {
    if (!rule.conditions.metricType) return null;

    const healthMetrics = await storage.getHealthMetrics(userId);
    const relevantMetrics = healthMetrics
      .filter(m => m.metricType === rule.conditions.metricType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, rule.conditions.consecutiveDays || 1);

    if (relevantMetrics.length < (rule.conditions.consecutiveDays || 1)) {
      return null;
    }

    const values = relevantMetrics.map(m => parseFloat(m.value)).filter(v => !isNaN(v));
    const isHighAlert = rule.conditions.thresholdHigh && 
                       values.every(v => v > rule.conditions.thresholdHigh!);
    const isLowAlert = rule.conditions.thresholdLow && 
                      values.every(v => v < rule.conditions.thresholdLow!);

    if (isHighAlert || isLowAlert) {
      const alertId = `${rule.id}_${userId}_${Date.now()}`;
      const threshold = isHighAlert ? rule.conditions.thresholdHigh : rule.conditions.thresholdLow;
      const direction = isHighAlert ? 'above' : 'below';

      return {
        id: alertId,
        userId,
        type: rule.type,
        severity: rule.severity,
        title: rule.name,
        message: `${rule.conditions.metricType} has been consistently ${direction} ${threshold} for ${rule.conditions.consecutiveDays || 1} day(s)`,
        actionRequired: rule.severity === 'high' || rule.severity === 'critical',
        metadata: {
          metricType: rule.conditions.metricType,
          values: values,
          timeframe: `${rule.conditions.consecutiveDays || 1} days`,
          thresholds: {
            min: rule.conditions.thresholdLow,
            max: rule.conditions.thresholdHigh
          },
          recommendations: this.getMetricRecommendations(rule.conditions.metricType, isHighAlert)
        },
        triggeredAt: new Date()
      };
    }

    return null;
  }

  /**
   * Evaluate goal-based alert rules
   */
  private async evaluateGoalRule(userId: number, rule: AlertRule): Promise<HealthAlert | null> {
    const goals = await storage.getHealthGoals(userId);
    const missedGoals: string[] = [];

    for (const goal of goals) {
      const streak = streakCounter.getStreak(userId, goal.id);
      if (streak && streak.currentStreak === 0) {
        const daysSinceLastCompletion = Math.floor(
          (Date.now() - new Date(streak.lastCompletedDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastCompletion >= (rule.conditions.missedGoalDays || 7)) {
          missedGoals.push(goal.metricType || goal.id);
        }
      }
    }

    if (missedGoals.length > 0) {
      const alertId = `${rule.id}_${userId}_${Date.now()}`;
      
      return {
        id: alertId,
        userId,
        type: rule.type,
        severity: rule.severity,
        title: 'Goals Need Attention',
        message: `You haven't completed ${missedGoals.length} goal(s) for ${rule.conditions.missedGoalDays} days: ${missedGoals.join(', ')}`,
        actionRequired: true,
        metadata: {
          goalId: missedGoals[0],
          timeframe: `${rule.conditions.missedGoalDays} days`,
          recommendations: [
            'Consider adjusting your goal targets',
            'Review your daily routine for obstacles',
            'Use grace days to recover streaks',
            'Speak with your healthcare provider if needed'
          ]
        },
        triggeredAt: new Date()
      };
    }

    return null;
  }

  /**
   * Evaluate device connectivity rules
   */
  private async evaluateDeviceRule(userId: number, rule: AlertRule): Promise<HealthAlert | null> {
    const connectedServices = await storage.getConnectedServices(userId);
    const inactiveDevices: string[] = [];

    for (const service of connectedServices) {
      if (service.lastSync) {
        const hoursSinceSync = (Date.now() - new Date(service.lastSync).getTime()) / (1000 * 60 * 60);
        if (hoursSinceSync > (rule.conditions.deviceInactivityHours || 48)) {
          inactiveDevices.push(service.serviceName);
        }
      }
    }

    if (inactiveDevices.length > 0) {
      const alertId = `${rule.id}_${userId}_${Date.now()}`;
      
      return {
        id: alertId,
        userId,
        type: rule.type,
        severity: rule.severity,
        title: 'Device Connection Issues',
        message: `${inactiveDevices.join(', ')} haven't synced data recently`,
        actionRequired: false,
        metadata: {
          deviceSource: inactiveDevices.join(', '),
          timeframe: `${rule.conditions.deviceInactivityHours} hours`,
          recommendations: [
            'Check device battery and connectivity',
            'Reconnect devices in Settings',
            'Contact device support if issues persist'
          ]
        },
        triggeredAt: new Date()
      };
    }

    return null;
  }

  /**
   * Evaluate symptom pattern rules
   */
  private async evaluateSymptomRule(userId: number, rule: AlertRule): Promise<HealthAlert | null> {
    const symptoms = await storage.getSymptoms(userId);
    const recentSymptoms = symptoms.filter(s => {
      const daysSince = (Date.now() - new Date(s.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 14; // Last 2 weeks
    });

    const symptomCounts = recentSymptoms.reduce((acc, symptom) => {
      acc[symptom.symptomType] = (acc[symptom.symptomType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequentSymptoms = Object.entries(symptomCounts)
      .filter(([_, count]) => count >= (rule.conditions.symptomFrequency || 5))
      .map(([symptom, count]) => `${symptom} (${count}x)`);

    if (frequentSymptoms.length > 0) {
      const alertId = `${rule.id}_${userId}_${Date.now()}`;
      
      return {
        id: alertId,
        userId,
        type: rule.type,
        severity: rule.severity,
        title: 'Recurring Symptom Pattern',
        message: `Frequent symptoms detected: ${frequentSymptoms.join(', ')}`,
        actionRequired: true,
        metadata: {
          symptomPattern: frequentSymptoms,
          timeframe: '14 days',
          recommendations: [
            'Schedule an appointment with your healthcare provider',
            'Keep a detailed symptom diary',
            'Note any triggers or patterns',
            'Review medications and supplements'
          ]
        },
        triggeredAt: new Date(),
        escalatedTo: [] // Will be populated if escalation is needed
      };
    }

    return null;
  }

  /**
   * Get metric-specific recommendations
   */
  private getMetricRecommendations(metricType: string, isHigh: boolean): string[] {
    const recommendations: Record<string, { high: string[], low: string[] }> = {
      blood_pressure_systolic: {
        high: [
          'Reduce sodium intake and increase potassium-rich foods',
          'Engage in regular aerobic exercise',
          'Manage stress through meditation or relaxation techniques',
          'Contact your healthcare provider immediately'
        ],
        low: [
          'Increase fluid intake if dehydrated',
          'Avoid sudden position changes',
          'Review medications with your healthcare provider',
          'Monitor for dizziness or lightheadedness'
        ]
      },
      heart_rate: {
        high: [
          'Practice deep breathing exercises',
          'Reduce caffeine and stimulant intake',
          'Ensure adequate rest and sleep',
          'Consult your healthcare provider if persistent'
        ],
        low: [
          'Monitor for symptoms like fatigue or dizziness',
          'Ensure you\'re getting adequate nutrition',
          'Discuss with your healthcare provider',
          'Consider cardiac evaluation if concerning'
        ]
      }
    };

    return recommendations[metricType]?.[isHigh ? 'high' : 'low'] || [
      'Monitor this metric closely',
      'Consult with your healthcare provider',
      'Make note of any symptoms or changes'
    ];
  }

  /**
   * Trigger an alert and handle notifications
   */
  private async triggerAlert(alert: HealthAlert): Promise<void> {
    // Check if similar alert already exists and is recent
    const existingAlert = Array.from(this.alerts.values()).find(a => 
      a.userId === alert.userId && 
      a.type === alert.type && 
      a.metadata.metricType === alert.metadata.metricType &&
      !a.resolvedAt &&
      (Date.now() - a.triggeredAt.getTime()) < 24 * 60 * 60 * 1000 // Within 24 hours
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    this.alerts.set(alert.id, alert);
    
    // Send notifications based on rule configuration
    await this.sendNotifications(alert);
    
    console.log(`Health alert triggered: ${alert.title} for user ${alert.userId} (${alert.severity})`);
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(alert: HealthAlert): Promise<void> {
    // This would integrate with notification services
    // For now, just log the notifications that would be sent
    
    console.log(`Notification would be sent for alert ${alert.id}:`);
    console.log(`- App notification: ${alert.title}`);
    console.log(`- Message: ${alert.message}`);
    
    if (alert.actionRequired) {
      console.log(`- Action required: Yes`);
    }
  }

  /**
   * Get alerts for a specific user
   */
  async getUserAlerts(userId: number, includeResolved: boolean = false): Promise<HealthAlert[]> {
    const userAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .filter(alert => includeResolved || !alert.resolvedAt)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());

    return userAlerts;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: number): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.userId !== userId) {
      return false;
    }

    alert.acknowledgedAt = new Date();
    this.alerts.set(alertId, alert);
    return true;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: number): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.userId !== userId) {
      return false;
    }

    alert.resolvedAt = new Date();
    this.alerts.set(alertId, alert);
    return true;
  }

  /**
   * Get system-wide alert statistics
   */
  getAlertStatistics(): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    unacknowledged: number;
    resolved: number;
  } {
    const alerts = Array.from(this.alerts.values());
    
    return {
      total: alerts.length,
      bySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      unacknowledged: alerts.filter(a => !a.acknowledgedAt).length,
      resolved: alerts.filter(a => a.resolvedAt).length
    };
  }
}

export const healthAlertsSystem = new HealthAlertsSystem();

// Start monitoring health data every 30 minutes
setInterval(() => {
  healthAlertsSystem.monitorHealthData().catch(console.error);
}, 30 * 60 * 1000);