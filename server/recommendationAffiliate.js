/**
 * Recommendation Affiliate Engine
 * Links health metrics to personalized product recommendations with affiliate tracking
 */

class RecommendationAffiliate {
  constructor() {
    this.healthMetricThresholds = {
      zinc: { low: 70, optimal: 120, unit: 'μg/dL' },
      omega3: { low: 5, optimal: 8, unit: '%' },
      vitaminD: { low: 30, optimal: 50, unit: 'ng/mL' },
      magnesium: { low: 1.7, optimal: 2.2, unit: 'mg/dL' },
      iron: { low: 60, optimal: 170, unit: 'μg/dL' },
      b12: { low: 300, optimal: 900, unit: 'pg/mL' },
      sleepQuality: { low: 6, optimal: 8, unit: 'score' },
      stressLevel: { high: 7, optimal: 4, unit: 'score' },
      heartRateVariability: { low: 25, optimal: 50, unit: 'ms' }
    };

    this.affiliateProducts = [
      {
        id: 'thorne-zinc-picolinate',
        name: 'Zinc Picolinate 25mg',
        brand: 'Thorne Research',
        category: 'minerals',
        price: 24.99,
        currency: 'USD',
        affiliateUrl: 'https://thorne.com/products/dp/zinc-picolinate',
        affiliateCode: 'HEALTHMAP2024',
        commissionRate: 0.15,
        targetedMetrics: ['zinc'],
        healthBenefits: [
          'Supports immune function',
          'Aids in wound healing',
          'Essential for protein synthesis',
          'Supports reproductive health'
        ],
        recommendationCriteria: {
          zinc: { operator: '<', value: 70 },
          symptoms: ['frequent infections', 'slow healing', 'hair loss']
        },
        evidenceLevel: 'high',
        userReviews: {
          averageRating: 4.7,
          totalReviews: 1247,
          effectivenessReports: {
            improved: 89,
            timeToResults: '3-4 weeks',
            averageImprovement: 42
          }
        }
      },
      {
        id: 'nordic-ultimate-omega',
        name: 'Ultimate Omega 1280mg',
        brand: 'Nordic Naturals',
        category: 'fatty_acids',
        price: 34.95,
        currency: 'USD',
        affiliateUrl: 'https://www.iherb.com/pr/nordic-naturals-ultimate-omega',
        affiliateCode: 'HEALTHMAP15',
        commissionRate: 0.12,
        targetedMetrics: ['omega3', 'heartRateVariability'],
        healthBenefits: [
          'Supports heart health',
          'Promotes brain function',
          'Reduces inflammation',
          'Supports joint health'
        ],
        recommendationCriteria: {
          omega3: { operator: '<', value: 5 },
          heartRateVariability: { operator: '<', value: 25 }
        },
        evidenceLevel: 'high',
        userReviews: {
          averageRating: 4.8,
          totalReviews: 2156,
          effectivenessReports: {
            improved: 78,
            timeToResults: '6-8 weeks',
            averageImprovement: 35
          }
        }
      },
      {
        id: 'doctors-best-magnesium',
        name: 'High Absorption Magnesium',
        brand: "Doctor's Best",
        category: 'minerals',
        price: 19.99,
        currency: 'USD',
        affiliateUrl: 'https://www.amazon.com/dp/B000BD0RT0',
        affiliateCode: 'healthmap-20',
        commissionRate: 0.08,
        targetedMetrics: ['magnesium', 'sleepQuality', 'stressLevel'],
        healthBenefits: [
          'Supports muscle relaxation',
          'Promotes better sleep',
          'Reduces stress and anxiety',
          'Supports bone health'
        ],
        recommendationCriteria: {
          magnesium: { operator: '<', value: 1.7 },
          sleepQuality: { operator: '<', value: 6 },
          stressLevel: { operator: '>', value: 7 }
        },
        evidenceLevel: 'moderate',
        userReviews: {
          averageRating: 4.6,
          totalReviews: 987,
          effectivenessReports: {
            improved: 71,
            timeToResults: '1-2 weeks',
            averageImprovement: 28
          }
        }
      },
      {
        id: 'oura-ring-gen3',
        name: 'Oura Ring Generation 3',
        brand: 'Oura',
        category: 'wearables',
        price: 299.00,
        currency: 'USD',
        affiliateUrl: 'https://ouraring.com/product/heritage-silver',
        affiliateCode: 'HEALTHMAP50',
        commissionRate: 0.05,
        targetedMetrics: ['sleepQuality', 'heartRateVariability', 'stressLevel'],
        healthBenefits: [
          'Advanced sleep tracking',
          'Heart rate variability monitoring',
          'Recovery insights',
          'Activity optimization'
        ],
        recommendationCriteria: {
          multipleMetrics: true,
          conditions: [
            { metric: 'sleepQuality', operator: '<', value: 6 },
            { metric: 'heartRateVariability', operator: '<', value: 25 }
          ]
        },
        evidenceLevel: 'high',
        userReviews: {
          averageRating: 4.5,
          totalReviews: 3421,
          effectivenessReports: {
            improved: 85,
            timeToResults: 'immediate',
            averageImprovement: 52
          }
        }
      },
      {
        id: 'vitamin-d3-k2',
        name: 'Vitamin D3 + K2 5000 IU',
        brand: 'Sports Research',
        category: 'vitamins',
        price: 29.95,
        currency: 'USD',
        affiliateUrl: 'https://www.amazon.com/dp/B01N4FL1RB',
        affiliateCode: 'healthmap-20',
        commissionRate: 0.08,
        targetedMetrics: ['vitaminD'],
        healthBenefits: [
          'Supports bone health',
          'Enhances immune function',
          'Improves mood and energy',
          'Supports cardiovascular health'
        ],
        recommendationCriteria: {
          vitaminD: { operator: '<', value: 30 }
        },
        evidenceLevel: 'high',
        userReviews: {
          averageRating: 4.7,
          totalReviews: 1834,
          effectivenessReports: {
            improved: 76,
            timeToResults: '4-6 weeks',
            averageImprovement: 45
          }
        }
      }
    ];

    this.clickTracking = [];
    this.conversionTracking = [];
    this.userRecommendationHistory = new Map();
  }

  /**
   * Generate personalized product recommendations based on health metrics
   */
  generateRecommendations(userId, healthMetrics, symptoms = [], preferences = {}) {
    const recommendations = [];
    const analysisResults = this.analyzeHealthMetrics(healthMetrics);

    this.affiliateProducts.forEach(product => {
      const matchScore = this.calculateProductMatch(product, healthMetrics, symptoms, analysisResults);
      
      if (matchScore.score > 0) {
        const recommendation = {
          ...product,
          matchScore: matchScore.score,
          matchReasons: matchScore.reasons,
          urgencyLevel: matchScore.urgencyLevel,
          expectedBenefit: this.calculateExpectedBenefit(product, healthMetrics),
          personalizedMessage: this.generatePersonalizedMessage(product, healthMetrics, analysisResults),
          estimatedImpact: this.estimateHealthImpact(product, healthMetrics)
        };

        recommendations.push(recommendation);
      }
    });

    // Sort by match score and filter top recommendations
    const sortedRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // Store recommendation history
    this.userRecommendationHistory.set(userId, {
      timestamp: new Date(),
      recommendations: sortedRecommendations,
      healthMetrics: healthMetrics,
      symptoms: symptoms
    });

    return sortedRecommendations;
  }

  /**
   * Analyze health metrics against optimal ranges
   */
  analyzeHealthMetrics(healthMetrics) {
    const analysis = {
      deficiencies: [],
      concerns: [],
      priorities: []
    };

    Object.entries(healthMetrics).forEach(([metric, value]) => {
      const threshold = this.healthMetricThresholds[metric];
      if (!threshold) return;

      if (metric === 'stressLevel') {
        if (value > threshold.high) {
          analysis.concerns.push({
            metric,
            value,
            status: 'elevated',
            severity: this.calculateSeverity(value, threshold.high, threshold.optimal, true)
          });
        }
      } else {
        if (value < threshold.low) {
          analysis.deficiencies.push({
            metric,
            value,
            status: 'deficient',
            severity: this.calculateSeverity(value, threshold.low, threshold.optimal, false)
          });
        }
      }
    });

    // Prioritize by severity
    analysis.priorities = [...analysis.deficiencies, ...analysis.concerns]
      .sort((a, b) => b.severity - a.severity);

    return analysis;
  }

  /**
   * Calculate how well a product matches user's health profile
   */
  calculateProductMatch(product, healthMetrics, symptoms, analysisResults) {
    let score = 0;
    const reasons = [];
    let urgencyLevel = 'low';

    // Check metric-based criteria
    if (product.recommendationCriteria.multipleMetrics) {
      const conditionsMet = product.recommendationCriteria.conditions.filter(condition => {
        const metricValue = healthMetrics[condition.metric];
        if (metricValue === undefined) return false;

        switch (condition.operator) {
          case '<': return metricValue < condition.value;
          case '>': return metricValue > condition.value;
          case '<=': return metricValue <= condition.value;
          case '>=': return metricValue >= condition.value;
          default: return false;
        }
      });

      if (conditionsMet.length >= 2) {
        score += 40;
        urgencyLevel = 'medium';
        reasons.push(`Multiple health metrics indicate potential benefit`);
      }
    } else {
      // Single metric criteria
      Object.entries(product.recommendationCriteria).forEach(([metric, criteria]) => {
        if (metric === 'symptoms') return; // Handle separately
        
        const metricValue = healthMetrics[metric];
        if (metricValue === undefined) return;

        let matches = false;
        switch (criteria.operator) {
          case '<': matches = metricValue < criteria.value; break;
          case '>': matches = metricValue > criteria.value; break;
          case '<=': matches = metricValue <= criteria.value; break;
          case '>=': matches = metricValue >= criteria.value; break;
        }

        if (matches) {
          const threshold = this.healthMetricThresholds[metric];
          const severity = this.calculateSeverity(metricValue, criteria.value, threshold?.optimal, criteria.operator === '>');
          
          score += 20 + (severity * 20);
          if (severity > 0.7) urgencyLevel = 'high';
          else if (severity > 0.4) urgencyLevel = 'medium';
          
          reasons.push(`Your ${metric} level (${metricValue}) indicates potential deficiency`);
        }
      });
    }

    // Check symptom matching
    if (product.recommendationCriteria.symptoms && symptoms.length > 0) {
      const matchingSymptoms = product.recommendationCriteria.symptoms.filter(productSymptom =>
        symptoms.some(userSymptom => 
          userSymptom.toLowerCase().includes(productSymptom.toLowerCase())
        )
      );

      if (matchingSymptoms.length > 0) {
        score += 15 * matchingSymptoms.length;
        reasons.push(`Matches your reported symptoms: ${matchingSymptoms.join(', ')}`);
      }
    }

    // Boost score based on evidence level
    const evidenceBonus = {
      'high': 10,
      'moderate': 5,
      'limited': 0
    };
    score += evidenceBonus[product.evidenceLevel] || 0;

    // Boost score based on user reviews and effectiveness
    if (product.userReviews.effectivenessReports.improved > 70) {
      score += 5;
      reasons.push(`${product.userReviews.effectivenessReports.improved}% of users reported improvement`);
    }

    return {
      score: Math.min(100, score),
      reasons,
      urgencyLevel
    };
  }

  /**
   * Calculate severity of deficiency or elevation
   */
  calculateSeverity(currentValue, threshold, optimal, isReverse = false) {
    if (isReverse) {
      // For metrics where higher is worse (like stress)
      if (currentValue <= optimal) return 0;
      return Math.min(1, (currentValue - optimal) / (threshold - optimal));
    } else {
      // For metrics where lower is worse (like vitamins)
      if (currentValue >= optimal) return 0;
      return Math.min(1, (threshold - currentValue) / (threshold - optimal));
    }
  }

  /**
   * Calculate expected benefit percentage
   */
  calculateExpectedBenefit(product, healthMetrics) {
    const targetMetrics = product.targetedMetrics;
    let totalDeficit = 0;
    let metricsCount = 0;

    targetMetrics.forEach(metric => {
      const value = healthMetrics[metric];
      const threshold = this.healthMetricThresholds[metric];
      
      if (value !== undefined && threshold) {
        const deficit = this.calculateSeverity(value, threshold.low, threshold.optimal, metric === 'stressLevel');
        totalDeficit += deficit;
        metricsCount++;
      }
    });

    if (metricsCount === 0) return 25; // Default expectation

    const averageDeficit = totalDeficit / metricsCount;
    const effectivenessRate = product.userReviews.effectivenessReports.improved / 100;
    
    return Math.round(averageDeficit * effectivenessRate * 60); // Max 60% improvement expectation
  }

  /**
   * Generate personalized message for recommendation
   */
  generatePersonalizedMessage(product, healthMetrics, analysisResults) {
    const deficientMetrics = analysisResults.deficiencies.map(d => d.metric);
    const productTargets = product.targetedMetrics.filter(metric => deficientMetrics.includes(metric));

    if (productTargets.length > 0) {
      const metricNames = productTargets.map(metric => metric.replace(/([A-Z])/g, ' $1').toLowerCase());
      return `Based on your ${metricNames.join(' and ')} levels, this supplement could help address your specific deficiencies.`;
    }

    return `This product aligns with your health goals and has shown positive results in similar health profiles.`;
  }

  /**
   * Estimate potential health impact timeline
   */
  estimateHealthImpact(product, healthMetrics) {
    const timeToResults = product.userReviews.effectivenessReports.timeToResults;
    const expectedImprovement = this.calculateExpectedBenefit(product, healthMetrics);
    
    return {
      timeframe: timeToResults,
      expectedImprovement: `${expectedImprovement}%`,
      confidence: product.evidenceLevel === 'high' ? 'High' : product.evidenceLevel === 'moderate' ? 'Medium' : 'Low'
    };
  }

  /**
   * Track affiliate click
   */
  trackClick(userId, productId, source = 'recommendation') {
    const click = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      source,
      timestamp: new Date(),
      ipAddress: '0.0.0.0', // Would be actual IP
      userAgent: 'healthmap-app',
      converted: false
    };

    this.clickTracking.push(click);
    
    console.log(`Affiliate click tracked: User ${userId} clicked ${productId}`);
    return click.id;
  }

  /**
   * Track conversion (purchase)
   */
  trackConversion(clickId, purchaseAmount, orderId) {
    const click = this.clickTracking.find(c => c.id === clickId);
    if (!click) return false;

    const product = this.affiliateProducts.find(p => p.id === click.productId);
    if (!product) return false;

    const conversion = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clickId,
      userId: click.userId,
      productId: click.productId,
      purchaseAmount,
      orderId,
      commission: purchaseAmount * product.commissionRate,
      timestamp: new Date()
    };

    click.converted = true;
    this.conversionTracking.push(conversion);

    console.log(`Conversion tracked: ${conversion.commission.toFixed(2)} commission earned`);
    return conversion;
  }

  /**
   * Get user's recommendation history
   */
  getUserRecommendationHistory(userId, limit = 10) {
    const history = this.userRecommendationHistory.get(userId);
    if (!history) return [];

    return history.recommendations.slice(0, limit);
  }

  /**
   * Get affiliate performance analytics
   */
  getAffiliateAnalytics(period = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    const recentClicks = this.clickTracking.filter(click => click.timestamp >= cutoffDate);
    const recentConversions = this.conversionTracking.filter(conv => conv.timestamp >= cutoffDate);

    return {
      period: `${period} days`,
      totalClicks: recentClicks.length,
      totalConversions: recentConversions.length,
      conversionRate: recentClicks.length > 0 ? 
        ((recentConversions.length / recentClicks.length) * 100).toFixed(2) : 0,
      totalCommissions: recentConversions.reduce((sum, conv) => sum + conv.commission, 0).toFixed(2),
      topProducts: this.getTopPerformingProducts(recentConversions),
      clicksBySource: this.analyzeClickSources(recentClicks)
    };
  }

  getTopPerformingProducts(conversions) {
    const productPerformance = {};
    
    conversions.forEach(conv => {
      if (!productPerformance[conv.productId]) {
        productPerformance[conv.productId] = {
          conversions: 0,
          commission: 0
        };
      }
      productPerformance[conv.productId].conversions++;
      productPerformance[conv.productId].commission += conv.commission;
    });

    return Object.entries(productPerformance)
      .sort((a, b) => b[1].commission - a[1].commission)
      .slice(0, 5)
      .map(([productId, stats]) => ({ productId, ...stats }));
  }

  analyzeClickSources(clicks) {
    const sources = {};
    clicks.forEach(click => {
      sources[click.source] = (sources[click.source] || 0) + 1;
    });
    return sources;
  }
}

// Export singleton instance
const recommendationAffiliate = new RecommendationAffiliate();

module.exports = {
  RecommendationAffiliate,
  recommendationAffiliate
};