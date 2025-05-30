/**
 * Behavioral Psychology Layer
 * Uses habit science to create subtle loops, reinforcement, and behavior change
 */

class BehavioralPsychologyLayer {
  constructor() {
    this.userHabits = new Map();
    this.habitStreaks = new Map();
    this.behaviorPatterns = new Map();
    this.nudgeSchedules = new Map();
    this.microCommitments = new Map();
    
    // Core behavioral psychology principles
    this.habitScience = {
      // Habit loop components: Cue → Routine → Reward
      habitLoops: {
        morning_routine: {
          cue: 'wake_up_time',
          routine: ['check_health_data', 'set_daily_intention', 'review_goals'],
          reward: 'progress_visualization',
          optimal_time: 5, // 5 minutes after wake up
          friction_reducers: ['one_tap_logging', 'pre_filled_suggestions', 'voice_input']
        },
        
        evening_reflection: {
          cue: 'bedtime_approach',
          routine: ['log_mood', 'rate_day', 'plan_tomorrow'],
          reward: 'insight_summary',
          optimal_time: -60, // 60 minutes before bedtime
          friction_reducers: ['quick_ratings', 'voice_logging', 'smart_defaults']
        },
        
        meal_logging: {
          cue: 'meal_time',
          routine: ['photo_food', 'quick_nutrition_check'],
          reward: 'nutrition_insight',
          optimal_time: 0, // During meal
          friction_reducers: ['camera_shortcut', 'food_recognition', 'portion_estimation']
        },
        
        movement_break: {
          cue: 'prolonged_sitting',
          routine: ['stand_stretch', 'brief_walk'],
          reward: 'energy_boost_feedback',
          optimal_time: 120, // Every 2 hours
          friction_reducers: ['desk_exercises', 'micro_movements', 'breathing_exercises']
        }
      },

      // Behavioral triggers and optimal timing
      nudgeTypes: {
        implementation_intention: {
          name: 'If-Then Planning',
          format: 'If {trigger}, then I will {action}',
          examples: [
            'If I wake up, then I will drink a glass of water',
            'If I feel stressed, then I will take 3 deep breaths',
            'If I finish lunch, then I will log my meal'
          ],
          effectiveness: 0.85
        },
        
        temptation_bundling: {
          name: 'Temptation Bundling',
          format: 'I can only {want} while doing {should}',
          examples: [
            'I can only listen to podcasts while walking',
            'I can only watch Netflix while on the treadmill',
            'I can only check social media after logging my mood'
          ],
          effectiveness: 0.78
        },
        
        environment_design: {
          name: 'Environment Shaping',
          format: 'Make {good_habit} obvious and {bad_habit} invisible',
          examples: [
            'Place water bottle on nightstand',
            'Hide unhealthy snacks in hard-to-reach places',
            'Set phone to airplane mode during sleep hours'
          ],
          effectiveness: 0.72
        },
        
        social_accountability: {
          name: 'Social Commitment',
          format: 'Share {commitment} with {accountability_partner}',
          examples: [
            'Tell a friend about your sleep schedule goal',
            'Join a group challenge for step counting',
            'Share weekly progress with family member'
          ],
          effectiveness: 0.81
        }
      },

      // Micro-commitment strategies for low friction
      microCommitments: {
        two_minute_rule: {
          principle: 'Start with habits that take less than 2 minutes',
          examples: {
            'meditate_daily': 'Take one deep breath',
            'exercise_regularly': 'Put on workout clothes',
            'eat_healthy': 'Eat one piece of fruit',
            'drink_water': 'Fill water bottle',
            'track_mood': 'Rate mood on 1-10 scale'
          }
        },
        
        implementation_minimums: {
          principle: 'Set ridiculously small targets',
          examples: {
            'daily_steps': 100, // Instead of 10,000
            'meditation': 1, // Instead of 20 minutes
            'vegetables': 1, // Instead of 5 servings
            'water_glasses': 1, // Instead of 8
            'gratitude_items': 1 // Instead of 3
          }
        },
        
        habit_stacking: {
          principle: 'Attach new habit to established routine',
          templates: [
            'After I {existing_habit}, I will {new_habit}',
            'Before I {existing_habit}, I will {new_habit}',
            'While I {existing_habit}, I will {new_habit}'
          ],
          examples: [
            'After I pour my morning coffee, I will write one gratitude item',
            'Before I check my phone, I will do 5 push-ups',
            'While I brush my teeth, I will do calf raises'
          ]
        }
      }
    };

    // Contextual nudge patterns
    this.nudgePatterns = {
      time_based: {
        morning_energy: {
          time_range: [6, 10],
          energy_level: 'high',
          nudges: ['ambitious_goals', 'challenging_workouts', 'complex_tasks'],
          message_tone: 'energetic'
        },
        
        afternoon_dip: {
          time_range: [13, 16],
          energy_level: 'low',
          nudges: ['gentle_movement', 'hydration_reminder', 'healthy_snack'],
          message_tone: 'supportive'
        },
        
        evening_wind_down: {
          time_range: [19, 22],
          energy_level: 'declining',
          nudges: ['reflection_prompts', 'relaxation_activities', 'preparation_for_tomorrow'],
          message_tone: 'calming'
        }
      },
      
      context_based: {
        work_stress: {
          triggers: ['high_stress_reading', 'long_work_session'],
          nudges: ['breathing_exercise', 'desk_stretch', 'mindful_break'],
          timing: 'immediate'
        },
        
        sedentary_alert: {
          triggers: ['prolonged_sitting', 'low_step_count'],
          nudges: ['movement_reminder', 'walking_meeting', 'stairs_suggestion'],
          timing: 'gradual_escalation'
        },
        
        sleep_preparation: {
          triggers: ['bedtime_approach', 'screen_usage_high'],
          nudges: ['device_wind_down', 'bedroom_preparation', 'relaxation_routine'],
          timing: 'proactive'
        }
      },
      
      behavior_based: {
        streak_protection: {
          triggers: ['habit_interruption_risk', 'travel_day', 'schedule_disruption'],
          nudges: ['minimum_viable_habit', 'location_adaptation', 'flexible_alternatives'],
          timing: 'anticipatory'
        },
        
        momentum_building: {
          triggers: ['consecutive_successes', 'motivation_high'],
          nudges: ['habit_expansion', 'new_challenge', 'skill_building'],
          timing: 'opportunity_based'
        },
        
        recovery_support: {
          triggers: ['streak_broken', 'missed_goal', 'motivation_low'],
          nudges: ['compassionate_restart', 'lesson_extraction', 'simplified_goals'],
          timing: 'immediate_and_follow_up'
        }
      }
    };

    this.initializeBehavioralLayer();
  }

  /**
   * Analyze user behavior patterns and create personalized habit strategies
   */
  async analyzeUserBehavior(userId, behaviorData) {
    try {
      const analysis = {
        habit_patterns: [],
        optimal_timings: {},
        friction_points: [],
        motivation_triggers: [],
        nudge_preferences: {},
        micro_commitment_opportunities: []
      };

      // Store behavior data
      this.behaviorPatterns.set(userId, {
        ...this.behaviorPatterns.get(userId) || {},
        ...behaviorData,
        last_updated: new Date().toISOString()
      });

      // Analyze habit formation patterns
      const habitPatterns = await this.identifyHabitPatterns(userId, behaviorData);
      analysis.habit_patterns = habitPatterns;

      // Determine optimal timing for interventions
      const optimalTimings = await this.calculateOptimalTimings(userId, behaviorData);
      analysis.optimal_timings = optimalTimings;

      // Identify friction points in current behaviors
      const frictionPoints = await this.identifyFrictionPoints(userId, behaviorData);
      analysis.friction_points = frictionPoints;

      // Discover motivation triggers
      const motivationTriggers = await this.discoverMotivationTriggers(userId, behaviorData);
      analysis.motivation_triggers = motivationTriggers;

      // Generate personalized micro-commitments
      const microCommitments = await this.generateMicroCommitments(userId, analysis);
      analysis.micro_commitment_opportunities = microCommitments;

      return {
        success: true,
        analysis,
        recommendations: await this.generateBehaviorRecommendations(userId, analysis),
        nudge_schedule: await this.createNudgeSchedule(userId, analysis)
      };

    } catch (error) {
      console.error('Behavior analysis error:', error);
      throw new Error(`Failed to analyze user behavior: ${error.message}`);
    }
  }

  /**
   * Track and manage habit streaks with recovery suggestions
   */
  async updateHabitStreak(userId, habitType, completed) {
    try {
      const streaks = this.habitStreaks.get(userId) || {};
      const habitStreak = streaks[habitType] || {
        current_streak: 0,
        longest_streak: 0,
        total_completions: 0,
        last_completion: null,
        streak_breaks: [],
        recovery_attempts: 0
      };

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (completed) {
        // Update completion
        if (habitStreak.last_completion === today) {
          // Already completed today, no change to streak
          return { streak_maintained: true, current_streak: habitStreak.current_streak };
        }

        if (habitStreak.last_completion === yesterday || habitStreak.current_streak === 0) {
          // Continue or start streak
          habitStreak.current_streak++;
        } else {
          // Streak was broken, restart
          habitStreak.streak_breaks.push({
            broken_on: today,
            previous_streak: habitStreak.current_streak,
            days_missed: this.calculateDaysMissed(habitStreak.last_completion, today)
          });
          habitStreak.current_streak = 1;
        }

        habitStreak.longest_streak = Math.max(habitStreak.longest_streak, habitStreak.current_streak);
        habitStreak.total_completions++;
        habitStreak.last_completion = today;
        habitStreak.recovery_attempts = 0; // Reset recovery attempts on success

        // Store updated streak
        streaks[habitType] = habitStreak;
        this.habitStreaks.set(userId, streaks);

        // Generate streak-based nudges
        const streakNudges = await this.generateStreakNudges(userId, habitType, habitStreak);

        return {
          success: true,
          streak_continued: true,
          current_streak: habitStreak.current_streak,
          is_personal_best: habitStreak.current_streak === habitStreak.longest_streak,
          nudges: streakNudges
        };

      } else {
        // Habit not completed - check if streak is at risk
        const riskLevel = this.assessStreakRisk(habitStreak, today);
        const recoveryPlan = await this.generateRecoveryPlan(userId, habitType, habitStreak, riskLevel);

        return {
          success: true,
          streak_at_risk: riskLevel > 0,
          risk_level: riskLevel,
          recovery_plan: recoveryPlan,
          current_streak: habitStreak.current_streak
        };
      }

    } catch (error) {
      console.error('Habit streak update error:', error);
      throw new Error(`Failed to update habit streak: ${error.message}`);
    }
  }

  /**
   * Generate contextual nudges based on time and behavior patterns
   */
  async generateContextualNudge(userId, context) {
    try {
      const userPatterns = this.behaviorPatterns.get(userId) || {};
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      
      // Determine appropriate nudge type based on context
      let nudgeCategory = null;
      let nudgeIntensity = 'gentle';

      // Time-based nudging
      if (currentHour >= 6 && currentHour <= 10) {
        nudgeCategory = 'morning_energy';
        nudgeIntensity = 'encouraging';
      } else if (currentHour >= 13 && currentHour <= 16) {
        nudgeCategory = 'afternoon_dip';
        nudgeIntensity = 'supportive';
      } else if (currentHour >= 19 && currentHour <= 22) {
        nudgeCategory = 'evening_wind_down';
        nudgeIntensity = 'gentle';
      }

      // Context-based modifications
      if (context.stress_level > 7) {
        nudgeCategory = 'work_stress';
        nudgeIntensity = 'immediate';
      }

      if (context.steps_today < 2000 && currentHour > 14) {
        nudgeCategory = 'sedentary_alert';
        nudgeIntensity = 'motivating';
      }

      // Generate appropriate nudge
      const nudge = await this.createPersonalizedNudge(
        userId, 
        nudgeCategory, 
        nudgeIntensity, 
        context
      );

      return {
        success: true,
        nudge,
        timing: 'now',
        category: nudgeCategory,
        intensity: nudgeIntensity
      };

    } catch (error) {
      console.error('Contextual nudge generation error:', error);
      throw new Error(`Failed to generate contextual nudge: ${error.message}`);
    }
  }

  /**
   * Create friction-free micro-commitments
   */
  async createMicroCommitment(userId, habitType, currentCommitment) {
    try {
      const userPatterns = this.behaviorPatterns.get(userId) || {};
      const successRate = this.calculateHabitSuccessRate(userId, habitType);
      
      let microCommitment;

      // Apply two-minute rule
      if (successRate < 0.7) {
        microCommitment = this.applyTwoMinuteRule(habitType, currentCommitment);
      }
      
      // Apply implementation minimum
      if (successRate < 0.5) {
        microCommitment = this.applyImplementationMinimum(habitType);
      }
      
      // Create habit stack if user has stable routines
      if (successRate > 0.8 && userPatterns.stable_routines?.length > 0) {
        microCommitment = this.createHabitStack(habitType, userPatterns.stable_routines);
      }

      // Store micro-commitment
      const userCommitments = this.microCommitments.get(userId) || {};
      userCommitments[habitType] = {
        ...microCommitment,
        created_at: new Date().toISOString(),
        success_rate: successRate,
        previous_commitment: currentCommitment
      };
      this.microCommitments.set(userId, userCommitments);

      return {
        success: true,
        micro_commitment: microCommitment,
        reduction_factor: this.calculateReductionFactor(currentCommitment, microCommitment),
        expected_success_rate: this.predictSuccessRate(microCommitment, userPatterns)
      };

    } catch (error) {
      console.error('Micro-commitment creation error:', error);
      throw new Error(`Failed to create micro-commitment: ${error.message}`);
    }
  }

  // Helper methods for behavioral analysis

  async identifyHabitPatterns(userId, behaviorData) {
    const patterns = [];
    
    // Analyze completion times
    if (behaviorData.completion_times) {
      const timePatterns = this.analyzeTimePatterns(behaviorData.completion_times);
      patterns.push(...timePatterns);
    }
    
    // Analyze trigger consistency
    if (behaviorData.triggers) {
      const triggerPatterns = this.analyzeTriggerPatterns(behaviorData.triggers);
      patterns.push(...triggerPatterns);
    }
    
    // Analyze environmental factors
    if (behaviorData.environment) {
      const environmentPatterns = this.analyzeEnvironmentPatterns(behaviorData.environment);
      patterns.push(...environmentPatterns);
    }
    
    return patterns;
  }

  async calculateOptimalTimings(userId, behaviorData) {
    const timings = {};
    
    // Calculate optimal times for different habits based on historical data
    if (behaviorData.activity_patterns) {
      timings.exercise = this.findOptimalExerciseTime(behaviorData.activity_patterns);
      timings.meditation = this.findOptimalMeditationTime(behaviorData.activity_patterns);
      timings.meal_logging = this.findOptimalMealLoggingTime(behaviorData.activity_patterns);
    }
    
    return timings;
  }

  async identifyFrictionPoints(userId, behaviorData) {
    const frictionPoints = [];
    
    // Analyze where users drop off or struggle
    if (behaviorData.completion_rates) {
      const lowCompletionHabits = Object.entries(behaviorData.completion_rates)
        .filter(([habit, rate]) => rate < 0.6)
        .map(([habit, rate]) => ({
          habit,
          completion_rate: rate,
          friction_type: this.identifyFrictionType(habit, rate)
        }));
      
      frictionPoints.push(...lowCompletionHabits);
    }
    
    return frictionPoints;
  }

  async discoverMotivationTriggers(userId, behaviorData) {
    const triggers = [];
    
    // Analyze what conditions lead to higher success rates
    if (behaviorData.success_contexts) {
      const highSuccessContexts = Object.entries(behaviorData.success_contexts)
        .filter(([context, rate]) => rate > 0.8)
        .map(([context, rate]) => ({
          context,
          success_rate: rate,
          trigger_type: this.classifyTriggerType(context)
        }));
      
      triggers.push(...highSuccessContexts);
    }
    
    return triggers;
  }

  async generateMicroCommitments(userId, analysis) {
    const opportunities = [];
    
    // For each friction point, create a micro-commitment
    for (const friction of analysis.friction_points) {
      const microCommitment = this.designMicroCommitment(friction.habit, friction.friction_type);
      opportunities.push({
        habit: friction.habit,
        current_friction: friction.friction_type,
        micro_commitment: microCommitment,
        expected_improvement: this.estimateImprovement(friction.completion_rate, microCommitment)
      });
    }
    
    return opportunities;
  }

  async generateStreakNudges(userId, habitType, habitStreak) {
    const nudges = [];
    
    // Milestone nudges
    if ([7, 21, 30, 50, 100].includes(habitStreak.current_streak)) {
      nudges.push({
        type: 'milestone_celebration',
        message: `Amazing! You've maintained your ${habitType} habit for ${habitStreak.current_streak} days!`,
        action: 'celebrate_achievement'
      });
    }
    
    // Streak protection nudges
    if (habitStreak.current_streak > 10) {
      nudges.push({
        type: 'streak_protection',
        message: `You're on a ${habitStreak.current_streak}-day streak! Let's keep the momentum going.`,
        action: 'maintain_consistency'
      });
    }
    
    return nudges;
  }

  assessStreakRisk(habitStreak, today) {
    const lastCompletion = habitStreak.last_completion;
    if (!lastCompletion) return 0;
    
    const daysSinceCompletion = this.calculateDaysMissed(lastCompletion, today);
    
    if (daysSinceCompletion === 0) return 0; // Completed today
    if (daysSinceCompletion === 1) return 1; // Low risk
    if (daysSinceCompletion === 2) return 2; // Medium risk
    return 3; // High risk - streak likely broken
  }

  async generateRecoveryPlan(userId, habitType, habitStreak, riskLevel) {
    const plan = {
      urgency: riskLevel,
      strategies: [],
      micro_commitment: null,
      support_message: null
    };
    
    switch (riskLevel) {
      case 1: // Low risk
        plan.strategies = ['gentle_reminder', 'reduce_friction'];
        plan.support_message = 'Small steps count! What\'s the smallest version of this habit you could do right now?';
        break;
        
      case 2: // Medium risk
        plan.strategies = ['micro_commitment', 'environmental_cue', 'social_support'];
        plan.micro_commitment = this.applyTwoMinuteRule(habitType, null);
        plan.support_message = 'Your streak is valuable! Let\'s restart with something super simple.';
        break;
        
      case 3: // High risk
        plan.strategies = ['compassionate_restart', 'lesson_learning', 'habit_redesign'];
        plan.support_message = 'Streaks can be rebuilt. What did you learn from this experience?';
        break;
    }
    
    return plan;
  }

  // Utility methods

  calculateDaysMissed(lastDate, currentDate) {
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current - last);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
  }

  applyTwoMinuteRule(habitType, currentCommitment) {
    const twoMinuteVersions = {
      'exercise': 'Put on workout clothes',
      'meditation': 'Take one deep breath',
      'reading': 'Read one paragraph',
      'water_intake': 'Fill water bottle',
      'meal_logging': 'Take photo of one meal',
      'gratitude': 'Think of one thing you\'re grateful for'
    };
    
    return {
      action: twoMinuteVersions[habitType] || 'Do the smallest possible version',
      duration: '2 minutes or less',
      principle: 'two_minute_rule'
    };
  }

  calculateHabitSuccessRate(userId, habitType) {
    const streaks = this.habitStreaks.get(userId) || {};
    const habitData = streaks[habitType];
    
    if (!habitData) return 0;
    
    const totalDays = 30; // Consider last 30 days
    const completions = habitData.total_completions || 0;
    
    return Math.min(completions / totalDays, 1);
  }

  initializeBehavioralLayer() {
    console.log('Behavioral Psychology Layer initialized with habit science principles');
  }
}

// Export singleton instance
const behavioralPsychologyLayer = new BehavioralPsychologyLayer();

module.exports = {
  BehavioralPsychologyLayer,
  behavioralPsychologyLayer
};