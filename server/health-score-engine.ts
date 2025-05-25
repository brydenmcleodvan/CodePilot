/**
 * Health Score Engine
 * Calculates composite health scores (0-100) using weighted metrics
 * Normalizes data by healthy ranges and provides detailed breakdowns
 */

import { storage } from './storage';
import { HealthMetric, User } from '@shared/schema';

export interface MetricWeight {
  metricType: string;
  weight: number; // 0-1, sum should equal 1
  healthyRange: {
    min: number;
    max: number;
    optimal?: number;
  };
  direction: 'higher_better' | 'lower_better' | 'range_optimal';
}

export interface HealthScoreBreakdown {
  metricType: string;
  currentValue: number;
  normalizedScore: number; // 0-100
  weight: number;
  contribution: number; // weighted score
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  daysOfData: number;
}

export interface HealthScoreReport {
  userId: number;
  overallScore: number;
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  generatedAt: Date;
  breakdown: HealthScoreBreakdown[];
  trends: {
    weeklyChange: number;
    monthlyChange: number;
    direction: 'improving' | 'stable' | 'declining';
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    expectedImpact: string;
  }[];
  dataQuality: {
    completeness: number;
    consistency: number;
    reliability: string;
  };
}

export class HealthScoreEngine {
  private readonly metricWeights: MetricWeight[] = [
    {
      metricType: 'sleep',
      weight: 0.25,
      healthyRange: { min: 7, max: 9, optimal: 8 },
      direction: 'range_optimal'
    },
    {
      metricType: 'heart_rate_variability',
      weight: 0.20,
      healthyRange: { min: 30, max: 100, optimal: 50 },
      direction: 'higher_better'
    },
    {
      metricType: 'glucose',
      weight: 0.15,
      healthyRange: { min: 70, max: 100, optimal: 85 },
      direction: 'range_optimal'
    },
    {
      metricType: 'steps',
      weight: 0.15,
      healthyRange: { min: 8000, max: 15000, optimal: 10000 },
      direction: 'higher_better'
    },
    {
      metricType: 'heart_rate',
      weight: 0.10,
      healthyRange: { min: 60, max: 90, optimal: 70 },
      direction: 'lower_better'
    },
    {
      metricType: 'blood_pressure',
      weight: 0.10,
      healthyRange: { min: 90, max: 120, optimal: 110 },
      direction: 'lower_better'
    },
    {
      metricType: 'mood',
      weight: 0.05,
      healthyRange: { min: 7, max: 10, optimal: 9 },
      direction: 'higher_better'
    }
  ];

  /**
   * Calculate comprehensive health score for user
   */
  async calculateHealthScore(userId: number, timeframe: number = 30): Promise<HealthScoreReport> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const recentMetrics = healthMetrics.filter(m => 
      m.timestamp >= new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
    );

    // Calculate breakdown for each metric
    const breakdown: HealthScoreBreakdown[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const metricWeight of this.metricWeights) {
      const metricData = recentMetrics.filter(m => m.metricType === metricWeight.metricType);
      
      if (metricData.length === 0) continue;

      const metricBreakdown = this.calculateMetricScore(metricWeight, metricData);
      breakdown.push(metricBreakdown);
      
      totalWeightedScore += metricBreakdown.contribution;
      totalWeight += metricWeight.weight;
    }

    // Normalize score if we don't have all metrics
    const overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
    
    // Calculate trends
    const trends = await this.calculateTrends(userId, overallScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(breakdown);
    
    // Assess data quality
    const dataQuality = this.assessDataQuality(recentMetrics, timeframe);

    return {
      userId,
      overallScore,
      category: this.getScoreCategory(overallScore),
      generatedAt: new Date(),
      breakdown,
      trends,
      recommendations,
      dataQuality
    };
  }

  /**
   * Calculate score for individual metric
   */
  private calculateMetricScore(metricWeight: MetricWeight, metricData: HealthMetric[]): HealthScoreBreakdown {
    // Get recent average
    const values = metricData.map(m => parseFloat(m.value));
    const currentValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate normalized score (0-100)
    const normalizedScore = this.normalizeMetricValue(currentValue, metricWeight);
    
    // Calculate weighted contribution
    const contribution = normalizedScore * metricWeight.weight;
    
    // Determine status
    const status = this.getMetricStatus(normalizedScore);
    
    // Calculate trend
    const trend = this.calculateMetricTrend(values);

    return {
      metricType: metricWeight.metricType,
      currentValue: Math.round(currentValue * 100) / 100,
      normalizedScore: Math.round(normalizedScore),
      weight: metricWeight.weight,
      contribution: Math.round(contribution * 100) / 100,
      status,
      trend,
      daysOfData: metricData.length
    };
  }

  /**
   * Normalize metric value to 0-100 scale
   */
  private normalizeMetricValue(value: number, metricWeight: MetricWeight): number {
    const { healthyRange, direction } = metricWeight;
    
    switch (direction) {
      case 'higher_better':
        if (value >= healthyRange.max) return 100;
        if (value <= healthyRange.min) return 0;
        return ((value - healthyRange.min) / (healthyRange.max - healthyRange.min)) * 100;
        
      case 'lower_better':
        if (value <= healthyRange.min) return 100;
        if (value >= healthyRange.max) return 0;
        return ((healthyRange.max - value) / (healthyRange.max - healthyRange.min)) * 100;
        
      case 'range_optimal':
        const optimal = healthyRange.optimal || (healthyRange.min + healthyRange.max) / 2;
        const range = healthyRange.max - healthyRange.min;
        const distance = Math.abs(value - optimal);
        const maxDistance = Math.max(optimal - healthyRange.min, healthyRange.max - optimal);
        
        if (distance === 0) return 100;
        if (value < healthyRange.min || value > healthyRange.max) {
          const outsideDistance = value < healthyRange.min ? 
            healthyRange.min - value : 
            value - healthyRange.max;
          return Math.max(0, 50 - (outsideDistance / range) * 50);
        }
        
        return Math.max(0, 100 - (distance / maxDistance) * 50);
        
      default:
        return 50;
    }
  }

  /**
   * Get status category from normalized score
   */
  private getMetricStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Calculate overall score category
   */
  private getScoreCategory(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Calculate metric trend from recent values
   */
  private calculateMetricTrend(values: number[]): 'improving' | 'stable' | 'declining' {
    if (values.length < 5) return 'stable';
    
    const recent = values.slice(-7);
    const previous = values.slice(-14, -7);
    
    if (previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (Math.abs(changePercent) < 5) return 'stable';
    return changePercent > 0 ? 'improving' : 'declining';
  }

  /**
   * Calculate score trends over time
   */
  private async calculateTrends(userId: number, currentScore: number) {
    // Get historical scores (simplified - in production would store calculated scores)
    const weekAgoScore = await this.calculateHistoricalScore(userId, 7);
    const monthAgoScore = await this.calculateHistoricalScore(userId, 30);
    
    const weeklyChange = currentScore - weekAgoScore;
    const monthlyChange = currentScore - monthAgoScore;
    
    let direction: 'improving' | 'stable' | 'declining' = 'stable';
    if (Math.abs(weeklyChange) > 3) {
      direction = weeklyChange > 0 ? 'improving' : 'declining';
    }

    return {
      weeklyChange: Math.round(weeklyChange * 10) / 10,
      monthlyChange: Math.round(monthlyChange * 10) / 10,
      direction
    };
  }

  /**
   * Calculate historical score (simplified version)
   */
  private async calculateHistoricalScore(userId: number, daysAgo: number): Promise<number> {
    const endDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const healthMetrics = await storage.getHealthMetrics(userId);
    const historicalMetrics = healthMetrics.filter(m => 
      m.timestamp >= startDate && m.timestamp <= endDate
    );

    if (historicalMetrics.length === 0) return 70; // Default baseline
    
    // Quick calculation for historical score
    let totalScore = 0;
    let count = 0;
    
    for (const metricWeight of this.metricWeights) {
      const metricData = historicalMetrics.filter(m => m.metricType === metricWeight.metricType);
      if (metricData.length === 0) continue;
      
      const values = metricData.map(m => parseFloat(m.value));
      const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      const normalizedScore = this.normalizeMetricValue(avgValue, metricWeight);
      
      totalScore += normalizedScore * metricWeight.weight;
      count += metricWeight.weight;
    }
    
    return count > 0 ? totalScore / count : 70;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(breakdown: HealthScoreBreakdown[]) {
    const recommendations = [];
    
    // Sort by lowest scores first
    const sortedMetrics = [...breakdown].sort((a, b) => a.normalizedScore - b.normalizedScore);
    
    for (const metric of sortedMetrics.slice(0, 3)) { // Top 3 improvement areas
      if (metric.normalizedScore < 70) {
        const rec = this.getMetricRecommendation(metric);
        if (rec) recommendations.push(rec);
      }
    }
    
    // Add general recommendations if overall score is good
    const avgScore = breakdown.reduce((sum, m) => sum + m.normalizedScore, 0) / breakdown.length;
    if (avgScore >= 75 && recommendations.length === 0) {
      recommendations.push({
        priority: 'low' as const,
        category: 'maintenance',
        message: 'Great job! Continue your current healthy habits to maintain your excellent health score.',
        expectedImpact: 'Sustained wellness and continued high performance'
      });
    }

    return recommendations;
  }

  /**
   * Get specific recommendation for metric
   */
  private getMetricRecommendation(metric: HealthScoreBreakdown) {
    const recommendationMap: Record<string, any> = {
      sleep: {
        priority: 'high',
        category: 'sleep',
        message: `Your sleep score is ${metric.normalizedScore}/100. Aim for 7-9 hours of quality sleep nightly.`,
        expectedImpact: 'Improved cognitive function, mood, and overall health score'
      },
      heart_rate_variability: {
        priority: 'high',
        category: 'recovery',
        message: `Your HRV indicates suboptimal recovery. Consider stress management and adequate rest.`,
        expectedImpact: 'Better stress resilience and cardiovascular health'
      },
      glucose: {
        priority: 'high',
        category: 'metabolic',
        message: `Your glucose levels need attention. Focus on balanced nutrition and regular exercise.`,
        expectedImpact: 'Improved metabolic health and energy stability'
      },
      steps: {
        priority: 'medium',
        category: 'activity',
        message: `Increase daily activity to reach 8,000+ steps. Current: ${metric.currentValue} steps.`,
        expectedImpact: 'Enhanced cardiovascular fitness and mental wellbeing'
      },
      heart_rate: {
        priority: 'medium',
        category: 'cardiovascular',
        message: `Your resting heart rate could be improved with regular cardio exercise.`,
        expectedImpact: 'Better cardiovascular efficiency and endurance'
      },
      blood_pressure: {
        priority: 'high',
        category: 'cardiovascular',
        message: `Monitor blood pressure closely and consider lifestyle modifications.`,
        expectedImpact: 'Reduced cardiovascular disease risk'
      },
      mood: {
        priority: 'medium',
        category: 'mental_health',
        message: `Consider stress management techniques and social connections for mood improvement.`,
        expectedImpact: 'Enhanced mental wellbeing and life satisfaction'
      }
    };

    return recommendationMap[metric.metricType] || null;
  }

  /**
   * Assess data quality for scoring reliability
   */
  private assessDataQuality(metrics: HealthMetric[], timeframeDays: number) {
    const expectedDataPoints = timeframeDays * this.metricWeights.length * 0.8; // Allow for some missing data
    const actualDataPoints = metrics.length;
    
    const completeness = Math.min(100, (actualDataPoints / expectedDataPoints) * 100);
    
    // Check consistency (simplified)
    const metricTypes = new Set(metrics.map(m => m.metricType));
    const consistency = (metricTypes.size / this.metricWeights.length) * 100;
    
    const avgQuality = (completeness + consistency) / 2;
    let reliability = 'excellent';
    if (avgQuality < 60) reliability = 'poor';
    else if (avgQuality < 80) reliability = 'fair';
    else if (avgQuality < 90) reliability = 'good';

    return {
      completeness: Math.round(completeness),
      consistency: Math.round(consistency),
      reliability
    };
  }

  /**
   * Get quick health score without full report
   */
  async getQuickScore(userId: number): Promise<number> {
    const report = await this.calculateHealthScore(userId, 7); // Last 7 days
    return report.overallScore;
  }

  /**
   * Compare user score with demographic benchmarks
   */
  async compareWithPeers(userId: number, userAge: number, userGender: string): Promise<{
    userScore: number;
    peerAverage: number;
    percentile: number;
    ranking: string;
  }> {
    const userScore = await this.getQuickScore(userId);
    
    // Demographic benchmarks (simplified - in production would query actual peer data)
    const demographicAverages: Record<string, number> = {
      'male_20-30': 75,
      'male_30-40': 72,
      'male_40-50': 68,
      'female_20-30': 77,
      'female_30-40': 74,
      'female_40-50': 70
    };
    
    const ageGroup = userAge < 30 ? '20-30' : userAge < 40 ? '30-40' : '40-50';
    const peerKey = `${userGender}_${ageGroup}`;
    const peerAverage = demographicAverages[peerKey] || 70;
    
    // Calculate percentile (simplified)
    const difference = userScore - peerAverage;
    const percentile = Math.max(5, Math.min(95, 50 + (difference * 2)));
    
    let ranking = 'average';
    if (percentile >= 90) ranking = 'exceptional';
    else if (percentile >= 75) ranking = 'above average';
    else if (percentile >= 25) ranking = 'average';
    else ranking = 'below average';

    return {
      userScore,
      peerAverage,
      percentile: Math.round(percentile),
      ranking
    };
  }
}

export const healthScoreEngine = new HealthScoreEngine();