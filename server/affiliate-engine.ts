/**
 * Affiliate Marketing Engine
 * Handles product recommendations, click tracking, and commission management
 */

import type { Express } from "express";

interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  affiliateUrl: string;
  partner: string;
  commissionRate: number;
  healthBenefits: string[];
  recommendedFor: string[];
}

interface UserHealthMetrics {
  zinc?: number;
  omega3?: number;
  magnesium?: number;
  sleepQuality?: number;
  stressLevel?: number;
  immuneHealth?: number;
}

interface AffiliateClick {
  id: string;
  userId: number;
  productId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  converted?: boolean;
  commissionEarned?: number;
}

export class AffiliateEngine {
  private products: AffiliateProduct[] = [
    {
      id: 'zinc-thorne-001',
      name: 'Zinc Picolinate 25mg',
      brand: 'Thorne Research',
      category: 'immune',
      price: 24.99,
      affiliateUrl: 'https://thorne.com/products/dp/zinc-picolinate?rfsn=healthmap',
      partner: 'thorne',
      commissionRate: 0.15,
      healthBenefits: ['Immune function', 'Wound healing', 'Protein synthesis'],
      recommendedFor: ['Low zinc levels', 'Frequent infections', 'Slow healing']
    },
    {
      id: 'omega3-nordic-001',
      name: 'Ultimate Omega 1280mg',
      brand: 'Nordic Naturals',
      category: 'heart',
      price: 34.95,
      affiliateUrl: 'https://www.iherb.com/pr/nordic-naturals-ultimate-omega?rcode=healthmap',
      partner: 'iherb',
      commissionRate: 0.12,
      healthBenefits: ['Heart health', 'Brain function', 'Anti-inflammatory'],
      recommendedFor: ['High triglycerides', 'Cognitive support', 'Joint health']
    },
    {
      id: 'magnesium-doctors-001',
      name: 'High Absorption Magnesium',
      brand: "Doctor's Best",
      category: 'sleep',
      price: 19.99,
      affiliateUrl: 'https://www.amazon.com/dp/B000BD0RT0?tag=healthmap-20',
      partner: 'amazon',
      commissionRate: 0.08,
      healthBenefits: ['Sleep quality', 'Muscle relaxation', 'Stress reduction'],
      recommendedFor: ['Poor sleep', 'Muscle tension', 'Stress']
    },
    {
      id: 'oura-ring-gen3',
      name: 'Oura Ring Generation 3',
      brand: 'Oura',
      category: 'devices',
      price: 299.00,
      affiliateUrl: 'https://ouraring.com/product/heritage-silver?rfsn=healthmap',
      partner: 'oura',
      commissionRate: 0.05,
      healthBenefits: ['Sleep tracking', 'HRV monitoring', 'Activity tracking'],
      recommendedFor: ['Sleep optimization', 'Recovery tracking', 'Health monitoring']
    }
  ];

  private clicks: AffiliateClick[] = [];

  /**
   * Get personalized product recommendations based on user's health metrics
   */
  getPersonalizedRecommendations(userId: number, healthMetrics: UserHealthMetrics): AffiliateProduct[] {
    const recommendations: Array<AffiliateProduct & { matchScore: number; reason: string }> = [];

    this.products.forEach(product => {
      let matchScore = 0;
      let reasons: string[] = [];

      // Zinc recommendations
      if (product.category === 'immune' && healthMetrics.zinc && healthMetrics.zinc < 70) {
        matchScore += 30;
        reasons.push(`Your zinc levels (${healthMetrics.zinc}μg/dL) are below optimal range`);
      }

      // Omega-3 recommendations
      if (product.category === 'heart' && healthMetrics.omega3 && healthMetrics.omega3 < 5) {
        matchScore += 25;
        reasons.push(`Your omega-3 index (${healthMetrics.omega3}%) could be improved`);
      }

      // Magnesium/Sleep recommendations
      if (product.category === 'sleep' && healthMetrics.sleepQuality && healthMetrics.sleepQuality < 7) {
        matchScore += 35;
        reasons.push(`Your sleep quality score (${healthMetrics.sleepQuality}/10) indicates room for improvement`);
      }

      // Stress-related recommendations
      if (healthMetrics.stressLevel && healthMetrics.stressLevel > 6) {
        if (product.healthBenefits.includes('Stress reduction')) {
          matchScore += 20;
          reasons.push(`Your stress levels (${healthMetrics.stressLevel}/10) are elevated`);
        }
      }

      // Device recommendations for comprehensive tracking
      if (product.category === 'devices') {
        const hasMultipleIssues = [
          healthMetrics.sleepQuality && healthMetrics.sleepQuality < 7,
          healthMetrics.stressLevel && healthMetrics.stressLevel > 6,
          !healthMetrics.zinc || !healthMetrics.omega3
        ].filter(Boolean).length >= 2;

        if (hasMultipleIssues) {
          matchScore += 25;
          reasons.push('Comprehensive tracking could help optimize multiple health areas');
        }
      }

      if (matchScore > 0) {
        recommendations.push({
          ...product,
          matchScore,
          reason: reasons.join('. ')
        });
      }
    });

    // Sort by match score and return top recommendations
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8)
      .map(({ matchScore, reason, ...product }) => product);
  }

  /**
   * Track affiliate click
   */
  trackClick(userId: number, productId: string, ipAddress: string, userAgent: string): string {
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const click: AffiliateClick = {
      id: clickId,
      userId,
      productId,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      converted: false
    };

    this.clicks.push(click);
    
    // In production, this would be stored in database and sent to analytics
    console.log(`Affiliate click tracked: User ${userId} clicked product ${productId}`);
    
    return clickId;
  }

  /**
   * Record conversion (purchase)
   */
  recordConversion(clickId: string, purchaseAmount: number): boolean {
    const click = this.clicks.find(c => c.id === clickId);
    if (!click) return false;

    const product = this.products.find(p => p.id === click.productId);
    if (!product) return false;

    click.converted = true;
    click.commissionEarned = purchaseAmount * product.commissionRate;

    console.log(`Conversion recorded: ${click.commissionEarned} commission earned`);
    return true;
  }

  /**
   * Get click analytics
   */
  getClickAnalytics(userId?: number): any {
    const userClicks = userId ? this.clicks.filter(c => c.userId === userId) : this.clicks;
    
    return {
      totalClicks: userClicks.length,
      conversions: userClicks.filter(c => c.converted).length,
      conversionRate: userClicks.length > 0 ? 
        (userClicks.filter(c => c.converted).length / userClicks.length * 100).toFixed(2) : 0,
      totalCommissions: userClicks
        .filter(c => c.commissionEarned)
        .reduce((sum, c) => sum + (c.commissionEarned || 0), 0).toFixed(2)
    };
  }

  /**
   * Get product effectiveness data from community
   */
  getProductEffectiveness(productId: string): any {
    // Mock community effectiveness data - would come from real user feedback
    const effectivenessData = {
      'zinc-thorne-001': {
        averageImprovement: 42,
        timeToResults: '3-4 weeks',
        userReports: 89,
        satisfactionScore: 4.7
      },
      'omega3-nordic-001': {
        averageImprovement: 38,
        timeToResults: '6-8 weeks',
        userReports: 156,
        satisfactionScore: 4.8
      },
      'magnesium-doctors-001': {
        averageImprovement: 35,
        timeToResults: '1-2 weeks',
        userReports: 67,
        satisfactionScore: 4.6
      },
      'oura-ring-gen3': {
        averageImprovement: 52,
        timeToResults: 'Immediate',
        userReports: 234,
        satisfactionScore: 4.5
      }
    };

    return effectivenessData[productId] || null;
  }
}

export const affiliateEngine = new AffiliateEngine();

/**
 * Register affiliate API routes
 */
export function registerAffiliateRoutes(app: Express): void {
  // Get personalized recommendations
  app.get('/api/affiliate/recommendations', async (req, res) => {
    try {
      const userId = 1; // Would get from authenticated user
      
      // Mock user health metrics - would come from real health data
      const healthMetrics: UserHealthMetrics = {
        zinc: 65, // Below optimal (70-120 μg/dL)
        omega3: 4.2, // Below optimal (>8%)
        sleepQuality: 6.2, // Below optimal (7-9)
        stressLevel: 7.5, // Elevated (>6)
        immuneHealth: 6.8
      };

      const recommendations = affiliateEngine.getPersonalizedRecommendations(userId, healthMetrics);
      
      // Add effectiveness data to recommendations
      const enrichedRecommendations = recommendations.map(product => ({
        ...product,
        userMatch: Math.floor(Math.random() * 20) + 80, // 80-100% match
        effectivenessData: affiliateEngine.getProductEffectiveness(product.id)
      }));

      res.json(enrichedRecommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  });

  // Track affiliate click
  app.post('/api/affiliate/track-click', async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = 1; // Would get from authenticated user
      const ipAddress = req.ip || '0.0.0.0';
      const userAgent = req.get('User-Agent') || '';

      const clickId = affiliateEngine.trackClick(userId, productId, ipAddress, userAgent);
      
      res.json({ success: true, clickId });
    } catch (error) {
      console.error('Error tracking click:', error);
      res.status(500).json({ error: 'Failed to track click' });
    }
  });

  // Submit user feedback
  app.post('/api/affiliate/feedback', async (req, res) => {
    try {
      const { productId, purchased, helpful } = req.body;
      
      // In production, this would store feedback in database
      console.log(`User feedback: Product ${productId}, Purchased: ${purchased}, Helpful: ${helpful}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Get analytics
  app.get('/api/affiliate/analytics', async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const analytics = affiliateEngine.getClickAnalytics(userId);
      
      res.json(analytics);
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });
}