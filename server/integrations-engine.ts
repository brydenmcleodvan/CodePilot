/**
 * Integrations & Marketplace Engine
 * Connects with major health devices and provides personalized product recommendations
 * Supports Garmin, WHOOP, Samsung Health with affiliate revenue integration
 */

import { storage } from './storage';
import { HealthMetric } from '@shared/schema';

export interface HealthIntegration {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'health_app' | 'medical_device';
  provider: 'garmin' | 'whoop' | 'samsung' | 'apple' | 'fitbit' | 'oura' | 'dexcom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: Date;
  dataTypes: string[];
  apiEndpoint?: string;
  credentials?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  permissions: string[];
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: 'supplements' | 'sleep_aids' | 'fitness_equipment' | 'health_monitoring' | 'nutrition';
  description: string;
  price: number;
  affiliateLink: string;
  affiliateCommission: number;
  rating: number;
  reviewCount: number;
  brand: string;
  imageUrl: string;
  healthBenefits: string[];
  targetConditions: string[];
  recommendationTriggers: {
    metricType: string;
    condition: 'low' | 'high' | 'irregular' | 'improving' | 'declining';
    threshold?: number;
  }[];
  featured: boolean;
}

export interface PersonalizedRecommendation {
  productId: string;
  product: MarketplaceProduct;
  relevanceScore: number;
  reasoning: string;
  healthDataTrigger: {
    metricType: string;
    currentValue: number;
    targetValue: number;
    trend: string;
  };
  urgency: 'high' | 'medium' | 'low';
  estimatedBenefit: string;
}

export class IntegrationsEngine {

  /**
   * Get all available integrations for a user
   */
  async getUserIntegrations(userId: number): Promise<HealthIntegration[]> {
    // In a real implementation, this would query user's connected integrations
    return [
      {
        id: 'garmin_connect',
        name: 'Garmin Connect',
        type: 'fitness_tracker',
        provider: 'garmin',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dataTypes: ['steps', 'heart_rate', 'sleep', 'exercise', 'stress'],
        syncFrequency: 'hourly',
        permissions: ['read_health_data', 'read_activity_data']
      },
      {
        id: 'whoop_4',
        name: 'WHOOP 4.0',
        type: 'fitness_tracker',
        provider: 'whoop',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dataTypes: ['heart_rate_variability', 'sleep', 'recovery', 'strain'],
        syncFrequency: 'realtime',
        permissions: ['read_health_data', 'read_recovery_data']
      },
      {
        id: 'samsung_health',
        name: 'Samsung Health',
        type: 'health_app',
        provider: 'samsung',
        status: 'pending',
        lastSync: new Date(),
        dataTypes: ['steps', 'sleep', 'heart_rate', 'weight', 'nutrition'],
        syncFrequency: 'daily',
        permissions: ['read_health_data']
      }
    ];
  }

  /**
   * Connect a new health integration
   */
  async connectIntegration(userId: number, provider: string, authCode: string): Promise<HealthIntegration> {
    // Simulate OAuth flow with health providers
    const integration: HealthIntegration = {
      id: `${provider}_${Date.now()}`,
      name: this.getProviderName(provider),
      type: this.getProviderType(provider),
      provider: provider as any,
      status: 'connected',
      lastSync: new Date(),
      dataTypes: this.getProviderDataTypes(provider),
      credentials: {
        accessToken: `token_${authCode}_${Date.now()}`,
        refreshToken: `refresh_${authCode}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      syncFrequency: 'hourly',
      permissions: ['read_health_data']
    };

    // Start initial data sync
    await this.syncIntegrationData(userId, integration);

    return integration;
  }

  /**
   * Sync data from a health integration
   */
  async syncIntegrationData(userId: number, integration: HealthIntegration): Promise<void> {
    try {
      switch (integration.provider) {
        case 'garmin':
          await this.syncGarminData(userId, integration);
          break;
        case 'whoop':
          await this.syncWhoopData(userId, integration);
          break;
        case 'samsung':
          await this.syncSamsungHealthData(userId, integration);
          break;
      }
      
      integration.lastSync = new Date();
      integration.status = 'connected';
    } catch (error) {
      console.error(`Error syncing ${integration.provider} data:`, error);
      integration.status = 'error';
    }
  }

  /**
   * Get marketplace products
   */
  async getMarketplaceProducts(category?: string): Promise<MarketplaceProduct[]> {
    const allProducts: MarketplaceProduct[] = [
      {
        id: 'zinc_supplement_thorne',
        name: 'Thorne Zinc Bisglycinate',
        category: 'supplements',
        description: 'High-absorption zinc supplement for immune support and wound healing',
        price: 24.99,
        affiliateLink: 'https://affiliate.thorne.com/zinc-bisglycinate',
        affiliateCommission: 0.15,
        rating: 4.8,
        reviewCount: 1247,
        brand: 'Thorne',
        imageUrl: '/products/thorne-zinc.jpg',
        healthBenefits: ['Immune system support', 'Wound healing', 'Protein synthesis'],
        targetConditions: ['Low zinc levels', 'Frequent infections', 'Slow wound healing'],
        recommendationTriggers: [
          { metricType: 'zinc_levels', condition: 'low', threshold: 70 },
          { metricType: 'immune_markers', condition: 'declining' }
        ],
        featured: true
      },
      {
        id: 'blue_light_glasses_felix',
        name: 'Felix Gray Blue Light Blocking Glasses',
        category: 'sleep_aids',
        description: 'Computer glasses that filter blue light to improve sleep quality',
        price: 95.00,
        affiliateLink: 'https://affiliate.felixgray.com/blue-light-glasses',
        affiliateCommission: 0.12,
        rating: 4.6,
        reviewCount: 892,
        brand: 'Felix Gray',
        imageUrl: '/products/felix-gray-glasses.jpg',
        healthBenefits: ['Better sleep quality', 'Reduced eye strain', 'Improved melatonin production'],
        targetConditions: ['Poor sleep quality', 'Digital eye strain', 'Irregular sleep patterns'],
        recommendationTriggers: [
          { metricType: 'sleep_quality', condition: 'low', threshold: 6 },
          { metricType: 'screen_time', condition: 'high', threshold: 8 }
        ],
        featured: true
      },
      {
        id: 'magnesium_calm',
        name: 'Natural Calm Magnesium Supplement',
        category: 'supplements',
        description: 'Ionic magnesium citrate powder for relaxation and sleep support',
        price: 19.99,
        affiliateLink: 'https://affiliate.naturalcalm.com/magnesium',
        affiliateCommission: 0.18,
        rating: 4.7,
        reviewCount: 2156,
        brand: 'Natural Vitality',
        imageUrl: '/products/natural-calm-magnesium.jpg',
        healthBenefits: ['Muscle relaxation', 'Better sleep', 'Stress reduction'],
        targetConditions: ['Muscle tension', 'Sleep difficulties', 'High stress levels'],
        recommendationTriggers: [
          { metricType: 'stress_level', condition: 'high', threshold: 7 },
          { metricType: 'sleep_duration', condition: 'low', threshold: 6 }
        ],
        featured: false
      },
      {
        id: 'sleep_mask_tempur',
        name: 'Tempur-Pedic Sleep Mask',
        category: 'sleep_aids',
        description: 'Memory foam sleep mask for complete darkness and comfort',
        price: 29.99,
        affiliateLink: 'https://affiliate.tempurpedic.com/sleep-mask',
        affiliateCommission: 0.10,
        rating: 4.5,
        reviewCount: 634,
        brand: 'Tempur-Pedic',
        imageUrl: '/products/tempur-sleep-mask.jpg',
        healthBenefits: ['Complete darkness', 'Comfortable fit', 'Improved sleep onset'],
        targetConditions: ['Light sensitivity', 'Travel sleep issues', 'Early morning wake-ups'],
        recommendationTriggers: [
          { metricType: 'sleep_efficiency', condition: 'low', threshold: 80 },
          { metricType: 'sleep_onset_time', condition: 'high', threshold: 30 }
        ],
        featured: false
      },
      {
        id: 'fitness_tracker_garmin',
        name: 'Garmin Vivosmart 5',
        category: 'health_monitoring',
        description: 'Advanced fitness tracker with health monitoring features',
        price: 149.99,
        affiliateLink: 'https://affiliate.garmin.com/vivosmart-5',
        affiliateCommission: 0.08,
        rating: 4.4,
        reviewCount: 1089,
        brand: 'Garmin',
        imageUrl: '/products/garmin-vivosmart.jpg',
        healthBenefits: ['Continuous health monitoring', 'Activity tracking', 'Sleep analysis'],
        targetConditions: ['Need for health tracking', 'Low activity levels', 'Sleep monitoring'],
        recommendationTriggers: [
          { metricType: 'data_gaps', condition: 'high' },
          { metricType: 'engagement', condition: 'declining' }
        ],
        featured: true
      }
    ];

    return category 
      ? allProducts.filter(p => p.category === category)
      : allProducts;
  }

  /**
   * Generate personalized product recommendations based on health data
   */
  async generatePersonalizedRecommendations(userId: number): Promise<PersonalizedRecommendation[]> {
    const healthMetrics = await storage.getHealthMetrics(userId);
    const products = await this.getMarketplaceProducts();
    const recommendations: PersonalizedRecommendation[] = [];

    // Analyze recent health data
    const recentMetrics = healthMetrics.filter(m => {
      const daysDiff = (new Date().getTime() - m.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    for (const product of products) {
      for (const trigger of product.recommendationTriggers) {
        const relevantMetrics = recentMetrics.filter(m => m.metricType === trigger.metricType);
        
        if (relevantMetrics.length > 0) {
          const avgValue = relevantMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0) / relevantMetrics.length;
          const shouldRecommend = this.evaluateTrigger(trigger, avgValue);
          
          if (shouldRecommend) {
            const recommendation: PersonalizedRecommendation = {
              productId: product.id,
              product,
              relevanceScore: this.calculateRelevanceScore(trigger, avgValue, product),
              reasoning: this.generateRecommendationReasoning(trigger, avgValue, product),
              healthDataTrigger: {
                metricType: trigger.metricType,
                currentValue: avgValue,
                targetValue: trigger.threshold || 0,
                trend: this.calculateTrend(relevantMetrics)
              },
              urgency: this.calculateUrgency(trigger, avgValue),
              estimatedBenefit: this.estimateBenefit(product, trigger)
            };
            
            recommendations.push(recommendation);
          }
        }
      }
    }

    // Sort by relevance score and return top recommendations
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }

  /**
   * Private helper methods for specific integrations
   */
  private async syncGarminData(userId: number, integration: HealthIntegration): Promise<void> {
    // Simulate Garmin API call
    const sampleData = [
      { metricType: 'steps', value: '8456', timestamp: new Date(), source: 'garmin' },
      { metricType: 'heart_rate', value: '72', timestamp: new Date(), source: 'garmin' },
      { metricType: 'sleep', value: '7.5', timestamp: new Date(), source: 'garmin' }
    ];

    for (const data of sampleData) {
      await storage.addHealthMetric(userId, {
        metricType: data.metricType,
        value: data.value,
        unit: this.getMetricUnit(data.metricType),
        timestamp: data.timestamp,
        source: data.source,
        notes: 'Synced from Garmin Connect'
      });
    }
  }

  private async syncWhoopData(userId: number, integration: HealthIntegration): Promise<void> {
    // Simulate WHOOP API call
    const sampleData = [
      { metricType: 'heart_rate_variability', value: '45', timestamp: new Date(), source: 'whoop' },
      { metricType: 'recovery_score', value: '78', timestamp: new Date(), source: 'whoop' },
      { metricType: 'strain_score', value: '12.5', timestamp: new Date(), source: 'whoop' }
    ];

    for (const data of sampleData) {
      await storage.addHealthMetric(userId, {
        metricType: data.metricType,
        value: data.value,
        unit: this.getMetricUnit(data.metricType),
        timestamp: data.timestamp,
        source: data.source,
        notes: 'Synced from WHOOP'
      });
    }
  }

  private async syncSamsungHealthData(userId: number, integration: HealthIntegration): Promise<void> {
    // Simulate Samsung Health API call
    const sampleData = [
      { metricType: 'steps', value: '7234', timestamp: new Date(), source: 'samsung_health' },
      { metricType: 'weight', value: '165', timestamp: new Date(), source: 'samsung_health' },
      { metricType: 'water_intake', value: '64', timestamp: new Date(), source: 'samsung_health' }
    ];

    for (const data of sampleData) {
      await storage.addHealthMetric(userId, {
        metricType: data.metricType,
        value: data.value,
        unit: this.getMetricUnit(data.metricType),
        timestamp: data.timestamp,
        source: data.source,
        notes: 'Synced from Samsung Health'
      });
    }
  }

  private getProviderName(provider: string): string {
    const names: Record<string, string> = {
      garmin: 'Garmin Connect',
      whoop: 'WHOOP',
      samsung: 'Samsung Health',
      apple: 'Apple Health',
      fitbit: 'Fitbit',
      oura: 'Oura Ring'
    };
    return names[provider] || provider;
  }

  private getProviderType(provider: string): 'fitness_tracker' | 'smartwatch' | 'health_app' | 'medical_device' {
    const types: Record<string, any> = {
      garmin: 'fitness_tracker',
      whoop: 'fitness_tracker',
      samsung: 'health_app',
      apple: 'health_app',
      fitbit: 'fitness_tracker',
      oura: 'fitness_tracker'
    };
    return types[provider] || 'health_app';
  }

  private getProviderDataTypes(provider: string): string[] {
    const dataTypes: Record<string, string[]> = {
      garmin: ['steps', 'heart_rate', 'sleep', 'exercise', 'stress'],
      whoop: ['heart_rate_variability', 'sleep', 'recovery', 'strain'],
      samsung: ['steps', 'sleep', 'heart_rate', 'weight', 'nutrition'],
      apple: ['steps', 'heart_rate', 'sleep', 'workout', 'weight'],
      fitbit: ['steps', 'heart_rate', 'sleep', 'exercise', 'weight'],
      oura: ['sleep', 'heart_rate_variability', 'temperature', 'recovery']
    };
    return dataTypes[provider] || ['steps', 'heart_rate'];
  }

  private getMetricUnit(metricType: string): string {
    const units: Record<string, string> = {
      steps: 'steps',
      heart_rate: 'bpm',
      sleep: 'hours',
      weight: 'lbs',
      water_intake: 'oz',
      heart_rate_variability: 'ms',
      recovery_score: 'score',
      strain_score: 'score'
    };
    return units[metricType] || 'units';
  }

  private evaluateTrigger(trigger: any, currentValue: number): boolean {
    if (!trigger.threshold) return true;
    
    switch (trigger.condition) {
      case 'low': return currentValue < trigger.threshold;
      case 'high': return currentValue > trigger.threshold;
      case 'irregular': return Math.abs(currentValue - trigger.threshold) > trigger.threshold * 0.2;
      default: return true;
    }
  }

  private calculateRelevanceScore(trigger: any, currentValue: number, product: MarketplaceProduct): number {
    let score = 50; // Base score
    
    if (trigger.threshold) {
      const deviation = Math.abs(currentValue - trigger.threshold) / trigger.threshold;
      score += Math.min(deviation * 30, 30); // Up to 30 points for deviation
    }
    
    score += product.rating * 10; // Up to 50 points for rating
    score += Math.min(product.reviewCount / 100, 20); // Up to 20 points for reviews
    
    return Math.round(score);
  }

  private generateRecommendationReasoning(trigger: any, currentValue: number, product: MarketplaceProduct): string {
    if (trigger.condition === 'low') {
      return `Your ${trigger.metricType} levels are below optimal (${currentValue.toFixed(1)}). ${product.name} can help improve these levels naturally.`;
    } else if (trigger.condition === 'high') {
      return `Your ${trigger.metricType} readings are elevated (${currentValue.toFixed(1)}). ${product.name} may help regulate these levels.`;
    }
    return `Based on your ${trigger.metricType} patterns, ${product.name} could provide significant benefits for your health goals.`;
  }

  private calculateTrend(metrics: HealthMetric[]): string {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-3).map(m => parseFloat(m.value));
    const previous = metrics.slice(-6, -3).map(m => parseFloat(m.value));
    
    if (recent.length === 0 || previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    if (recentAvg > previousAvg * 1.1) return 'improving';
    if (recentAvg < previousAvg * 0.9) return 'declining';
    return 'stable';
  }

  private calculateUrgency(trigger: any, currentValue: number): 'high' | 'medium' | 'low' {
    if (!trigger.threshold) return 'low';
    
    const deviation = Math.abs(currentValue - trigger.threshold) / trigger.threshold;
    if (deviation > 0.3) return 'high';
    if (deviation > 0.15) return 'medium';
    return 'low';
  }

  private estimateBenefit(product: MarketplaceProduct, trigger: any): string {
    const benefits = product.healthBenefits;
    if (benefits.length > 0) {
      return `May improve ${benefits[0].toLowerCase()} within 2-4 weeks of consistent use.`;
    }
    return 'Potential health benefits based on your current metrics.';
  }
}

export const integrationsEngine = new IntegrationsEngine();