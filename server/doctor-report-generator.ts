/**
 * Doctor Report Generator
 * Generates physician-ready PDF reports with comprehensive health data
 * Includes patient info, metrics, trends, alerts, and clinical insights
 */

import { storage } from './storage';
import { HealthMetric, User, HealthGoal } from '@shared/schema';
import { healthScoreEngine } from './health-score-engine';
import { riskDetectionEngine } from './risk-detection-engine';
import { clinicalDecisionSupport } from './clinical-decision-support';

export interface PatientSummary {
  patientInfo: {
    name: string;
    age?: number;
    gender?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
  };
  reportInfo: {
    generatedDate: string;
    reportPeriod: string;
    reportType: 'comprehensive' | 'summary' | 'emergency';
    healthcareProvider?: string;
  };
}

export interface MetricSummary {
  metricType: string;
  displayName: string;
  unit: string;
  current: {
    value: number;
    date: string;
    status: 'normal' | 'borderline' | 'abnormal' | 'critical';
  };
  average: {
    value: number;
    period: string;
  };
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    change: number;
    significance: 'significant' | 'moderate' | 'minimal';
  };
  normalRange: {
    min: number;
    max: number;
    optimal?: number;
  };
  clinicalNotes?: string;
}

export interface DoctorReportData {
  patientSummary: PatientSummary;
  healthScore: {
    overall: number;
    category: string;
    breakdown: any[];
    trend: string;
  };
  metrics: MetricSummary[];
  alerts: {
    critical: any[];
    warnings: any[];
    recommendations: string[];
  };
  clinicalInsights: {
    assessments: any[];
    riskFactors: any[];
    interventions: any[];
  };
  goals: {
    active: any[];
    completed: any[];
    recommendations: string[];
  };
  disclaimer: string;
}

export class DoctorReportGenerator {
  private readonly metricDisplayNames: Record<string, string> = {
    heart_rate: 'Resting Heart Rate',
    blood_pressure: 'Blood Pressure (Systolic)',
    glucose: 'Blood Glucose',
    sleep: 'Sleep Duration',
    steps: 'Daily Steps',
    weight: 'Body Weight',
    heart_rate_variability: 'Heart Rate Variability',
    mood: 'Mood Score',
    stress: 'Stress Level',
    body_temperature: 'Body Temperature',
    oxygen_saturation: 'Oxygen Saturation'
  };

  private readonly normalRanges: Record<string, any> = {
    heart_rate: { min: 60, max: 90, optimal: 70, unit: 'bpm' },
    blood_pressure: { min: 90, max: 120, optimal: 110, unit: 'mmHg' },
    glucose: { min: 70, max: 100, optimal: 85, unit: 'mg/dL' },
    sleep: { min: 7, max: 9, optimal: 8, unit: 'hours' },
    steps: { min: 8000, max: 15000, optimal: 10000, unit: 'steps' },
    weight: { min: 0, max: 300, unit: 'kg' }, // Individualized
    heart_rate_variability: { min: 30, max: 100, optimal: 50, unit: 'ms' },
    mood: { min: 7, max: 10, optimal: 9, unit: 'score' },
    stress: { min: 1, max: 3, optimal: 2, unit: 'level' },
    body_temperature: { min: 36.1, max: 37.2, optimal: 36.8, unit: '°C' },
    oxygen_saturation: { min: 95, max: 100, optimal: 98, unit: '%' }
  };

  /**
   * Generate comprehensive doctor report
   */
  async generateDoctorReport(userId: number, reportType: 'comprehensive' | 'summary' | 'emergency' = 'comprehensive'): Promise<DoctorReportData> {
    const user = await storage.getUser(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);

    // Generate patient summary
    const patientSummary = this.createPatientSummary(user, reportType);

    // Get health score
    const healthScoreReport = await healthScoreEngine.calculateHealthScore(userId);
    const healthScore = {
      overall: healthScoreReport.overallScore,
      category: healthScoreReport.category,
      breakdown: healthScoreReport.breakdown,
      trend: healthScoreReport.trends.direction
    };

    // Process metrics
    const metrics = await this.processMetricsForReport(healthMetrics);

    // Get alerts and risks
    const riskAssessment = await riskDetectionEngine.performRiskAssessment(userId);
    const alerts = {
      critical: riskAssessment.activeAlerts.filter(a => a.type === 'critical'),
      warnings: riskAssessment.activeAlerts.filter(a => a.type === 'warning'),
      recommendations: riskAssessment.activeAlerts.map(a => a.recommendation)
    };

    // Get clinical insights
    const clinicalReport = await clinicalDecisionSupport.generateClinicalReport(userId);
    const clinicalInsights = {
      assessments: clinicalReport.assessments,
      riskFactors: clinicalReport.trends.filter(t => t.clinicalSignificance === 'high'),
      interventions: clinicalReport.interventions.slice(0, 5) // Top 5 interventions
    };

    // Process goals
    const goals = this.processGoalsForReport(healthGoals);

    return {
      patientSummary,
      healthScore,
      metrics,
      alerts,
      clinicalInsights,
      goals,
      disclaimer: this.getMedicalDisclaimer()
    };
  }

  /**
   * Create patient summary section
   */
  private createPatientSummary(user: any, reportType: string): PatientSummary {
    return {
      patientInfo: {
        name: user?.username || 'Patient',
        age: user?.age,
        gender: user?.gender,
        dateOfBirth: user?.dateOfBirth,
        emergencyContact: user?.emergencyContact
      },
      reportInfo: {
        generatedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        reportPeriod: 'Last 30 days',
        reportType,
        healthcareProvider: 'Healthmap Platform'
      }
    };
  }

  /**
   * Process metrics for report format
   */
  private async processMetricsForReport(healthMetrics: HealthMetric[]): Promise<MetricSummary[]> {
    const metricSummaries: MetricSummary[] = [];
    const metricTypes = [...new Set(healthMetrics.map(m => m.metricType))];

    for (const metricType of metricTypes) {
      const typeMetrics = healthMetrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (typeMetrics.length === 0) continue;

      const summary = this.createMetricSummary(metricType, typeMetrics);
      metricSummaries.push(summary);
    }

    // Sort by clinical importance
    return metricSummaries.sort((a, b) => {
      const importanceOrder = ['heart_rate', 'blood_pressure', 'glucose', 'sleep', 'heart_rate_variability', 'steps', 'weight', 'mood'];
      const indexA = importanceOrder.indexOf(a.metricType);
      const indexB = importanceOrder.indexOf(b.metricType);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }

  /**
   * Create summary for individual metric
   */
  private createMetricSummary(metricType: string, metrics: HealthMetric[]): MetricSummary {
    const values = metrics.map(m => parseFloat(m.value));
    const currentValue = values[0]; // Most recent
    const currentDate = metrics[0].timestamp.toLocaleDateString();

    // Calculate 30-day average
    const recentMetrics = metrics.filter(m => 
      m.timestamp >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const recentValues = recentMetrics.map(m => parseFloat(m.value));
    const averageValue = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

    // Calculate trend
    const trend = this.calculateMetricTrend(values);

    // Determine status
    const normalRange = this.normalRanges[metricType];
    const status = this.determineMetricStatus(currentValue, normalRange);

    // Generate clinical notes
    const clinicalNotes = this.generateClinicalNotes(metricType, currentValue, averageValue, trend, status);

    return {
      metricType,
      displayName: this.metricDisplayNames[metricType] || metricType,
      unit: normalRange?.unit || '',
      current: {
        value: Math.round(currentValue * 100) / 100,
        date: currentDate,
        status
      },
      average: {
        value: Math.round(averageValue * 100) / 100,
        period: '30-day average'
      },
      trend,
      normalRange: normalRange || { min: 0, max: 100 },
      clinicalNotes
    };
  }

  /**
   * Calculate metric trend
   */
  private calculateMetricTrend(values: number[]): {
    direction: 'improving' | 'stable' | 'declining';
    change: number;
    significance: 'significant' | 'moderate' | 'minimal';
  } {
    if (values.length < 5) {
      return { direction: 'stable', change: 0, significance: 'minimal' };
    }

    const recent = values.slice(0, 5); // Last 5 readings
    const previous = values.slice(5, 10); // Previous 5 readings

    if (previous.length === 0) {
      return { direction: 'stable', change: 0, significance: 'minimal' };
    }

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    const change = recentAvg - previousAvg;
    const percentChange = Math.abs((change / previousAvg) * 100);

    let direction: 'improving' | 'stable' | 'declining' = 'stable';
    if (Math.abs(percentChange) > 5) {
      direction = change > 0 ? 'improving' : 'declining';
    }

    let significance: 'significant' | 'moderate' | 'minimal' = 'minimal';
    if (percentChange > 20) significance = 'significant';
    else if (percentChange > 10) significance = 'moderate';

    return {
      direction,
      change: Math.round(change * 100) / 100,
      significance
    };
  }

  /**
   * Determine metric status
   */
  private determineMetricStatus(value: number, normalRange: any): 'normal' | 'borderline' | 'abnormal' | 'critical' {
    if (!normalRange) return 'normal';

    // Critical thresholds (outside safe ranges)
    const criticalLow = normalRange.min - (normalRange.min * 0.3);
    const criticalHigh = normalRange.max + (normalRange.max * 0.3);

    if (value < criticalLow || value > criticalHigh) return 'critical';

    // Borderline thresholds
    const borderlineLow = normalRange.min - (normalRange.min * 0.1);
    const borderlineHigh = normalRange.max + (normalRange.max * 0.1);

    if (value < normalRange.min || value > normalRange.max) return 'abnormal';
    if (value < borderlineLow || value > borderlineHigh) return 'borderline';

    return 'normal';
  }

  /**
   * Generate clinical notes for metrics
   */
  private generateClinicalNotes(metricType: string, currentValue: number, averageValue: number, trend: any, status: string): string {
    const clinicalNotesMap: Record<string, any> = {
      heart_rate: {
        normal: 'Resting heart rate within normal range, indicating good cardiovascular fitness.',
        borderline: 'Resting heart rate slightly elevated, monitor for cardiovascular stress.',
        abnormal: 'Resting heart rate outside normal range, may indicate cardiovascular concern.',
        critical: 'Critically abnormal heart rate requiring immediate medical attention.'
      },
      blood_pressure: {
        normal: 'Blood pressure within optimal range for cardiovascular health.',
        borderline: 'Blood pressure in pre-hypertensive range, lifestyle modifications recommended.',
        abnormal: 'Elevated blood pressure, medical evaluation and intervention recommended.',
        critical: 'Severely elevated blood pressure requiring immediate medical attention.'
      },
      glucose: {
        normal: 'Blood glucose levels within normal range, good metabolic control.',
        borderline: 'Blood glucose slightly elevated, monitor for prediabetes risk.',
        abnormal: 'Blood glucose elevated, diabetes screening and management recommended.',
        critical: 'Critically abnormal glucose levels requiring immediate medical care.'
      },
      sleep: {
        normal: 'Sleep duration adequate for optimal health and recovery.',
        borderline: 'Sleep duration suboptimal, may impact health and performance.',
        abnormal: 'Insufficient sleep duration, significant health risks if sustained.',
        critical: 'Severely inadequate sleep requiring immediate intervention.'
      }
    };

    const baseNote = clinicalNotesMap[metricType]?.[status] || `${metricType} reading is ${status}.`;
    
    // Add trend information
    if (trend.significance !== 'minimal') {
      const trendNote = trend.direction === 'improving' ? 'showing improvement' : 
                       trend.direction === 'declining' ? 'showing concerning decline' : 'stable';
      return `${baseNote} Recent trend: ${trendNote} (${trend.significance} change).`;
    }

    return baseNote;
  }

  /**
   * Process goals for report
   */
  private processGoalsForReport(healthGoals: any[]) {
    const activeGoals = healthGoals.filter(g => g.status === 'active');
    const completedGoals = healthGoals.filter(g => g.status === 'completed');

    const recommendations = this.generateGoalRecommendations(activeGoals, completedGoals);

    return {
      active: activeGoals.map(goal => ({
        type: goal.goalType,
        target: goal.goalValue,
        progress: goal.progress || 0,
        timeframe: goal.timeframe,
        status: goal.status
      })),
      completed: completedGoals.map(goal => ({
        type: goal.goalType,
        target: goal.goalValue,
        completedDate: goal.endDate,
        timeframe: goal.timeframe
      })),
      recommendations
    };
  }

  /**
   * Generate goal recommendations
   */
  private generateGoalRecommendations(activeGoals: any[], completedGoals: any[]): string[] {
    const recommendations = [];

    if (activeGoals.length === 0) {
      recommendations.push('Consider setting specific, measurable health goals to track progress.');
    }

    if (completedGoals.length > 0) {
      recommendations.push(`Successfully completed ${completedGoals.length} health goal(s). Continue building on this success.`);
    }

    // Specific recommendations based on active goals
    const goalTypes = activeGoals.map(g => g.goalType);
    if (goalTypes.includes('weight_loss')) {
      recommendations.push('Weight management goals in progress. Monitor progress weekly and adjust caloric intake as needed.');
    }
    if (goalTypes.includes('exercise')) {
      recommendations.push('Exercise goals active. Ensure adequate rest and recovery between sessions.');
    }
    if (goalTypes.includes('sleep')) {
      recommendations.push('Sleep improvement goals set. Maintain consistent sleep schedule and sleep hygiene practices.');
    }

    return recommendations;
  }

  /**
   * Get medical disclaimer
   */
  private getMedicalDisclaimer(): string {
    return "MEDICAL DISCLAIMER: This report is generated from self-reported health data and automated analysis. It is intended for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals regarding any health concerns or before making medical decisions. In case of medical emergency, seek immediate professional medical attention.";
  }

  /**
   * Generate summary report (shorter version)
   */
  async generateSummaryReport(userId: number): Promise<{
    patientName: string;
    reportDate: string;
    healthScore: number;
    keyMetrics: { name: string; value: string; status: string }[];
    criticalAlerts: string[];
    recommendations: string[];
  }> {
    const fullReport = await this.generateDoctorReport(userId, 'summary');

    return {
      patientName: fullReport.patientSummary.patientInfo.name,
      reportDate: fullReport.patientSummary.reportInfo.generatedDate,
      healthScore: fullReport.healthScore.overall,
      keyMetrics: fullReport.metrics.slice(0, 5).map(m => ({
        name: m.displayName,
        value: `${m.current.value} ${m.unit}`,
        status: m.current.status
      })),
      criticalAlerts: fullReport.alerts.critical.map(a => a.message),
      recommendations: fullReport.alerts.recommendations.slice(0, 3)
    };
  }

  /**
   * Generate emergency report (critical alerts only)
   */
  async generateEmergencyReport(userId: number): Promise<{
    patientInfo: any;
    emergencyAlerts: any[];
    vitalSigns: any[];
    immediateActions: string[];
    emergencyContacts: any[];
  }> {
    const riskAssessment = await riskDetectionEngine.performRiskAssessment(userId);
    const user = await storage.getUser(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);

    // Get only vital signs from last hour
    const recentVitals = healthMetrics.filter(m => {
      const vitalTypes = ['heart_rate', 'blood_pressure', 'glucose', 'oxygen_saturation', 'body_temperature'];
      return vitalTypes.includes(m.metricType) && 
             m.timestamp >= new Date(Date.now() - 60 * 60 * 1000);
    });

    return {
      patientInfo: {
        name: user?.username || 'Patient',
        age: user?.age,
        emergencyContact: user?.emergencyContact
      },
      emergencyAlerts: riskAssessment.activeAlerts.filter(a => a.severity === 'emergency'),
      vitalSigns: recentVitals.map(v => ({
        type: v.metricType,
        value: v.value,
        unit: this.normalRanges[v.metricType]?.unit || '',
        timestamp: v.timestamp.toLocaleTimeString()
      })),
      immediateActions: riskAssessment.emergencyContacts
        .filter(c => c.urgency === 'immediate')
        .map(c => c.reason),
      emergencyContacts: riskAssessment.emergencyContacts
    };
  }

  /**
   * Format report for PDF generation (simplified structure)
   */
  formatForPDF(reportData: DoctorReportData): any {
    return {
      title: 'Health Report',
      patient: reportData.patientSummary.patientInfo,
      reportInfo: reportData.patientSummary.reportInfo,
      sections: [
        {
          title: 'Health Score Overview',
          content: {
            score: reportData.healthScore.overall,
            category: reportData.healthScore.category,
            trend: reportData.healthScore.trend
          }
        },
        {
          title: 'Vital Metrics',
          content: reportData.metrics.map(m => ({
            name: m.displayName,
            current: `${m.current.value} ${m.unit}`,
            average: `${m.average.value} ${m.unit}`,
            status: m.current.status,
            trend: m.trend.direction,
            notes: m.clinicalNotes
          }))
        },
        {
          title: 'Health Alerts',
          content: {
            critical: reportData.alerts.critical.length,
            warnings: reportData.alerts.warnings.length,
            recommendations: reportData.alerts.recommendations
          }
        },
        {
          title: 'Clinical Insights',
          content: {
            assessments: reportData.clinicalInsights.assessments.length,
            interventions: reportData.clinicalInsights.interventions.map(i => i.intervention)
          }
        }
      ],
      disclaimer: reportData.disclaimer
    };
  }
}

export const doctorReportGenerator = new DoctorReportGenerator();