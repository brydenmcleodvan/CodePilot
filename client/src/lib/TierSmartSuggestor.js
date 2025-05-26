/**
 * Tier Smart Suggestor
 * Intelligently recommends subscription tiers based on user goals, usage patterns, and health data
 */

export class TierSmartSuggestor {
  constructor() {
    // Feature mapping to subscription tiers
    this.featureTiers = {
      // Basic features (included in all plans)
      'basic_tracking': 'basic',
      'manual_entry': 'basic',
      'simple_charts': 'basic',
      
      // Premium features
      'ai_insights': 'premium',
      'device_sync': 'premium',
      'advanced_analytics': 'premium',
      'telehealth_basic': 'premium',
      'goal_tracking': 'premium',
      'health_reports': 'premium',
      
      // Pro features
      'unlimited_telehealth': 'pro',
      'family_management': 'pro',
      'data_export': 'pro',
      'priority_support': 'pro',
      'api_access': 'pro',
      'white_label': 'pro'
    };

    // Goal categories that suggest specific tiers
    this.goalCategories = {
      highTouch: [
        'telehealth_consultations',
        'medical_coaching',
        'chronic_disease_management',
        'family_health_tracking',
        'doctor_integration',
        'health_data_sharing'
      ],
      advanced: [
        'long_term_tracking',
        'ai_health_coaching',
        'predictive_analytics',
        'device_integration',
        'comprehensive_reports',
        'goal_optimization'
      ],
      basic: [
        'weight_tracking',
        'step_counting',
        'basic_logging',
        'simple_reminders'
      ]
    };
  }

  /**
   * Suggest optimal subscription tier based on user goals and usage patterns
   */
  suggestPlan(userGoals = [], currentUsage = {}, userProfile = {}) {
    const analysis = this.analyzeUserNeeds(userGoals, currentUsage, userProfile);
    
    return {
      recommendedTier: analysis.suggestedTier,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      features: analysis.recommendedFeatures,
      potentialSavings: analysis.potentialSavings,
      urgency: analysis.urgency
    };
  }

  /**
   * Analyze user needs to determine optimal tier
   */
  analyzeUserNeeds(userGoals, currentUsage, userProfile) {
    let score = { basic: 0, premium: 0, pro: 0 };
    let reasoning = [];
    let recommendedFeatures = [];
    let urgency = 'low';

    // Analyze goals
    const goalAnalysis = this.analyzeGoals(userGoals);
    score.basic += goalAnalysis.basic;
    score.premium += goalAnalysis.premium;
    score.pro += goalAnalysis.pro;
    reasoning.push(...goalAnalysis.reasons);

    // Analyze current usage patterns
    const usageAnalysis = this.analyzeUsage(currentUsage);
    score.premium += usageAnalysis.premium;
    score.pro += usageAnalysis.pro;
    reasoning.push(...usageAnalysis.reasons);

    // Analyze user profile for additional insights
    const profileAnalysis = this.analyzeProfile(userProfile);
    score.premium += profileAnalysis.premium;
    score.pro += profileAnalysis.pro;
    reasoning.push(...profileAnalysis.reasons);

    // Determine urgency based on blocked features
    if (currentUsage.blockedFeatureAttempts > 3) {
      urgency = 'high';
      reasoning.push('You\'ve tried to access premium features multiple times');
    } else if (currentUsage.blockedFeatureAttempts > 0) {
      urgency = 'medium';
    }

    // Calculate recommended tier
    const maxScore = Math.max(score.basic, score.premium, score.pro);
    let suggestedTier = 'basic';
    
    if (score.pro === maxScore && score.pro > 3) {
      suggestedTier = 'pro';
      recommendedFeatures = this.getProFeatures();
    } else if (score.premium === maxScore && score.premium > 2) {
      suggestedTier = 'premium';
      recommendedFeatures = this.getPremiumFeatures();
    }

    // Calculate confidence based on score differential
    const confidence = this.calculateConfidence(score, suggestedTier);

    // Calculate potential savings for annual plans
    const potentialSavings = this.calculateSavings(suggestedTier);

    return {
      suggestedTier,
      confidence,
      reasoning: reasoning.slice(0, 3), // Top 3 reasons
      recommendedFeatures,
      potentialSavings,
      urgency
    };
  }

  /**
   * Analyze user goals to score different tiers
   */
  analyzeGoals(userGoals) {
    let score = { basic: 0, premium: 0, pro: 0 };
    let reasons = [];

    userGoals.forEach(goal => {
      // Check high-touch goals (suggest Pro)
      if (this.goalCategories.highTouch.some(cat => goal.toLowerCase().includes(cat.replace('_', ' ')))) {
        score.pro += 2;
        score.premium += 1;
        reasons.push(`Goal "${goal}" benefits from professional features`);
      }
      
      // Check advanced goals (suggest Premium)
      else if (this.goalCategories.advanced.some(cat => goal.toLowerCase().includes(cat.replace('_', ' ')))) {
        score.premium += 2;
        score.pro += 1;
        reasons.push(`Goal "${goal}" requires advanced analytics`);
      }
      
      // Basic goals
      else if (this.goalCategories.basic.some(cat => goal.toLowerCase().includes(cat.replace('_', ' ')))) {
        score.basic += 1;
        reasons.push(`Goal "${goal}" is well-supported by basic features`);
      }
    });

    // Multiple goals suggest higher tiers
    if (userGoals.length > 5) {
      score.premium += 1;
      score.pro += 1;
      reasons.push('Multiple health goals benefit from comprehensive tracking');
    }

    return { ...score, reasons };
  }

  /**
   * Analyze current usage patterns
   */
  analyzeUsage(currentUsage) {
    let score = { premium: 0, pro: 0 };
    let reasons = [];

    // Check for feature usage that suggests upgrades
    if (currentUsage.aiInsightRequests > 5) {
      score.premium += 2;
      reasons.push('High AI insight usage indicates premium value');
    }

    if (currentUsage.telehealthAttempts > 2) {
      score.premium += 2;
      score.pro += 1;
      reasons.push('Multiple telehealth attempts suggest consultation needs');
    }

    if (currentUsage.dataExportAttempts > 1) {
      score.premium += 1;
      score.pro += 2;
      reasons.push('Data export attempts indicate professional use case');
    }

    if (currentUsage.familyMemberRequests > 0) {
      score.pro += 3;
      reasons.push('Family management requires Pro subscription');
    }

    // Daily usage patterns
    if (currentUsage.dailyActiveUsage > 30) { // 30+ minutes daily
      score.premium += 1;
      reasons.push('High daily usage benefits from premium features');
    }

    return { premium: score.premium, pro: score.pro, reasons };
  }

  /**
   * Analyze user profile for tier suggestions
   */
  analyzeProfile(userProfile) {
    let score = { premium: 0, pro: 0 };
    let reasons = [];

    // Age-based suggestions
    if (userProfile.age > 50) {
      score.premium += 1;
      score.pro += 1;
      reasons.push('Comprehensive health tracking becomes more valuable with age');
    }

    // Health conditions suggest higher tiers
    if (userProfile.chronicConditions && userProfile.chronicConditions.length > 0) {
      score.premium += 2;
      score.pro += 1;
      reasons.push('Chronic conditions benefit from advanced monitoring');
    }

    // Family size
    if (userProfile.familySize > 2) {
      score.pro += 2;
      reasons.push('Large families benefit from family management features');
    }

    // Professional use (healthcare workers, etc.)
    if (userProfile.occupation && ['doctor', 'nurse', 'healthcare', 'medical'].some(term => 
      userProfile.occupation.toLowerCase().includes(term))) {
      score.pro += 2;
      reasons.push('Healthcare professionals benefit from Pro data export features');
    }

    return { premium: score.premium, pro: score.pro, reasons };
  }

  /**
   * Calculate confidence in recommendation
   */
  calculateConfidence(scores, recommendedTier) {
    const recommendedScore = scores[recommendedTier];
    const otherScores = Object.values(scores).filter(score => score !== recommendedScore);
    const maxOtherScore = Math.max(...otherScores);
    
    if (recommendedScore === 0) return 30;
    if (recommendedScore > maxOtherScore * 2) return 95;
    if (recommendedScore > maxOtherScore * 1.5) return 80;
    if (recommendedScore > maxOtherScore) return 65;
    
    return 50;
  }

  /**
   * Calculate potential savings for annual subscriptions
   */
  calculateSavings(tier) {
    const monthlyPrices = {
      premium: 14.99,
      pro: 29.99
    };
    
    const annualDiscount = 0.2; // 20% discount for annual
    
    if (!monthlyPrices[tier]) return null;
    
    const monthlyTotal = monthlyPrices[tier] * 12;
    const annualPrice = monthlyTotal * (1 - annualDiscount);
    const savings = monthlyTotal - annualPrice;
    
    return {
      monthly: monthlyPrices[tier],
      annual: annualPrice,
      savings: savings.toFixed(2),
      percentage: (annualDiscount * 100).toFixed(0)
    };
  }

  /**
   * Get Premium tier features
   */
  getPremiumFeatures() {
    return [
      'Unlimited health metrics tracking',
      'AI-powered insights and recommendations',
      'Device integrations (Apple Watch, Fitbit)',
      'Advanced analytics and trends',
      '2 telehealth consultations per month',
      'Personalized health goals',
      '1 year data retention'
    ];
  }

  /**
   * Get Pro tier features
   */
  getProFeatures() {
    return [
      'Everything in Premium',
      'Unlimited telehealth consultations',
      'Advanced AI health coaching',
      'Family health management (up to 4 members)',
      'Priority customer support',
      'Health data export and portability',
      'Unlimited data retention',
      'Early access to new features'
    ];
  }

  /**
   * Get personalized upgrade message
   */
  getUpgradeMessage(analysis) {
    const { recommendedTier, reasoning, confidence } = analysis;
    
    if (confidence < 50) {
      return `Based on your activity, you might benefit from ${recommendedTier}. ${reasoning[0] || 'Consider exploring premium features.'} Would you like to learn more?`;
    }
    
    if (recommendedTier === 'pro') {
      return `Your usage patterns strongly suggest Pro would be perfect for you. ${reasoning[0] || 'You\'re ready for our most comprehensive health platform.'} Upgrade now and save 20% with annual billing!`;
    }
    
    if (recommendedTier === 'premium') {
      return `Premium appears to be an excellent fit for your health goals. ${reasoning[0] || 'Unlock AI insights and telehealth consultations.'} Try it risk-free!`;
    }
    
    return `Continue enjoying the basic features, and upgrade anytime as your health journey evolves!`;
  }
}

// Export singleton instance
export const tierSmartSuggestor = new TierSmartSuggestor();

// Convenience functions
export function suggestPlan(userGoals, currentUsage = {}, userProfile = {}) {
  return tierSmartSuggestor.suggestPlan(userGoals, currentUsage, userProfile);
}

export function getUpgradeRecommendation(userGoals, currentUsage = {}, userProfile = {}) {
  const analysis = tierSmartSuggestor.suggestPlan(userGoals, currentUsage, userProfile);
  return tierSmartSuggestor.getUpgradeMessage(analysis);
}