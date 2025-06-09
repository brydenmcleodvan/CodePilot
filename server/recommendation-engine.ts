/**
 * Personalized Health Recommendation Engine
 * Analyzes user patterns and provides intelligent coaching based on goal progress and health trends
 */

interface MetricDataPoint {
  date: string;
  value: number;
  source?: string;
  achieved?: boolean;
}

interface HealthGoal {
  id: number;
  metricType: string;
  goalType: 'min' | 'max' | 'target' | 'range';
  target: number | { min: number; max: number };
  unit: string;
  timeframe: string;
}

interface RecommendationContext {
  userId: number;
  userProfile?: {
    age?: number;
    activityLevel?: string;
    healthConditions?: string[];
  };
  recentMetrics: { [key: string]: MetricDataPoint[] };
  weatherData?: any;
  timeOfDay?: string;
  dayOfWeek?: string;
}

interface HealthRecommendation {
  type: 'habit_tip' | 'pattern_insight' | 'motivational' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  insight: string;
  tip: string;
  actionItems: string[];
  category: string;
  confidenceLevel: number; // 0-100
  personalizedFor: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
}

export class RecommendationEngine {
  /**
   * Generate personalized recommendations based on user data and patterns
   */
  public generateRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (!metricData || metricData.length === 0) {
      return this.getStarterRecommendations(goal, context);
    }

    // Calculate key metrics
    const avg = metricData.reduce((sum, d) => sum + d.value, 0) / metricData.length;
    const target = typeof goal.target === 'number' ? goal.target : goal.target.min;
    const recentTrend = this.calculateTrend(metricData.slice(-7));
    const consistencyScore = this.calculateConsistency(metricData);
    const missedDays = this.getMissedDaysPattern(metricData, goal);

    // Generate specific recommendations based on metric type and patterns
    switch (goal.metricType.toLowerCase()) {
      case 'sleep':
        recommendations.push(...this.getSleepRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      case 'steps':
        recommendations.push(...this.getStepsRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      case 'heart_rate':
        recommendations.push(...this.getHeartRateRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      case 'water_intake':
        recommendations.push(...this.getHydrationRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      case 'exercise':
        recommendations.push(...this.getExerciseRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      case 'weight':
        recommendations.push(...this.getWeightRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      case 'glucose':
        recommendations.push(...this.getGlucoseRecommendations(metricData, goal, context, avg, target, recentTrend));
        break;
      default:
        recommendations.push(...this.getGenericRecommendations(metricData, goal, context, avg, target, recentTrend));
    }

    // Add pattern-based recommendations
    recommendations.push(...this.getPatternBasedRecommendations(metricData, goal, context, consistencyScore, missedDays));

    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] - priorityWeight[a.priority]) || (b.confidenceLevel - a.confidenceLevel);
      })
      .slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Sleep-specific recommendations
   */
  private getSleepRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (avg < target) {
      const deficit = target - avg;
      recommendations.push({
        type: 'habit_tip',
        priority: 'high',
        title: 'Improve Your Sleep Duration',
        insight: `Your average sleep is ${avg.toFixed(1)} hours, which is ${deficit.toFixed(1)} hours below your ${target}-hour goal.`,
        tip: 'Quality sleep is crucial for recovery, mood, and cognitive function.',
        actionItems: [
          'Set a consistent bedtime routine 30 minutes before sleep',
          'Avoid screens (phone, TV, laptop) 1 hour before bed',
          'Keep your bedroom cool (65-68°F) and dark',
          'Try relaxation techniques like deep breathing or meditation'
        ],
        category: 'sleep',
        confidenceLevel: 90,
        personalizedFor: ['sleep_deficit'],
        estimatedImpact: 'high'
      });
    }

    if (trend < -0.5) {
      recommendations.push({
        type: 'pattern_insight',
        priority: 'medium',
        title: 'Declining Sleep Pattern Detected',
        insight: 'Your sleep duration has been decreasing over the past week.',
        tip: 'Identify and address factors that might be affecting your sleep schedule.',
        actionItems: [
          'Review your evening routine for potential disruptors',
          'Check if stress or workload has increased recently',
          'Consider if caffeine intake timing has changed'
        ],
        category: 'sleep',
        confidenceLevel: 75,
        personalizedFor: ['declining_trend'],
        estimatedImpact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Steps/Activity-specific recommendations
   */
  private getStepsRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (avg < target) {
      const deficit = target - avg;
      recommendations.push({
        type: 'habit_tip',
        priority: 'high',
        title: 'Increase Daily Activity',
        insight: `You're averaging ${Math.round(avg)} steps, about ${Math.round(deficit)} steps below your ${target}-step goal.`,
        tip: 'Small increases in daily movement can significantly improve your health.',
        actionItems: [
          'Take a 10-15 minute walk after lunch',
          'Use stairs instead of elevators when possible',
          'Park further away or get off transit one stop early',
          'Set hourly reminders to stand and move for 2-3 minutes'
        ],
        category: 'activity',
        confidenceLevel: 85,
        personalizedFor: ['step_deficit'],
        estimatedImpact: 'high'
      });
    }

    // Weekend vs weekday pattern analysis
    const weekdayAvg = this.getWeekdayAverage(metricData);
    const weekendAvg = this.getWeekendAverage(metricData);
    
    if (weekendAvg < weekdayAvg * 0.7) {
      recommendations.push({
        type: 'pattern_insight',
        priority: 'medium',
        title: 'Weekend Activity Drop',
        insight: `Your weekend activity (${Math.round(weekendAvg)} steps) is significantly lower than weekdays (${Math.round(weekdayAvg)} steps).`,
        tip: 'Maintain active habits throughout the week, including weekends.',
        actionItems: [
          'Plan active weekend activities (hiking, walking, sports)',
          'Schedule morning walks or bike rides on weekends',
          'Find active social activities with friends or family'
        ],
        category: 'activity',
        confidenceLevel: 80,
        personalizedFor: ['weekend_pattern'],
        estimatedImpact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Heart rate recommendations
   */
  private getHeartRateRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (goal.goalType === 'max' && avg > target) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        title: 'Elevated Resting Heart Rate',
        insight: `Your average resting heart rate (${Math.round(avg)} bpm) is above your target of ${target} bpm.`,
        tip: 'A lower resting heart rate typically indicates better cardiovascular fitness.',
        actionItems: [
          'Incorporate regular cardiovascular exercise',
          'Practice stress management techniques',
          'Ensure adequate sleep and recovery',
          'Consider consulting with a healthcare provider if persistently elevated'
        ],
        category: 'cardiovascular',
        confidenceLevel: 85,
        personalizedFor: ['elevated_hr'],
        estimatedImpact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Hydration recommendations
   */
  private getHydrationRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (avg < target) {
      recommendations.push({
        type: 'habit_tip',
        priority: 'medium',
        title: 'Improve Daily Hydration',
        insight: `You're averaging ${avg.toFixed(1)} ${goal.unit} of water, below your ${target} ${goal.unit} goal.`,
        tip: 'Proper hydration supports energy, focus, and overall health.',
        actionItems: [
          'Start your day with a glass of water',
          'Keep a water bottle visible at your workspace',
          'Set reminders to drink water every 2 hours',
          'Eat water-rich foods (fruits, vegetables)'
        ],
        category: 'nutrition',
        confidenceLevel: 80,
        personalizedFor: ['hydration_deficit'],
        estimatedImpact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Exercise recommendations
   */
  private getExerciseRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (avg < target) {
      recommendations.push({
        type: 'habit_tip',
        priority: 'high',
        title: 'Increase Exercise Frequency',
        insight: `You're exercising ${avg.toFixed(1)} times per week, below your target of ${target} times.`,
        tip: 'Regular exercise improves physical and mental health significantly.',
        actionItems: [
          'Schedule specific workout times in your calendar',
          'Start with shorter 15-20 minute sessions',
          'Find activities you enjoy (dancing, sports, hiking)',
          'Consider bodyweight exercises that require no equipment'
        ],
        category: 'fitness',
        confidenceLevel: 90,
        personalizedFor: ['exercise_deficit'],
        estimatedImpact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Weight management recommendations
   */
  private getWeightRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    const weightDiff = Math.abs(avg - target);
    
    if (weightDiff > 2) {
      recommendations.push({
        type: 'habit_tip',
        priority: 'medium',
        title: 'Weight Management Support',
        insight: `Your current weight trend shows you're ${weightDiff.toFixed(1)} ${goal.unit} from your target.`,
        tip: 'Sustainable weight management focuses on healthy habits rather than quick fixes.',
        actionItems: [
          'Focus on consistent, balanced nutrition',
          'Combine cardiovascular and strength training',
          'Track your food intake and portions',
          'Consider consulting with a nutritionist for personalized guidance'
        ],
        category: 'weight_management',
        confidenceLevel: 70,
        personalizedFor: ['weight_management'],
        estimatedImpact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Blood glucose recommendations
   */
  private getGlucoseRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (avg > target) {
      recommendations.push({
        type: 'warning',
        priority: 'high',
        title: 'Blood Glucose Management',
        insight: `Your average glucose levels (${avg.toFixed(1)} mg/dL) are above your target of ${target} mg/dL.`,
        tip: 'Managing blood glucose is crucial for long-term health.',
        actionItems: [
          'Monitor carbohydrate intake and timing',
          'Increase physical activity, especially after meals',
          'Focus on fiber-rich, whole foods',
          'Consult with your healthcare provider for medication adjustments if needed'
        ],
        category: 'metabolic_health',
        confidenceLevel: 85,
        personalizedFor: ['glucose_management'],
        estimatedImpact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Generic recommendations for any metric type
   */
  private getGenericRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    avg: number,
    target: number,
    trend: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (avg < target) {
      recommendations.push({
        type: 'habit_tip',
        priority: 'medium',
        title: 'Improve Goal Consistency',
        insight: `Your average ${goal.metricType} is below your target. Focus on consistent daily habits.`,
        tip: 'Small, consistent actions lead to significant improvements over time.',
        actionItems: [
          'Set daily reminders for this health habit',
          'Track your progress regularly',
          'Start with smaller, achievable targets',
          'Celebrate small wins to build momentum'
        ],
        category: 'general',
        confidenceLevel: 70,
        personalizedFor: ['general_improvement'],
        estimatedImpact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Pattern-based recommendations
   */
  private getPatternBasedRecommendations(
    metricData: MetricDataPoint[], 
    goal: HealthGoal, 
    context: RecommendationContext,
    consistencyScore: number,
    missedDays: any
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    if (consistencyScore < 0.6) {
      recommendations.push({
        type: 'motivational',
        priority: 'medium',
        title: 'Build Consistency',
        insight: `Your consistency score is ${(consistencyScore * 100).toFixed(0)}%. Building consistent habits is key to reaching your goals.`,
        tip: 'Focus on showing up every day, even if the effort is small.',
        actionItems: [
          'Start with a minimum viable habit (e.g., 5 minutes instead of 30)',
          'Use habit stacking - attach this goal to an existing routine',
          'Track your habit completion daily',
          'Prepare for obstacles by planning "if-then" scenarios'
        ],
        category: 'habit_building',
        confidenceLevel: 85,
        personalizedFor: ['consistency_building'],
        estimatedImpact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Starter recommendations for new users
   */
  private getStarterRecommendations(goal: HealthGoal, context: RecommendationContext): HealthRecommendation[] {
    return [{
      type: 'motivational',
      priority: 'high',
      title: 'Welcome to Your Health Journey!',
      insight: 'You\'ve taken the first step by setting a health goal. Now let\'s build the habits to achieve it.',
      tip: 'Start small and be consistent. Every expert was once a beginner.',
      actionItems: [
        'Begin tracking your baseline measurements',
        'Set a daily reminder to log your progress',
        'Focus on building the habit before optimizing performance',
        'Celebrate each day you successfully track your metric'
      ],
      category: 'getting_started',
      confidenceLevel: 95,
      personalizedFor: ['new_user'],
      estimatedImpact: 'high'
    }];
  }

  /**
   * Calculate trend over recent data points
   */
  private calculateTrend(recentData: MetricDataPoint[]): number {
    if (recentData.length < 2) return 0;
    
    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  /**
   * Calculate consistency score (0-1)
   */
  private calculateConsistency(metricData: MetricDataPoint[]): number {
    if (metricData.length === 0) return 0;
    
    const achievedDays = metricData.filter(d => d.achieved).length;
    return achievedDays / metricData.length;
  }

  /**
   * Get pattern of missed days
   */
  private getMissedDaysPattern(metricData: MetricDataPoint[], goal: HealthGoal): any {
    // Analyze patterns in missed days (weekends, specific days, etc.)
    const missedDays = metricData.filter(d => !d.achieved);
    return {
      total: missedDays.length,
      percentage: (missedDays.length / metricData.length) * 100,
      recentMisses: missedDays.slice(-7).length
    };
  }

  /**
   * Calculate weekday average
   */
  private getWeekdayAverage(metricData: MetricDataPoint[]): number {
    const weekdayData = metricData.filter(d => {
      const dayOfWeek = new Date(d.date).getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    });
    
    if (weekdayData.length === 0) return 0;
    return weekdayData.reduce((sum, d) => sum + d.value, 0) / weekdayData.length;
  }

  /**
   * Calculate weekend average
   */
  private getWeekendAverage(metricData: MetricDataPoint[]): number {
    const weekendData = metricData.filter(d => {
      const dayOfWeek = new Date(d.date).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // Saturday and Sunday
    });
    
    if (weekendData.length === 0) return 0;
    return weekendData.reduce((sum, d) => sum + d.value, 0) / weekendData.length;
  }
}

export const recommendationEngine = new RecommendationEngine();