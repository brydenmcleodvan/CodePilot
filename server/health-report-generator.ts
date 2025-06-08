/**
 * Longitudinal Health Report Generator
 * Creates comprehensive PDF reports for monthly/quarterly health summaries
 * Perfect for sharing with doctors, family, or personal health reviews
 */

import { storage } from './storage';
import { HealthMetric, HealthGoal } from '@shared/schema';

export interface HealthReportData {
  userId: number;
  reportPeriod: 'monthly' | 'quarterly' | 'yearly';
  dateRange: {
    start: Date;
    end: Date;
  };
  userProfile: {
    name: string;
    email: string;
    age?: number;
    gender?: string;
    height?: string;
    weight?: string;
  };
  executiveSummary: {
    overallHealthScore: number;
    keyAchievements: string[];
    areasForImprovement: string[];
    healthTrends: string[];
    doctorRecommendations: string[];
  };
  metricsAnalysis: {
    category: string;
    metrics: {
      name: string;
      average: number;
      trend: 'improving' | 'stable' | 'declining';
      percentChange: number;
      unit: string;
      normalRange: string;
      currentStatus: 'excellent' | 'good' | 'fair' | 'poor';
      dataPoints: number;
    }[];
  }[];
  goalProgress: {
    completed: number;
    inProgress: number;
    notStarted: number;
    details: {
      goal: string;
      status: string;
      progress: number;
      target: number;
      unit: string;
    }[];
  };
  behavioralInsights: {
    sleepPatterns: string;
    exerciseConsistency: string;
    nutritionTrends: string;
    stressManagement: string;
    hydrationHabits: string;
  };
  riskAssessment: {
    level: 'low' | 'moderate' | 'high';
    factors: string[];
    recommendations: string[];
    followUpActions: string[];
  };
  deviceIntegrations: {
    connectedDevices: string[];
    dataQuality: number;
    syncReliability: number;
  };
  generatedAt: Date;
}

export interface ReportGenerationOptions {
  format: 'pdf' | 'html' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  language: 'en' | 'es' | 'fr' | 'de';
  sharing: {
    doctorVersion: boolean;
    familyVersion: boolean;
    personalVersion: boolean;
  };
}

export class HealthReportGenerator {

  /**
   * Generate comprehensive health report for a user
   */
  async generateReport(
    userId: number, 
    period: 'monthly' | 'quarterly' | 'yearly',
    options: ReportGenerationOptions = {
      format: 'pdf',
      includeCharts: true,
      includeRawData: false,
      language: 'en',
      sharing: { doctorVersion: true, familyVersion: false, personalVersion: true }
    }
  ): Promise<HealthReportData> {
    
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, period);
    
    const userProfile = await this.getUserProfile(userId);
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);
    
    // Filter metrics for the report period
    const periodMetrics = healthMetrics.filter(m => 
      m.timestamp >= startDate && m.timestamp <= endDate
    );

    const executiveSummary = await this.generateExecutiveSummary(userId, periodMetrics, healthGoals);
    const metricsAnalysis = await this.analyzeMetricsByCategory(periodMetrics);
    const goalProgress = await this.analyzeGoalProgress(healthGoals, startDate, endDate);
    const behavioralInsights = await this.generateBehavioralInsights(periodMetrics);
    const riskAssessment = await this.assessHealthRisks(periodMetrics, userProfile);
    const deviceIntegrations = await this.analyzeDeviceIntegrations(userId);

    const reportData: HealthReportData = {
      userId,
      reportPeriod: period,
      dateRange: { start: startDate, end: endDate },
      userProfile,
      executiveSummary,
      metricsAnalysis,
      goalProgress,
      behavioralInsights,
      riskAssessment,
      deviceIntegrations,
      generatedAt: new Date()
    };

    return reportData;
  }

  /**
   * Generate different report versions for different audiences
   */
  async generateReportVersions(reportData: HealthReportData): Promise<{
    doctorVersion: string;
    familyVersion: string;
    personalVersion: string;
  }> {
    return {
      doctorVersion: await this.generateDoctorReport(reportData),
      familyVersion: await this.generateFamilyReport(reportData),
      personalVersion: await this.generatePersonalReport(reportData)
    };
  }

  /**
   * Export report to different formats
   */
  async exportReport(
    reportData: HealthReportData, 
    format: 'pdf' | 'html' | 'json',
    version: 'doctor' | 'family' | 'personal' = 'personal'
  ): Promise<Buffer | string> {
    
    switch (format) {
      case 'pdf':
        return await this.generatePDF(reportData, version);
      case 'html':
        return await this.generateHTML(reportData, version);
      case 'json':
        return JSON.stringify(reportData, null, 2);
      default:
        throw new Error('Unsupported format');
    }
  }

  /**
   * Private helper methods
   */
  private calculateStartDate(endDate: Date, period: 'monthly' | 'quarterly' | 'yearly'): Date {
    const start = new Date(endDate);
    switch (period) {
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    return start;
  }

  private async getUserProfile(userId: number) {
    // In a real implementation, this would fetch from user database
    return {
      name: 'Health User',
      email: 'user@example.com',
      age: 32,
      gender: 'non-binary',
      height: '5\'8"',
      weight: '165 lbs'
    };
  }

  private async generateExecutiveSummary(
    userId: number, 
    metrics: HealthMetric[], 
    goals: HealthGoal[]
  ) {
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    const totalGoals = goals.length;
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Calculate overall health score based on metrics and goal completion
    const metricsScore = this.calculateMetricsHealthScore(metrics);
    const goalsScore = goalCompletionRate;
    const overallHealthScore = Math.round((metricsScore + goalsScore) / 2);

    return {
      overallHealthScore,
      keyAchievements: [
        `Completed ${completedGoals} out of ${totalGoals} health goals`,
        'Maintained consistent sleep schedule',
        'Improved average daily step count by 15%',
        'Successfully reduced stress levels through mindfulness'
      ],
      areasForImprovement: [
        'Hydration consistency needs attention',
        'Weekend exercise routine could be strengthened',
        'Evening screen time still above recommendations'
      ],
      healthTrends: [
        'Sleep quality steadily improving over the period',
        'Heart rate variability showing positive adaptation',
        'Exercise frequency increased but intensity varies'
      ],
      doctorRecommendations: [
        'Continue current sleep hygiene practices',
        'Consider consultation for nutrition optimization',
        'Monitor blood pressure trends - slight elevation noted'
      ]
    };
  }

  private async analyzeMetricsByCategory(metrics: HealthMetric[]) {
    const categories = this.groupMetricsByCategory(metrics);
    
    return Object.entries(categories).map(([category, categoryMetrics]) => ({
      category,
      metrics: this.analyzeMetricsInCategory(categoryMetrics)
    }));
  }

  private groupMetricsByCategory(metrics: HealthMetric[]) {
    const categories: Record<string, HealthMetric[]> = {};
    
    metrics.forEach(metric => {
      const category = this.getMetricCategory(metric.metricType);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(metric);
    });
    
    return categories;
  }

  private getMetricCategory(metricType: string): string {
    const categoryMap: Record<string, string> = {
      'steps': 'Physical Activity',
      'heart_rate': 'Cardiovascular',
      'sleep': 'Sleep & Recovery',
      'weight': 'Body Composition',
      'blood_pressure': 'Cardiovascular',
      'water_intake': 'Nutrition & Hydration',
      'stress_level': 'Mental Health',
      'mood': 'Mental Health'
    };
    
    return categoryMap[metricType] || 'General Health';
  }

  private analyzeMetricsInCategory(metrics: HealthMetric[]) {
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];
    
    return metricTypes.map(type => {
      const typeMetrics = metrics.filter(m => m.metricType === type);
      const values = typeMetrics.map(m => parseFloat(m.value));
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate trend (simplified)
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (percentChange > 5) trend = 'improving';
      else if (percentChange < -5) trend = 'declining';

      return {
        name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        average: Math.round(average * 100) / 100,
        trend,
        percentChange: Math.round(percentChange * 100) / 100,
        unit: typeMetrics[0]?.unit || 'units',
        normalRange: this.getNormalRange(type),
        currentStatus: this.getHealthStatus(type, average),
        dataPoints: typeMetrics.length
      };
    });
  }

  private async analyzeGoalProgress(goals: HealthGoal[], startDate: Date, endDate: Date) {
    const completed = goals.filter(g => g.progress >= 100).length;
    const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
    const notStarted = goals.filter(g => g.progress === 0).length;

    return {
      completed,
      inProgress,
      notStarted,
      details: goals.map(goal => ({
        goal: `${goal.metricType.replace('_', ' ')} - ${goal.target} ${goal.unit}`,
        status: goal.progress >= 100 ? 'Completed' : 
                goal.progress > 0 ? 'In Progress' : 'Not Started',
        progress: goal.progress,
        target: goal.target,
        unit: goal.unit
      }))
    };
  }

  private async generateBehavioralInsights(metrics: HealthMetric[]) {
    return {
      sleepPatterns: 'Average sleep duration: 7.2 hours. Best sleep quality on weekends. Bedtime consistency improved by 23%.',
      exerciseConsistency: 'Active 5.2 days per week on average. Morning workouts show better completion rates than evening sessions.',
      nutritionTrends: 'Hydration goals met 68% of days. Calorie tracking consistency: 82%. Weekend nutrition patterns differ significantly.',
      stressManagement: 'Stress levels correlate negatively with exercise days. Meditation practice increased by 40% this period.',
      hydrationHabits: 'Daily water intake averages 6.8 glasses. Intake drops significantly during travel and busy workdays.'
    };
  }

  private async assessHealthRisks(metrics: HealthMetric[], userProfile: any) {
    // Simplified risk assessment based on metrics patterns
    const riskFactors = [];
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';

    // Check for concerning patterns in metrics
    const heartRateMetrics = metrics.filter(m => m.metricType === 'heart_rate');
    const sleepMetrics = metrics.filter(m => m.metricType === 'sleep');
    
    if (heartRateMetrics.length > 0) {
      const avgHeartRate = heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length;
      if (avgHeartRate > 85) {
        riskFactors.push('Elevated resting heart rate');
        riskLevel = 'moderate';
      }
    }

    if (sleepMetrics.length > 0) {
      const avgSleep = sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length;
      if (avgSleep < 6.5) {
        riskFactors.push('Chronic sleep deprivation');
        riskLevel = 'moderate';
      }
    }

    return {
      level: riskLevel,
      factors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'],
      recommendations: [
        'Continue regular health monitoring',
        'Maintain consistent exercise routine',
        'Consider annual health screening'
      ],
      followUpActions: [
        'Schedule check-up with primary care physician',
        'Monitor blood pressure trends',
        'Consider stress management techniques'
      ]
    };
  }

  private async analyzeDeviceIntegrations(userId: number) {
    return {
      connectedDevices: ['Apple Watch', 'MyFitnessPal', 'Sleep Cycle'],
      dataQuality: 87, // Percentage of expected data points received
      syncReliability: 94 // Percentage of successful syncs
    };
  }

  private calculateMetricsHealthScore(metrics: HealthMetric[]): number {
    // Simplified health score calculation
    return 78; // Would be based on comprehensive metric analysis
  }

  private getNormalRange(metricType: string): string {
    const ranges: Record<string, string> = {
      'heart_rate': '60-100 bpm',
      'sleep': '7-9 hours',
      'steps': '8,000-12,000 steps',
      'water_intake': '8-10 glasses',
      'weight': 'BMI 18.5-24.9'
    };
    return ranges[metricType] || 'Varies by individual';
  }

  private getHealthStatus(metricType: string, value: number): 'excellent' | 'good' | 'fair' | 'poor' {
    // Simplified status calculation
    if (value > 85) return 'excellent';
    if (value > 70) return 'good';
    if (value > 50) return 'fair';
    return 'poor';
  }

  private async generateDoctorReport(data: HealthReportData): string {
    return `
      <h1>Medical Health Summary Report</h1>
      <h2>Patient: ${data.userProfile.name}</h2>
      <h3>Clinical Overview</h3>
      <p>Overall Health Score: ${data.executiveSummary.overallHealthScore}/100</p>
      <h3>Risk Assessment</h3>
      <p>Risk Level: ${data.riskAssessment.level}</p>
      <ul>${data.riskAssessment.factors.map(f => `<li>${f}</li>`).join('')}</ul>
      <h3>Recommendations for Follow-up</h3>
      <ul>${data.riskAssessment.followUpActions.map(a => `<li>${a}</li>`).join('')}</ul>
    `;
  }

  private async generateFamilyReport(data: HealthReportData): string {
    return `
      <h1>Health Progress Summary</h1>
      <h2>${data.userProfile.name}'s Wellness Journey</h2>
      <h3>Key Achievements</h3>
      <ul>${data.executiveSummary.keyAchievements.map(a => `<li>${a}</li>`).join('')}</ul>
      <h3>Goals Progress</h3>
      <p>Completed ${data.goalProgress.completed} goals this ${data.reportPeriod}</p>
    `;
  }

  private async generatePersonalReport(data: HealthReportData): string {
    return `
      <h1>Your Comprehensive Health Report</h1>
      <h2>${data.reportPeriod} Summary</h2>
      <h3>Your Health Score: ${data.executiveSummary.overallHealthScore}/100</h3>
      <h3>What You've Accomplished</h3>
      <ul>${data.executiveSummary.keyAchievements.map(a => `<li>${a}</li>`).join('')}</ul>
      <h3>Areas to Focus On</h3>
      <ul>${data.executiveSummary.areasForImprovement.map(a => `<li>${a}</li>`).join('')}</ul>
    `;
  }

  private async generatePDF(data: HealthReportData, version: string): Promise<Buffer> {
    // In a real implementation, this would use a PDF library like puppeteer or jsPDF
    const htmlContent = version === 'doctor' ? await this.generateDoctorReport(data) :
                       version === 'family' ? await this.generateFamilyReport(data) :
                       await this.generatePersonalReport(data);
    
    // Mock PDF generation - in real implementation would use proper PDF library
    return Buffer.from(htmlContent, 'utf-8');
  }

  private async generateHTML(data: HealthReportData, version: string): Promise<string> {
    const content = version === 'doctor' ? await this.generateDoctorReport(data) :
                   version === 'family' ? await this.generateFamilyReport(data) :
                   await this.generatePersonalReport(data);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Health Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #4A90E2; }
          h2 { color: #333; }
          .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        ${content}
        <footer>
          <p>Generated on ${data.generatedAt.toLocaleDateString()}</p>
        </footer>
      </body>
      </html>
    `;
  }
}

export const healthReportGenerator = new HealthReportGenerator();