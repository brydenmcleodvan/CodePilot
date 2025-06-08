export interface ContextualRecommendation {
  type: 'goal' | 'content' | 'product';
  priority: 'low' | 'medium' | 'high';
  message: string;
  link?: string;
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

import { storage } from './storage';

export class ContextualRecommendationEngine {
  async generateRecommendations(userId: number): Promise<ContextualRecommendation[]> {
    const recommendations: ContextualRecommendation[] = [];
    const metrics = await storage.getHealthMetrics(userId);

    const sleep = metrics
      .filter(m => m.metricType === 'sleep')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const stress = metrics
      .filter(m => m.metricType === 'stress')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const steps = metrics
      .filter(m => m.metricType === 'steps')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (sleep.length >= 7 && stress.length >= 5) {
      const sleepAvg = average(sleep.slice(-7).map(m => parseFloat(m.value)));
      const stressAvg = average(stress.slice(-5).map(m => parseFloat(m.value)));

      if (sleepAvg < 6 && stressAvg > 7) {
        recommendations.push({
          type: 'product',
          priority: 'medium',
          message: 'Your recent sleep is low and stress is high. Magnesium supplements may help promote relaxation.',
          link: '/products/magnesium'
        });
      }
    }

    if (steps.length >= 7) {
      const stepAvg = average(steps.slice(-7).map(m => parseFloat(m.value)));
      if (stepAvg < 5000) {
        recommendations.push({
          type: 'goal',
          priority: 'medium',
          message: 'Your activity has been low. Consider setting a new goal of 6,000 steps per day.'
        });
      }
    }

    if (sleep.length >= 7) {
      const sleepAvg = average(sleep.slice(-7).map(m => parseFloat(m.value)));
      if (sleepAvg < 7) {
        recommendations.push({
          type: 'content',
          priority: 'low',
          message: 'Check out our guide on improving sleep hygiene for better rest.',
          link: '/articles/sleep-hygiene'
        });
      }
    }

    return recommendations;
  }
}

export const contextRecommendationEngine = new ContextualRecommendationEngine();
