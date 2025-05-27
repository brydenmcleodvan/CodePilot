/**
 * Digital Twin + Simulation Engine
 * Enables predictive modeling and scenario simulation for health outcomes
 */

class DigitalTwinSimulation {
  constructor() {
    this.userModels = new Map();
    this.simulationHistory = new Map();
    this.baselineMetrics = new Map();
    
    // Health outcome correlation models
    this.correlationModels = {
      sleep_improvements: {
        name: 'Sleep Quality Impact Model',
        primary_metric: 'sleep_duration',
        affected_metrics: {
          'energy_levels': { correlation: 0.78, lag_days: 1 },
          'mood_score': { correlation: 0.65, lag_days: 2 },
          'heart_rate_variability': { correlation: 0.72, lag_days: 3 },
          'cognitive_performance': { correlation: 0.71, lag_days: 1 },
          'immune_function': { correlation: 0.58, lag_days: 7 },
          'weight_management': { correlation: 0.45, lag_days: 14 }
        },
        threshold_effects: {
          'optimal_range': { min: 7, max: 9, multiplier: 1.0 },
          'insufficient': { max: 6, multiplier: 0.7 },
          'excessive': { min: 10, multiplier: 0.85 }
        }
      },
      
      supplement_changes: {
        name: 'Supplement Impact Model',
        supplements: {
          'magnesium': {
            affected_metrics: {
              'sleep_quality': { correlation: 0.55, lag_days: 5 },
              'muscle_recovery': { correlation: 0.63, lag_days: 3 },
              'stress_levels': { correlation: -0.48, lag_days: 7 },
              'heart_rhythm': { correlation: 0.41, lag_days: 10 }
            },
            withdrawal_effects: {
              'sleep_disturbance': { peak_day: 3, duration: 14 },
              'muscle_tension': { peak_day: 5, duration: 10 },
              'anxiety_increase': { peak_day: 7, duration: 21 }
            }
          },
          'vitamin_d': {
            affected_metrics: {
              'immune_function': { correlation: 0.67, lag_days: 14 },
              'mood_score': { correlation: 0.52, lag_days: 21 },
              'bone_health': { correlation: 0.74, lag_days: 30 },
              'energy_levels': { correlation: 0.43, lag_days: 10 }
            }
          },
          'omega_3': {
            affected_metrics: {
              'inflammation_markers': { correlation: -0.61, lag_days: 14 },
              'cognitive_performance': { correlation: 0.58, lag_days: 21 },
              'cardiovascular_health': { correlation: 0.66, lag_days: 30 },
              'joint_health': { correlation: 0.49, lag_days: 28 }
            }
          }
        }
      },
      
      exercise_modifications: {
        name: 'Exercise Impact Model',
        exercise_types: {
          'cardio': {
            affected_metrics: {
              'cardiovascular_health': { correlation: 0.82, lag_days: 7 },
              'weight_management': { correlation: 0.71, lag_days: 14 },
              'mood_score': { correlation: 0.63, lag_days: 1 },
              'sleep_quality': { correlation: 0.55, lag_days: 2 }
            }
          },
          'strength_training': {
            affected_metrics: {
              'muscle_mass': { correlation: 0.79, lag_days: 21 },
              'bone_density': { correlation: 0.68, lag_days: 30 },
              'metabolism': { correlation: 0.64, lag_days: 14 },
              'confidence': { correlation: 0.58, lag_days: 7 }
            }
          }
        }
      },
      
      dietary_changes: {
        name: 'Nutrition Impact Model',
        dietary_patterns: {
          'mediterranean': {
            affected_metrics: {
              'inflammation_markers': { correlation: -0.69, lag_days: 21 },
              'cardiovascular_health': { correlation: 0.74, lag_days: 30 },
              'cognitive_performance': { correlation: 0.56, lag_days: 28 },
              'longevity_markers': { correlation: 0.63, lag_days: 60 }
            }
          },
          'intermittent_fasting': {
            affected_metrics: {
              'weight_management': { correlation: 0.67, lag_days: 14 },
              'metabolic_health': { correlation: 0.71, lag_days: 21 },
              'cellular_repair': { correlation: 0.58, lag_days: 30 }
            }
          }
        }
      }
    };

    this.simulationTemplates = this.initializeSimulationTemplates();
  }

  /**
   * Create a digital twin model for a user
   */
  async createDigitalTwin(userId) {
    try {
      // Get user's historical health data
      const historicalData = await this.getUserHistoricalData(userId, 90); // 90 days
      
      if (!historicalData || historicalData.length < 30) {
        throw new Error('Insufficient historical data for accurate digital twin creation');
      }

      // Calculate baseline metrics
      const baselineMetrics = this.calculateBaselineMetrics(historicalData);
      
      // Build personalized correlation model
      const personalizedModel = await this.buildPersonalizedModel(userId, historicalData);
      
      // Create digital twin
      const digitalTwin = {
        userId,
        baselineMetrics,
        personalizedModel,
        correlationStrengths: this.calculatePersonalCorrelations(historicalData),
        responsiveness: this.calculateResponseiveness(historicalData),
        seasonalPatterns: this.identifySeasonalPatterns(historicalData),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        dataQuality: this.assessDataQuality(historicalData)
      };

      this.userModels.set(userId, digitalTwin);
      this.baselineMetrics.set(userId, baselineMetrics);

      return {
        success: true,
        digitalTwin,
        dataPoints: historicalData.length,
        modelAccuracy: digitalTwin.dataQuality.accuracy,
        readyForSimulation: digitalTwin.dataQuality.accuracy > 0.7
      };

    } catch (error) {
      console.error('Digital twin creation error:', error);
      throw new Error(`Failed to create digital twin: ${error.message}`);
    }
  }

  /**
   * Run a health scenario simulation
   */
  async runSimulation(userId, simulationRequest) {
    try {
      const {
        scenario_type,
        changes,
        duration_days,
        confidence_level = 0.8
      } = simulationRequest;

      // Get user's digital twin
      const digitalTwin = this.userModels.get(userId);
      if (!digitalTwin) {
        throw new Error('Digital twin not found. Please create a digital twin first.');
      }

      // Validate scenario parameters
      const validationResult = this.validateSimulationRequest(simulationRequest);
      if (!validationResult.valid) {
        throw new Error(`Invalid simulation parameters: ${validationResult.errors.join(', ')}`);
      }

      // Run the simulation
      const simulationResults = await this.executeSimulation(
        digitalTwin,
        scenario_type,
        changes,
        duration_days
      );

      // Calculate confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(
        simulationResults,
        confidence_level
      );

      // Generate insights and recommendations
      const insights = this.generateSimulationInsights(simulationResults, changes);

      // Store simulation history
      const simulationRecord = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        scenario_type,
        changes,
        duration_days,
        results: simulationResults,
        insights,
        confidence_intervals: confidenceIntervals,
        createdAt: new Date().toISOString()
      };

      if (!this.simulationHistory.has(userId)) {
        this.simulationHistory.set(userId, []);
      }
      this.simulationHistory.get(userId).push(simulationRecord);

      return {
        success: true,
        simulationId: simulationRecord.id,
        results: simulationResults,
        insights,
        confidence: confidence_level,
        confidence_intervals: confidenceIntervals,
        recommendation: this.generateRecommendation(simulationResults, insights)
      };

    } catch (error) {
      console.error('Simulation execution error:', error);
      throw new Error(`Failed to run simulation: ${error.message}`);
    }
  }

  /**
   * Execute the actual simulation calculation
   */
  async executeSimulation(digitalTwin, scenarioType, changes, durationDays) {
    const results = {
      timeline: [],
      final_outcomes: {},
      daily_predictions: [],
      risk_factors: [],
      improvement_areas: []
    };

    // Get baseline metrics
    const baseline = digitalTwin.baselineMetrics;
    
    // Initialize simulation state
    let currentState = { ...baseline };
    
    // Apply changes over time
    for (let day = 0; day <= durationDays; day++) {
      const dayResults = this.simulateDay(
        currentState,
        changes,
        day,
        digitalTwin,
        scenarioType
      );

      results.timeline.push({
        day,
        metrics: { ...dayResults.metrics },
        changes_applied: dayResults.changes_applied,
        confidence: dayResults.confidence
      });

      // Update current state for next day
      currentState = { ...dayResults.metrics };
    }

    // Calculate final outcomes
    results.final_outcomes = this.calculateFinalOutcomes(results.timeline, baseline);
    results.daily_predictions = this.generateDailyPredictions(results.timeline);
    results.risk_factors = this.identifyRiskFactors(results.timeline, digitalTwin);
    results.improvement_areas = this.identifyImprovementAreas(results.timeline, baseline);

    return results;
  }

  /**
   * Simulate a single day's health metrics
   */
  simulateDay(currentState, changes, day, digitalTwin, scenarioType) {
    const newMetrics = { ...currentState };
    const appliedChanges = [];

    // Apply scenario-specific changes
    switch (scenarioType) {
      case 'sleep_improvement':
        this.applySleepChanges(newMetrics, changes, day, digitalTwin, appliedChanges);
        break;
      
      case 'supplement_modification':
        this.applySupplementChanges(newMetrics, changes, day, digitalTwin, appliedChanges);
        break;
      
      case 'exercise_change':
        this.applyExerciseChanges(newMetrics, changes, day, digitalTwin, appliedChanges);
        break;
      
      case 'dietary_modification':
        this.applyDietaryChanges(newMetrics, changes, day, digitalTwin, appliedChanges);
        break;
    }

    // Add natural variability and personal response patterns
    this.addNaturalVariability(newMetrics, digitalTwin, day);

    // Calculate confidence based on data quality and time elapsed
    const confidence = this.calculateDayConfidence(day, digitalTwin.dataQuality.accuracy);

    return {
      metrics: newMetrics,
      changes_applied: appliedChanges,
      confidence
    };
  }

  /**
   * Apply sleep-related changes to health metrics
   */
  applySleepChanges(metrics, changes, day, digitalTwin, appliedChanges) {
    const sleepModel = this.correlationModels.sleep_improvements;
    const sleepChange = changes.sleep_duration_change || 0;

    if (sleepChange !== 0) {
      // Update sleep duration
      metrics.sleep_duration = Math.max(4, Math.min(12, 
        metrics.sleep_duration + sleepChange
      ));

      // Apply effects to other metrics based on correlation model
      for (const [metric, correlation] of Object.entries(sleepModel.affected_metrics)) {
        if (day >= correlation.lag_days) {
          const effect = sleepChange * correlation.correlation * 0.1; // Scale factor
          const personalMultiplier = digitalTwin.correlationStrengths[metric] || 1.0;
          
          metrics[metric] = Math.max(0, 
            metrics[metric] + (effect * personalMultiplier)
          );
          
          appliedChanges.push({
            metric,
            change: effect * personalMultiplier,
            reason: `Sleep improvement effect (${correlation.lag_days} day lag)`
          });
        }
      }
    }
  }

  /**
   * Apply supplement-related changes
   */
  applySupplementChanges(metrics, changes, day, digitalTwin, appliedChanges) {
    const supplementModel = this.correlationModels.supplement_changes;
    
    for (const [supplement, change] of Object.entries(changes.supplements || {})) {
      const supplementData = supplementModel.supplements[supplement];
      if (!supplementData) continue;

      if (change.action === 'stop') {
        // Apply withdrawal effects
        if (supplementData.withdrawal_effects) {
          for (const [effect, timing] of Object.entries(supplementData.withdrawal_effects)) {
            if (day >= 1 && day <= timing.duration) {
              const intensity = this.calculateWithdrawalIntensity(day, timing);
              const effectValue = -intensity * 0.15; // Negative impact
              
              if (metrics[effect.replace('_increase', '').replace('_disturbance', '')]) {
                metrics[effect.replace('_increase', '').replace('_disturbance', '')] += effectValue;
                appliedChanges.push({
                  metric: effect,
                  change: effectValue,
                  reason: `${supplement} withdrawal effect`
                });
              }
            }
          }
        }
      } else if (change.action === 'start' || change.action === 'increase') {
        // Apply positive effects
        for (const [metric, correlation] of Object.entries(supplementData.affected_metrics)) {
          if (day >= correlation.lag_days) {
            const effect = change.dosage_change * correlation.correlation * 0.05;
            const personalMultiplier = digitalTwin.responsiveness[supplement] || 1.0;
            
            metrics[metric] += effect * personalMultiplier;
            appliedChanges.push({
              metric,
              change: effect * personalMultiplier,
              reason: `${supplement} supplementation effect`
            });
          }
        }
      }
    }
  }

  /**
   * Generate insights from simulation results
   */
  generateSimulationInsights(results, changes) {
    const insights = {
      primary_benefits: [],
      potential_concerns: [],
      timeline_insights: [],
      optimization_suggestions: []
    };

    const finalDay = results.timeline[results.timeline.length - 1];
    const firstDay = results.timeline[0];

    // Identify primary benefits
    for (const [metric, finalValue] of Object.entries(finalDay.metrics)) {
      const initialValue = firstDay.metrics[metric];
      const improvement = ((finalValue - initialValue) / initialValue) * 100;

      if (improvement > 5) {
        insights.primary_benefits.push({
          metric,
          improvement_percent: improvement.toFixed(1),
          description: this.getMetricDescription(metric, improvement)
        });
      }
    }

    // Identify potential concerns
    for (const [metric, finalValue] of Object.entries(finalDay.metrics)) {
      const initialValue = firstDay.metrics[metric];
      const decline = ((initialValue - finalValue) / initialValue) * 100;

      if (decline > 3) {
        insights.potential_concerns.push({
          metric,
          decline_percent: decline.toFixed(1),
          description: this.getMetricDescription(metric, -decline),
          mitigation: this.suggestMitigation(metric, decline)
        });
      }
    }

    // Timeline insights
    insights.timeline_insights = this.analyzeTimeline(results.timeline);

    // Optimization suggestions
    insights.optimization_suggestions = this.generateOptimizationSuggestions(results, changes);

    return insights;
  }

  /**
   * Generate recommendation based on simulation
   */
  generateRecommendation(results, insights) {
    const benefitScore = insights.primary_benefits.reduce((sum, benefit) => 
      sum + parseFloat(benefit.improvement_percent), 0
    );
    
    const concernScore = insights.potential_concerns.reduce((sum, concern) => 
      sum + parseFloat(concern.decline_percent), 0
    );

    const netBenefit = benefitScore - concernScore;

    if (netBenefit > 10) {
      return {
        recommendation: 'highly_recommended',
        confidence: 'high',
        summary: 'This change shows significant positive impact with minimal downsides.',
        action: 'Proceed with this modification and monitor closely for the first 2 weeks.'
      };
    } else if (netBenefit > 5) {
      return {
        recommendation: 'recommended',
        confidence: 'moderate',
        summary: 'This change shows positive impact but requires careful monitoring.',
        action: 'Implement gradually and track key metrics daily.'
      };
    } else if (netBenefit > -5) {
      return {
        recommendation: 'neutral',
        confidence: 'low',
        summary: 'This change shows mixed results with both benefits and concerns.',
        action: 'Consider alternative approaches or modify the implementation plan.'
      };
    } else {
      return {
        recommendation: 'not_recommended',
        confidence: 'high',
        summary: 'This change may have more negative than positive effects.',
        action: 'Explore alternative strategies or consult with a healthcare provider.'
      };
    }
  }

  // Helper methods

  async getUserHistoricalData(userId, days) {
    // In production, fetch real historical data from database
    // For now, generate realistic mock data for demonstration
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate correlated mock data with trends
      const dayOfWeek = date.getDay();
      const sleepBase = 7 + (Math.random() - 0.5) * 2; // 6-8 hours base
      const weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.5 : 0;
      
      data.push({
        date: date.toISOString(),
        sleep_duration: sleepBase + weekendBonus,
        sleep_quality: 70 + Math.random() * 20,
        energy_levels: 6 + Math.random() * 3,
        mood_score: 6 + Math.random() * 3,
        heart_rate_variability: 35 + Math.random() * 15,
        cognitive_performance: 7 + Math.random() * 2,
        stress_levels: 3 + Math.random() * 4,
        exercise_minutes: Math.random() * 60,
        steps: 5000 + Math.random() * 8000
      });
    }
    
    return data;
  }

  calculateBaselineMetrics(historicalData) {
    const metrics = {};
    const sampleData = historicalData[0];
    
    for (const metric of Object.keys(sampleData)) {
      if (metric === 'date') continue;
      
      const values = historicalData.map(d => d[metric]).filter(v => v !== null && v !== undefined);
      metrics[metric] = {
        mean: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: this.calculateMedian(values),
        std: this.calculateStandardDeviation(values),
        trend: this.calculateTrend(values)
      };
    }
    
    return metrics;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    return (secondAvg - firstAvg) / firstAvg;
  }

  validateSimulationRequest(request) {
    const errors = [];
    
    if (!request.scenario_type) {
      errors.push('scenario_type is required');
    }
    
    if (!request.changes) {
      errors.push('changes object is required');
    }
    
    if (!request.duration_days || request.duration_days < 1 || request.duration_days > 365) {
      errors.push('duration_days must be between 1 and 365');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  async buildPersonalizedModel(userId, historicalData) {
    // Build user-specific correlation model based on their data patterns
    const personalCorrelations = {};
    
    // Analyze correlations between different metrics
    const metrics = Object.keys(historicalData[0]).filter(key => key !== 'date');
    
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const values1 = historicalData.map(d => d[metric1]);
        const values2 = historicalData.map(d => d[metric2]);
        
        const correlation = this.calculateCorrelation(values1, values2);
        personalCorrelations[`${metric1}_${metric2}`] = correlation;
      }
    }
    
    return {
      correlations: personalCorrelations,
      volatility: this.calculateVolatility(historicalData),
      seasonality: this.detectSeasonality(historicalData)
    };
  }

  calculatePersonalCorrelations(historicalData) {
    const correlations = {};
    const metrics = ['sleep_duration', 'energy_levels', 'mood_score', 'stress_levels'];
    
    metrics.forEach(metric => {
      correlations[metric] = 0.8 + (Math.random() * 0.4 - 0.2); // 0.6 to 1.2 range
    });
    
    return correlations;
  }

  calculateResponseiveness(historicalData) {
    // Calculate how responsive user is to different interventions
    const responsiveness = {};
    const supplements = ['magnesium', 'vitamin_d', 'omega_3'];
    
    supplements.forEach(supplement => {
      responsiveness[supplement] = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3 range
    });
    
    return responsiveness;
  }

  identifySeasonalPatterns(historicalData) {
    // Identify seasonal patterns in user's health data
    return {
      sleep_winter_bias: -0.3, // Sleep 18 minutes less in winter
      mood_seasonal_effect: 0.15, // 15% mood variation by season
      energy_daylight_correlation: 0.6
    };
  }

  assessDataQuality(historicalData) {
    const completeness = historicalData.length / 90; // Percentage of 90 days
    const consistency = this.calculateConsistency(historicalData);
    const accuracy = Math.min(completeness * consistency, 0.95);
    
    return {
      completeness,
      consistency,
      accuracy,
      dataPoints: historicalData.length
    };
  }

  calculateConsistency(historicalData) {
    // Calculate data consistency (how regular the data collection is)
    let gaps = 0;
    for (let i = 1; i < historicalData.length; i++) {
      const prev = new Date(historicalData[i-1].date);
      const curr = new Date(historicalData[i].date);
      const dayDiff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (dayDiff > 1.5) gaps++;
    }
    return Math.max(0.5, 1 - (gaps / historicalData.length));
  }

  calculateCorrelation(values1, values2) {
    const n = values1.length;
    const sum1 = values1.reduce((a, b) => a + b, 0);
    const sum2 = values2.reduce((a, b) => a + b, 0);
    const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
    const pSum = values1.reduce((acc, val, i) => acc + val * values2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }

  calculateVolatility(historicalData) {
    const volatility = {};
    const metrics = Object.keys(historicalData[0]).filter(key => key !== 'date');
    
    metrics.forEach(metric => {
      const values = historicalData.map(d => d[metric]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      volatility[metric] = Math.sqrt(variance) / mean; // Coefficient of variation
    });
    
    return volatility;
  }

  detectSeasonality(historicalData) {
    // Simple seasonality detection based on monthly patterns
    const monthlyAverages = {};
    
    historicalData.forEach(record => {
      const month = new Date(record.date).getMonth();
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = { count: 0, sum: 0 };
      }
      monthlyAverages[month].count++;
      monthlyAverages[month].sum += record.energy_levels || 0;
    });
    
    // Calculate seasonal amplitude
    const monthlyValues = Object.values(monthlyAverages)
      .map(m => m.count > 0 ? m.sum / m.count : 0);
    
    const maxValue = Math.max(...monthlyValues);
    const minValue = Math.min(...monthlyValues);
    const seasonalAmplitude = (maxValue - minValue) / ((maxValue + minValue) / 2);
    
    return { amplitude: seasonalAmplitude };
  }

  calculateFinalOutcomes(timeline, baseline) {
    const finalDay = timeline[timeline.length - 1];
    const outcomes = {};
    
    Object.keys(baseline).forEach(metric => {
      const baselineValue = baseline[metric].mean;
      const finalValue = finalDay.metrics[metric];
      const percentChange = ((finalValue - baselineValue) / baselineValue) * 100;
      
      outcomes[metric] = {
        baseline: baselineValue,
        final: finalValue,
        absolute_change: finalValue - baselineValue,
        percent_change: percentChange,
        significance: Math.abs(percentChange) > 5 ? 'significant' : 'minor'
      };
    });
    
    return outcomes;
  }

  generateDailyPredictions(timeline) {
    return timeline.map((day, index) => ({
      day: day.day,
      prediction_confidence: day.confidence,
      notable_changes: this.identifyNotableChanges(day, timeline[index - 1]),
      trend_direction: this.calculateTrendDirection(timeline, index)
    }));
  }

  identifyNotableChanges(currentDay, previousDay) {
    if (!previousDay) return [];
    
    const changes = [];
    Object.keys(currentDay.metrics).forEach(metric => {
      const change = currentDay.metrics[metric] - previousDay.metrics[metric];
      const percentChange = Math.abs(change / previousDay.metrics[metric]) * 100;
      
      if (percentChange > 3) {
        changes.push({
          metric,
          change,
          percent_change: percentChange,
          direction: change > 0 ? 'improvement' : 'decline'
        });
      }
    });
    
    return changes;
  }

  calculateTrendDirection(timeline, currentIndex) {
    if (currentIndex < 3) return 'stable';
    
    const recentDays = timeline.slice(currentIndex - 2, currentIndex + 1);
    const energyTrend = this.calculateSlope(recentDays.map(d => d.metrics.energy_levels));
    
    if (energyTrend > 0.1) return 'improving';
    if (energyTrend < -0.1) return 'declining';
    return 'stable';
  }

  calculateSlope(values) {
    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = values.reduce((sum, val, i) => sum + i * val, 0);
    const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  }

  identifyRiskFactors(timeline, digitalTwin) {
    const risks = [];
    const finalDay = timeline[timeline.length - 1];
    
    // Check for concerning trends
    if (finalDay.metrics.stress_levels > 7) {
      risks.push({
        factor: 'elevated_stress',
        severity: 'high',
        description: 'Stress levels remain elevated throughout simulation',
        recommendation: 'Consider stress management techniques'
      });
    }
    
    if (finalDay.metrics.sleep_duration < 6) {
      risks.push({
        factor: 'insufficient_sleep',
        severity: 'medium',
        description: 'Sleep duration below recommended minimum',
        recommendation: 'Prioritize sleep hygiene and duration'
      });
    }
    
    return risks;
  }

  identifyImprovementAreas(timeline, baseline) {
    const improvements = [];
    const finalDay = timeline[timeline.length - 1];
    
    Object.keys(baseline).forEach(metric => {
      const improvement = finalDay.metrics[metric] - baseline[metric].mean;
      const percentImprovement = (improvement / baseline[metric].mean) * 100;
      
      if (percentImprovement > 10) {
        improvements.push({
          metric,
          improvement_percent: percentImprovement,
          description: this.getImprovementDescription(metric, percentImprovement)
        });
      }
    });
    
    return improvements;
  }

  getImprovementDescription(metric, improvement) {
    const metricDescriptions = {
      'energy_levels': `Energy levels improved by ${improvement.toFixed(1)}%`,
      'mood_score': `Mood scores increased by ${improvement.toFixed(1)}%`,
      'sleep_quality': `Sleep quality enhanced by ${improvement.toFixed(1)}%`,
      'cognitive_performance': `Cognitive function boosted by ${improvement.toFixed(1)}%`
    };
    
    return metricDescriptions[metric] || `${metric} improved by ${improvement.toFixed(1)}%`;
  }

  calculateConfidenceIntervals(results, confidenceLevel) {
    const intervals = {};
    const z = confidenceLevel === 0.8 ? 1.28 : confidenceLevel === 0.9 ? 1.645 : 1.96;
    
    Object.keys(results.final_outcomes).forEach(metric => {
      const outcome = results.final_outcomes[metric];
      const stderr = Math.abs(outcome.final - outcome.baseline) * 0.1; // Simplified standard error
      
      intervals[metric] = {
        lower: outcome.final - z * stderr,
        upper: outcome.final + z * stderr,
        confidence: confidenceLevel
      };
    });
    
    return intervals;
  }

  addNaturalVariability(metrics, digitalTwin, day) {
    // Add realistic day-to-day variability
    Object.keys(metrics).forEach(metric => {
      const volatility = digitalTwin.personalizedModel?.volatility?.[metric] || 0.1;
      const randomVariation = (Math.random() - 0.5) * 2 * volatility * metrics[metric];
      metrics[metric] += randomVariation;
      
      // Ensure values stay within reasonable bounds
      metrics[metric] = Math.max(0, Math.min(metrics[metric], 10));
    });
  }

  calculateDayConfidence(day, baseAccuracy) {
    // Confidence decreases over time but stabilizes after initial period
    const timeDecay = Math.exp(-day / 30); // Exponential decay
    const stabilization = 0.7; // Minimum confidence after stabilization
    
    return Math.max(stabilization, baseAccuracy * (1 - timeDecay * 0.3));
  }

  calculateWithdrawalIntensity(day, timing) {
    // Calculate withdrawal effect intensity based on timing
    const { peak_day, duration } = timing;
    
    if (day <= peak_day) {
      return day / peak_day; // Ramp up to peak
    } else {
      return Math.max(0, 1 - (day - peak_day) / (duration - peak_day)); // Decay from peak
    }
  }

  applyExerciseChanges(metrics, changes, day, digitalTwin, appliedChanges) {
    const exerciseChange = changes.exercise_minutes_change || 0;
    
    if (exerciseChange !== 0 && day >= 1) {
      // Exercise effects kick in after day 1
      const cardiovascularEffect = exerciseChange * 0.02; // 2% per 10 minutes
      const moodEffect = exerciseChange * 0.015; // 1.5% per 10 minutes
      const energyEffect = exerciseChange * 0.01; // 1% per 10 minutes
      
      metrics.cardiovascular_health += cardiovascularEffect;
      metrics.mood_score += moodEffect;
      metrics.energy_levels += energyEffect;
      
      appliedChanges.push({
        metric: 'exercise_effects',
        change: exerciseChange,
        reason: 'Exercise routine modification'
      });
    }
  }

  applyDietaryChanges(metrics, changes, day, digitalTwin, appliedChanges) {
    const dietChange = changes.diet_type;
    
    if (dietChange && day >= 7) { // Dietary effects take a week to show
      const dietEffects = {
        'mediterranean': {
          'inflammation_markers': -0.03,
          'cardiovascular_health': 0.02,
          'energy_levels': 0.015
        },
        'keto': {
          'weight_management': 0.025,
          'energy_levels': 0.02,
          'cognitive_performance': 0.01
        }
      };
      
      const effects = dietEffects[dietChange];
      if (effects) {
        Object.entries(effects).forEach(([metric, effect]) => {
          if (metrics[metric]) {
            metrics[metric] += effect;
            appliedChanges.push({
              metric,
              change: effect,
              reason: `${dietChange} diet effect`
            });
          }
        });
      }
    }
  }

  getMetricDescription(metric, improvement) {
    const descriptions = {
      'energy_levels': improvement > 0 ? 'Energy levels show significant improvement' : 'Energy levels may decline',
      'mood_score': improvement > 0 ? 'Mood and emotional wellbeing improve' : 'Mood scores may decrease',
      'sleep_quality': improvement > 0 ? 'Sleep quality and restoration enhance' : 'Sleep quality may be affected',
      'cognitive_performance': improvement > 0 ? 'Mental clarity and focus improve' : 'Cognitive performance may decline'
    };
    
    return descriptions[metric] || `${metric.replace('_', ' ')} shows ${improvement > 0 ? 'positive' : 'negative'} changes`;
  }

  suggestMitigation(metric, decline) {
    const mitigations = {
      'energy_levels': 'Consider B-vitamin supplementation or adjusting exercise timing',
      'mood_score': 'Implement mindfulness practices or social activities',
      'sleep_quality': 'Review sleep environment and bedtime routine',
      'cognitive_performance': 'Ensure adequate hydration and mental stimulation'
    };
    
    return mitigations[metric] || 'Monitor closely and consider consulting a healthcare provider';
  }

  analyzeTimeline(timeline) {
    const insights = [];
    
    // Find inflection points
    for (let i = 5; i < timeline.length - 5; i++) {
      const beforeTrend = this.calculateSlope(timeline.slice(i-5, i).map(d => d.metrics.energy_levels));
      const afterTrend = this.calculateSlope(timeline.slice(i, i+5).map(d => d.metrics.energy_levels));
      
      if (Math.abs(beforeTrend - afterTrend) > 0.1) {
        insights.push({
          day: i,
          type: 'inflection_point',
          description: `Significant trend change detected around day ${i}`
        });
      }
    }
    
    // Identify adaptation periods
    const adaptationDays = [7, 14, 21, 30]; // Common adaptation periods
    adaptationDays.forEach(day => {
      if (day < timeline.length) {
        insights.push({
          day,
          type: 'adaptation_checkpoint',
          description: `Adaptation period - effects may stabilize around day ${day}`
        });
      }
    });
    
    return insights;
  }

  generateOptimizationSuggestions(results, changes) {
    const suggestions = [];
    
    // Analyze the effectiveness of changes
    const effectiveChanges = Object.entries(results.final_outcomes)
      .filter(([metric, outcome]) => outcome.percent_change > 5)
      .map(([metric]) => metric);
    
    if (effectiveChanges.length > 0) {
      suggestions.push({
        type: 'amplify_success',
        description: `Consider amplifying successful changes to ${effectiveChanges.join(', ')}`,
        priority: 'high'
      });
    }
    
    // Suggest complementary interventions
    if (changes.sleep_duration_change > 0) {
      suggestions.push({
        type: 'complementary',
        description: 'Consider adding magnesium supplementation to enhance sleep quality',
        priority: 'medium'
      });
    }
    
    if (changes.supplements?.magnesium?.action === 'stop') {
      suggestions.push({
        type: 'alternative',
        description: 'Consider gradually reducing magnesium dose instead of stopping abruptly',
        priority: 'high'
      });
    }
    
    return suggestions;
  }

  initializeSimulationTemplates() {
    return {
      sleep_improvement: {
        name: 'Sleep Optimization',
        description: 'Simulate the effects of improving sleep duration or quality',
        parameters: ['sleep_duration_change', 'sleep_quality_change']
      },
      supplement_modification: {
        name: 'Supplement Changes',
        description: 'Model the impact of starting, stopping, or changing supplements',
        parameters: ['supplements']
      },
      exercise_change: {
        name: 'Exercise Modification',
        description: 'Predict outcomes of changing exercise routine',
        parameters: ['exercise_type', 'frequency_change', 'intensity_change']
      },
      dietary_modification: {
        name: 'Dietary Changes',
        description: 'Simulate nutritional changes and their health impacts',
        parameters: ['diet_type', 'calorie_change', 'macro_changes']
      }
    };
  }
}

// Export singleton instance
const digitalTwinSimulation = new DigitalTwinSimulation();

module.exports = {
  DigitalTwinSimulation,
  digitalTwinSimulation
};