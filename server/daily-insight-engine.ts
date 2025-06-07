import cron from 'node-cron';
import { storage } from './storage';

/**
 * Nightly Health Insight Engine
 * Generates short daily summaries from synced health metrics
 */
class DailyInsightEngine {
  constructor() {
    // Schedule job for 1 AM every day
    cron.schedule('0 1 * * *', () => {
      this.generateInsights().catch(err =>
        console.error('Daily insight generation error:', err)
      );
    });
    console.log('Daily insight engine scheduled - runs nightly at 1 AM');
  }

  /** Generate insights for all users */
  async generateInsights(): Promise<void> {
    const users = await storage.getUsers();
    for (const user of users) {
      const summary = await this.createUserInsight(user.id);
      if (summary) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        await storage.addDailyInsight({ userId: user.id, date, summary });
        console.log(`Daily insight stored for user ${user.id}`);
      }
    }
  }

  /** Create summary for a single user */
  private async createUserInsight(userId: number): Promise<string | null> {
    const metrics = await storage.getHealthMetrics(userId);
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const daily = metrics.filter(m => {
      const ts = new Date(m.timestamp);
      return ts >= start && ts <= end;
    });

    if (daily.length === 0) return null;

    const avg = (type: string) => {
      const vals = daily
        .filter(m => m.metricType === type)
        .map(m => parseFloat(m.value));
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const steps = avg('steps');
    const sleep = avg('sleep');
    const hr = avg('heart_rate');

    const parts: string[] = [];
    if (steps !== null) parts.push(`walked ${Math.round(steps)} steps`);
    if (sleep !== null) parts.push(`slept ${sleep.toFixed(1)} hours`);
    if (hr !== null) parts.push(`avg heart rate ${Math.round(hr)} bpm`);

    if (parts.length === 0) return null;
    return `Today you ${parts.join(', ')}.`;
  }
}

export const dailyInsightEngine = new DailyInsightEngine();

