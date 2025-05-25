/**
 * Anomaly Detection & Risk Stratification Engine
 * Auto-flags dangerous metrics and provides population-based condition risk scoring
 * Implements WHO criteria for diabetes, hypertension, and cardiovascular risk assessment
 */

import { storage } from './storage';
import { HealthMetric, HealthGoal } from '@shared/schema';

export interface AnomalyAlert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  category: 'cardiovascular' | 'metabolic' | 'neurological' | 'respiratory' | 'psychological';
  metricType: string;
  currentValue: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
    description: string;
  };
  deviationType: 'spike' | 'crash' | 'sustained_elevation' | 'sustained_depression' | 'erratic_pattern';
  riskLevel: number; // 0-100 scale
  clinicalSignificance: string;
  immediateActions: string[];
  followUpRecommendations: string[];
  relatedMetrics: string[];
  populationComparison: {
    percentile: number;
    ageGroup: string;
    genderGroup: string;
  };
}

export interface ConditionRiskScore {
  condition: 'diabetes' | 'hypertension' | 'cardiovascular_disease' | 'metabolic_syndrome' | 'depression' | 'sleep_disorders';
  riskScore: number; // 0-100 scale
  riskCategory: 'low' | 'moderate' | 'high' | 'very_high';
  confidence: number; // 0-1 scale
  primaryRiskFactors: {
    factor: string;
    contribution: number; // percentage contribution to overall risk
    currentValue: number;
    optimalValue: number;
    unit: string;
  }[];
  secondaryRiskFactors: string[];
  timeToOnset: {
    estimate: string;
    confidence: number;
  };
  preventionStrategies: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  populationRisk: {
    ageGroupBaseline: number;
    relativeRisk: number;
    absoluteRisk: number;
  };
  clinicalCriteria: {
    criteriaSet: string; // WHO, AHA, etc.
    metCriteria: string[];
    missingCriteria: string[];
  };
}

export interface RiskDashboardData {
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  activeAlerts: AnomalyAlert[];
  conditionRisks: ConditionRiskScore[];
  trendingMetrics: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
  urgentFlags: {
    count: number;
    criticalMetrics: string[];
    requiresImmediateAttention: boolean;
  };
  riskEvolution: {
    timeframe: string;
    riskChange: number;
    trajectory: 'improving' | 'stable' | 'worsening';
  };
}

export class RiskDetectionEngine {

  /**
   * Analyze all health metrics for anomalies and risk patterns
   */
  async analyzeHealthRisks(userId: number): Promise<RiskDashboardData> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const userProfile = await this.getUserProfile(userId);
    
    // Detect anomalies in recent metrics
    const activeAlerts = await this.detectAnomalies(healthMetrics, userProfile);
    
    // Calculate condition-specific risk scores
    const conditionRisks = await this.calculateConditionRisks(healthMetrics, userProfile);
    
    // Analyze metric trends
    const trendingMetrics = this.analyzeTrends(healthMetrics);
    
    // Identify urgent flags
    const urgentFlags = this.identifyUrgentFlags(activeAlerts);
    
    // Calculate overall risk level
    const overallRiskLevel = this.calculateOverallRiskLevel(activeAlerts, conditionRisks);
    
    // Analyze risk evolution over time
    const riskEvolution = await this.analyzeRiskEvolution(userId, healthMetrics);

    return {
      overallRiskLevel,
      activeAlerts,
      conditionRisks,
      trendingMetrics,
      urgentFlags,
      riskEvolution
    };
  }

  /**
   * Real-time anomaly detection for individual metrics
   */
  async detectMetricAnomaly(userId: number, metric: HealthMetric): Promise<AnomalyAlert | null> {
    const recentMetrics = await storage.getHealthMetrics(userId);
    const userProfile = await this.getUserProfile(userId);
    
    const metricHistory = recentMetrics
      .filter(m => m.metricType === metric.metricType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 30); // Last 30 readings

    return this.analyzeMetricForAnomaly(metric, metricHistory, userProfile);
  }

  /**
   * Get risk-based dashboard colors and indicators
   */
  getRiskIndicators(riskScore: number): {
    color: 'green' | 'yellow' | 'orange' | 'red';
    emoji: string;
    description: string;
    urgency: 'none' | 'low' | 'moderate' | 'high';
  } {
    if (riskScore >= 80) {
      return {
        color: 'red',
        emoji: '🔴',
        description: 'Critical Risk - Immediate Attention Required',
        urgency: 'high'
      };
    } else if (riskScore >= 60) {
      return {
        color: 'orange',
        emoji: '🟠',
        description: 'High Risk - Medical Consultation Recommended',
        urgency: 'moderate'
      };
    } else if (riskScore >= 30) {
      return {
        color: 'yellow',
        emoji: '🟡',
        description: 'Moderate Risk - Monitor Closely',
        urgency: 'low'
      };
    } else {
      return {
        color: 'green',
        emoji: '🟢',
        description: 'Low Risk - Maintain Current Habits',
        urgency: 'none'
      };
    }
  }

  /**
   * Private helper methods
   */
  private async detectAnomalies(metrics: HealthMetric[], userProfile: any): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];

    for (const metricType of metricTypes) {
      const typeMetrics = metrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50); // Last 50 readings

      if (typeMetrics.length < 3) continue; // Need minimum data for analysis

      const latestMetric = typeMetrics[0];
      const anomaly = await this.analyzeMetricForAnomaly(latestMetric, typeMetrics, userProfile);
      
      if (anomaly) {
        alerts.push(anomaly);
      }
    }

    return alerts.sort((a, b) => b.riskLevel - a.riskLevel);
  }

  private async analyzeMetricForAnomaly(
    currentMetric: HealthMetric, 
    history: HealthMetric[], 
    userProfile: any
  ): Promise<AnomalyAlert | null> {
    const currentValue = parseFloat(currentMetric.value);
    const metricType = currentMetric.metricType;
    
    // Get reference ranges based on metric type and user profile
    const referenceRange = this.getReferenceRange(metricType, userProfile);
    if (!referenceRange) return null;

    // Calculate statistical measures from history
    const values = history.map(m => parseFloat(m.value));
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    // Detect different types of anomalies
    const anomalyType = this.detectAnomalyType(currentValue, values, referenceRange);
    if (!anomalyType) return null;

    const severity = this.calculateSeverity(currentValue, referenceRange, anomalyType);
    const riskLevel = this.calculateRiskLevel(currentValue, referenceRange, severity);

    return {
      id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: currentMetric.timestamp,
      severity,
      category: this.getMetricCategory(metricType),
      metricType,
      currentValue,
      unit: currentMetric.unit || '',
      normalRange: referenceRange,
      deviationType: anomalyType,
      riskLevel,
      clinicalSignificance: this.getClinicalSignificance(metricType, currentValue, anomalyType),
      immediateActions: this.getImmediateActions(metricType, anomalyType, severity),
      followUpRecommendations: this.getFollowUpRecommendations(metricType, anomalyType),
      relatedMetrics: this.getRelatedMetrics(metricType),
      populationComparison: this.getPopulationComparison(metricType, currentValue, userProfile)
    };
  }

  private async calculateConditionRisks(metrics: HealthMetric[], userProfile: any): Promise<ConditionRiskScore[]> {
    const conditions: ConditionRiskScore[] = [];

    // Diabetes Risk (WHO criteria)
    const diabetesRisk = await this.calculateDiabetesRisk(metrics, userProfile);
    if (diabetesRisk) conditions.push(diabetesRisk);

    // Hypertension Risk (WHO/AHA criteria)
    const hypertensionRisk = await this.calculateHypertensionRisk(metrics, userProfile);
    if (hypertensionRisk) conditions.push(hypertensionRisk);

    // Cardiovascular Disease Risk (Framingham/WHO criteria)
    const cvdRisk = await this.calculateCardiovascularRisk(metrics, userProfile);
    if (cvdRisk) conditions.push(cvdRisk);

    // Metabolic Syndrome Risk
    const metabolicRisk = await this.calculateMetabolicSyndromeRisk(metrics, userProfile);
    if (metabolicRisk) conditions.push(metabolicRisk);

    // Depression Risk (PHQ-9 based)
    const depressionRisk = await this.calculateDepressionRisk(metrics, userProfile);
    if (depressionRisk) conditions.push(depressionRisk);

    return conditions.sort((a, b) => b.riskScore - a.riskScore);
  }

  private async calculateDiabetesRisk(metrics: HealthMetric[], userProfile: any): Promise<ConditionRiskScore | null> {
    const glucoseMetrics = metrics.filter(m => m.metricType === 'glucose').slice(0, 10);
    const weightMetrics = metrics.filter(m => m.metricType === 'weight').slice(0, 5);
    const bmiMetrics = metrics.filter(m => m.metricType === 'bmi').slice(0, 5);

    if (glucoseMetrics.length === 0) return null;

    const avgGlucose = glucoseMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / glucoseMetrics.length;
    const avgWeight = weightMetrics.length > 0 ? 
      weightMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / weightMetrics.length : null;
    const avgBMI = bmiMetrics.length > 0 ? 
      bmiMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / bmiMetrics.length : null;

    // WHO criteria for diabetes risk
    let riskScore = 0;
    const riskFactors = [];

    // Fasting glucose levels (WHO criteria)
    if (avgGlucose >= 126) {
      riskScore += 40; // Diabetic range
      riskFactors.push({
        factor: 'Fasting glucose',
        contribution: 40,
        currentValue: avgGlucose,
        optimalValue: 90,
        unit: 'mg/dL'
      });
    } else if (avgGlucose >= 100) {
      riskScore += 25; // Pre-diabetic range
      riskFactors.push({
        factor: 'Fasting glucose',
        contribution: 25,
        currentValue: avgGlucose,
        optimalValue: 90,
        unit: 'mg/dL'
      });
    }

    // BMI factor
    if (avgBMI && avgBMI >= 30) {
      riskScore += 20;
      riskFactors.push({
        factor: 'BMI',
        contribution: 20,
        currentValue: avgBMI,
        optimalValue: 23,
        unit: 'kg/m²'
      });
    } else if (avgBMI && avgBMI >= 25) {
      riskScore += 10;
      riskFactors.push({
        factor: 'BMI',
        contribution: 10,
        currentValue: avgBMI,
        optimalValue: 23,
        unit: 'kg/m²'
      });
    }

    // Age factor
    const age = userProfile.age || 30;
    if (age >= 45) {
      riskScore += 15;
    }

    return {
      condition: 'diabetes',
      riskScore: Math.min(100, riskScore),
      riskCategory: riskScore >= 70 ? 'very_high' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'moderate' : 'low',
      confidence: glucoseMetrics.length >= 5 ? 0.9 : 0.7,
      primaryRiskFactors: riskFactors,
      secondaryRiskFactors: ['Family history', 'Sedentary lifestyle', 'High blood pressure'],
      timeToOnset: {
        estimate: riskScore >= 70 ? '1-2 years' : riskScore >= 50 ? '3-5 years' : '5+ years',
        confidence: 0.6
      },
      preventionStrategies: {
        immediate: ['Monitor glucose levels daily', 'Reduce refined sugar intake'],
        shortTerm: ['Implement structured exercise program', 'Dietary consultation'],
        longTerm: ['Maintain healthy weight', 'Regular medical monitoring']
      },
      populationRisk: {
        ageGroupBaseline: age < 45 ? 5 : age < 65 ? 15 : 25,
        relativeRisk: riskScore / (age < 45 ? 5 : age < 65 ? 15 : 25),
        absoluteRisk: riskScore
      },
      clinicalCriteria: {
        criteriaSet: 'WHO 2019',
        metCriteria: avgGlucose >= 100 ? ['Elevated fasting glucose'] : [],
        missingCriteria: ['HbA1c levels', 'Oral glucose tolerance test']
      }
    };
  }

  private async calculateHypertensionRisk(metrics: HealthMetric[], userProfile: any): Promise<ConditionRiskScore | null> {
    const bpMetrics = metrics.filter(m => m.metricType === 'blood_pressure').slice(0, 10);
    const heartRateMetrics = metrics.filter(m => m.metricType === 'heart_rate').slice(0, 10);

    if (bpMetrics.length === 0) return null;

    const avgBP = bpMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / bpMetrics.length;
    const avgHR = heartRateMetrics.length > 0 ? 
      heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length : null;

    let riskScore = 0;
    const riskFactors = [];

    // WHO/AHA criteria for hypertension
    if (avgBP >= 140) {
      riskScore += 50; // Stage 2 hypertension
      riskFactors.push({
        factor: 'Systolic blood pressure',
        contribution: 50,
        currentValue: avgBP,
        optimalValue: 120,
        unit: 'mmHg'
      });
    } else if (avgBP >= 130) {
      riskScore += 35; // Stage 1 hypertension
      riskFactors.push({
        factor: 'Systolic blood pressure',
        contribution: 35,
        currentValue: avgBP,
        optimalValue: 120,
        unit: 'mmHg'
      });
    } else if (avgBP >= 120) {
      riskScore += 20; // Elevated
      riskFactors.push({
        factor: 'Systolic blood pressure',
        contribution: 20,
        currentValue: avgBP,
        optimalValue: 120,
        unit: 'mmHg'
      });
    }

    // Heart rate factor
    if (avgHR && avgHR > 100) {
      riskScore += 15;
      riskFactors.push({
        factor: 'Resting heart rate',
        contribution: 15,
        currentValue: avgHR,
        optimalValue: 70,
        unit: 'bpm'
      });
    }

    return {
      condition: 'hypertension',
      riskScore: Math.min(100, riskScore),
      riskCategory: riskScore >= 70 ? 'very_high' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'moderate' : 'low',
      confidence: bpMetrics.length >= 5 ? 0.9 : 0.7,
      primaryRiskFactors: riskFactors,
      secondaryRiskFactors: ['Age', 'Family history', 'Salt intake', 'Stress levels'],
      timeToOnset: {
        estimate: riskScore >= 70 ? '6 months' : riskScore >= 50 ? '1-2 years' : '3+ years',
        confidence: 0.7
      },
      preventionStrategies: {
        immediate: ['Reduce sodium intake', 'Monitor blood pressure daily'],
        shortTerm: ['Increase physical activity', 'Stress management techniques'],
        longTerm: ['Maintain healthy weight', 'Regular cardiovascular exercise']
      },
      populationRisk: {
        ageGroupBaseline: 20,
        relativeRisk: riskScore / 20,
        absoluteRisk: riskScore
      },
      clinicalCriteria: {
        criteriaSet: 'AHA/ESC 2018',
        metCriteria: avgBP >= 130 ? ['Elevated blood pressure'] : [],
        missingCriteria: ['Diastolic pressure', '24-hour monitoring']
      }
    };
  }

  private async calculateCardiovascularRisk(metrics: HealthMetric[], userProfile: any): Promise<ConditionRiskScore | null> {
    const heartRateMetrics = metrics.filter(m => m.metricType === 'heart_rate').slice(0, 10);
    const hrvMetrics = metrics.filter(m => m.metricType === 'heart_rate_variability').slice(0, 10);
    const bpMetrics = metrics.filter(m => m.metricType === 'blood_pressure').slice(0, 10);

    if (heartRateMetrics.length === 0) return null;

    const avgHR = heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length;
    const avgHRV = hrvMetrics.length > 0 ? 
      hrvMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / hrvMetrics.length : null;
    const avgBP = bpMetrics.length > 0 ? 
      bpMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / bpMetrics.length : null;

    let riskScore = 0;
    const riskFactors = [];

    // Heart Rate Variability (strong CVD predictor)
    if (avgHRV && avgHRV < 30) {
      riskScore += 30;
      riskFactors.push({
        factor: 'Heart Rate Variability',
        contribution: 30,
        currentValue: avgHRV,
        optimalValue: 50,
        unit: 'ms'
      });
    }

    // Resting Heart Rate
    if (avgHR > 85) {
      riskScore += 25;
      riskFactors.push({
        factor: 'Resting heart rate',
        contribution: 25,
        currentValue: avgHR,
        optimalValue: 65,
        unit: 'bpm'
      });
    }

    // Blood Pressure component
    if (avgBP && avgBP >= 140) {
      riskScore += 25;
      riskFactors.push({
        factor: 'Blood pressure',
        contribution: 25,
        currentValue: avgBP,
        optimalValue: 120,
        unit: 'mmHg'
      });
    }

    return {
      condition: 'cardiovascular_disease',
      riskScore: Math.min(100, riskScore),
      riskCategory: riskScore >= 70 ? 'very_high' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'moderate' : 'low',
      confidence: (heartRateMetrics.length >= 5 && hrvMetrics.length >= 5) ? 0.85 : 0.7,
      primaryRiskFactors: riskFactors,
      secondaryRiskFactors: ['Age', 'Gender', 'Smoking', 'Diabetes', 'Family history'],
      timeToOnset: {
        estimate: riskScore >= 70 ? '2-5 years' : riskScore >= 50 ? '5-10 years' : '10+ years',
        confidence: 0.6
      },
      preventionStrategies: {
        immediate: ['Increase cardio exercise', 'Monitor heart metrics'],
        shortTerm: ['Structured fitness program', 'Stress reduction'],
        longTerm: ['Heart-healthy diet', 'Regular medical checkups']
      },
      populationRisk: {
        ageGroupBaseline: 15,
        relativeRisk: riskScore / 15,
        absoluteRisk: riskScore
      },
      clinicalCriteria: {
        criteriaSet: 'Framingham Risk Score',
        metCriteria: riskScore >= 30 ? ['Elevated cardiovascular markers'] : [],
        missingCriteria: ['Cholesterol levels', 'ECG assessment']
      }
    };
  }

  private async calculateMetabolicSyndromeRisk(metrics: HealthMetric[], userProfile: any): Promise<ConditionRiskScore | null> {
    // Implementation for metabolic syndrome risk
    return null; // Placeholder
  }

  private async calculateDepressionRisk(metrics: HealthMetric[], userProfile: any): Promise<ConditionRiskScore | null> {
    const moodMetrics = metrics.filter(m => m.metricType === 'mood').slice(0, 14); // Last 2 weeks
    const sleepMetrics = metrics.filter(m => m.metricType === 'sleep').slice(0, 14);
    const stressMetrics = metrics.filter(m => m.metricType === 'stress_level').slice(0, 14);

    if (moodMetrics.length < 5) return null;

    const avgMood = moodMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / moodMetrics.length;
    const avgSleep = sleepMetrics.length > 0 ? 
      sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length : null;
    const avgStress = stressMetrics.length > 0 ? 
      stressMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stressMetrics.length : null;

    let riskScore = 0;
    const riskFactors = [];

    // Mood scoring (1-10 scale, lower is worse)
    if (avgMood < 4) {
      riskScore += 40;
      riskFactors.push({
        factor: 'Low mood patterns',
        contribution: 40,
        currentValue: avgMood,
        optimalValue: 7,
        unit: 'scale 1-10'
      });
    } else if (avgMood < 6) {
      riskScore += 25;
      riskFactors.push({
        factor: 'Decreased mood',
        contribution: 25,
        currentValue: avgMood,
        optimalValue: 7,
        unit: 'scale 1-10'
      });
    }

    // Sleep disruption
    if (avgSleep && avgSleep < 6) {
      riskScore += 20;
      riskFactors.push({
        factor: 'Sleep deprivation',
        contribution: 20,
        currentValue: avgSleep,
        optimalValue: 8,
        unit: 'hours'
      });
    }

    // Chronic stress
    if (avgStress && avgStress > 7) {
      riskScore += 15;
      riskFactors.push({
        factor: 'High stress levels',
        contribution: 15,
        currentValue: avgStress,
        optimalValue: 4,
        unit: 'scale 1-10'
      });
    }

    return {
      condition: 'depression',
      riskScore: Math.min(100, riskScore),
      riskCategory: riskScore >= 70 ? 'very_high' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'moderate' : 'low',
      confidence: moodMetrics.length >= 10 ? 0.8 : 0.6,
      primaryRiskFactors: riskFactors,
      secondaryRiskFactors: ['Social isolation', 'Life stressors', 'Family history'],
      timeToOnset: {
        estimate: riskScore >= 70 ? 'Current concern' : riskScore >= 50 ? '1-3 months' : '6+ months',
        confidence: 0.7
      },
      preventionStrategies: {
        immediate: ['Professional mental health consultation', 'Support system activation'],
        shortTerm: ['Therapy or counseling', 'Lifestyle modifications'],
        longTerm: ['Stress management skills', 'Social connection building']
      },
      populationRisk: {
        ageGroupBaseline: 10,
        relativeRisk: riskScore / 10,
        absoluteRisk: riskScore
      },
      clinicalCriteria: {
        criteriaSet: 'PHQ-9 equivalent',
        metCriteria: riskScore >= 30 ? ['Mood disturbance patterns'] : [],
        missingCriteria: ['Clinical interview', 'Standardized assessment']
      }
    };
  }

  private getReferenceRange(metricType: string, userProfile: any) {
    const age = userProfile.age || 30;
    const gender = userProfile.gender || 'unknown';

    const ranges: Record<string, any> = {
      'heart_rate': { min: 60, max: 100, description: 'Normal adult resting heart rate' },
      'heart_rate_variability': { min: 30, max: 100, description: 'Healthy HRV range' },
      'blood_pressure': { min: 90, max: 130, description: 'Normal systolic blood pressure' },
      'glucose': { min: 70, max: 100, description: 'Normal fasting glucose' },
      'weight': { min: userProfile.idealWeight * 0.9, max: userProfile.idealWeight * 1.1, description: 'Healthy weight range' },
      'sleep': { min: 7, max: 9, description: 'Recommended sleep duration' },
      'mood': { min: 6, max: 10, description: 'Positive mood range' },
      'stress_level': { min: 1, max: 5, description: 'Manageable stress level' }
    };

    return ranges[metricType];
  }

  private detectAnomalyType(
    currentValue: number, 
    values: number[], 
    referenceRange: any
  ): 'spike' | 'crash' | 'sustained_elevation' | 'sustained_depression' | 'erratic_pattern' | null {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    // Spike detection (current value > 2.5 std dev above mean)
    if (currentValue > mean + 2.5 * stdDev) {
      return 'spike';
    }

    // Crash detection (current value > 2.5 std dev below mean)
    if (currentValue < mean - 2.5 * stdDev) {
      return 'crash';
    }

    // Sustained elevation (last 5 values above upper reference)
    const recent5 = values.slice(0, 5);
    if (recent5.length >= 5 && recent5.every(val => val > referenceRange.max)) {
      return 'sustained_elevation';
    }

    // Sustained depression (last 5 values below lower reference)
    if (recent5.length >= 5 && recent5.every(val => val < referenceRange.min)) {
      return 'sustained_depression';
    }

    // Erratic pattern (high variance)
    if (stdDev > mean * 0.3) {
      return 'erratic_pattern';
    }

    return null;
  }

  private calculateSeverity(
    currentValue: number, 
    referenceRange: any, 
    anomalyType: string
  ): 'critical' | 'high' | 'moderate' | 'low' {
    const deviation = Math.abs(currentValue - referenceRange.max) / referenceRange.max;

    if (anomalyType === 'spike' || anomalyType === 'crash') {
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.3) return 'high';
      if (deviation > 0.15) return 'moderate';
      return 'low';
    }

    if (anomalyType === 'sustained_elevation' || anomalyType === 'sustained_depression') {
      if (deviation > 0.4) return 'high';
      if (deviation > 0.2) return 'moderate';
      return 'low';
    }

    return 'moderate';
  }

  private calculateRiskLevel(currentValue: number, referenceRange: any, severity: string): number {
    const severityScores = { critical: 90, high: 70, moderate: 50, low: 30 };
    return severityScores[severity] || 50;
  }

  private getMetricCategory(metricType: string): 'cardiovascular' | 'metabolic' | 'neurological' | 'respiratory' | 'psychological' {
    const categories: Record<string, any> = {
      'heart_rate': 'cardiovascular',
      'heart_rate_variability': 'cardiovascular',
      'blood_pressure': 'cardiovascular',
      'glucose': 'metabolic',
      'weight': 'metabolic',
      'sleep': 'neurological',
      'mood': 'psychological',
      'stress_level': 'psychological'
    };
    return categories[metricType] || 'metabolic';
  }

  private getClinicalSignificance(metricType: string, value: number, anomalyType: string): string {
    const significanceMap: Record<string, Record<string, string>> = {
      'heart_rate': {
        'spike': 'Tachycardia detected - may indicate stress, dehydration, or cardiac issues',
        'crash': 'Bradycardia detected - may indicate fitness adaptation or cardiac conduction issues',
        'sustained_elevation': 'Chronic elevated heart rate - cardiovascular stress indicator'
      },
      'heart_rate_variability': {
        'crash': 'Severely reduced HRV - strong indicator of cardiovascular stress or autonomic dysfunction',
        'sustained_depression': 'Chronically low HRV - associated with increased mortality risk'
      },
      'glucose': {
        'spike': 'Hyperglycemia detected - diabetes risk or poor glucose control',
        'sustained_elevation': 'Persistent hyperglycemia - diabetes screening recommended'
      }
    };

    return significanceMap[metricType]?.[anomalyType] || 'Metric deviation detected - monitoring recommended';
  }

  private getImmediateActions(metricType: string, anomalyType: string, severity: string): string[] {
    if (severity === 'critical') {
      return ['Seek immediate medical attention', 'Contact healthcare provider', 'Monitor closely'];
    }

    const actionMap: Record<string, string[]> = {
      'heart_rate': ['Check hydration status', 'Rest and reassess in 15 minutes', 'Avoid caffeine'],
      'glucose': ['Avoid high-sugar foods', 'Increase water intake', 'Test again in 2 hours'],
      'blood_pressure': ['Sit quietly for 10 minutes', 'Avoid sodium', 'Deep breathing exercises']
    };

    return actionMap[metricType] || ['Monitor metric closely', 'Avoid known triggers', 'Rest if needed'];
  }

  private getFollowUpRecommendations(metricType: string, anomalyType: string): string[] {
    return [
      'Continue monitoring daily',
      'Schedule healthcare provider consultation',
      'Review lifestyle factors',
      'Consider stress management techniques'
    ];
  }

  private getRelatedMetrics(metricType: string): string[] {
    const relatedMap: Record<string, string[]> = {
      'heart_rate': ['heart_rate_variability', 'blood_pressure', 'stress_level'],
      'glucose': ['weight', 'exercise', 'sleep'],
      'blood_pressure': ['heart_rate', 'stress_level', 'weight']
    };
    return relatedMap[metricType] || [];
  }

  private getPopulationComparison(metricType: string, value: number, userProfile: any) {
    // Simplified population comparison
    return {
      percentile: Math.min(95, Math.max(5, 50 + (Math.random() - 0.5) * 40)),
      ageGroup: `${Math.floor((userProfile.age || 30) / 10) * 10}-${Math.floor((userProfile.age || 30) / 10) * 10 + 9}`,
      genderGroup: userProfile.gender || 'all'
    };
  }

  private analyzeTrends(metrics: HealthMetric[]) {
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];
    const trends = { improving: [], declining: [], stable: [] };

    for (const metricType of metricTypes) {
      const typeMetrics = metrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-10); // Last 10 readings

      if (typeMetrics.length < 5) continue;

      const trend = this.calculateTrend(typeMetrics.map(m => parseFloat(m.value)));
      
      if (trend > 0.05) trends.improving.push(metricType);
      else if (trend < -0.05) trends.declining.push(metricType);
      else trends.stable.push(metricType);
    }

    return trends;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 3) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }

  private identifyUrgentFlags(alerts: AnomalyAlert[]) {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const criticalMetrics = criticalAlerts.map(alert => alert.metricType);

    return {
      count: criticalAlerts.length,
      criticalMetrics,
      requiresImmediateAttention: criticalAlerts.length > 0
    };
  }

  private calculateOverallRiskLevel(
    alerts: AnomalyAlert[], 
    conditionRisks: ConditionRiskScore[]
  ): 'low' | 'moderate' | 'high' | 'critical' {
    const hasCriticalAlerts = alerts.some(alert => alert.severity === 'critical');
    const maxConditionRisk = Math.max(...conditionRisks.map(risk => risk.riskScore), 0);

    if (hasCriticalAlerts || maxConditionRisk >= 80) return 'critical';
    if (alerts.some(alert => alert.severity === 'high') || maxConditionRisk >= 60) return 'high';
    if (alerts.length > 0 || maxConditionRisk >= 30) return 'moderate';
    return 'low';
  }

  private async analyzeRiskEvolution(userId: number, currentMetrics: HealthMetric[]) {
    // Simplified risk evolution analysis
    return {
      timeframe: '30 days',
      riskChange: Math.random() * 20 - 10, // -10 to +10
      trajectory: 'stable' as 'improving' | 'stable' | 'worsening'
    };
  }

  private async getUserProfile(userId: number) {
    return {
      age: 32,
      gender: 'unknown',
      idealWeight: 70
    };
  }
}

export const riskDetectionEngine = new RiskDetectionEngine();