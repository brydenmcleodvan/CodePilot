/**
 * Clinical Decision Support Engine
 * Provides preliminary AI assessments and evidence-based intervention suggestions
 * Analyzes health trends and generates ICD-10 aligned clinical insights
 */

import OpenAI from 'openai';
import { storage } from './storage';
import { HealthMetric, HealthGoal, User } from '@shared/schema';

// Initialize OpenAI with error handling
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI API not available:', error);
}

export interface ClinicalTrend {
  parameter: string;
  direction: 'improving' | 'declining' | 'stable' | 'fluctuating';
  magnitude: 'significant' | 'moderate' | 'mild';
  timeframe: string;
  values: {
    current: number;
    previous: number;
    change: number;
    percentChange: number;
  };
  clinicalSignificance: 'high' | 'medium' | 'low';
  riskFactors: string[];
}

export interface ClinicalAssessment {
  id: string;
  userId: number;
  assessmentType: 'preliminary' | 'trend_analysis' | 'risk_stratification';
  condition: {
    name: string;
    icd10Code: string;
    probability: number; // 0-100%
    severity: 'mild' | 'moderate' | 'severe';
    urgency: 'routine' | 'urgent' | 'emergent';
  };
  clinicalIndicators: {
    parameter: string;
    value: number;
    unit: string;
    normalRange: {
      min: number;
      max: number;
    };
    status: 'normal' | 'borderline' | 'abnormal' | 'critical';
    trend: 'improving' | 'stable' | 'worsening';
  }[];
  riskFactors: {
    factor: string;
    presence: 'confirmed' | 'suspected' | 'absent';
    impact: 'high' | 'medium' | 'low';
    modifiable: boolean;
  }[];
  assessment: {
    summary: string;
    clinicalReasoning: string;
    differentialDiagnosis: string[];
    redFlags: string[];
  };
  confidence: number; // 0-100%
  disclaimer: string;
  generatedAt: Date;
}

export interface ClinicalIntervention {
  id: string;
  category: 'lifestyle' | 'dietary' | 'exercise' | 'sleep' | 'stress_management' | 'monitoring' | 'medical_referral';
  intervention: string;
  rationale: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D'; // Clinical evidence grades
  priority: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  specificActions: {
    action: string;
    frequency: string;
    duration: string;
    target: string;
    monitoring: string[];
  }[];
  expectedOutcomes: {
    parameter: string;
    expectedChange: string;
    timeToEffect: string;
    measurementFrequency: string;
  }[];
  contraindications: string[];
  clinicalGuidelines: {
    organization: string;
    guideline: string;
    recommendationClass: string;
  }[];
}

export interface ClinicalDecisionReport {
  userId: number;
  generatedAt: Date;
  dataQuality: {
    completeness: number;
    consistency: number;
    timeframe: string;
  };
  trends: ClinicalTrend[];
  assessments: ClinicalAssessment[];
  interventions: ClinicalIntervention[];
  monitoring: {
    recommendedFrequency: string;
    keyParameters: string[];
    alertThresholds: {
      parameter: string;
      threshold: number;
      direction: 'above' | 'below';
      action: string;
    }[];
  };
  followUp: {
    recommended: boolean;
    timeframe: string;
    specialist: string;
    urgency: 'routine' | 'urgent' | 'emergent';
    reason: string;
  };
  disclaimer: string;
}

export class ClinicalDecisionSupport {
  private openai: OpenAI | null = null;

  constructor() {
    this.openai = openai;
  }

  /**
   * Generate comprehensive clinical decision support report
   */
  async generateClinicalReport(userId: number): Promise<ClinicalDecisionReport> {
    const user = await storage.getUser(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);

    // Analyze clinical trends
    const trends = await this.analyzeClinicalTrends(healthMetrics);
    
    // Generate clinical assessments
    const assessments = await this.generateClinicalAssessments(user, healthMetrics, trends);
    
    // Generate evidence-based interventions
    const interventions = await this.generateClinicalInterventions(assessments, trends);
    
    // Generate monitoring recommendations
    const monitoring = this.generateMonitoringRecommendations(assessments, trends);
    
    // Generate follow-up recommendations
    const followUp = this.generateFollowUpRecommendations(assessments);
    
    // Calculate data quality
    const dataQuality = this.assessDataQuality(healthMetrics);

    return {
      userId,
      generatedAt: new Date(),
      dataQuality,
      trends,
      assessments,
      interventions,
      monitoring,
      followUp,
      disclaimer: this.getClinicalDisclaimer()
    };
  }

  /**
   * Analyze clinical trends from health metrics
   */
  private async analyzeClinicalTrends(healthMetrics: HealthMetric[]): Promise<ClinicalTrend[]> {
    const trends: ClinicalTrend[] = [];
    const metricTypes = [...new Set(healthMetrics.map(m => m.metricType))];

    for (const metricType of metricTypes) {
      const typeMetrics = healthMetrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (typeMetrics.length < 10) continue; // Need sufficient data for trend analysis

      const trend = this.calculateClinicalTrend(metricType, typeMetrics);
      if (trend) {
        trends.push(trend);
      }
    }

    return trends.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.clinicalSignificance] - severityOrder[a.clinicalSignificance];
    });
  }

  /**
   * Calculate clinical trend for specific metric
   */
  private calculateClinicalTrend(metricType: string, metrics: HealthMetric[]): ClinicalTrend | null {
    if (metrics.length < 10) return null;

    const values = metrics.map(m => parseFloat(m.value));
    const recent = values.slice(-7); // Last 7 readings
    const previous = values.slice(-14, -7); // Previous 7 readings

    const currentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    const change = currentAvg - previousAvg;
    const percentChange = (change / previousAvg) * 100;

    // Determine trend direction and magnitude
    const direction = this.determineTrendDirection(change, percentChange, metricType);
    const magnitude = this.determineTrendMagnitude(Math.abs(percentChange), metricType);
    const clinicalSignificance = this.assessClinicalSignificance(metricType, change, percentChange);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(metricType, currentAvg, direction, magnitude);

    return {
      parameter: metricType,
      direction,
      magnitude,
      timeframe: '14 days',
      values: {
        current: Math.round(currentAvg * 100) / 100,
        previous: Math.round(previousAvg * 100) / 100,
        change: Math.round(change * 100) / 100,
        percentChange: Math.round(percentChange * 100) / 100
      },
      clinicalSignificance,
      riskFactors
    };
  }

  /**
   * Generate clinical assessments with AI support
   */
  private async generateClinicalAssessments(
    user: any, 
    healthMetrics: HealthMetric[], 
    trends: ClinicalTrend[]
  ): Promise<ClinicalAssessment[]> {
    const assessments: ClinicalAssessment[] = [];
    
    // Analyze for prediabetes/diabetes risk
    const glucoseAssessment = await this.assessGlucoseMetabolism(user, healthMetrics, trends);
    if (glucoseAssessment) assessments.push(glucoseAssessment);
    
    // Analyze for cardiovascular risk
    const cvAssessment = await this.assessCardiovascularRisk(user, healthMetrics, trends);
    if (cvAssessment) assessments.push(cvAssessment);
    
    // Analyze for metabolic syndrome
    const metabolicAssessment = await this.assessMetabolicSyndrome(user, healthMetrics, trends);
    if (metabolicAssessment) assessments.push(metabolicAssessment);
    
    // Analyze for sleep disorders
    const sleepAssessment = await this.assessSleepDisorders(user, healthMetrics, trends);
    if (sleepAssessment) assessments.push(sleepAssessment);

    return assessments;
  }

  /**
   * Assess glucose metabolism and diabetes risk
   */
  private async assessGlucoseMetabolism(
    user: any, 
    healthMetrics: HealthMetric[], 
    trends: ClinicalTrend[]
  ): Promise<ClinicalAssessment | null> {
    const glucoseMetrics = healthMetrics.filter(m => m.metricType === 'glucose');
    if (glucoseMetrics.length < 5) return null;

    const recentGlucose = glucoseMetrics
      .slice(-10)
      .map(m => parseFloat(m.value));
    
    const avgGlucose = recentGlucose.reduce((sum, val) => sum + val, 0) / recentGlucose.length;
    const maxGlucose = Math.max(...recentGlucose);
    
    // Assess diabetes/prediabetes risk
    let condition = { name: '', icd10Code: '', probability: 0, severity: 'mild' as const, urgency: 'routine' as const };
    let riskLevel = 'low';
    
    if (avgGlucose >= 126 || maxGlucose >= 200) {
      condition = {
        name: 'Type 2 Diabetes Mellitus (suspected)',
        icd10Code: 'E11.9',
        probability: 75,
        severity: 'moderate',
        urgency: 'urgent'
      };
      riskLevel = 'high';
    } else if (avgGlucose >= 100 || maxGlucose >= 140) {
      condition = {
        name: 'Prediabetes (impaired glucose metabolism)',
        icd10Code: 'R73.03',
        probability: 60,
        severity: 'mild',
        urgency: 'routine'
      };
      riskLevel = 'medium';
    } else {
      return null; // Normal glucose levels
    }

    const glucoseTrend = trends.find(t => t.parameter === 'glucose');
    
    return {
      id: `assessment-glucose-${Date.now()}`,
      userId: user.id || 1,
      assessmentType: 'preliminary',
      condition,
      clinicalIndicators: [
        {
          parameter: 'Fasting Glucose',
          value: avgGlucose,
          unit: 'mg/dL',
          normalRange: { min: 70, max: 99 },
          status: avgGlucose >= 126 ? 'critical' : avgGlucose >= 100 ? 'abnormal' : 'normal',
          trend: glucoseTrend?.direction || 'stable'
        }
      ],
      riskFactors: [
        {
          factor: 'Elevated glucose levels',
          presence: 'confirmed',
          impact: 'high',
          modifiable: true
        },
        {
          factor: 'Sedentary lifestyle',
          presence: 'suspected',
          impact: 'medium',
          modifiable: true
        }
      ],
      assessment: {
        summary: `Analysis suggests ${condition.name.toLowerCase()} based on glucose patterns`,
        clinicalReasoning: `Average glucose of ${avgGlucose.toFixed(1)} mg/dL exceeds normal thresholds. ${glucoseTrend ? `Glucose trend is ${glucoseTrend.direction}.` : ''}`,
        differentialDiagnosis: ['Type 2 Diabetes', 'Prediabetes', 'Insulin resistance', 'Metabolic syndrome'],
        redFlags: avgGlucose >= 200 ? ['Significantly elevated glucose requiring immediate attention'] : []
      },
      confidence: 70,
      disclaimer: this.getClinicalDisclaimer(),
      generatedAt: new Date()
    };
  }

  /**
   * Assess cardiovascular risk
   */
  private async assessCardiovascularRisk(
    user: any, 
    healthMetrics: HealthMetric[], 
    trends: ClinicalTrend[]
  ): Promise<ClinicalAssessment | null> {
    const bpMetrics = healthMetrics.filter(m => m.metricType === 'blood_pressure');
    const hrMetrics = healthMetrics.filter(m => m.metricType === 'heart_rate');
    
    if (bpMetrics.length < 3) return null;

    const recentBP = bpMetrics
      .slice(-5)
      .map(m => parseFloat(m.value));
    
    const avgBP = recentBP.reduce((sum, val) => sum + val, 0) / recentBP.length;
    
    let condition = { name: '', icd10Code: '', probability: 0, severity: 'mild' as const, urgency: 'routine' as const };
    
    if (avgBP >= 140) {
      condition = {
        name: 'Essential Hypertension',
        icd10Code: 'I10',
        probability: 80,
        severity: avgBP >= 160 ? 'severe' : 'moderate',
        urgency: avgBP >= 180 ? 'urgent' : 'routine'
      };
    } else if (avgBP >= 130) {
      condition = {
        name: 'Elevated Blood Pressure',
        icd10Code: 'R03.0',
        probability: 65,
        severity: 'mild',
        urgency: 'routine'
      };
    } else {
      return null;
    }

    const bpTrend = trends.find(t => t.parameter === 'blood_pressure');

    return {
      id: `assessment-bp-${Date.now()}`,
      userId: user.id || 1,
      assessmentType: 'preliminary',
      condition,
      clinicalIndicators: [
        {
          parameter: 'Systolic Blood Pressure',
          value: avgBP,
          unit: 'mmHg',
          normalRange: { min: 90, max: 120 },
          status: avgBP >= 140 ? 'abnormal' : avgBP >= 130 ? 'borderline' : 'normal',
          trend: bpTrend?.direction || 'stable'
        }
      ],
      riskFactors: [
        {
          factor: 'Elevated blood pressure',
          presence: 'confirmed',
          impact: 'high',
          modifiable: true
        },
        {
          factor: 'Cardiovascular disease risk',
          presence: 'suspected',
          impact: 'high',
          modifiable: true
        }
      ],
      assessment: {
        summary: `Blood pressure analysis indicates ${condition.name.toLowerCase()}`,
        clinicalReasoning: `Average systolic BP of ${avgBP.toFixed(1)} mmHg exceeds normal ranges`,
        differentialDiagnosis: ['Essential hypertension', 'Secondary hypertension', 'White coat hypertension'],
        redFlags: avgBP >= 180 ? ['Severely elevated BP requiring immediate medical attention'] : []
      },
      confidence: 75,
      disclaimer: this.getClinicalDisclaimer(),
      generatedAt: new Date()
    };
  }

  /**
   * Assess metabolic syndrome risk
   */
  private async assessMetabolicSyndrome(
    user: any, 
    healthMetrics: HealthMetric[], 
    trends: ClinicalTrend[]
  ): Promise<ClinicalAssessment | null> {
    // Check for metabolic syndrome criteria
    const glucoseMetrics = healthMetrics.filter(m => m.metricType === 'glucose');
    const bpMetrics = healthMetrics.filter(m => m.metricType === 'blood_pressure');
    const weightMetrics = healthMetrics.filter(m => m.metricType === 'weight');
    
    if (glucoseMetrics.length < 3 || bpMetrics.length < 3) return null;

    const avgGlucose = glucoseMetrics.slice(-5).reduce((sum, m) => sum + parseFloat(m.value), 0) / 5;
    const avgBP = bpMetrics.slice(-5).reduce((sum, m) => sum + parseFloat(m.value), 0) / 5;
    
    let criteriaCount = 0;
    const criteria = [];

    if (avgGlucose >= 100) {
      criteriaCount++;
      criteria.push('Elevated fasting glucose');
    }
    
    if (avgBP >= 130) {
      criteriaCount++;
      criteria.push('Elevated blood pressure');
    }

    if (criteriaCount >= 2) {
      return {
        id: `assessment-metabolic-${Date.now()}`,
        userId: user.id || 1,
        assessmentType: 'risk_stratification',
        condition: {
          name: 'Metabolic Syndrome (suspected)',
          icd10Code: 'E88.81',
          probability: criteriaCount >= 3 ? 80 : 60,
          severity: 'moderate',
          urgency: 'routine'
        },
        clinicalIndicators: [
          {
            parameter: 'Metabolic criteria met',
            value: criteriaCount,
            unit: 'criteria',
            normalRange: { min: 0, max: 1 },
            status: criteriaCount >= 3 ? 'abnormal' : 'borderline',
            trend: 'stable'
          }
        ],
        riskFactors: [
          {
            factor: 'Multiple metabolic abnormalities',
            presence: 'confirmed',
            impact: 'high',
            modifiable: true
          },
          {
            factor: 'Increased cardiovascular risk',
            presence: 'suspected',
            impact: 'high',
            modifiable: true
          }
        ],
        assessment: {
          summary: `Multiple metabolic abnormalities suggest metabolic syndrome risk`,
          clinicalReasoning: `${criteriaCount} of 5 metabolic syndrome criteria present: ${criteria.join(', ')}`,
          differentialDiagnosis: ['Metabolic syndrome', 'Insulin resistance', 'Prediabetes'],
          redFlags: []
        },
        confidence: 65,
        disclaimer: this.getClinicalDisclaimer(),
        generatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * Assess sleep disorders
   */
  private async assessSleepDisorders(
    user: any, 
    healthMetrics: HealthMetric[], 
    trends: ClinicalTrend[]
  ): Promise<ClinicalAssessment | null> {
    const sleepMetrics = healthMetrics.filter(m => m.metricType === 'sleep');
    if (sleepMetrics.length < 7) return null;

    const recentSleep = sleepMetrics.slice(-14).map(m => parseFloat(m.value));
    const avgSleep = recentSleep.reduce((sum, val) => sum + val, 0) / recentSleep.length;
    const consistencyScore = 1 - (Math.max(...recentSleep) - Math.min(...recentSleep)) / 12;

    if (avgSleep < 6 || consistencyScore < 0.7) {
      return {
        id: `assessment-sleep-${Date.now()}`,
        userId: user.id || 1,
        assessmentType: 'preliminary',
        condition: {
          name: 'Sleep-Wake Disorders',
          icd10Code: 'G47.9',
          probability: avgSleep < 5 ? 70 : 50,
          severity: avgSleep < 5 ? 'moderate' : 'mild',
          urgency: 'routine'
        },
        clinicalIndicators: [
          {
            parameter: 'Average Sleep Duration',
            value: avgSleep,
            unit: 'hours',
            normalRange: { min: 7, max: 9 },
            status: avgSleep < 6 ? 'abnormal' : 'borderline',
            trend: trends.find(t => t.parameter === 'sleep')?.direction || 'stable'
          }
        ],
        riskFactors: [
          {
            factor: 'Chronic sleep deprivation',
            presence: 'confirmed',
            impact: 'medium',
            modifiable: true
          },
          {
            factor: 'Poor sleep consistency',
            presence: consistencyScore < 0.7 ? 'confirmed' : 'absent',
            impact: 'medium',
            modifiable: true
          }
        ],
        assessment: {
          summary: `Sleep patterns indicate potential sleep-wake disorder`,
          clinicalReasoning: `Average sleep of ${avgSleep.toFixed(1)} hours is below recommended 7-9 hours`,
          differentialDiagnosis: ['Insomnia', 'Sleep apnea', 'Circadian rhythm disorder'],
          redFlags: avgSleep < 4 ? ['Severely insufficient sleep requiring intervention'] : []
        },
        confidence: 60,
        disclaimer: this.getClinicalDisclaimer(),
        generatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * Generate evidence-based clinical interventions
   */
  private async generateClinicalInterventions(
    assessments: ClinicalAssessment[], 
    trends: ClinicalTrend[]
  ): Promise<ClinicalIntervention[]> {
    const interventions: ClinicalIntervention[] = [];

    for (const assessment of assessments) {
      const conditionInterventions = this.getInterventionsForCondition(assessment);
      interventions.push(...conditionInterventions);
    }

    return interventions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get interventions for specific condition
   */
  private getInterventionsForCondition(assessment: ClinicalAssessment): ClinicalIntervention[] {
    const interventions: ClinicalIntervention[] = [];

    if (assessment.condition.icd10Code === 'R73.03' || assessment.condition.icd10Code === 'E11.9') {
      // Prediabetes/Diabetes interventions
      interventions.push({
        id: `intervention-diet-${Date.now()}`,
        category: 'dietary',
        intervention: 'Mediterranean Diet with Carbohydrate Modification',
        rationale: 'Mediterranean diet with reduced refined carbohydrates improves glucose control and insulin sensitivity',
        evidenceLevel: 'A',
        priority: 'high',
        timeframe: 'immediate',
        specificActions: [
          {
            action: 'Reduce refined carbohydrate intake',
            frequency: 'Daily',
            duration: 'Ongoing',
            target: '<45% of total calories',
            monitoring: ['Blood glucose', 'HbA1c', 'Weight']
          },
          {
            action: 'Increase fiber intake',
            frequency: 'Daily',
            duration: 'Ongoing',
            target: '25-35g per day',
            monitoring: ['Glucose response', 'Satiety']
          }
        ],
        expectedOutcomes: [
          {
            parameter: 'Fasting glucose',
            expectedChange: '10-20% reduction',
            timeToEffect: '4-8 weeks',
            measurementFrequency: 'Weekly'
          }
        ],
        contraindications: ['Active eating disorder', 'Severe malnutrition'],
        clinicalGuidelines: [
          {
            organization: 'American Diabetes Association',
            guideline: 'Standards of Medical Care in Diabetes 2023',
            recommendationClass: 'Class I'
          }
        ]
      });

      interventions.push({
        id: `intervention-exercise-${Date.now()}`,
        category: 'exercise',
        intervention: 'Structured Exercise Program',
        rationale: 'Regular physical activity improves insulin sensitivity and glucose uptake',
        evidenceLevel: 'A',
        priority: 'high',
        timeframe: 'immediate',
        specificActions: [
          {
            action: 'Moderate-intensity aerobic exercise',
            frequency: '150 minutes per week',
            duration: 'Ongoing',
            target: '5 days per week, 30 minutes',
            monitoring: ['Heart rate', 'Blood glucose pre/post exercise']
          },
          {
            action: 'Resistance training',
            frequency: '2-3 times per week',
            duration: 'Ongoing',
            target: 'Major muscle groups',
            monitoring: ['Strength progression', 'Glucose response']
          }
        ],
        expectedOutcomes: [
          {
            parameter: 'Insulin sensitivity',
            expectedChange: '15-25% improvement',
            timeToEffect: '2-4 weeks',
            measurementFrequency: 'Monthly'
          }
        ],
        contraindications: ['Uncontrolled hypertension >180/110', 'Recent cardiac event'],
        clinicalGuidelines: [
          {
            organization: 'American College of Sports Medicine',
            guideline: 'Exercise and Type 2 Diabetes',
            recommendationClass: 'Class I'
          }
        ]
      });
    }

    if (assessment.condition.icd10Code === 'I10') {
      // Hypertension interventions
      interventions.push({
        id: `intervention-dash-${Date.now()}`,
        category: 'dietary',
        intervention: 'DASH Diet Implementation',
        rationale: 'DASH diet reduces systolic BP by 8-14 mmHg through sodium reduction and increased potassium',
        evidenceLevel: 'A',
        priority: 'high',
        timeframe: 'immediate',
        specificActions: [
          {
            action: 'Reduce sodium intake',
            frequency: 'Daily',
            duration: 'Ongoing',
            target: '<2.3g per day',
            monitoring: ['Blood pressure', 'Urinary sodium']
          },
          {
            action: 'Increase potassium-rich foods',
            frequency: 'Daily',
            duration: 'Ongoing',
            target: '3.5-5g per day',
            monitoring: ['Blood pressure', 'Serum potassium']
          }
        ],
        expectedOutcomes: [
          {
            parameter: 'Systolic blood pressure',
            expectedChange: '8-14 mmHg reduction',
            timeToEffect: '2-4 weeks',
            measurementFrequency: 'Daily'
          }
        ],
        contraindications: ['Hyperkalemia', 'Severe kidney disease'],
        clinicalGuidelines: [
          {
            organization: 'American Heart Association',
            guideline: '2017 ACC/AHA Hypertension Guidelines',
            recommendationClass: 'Class I'
          }
        ]
      });
    }

    return interventions;
  }

  /**
   * Helper methods for trend analysis
   */
  private determineTrendDirection(change: number, percentChange: number, metricType: string): 'improving' | 'declining' | 'stable' | 'fluctuating' {
    const threshold = this.getTrendThreshold(metricType);
    
    if (Math.abs(percentChange) < threshold) return 'stable';
    
    // For most metrics, lower is better (glucose, BP, weight)
    // For some metrics, higher is better (sleep, steps)
    const lowerIsBetter = ['glucose', 'blood_pressure', 'weight', 'heart_rate'].includes(metricType);
    
    if (lowerIsBetter) {
      return change < 0 ? 'improving' : 'declining';
    } else {
      return change > 0 ? 'improving' : 'declining';
    }
  }

  private determineTrendMagnitude(percentChange: number, metricType: string): 'significant' | 'moderate' | 'mild' {
    if (percentChange > 20) return 'significant';
    if (percentChange > 10) return 'moderate';
    return 'mild';
  }

  private assessClinicalSignificance(metricType: string, change: number, percentChange: number): 'high' | 'medium' | 'low' {
    const significanceThresholds: Record<string, { high: number; medium: number }> = {
      glucose: { high: 15, medium: 10 },
      blood_pressure: { high: 10, medium: 5 },
      weight: { high: 5, medium: 3 },
      heart_rate: { high: 15, medium: 10 },
      sleep: { high: 20, medium: 10 }
    };

    const thresholds = significanceThresholds[metricType] || { high: 15, medium: 10 };
    
    if (Math.abs(percentChange) >= thresholds.high) return 'high';
    if (Math.abs(percentChange) >= thresholds.medium) return 'medium';
    return 'low';
  }

  private identifyRiskFactors(metricType: string, currentValue: number, direction: string, magnitude: string): string[] {
    const riskFactors = [];
    
    if (direction === 'declining' && magnitude !== 'mild') {
      riskFactors.push(`Worsening ${metricType} trend`);
    }
    
    if (metricType === 'glucose' && currentValue > 100) {
      riskFactors.push('Elevated glucose levels');
      if (currentValue > 125) riskFactors.push('Diabetes risk');
    }
    
    if (metricType === 'blood_pressure' && currentValue > 130) {
      riskFactors.push('Hypertension');
      if (currentValue > 140) riskFactors.push('Cardiovascular disease risk');
    }
    
    return riskFactors;
  }

  private getTrendThreshold(metricType: string): number {
    const thresholds: Record<string, number> = {
      glucose: 5,
      blood_pressure: 3,
      weight: 2,
      heart_rate: 8,
      sleep: 10
    };
    return thresholds[metricType] || 5;
  }

  private generateMonitoringRecommendations(assessments: ClinicalAssessment[], trends: ClinicalTrend[]) {
    const keyParameters = [...new Set(assessments.flatMap(a => a.clinicalIndicators.map(i => i.parameter)))];
    
    return {
      recommendedFrequency: 'Weekly',
      keyParameters,
      alertThresholds: [
        {
          parameter: 'Fasting Glucose',
          threshold: 126,
          direction: 'above' as const,
          action: 'Urgent medical consultation'
        },
        {
          parameter: 'Systolic Blood Pressure',
          threshold: 180,
          direction: 'above' as const,
          action: 'Immediate medical attention'
        }
      ]
    };
  }

  private generateFollowUpRecommendations(assessments: ClinicalAssessment[]) {
    const highRiskAssessments = assessments.filter(a => a.condition.probability > 70);
    const urgentAssessments = assessments.filter(a => a.condition.urgency === 'urgent');

    if (urgentAssessments.length > 0) {
      return {
        recommended: true,
        timeframe: '1-2 weeks',
        specialist: 'Primary care physician',
        urgency: 'urgent' as const,
        reason: 'Urgent clinical findings requiring immediate evaluation'
      };
    }

    if (highRiskAssessments.length > 0) {
      return {
        recommended: true,
        timeframe: '4-6 weeks',
        specialist: 'Primary care physician',
        urgency: 'routine' as const,
        reason: 'High-probability clinical findings requiring professional evaluation'
      };
    }

    return {
      recommended: false,
      timeframe: '3 months',
      specialist: 'Primary care physician',
      urgency: 'routine' as const,
      reason: 'Routine monitoring of health trends'
    };
  }

  private assessDataQuality(healthMetrics: HealthMetric[]) {
    const recentMetrics = healthMetrics.filter(m => 
      m.timestamp >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const expectedDataPoints = 30 * 3; // 3 readings per day
    const completeness = Math.min(100, (recentMetrics.length / expectedDataPoints) * 100);
    
    const metricTypes = [...new Set(recentMetrics.map(m => m.metricType))];
    const consistency = metricTypes.length >= 3 ? 85 : 60;

    return {
      completeness: Math.round(completeness),
      consistency: Math.round(consistency),
      timeframe: '30 days'
    };
  }

  private getClinicalDisclaimer(): string {
    return "IMPORTANT MEDICAL DISCLAIMER: This assessment is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. The analysis is based on limited data and algorithmic interpretation. Always consult with qualified healthcare professionals for proper medical evaluation, diagnosis, and treatment decisions. In case of medical emergency, seek immediate professional medical attention.";
  }
}

export const clinicalDecisionSupport = new ClinicalDecisionSupport();