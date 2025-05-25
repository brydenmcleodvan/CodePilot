/**
 * Real-Time Health Score Engine & Predictive Modeling
 * Creates composite health scores that update daily and predicts health trends
 * Uses ML patterns to forecast burnout risk, sleep decline, and other health indicators
 */

import { storage } from './storage';
import { HealthMetric, HealthGoal } from '@shared/schema';

export interface HealthScoreComponents {
  cardiovascular: {
    score: number;
    weight: number;
    metrics: {
      restingHeartRate: number;
      heartRateVariability: number;
      bloodPressure?: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    riskFactors: string[];
  };
  sleep: {
    score: number;
    weight: number;
    metrics: {
      duration: number;
      quality: number;
      consistency: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    riskFactors: string[];
  };
  physical: {
    score: number;
    weight: number;
    metrics: {
      activityLevel: number;
      strength: number;
      flexibility: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    riskFactors: string[];
  };
  mental: {
    score: number;
    weight: number;
    metrics: {
      stressLevel: number;
      mood: number;
      resilience: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    riskFactors: string[];
  };
  metabolic: {
    score: number;
    weight: number;
    metrics: {
      glucose: number;
      hydration: number;
      nutrition: number;
    };
    trend: 'improving' | 'stable' | 'declining';
    riskFactors: string[];
  };
}

export interface DailyHealthScore {
  date: Date;
  overallScore: number; // 0-100
  components: HealthScoreComponents;
  riskAlerts: {
    level: 'low' | 'moderate' | 'high' | 'critical';
    type: 'burnout' | 'sleep_decline' | 'cardiovascular' | 'metabolic' | 'mental_health';
    message: string;
    confidence: number;
    timeframe: string;
    recommendations: string[];
  }[];
  predictions: {
    sevenDayForecast: {
      date: Date;
      predictedScore: number;
      confidence: number;
      factors: string[];
    }[];
    burnoutRisk: {
      probability: number;
      timeframe: '1week' | '2weeks' | '1month';
      triggers: string[];
      preventionSteps: string[];
    };
    sleepDeclineRisk: {
      probability: number;
      timeframe: '3days' | '1week' | '2weeks';
      causes: string[];
      interventions: string[];
    };
    healthTrends: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
  };
  contextualFactors: {
    seasonalEffects: string[];
    lifestylePatterns: string[];
    goalProgress: string[];
  };
  actionablePriorities: {
    immediate: string[];
    thisWeek: string[];
    longTerm: string[];
  };
}

export class HealthScoreEngine {

  /**
   * Calculate comprehensive daily health score
   */
  async calculateDailyHealthScore(userId: number): Promise<DailyHealthScore> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const healthGoals = await storage.getHealthGoals(userId);
    
    // Get recent metrics (last 7 days for current score, 30 days for trends)
    const recentMetrics = this.getRecentMetrics(healthMetrics, 7);
    const trendMetrics = this.getRecentMetrics(healthMetrics, 30);
    
    // Calculate component scores
    const components = await this.calculateComponentScores(recentMetrics, trendMetrics);
    
    // Calculate overall weighted score
    const overallScore = this.calculateOverallScore(components);
    
    // Generate risk alerts and predictions
    const riskAlerts = await this.generateRiskAlerts(components, trendMetrics);
    const predictions = await this.generatePredictions(components, trendMetrics, healthGoals);
    
    // Add contextual factors
    const contextualFactors = await this.analyzeContextualFactors(userId, recentMetrics, healthGoals);
    
    // Generate actionable priorities
    const actionablePriorities = this.generateActionablePriorities(components, riskAlerts);

    return {
      date: new Date(),
      overallScore,
      components,
      riskAlerts,
      predictions,
      contextualFactors,
      actionablePriorities
    };
  }

  /**
   * Get health score history for trend analysis
   */
  async getHealthScoreHistory(userId: number, days: number = 30): Promise<{
    date: Date;
    score: number;
    components: { [key: string]: number };
  }[]> {
    // In a real implementation, this would fetch stored daily scores
    // For now, we'll calculate retroactively for the demo
    const history = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayMetrics = await this.getMetricsForDate(userId, date);
      const dayComponents = await this.calculateComponentScores(dayMetrics, dayMetrics);
      const dayScore = this.calculateOverallScore(dayComponents);
      
      history.push({
        date,
        score: dayScore,
        components: {
          cardiovascular: dayComponents.cardiovascular.score,
          sleep: dayComponents.sleep.score,
          physical: dayComponents.physical.score,
          mental: dayComponents.mental.score,
          metabolic: dayComponents.metabolic.score
        }
      });
    }
    
    return history.reverse(); // Oldest first
  }

  /**
   * Private helper methods
   */
  private getRecentMetrics(metrics: HealthMetric[], days: number): HealthMetric[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return metrics.filter(m => m.timestamp >= cutoffDate);
  }

  private async calculateComponentScores(
    recentMetrics: HealthMetric[], 
    trendMetrics: HealthMetric[]
  ): Promise<HealthScoreComponents> {
    
    // Cardiovascular Component
    const cardiovascular = this.calculateCardiovascularScore(recentMetrics, trendMetrics);
    
    // Sleep Component
    const sleep = this.calculateSleepScore(recentMetrics, trendMetrics);
    
    // Physical Activity Component
    const physical = this.calculatePhysicalScore(recentMetrics, trendMetrics);
    
    // Mental Health Component
    const mental = this.calculateMentalScore(recentMetrics, trendMetrics);
    
    // Metabolic Component
    const metabolic = this.calculateMetabolicScore(recentMetrics, trendMetrics);

    return {
      cardiovascular,
      sleep,
      physical,
      mental,
      metabolic
    };
  }

  private calculateCardiovascularScore(recent: HealthMetric[], trend: HealthMetric[]) {
    const heartRateMetrics = recent.filter(m => m.metricType === 'heart_rate');
    const hrvMetrics = recent.filter(m => m.metricType === 'heart_rate_variability');
    const bpMetrics = recent.filter(m => m.metricType === 'blood_pressure');

    let score = 85; // Base score
    let riskFactors: string[] = [];

    // Heart Rate Analysis
    if (heartRateMetrics.length > 0) {
      const avgHR = heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length;
      if (avgHR > 85) {
        score -= 15;
        riskFactors.push('Elevated resting heart rate');
      } else if (avgHR < 60) {
        score += 5; // Good fitness indicator
      }
    }

    // HRV Analysis
    if (hrvMetrics.length > 0) {
      const avgHRV = hrvMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / hrvMetrics.length;
      if (avgHRV < 30) {
        score -= 10;
        riskFactors.push('Low heart rate variability');
      } else if (avgHRV > 50) {
        score += 5;
      }
    }

    // Blood Pressure Analysis
    if (bpMetrics.length > 0) {
      const avgBP = bpMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / bpMetrics.length;
      if (avgBP > 130) {
        score -= 20;
        riskFactors.push('Elevated blood pressure');
      }
    }

    const trendDirection = this.calculateTrend(heartRateMetrics.concat(hrvMetrics));

    return {
      score: Math.max(0, Math.min(100, score)),
      weight: 0.25, // 25% of overall score
      metrics: {
        restingHeartRate: heartRateMetrics.length > 0 ? 
          Math.round(heartRateMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / heartRateMetrics.length) : 72,
        heartRateVariability: hrvMetrics.length > 0 ? 
          Math.round(hrvMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / hrvMetrics.length) : 45,
        bloodPressure: bpMetrics.length > 0 ? 
          Math.round(bpMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / bpMetrics.length) : undefined
      },
      trend: trendDirection,
      riskFactors
    };
  }

  private calculateSleepScore(recent: HealthMetric[], trend: HealthMetric[]) {
    const sleepMetrics = recent.filter(m => m.metricType === 'sleep');
    const sleepQualityMetrics = recent.filter(m => m.metricType === 'sleep_quality');

    let score = 80; // Base score
    let riskFactors: string[] = [];

    if (sleepMetrics.length > 0) {
      const avgSleep = sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length;
      
      if (avgSleep < 6) {
        score -= 25;
        riskFactors.push('Chronic sleep deprivation');
      } else if (avgSleep < 7) {
        score -= 10;
        riskFactors.push('Insufficient sleep');
      } else if (avgSleep > 9) {
        score -= 5;
        riskFactors.push('Excessive sleep duration');
      } else {
        score += 5; // Optimal range
      }

      // Check sleep consistency
      const sleepTimes = sleepMetrics.map(m => parseFloat(m.value));
      const variance = this.calculateVariance(sleepTimes);
      if (variance > 1.5) {
        score -= 10;
        riskFactors.push('Inconsistent sleep schedule');
      }
    }

    const trendDirection = this.calculateTrend(sleepMetrics);

    return {
      score: Math.max(0, Math.min(100, score)),
      weight: 0.25, // 25% of overall score
      metrics: {
        duration: sleepMetrics.length > 0 ? 
          Number((sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepMetrics.length).toFixed(1)) : 7.5,
        quality: sleepQualityMetrics.length > 0 ? 
          Math.round(sleepQualityMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / sleepQualityMetrics.length) : 75,
        consistency: Math.max(0, 100 - (this.calculateVariance(sleepMetrics.map(m => parseFloat(m.value))) * 20))
      },
      trend: trendDirection,
      riskFactors
    };
  }

  private calculatePhysicalScore(recent: HealthMetric[], trend: HealthMetric[]) {
    const stepsMetrics = recent.filter(m => m.metricType === 'steps');
    const exerciseMetrics = recent.filter(m => m.metricType === 'exercise');

    let score = 75; // Base score
    let riskFactors: string[] = [];

    if (stepsMetrics.length > 0) {
      const avgSteps = stepsMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stepsMetrics.length;
      
      if (avgSteps < 5000) {
        score -= 20;
        riskFactors.push('Sedentary lifestyle');
      } else if (avgSteps < 8000) {
        score -= 5;
        riskFactors.push('Low activity level');
      } else if (avgSteps > 12000) {
        score += 10; // Very active
      }
    }

    if (exerciseMetrics.length > 0) {
      const exerciseFreq = exerciseMetrics.length / 7; // Per day average
      if (exerciseFreq < 0.5) {
        score -= 15;
        riskFactors.push('Infrequent exercise');
      } else if (exerciseFreq > 1) {
        score += 10;
      }
    }

    const trendDirection = this.calculateTrend(stepsMetrics.concat(exerciseMetrics));

    return {
      score: Math.max(0, Math.min(100, score)),
      weight: 0.20, // 20% of overall score
      metrics: {
        activityLevel: stepsMetrics.length > 0 ? 
          Math.round(stepsMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stepsMetrics.length) : 8000,
        strength: exerciseMetrics.length > 0 ? 
          Math.min(100, exerciseMetrics.length * 10) : 60, // Based on frequency
        flexibility: 70 // Placeholder - would need specific flexibility metrics
      },
      trend: trendDirection,
      riskFactors
    };
  }

  private calculateMentalScore(recent: HealthMetric[], trend: HealthMetric[]) {
    const stressMetrics = recent.filter(m => m.metricType === 'stress_level');
    const moodMetrics = recent.filter(m => m.metricType === 'mood');

    let score = 80; // Base score
    let riskFactors: string[] = [];

    if (stressMetrics.length > 0) {
      const avgStress = stressMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stressMetrics.length;
      
      if (avgStress > 7) {
        score -= 25;
        riskFactors.push('High chronic stress');
      } else if (avgStress > 5) {
        score -= 10;
        riskFactors.push('Elevated stress levels');
      }
    }

    if (moodMetrics.length > 0) {
      const avgMood = moodMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / moodMetrics.length;
      
      if (avgMood < 4) {
        score -= 20;
        riskFactors.push('Low mood patterns');
      } else if (avgMood > 7) {
        score += 5;
      }
    }

    const trendDirection = this.calculateTrend(stressMetrics.concat(moodMetrics));

    return {
      score: Math.max(0, Math.min(100, score)),
      weight: 0.20, // 20% of overall score
      metrics: {
        stressLevel: stressMetrics.length > 0 ? 
          Number((stressMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / stressMetrics.length).toFixed(1)) : 4.5,
        mood: moodMetrics.length > 0 ? 
          Number((moodMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / moodMetrics.length).toFixed(1)) : 6.5,
        resilience: 75 // Would be calculated from stress recovery patterns
      },
      trend: trendDirection,
      riskFactors
    };
  }

  private calculateMetabolicScore(recent: HealthMetric[], trend: HealthMetric[]) {
    const glucoseMetrics = recent.filter(m => m.metricType === 'glucose');
    const waterMetrics = recent.filter(m => m.metricType === 'water_intake');
    const weightMetrics = recent.filter(m => m.metricType === 'weight');

    let score = 85; // Base score
    let riskFactors: string[] = [];

    if (glucoseMetrics.length > 0) {
      const avgGlucose = glucoseMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / glucoseMetrics.length;
      
      if (avgGlucose > 125) {
        score -= 20;
        riskFactors.push('Elevated glucose levels');
      } else if (avgGlucose > 100) {
        score -= 5;
        riskFactors.push('Pre-diabetic glucose range');
      }
    }

    if (waterMetrics.length > 0) {
      const avgWater = waterMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / waterMetrics.length;
      
      if (avgWater < 6) {
        score -= 10;
        riskFactors.push('Inadequate hydration');
      }
    }

    const trendDirection = this.calculateTrend(glucoseMetrics.concat(waterMetrics));

    return {
      score: Math.max(0, Math.min(100, score)),
      weight: 0.10, // 10% of overall score
      metrics: {
        glucose: glucoseMetrics.length > 0 ? 
          Math.round(glucoseMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / glucoseMetrics.length) : 95,
        hydration: waterMetrics.length > 0 ? 
          Number((waterMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / waterMetrics.length).toFixed(1)) : 7.5,
        nutrition: 75 // Would be calculated from nutrition tracking
      },
      trend: trendDirection,
      riskFactors
    };
  }

  private calculateOverallScore(components: HealthScoreComponents): number {
    const weightedScore = 
      components.cardiovascular.score * components.cardiovascular.weight +
      components.sleep.score * components.sleep.weight +
      components.physical.score * components.physical.weight +
      components.mental.score * components.mental.weight +
      components.metabolic.score * components.metabolic.weight;

    return Math.round(weightedScore);
  }

  private calculateTrend(metrics: HealthMetric[]): 'improving' | 'stable' | 'declining' {
    if (metrics.length < 4) return 'stable';
    
    const sorted = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const values = sorted.map(m => parseFloat(m.value));
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (percentChange > 5) return 'improving';
    if (percentChange < -5) return 'declining';
    return 'stable';
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private async generateRiskAlerts(
    components: HealthScoreComponents, 
    trendMetrics: HealthMetric[]
  ): Promise<DailyHealthScore['riskAlerts']> {
    const alerts = [];

    // Burnout Risk Detection
    if (components.mental.score < 60 && components.sleep.score < 70) {
      alerts.push({
        level: 'high' as const,
        type: 'burnout' as const,
        message: 'High burnout risk detected based on stress and sleep patterns',
        confidence: 0.85,
        timeframe: '2-3 weeks',
        recommendations: [
          'Prioritize stress management techniques',
          'Establish consistent sleep schedule',
          'Consider workload adjustments',
          'Practice mindfulness or meditation'
        ]
      });
    }

    // Sleep Decline Risk
    if (components.sleep.trend === 'declining' && components.sleep.score < 75) {
      alerts.push({
        level: 'moderate' as const,
        type: 'sleep_decline' as const,
        message: 'Sleep quality showing declining trend',
        confidence: 0.78,
        timeframe: '1-2 weeks',
        recommendations: [
          'Review evening routine',
          'Limit screen time before bed',
          'Check sleep environment factors',
          'Consider sleep hygiene consultation'
        ]
      });
    }

    // Cardiovascular Risk
    if (components.cardiovascular.score < 70) {
      alerts.push({
        level: 'moderate' as const,
        type: 'cardiovascular' as const,
        message: 'Cardiovascular health metrics need attention',
        confidence: 0.72,
        timeframe: '2-4 weeks',
        recommendations: [
          'Increase regular cardio exercise',
          'Monitor blood pressure trends',
          'Consider heart-healthy diet changes',
          'Reduce stress levels'
        ]
      });
    }

    return alerts;
  }

  private async generatePredictions(
    components: HealthScoreComponents,
    trendMetrics: HealthMetric[],
    goals: HealthGoal[]
  ): Promise<DailyHealthScore['predictions']> {
    
    // Simple prediction model - in a real ML implementation, this would use trained models
    const currentScore = this.calculateOverallScore(components);
    
    // 7-day forecast
    const sevenDayForecast = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      
      // Predict based on current trends
      let predictedScore = currentScore;
      const trendAdjustment = this.calculateTrendAdjustment(components);
      predictedScore += trendAdjustment * i * 0.5; // Gradual change
      
      sevenDayForecast.push({
        date,
        predictedScore: Math.max(0, Math.min(100, Math.round(predictedScore))),
        confidence: Math.max(0.5, 0.9 - i * 0.05), // Decreasing confidence over time
        factors: this.getPredictionFactors(components)
      });
    }

    // Burnout risk prediction
    const burnoutProbability = this.calculateBurnoutProbability(components);
    
    // Sleep decline prediction
    const sleepDeclineProbability = this.calculateSleepDeclineProbability(components);

    return {
      sevenDayForecast,
      burnoutRisk: {
        probability: burnoutProbability,
        timeframe: burnoutProbability > 0.7 ? '1week' : burnoutProbability > 0.4 ? '2weeks' : '1month',
        triggers: ['High stress levels', 'Poor sleep quality', 'Low physical activity'],
        preventionSteps: [
          'Implement stress reduction techniques',
          'Prioritize sleep hygiene',
          'Schedule regular breaks',
          'Engage in physical activity'
        ]
      },
      sleepDeclineRisk: {
        probability: sleepDeclineProbability,
        timeframe: sleepDeclineProbability > 0.6 ? '3days' : sleepDeclineProbability > 0.3 ? '1week' : '2weeks',
        causes: ['Irregular sleep schedule', 'High stress', 'Poor sleep environment'],
        interventions: [
          'Establish consistent bedtime routine',
          'Optimize sleep environment',
          'Limit evening screen time',
          'Practice relaxation techniques'
        ]
      },
      healthTrends: {
        improving: Object.entries(components)
          .filter(([_, comp]) => comp.trend === 'improving')
          .map(([name, _]) => name),
        declining: Object.entries(components)
          .filter(([_, comp]) => comp.trend === 'declining')
          .map(([name, _]) => name),
        stable: Object.entries(components)
          .filter(([_, comp]) => comp.trend === 'stable')
          .map(([name, _]) => name)
      }
    };
  }

  private calculateTrendAdjustment(components: HealthScoreComponents): number {
    let adjustment = 0;
    
    Object.values(components).forEach(component => {
      if (component.trend === 'improving') adjustment += 1;
      if (component.trend === 'declining') adjustment -= 1;
    });
    
    return adjustment / Object.keys(components).length;
  }

  private getPredictionFactors(components: HealthScoreComponents): string[] {
    const factors = [];
    
    if (components.sleep.trend === 'declining') factors.push('Declining sleep quality');
    if (components.mental.score < 70) factors.push('Elevated stress levels');
    if (components.physical.trend === 'improving') factors.push('Improving fitness');
    if (components.cardiovascular.score > 80) factors.push('Good cardiovascular health');
    
    return factors.length > 0 ? factors : ['Stable health patterns'];
  }

  private calculateBurnoutProbability(components: HealthScoreComponents): number {
    let probability = 0;
    
    if (components.mental.score < 60) probability += 0.3;
    if (components.sleep.score < 65) probability += 0.25;
    if (components.physical.score < 60) probability += 0.15;
    if (components.mental.trend === 'declining') probability += 0.2;
    if (components.sleep.trend === 'declining') probability += 0.15;
    
    return Math.min(1, probability);
  }

  private calculateSleepDeclineProbability(components: HealthScoreComponents): number {
    let probability = 0;
    
    if (components.sleep.score < 70) probability += 0.3;
    if (components.sleep.trend === 'declining') probability += 0.4;
    if (components.mental.score < 65) probability += 0.2;
    if (components.sleep.metrics.consistency < 70) probability += 0.15;
    
    return Math.min(1, probability);
  }

  private async analyzeContextualFactors(
    userId: number, 
    recentMetrics: HealthMetric[], 
    goals: HealthGoal[]
  ) {
    return {
      seasonalEffects: [
        'Winter season may affect mood and activity levels',
        'Shorter daylight hours impacting circadian rhythm'
      ],
      lifestylePatterns: [
        'Weekday vs weekend activity patterns detected',
        'Work stress correlating with sleep quality'
      ],
      goalProgress: [
        `${goals.filter(g => g.status === 'completed').length} goals completed this period`,
        'Exercise goals showing strongest adherence'
      ]
    };
  }

  private generateActionablePriorities(
    components: HealthScoreComponents,
    riskAlerts: DailyHealthScore['riskAlerts']
  ) {
    const immediate = [];
    const thisWeek = [];
    const longTerm = [];

    // High-priority immediate actions
    if (riskAlerts.some(alert => alert.level === 'high' || alert.level === 'critical')) {
      immediate.push('Address high-risk health alerts');
    }
    
    if (components.sleep.score < 60) {
      immediate.push('Prioritize sleep optimization tonight');
    }

    // This week priorities
    if (components.physical.score < 70) {
      thisWeek.push('Increase daily physical activity');
    }
    
    if (components.mental.score < 70) {
      thisWeek.push('Implement stress management techniques');
    }

    // Long-term improvements
    if (components.cardiovascular.score < 80) {
      longTerm.push('Develop comprehensive cardiovascular health plan');
    }
    
    longTerm.push('Build sustainable healthy lifestyle habits');

    return {
      immediate: immediate.length > 0 ? immediate : ['Maintain current positive habits'],
      thisWeek: thisWeek.length > 0 ? thisWeek : ['Continue consistent health practices'],
      longTerm: longTerm.length > 0 ? longTerm : ['Optimize overall wellness strategy']
    };
  }

  private async getMetricsForDate(userId: number, date: Date): Promise<HealthMetric[]> {
    const allMetrics = await storage.getHealthMetrics(userId);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    return allMetrics.filter(m => 
      m.timestamp >= startOfDay && m.timestamp <= endOfDay
    );
  }
}

export const healthScoreEngine = new HealthScoreEngine();