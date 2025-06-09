/**
 * Risk Detection Engine
 * Flags health anomalies and critical alerts for unsafe metric ranges
 * Provides real-time health monitoring with emergency thresholds
 */

import { storage } from './storage';
import { HealthMetric, User } from '@shared/schema';

export interface HealthAlert {
  id: string;
  userId: number;
  type: 'critical' | 'warning' | 'caution';
  severity: 'emergency' | 'urgent' | 'moderate' | 'mild';
  metricType: string;
  currentValue: number;
  threshold: {
    min?: number;
    max?: number;
    criticalMin?: number;
    criticalMax?: number;
  };
  message: string;
  recommendation: string;
  timeDetected: Date;
  isActive: boolean;
  requiresImmediateAction: boolean;
}

export interface AnomalyDetection {
  metricType: string;
  anomalyType: 'sudden_spike' | 'sudden_drop' | 'sustained_elevation' | 'sustained_depression' | 'erratic_pattern';
  severity: 'high' | 'medium' | 'low';
  confidence: number; // 0-100%
  detectionMethod: 'threshold' | 'statistical' | 'trend_analysis';
  description: string;
  timeframe: string;
  affectedReadings: number;
}

export interface RiskAssessment {
  userId: number;
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  activeAlerts: HealthAlert[];
  detectedAnomalies: AnomalyDetection[];
  riskFactors: {
    factor: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    modifiable: boolean;
  }[];
  emergencyContacts: {
    shouldContact: boolean;
    urgency: 'immediate' | 'same_day' | 'next_available';
    contactType: 'emergency_services' | 'primary_care' | 'specialist';
    reason: string;
  }[];
  generatedAt: Date;
}

export class RiskDetectionEngine {
  private readonly criticalThresholds = {
    heart_rate: {
      criticalMin: 40,
      criticalMax: 180,
      warningMin: 50,
      warningMax: 150
    },
    blood_pressure_systolic: {
      criticalMin: 70,
      criticalMax: 200,
      warningMin: 90,
      warningMax: 160
    },
    glucose: {
      criticalMin: 50,
      criticalMax: 300,
      warningMin: 70,
      warningMax: 180
    },
    heart_rate_variability: {
      criticalMin: 10,
      warningMin: 25,
      warningMax: 100
    },
    sleep: {
      criticalMin: 3,
      warningMin: 5,
      warningMax: 12
    },
    body_temperature: {
      criticalMin: 35.0,
      criticalMax: 40.0,
      warningMin: 36.0,
      warningMax: 38.5
    },
    oxygen_saturation: {
      criticalMin: 88,
      warningMin: 95
    }
  };

  /**
   * Perform comprehensive risk assessment
   */
  async performRiskAssessment(userId: number): Promise<RiskAssessment> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const recentMetrics = healthMetrics.filter(m => 
      m.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    // Detect critical alerts
    const activeAlerts = this.detectCriticalAlerts(recentMetrics, userId);
    
    // Detect anomalies
    const detectedAnomalies = this.detectAnomalies(healthMetrics, userId);
    
    // Assess risk factors
    const riskFactors = this.assessRiskFactors(healthMetrics, activeAlerts);
    
    // Determine emergency contacts needed
    const emergencyContacts = this.determineEmergencyContacts(activeAlerts, detectedAnomalies);
    
    // Calculate overall risk level
    const overallRiskLevel = this.calculateOverallRisk(activeAlerts, detectedAnomalies, riskFactors);

    return {
      userId,
      overallRiskLevel,
      activeAlerts,
      detectedAnomalies,
      riskFactors,
      emergencyContacts,
      generatedAt: new Date()
    };
  }

  /**
   * Detect critical health alerts
   */
  private detectCriticalAlerts(metrics: HealthMetric[], userId: number): HealthAlert[] {
    const alerts: HealthAlert[] = [];
    
    for (const metric of metrics) {
      const value = parseFloat(metric.value);
      const thresholds = this.criticalThresholds[metric.metricType as keyof typeof this.criticalThresholds];
      
      if (!thresholds) continue;

      // Check for critical thresholds
      if (this.isCriticalThreshold(value, thresholds)) {
        alerts.push(this.createCriticalAlert(metric, value, thresholds, userId));
      }
      // Check for warning thresholds
      else if (this.isWarningThreshold(value, thresholds)) {
        alerts.push(this.createWarningAlert(metric, value, thresholds, userId));
      }
    }

    return alerts;
  }

  /**
   * Check if value exceeds critical thresholds
   */
  private isCriticalThreshold(value: number, thresholds: any): boolean {
    return (thresholds.criticalMin !== undefined && value < thresholds.criticalMin) ||
           (thresholds.criticalMax !== undefined && value > thresholds.criticalMax);
  }

  /**
   * Check if value exceeds warning thresholds
   */
  private isWarningThreshold(value: number, thresholds: any): boolean {
    return (thresholds.warningMin !== undefined && value < thresholds.warningMin) ||
           (thresholds.warningMax !== undefined && value > thresholds.warningMax);
  }

  /**
   * Create critical alert
   */
  private createCriticalAlert(metric: HealthMetric, value: number, thresholds: any, userId: number): HealthAlert {
    const isLow = thresholds.criticalMin !== undefined && value < thresholds.criticalMin;
    const isHigh = thresholds.criticalMax !== undefined && value > thresholds.criticalMax;

    return {
      id: `critical-${metric.metricType}-${Date.now()}`,
      userId,
      type: 'critical',
      severity: 'emergency',
      metricType: metric.metricType,
      currentValue: value,
      threshold: thresholds,
      message: this.getCriticalMessage(metric.metricType, value, isLow, isHigh),
      recommendation: this.getCriticalRecommendation(metric.metricType, isLow, isHigh),
      timeDetected: new Date(),
      isActive: true,
      requiresImmediateAction: true
    };
  }

  /**
   * Create warning alert
   */
  private createWarningAlert(metric: HealthMetric, value: number, thresholds: any, userId: number): HealthAlert {
    const isLow = thresholds.warningMin !== undefined && value < thresholds.warningMin;
    const isHigh = thresholds.warningMax !== undefined && value > thresholds.warningMax;

    return {
      id: `warning-${metric.metricType}-${Date.now()}`,
      userId,
      type: 'warning',
      severity: 'urgent',
      metricType: metric.metricType,
      currentValue: value,
      threshold: thresholds,
      message: this.getWarningMessage(metric.metricType, value, isLow, isHigh),
      recommendation: this.getWarningRecommendation(metric.metricType, isLow, isHigh),
      timeDetected: new Date(),
      isActive: true,
      requiresImmediateAction: false
    };
  }

  /**
   * Detect statistical anomalies
   */
  private detectAnomalies(metrics: HealthMetric[], userId: number): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];

    for (const metricType of metricTypes) {
      const typeMetrics = metrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (typeMetrics.length < 10) continue; // Need sufficient data

      // Detect sudden spikes/drops
      const spikeAnomaly = this.detectSuddenChanges(typeMetrics, metricType);
      if (spikeAnomaly) anomalies.push(spikeAnomaly);

      // Detect sustained elevation/depression
      const sustainedAnomaly = this.detectSustainedAbnormalities(typeMetrics, metricType);
      if (sustainedAnomaly) anomalies.push(sustainedAnomaly);

      // Detect erratic patterns
      const erraticAnomaly = this.detectErraticPatterns(typeMetrics, metricType);
      if (erraticAnomaly) anomalies.push(erraticAnomaly);
    }

    return anomalies;
  }

  /**
   * Detect sudden changes in metrics
   */
  private detectSuddenChanges(metrics: HealthMetric[], metricType: string): AnomalyDetection | null {
    const values = metrics.map(m => parseFloat(m.value));
    const recentValues = values.slice(-5);
    const historicalMean = values.slice(0, -5).reduce((sum, val) => sum + val, 0) / (values.length - 5);
    const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    
    const percentChange = Math.abs((recentMean - historicalMean) / historicalMean) * 100;
    
    if (percentChange > 30) { // 30% change threshold
      return {
        metricType,
        anomalyType: recentMean > historicalMean ? 'sudden_spike' : 'sudden_drop',
        severity: percentChange > 50 ? 'high' : percentChange > 40 ? 'medium' : 'low',
        confidence: Math.min(95, percentChange * 2),
        detectionMethod: 'statistical',
        description: `${percentChange.toFixed(1)}% ${recentMean > historicalMean ? 'increase' : 'decrease'} detected in recent readings`,
        timeframe: 'Last 5 readings',
        affectedReadings: recentValues.length
      };
    }

    return null;
  }

  /**
   * Detect sustained abnormalities
   */
  private detectSustainedAbnormalities(metrics: HealthMetric[], metricType: string): AnomalyDetection | null {
    const values = metrics.map(m => parseFloat(m.value));
    const recentValues = values.slice(-10); // Last 10 readings
    
    if (recentValues.length < 10) return null;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    const threshold = mean + (2 * stdDev); // 2 standard deviations
    const lowerThreshold = mean - (2 * stdDev);
    
    const sustainedHigh = recentValues.filter(val => val > threshold).length;
    const sustainedLow = recentValues.filter(val => val < lowerThreshold).length;
    
    if (sustainedHigh >= 7 || sustainedLow >= 7) {
      return {
        metricType,
        anomalyType: sustainedHigh >= 7 ? 'sustained_elevation' : 'sustained_depression',
        severity: (sustainedHigh >= 9 || sustainedLow >= 9) ? 'high' : 'medium',
        confidence: Math.min(90, Math.max(sustainedHigh, sustainedLow) * 10),
        detectionMethod: 'statistical',
        description: `Sustained ${sustainedHigh >= 7 ? 'elevation' : 'depression'} detected in ${Math.max(sustainedHigh, sustainedLow)} of last 10 readings`,
        timeframe: 'Last 10 readings',
        affectedReadings: Math.max(sustainedHigh, sustainedLow)
      };
    }

    return null;
  }

  /**
   * Detect erratic patterns
   */
  private detectErraticPatterns(metrics: HealthMetric[], metricType: string): AnomalyDetection | null {
    const values = metrics.map(m => parseFloat(m.value));
    const recentValues = values.slice(-15); // Last 15 readings
    
    if (recentValues.length < 15) return null;

    // Calculate coefficient of variation
    const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const stdDev = Math.sqrt(recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length);
    const coefficientOfVariation = (stdDev / mean) * 100;

    // Check for erratic patterns (high variability)
    if (coefficientOfVariation > 25) {
      return {
        metricType,
        anomalyType: 'erratic_pattern',
        severity: coefficientOfVariation > 40 ? 'high' : coefficientOfVariation > 30 ? 'medium' : 'low',
        confidence: Math.min(85, coefficientOfVariation * 2),
        detectionMethod: 'statistical',
        description: `High variability detected (CV: ${coefficientOfVariation.toFixed(1)}%)`,
        timeframe: 'Last 15 readings',
        affectedReadings: recentValues.length
      };
    }

    return null;
  }

  /**
   * Assess risk factors
   */
  private assessRiskFactors(metrics: HealthMetric[], alerts: HealthAlert[]) {
    const riskFactors = [];

    // Critical alerts as risk factors
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    if (criticalAlerts.length > 0) {
      riskFactors.push({
        factor: 'Critical health alerts',
        severity: 'high' as const,
        description: `${criticalAlerts.length} critical health alert(s) detected`,
        modifiable: true
      });
    }

    // Multiple warning alerts
    const warningAlerts = alerts.filter(a => a.type === 'warning');
    if (warningAlerts.length >= 3) {
      riskFactors.push({
        factor: 'Multiple warning signs',
        severity: 'medium' as const,
        description: `${warningAlerts.length} warning indicators detected`,
        modifiable: true
      });
    }

    // Specific metric-based risk factors
    const recentMetrics = metrics.filter(m => 
      m.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    // Poor sleep pattern
    const sleepMetrics = recentMetrics.filter(m => m.metricType === 'sleep');
    if (sleepMetrics.length > 0) {
      const avgSleep = sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length;
      if (avgSleep < 6) {
        riskFactors.push({
          factor: 'Chronic sleep deprivation',
          severity: avgSleep < 5 ? 'high' : 'medium',
          description: `Average sleep: ${avgSleep.toFixed(1)} hours`,
          modifiable: true
        });
      }
    }

    return riskFactors;
  }

  /**
   * Determine emergency contacts needed
   */
  private determineEmergencyContacts(alerts: HealthAlert[], anomalies: AnomalyDetection[]) {
    const contacts = [];

    // Critical alerts require immediate medical attention
    const emergencyAlerts = alerts.filter(a => a.severity === 'emergency');
    if (emergencyAlerts.length > 0) {
      contacts.push({
        shouldContact: true,
        urgency: 'immediate' as const,
        contactType: 'emergency_services' as const,
        reason: `Critical health emergency detected: ${emergencyAlerts.map(a => a.metricType).join(', ')}`
      });
    }

    // Urgent alerts require same-day medical consultation
    const urgentAlerts = alerts.filter(a => a.severity === 'urgent');
    if (urgentAlerts.length > 0 && emergencyAlerts.length === 0) {
      contacts.push({
        shouldContact: true,
        urgency: 'same_day' as const,
        contactType: 'primary_care' as const,
        reason: `Urgent health concerns require medical evaluation: ${urgentAlerts.map(a => a.metricType).join(', ')}`
      });
    }

    // High-severity anomalies
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
    if (highSeverityAnomalies.length > 0 && emergencyAlerts.length === 0 && urgentAlerts.length === 0) {
      contacts.push({
        shouldContact: true,
        urgency: 'next_available' as const,
        contactType: 'primary_care' as const,
        reason: `Significant health pattern changes detected requiring professional evaluation`
      });
    }

    return contacts;
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(alerts: HealthAlert[], anomalies: AnomalyDetection[], riskFactors: any[]): 'low' | 'moderate' | 'high' | 'critical' {
    const criticalCount = alerts.filter(a => a.type === 'critical').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
    const highRiskFactors = riskFactors.filter(r => r.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount >= 2 || highSeverityAnomalies >= 2 || highRiskFactors >= 1) return 'high';
    if (warningCount >= 1 || anomalies.length >= 2) return 'moderate';
    return 'low';
  }

  /**
   * Get critical alert messages
   */
  private getCriticalMessage(metricType: string, value: number, isLow: boolean, isHigh: boolean): string {
    const messages: Record<string, any> = {
      heart_rate: {
        low: `⚠️ CRITICAL: Heart rate extremely low at ${value} bpm`,
        high: `⚠️ CRITICAL: Heart rate dangerously high at ${value} bpm`
      },
      glucose: {
        low: `⚠️ CRITICAL: Blood glucose critically low at ${value} mg/dL`,
        high: `⚠️ CRITICAL: Blood glucose dangerously high at ${value} mg/dL`
      },
      blood_pressure: {
        low: `⚠️ CRITICAL: Blood pressure critically low at ${value} mmHg`,
        high: `⚠️ CRITICAL: Blood pressure dangerously high at ${value} mmHg`
      }
    };

    const metricMessages = messages[metricType];
    if (!metricMessages) return `⚠️ CRITICAL: ${metricType} at dangerous level: ${value}`;
    
    return isLow ? metricMessages.low : metricMessages.high;
  }

  /**
   * Get critical recommendations
   */
  private getCriticalRecommendation(metricType: string, isLow: boolean, isHigh: boolean): string {
    const recommendations: Record<string, any> = {
      heart_rate: {
        low: 'IMMEDIATE ACTION: Seek emergency medical care. Stop all activity and call 911.',
        high: 'IMMEDIATE ACTION: Stop all activity, sit down, and seek emergency medical care.'
      },
      glucose: {
        low: 'IMMEDIATE ACTION: Consume fast-acting carbohydrates and seek medical attention.',
        high: 'IMMEDIATE ACTION: Check ketones if possible and seek immediate medical care.'
      },
      blood_pressure: {
        low: 'IMMEDIATE ACTION: Lie down with legs elevated and seek medical attention.',
        high: 'IMMEDIATE ACTION: Sit quietly and seek immediate medical care.'
      }
    };

    const metricRecs = recommendations[metricType];
    if (!metricRecs) return 'IMMEDIATE ACTION: Seek emergency medical care for this critical health reading.';
    
    return isLow ? metricRecs.low : metricRecs.high;
  }

  /**
   * Get warning messages and recommendations
   */
  private getWarningMessage(metricType: string, value: number, isLow: boolean, isHigh: boolean): string {
    return `⚠️ WARNING: ${metricType} reading of ${value} is outside safe range`;
  }

  private getWarningRecommendation(metricType: string, isLow: boolean, isHigh: boolean): string {
    return 'Monitor closely and consider consulting healthcare provider if readings persist.';
  }

  /**
   * Quick anomaly check for real-time monitoring
   */
  async quickAnomalyCheck(userId: number): Promise<HealthAlert[]> {
    const recentMetrics = await storage.getHealthMetrics(userId);
    const lastHourMetrics = recentMetrics.filter(m => 
      m.timestamp >= new Date(Date.now() - 60 * 60 * 1000)
    );

    return this.detectCriticalAlerts(lastHourMetrics, userId);
  }
}

export const riskDetectionEngine = new RiskDetectionEngine();