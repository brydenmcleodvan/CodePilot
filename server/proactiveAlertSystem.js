/**
 * Proactive Alert & Risk System
 * Real-time health monitoring with anomaly detection and intervention alerts
 */

class ProactiveAlertSystem {
  constructor() {
    this.userRiskProfiles = new Map();
    this.alertRules = new Map();
    this.riskScores = new Map();
    this.alertHistory = new Map();
    this.anomalyDetectors = new Map();
    
    // Initialize alert rule templates
    this.alertRuleTemplates = {
      // Cardiovascular monitoring
      heart_rate_anomaly: {
        name: 'Heart Rate Anomaly Detection',
        type: 'cardiovascular',
        condition: 'heart_rate_deviation',
        threshold: { deviation_percent: 25, duration_minutes: 15 },
        severity: 'high',
        message: 'Your heart rate is significantly elevated. Consider resting and monitoring.',
        action: 'immediate_rest_recommendation'
      },
      
      hrv_decline: {
        name: 'Heart Rate Variability Decline',
        type: 'cardiovascular',
        condition: 'hrv_decline',
        threshold: { decline_percent: 20, duration_days: 3 },
        severity: 'medium',
        message: 'Your heart rate variability has declined, indicating possible stress or overtraining.',
        action: 'stress_management_suggestion'
      },
      
      // Sleep monitoring
      sleep_disruption: {
        name: 'Sleep Pattern Disruption',
        type: 'sleep',
        condition: 'sleep_quality_decline',
        threshold: { quality_drop: 30, consecutive_nights: 3 },
        severity: 'medium',
        message: 'Your sleep quality has been poor for several nights. This may affect your health.',
        action: 'sleep_hygiene_recommendations'
      },
      
      insufficient_sleep: {
        name: 'Chronic Sleep Deprivation',
        type: 'sleep',
        condition: 'sleep_duration_low',
        threshold: { hours_below: 6, consecutive_nights: 5 },
        severity: 'high',
        message: 'You\'ve been getting insufficient sleep for multiple nights. This is concerning.',
        action: 'sleep_specialist_recommendation'
      },
      
      // Mental health monitoring
      mood_decline: {
        name: 'Mood Pattern Concern',
        type: 'mental_health',
        condition: 'mood_decline',
        threshold: { score_below: 4, duration_days: 7 },
        severity: 'high',
        message: 'Your mood has been consistently low. Consider reaching out for support.',
        action: 'mental_health_resources'
      },
      
      stress_elevation: {
        name: 'Elevated Stress Levels',
        type: 'mental_health',
        condition: 'stress_high',
        threshold: { score_above: 7, duration_days: 5 },
        severity: 'medium',
        message: 'Your stress levels have been elevated. Time to focus on stress management.',
        action: 'stress_reduction_plan'
      },
      
      // Activity monitoring
      sedentary_alert: {
        name: 'Prolonged Inactivity',
        type: 'activity',
        condition: 'low_activity',
        threshold: { steps_below: 3000, consecutive_days: 4 },
        severity: 'low',
        message: 'You\'ve been less active lately. Even light movement can help your health.',
        action: 'gentle_activity_suggestions'
      },
      
      overexertion_warning: {
        name: 'Overexertion Risk',
        type: 'activity',
        condition: 'excessive_exercise',
        threshold: { intensity_above: 85, recovery_poor: true },
        severity: 'medium',
        message: 'Your body may need more recovery time. Consider a lighter workout today.',
        action: 'recovery_recommendations'
      },
      
      // Vitals monitoring
      blood_pressure_concern: {
        name: 'Blood Pressure Alert',
        type: 'vitals',
        condition: 'bp_elevated',
        threshold: { systolic_above: 140, readings_count: 3 },
        severity: 'high',
        message: 'Your blood pressure readings are concerning. Consider medical consultation.',
        action: 'medical_consultation_suggestion'
      },
      
      temperature_fever: {
        name: 'Fever Detection',
        type: 'vitals',
        condition: 'temperature_high',
        threshold: { temp_above: 100.4, duration_hours: 2 },
        severity: 'high',
        message: 'You may have a fever. Monitor symptoms and consider medical advice.',
        action: 'fever_management_protocol'
      }
    };

    // Risk assessment models
    this.riskModels = {
      burnout_risk: {
        name: 'Burnout Risk Assessment',
        factors: {
          'sleep_quality': { weight: 0.25, inverse: true },
          'stress_levels': { weight: 0.30, inverse: false },
          'energy_levels': { weight: 0.20, inverse: true },
          'work_hours': { weight: 0.15, inverse: false },
          'recovery_time': { weight: 0.10, inverse: true }
        },
        thresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8
        }
      },
      
      cardiovascular_risk: {
        name: 'Cardiovascular Health Risk',
        factors: {
          'resting_heart_rate': { weight: 0.20, inverse: false },
          'blood_pressure': { weight: 0.25, inverse: false },
          'hrv': { weight: 0.20, inverse: true },
          'exercise_frequency': { weight: 0.15, inverse: true },
          'stress_levels': { weight: 0.20, inverse: false }
        },
        thresholds: {
          low: 0.25,
          medium: 0.55,
          high: 0.75
        }
      },
      
      mental_health_risk: {
        name: 'Mental Health Risk Assessment',
        factors: {
          'mood_score': { weight: 0.30, inverse: true },
          'sleep_quality': { weight: 0.25, inverse: true },
          'social_engagement': { weight: 0.15, inverse: true },
          'stress_levels': { weight: 0.20, inverse: false },
          'physical_activity': { weight: 0.10, inverse: true }
        },
        thresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8
        }
      },
      
      metabolic_risk: {
        name: 'Metabolic Health Risk',
        factors: {
          'glucose_levels': { weight: 0.25, inverse: false },
          'weight_trend': { weight: 0.20, inverse: false },
          'exercise_intensity': { weight: 0.15, inverse: true },
          'diet_quality': { weight: 0.25, inverse: true },
          'sleep_duration': { weight: 0.15, inverse: true }
        },
        thresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8
        }
      }
    };

    this.initializeSystem();
  }

  /**
   * Process real-time health data and check for alerts
   */
  async processHealthData(userId, healthData) {
    try {
      const alerts = [];
      const riskUpdates = {};

      // Update user's health profile
      await this.updateUserProfile(userId, healthData);

      // Run anomaly detection
      const anomalies = await this.detectAnomalies(userId, healthData);
      
      // Check alert rules
      const ruleAlerts = await this.checkAlertRules(userId, healthData);
      
      // Calculate risk scores
      const riskScores = await this.calculateRiskScores(userId, healthData);
      
      // Combine all alerts
      alerts.push(...anomalies, ...ruleAlerts);
      
      // Process and prioritize alerts
      const processedAlerts = this.processAlerts(alerts, riskScores);
      
      // Store alerts and risk scores
      if (processedAlerts.length > 0) {
        await this.storeAlerts(userId, processedAlerts);
      }
      
      await this.updateRiskScores(userId, riskScores);

      return {
        success: true,
        alerts: processedAlerts,
        risk_scores: riskScores,
        anomalies_detected: anomalies.length,
        total_checks_performed: Object.keys(this.alertRuleTemplates).length
      };

    } catch (error) {
      console.error('Health data processing error:', error);
      throw new Error(`Failed to process health data: ${error.message}`);
    }
  }

  /**
   * Detect anomalies in health data using statistical analysis
   */
  async detectAnomalies(userId, currentData) {
    const anomalies = [];
    const userHistory = await this.getUserHistoricalData(userId, 30); // 30 days
    
    if (userHistory.length < 7) {
      return anomalies; // Need at least a week of data
    }

    const metrics = ['heart_rate', 'hrv', 'sleep_duration', 'energy_levels', 'mood_score'];
    
    for (const metric of metrics) {
      if (currentData[metric] !== undefined) {
        const anomaly = this.detectMetricAnomaly(
          metric,
          currentData[metric],
          userHistory.map(d => d[metric]).filter(v => v !== undefined)
        );
        
        if (anomaly) {
          anomalies.push({
            type: 'anomaly',
            metric,
            severity: anomaly.severity,
            message: anomaly.message,
            data: {
              current_value: currentData[metric],
              normal_range: anomaly.normal_range,
              deviation: anomaly.deviation
            }
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Detect anomaly in a specific metric
   */
  detectMetricAnomaly(metric, currentValue, historicalValues) {
    if (historicalValues.length < 5) return null;

    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length;
    const stdDev = Math.sqrt(variance);
    
    const zScore = Math.abs((currentValue - mean) / stdDev);
    const normalRange = { min: mean - 2 * stdDev, max: mean + 2 * stdDev };
    
    // Different thresholds for different metrics
    const thresholds = {
      heart_rate: { moderate: 2, severe: 3 },
      hrv: { moderate: 1.5, severe: 2.5 },
      sleep_duration: { moderate: 1.5, severe: 2 },
      energy_levels: { moderate: 2, severe: 2.5 },
      mood_score: { moderate: 1.5, severe: 2 }
    };
    
    const threshold = thresholds[metric] || { moderate: 2, severe: 3 };
    
    if (zScore > threshold.severe) {
      return {
        severity: 'high',
        deviation: zScore,
        normal_range: normalRange,
        message: `${metric.replace('_', ' ')} is significantly outside your normal range`
      };
    } else if (zScore > threshold.moderate) {
      return {
        severity: 'medium',
        deviation: zScore,
        normal_range: normalRange,
        message: `${metric.replace('_', ' ')} is moderately outside your normal range`
      };
    }
    
    return null;
  }

  /**
   * Check all alert rules against current data
   */
  async checkAlertRules(userId, currentData) {
    const alerts = [];
    const userHistory = await this.getUserHistoricalData(userId, 14); // 2 weeks
    
    for (const [ruleId, rule] of Object.entries(this.alertRuleTemplates)) {
      const ruleResult = await this.evaluateRule(rule, currentData, userHistory);
      
      if (ruleResult.triggered) {
        alerts.push({
          type: 'rule_based',
          rule_id: ruleId,
          rule_name: rule.name,
          category: rule.type,
          severity: rule.severity,
          message: rule.message,
          action: rule.action,
          data: ruleResult.data
        });
      }
    }

    return alerts;
  }

  /**
   * Evaluate a specific alert rule
   */
  async evaluateRule(rule, currentData, historicalData) {
    const condition = rule.condition;
    const threshold = rule.threshold;
    
    switch (condition) {
      case 'heart_rate_deviation':
        return this.checkHeartRateDeviation(currentData, historicalData, threshold);
      
      case 'hrv_decline':
        return this.checkHRVDecline(currentData, historicalData, threshold);
      
      case 'sleep_quality_decline':
        return this.checkSleepQualityDecline(currentData, historicalData, threshold);
      
      case 'sleep_duration_low':
        return this.checkSleepDurationLow(currentData, historicalData, threshold);
      
      case 'mood_decline':
        return this.checkMoodDecline(currentData, historicalData, threshold);
      
      case 'stress_high':
        return this.checkStressHigh(currentData, historicalData, threshold);
      
      case 'low_activity':
        return this.checkLowActivity(currentData, historicalData, threshold);
      
      case 'bp_elevated':
        return this.checkBloodPressureElevated(currentData, historicalData, threshold);
      
      case 'temperature_high':
        return this.checkTemperatureHigh(currentData, historicalData, threshold);
      
      default:
        return { triggered: false };
    }
  }

  /**
   * Calculate comprehensive risk scores
   */
  async calculateRiskScores(userId, currentData) {
    const riskScores = {};
    const userHistory = await this.getUserHistoricalData(userId, 30);
    
    for (const [riskType, model] of Object.entries(this.riskModels)) {
      const score = await this.calculateRiskScore(model, currentData, userHistory);
      riskScores[riskType] = {
        score: score,
        level: this.getRiskLevel(score, model.thresholds),
        factors: this.identifyRiskFactors(model, currentData),
        recommendations: this.getRiskRecommendations(riskType, score)
      };
    }

    return riskScores;
  }

  /**
   * Calculate individual risk score based on model
   */
  async calculateRiskScore(model, currentData, historicalData) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, config] of Object.entries(model.factors)) {
      if (currentData[factor] !== undefined) {
        let factorValue = currentData[factor];
        
        // Normalize the factor value (0-1 scale)
        factorValue = this.normalizeFactor(factor, factorValue, historicalData);
        
        // Apply inverse if needed (lower values = higher risk)
        if (config.inverse) {
          factorValue = 1 - factorValue;
        }
        
        totalScore += factorValue * config.weight;
        totalWeight += config.weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Process and prioritize alerts
   */
  processAlerts(alerts, riskScores) {
    // Sort alerts by severity and add risk context
    const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    
    return alerts
      .map(alert => ({
        ...alert,
        timestamp: new Date().toISOString(),
        context: this.addAlertContext(alert, riskScores)
      }))
      .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
      .slice(0, 5); // Limit to top 5 alerts to avoid overwhelming user
  }

  /**
   * Add contextual information to alerts
   */
  addAlertContext(alert, riskScores) {
    const context = {
      related_risks: [],
      urgency_level: this.calculateUrgency(alert, riskScores),
      suggested_actions: this.getSuggestedActions(alert)
    };

    // Find related risk scores
    for (const [riskType, riskData] of Object.entries(riskScores)) {
      if (this.isRiskRelated(alert.category, riskType) && riskData.level !== 'low') {
        context.related_risks.push({
          type: riskType,
          level: riskData.level,
          score: riskData.score
        });
      }
    }

    return context;
  }

  /**
   * Get user's risk profile and alert preferences
   */
  async getUserRiskProfile(userId) {
    if (!this.userRiskProfiles.has(userId)) {
      // Initialize default risk profile
      this.userRiskProfiles.set(userId, {
        alert_preferences: {
          enabled: true,
          severity_threshold: 'medium',
          quiet_hours: { start: 22, end: 7 },
          max_alerts_per_day: 3
        },
        medical_conditions: [],
        medications: [],
        emergency_contacts: [],
        baseline_vitals: {}
      });
    }
    
    return this.userRiskProfiles.get(userId);
  }

  // Helper methods for rule evaluation

  checkHeartRateDeviation(current, history, threshold) {
    if (!current.heart_rate || history.length < 5) {
      return { triggered: false };
    }

    const recentHR = history.slice(-5).map(d => d.heart_rate).filter(hr => hr);
    const avgHR = recentHR.reduce((sum, hr) => sum + hr, 0) / recentHR.length;
    const deviation = Math.abs((current.heart_rate - avgHR) / avgHR) * 100;

    return {
      triggered: deviation > threshold.deviation_percent,
      data: {
        current_hr: current.heart_rate,
        average_hr: avgHR.toFixed(1),
        deviation_percent: deviation.toFixed(1)
      }
    };
  }

  checkHRVDecline(current, history, threshold) {
    if (!current.hrv || history.length < threshold.duration_days) {
      return { triggered: false };
    }

    const recentHRV = history.slice(-threshold.duration_days).map(d => d.hrv).filter(hrv => hrv);
    const baselineHRV = history.slice(-14, -threshold.duration_days).map(d => d.hrv).filter(hrv => hrv);
    
    if (recentHRV.length === 0 || baselineHRV.length === 0) {
      return { triggered: false };
    }

    const recentAvg = recentHRV.reduce((sum, hrv) => sum + hrv, 0) / recentHRV.length;
    const baselineAvg = baselineHRV.reduce((sum, hrv) => sum + hrv, 0) / baselineHRV.length;
    const decline = ((baselineAvg - recentAvg) / baselineAvg) * 100;

    return {
      triggered: decline > threshold.decline_percent,
      data: {
        recent_hrv: recentAvg.toFixed(1),
        baseline_hrv: baselineAvg.toFixed(1),
        decline_percent: decline.toFixed(1)
      }
    };
  }

  checkSleepQualityDecline(current, history, threshold) {
    if (!current.sleep_quality || history.length < threshold.consecutive_nights) {
      return { triggered: false };
    }

    const recentNights = history.slice(-threshold.consecutive_nights);
    const poorNights = recentNights.filter(night => 
      night.sleep_quality && night.sleep_quality < (current.sleep_quality - threshold.quality_drop)
    );

    return {
      triggered: poorNights.length >= threshold.consecutive_nights,
      data: {
        consecutive_poor_nights: poorNights.length,
        average_quality: recentNights.reduce((sum, night) => sum + (night.sleep_quality || 0), 0) / recentNights.length
      }
    };
  }

  checkMoodDecline(current, history, threshold) {
    if (!current.mood_score || history.length < threshold.duration_days) {
      return { triggered: false };
    }

    const recentMoods = history.slice(-threshold.duration_days).map(d => d.mood_score).filter(mood => mood);
    const lowMoodDays = recentMoods.filter(mood => mood < threshold.score_below);

    return {
      triggered: lowMoodDays.length >= Math.ceil(threshold.duration_days * 0.7), // 70% of days
      data: {
        low_mood_days: lowMoodDays.length,
        average_mood: recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length
      }
    };
  }

  checkBloodPressureElevated(current, history, threshold) {
    if (!current.blood_pressure_systolic) {
      return { triggered: false };
    }

    const recentReadings = history.slice(-threshold.readings_count).concat([current])
      .map(d => d.blood_pressure_systolic)
      .filter(bp => bp);

    const elevatedReadings = recentReadings.filter(bp => bp > threshold.systolic_above);

    return {
      triggered: elevatedReadings.length >= threshold.readings_count,
      data: {
        elevated_readings: elevatedReadings.length,
        latest_reading: current.blood_pressure_systolic,
        average_recent: recentReadings.reduce((sum, bp) => sum + bp, 0) / recentReadings.length
      }
    };
  }

  // Additional helper methods

  async getUserHistoricalData(userId, days) {
    // In production, fetch from database
    // For now, generate realistic mock data
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString(),
        heart_rate: 65 + Math.random() * 20,
        hrv: 35 + Math.random() * 15,
        sleep_duration: 7 + (Math.random() - 0.5) * 2,
        sleep_quality: 70 + Math.random() * 25,
        energy_levels: 6 + Math.random() * 3,
        mood_score: 6 + Math.random() * 3,
        stress_levels: 3 + Math.random() * 4,
        steps: 5000 + Math.random() * 8000,
        blood_pressure_systolic: 120 + Math.random() * 20
      });
    }
    
    return data;
  }

  normalizeFactor(factor, value, historicalData) {
    // Normalize factor values to 0-1 scale based on typical ranges
    const ranges = {
      heart_rate: { min: 60, max: 100 },
      hrv: { min: 20, max: 60 },
      sleep_duration: { min: 6, max: 9 },
      energy_levels: { min: 1, max: 10 },
      mood_score: { min: 1, max: 10 },
      stress_levels: { min: 1, max: 10 },
      steps: { min: 3000, max: 15000 }
    };

    const range = ranges[factor];
    if (!range) return 0.5; // Default middle value

    return Math.max(0, Math.min(1, (value - range.min) / (range.max - range.min)));
  }

  getRiskLevel(score, thresholds) {
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    return 'low';
  }

  async updateUserProfile(userId, healthData) {
    // Update user's current health profile
    // In production, this would update the database
  }

  async storeAlerts(userId, alerts) {
    // Store alerts in user's alert history
    if (!this.alertHistory.has(userId)) {
      this.alertHistory.set(userId, []);
    }
    
    this.alertHistory.get(userId).push(...alerts);
    
    // Keep only last 100 alerts
    const userAlerts = this.alertHistory.get(userId);
    if (userAlerts.length > 100) {
      this.alertHistory.set(userId, userAlerts.slice(-100));
    }
  }

  async updateRiskScores(userId, riskScores) {
    this.riskScores.set(userId, {
      ...riskScores,
      last_updated: new Date().toISOString()
    });
  }

  initializeSystem() {
    console.log('Proactive Alert System initialized with', Object.keys(this.alertRuleTemplates).length, 'alert rules');
  }
}

// Export singleton instance
const proactiveAlertSystem = new ProactiveAlertSystem();

module.exports = {
  ProactiveAlertSystem,
  proactiveAlertSystem
};