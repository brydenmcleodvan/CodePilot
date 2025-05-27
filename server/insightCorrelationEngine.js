/**
 * Insight Correlation Engine
 * Discovers meaningful relationships between health metrics and behaviors
 */

class InsightCorrelationEngine {
  constructor() {
    this.correlationCache = new Map();
    this.userInsights = new Map();
    this.minDataPoints = 7; // Minimum data points for reliable correlation
    this.significanceThreshold = 0.3; // Minimum correlation coefficient
    
    // Predefined correlation patterns to look for
    this.correlationPatterns = [
      {
        primary: 'sleep_duration',
        secondary: 'glucose_level',
        description: 'sleep and blood glucose',
        insight: 'When you sleep less than {threshold} hours, your glucose tends to {trend}.'
      },
      {
        primary: 'exercise_duration',
        secondary: 'heart_rate_variability',
        description: 'exercise and HRV',
        insight: 'Your HRV {trend} on days when you exercise for {threshold}+ minutes.'
      },
      {
        primary: 'stress_level',
        secondary: 'blood_pressure',
        description: 'stress and blood pressure',
        insight: 'Higher stress levels correlate with {trend} blood pressure readings.'
      },
      {
        primary: 'caffeine_intake',
        secondary: 'sleep_quality',
        description: 'caffeine and sleep quality',
        insight: 'Consuming caffeine after {threshold}PM affects your sleep quality.'
      },
      {
        primary: 'meal_timing',
        secondary: 'glucose_level',
        description: 'meal timing and glucose',
        insight: 'Late meals (after {threshold}PM) correlate with {trend} glucose levels.'
      },
      {
        primary: 'weather_pressure',
        secondary: 'pain_level',
        description: 'weather and pain',
        insight: 'Your pain levels tend to {trend} when barometric pressure drops.'
      }
    ];
  }

  /**
   * Analyze user's health data for correlations
   */
  async analyzeUserCorrelations(userId, timeframeDays = 30) {
    try {
      // Get user's health data for the specified timeframe
      const healthData = await this.getUserHealthData(userId, timeframeDays);
      
      if (!healthData || healthData.length < this.minDataPoints) {
        return {
          success: false,
          message: 'Insufficient data for correlation analysis',
          requiredDataPoints: this.minDataPoints,
          actualDataPoints: healthData?.length || 0
        };
      }

      // Run correlation analysis
      const correlations = await this.findCorrelations(healthData);
      
      // Generate insights from correlations
      const insights = this.generateInsights(correlations, userId);
      
      // Cache results
      this.cacheUserInsights(userId, insights);
      
      return {
        success: true,
        dataPoints: healthData.length,
        correlations: correlations.length,
        insights,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Correlation analysis error:', error);
      throw new Error(`Failed to analyze correlations: ${error.message}`);
    }
  }

  /**
   * Find statistical correlations in health data
   */
  async findCorrelations(healthData) {
    const correlations = [];
    
    // Extract all numeric metrics from the data
    const metrics = this.extractMetrics(healthData);
    const metricNames = Object.keys(metrics);
    
    // Calculate correlations between all metric pairs
    for (let i = 0; i < metricNames.length; i++) {
      for (let j = i + 1; j < metricNames.length; j++) {
        const metric1 = metricNames[i];
        const metric2 = metricNames[j];
        
        const correlation = this.calculatePearsonCorrelation(
          metrics[metric1],
          metrics[metric2]
        );
        
        if (Math.abs(correlation.coefficient) >= this.significanceThreshold) {
          correlations.push({
            primary: metric1,
            secondary: metric2,
            coefficient: correlation.coefficient,
            strength: this.getCorrelationStrength(correlation.coefficient),
            direction: correlation.coefficient > 0 ? 'positive' : 'negative',
            significance: this.calculateSignificance(correlation, metrics[metric1].length),
            dataPoints: metrics[metric1].length
          });
        }
      }
    }
    
    // Sort by absolute correlation strength
    return correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  calculatePearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length < this.minDataPoints) {
      return { coefficient: 0, valid: false };
    }

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) {
      return { coefficient: 0, valid: false };
    }

    return {
      coefficient: numerator / denominator,
      valid: true
    };
  }

  /**
   * Extract numeric metrics from health data
   */
  extractMetrics(healthData) {
    const metrics = {};
    
    healthData.forEach(dataPoint => {
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (typeof value === 'number' && !isNaN(value)) {
          if (!metrics[key]) {
            metrics[key] = [];
          }
          metrics[key].push(value);
        }
      });
    });
    
    // Filter out metrics with insufficient data
    Object.keys(metrics).forEach(metric => {
      if (metrics[metric].length < this.minDataPoints) {
        delete metrics[metric];
      }
    });
    
    return metrics;
  }

  /**
   * Generate human-readable insights from correlations
   */
  generateInsights(correlations, userId) {
    const insights = [];
    
    correlations.forEach(correlation => {
      const pattern = this.findMatchingPattern(correlation.primary, correlation.secondary);
      
      if (pattern) {
        const insight = this.createInsightFromPattern(correlation, pattern);
        insights.push(insight);
      } else {
        // Generate generic insight for unexpected correlations
        const insight = this.createGenericInsight(correlation);
        insights.push(insight);
      }
    });
    
    // Add trend-based insights
    const trendInsights = this.generateTrendInsights(correlations);
    insights.push(...trendInsights);
    
    return insights.slice(0, 10); // Limit to top 10 insights
  }

  /**
   * Find matching predefined pattern
   */
  findMatchingPattern(primary, secondary) {
    return this.correlationPatterns.find(pattern => 
      (pattern.primary === primary && pattern.secondary === secondary) ||
      (pattern.primary === secondary && pattern.secondary === primary)
    );
  }

  /**
   * Create insight from predefined pattern
   */
  createInsightFromPattern(correlation, pattern) {
    const trend = correlation.direction === 'positive' ? 'increase' : 'decrease';
    const strength = this.getCorrelationStrength(correlation.coefficient);
    
    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'correlation',
      title: `${pattern.description.charAt(0).toUpperCase() + pattern.description.slice(1)} Connection`,
      message: pattern.insight
        .replace('{trend}', trend)
        .replace('{threshold}', this.calculateThreshold(correlation)),
      strength,
      coefficient: correlation.coefficient,
      significance: correlation.significance,
      actionable: true,
      metrics: [correlation.primary, correlation.secondary],
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Create generic insight for unexpected correlations
   */
  createGenericInsight(correlation) {
    const metric1 = this.formatMetricName(correlation.primary);
    const metric2 = this.formatMetricName(correlation.secondary);
    const direction = correlation.direction === 'positive' ? 'higher' : 'lower';
    const strength = this.getCorrelationStrength(correlation.coefficient);
    
    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'correlation',
      title: `${metric1} and ${metric2} Connection`,
      message: `There's a ${strength} correlation between your ${metric1.toLowerCase()} and ${metric2.toLowerCase()}. When one increases, the other tends to be ${direction}.`,
      strength,
      coefficient: correlation.coefficient,
      significance: correlation.significance,
      actionable: false,
      metrics: [correlation.primary, correlation.secondary],
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate trend-based insights
   */
  generateTrendInsights(correlations) {
    const insights = [];
    
    // Look for strong negative correlations that suggest problems
    const strongNegative = correlations.filter(c => 
      c.coefficient < -0.6 && c.significance > 0.8
    );
    
    strongNegative.forEach(correlation => {
      insights.push({
        id: `trend_insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'warning',
        title: 'Potential Health Pattern',
        message: `We noticed that your ${this.formatMetricName(correlation.primary).toLowerCase()} and ${this.formatMetricName(correlation.secondary).toLowerCase()} show an inverse relationship. Consider monitoring these metrics more closely.`,
        strength: 'strong',
        coefficient: correlation.coefficient,
        actionable: true,
        priority: 'medium',
        metrics: [correlation.primary, correlation.secondary],
        createdAt: new Date().toISOString()
      });
    });
    
    return insights;
  }

  /**
   * Get correlation strength description
   */
  getCorrelationStrength(coefficient) {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8) return 'very strong';
    if (abs >= 0.6) return 'strong';
    if (abs >= 0.4) return 'moderate';
    if (abs >= 0.3) return 'weak';
    return 'very weak';
  }

  /**
   * Calculate statistical significance
   */
  calculateSignificance(correlation, n) {
    // Simplified significance calculation
    const t = correlation.coefficient * Math.sqrt((n - 2) / (1 - correlation.coefficient * correlation.coefficient));
    const significance = Math.abs(t) / (Math.abs(t) + 1); // Normalized approximation
    return Math.min(significance, 0.99);
  }

  /**
   * Calculate meaningful threshold for insights
   */
  calculateThreshold(correlation) {
    // This would be based on actual data analysis
    // For now, return reasonable defaults based on metric type
    const thresholds = {
      sleep_duration: 6,
      exercise_duration: 30,
      caffeine_intake: '3:00',
      meal_timing: '8:00'
    };
    
    return thresholds[correlation.primary] || thresholds[correlation.secondary] || 'average';
  }

  /**
   * Format metric name for display
   */
  formatMetricName(metric) {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get visualization data for correlations
   */
  getCorrelationVisualization(userId, metric1, metric2, timeframeDays = 30) {
    try {
      const cacheKey = `viz_${userId}_${metric1}_${metric2}_${timeframeDays}`;
      
      if (this.correlationCache.has(cacheKey)) {
        return this.correlationCache.get(cacheKey);
      }
      
      // Generate visualization data
      const visualization = {
        scatterPlot: this.generateScatterPlotData(userId, metric1, metric2),
        timeline: this.generateTimelineOverlay(userId, metric1, metric2),
        correlation: this.getCorrelationBetween(userId, metric1, metric2),
        insights: this.getMetricSpecificInsights(userId, metric1, metric2)
      };
      
      this.correlationCache.set(cacheKey, visualization);
      return visualization;
      
    } catch (error) {
      console.error('Visualization generation error:', error);
      return null;
    }
  }

  /**
   * Get user health data (mock implementation)
   */
  async getUserHealthData(userId, timeframeDays) {
    // In production, this would fetch real user data from database
    // For now, generate realistic mock data for demonstration
    const data = [];
    const now = new Date();
    
    for (let i = timeframeDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate correlated mock data
      const sleepHours = 6 + Math.random() * 3; // 6-9 hours
      const stressLevel = Math.random() * 10; // 0-10 scale
      
      data.push({
        date: date.toISOString(),
        sleep_duration: sleepHours,
        glucose_level: 90 + (8 - sleepHours) * 5 + Math.random() * 10, // Inverse correlation with sleep
        heart_rate_variability: 30 + sleepHours * 2 + Math.random() * 5, // Positive correlation with sleep
        exercise_duration: Math.random() * 60, // 0-60 minutes
        stress_level: stressLevel,
        blood_pressure: 120 + stressLevel * 2 + Math.random() * 10, // Positive correlation with stress
        caffeine_intake: Math.random() * 300, // 0-300mg
        pain_level: Math.random() * 10,
        mood_score: 5 + Math.random() * 5 - stressLevel * 0.3 // Inverse correlation with stress
      });
    }
    
    return data;
  }

  /**
   * Cache user insights
   */
  cacheUserInsights(userId, insights) {
    this.userInsights.set(userId, {
      insights,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  /**
   * Get cached insights for user
   */
  getCachedInsights(userId) {
    const cached = this.userInsights.get(userId);
    
    if (!cached || cached.expiresAt < new Date()) {
      return null;
    }
    
    return cached.insights;
  }

  /**
   * Generate scatter plot data for two metrics
   */
  generateScatterPlotData(userId, metric1, metric2) {
    // Mock implementation - would use real data in production
    const points = [];
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 100;
      const y = x * 0.8 + Math.random() * 20; // Some correlation with noise
      points.push({ x, y, date: new Date(Date.now() - i * 24 * 60 * 60 * 1000) });
    }
    return points;
  }

  /**
   * Generate timeline overlay data
   */
  generateTimelineOverlay(userId, metric1, metric2) {
    // Mock implementation
    return {
      metric1Data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        value: Math.random() * 100
      })),
      metric2Data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        value: Math.random() * 100
      }))
    };
  }

  /**
   * Get correlation between specific metrics
   */
  getCorrelationBetween(userId, metric1, metric2) {
    // Mock implementation
    return {
      coefficient: 0.75,
      strength: 'strong',
      direction: 'positive',
      significance: 0.85
    };
  }

  /**
   * Get metric-specific insights
   */
  getMetricSpecificInsights(userId, metric1, metric2) {
    return [
      {
        type: 'recommendation',
        message: `Improving your ${this.formatMetricName(metric1).toLowerCase()} may positively impact your ${this.formatMetricName(metric2).toLowerCase()}.`
      }
    ];
  }
}

// Export singleton instance
const insightCorrelationEngine = new InsightCorrelationEngine();

module.exports = {
  InsightCorrelationEngine,
  insightCorrelationEngine
};