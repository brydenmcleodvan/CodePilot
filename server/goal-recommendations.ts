/**
 * AI-Powered Health Goal Recommendations Engine
 * Provides personalized goal suggestions based on user profile, health data, and scientific guidelines
 */

interface UserProfile {
  age: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  healthConditions?: string[];
  currentMetrics?: {
    [key: string]: number;
  };
}

interface GoalRecommendation {
  metricType: string;
  goalType: 'minimum' | 'maximum' | 'target' | 'range';
  recommendedValue: number | { min: number; max: number };
  unit: string;
  timeframe: string;
  reasoning: string;
  scientificBasis: string;
  adjustmentFactors: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  personalizedTips: string[];
}

export class GoalRecommendationEngine {
  
  /**
   * Generate personalized goal recommendations for a user
   */
  public generateRecommendations(
    userProfile: UserProfile,
    requestedMetrics?: string[]
  ): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [];
    
    const metricsToRecommend = requestedMetrics || [
      'sleep_duration',
      'steps',
      'heart_rate_resting',
      'water_intake',
      'exercise_minutes',
      'weight'
    ];

    for (const metric of metricsToRecommend) {
      const recommendation = this.generateSingleRecommendation(metric, userProfile);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Generate a specific goal recommendation for a single metric
   */
  private generateSingleRecommendation(
    metricType: string,
    userProfile: UserProfile
  ): GoalRecommendation | null {
    
    switch (metricType) {
      case 'sleep_duration':
        return this.recommendSleepGoal(userProfile);
      
      case 'steps':
        return this.recommendStepsGoal(userProfile);
      
      case 'heart_rate_resting':
        return this.recommendRestingHeartRateGoal(userProfile);
      
      case 'water_intake':
        return this.recommendWaterIntakeGoal(userProfile);
      
      case 'exercise_minutes':
        return this.recommendExerciseGoal(userProfile);
      
      case 'weight':
        return this.recommendWeightGoal(userProfile);
      
      default:
        return null;
    }
  }

  private recommendSleepGoal(userProfile: UserProfile): GoalRecommendation {
    let recommendedHours = 8; // Default for adults
    let reasoning = "Based on scientific research for healthy adults";
    const adjustmentFactors: string[] = [];

    // Age-based adjustments
    if (userProfile.age < 18) {
      recommendedHours = 9;
      reasoning = "Teenagers need more sleep for growth and development";
      adjustmentFactors.push("Age: Teenage years require additional sleep");
    } else if (userProfile.age > 65) {
      recommendedHours = 7.5;
      reasoning = "Older adults typically need slightly less sleep but higher quality";
      adjustmentFactors.push("Age: Senior sleep patterns considered");
    }

    // Activity level adjustments
    if (userProfile.activityLevel === 'very_active' || userProfile.activityLevel === 'extremely_active') {
      recommendedHours += 0.5;
      adjustmentFactors.push("High activity level: Additional recovery time needed");
    }

    return {
      metricType: 'sleep_duration',
      goalType: 'minimum',
      recommendedValue: recommendedHours,
      unit: 'hours',
      timeframe: 'daily',
      reasoning,
      scientificBasis: "American Academy of Sleep Medicine and Sleep Research Society consensus",
      adjustmentFactors,
      confidenceLevel: 'high',
      personalizedTips: [
        "Maintain consistent bedtime and wake-up times",
        "Create a cool, dark sleeping environment",
        "Avoid caffeine 6 hours before bedtime",
        "Limit screen time 1 hour before sleep"
      ]
    };
  }

  private recommendStepsGoal(userProfile: UserProfile): GoalRecommendation {
    let baseSteps = 8000; // More realistic than 10,000 for beginners
    const adjustmentFactors: string[] = [];

    // Age adjustments
    if (userProfile.age > 65) {
      baseSteps = 6000;
      adjustmentFactors.push("Age: Adjusted for senior activity levels");
    } else if (userProfile.age < 30) {
      baseSteps = 10000;
      adjustmentFactors.push("Age: Higher target for younger adults");
    }

    // Activity level adjustments
    switch (userProfile.activityLevel) {
      case 'sedentary':
        baseSteps = 6000;
        adjustmentFactors.push("Starting goal for sedentary lifestyle");
        break;
      case 'very_active':
      case 'extremely_active':
        baseSteps = 12000;
        adjustmentFactors.push("Higher target for active individuals");
        break;
    }

    // Current metrics consideration
    if (userProfile.currentMetrics?.steps) {
      const currentAverage = userProfile.currentMetrics.steps;
      baseSteps = Math.max(baseSteps, Math.round(currentAverage * 1.1)); // 10% increase
      adjustmentFactors.push("Based on your current activity level");
    }

    return {
      metricType: 'steps',
      goalType: 'minimum',
      recommendedValue: baseSteps,
      unit: 'steps',
      timeframe: 'daily',
      reasoning: "Personalized based on age, activity level, and current performance",
      scientificBasis: "WHO Physical Activity Guidelines and step count research",
      adjustmentFactors,
      confidenceLevel: 'high',
      personalizedTips: [
        "Take stairs instead of elevators",
        "Park further away from destinations",
        "Set hourly movement reminders",
        "Try walking meetings when possible"
      ]
    };
  }

  private recommendRestingHeartRateGoal(userProfile: UserProfile): GoalRecommendation {
    let maxTarget = 70; // Good fitness level
    const adjustmentFactors: string[] = [];

    // Age adjustments (heart rate generally increases with age)
    if (userProfile.age > 50) {
      maxTarget = 75;
      adjustmentFactors.push("Age: Adjusted for normal aging changes");
    } else if (userProfile.age < 30) {
      maxTarget = 65;
      adjustmentFactors.push("Age: Lower target for younger adults");
    }

    // Fitness level adjustments
    if (userProfile.activityLevel === 'very_active' || userProfile.activityLevel === 'extremely_active') {
      maxTarget -= 5;
      adjustmentFactors.push("High fitness level: Athletes often have lower RHR");
    } else if (userProfile.activityLevel === 'sedentary') {
      maxTarget += 5;
      adjustmentFactors.push("Sedentary lifestyle: Gradual improvement target");
    }

    return {
      metricType: 'heart_rate_resting',
      goalType: 'maximum',
      recommendedValue: maxTarget,
      unit: 'bpm',
      timeframe: 'daily',
      reasoning: "Lower resting heart rate indicates better cardiovascular fitness",
      scientificBasis: "American Heart Association cardiovascular health guidelines",
      adjustmentFactors,
      confidenceLevel: 'medium',
      personalizedTips: [
        "Regular aerobic exercise improves heart efficiency",
        "Manage stress through meditation or yoga",
        "Maintain healthy weight",
        "Limit caffeine and alcohol intake"
      ]
    };
  }

  private recommendWaterIntakeGoal(userProfile: UserProfile): GoalRecommendation {
    let baseIntake = 2000; // ml for average adult
    const adjustmentFactors: string[] = [];

    // Gender adjustments
    if (userProfile.gender === 'male') {
      baseIntake = 2500;
      adjustmentFactors.push("Gender: Males typically need more water");
    } else if (userProfile.gender === 'female') {
      baseIntake = 2000;
      adjustmentFactors.push("Gender: Female recommended intake");
    }

    // Weight adjustments
    if (userProfile.weight) {
      baseIntake = Math.round(userProfile.weight * 30); // 30ml per kg
      adjustmentFactors.push("Weight: Calculated based on body weight");
    }

    // Activity level adjustments
    if (userProfile.activityLevel === 'very_active' || userProfile.activityLevel === 'extremely_active') {
      baseIntake += 500;
      adjustmentFactors.push("High activity: Additional water for exercise");
    }

    return {
      metricType: 'water_intake',
      goalType: 'minimum',
      recommendedValue: baseIntake,
      unit: 'ml',
      timeframe: 'daily',
      reasoning: "Proper hydration supports all bodily functions",
      scientificBasis: "Institute of Medicine fluid intake recommendations",
      adjustmentFactors,
      confidenceLevel: 'high',
      personalizedTips: [
        "Drink a glass of water when you wake up",
        "Keep a water bottle visible throughout the day",
        "Set hydration reminders every 2 hours",
        "Increase intake during hot weather or exercise"
      ]
    };
  }

  private recommendExerciseGoal(userProfile: UserProfile): GoalRecommendation {
    let minutesPerWeek = 150; // WHO recommendation
    const adjustmentFactors: string[] = [];

    // Current activity level
    switch (userProfile.activityLevel) {
      case 'sedentary':
        minutesPerWeek = 75; // Start smaller
        adjustmentFactors.push("Starting goal for sedentary lifestyle");
        break;
      case 'lightly_active':
        minutesPerWeek = 120;
        adjustmentFactors.push("Gradual increase from current level");
        break;
      case 'very_active':
      case 'extremely_active':
        minutesPerWeek = 225;
        adjustmentFactors.push("Maintaining high activity level");
        break;
    }

    // Age adjustments
    if (userProfile.age > 65) {
      adjustmentFactors.push("Age: Focus on balance and strength exercises");
    }

    return {
      metricType: 'exercise_minutes',
      goalType: 'minimum',
      recommendedValue: Math.round(minutesPerWeek / 7), // Daily target
      unit: 'minutes',
      timeframe: 'daily',
      reasoning: "Based on WHO physical activity recommendations",
      scientificBasis: "World Health Organization Global Recommendations on Physical Activity",
      adjustmentFactors,
      confidenceLevel: 'high',
      personalizedTips: [
        "Mix cardio and strength training",
        "Start with activities you enjoy",
        "Include flexibility and balance work",
        "Listen to your body and rest when needed"
      ]
    };
  }

  private recommendWeightGoal(userProfile: UserProfile): GoalRecommendation | null {
    if (!userProfile.height || !userProfile.weight) {
      return null; // Cannot recommend without basic measurements
    }

    const heightM = userProfile.height / 100;
    const currentBMI = userProfile.weight / (heightM * heightM);
    const idealBMI = 22.5; // Middle of healthy range
    const idealWeight = Math.round(idealBMI * heightM * heightM);
    
    let goalType: 'minimum' | 'maximum' | 'target' = 'target';
    let targetWeight = idealWeight;
    let reasoning = "Target based on healthy BMI range (18.5-24.9)";
    const adjustmentFactors: string[] = [];

    // Adjust based on current weight
    if (currentBMI < 18.5) {
      goalType = 'minimum';
      targetWeight = Math.round(18.5 * heightM * heightM);
      reasoning = "Weight gain recommended for underweight BMI";
    } else if (currentBMI > 25) {
      goalType = 'maximum';
      targetWeight = Math.round(24.9 * heightM * heightM);
      reasoning = "Weight loss recommended for overweight BMI";
    } else {
      targetWeight = userProfile.weight; // Maintain current healthy weight
      reasoning = "Maintain current healthy weight";
    }

    adjustmentFactors.push(`Current BMI: ${currentBMI.toFixed(1)}`);

    return {
      metricType: 'weight',
      goalType,
      recommendedValue: targetWeight,
      unit: 'kg',
      timeframe: 'long_term',
      reasoning,
      scientificBasis: "WHO BMI classifications and healthy weight ranges",
      adjustmentFactors,
      confidenceLevel: 'medium',
      personalizedTips: [
        "Focus on sustainable lifestyle changes",
        "Combine healthy eating with regular exercise",
        "Monitor progress weekly, not daily",
        "Consult healthcare provider for personalized advice"
      ]
    };
  }

  /**
   * Get AI-powered contextual recommendations
   */
  public async getAIRecommendations(
    question: string,
    userProfile: UserProfile
  ): Promise<{ recommendations: GoalRecommendation[]; aiResponse: string }> {
    
    // Generate base recommendations
    const recommendations = this.generateRecommendations(userProfile);
    
    // Create contextual AI response
    let aiResponse = "";
    
    if (question.toLowerCase().includes('sleep')) {
      const sleepRec = recommendations.find(r => r.metricType === 'sleep_duration');
      if (sleepRec) {
        aiResponse = `Based on your profile, I recommend ${sleepRec.recommendedValue} hours of sleep per night. ${sleepRec.reasoning}. ${sleepRec.personalizedTips.slice(0, 2).join(' ')}`;
      }
    } else if (question.toLowerCase().includes('heart rate')) {
      const hrRec = recommendations.find(r => r.metricType === 'heart_rate_resting');
      if (hrRec) {
        aiResponse = `For your age and activity level, aim for a resting heart rate below ${hrRec.recommendedValue} bpm. ${hrRec.reasoning}. ${hrRec.personalizedTips.slice(0, 2).join(' ')}`;
      }
    } else if (question.toLowerCase().includes('steps')) {
      const stepsRec = recommendations.find(r => r.metricType === 'steps');
      if (stepsRec) {
        aiResponse = `I suggest starting with ${stepsRec.recommendedValue} steps per day. ${stepsRec.reasoning}. ${stepsRec.personalizedTips.slice(0, 2).join(' ')}`;
      }
    } else {
      aiResponse = `I've analyzed your profile and created personalized recommendations for ${recommendations.length} health metrics. Each goal is tailored to your age, activity level, and current health status. Would you like me to explain any specific recommendation?`;
    }

    return {
      recommendations,
      aiResponse
    };
  }
}

export const goalRecommendationEngine = new GoalRecommendationEngine();