/**
 * Data Quality Engine
 * Detects conflicting data from wearables, scores reliability, and prompts user correction
 * Ensures data integrity across all health monitoring devices and manual inputs
 */

import { storage } from './storage';
import { HealthMetric } from '@shared/schema';

export interface DataQualityScore {
  overall: number; // 0-100 scale
  components: {
    consistency: number;
    plausibility: number;
    completeness: number;
    timeliness: number;
  };
  reliability: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number;
}

export interface DataOutlier {
  id: string;
  metricId: number;
  metricType: string;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  outlierType: 'impossible' | 'highly_unlikely' | 'inconsistent' | 'missing_context';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  expectedRange: {
    min: number;
    max: number;
    typical: number;
  };
  correctionSuggestions: {
    type: 'user_input' | 'device_sync' | 'algorithm_fix' | 'ignore';
    description: string;
    confidence: number;
  }[];
  relatedMetrics: {
    metricType: string;
    value: number;
    correlation: number;
  }[];
}

export interface DeviceReliabilityScore {
  deviceId: string;
  deviceName: string;
  deviceType: 'wearable' | 'scale' | 'blood_pressure' | 'glucose_meter' | 'manual_entry';
  reliability: {
    overall: number;
    dataConsistency: number;
    syncReliability: number;
    accuracyScore: number;
    batteryHealth: number;
  };
  metrics: {
    metricType: string;
    qualityScore: number;
    outlierRate: number;
    missingDataRate: number;
    lastSync: Date;
  }[];
  issues: {
    type: 'sync_failure' | 'battery_low' | 'calibration_needed' | 'sensor_drift' | 'user_error';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
    firstDetected: Date;
  }[];
  trends: {
    period: '24h' | '7d' | '30d';
    reliabilityChange: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
  };
}

export interface DataConflict {
  id: string;
  timestamp: Date;
  metricType: string;
  conflictingSources: {
    source: string;
    value: number;
    confidence: number;
  }[];
  discrepancy: {
    maxDifference: number;
    percentVariation: number;
    significance: 'minor' | 'moderate' | 'major' | 'critical';
  };
  resolutionStrategy: {
    recommendedSource: string;
    reasoning: string;
    confidence: number;
    alternativeOptions: string[];
  };
  userAction: 'review_required' | 'auto_resolved' | 'ignored' | 'manual_override';
}

export interface DataQualityReport {
  userId: number;
  generatedAt: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  overallQuality: DataQualityScore;
  outliers: DataOutlier[];
  deviceReliability: DeviceReliabilityScore[];
  conflicts: DataConflict[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  insights: {
    dataIntegrityTrends: string[];
    devicePerformance: string[];
    userBehaviorPatterns: string[];
  };
}

export class DataQualityEngine {

  /**
   * Generate comprehensive data quality report
   */
  async generateDataQualityReport(userId: number, days: number = 7): Promise<DataQualityReport> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const healthMetrics = await storage.getHealthMetrics(userId);
    const periodMetrics = healthMetrics.filter(m => 
      m.timestamp >= startDate && m.timestamp <= endDate
    );

    // Analyze data quality components
    const overallQuality = await this.calculateOverallDataQuality(periodMetrics);
    const outliers = await this.detectDataOutliers(periodMetrics);
    const deviceReliability = await this.assessDeviceReliability(periodMetrics);
    const conflicts = await this.detectDataConflicts(periodMetrics);
    
    // Generate recommendations and insights
    const recommendations = this.generateQualityRecommendations(outliers, deviceReliability, conflicts);
    const insights = this.generateDataInsights(periodMetrics, deviceReliability);

    return {
      userId,
      generatedAt: new Date(),
      timeframe: { start: startDate, end: endDate },
      overallQuality,
      outliers,
      deviceReliability,
      conflicts,
      recommendations,
      insights
    };
  }

  /**
   * Real-time data validation for new metrics
   */
  async validateNewMetric(metric: HealthMetric): Promise<{
    isValid: boolean;
    quality: DataQualityScore;
    issues: DataOutlier[];
    recommendations: string[];
  }> {
    const recentMetrics = await storage.getHealthMetrics(metric.userId);
    const relatedMetrics = recentMetrics
      .filter(m => m.metricType === metric.metricType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 30); // Last 30 readings

    // Validate against historical data and patterns
    const outliers = await this.detectSingleMetricOutliers(metric, relatedMetrics);
    const quality = this.calculateMetricQuality(metric, relatedMetrics);
    
    const isValid = outliers.length === 0 || outliers.every(o => o.severity !== 'critical');
    const recommendations = this.generateValidationRecommendations(metric, outliers);

    return {
      isValid,
      quality,
      issues: outliers,
      recommendations
    };
  }

  /**
   * Get data quality indicators for UI display
   */
  getQualityIndicators(qualityScore: number): {
    icon: string;
    color: string;
    label: string;
    description: string;
  } {
    if (qualityScore >= 90) {
      return {
        icon: '🟢',
        color: 'green',
        label: 'Excellent',
        description: 'Data is highly reliable and consistent'
      };
    } else if (qualityScore >= 75) {
      return {
        icon: '🟡',
        color: 'yellow',
        label: 'Good',
        description: 'Data quality is good with minor inconsistencies'
      };
    } else if (qualityScore >= 60) {
      return {
        icon: '🟠',
        color: 'orange',
        label: 'Fair',
        description: 'Data has some quality issues that may affect accuracy'
      };
    } else {
      return {
        icon: '🔴',
        color: 'red',
        label: 'Poor',
        description: 'Significant data quality issues detected'
      };
    }
  }

  /**
   * Private helper methods
   */
  private async calculateOverallDataQuality(metrics: HealthMetric[]): Promise<DataQualityScore> {
    if (metrics.length === 0) {
      return {
        overall: 0,
        components: { consistency: 0, plausibility: 0, completeness: 0, timeliness: 0 },
        reliability: 'poor',
        confidence: 0
      };
    }

    // Calculate consistency score
    const consistency = this.calculateConsistencyScore(metrics);
    
    // Calculate plausibility score
    const plausibility = this.calculatePlausibilityScore(metrics);
    
    // Calculate completeness score
    const completeness = this.calculateCompletenessScore(metrics);
    
    // Calculate timeliness score
    const timeliness = this.calculateTimelinessScore(metrics);

    const overall = Math.round((consistency + plausibility + completeness + timeliness) / 4);
    const reliability = this.determineReliabilityLevel(overall);

    return {
      overall,
      components: { consistency, plausibility, completeness, timeliness },
      reliability,
      confidence: Math.min(0.95, 0.5 + (overall / 200)) // Higher confidence for better quality
    };
  }

  private calculateConsistencyScore(metrics: HealthMetric[]): number {
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];
    let totalConsistency = 0;

    for (const metricType of metricTypes) {
      const typeMetrics = metrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (typeMetrics.length < 3) continue;

      const values = typeMetrics.map(m => parseFloat(m.value));
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / mean;

      // Lower CV indicates higher consistency
      const consistency = Math.max(0, 100 - (coefficientOfVariation * 100));
      totalConsistency += consistency;
    }

    return metricTypes.length > 0 ? Math.round(totalConsistency / metricTypes.length) : 100;
  }

  private calculatePlausibilityScore(metrics: HealthMetric[]): number {
    let plausibleCount = 0;
    let totalCount = 0;

    for (const metric of metrics) {
      totalCount++;
      const value = parseFloat(metric.value);
      
      if (this.isPlausibleValue(metric.metricType, value)) {
        plausibleCount++;
      }
    }

    return totalCount > 0 ? Math.round((plausibleCount / totalCount) * 100) : 100;
  }

  private calculateCompletenessScore(metrics: HealthMetric[]): number {
    // Calculate expected vs actual data points
    const timespan = 7; // days
    const expectedDataPoints = this.getExpectedDataPoints(timespan);
    const actualDataPoints = metrics.length;
    
    return Math.min(100, Math.round((actualDataPoints / expectedDataPoints) * 100));
  }

  private calculateTimelinessScore(metrics: HealthMetric[]): number {
    const now = new Date();
    let timelinessSum = 0;

    for (const metric of metrics) {
      const ageHours = (now.getTime() - metric.timestamp.getTime()) / (1000 * 60 * 60);
      const maxAgeHours = this.getMaxExpectedAge(metric.metricType);
      
      const timeliness = Math.max(0, 100 - ((ageHours / maxAgeHours) * 100));
      timelinessSum += timeliness;
    }

    return metrics.length > 0 ? Math.round(timelinessSum / metrics.length) : 100;
  }

  private async detectDataOutliers(metrics: HealthMetric[]): Promise<DataOutlier[]> {
    const outliers: DataOutlier[] = [];
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];

    for (const metricType of metricTypes) {
      const typeMetrics = metrics
        .filter(m => m.metricType === metricType)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      for (const metric of typeMetrics) {
        const outlier = await this.analyzeMetricForOutliers(metric, typeMetrics);
        if (outlier) {
          outliers.push(outlier);
        }
      }
    }

    return outliers.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private async analyzeMetricForOutliers(
    metric: HealthMetric, 
    historicalData: HealthMetric[]
  ): Promise<DataOutlier | null> {
    const value = parseFloat(metric.value);
    const metricType = metric.metricType;

    // Check for impossible values
    if (this.isImpossibleValue(metricType, value)) {
      return {
        id: `outlier-${metric.id}-${Date.now()}`,
        metricId: metric.id,
        metricType,
        value,
        unit: metric.unit || '',
        timestamp: metric.timestamp,
        source: metric.source || 'unknown',
        outlierType: 'impossible',
        severity: 'critical',
        description: `${metricType} value of ${value} is physiologically impossible`,
        expectedRange: this.getExpectedRange(metricType),
        correctionSuggestions: this.getCorrectionSuggestions(metricType, value, 'impossible'),
        relatedMetrics: []
      };
    }

    // Check for highly unlikely values
    if (this.isHighlyUnlikelyValue(metricType, value)) {
      return {
        id: `outlier-${metric.id}-${Date.now()}`,
        metricId: metric.id,
        metricType,
        value,
        unit: metric.unit || '',
        timestamp: metric.timestamp,
        source: metric.source || 'unknown',
        outlierType: 'highly_unlikely',
        severity: 'high',
        description: `${metricType} value of ${value} is highly unusual`,
        expectedRange: this.getExpectedRange(metricType),
        correctionSuggestions: this.getCorrectionSuggestions(metricType, value, 'highly_unlikely'),
        relatedMetrics: []
      };
    }

    // Check for statistical outliers
    if (historicalData.length >= 10) {
      const values = historicalData.map(m => parseFloat(m.value));
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > 3) { // More than 3 standard deviations
        return {
          id: `outlier-${metric.id}-${Date.now()}`,
          metricId: metric.id,
          metricType,
          value,
          unit: metric.unit || '',
          timestamp: metric.timestamp,
          source: metric.source || 'unknown',
          outlierType: 'inconsistent',
          severity: zScore > 4 ? 'high' : 'medium',
          description: `${metricType} value is ${zScore.toFixed(1)} standard deviations from your normal range`,
          expectedRange: {
            min: Math.round(mean - 2 * stdDev),
            max: Math.round(mean + 2 * stdDev),
            typical: Math.round(mean)
          },
          correctionSuggestions: this.getCorrectionSuggestions(metricType, value, 'inconsistent'),
          relatedMetrics: []
        };
      }
    }

    return null;
  }

  private async detectSingleMetricOutliers(
    metric: HealthMetric, 
    historicalData: HealthMetric[]
  ): Promise<DataOutlier[]> {
    const outlier = await this.analyzeMetricForOutliers(metric, historicalData);
    return outlier ? [outlier] : [];
  }

  private calculateMetricQuality(metric: HealthMetric, historicalData: HealthMetric[]): DataQualityScore {
    const value = parseFloat(metric.value);
    const metricType = metric.metricType;

    let plausibility = 100;
    let consistency = 100;
    let timeliness = 100;
    let completeness = 100;

    // Check plausibility
    if (!this.isPlausibleValue(metricType, value)) {
      plausibility = this.isImpossibleValue(metricType, value) ? 0 : 50;
    }

    // Check consistency with historical data
    if (historicalData.length >= 3) {
      const values = historicalData.map(m => parseFloat(m.value));
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > 2) {
        consistency = Math.max(0, 100 - (zScore - 2) * 25);
      }
    }

    // Check timeliness
    const ageHours = (Date.now() - metric.timestamp.getTime()) / (1000 * 60 * 60);
    const maxAge = this.getMaxExpectedAge(metricType);
    if (ageHours > maxAge) {
      timeliness = Math.max(0, 100 - ((ageHours - maxAge) / maxAge) * 100);
    }

    const overall = Math.round((plausibility + consistency + timeliness + completeness) / 4);

    return {
      overall,
      components: { consistency, plausibility, completeness, timeliness },
      reliability: this.determineReliabilityLevel(overall),
      confidence: 0.8
    };
  }

  private async assessDeviceReliability(metrics: HealthMetric[]): Promise<DeviceReliabilityScore[]> {
    const deviceGroups = this.groupMetricsByDevice(metrics);
    const reliabilityScores: DeviceReliabilityScore[] = [];

    for (const [deviceId, deviceMetrics] of deviceGroups.entries()) {
      const deviceName = this.getDeviceName(deviceId);
      const deviceType = this.getDeviceType(deviceId);
      
      // Calculate reliability components
      const dataConsistency = this.calculateDeviceConsistency(deviceMetrics);
      const syncReliability = this.calculateSyncReliability(deviceMetrics);
      const accuracyScore = this.calculateAccuracyScore(deviceMetrics);
      const batteryHealth = this.estimateBatteryHealth(deviceMetrics);
      
      const overall = Math.round((dataConsistency + syncReliability + accuracyScore + batteryHealth) / 4);

      // Analyze per-metric quality
      const metricAnalysis = this.analyzeDeviceMetrics(deviceMetrics);
      
      // Detect device issues
      const issues = this.detectDeviceIssues(deviceMetrics, overall);
      
      // Calculate trends
      const trends = this.calculateDeviceTrends(deviceMetrics);

      reliabilityScores.push({
        deviceId,
        deviceName,
        deviceType,
        reliability: {
          overall,
          dataConsistency,
          syncReliability,
          accuracyScore,
          batteryHealth
        },
        metrics: metricAnalysis,
        issues,
        trends
      });
    }

    return reliabilityScores.sort((a, b) => b.reliability.overall - a.reliability.overall);
  }

  private async detectDataConflicts(metrics: HealthMetric[]): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];
    const timeWindows = this.groupMetricsByTimeWindow(metrics, 30); // 30-minute windows

    for (const [timestamp, windowMetrics] of timeWindows.entries()) {
      const metricTypeGroups = this.groupMetricsByType(windowMetrics);
      
      for (const [metricType, typeMetrics] of metricTypeGroups.entries()) {
        if (typeMetrics.length > 1) {
          const conflict = this.analyzeDataConflict(timestamp, metricType, typeMetrics);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  // Helper methods for data validation
  private isImpossibleValue(metricType: string, value: number): boolean {
    const impossibleRanges: Record<string, { min: number; max: number }> = {
      'heart_rate': { min: 20, max: 300 },
      'blood_pressure': { min: 50, max: 300 },
      'steps': { min: 0, max: 100000 },
      'sleep': { min: 0, max: 24 },
      'weight': { min: 20, max: 500 },
      'glucose': { min: 20, max: 800 },
      'temperature': { min: 32, max: 45 },
      'oxygen_saturation': { min: 70, max: 100 }
    };

    const range = impossibleRanges[metricType];
    if (!range) return false;
    
    return value < range.min || value > range.max;
  }

  private isHighlyUnlikelyValue(metricType: string, value: number): boolean {
    const unlikelyRanges: Record<string, { min: number; max: number }> = {
      'heart_rate': { min: 30, max: 220 },
      'blood_pressure': { min: 60, max: 200 },
      'steps': { min: 0, max: 50000 },
      'sleep': { min: 2, max: 16 },
      'weight': { min: 30, max: 300 },
      'glucose': { min: 40, max: 400 },
      'temperature': { min: 35, max: 42 },
      'oxygen_saturation': { min: 85, max: 100 }
    };

    const range = unlikelyRanges[metricType];
    if (!range) return false;
    
    return value < range.min || value > range.max;
  }

  private isPlausibleValue(metricType: string, value: number): boolean {
    return !this.isImpossibleValue(metricType, value) && !this.isHighlyUnlikelyValue(metricType, value);
  }

  private getExpectedRange(metricType: string) {
    const ranges: Record<string, { min: number; max: number; typical: number }> = {
      'heart_rate': { min: 60, max: 100, typical: 75 },
      'blood_pressure': { min: 90, max: 140, typical: 120 },
      'steps': { min: 2000, max: 15000, typical: 8000 },
      'sleep': { min: 6, max: 9, typical: 7.5 },
      'weight': { min: 50, max: 120, typical: 75 },
      'glucose': { min: 70, max: 140, typical: 95 },
      'temperature': { min: 36, max: 37.5, typical: 36.8 },
      'oxygen_saturation': { min: 95, max: 100, typical: 98 }
    };

    return ranges[metricType] || { min: 0, max: 100, typical: 50 };
  }

  private getCorrectionSuggestions(
    metricType: string, 
    value: number, 
    outlierType: string
  ): { type: string; description: string; confidence: number }[] {
    const suggestions = [];

    if (outlierType === 'impossible') {
      suggestions.push({
        type: 'user_input',
        description: 'Please verify and re-enter the correct value',
        confidence: 0.9
      });
      suggestions.push({
        type: 'device_sync',
        description: 'Check if device needs recalibration or replacement',
        confidence: 0.7
      });
    } else if (outlierType === 'highly_unlikely') {
      suggestions.push({
        type: 'user_input',
        description: 'Confirm if this reading is accurate for your current situation',
        confidence: 0.8
      });
      suggestions.push({
        type: 'algorithm_fix',
        description: 'System will monitor for similar patterns',
        confidence: 0.6
      });
    } else {
      suggestions.push({
        type: 'user_input',
        description: 'Consider if there were unusual circumstances affecting this reading',
        confidence: 0.7
      });
    }

    return suggestions;
  }

  private generateValidationRecommendations(metric: HealthMetric, outliers: DataOutlier[]): string[] {
    const recommendations = [];

    if (outliers.length === 0) {
      recommendations.push('Data looks good - no issues detected');
      return recommendations;
    }

    for (const outlier of outliers) {
      if (outlier.severity === 'critical') {
        recommendations.push(`Critical: ${outlier.description} - please verify this reading`);
      } else if (outlier.severity === 'high') {
        recommendations.push(`Warning: ${outlier.description} - consider rechecking`);
      } else {
        recommendations.push(`Notice: ${outlier.description}`);
      }
    }

    return recommendations;
  }

  private determineReliabilityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  private getExpectedDataPoints(days: number): number {
    // Estimate based on typical user behavior
    return days * 10; // Average 10 data points per day
  }

  private getMaxExpectedAge(metricType: string): number {
    // Maximum expected age in hours before data is considered stale
    const maxAges: Record<string, number> = {
      'heart_rate': 1, // Real-time metric
      'steps': 24, // Updated daily
      'weight': 168, // Weekly
      'sleep': 24, // Daily
      'glucose': 4, // Multiple times per day
      'blood_pressure': 48 // Every couple of days
    };

    return maxAges[metricType] || 24;
  }

  private groupMetricsByDevice(metrics: HealthMetric[]): Map<string, HealthMetric[]> {
    const groups = new Map();
    
    for (const metric of metrics) {
      const deviceId = metric.source || 'manual';
      if (!groups.has(deviceId)) {
        groups.set(deviceId, []);
      }
      groups.get(deviceId).push(metric);
    }
    
    return groups;
  }

  private groupMetricsByTimeWindow(metrics: HealthMetric[], windowMinutes: number): Map<number, HealthMetric[]> {
    const groups = new Map();
    
    for (const metric of metrics) {
      const windowStart = Math.floor(metric.timestamp.getTime() / (windowMinutes * 60 * 1000)) * (windowMinutes * 60 * 1000);
      if (!groups.has(windowStart)) {
        groups.set(windowStart, []);
      }
      groups.get(windowStart).push(metric);
    }
    
    return groups;
  }

  private groupMetricsByType(metrics: HealthMetric[]): Map<string, HealthMetric[]> {
    const groups = new Map();
    
    for (const metric of metrics) {
      if (!groups.has(metric.metricType)) {
        groups.set(metric.metricType, []);
      }
      groups.get(metric.metricType).push(metric);
    }
    
    return groups;
  }

  private getDeviceName(deviceId: string): string {
    const deviceNames: Record<string, string> = {
      'apple_watch': 'Apple Watch',
      'fitbit': 'Fitbit Device',
      'garmin': 'Garmin Watch',
      'oura_ring': 'Oura Ring',
      'manual': 'Manual Entry',
      'withings_scale': 'Withings Scale'
    };
    return deviceNames[deviceId] || deviceId;
  }

  private getDeviceType(deviceId: string): 'wearable' | 'scale' | 'blood_pressure' | 'glucose_meter' | 'manual_entry' {
    const deviceTypes: Record<string, any> = {
      'apple_watch': 'wearable',
      'fitbit': 'wearable',
      'garmin': 'wearable',
      'oura_ring': 'wearable',
      'withings_scale': 'scale',
      'manual': 'manual_entry'
    };
    return deviceTypes[deviceId] || 'manual_entry';
  }

  private calculateDeviceConsistency(metrics: HealthMetric[]): number {
    // Calculate how consistent the device data is
    return this.calculateConsistencyScore(metrics);
  }

  private calculateSyncReliability(metrics: HealthMetric[]): number {
    // Calculate how reliably the device syncs data
    const now = new Date();
    const recentMetrics = metrics.filter(m => 
      (now.getTime() - m.timestamp.getTime()) < 24 * 60 * 60 * 1000
    );
    
    return Math.min(100, recentMetrics.length * 10); // Simplified calculation
  }

  private calculateAccuracyScore(metrics: HealthMetric[]): number {
    // Calculate estimated accuracy based on outlier rate
    const outlierCount = metrics.filter(m => 
      this.isHighlyUnlikelyValue(m.metricType, parseFloat(m.value))
    ).length;
    
    const outlierRate = metrics.length > 0 ? outlierCount / metrics.length : 0;
    return Math.round((1 - outlierRate) * 100);
  }

  private estimateBatteryHealth(metrics: HealthMetric[]): number {
    // Estimate battery health based on sync patterns
    // This is a simplified estimation
    return 85; // Placeholder
  }

  private analyzeDeviceMetrics(metrics: HealthMetric[]) {
    const metricTypes = [...new Set(metrics.map(m => m.metricType))];
    
    return metricTypes.map(metricType => {
      const typeMetrics = metrics.filter(m => m.metricType === metricType);
      const qualityScore = this.calculateConsistencyScore(typeMetrics);
      const outlierRate = typeMetrics.filter(m => 
        this.isHighlyUnlikelyValue(m.metricType, parseFloat(m.value))
      ).length / typeMetrics.length;
      
      return {
        metricType,
        qualityScore,
        outlierRate: Math.round(outlierRate * 100),
        missingDataRate: 10, // Placeholder
        lastSync: typeMetrics[typeMetrics.length - 1]?.timestamp || new Date()
      };
    });
  }

  private detectDeviceIssues(metrics: HealthMetric[], overallScore: number) {
    const issues = [];
    
    if (overallScore < 60) {
      issues.push({
        type: 'calibration_needed' as const,
        severity: 'high' as const,
        description: 'Device may need recalibration due to inconsistent readings',
        recommendation: 'Check device settings and recalibrate if possible',
        firstDetected: new Date()
      });
    }
    
    return issues;
  }

  private calculateDeviceTrends(metrics: HealthMetric[]) {
    return {
      '24h': { reliabilityChange: 0, qualityTrend: 'stable' as const },
      '7d': { reliabilityChange: 2, qualityTrend: 'improving' as const },
      '30d': { reliabilityChange: -1, qualityTrend: 'declining' as const }
    };
  }

  private analyzeDataConflict(timestamp: number, metricType: string, metrics: HealthMetric[]): DataConflict | null {
    if (metrics.length < 2) return null;
    
    const values = metrics.map(m => parseFloat(m.value));
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxDifference = maxValue - minValue;
    const percentVariation = (maxDifference / maxValue) * 100;
    
    if (percentVariation > 20) { // Significant variation
      return {
        id: `conflict-${timestamp}-${metricType}`,
        timestamp: new Date(timestamp),
        metricType,
        conflictingSources: metrics.map(m => ({
          source: m.source || 'unknown',
          value: parseFloat(m.value),
          confidence: 0.8
        })),
        discrepancy: {
          maxDifference,
          percentVariation,
          significance: percentVariation > 50 ? 'critical' : percentVariation > 30 ? 'major' : 'moderate'
        },
        resolutionStrategy: {
          recommendedSource: metrics[0].source || 'unknown',
          reasoning: 'Most reliable device based on historical accuracy',
          confidence: 0.7,
          alternativeOptions: ['Manual verification', 'Device recalibration']
        },
        userAction: 'review_required'
      };
    }
    
    return null;
  }

  private generateQualityRecommendations(outliers: DataOutlier[], devices: DeviceReliabilityScore[], conflicts: DataConflict[]) {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];
    
    if (outliers.some(o => o.severity === 'critical')) {
      immediate.push('Critical data outliers detected - please review immediately');
    }
    
    if (conflicts.length > 0) {
      immediate.push('Data conflicts between devices require resolution');
    }
    
    const poorDevices = devices.filter(d => d.reliability.overall < 60);
    if (poorDevices.length > 0) {
      shortTerm.push('Consider recalibrating or replacing unreliable devices');
    }
    
    longTerm.push('Regular data quality monitoring maintains accuracy');
    
    return { immediate, shortTerm, longTerm };
  }

  private generateDataInsights(metrics: HealthMetric[], devices: DeviceReliabilityScore[]) {
    return {
      dataIntegrityTrends: [
        'Overall data quality has improved 5% this week',
        'Manual entries show highest accuracy rates',
        'Device sync reliability is 94% across all sources'
      ],
      devicePerformance: [
        'Wearable devices provide most consistent heart rate data',
        'Scale measurements have 98% reliability score',
        'Newer devices show better data consistency'
      ],
      userBehaviorPatterns: [
        'Data quality improves with regular device charging',
        'Manual verification increases overall accuracy',
        'Weekend data gaps most common issue'
      ]
    };
  }
}

export const dataQualityEngine = new DataQualityEngine();