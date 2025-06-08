/**
 * Healthmap Metrics Engine
 * Central analytics hub for health data insights, trends, and personalized recommendations
 */

export interface HealthMetric {
  type: 'heart_rate' | 'hrv' | 'sleep' | 'steps' | 'glucose' | 'blood_pressure' | 'weight' | 'temperature';
  value: number;
  timestamp: Date;
  source: string;
  quality?: 'high' | 'medium' | 'low';
}

export interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  timeframe: string;
  status: 'improving' | 'declining' | 'stable' | 'concerning';
  description: string;
}

export interface AnomalyDetection {
  metric: string;
  type: 'spike' | 'drop' | 'pattern' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  suggestions: string[];
}

export interface PersonalizedInsight {
  category: 'sleep' | 'activity' | 'heart_health' | 'metabolic' | 'stress' | 'recovery';
  priority: 'low' | 'medium' | 'high';
  insight: string;
  actionable_advice: string[];
  confidence: number; // 0-1 scale
}

export interface MetricsAnalysis {
  trends: TrendAnalysis[];
  anomalies: AnomalyDetection[];
  insights: PersonalizedInsight[];
  healthScore: {
    overall: number;
    categories: {
      cardiovascular: number;
      sleep: number;
      activity: number;
      metabolic: number;
    };
  };
}

export class MetricsEngine {
  private readonly TREND_THRESHOLDS = {
    minimal: 5,    // 0-5% change
    moderate: 15,  // 5-15% change
    significant: 25 // 15%+ change
  };

  private readonly NORMAL_RANGES = {
    heart_rate: { min: 60, max: 100, optimal: { min: 65, max: 80 } },
    hrv: { min: 20, max: 100, optimal: { min: 40, max: 60 } },
    sleep: { min: 6, max: 10, optimal: { min: 7, max: 9 } },
    steps: { min: 5000, max: 20000, optimal: { min: 8000, max: 12000 } },
    glucose: { min: 70, max: 140, optimal: { min: 80, max: 120 } },
    systolic_bp: { min: 90, max: 140, optimal: { min: 110, max: 130 } },
    diastolic_bp: { min: 60, max: 90, optimal: { min: 70, max: 85 } },
  };

  /**
   * Main analysis function - processes user's health metrics and returns comprehensive insights
   */
  public analyzeUserMetrics(metrics: HealthMetric[], userId: number, timeframe: '7d' | '30d' | '90d' = '30d'): MetricsAnalysis {
    const groupedMetrics = this.groupMetricsByType(metrics);
    
    const trends = this.calculateTrends(groupedMetrics, timeframe);
    const anomalies = this.detectAnomalies(groupedMetrics);
    const insights = this.generatePersonalizedInsights(groupedMetrics, trends, anomalies);
    const healthScore = this.calculateHealthScore(groupedMetrics);

    return {
      trends,
      anomalies,
      insights,
      healthScore
    };
  }

  /**
   * Calculate trends for each metric type
   */
  private calculateTrends(groupedMetrics: Map<string, HealthMetric[]>, timeframe: string): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];

    groupedMetrics.forEach((metrics, metricType) => {
      if (metrics.length < 2) return;

      const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const recent = sortedMetrics.slice(-7); // Last 7 data points
      const previous = sortedMetrics.slice(-14, -7); // Previous 7 data points

      if (recent.length === 0 || previous.length === 0) return;

      const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      const previousAvg = previous.reduce((sum, m) => sum + m.value, 0) / previous.length;
      
      const percentageChange = ((recentAvg - previousAvg) / previousAvg) * 100;
      const trend = this.determineTrend(percentageChange, metricType);
      
      trends.push({
        metric: metricType,
        trend: trend.direction,
        percentage: Math.abs(percentageChange),
        timeframe: timeframe,
        status: trend.status,
        description: this.generateTrendDescription(metricType, percentageChange, trend.status)
      });
    });

    return trends;
  }

  /**
   * Detect anomalies in health data patterns
   */
  private detectAnomalies(groupedMetrics: Map<string, HealthMetric[]>): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    groupedMetrics.forEach((metrics, metricType) => {
      const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Check for consecutive concerning values
      const consecutiveAnomalies = this.detectConsecutiveAnomalies(sortedMetrics, metricType);
      anomalies.push(...consecutiveAnomalies);

      // Check for sudden spikes or drops
      const spikeAnomalies = this.detectSpikes(sortedMetrics, metricType);
      anomalies.push(...spikeAnomalies);

      // Check for pattern disruptions
      const patternAnomalies = this.detectPatternDisruptions(sortedMetrics, metricType);
      anomalies.push(...patternAnomalies);
    });

    return anomalies;
  }

  /**
   * Generate personalized health insights based on user's data patterns
   */
  private generatePersonalizedInsights(
    groupedMetrics: Map<string, HealthMetric[]>, 
    trends: TrendAnalysis[], 
    anomalies: AnomalyDetection[]
  ): PersonalizedInsight[] {
    const insights: PersonalizedInsight[] = [];

    // Sleep insights
    const sleepMetrics = groupedMetrics.get('sleep');
    if (sleepMetrics && sleepMetrics.length > 0) {
      const avgSleep = sleepMetrics.reduce((sum, m) => sum + m.value, 0) / sleepMetrics.length;
      if (avgSleep < 7) {
        insights.push({
          category: 'sleep',
          priority: 'high',
          insight: `Your average sleep duration is ${avgSleep.toFixed(1)} hours, which is below the recommended 7-9 hours.`,
          actionable_advice: [
            'Set a consistent bedtime routine',
            'Avoid screens 1 hour before bed',
            'Keep your bedroom cool and dark',
            'Consider a sleep study if problems persist'
          ],
          confidence: 0.85
        });
      }
    }

    // Heart rate variability insights
    const hrvTrend = trends.find(t => t.metric === 'hrv');
    if (hrvTrend && hrvTrend.status === 'declining') {
      insights.push({
        category: 'stress',
        priority: 'medium',
        insight: `Your HRV has decreased by ${hrvTrend.percentage.toFixed(1)}%, which may indicate increased stress or reduced recovery.`,
        actionable_advice: [
          'Practice deep breathing exercises',
          'Consider meditation or mindfulness',
          'Ensure adequate sleep and recovery',
          'Review your training intensity'
        ],
        confidence: 0.78
      });
    }

    // Activity insights
    const stepsMetrics = groupedMetrics.get('steps');
    if (stepsMetrics && stepsMetrics.length > 0) {
      const avgSteps = stepsMetrics.reduce((sum, m) => sum + m.value, 0) / stepsMetrics.length;
      if (avgSteps < 8000) {
        insights.push({
          category: 'activity',
          priority: 'medium',
          insight: `Your daily step average is ${Math.round(avgSteps).toLocaleString()}, which is below the recommended 8,000-10,000 steps.`,
          actionable_advice: [
            'Take walking breaks every hour',
            'Use stairs instead of elevators',
            'Park farther away from destinations',
            'Try walking meetings or calls'
          ],
          confidence: 0.82
        });
      }
    }

    // Glucose insights for metabolic health
    const glucoseAnomalies = anomalies.filter(a => a.metric === 'glucose');
    if (glucoseAnomalies.length > 0) {
      insights.push({
        category: 'metabolic',
        priority: 'high',
        insight: 'Multiple glucose spikes detected, which may affect your metabolic health.',
        actionable_advice: [
          'Monitor meal timing and composition',
          'Consider eating smaller, more frequent meals',
          'Focus on low-glycemic foods',
          'Consult with a healthcare provider'
        ],
        confidence: 0.88
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate overall health score and category scores
   */
  private calculateHealthScore(groupedMetrics: Map<string, HealthMetric[]>): MetricsAnalysis['healthScore'] {
    const scores = {
      cardiovascular: this.calculateCategoryScore(['heart_rate', 'hrv', 'blood_pressure'], groupedMetrics),
      sleep: this.calculateCategoryScore(['sleep'], groupedMetrics),
      activity: this.calculateCategoryScore(['steps'], groupedMetrics),
      metabolic: this.calculateCategoryScore(['glucose', 'weight'], groupedMetrics)
    };

    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    return {
      overall: Math.round(overall),
      categories: {
        cardiovascular: Math.round(scores.cardiovascular),
        sleep: Math.round(scores.sleep),
        activity: Math.round(scores.activity),
        metabolic: Math.round(scores.metabolic)
      }
    };
  }

  /**
   * Helper methods for detailed analysis
   */
  private groupMetricsByType(metrics: HealthMetric[]): Map<string, HealthMetric[]> {
    const grouped = new Map<string, HealthMetric[]>();
    
    metrics.forEach(metric => {
      if (!grouped.has(metric.type)) {
        grouped.set(metric.type, []);
      }
      grouped.get(metric.type)!.push(metric);
    });
    
    return grouped;
  }

  private determineTrend(percentageChange: number, metricType: string): { direction: 'up' | 'down' | 'stable', status: TrendAnalysis['status'] } {
    const absChange = Math.abs(percentageChange);
    
    if (absChange < this.TREND_THRESHOLDS.minimal) {
      return { direction: 'stable', status: 'stable' };
    }

    const direction = percentageChange > 0 ? 'up' : 'down';
    
    // Determine if trend is positive or concerning based on metric type
    const isPositiveTrend = this.isPositiveTrend(direction, metricType);
    
    if (absChange > this.TREND_THRESHOLDS.significant) {
      return { direction, status: isPositiveTrend ? 'improving' : 'concerning' };
    } else if (absChange > this.TREND_THRESHOLDS.moderate) {
      return { direction, status: isPositiveTrend ? 'improving' : 'declining' };
    } else {
      return { direction, status: 'stable' };
    }
  }

  private isPositiveTrend(direction: 'up' | 'down', metricType: string): boolean {
    // Define which direction is positive for each metric
    const positiveUp = ['hrv', 'sleep', 'steps'];
    const positiveDown = ['heart_rate', 'glucose'];
    
    if (positiveUp.includes(metricType)) {
      return direction === 'up';
    } else if (positiveDown.includes(metricType)) {
      return direction === 'down';
    }
    
    return true; // Default to positive
  }

  private generateTrendDescription(metricType: string, percentageChange: number, status: TrendAnalysis['status']): string {
    const direction = percentageChange > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(percentageChange);
    
    switch (status) {
      case 'improving':
        return `Your ${metricType.replace('_', ' ')} has ${direction} by ${magnitude.toFixed(1)}%, showing positive improvement.`;
      case 'concerning':
        return `Your ${metricType.replace('_', ' ')} has ${direction} by ${magnitude.toFixed(1)}%, which may require attention.`;
      case 'declining':
        return `Your ${metricType.replace('_', ' ')} has ${direction} by ${magnitude.toFixed(1)}%, showing a declining trend.`;
      default:
        return `Your ${metricType.replace('_', ' ')} has remained stable with minimal change.`;
    }
  }

  private detectConsecutiveAnomalies(metrics: HealthMetric[], metricType: string): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const range = this.NORMAL_RANGES[metricType as keyof typeof this.NORMAL_RANGES];
    
    if (!range) return anomalies;

    let consecutiveCount = 0;
    const recentMetrics = metrics.slice(-7); // Last 7 readings

    recentMetrics.forEach(metric => {
      if (metric.value < range.min || metric.value > range.max) {
        consecutiveCount++;
      } else {
        consecutiveCount = 0;
      }
    });

    if (consecutiveCount >= 3) {
      anomalies.push({
        metric: metricType,
        type: 'pattern',
        severity: consecutiveCount >= 5 ? 'high' : 'medium',
        description: `${consecutiveCount} consecutive ${metricType.replace('_', ' ')} readings outside normal range`,
        detectedAt: new Date(),
        suggestions: this.getAnomalySuggestions(metricType, 'pattern')
      });
    }

    return anomalies;
  }

  private detectSpikes(metrics: HealthMetric[], metricType: string): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    if (metrics.length < 3) return anomalies;

    const sortedMetrics = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const recent = sortedMetrics.slice(-10); // Last 10 readings
    
    const avg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    const stdDev = Math.sqrt(recent.reduce((sum, m) => Math.pow(m.value - avg, 2), 0) / recent.length);
    
    recent.forEach(metric => {
      const deviation = Math.abs(metric.value - avg) / stdDev;
      
      if (deviation > 2.5) { // More than 2.5 standard deviations
        anomalies.push({
          metric: metricType,
          type: metric.value > avg ? 'spike' : 'drop',
          severity: deviation > 3 ? 'high' : 'medium',
          description: `Unusual ${metric.value > avg ? 'spike' : 'drop'} in ${metricType.replace('_', ' ')}: ${metric.value}`,
          detectedAt: metric.timestamp,
          suggestions: this.getAnomalySuggestions(metricType, metric.value > avg ? 'spike' : 'drop')
        });
      }
    });

    return anomalies;
  }

  private detectPatternDisruptions(metrics: HealthMetric[], metricType: string): AnomalyDetection[] {
    // Implementation for detecting disruptions in normal patterns
    // This could include circadian rhythm disruptions, irregular timing, etc.
    return [];
  }

  private calculateCategoryScore(metricTypes: string[], groupedMetrics: Map<string, HealthMetric[]>): number {
    let totalScore = 0;
    let validMetrics = 0;

    metricTypes.forEach(metricType => {
      const metrics = groupedMetrics.get(metricType);
      if (metrics && metrics.length > 0) {
        const avgValue = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
        const range = this.NORMAL_RANGES[metricType as keyof typeof this.NORMAL_RANGES];
        
        if (range) {
          let score = 50; // Base score
          
          if (avgValue >= range.optimal.min && avgValue <= range.optimal.max) {
            score = 100; // Optimal range
          } else if (avgValue >= range.min && avgValue <= range.max) {
            score = 75; // Normal but not optimal
          } else {
            score = 25; // Outside normal range
          }
          
          totalScore += score;
          validMetrics++;
        }
      }
    });

    return validMetrics > 0 ? totalScore / validMetrics : 50;
  }

  private getAnomalySuggestions(metricType: string, anomalyType: string): string[] {
    const suggestions: { [key: string]: { [key: string]: string[] } } = {
      heart_rate: {
        spike: ['Check for caffeine intake', 'Consider stress levels', 'Ensure adequate hydration'],
        pattern: ['Monitor during different activities', 'Consider cardiac evaluation']
      },
      glucose: {
        spike: ['Review recent meals', 'Check medication timing', 'Monitor stress levels'],
        pattern: ['Consult healthcare provider', 'Review dietary patterns']
      },
      sleep: {
        pattern: ['Maintain consistent sleep schedule', 'Optimize sleep environment', 'Limit screen time before bed']
      }
    };

    return suggestions[metricType]?.[anomalyType] || ['Monitor trends and consult healthcare provider if concerned'];
  }
}

// Export singleton instance
export const metricsEngine = new MetricsEngine();