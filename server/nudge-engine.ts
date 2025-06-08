import { storage } from './storage';
import { streakCounter } from './streak-counter';

export interface Nudge {
  type: 'streak' | 'health_change' | 'pattern';
  priority: 'low' | 'medium' | 'high';
  message: string;
}

export interface NudgeTrigger {
  id: string;
  type: Nudge['type'];
  priority: Nudge['priority'];
  conditions: {
    /** Required streak length for streak nudges */
    streakLength?: number;
    /** Metric type to analyse for health change */
    metricType?: string;
    /** Ratio threshold for change detection (e.g. 0.8 for 20% drop) */
    trendThreshold?: number;
    /** Difference threshold used for sleep decline etc */
    trendDifference?: number;
    /** Secondary metric with threshold requirement */
    secondaryMetricType?: string;
    secondaryAbove?: number;
    /** Behaviour pattern key to check */
    patternKey?: string;
  };
  message: string;
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export class RuleBasedNudgeEngine {
  private triggers: NudgeTrigger[] = [
    {
      id: 'streak-milestone',
      type: 'streak',
      priority: 'medium',
      conditions: { streakLength: 7 },
      message: "Great job! You're on a {streak}-day {metric} streak."
    },
    {
      id: 'steps-drop',
      type: 'health_change',
      priority: 'high',
      conditions: { metricType: 'steps', trendThreshold: 0.8 },
      message: "Your step count dropped this week. Let's try to move a bit more today!"
    },
    {
      id: 'sleep-stress-warning',
      type: 'health_change',
      priority: 'high',
      conditions: {
        metricType: 'sleep',
        trendDifference: -0.5,
        secondaryMetricType: 'stress',
        secondaryAbove: 7
      },
      message: 'Your sleep is declining while stress is rising. Try a relaxation routine tonight.'
    },
    {
      id: 'late-night-usage',
      type: 'pattern',
      priority: 'medium',
      conditions: { patternKey: 'late_night_usage' },
      message: "Notice you've been up late recently. Consider winding down earlier tonight."
    }
  ];

  async generateNudges(userId: number): Promise<Nudge[]> {
    const nudges: Nudge[] = [];

    for (const trigger of this.triggers) {
      const nudge = await this.evaluateTrigger(userId, trigger);
      if (nudge) {
        nudges.push(nudge);
      }
    }

    return nudges;
  }

  private async evaluateTrigger(userId: number, trigger: NudgeTrigger): Promise<Nudge | null> {
    switch (trigger.type) {
      case 'streak':
        return this.checkStreak(userId, trigger);
      case 'health_change':
        return this.checkHealthChange(userId, trigger);
      case 'pattern':
        return this.checkPattern(userId, trigger);
      default:
        return null;
    }
  }

  private async checkStreak(userId: number, trigger: NudgeTrigger): Promise<Nudge | null> {
    const goals = await storage.getHealthGoals(userId);
    for (const goal of goals) {
      const streak = streakCounter.getStreak(userId, String(goal.id));
      const required = trigger.conditions.streakLength || 7;
      if (streak && streak.currentStreak > 0 && streak.currentStreak % required === 0) {
        const msg = trigger.message
          .replace('{streak}', String(streak.currentStreak))
          .replace('{metric}', goal.metricType);
        return { type: trigger.type, priority: trigger.priority, message: msg };
      }
    }
    return null;
  }

  private async checkHealthChange(userId: number, trigger: NudgeTrigger): Promise<Nudge | null> {
    const metrics = await storage.getHealthMetrics(userId);
    const metricType = trigger.conditions.metricType;
    if (!metricType) return null;

    const relevant = metrics
      .filter(m => m.metricType === metricType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (trigger.id === 'steps-drop') {
      if (relevant.length >= 14) {
        const last7 = relevant.slice(-7).map(m => parseFloat(m.value));
        const prev7 = relevant.slice(-14, -7).map(m => parseFloat(m.value));
        const lastAvg = average(last7);
        const prevAvg = average(prev7);
        const threshold = trigger.conditions.trendThreshold || 1;
        if (lastAvg < prevAvg * threshold) {
          return { type: trigger.type, priority: trigger.priority, message: trigger.message };
        }
      }
    }

    if (trigger.id === 'sleep-stress-warning') {
      if (relevant.length >= 14) {
        const sleepLast = relevant.slice(-7).map(m => parseFloat(m.value));
        const sleepPrev = relevant.slice(-14, -7).map(m => parseFloat(m.value));
        const sleepTrend = average(sleepLast) - average(sleepPrev);
        const diff = trigger.conditions.trendDifference || -0.5;
        if (sleepTrend < diff) {
          const stressMetrics = metrics
            .filter(m => m.metricType === trigger.conditions.secondaryMetricType)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          const stressLast = stressMetrics.slice(-5).map(m => parseFloat(m.value));
          const avgStress = stressLast.length > 0 ? average(stressLast) : 0;
          const threshold = trigger.conditions.secondaryAbove || 7;
          if (avgStress > threshold) {
            return { type: trigger.type, priority: trigger.priority, message: trigger.message };
          }
        }
      }
    }

    return null;
  }

  private async checkPattern(userId: number, trigger: NudgeTrigger): Promise<Nudge | null> {
    const { behavioralPsychologyLayer } = await import('./behavioralPsychologyLayer.js');
    const patterns = behavioralPsychologyLayer.behaviorPatterns.get(userId);
    const key = trigger.conditions.patternKey;
    if (key && patterns && patterns[key]) {
      return { type: trigger.type, priority: trigger.priority, message: trigger.message };
    }
    return null;
  }
}

export const ruleBasedNudgeEngine = new RuleBasedNudgeEngine();
