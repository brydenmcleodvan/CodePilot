/**
 * Health Planning Toolkit
 * Structured, goal-driven health journeys with adaptive goals and progress tracking
 */

class HealthPlanningToolkit {
  constructor() {
    this.userPlans = new Map();
    this.goalTemplates = new Map();
    this.adaptiveGoals = new Map();
    this.progressTracking = new Map();
    this.achievements = new Map();
    
    // Health plan templates for different goals
    this.planTemplates = {
      sleep_optimization: {
        name: 'Sleep Optimization Journey',
        description: 'Improve sleep quality and establish consistent sleep patterns',
        duration_days: 90,
        difficulty: 'beginner',
        phases: {
          30: {
            name: 'Foundation Building',
            goals: [
              {
                type: 'sleep_duration',
                target: 7.5,
                unit: 'hours',
                frequency: 'daily',
                tolerance: 0.5,
                description: 'Maintain 7-8 hours of sleep nightly'
              },
              {
                type: 'bedtime_consistency',
                target: 22.5, // 10:30 PM
                unit: 'hour',
                frequency: 'daily',
                tolerance: 1,
                description: 'Go to bed within 1 hour of target time'
              },
              {
                type: 'screen_cutoff',
                target: 21, // 9 PM
                unit: 'hour',
                frequency: 'daily',
                tolerance: 0.5,
                description: 'No screens 1.5 hours before bed'
              }
            ],
            milestones: [
              {
                day: 7,
                requirement: 'sleep_duration_5_days',
                reward: 'Sleep Foundation Badge',
                unlock: 'advanced_sleep_tracking'
              },
              {
                day: 14,
                requirement: 'bedtime_consistency_7_days',
                reward: 'Rhythm Master Badge',
                unlock: 'sleep_environment_optimization'
              }
            ]
          },
          60: {
            name: 'Optimization & Refinement',
            goals: [
              {
                type: 'sleep_efficiency',
                target: 85,
                unit: 'percentage',
                frequency: 'weekly_average',
                tolerance: 5,
                description: 'Achieve 85% sleep efficiency'
              },
              {
                type: 'morning_energy',
                target: 7,
                unit: 'scale_1_10',
                frequency: 'daily',
                tolerance: 1,
                description: 'Rate morning energy as 7+ daily'
              },
              {
                type: 'caffeine_cutoff',
                target: 14, // 2 PM
                unit: 'hour',
                frequency: 'daily',
                tolerance: 1,
                description: 'No caffeine after 2 PM'
              }
            ]
          },
          90: {
            name: 'Mastery & Maintenance',
            goals: [
              {
                type: 'sleep_score',
                target: 80,
                unit: 'composite_score',
                frequency: 'weekly_average',
                tolerance: 5,
                description: 'Maintain overall sleep score of 80+'
              },
              {
                type: 'recovery_metrics',
                target: 75,
                unit: 'hrv_percentage',
                frequency: 'weekly_average',
                tolerance: 10,
                description: 'Optimize recovery through sleep'
              }
            ]
          }
        }
      },
      
      fitness_transformation: {
        name: 'Fitness Transformation',
        description: 'Build strength, endurance, and healthy exercise habits',
        duration_days: 90,
        difficulty: 'intermediate',
        phases: {
          30: {
            name: 'Movement Foundation',
            goals: [
              {
                type: 'daily_steps',
                target: 8000,
                unit: 'steps',
                frequency: 'daily',
                tolerance: 1000,
                description: 'Walk 8,000+ steps daily'
              },
              {
                type: 'workout_frequency',
                target: 3,
                unit: 'sessions',
                frequency: 'weekly',
                tolerance: 1,
                description: 'Complete 3 workout sessions per week'
              },
              {
                type: 'active_minutes',
                target: 150,
                unit: 'minutes',
                frequency: 'weekly',
                tolerance: 30,
                description: 'Accumulate 150 minutes of moderate activity'
              }
            ],
            milestones: [
              {
                day: 10,
                requirement: 'steps_goal_7_days',
                reward: 'Walker Badge',
                unlock: 'step_challenges'
              },
              {
                day: 21,
                requirement: 'workout_consistency_3_weeks',
                reward: 'Consistency Champion',
                unlock: 'advanced_workouts'
              }
            ]
          },
          60: {
            name: 'Strength & Endurance',
            goals: [
              {
                type: 'strength_progression',
                target: 20,
                unit: 'percentage_increase',
                frequency: 'monthly',
                tolerance: 5,
                description: 'Increase strength by 20% from baseline'
              },
              {
                type: 'cardio_endurance',
                target: 30,
                unit: 'minutes_continuous',
                frequency: 'weekly',
                tolerance: 5,
                description: 'Sustain 30 minutes continuous cardio'
              }
            ]
          },
          90: {
            name: 'Performance & Mastery',
            goals: [
              {
                type: 'fitness_score',
                target: 85,
                unit: 'composite_score',
                frequency: 'weekly_average',
                tolerance: 5,
                description: 'Achieve overall fitness score of 85+'
              }
            ]
          }
        }
      },
      
      nutrition_optimization: {
        name: 'Nutrition Optimization',
        description: 'Develop sustainable healthy eating habits and nutritional awareness',
        duration_days: 90,
        difficulty: 'beginner',
        phases: {
          30: {
            name: 'Awareness & Tracking',
            goals: [
              {
                type: 'food_logging',
                target: 6,
                unit: 'days_per_week',
                frequency: 'weekly',
                tolerance: 1,
                description: 'Log food intake 6 days per week'
              },
              {
                type: 'vegetable_servings',
                target: 5,
                unit: 'servings',
                frequency: 'daily',
                tolerance: 1,
                description: 'Consume 5 servings of vegetables daily'
              },
              {
                type: 'water_intake',
                target: 2.5,
                unit: 'liters',
                frequency: 'daily',
                tolerance: 0.5,
                description: 'Drink 2.5 liters of water daily'
              }
            ]
          },
          60: {
            name: 'Optimization & Balance',
            goals: [
              {
                type: 'macro_balance',
                target: { carbs: 45, protein: 25, fat: 30 },
                unit: 'percentage',
                frequency: 'weekly_average',
                tolerance: 5,
                description: 'Maintain balanced macronutrient ratios'
              },
              {
                type: 'processed_food_limit',
                target: 2,
                unit: 'servings',
                frequency: 'daily_max',
                tolerance: 1,
                description: 'Limit processed foods to 2 servings daily'
              }
            ]
          },
          90: {
            name: 'Sustainable Habits',
            goals: [
              {
                type: 'nutrition_score',
                target: 80,
                unit: 'composite_score',
                frequency: 'weekly_average',
                tolerance: 5,
                description: 'Maintain nutrition quality score of 80+'
              }
            ]
          }
        }
      },
      
      stress_management: {
        name: 'Stress Management & Mental Wellness',
        description: 'Build resilience and develop effective stress management techniques',
        duration_days: 90,
        difficulty: 'beginner',
        phases: {
          30: {
            name: 'Mindfulness Foundation',
            goals: [
              {
                type: 'meditation_practice',
                target: 10,
                unit: 'minutes',
                frequency: 'daily',
                tolerance: 5,
                description: 'Practice meditation for 10 minutes daily'
              },
              {
                type: 'stress_level',
                target: 5,
                unit: 'scale_1_10_max',
                frequency: 'daily_average',
                tolerance: 1,
                description: 'Keep daily stress levels below 5/10'
              },
              {
                type: 'gratitude_practice',
                target: 1,
                unit: 'entry',
                frequency: 'daily',
                tolerance: 0,
                description: 'Write one gratitude entry daily'
              }
            ]
          },
          60: {
            name: 'Resilience Building',
            goals: [
              {
                type: 'mood_stability',
                target: 7,
                unit: 'scale_1_10_min',
                frequency: 'weekly_average',
                tolerance: 1,
                description: 'Maintain mood score above 7/10'
              },
              {
                type: 'stress_recovery',
                target: 2,
                unit: 'hours_max',
                frequency: 'incident',
                tolerance: 1,
                description: 'Recover from stress within 2 hours'
              }
            ]
          },
          90: {
            name: 'Emotional Mastery',
            goals: [
              {
                type: 'mental_wellness_score',
                target: 85,
                unit: 'composite_score',
                frequency: 'weekly_average',
                tolerance: 5,
                description: 'Achieve mental wellness score of 85+'
              }
            ]
          }
        }
      }
    };

    // Adaptive goals engine rules
    this.adaptiveRules = {
      sleep_duration: {
        success_criteria: { consecutive_days: 5, target_achievement: 0.8 },
        adaptations: {
          increase_target: { amount: 0.25, max: 9 },
          add_quality_goal: { type: 'sleep_efficiency', target: 80 },
          unlock_advanced: ['sleep_environment', 'recovery_tracking']
        }
      },
      
      daily_steps: {
        success_criteria: { consecutive_days: 7, target_achievement: 0.85 },
        adaptations: {
          increase_target: { amount: 1000, max: 15000 },
          add_intensity_goal: { type: 'active_minutes', target: 30 },
          unlock_challenges: ['step_streaks', 'distance_goals']
        }
      },
      
      meditation_practice: {
        success_criteria: { consecutive_days: 10, target_achievement: 0.9 },
        adaptations: {
          increase_duration: { amount: 5, max: 30 },
          add_variety: { types: ['breathing', 'body_scan', 'loving_kindness'] },
          unlock_advanced: ['stress_response_tracking', 'mindfulness_challenges']
        }
      }
    };

    this.initializeToolkit();
  }

  /**
   * Create a personalized health plan for a user
   */
  async createHealthPlan(userId, planType, customizations = {}) {
    try {
      const template = this.planTemplates[planType];
      if (!template) {
        throw new Error(`Invalid plan type: ${planType}`);
      }

      // Get user's current health data for baseline
      const userBaseline = await this.getUserBaseline(userId);
      
      // Customize plan based on user data and preferences
      const personalizedPlan = await this.personalizePlan(template, userBaseline, customizations);
      
      // Create plan instance
      const plan = {
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: planType,
        template: template.name,
        status: 'active',
        created_at: new Date().toISOString(),
        start_date: customizations.start_date || new Date().toISOString(),
        current_phase: 30,
        current_day: 1,
        completion_percentage: 0,
        goals: personalizedPlan.goals,
        milestones: personalizedPlan.milestones,
        adaptive_adjustments: [],
        weekly_calendar: this.generateWeeklyCalendar(personalizedPlan),
        daily_checklist: this.generateDailyChecklist(personalizedPlan, 1),
        progress_history: []
      };

      this.userPlans.set(userId, plan);
      
      return {
        success: true,
        plan,
        estimated_duration: template.duration_days,
        initial_goals: personalizedPlan.goals.length,
        message: `Your ${template.name} journey has begun!`
      };

    } catch (error) {
      console.error('Health plan creation error:', error);
      throw new Error(`Failed to create health plan: ${error.message}`);
    }
  }

  /**
   * Update plan progress and check for adaptive adjustments
   */
  async updatePlanProgress(userId, progressData) {
    try {
      const plan = this.userPlans.get(userId);
      if (!plan) {
        throw new Error('No active health plan found');
      }

      // Record progress
      const progressEntry = {
        date: new Date().toISOString(),
        day: plan.current_day,
        phase: plan.current_phase,
        data: progressData,
        goals_completed: [],
        milestones_achieved: []
      };

      // Check goal completion
      for (const goal of plan.goals) {
        const completed = this.checkGoalCompletion(goal, progressData, plan.progress_history);
        if (completed) {
          progressEntry.goals_completed.push(goal.type);
        }
      }

      // Check milestone achievements
      const newMilestones = this.checkMilestones(plan, progressEntry);
      progressEntry.milestones_achieved = newMilestones;

      // Add to progress history
      plan.progress_history.push(progressEntry);

      // Check for adaptive adjustments
      const adaptations = await this.checkAdaptiveGoals(plan, progressEntry);
      if (adaptations.length > 0) {
        plan.adaptive_adjustments.push(...adaptations);
        await this.applyAdaptations(plan, adaptations);
      }

      // Update plan status
      plan.current_day++;
      plan.completion_percentage = this.calculateCompletionPercentage(plan);
      
      // Check for phase advancement
      if (plan.current_day > plan.current_phase && plan.current_phase < 90) {
        await this.advancePhase(plan);
      }

      // Update daily checklist
      plan.daily_checklist = this.generateDailyChecklist(plan, plan.current_day);

      // Update plan
      this.userPlans.set(userId, plan);

      return {
        success: true,
        progress: progressEntry,
        adaptations,
        new_milestones: newMilestones,
        completion_percentage: plan.completion_percentage,
        next_phase: plan.current_day > plan.current_phase ? plan.current_phase + 30 : null
      };

    } catch (error) {
      console.error('Plan progress update error:', error);
      throw new Error(`Failed to update plan progress: ${error.message}`);
    }
  }

  /**
   * Get user's current health plan and status
   */
  async getUserPlan(userId) {
    const plan = this.userPlans.get(userId);
    if (!plan) {
      return null;
    }

    // Calculate current statistics
    const stats = this.calculatePlanStatistics(plan);
    
    return {
      plan,
      stats,
      current_streak: this.calculateCurrentStreak(plan),
      upcoming_milestones: this.getUpcomingMilestones(plan),
      suggested_focus: this.getSuggestedFocus(plan)
    };
  }

  /**
   * Generate weekly calendar for plan
   */
  generateWeeklyCalendar(plan) {
    const calendar = [];
    const today = new Date();
    
    for (let week = 0; week < 13; week++) { // 90 days = ~13 weeks
      const weekData = {
        week_number: week + 1,
        start_date: new Date(today.getTime() + week * 7 * 24 * 60 * 60 * 1000).toISOString(),
        focus_areas: this.getWeeklyFocus(plan, week + 1),
        goals: this.getWeeklyGoals(plan, week + 1),
        challenges: this.getWeeklyChallenges(plan, week + 1)
      };
      calendar.push(weekData);
    }
    
    return calendar;
  }

  /**
   * Generate daily checklist
   */
  generateDailyChecklist(plan, day) {
    const phase = day <= 30 ? 30 : day <= 60 ? 60 : 90;
    const template = this.planTemplates[plan.type];
    const phaseGoals = template.phases[phase].goals;
    
    const checklist = [];
    
    for (const goal of phaseGoals) {
      if (goal.frequency === 'daily' || goal.frequency.includes('daily')) {
        checklist.push({
          id: goal.type,
          task: goal.description,
          target: goal.target,
          unit: goal.unit,
          completed: false,
          priority: this.getTaskPriority(goal.type),
          estimated_time: this.getEstimatedTime(goal.type)
        });
      }
    }

    // Add phase-specific tasks
    const phaseSpecificTasks = this.getPhaseSpecificTasks(plan.type, phase, day);
    checklist.push(...phaseSpecificTasks);

    return {
      date: new Date().toISOString(),
      day,
      phase,
      tasks: checklist,
      estimated_total_time: checklist.reduce((sum, task) => sum + task.estimated_time, 0)
    };
  }

  /**
   * Check if goals are completed
   */
  checkGoalCompletion(goal, progressData, history) {
    const dataKey = goal.type;
    const currentValue = progressData[dataKey];
    
    if (currentValue === undefined) return false;

    switch (goal.frequency) {
      case 'daily':
        return this.isWithinTolerance(currentValue, goal.target, goal.tolerance);
      
      case 'weekly':
        const weeklyData = this.getWeeklyData(history, dataKey);
        return weeklyData.length >= goal.target;
      
      case 'weekly_average':
        const weeklyAvg = this.calculateWeeklyAverage(history, dataKey);
        return this.isWithinTolerance(weeklyAvg, goal.target, goal.tolerance);
      
      default:
        return this.isWithinTolerance(currentValue, goal.target, goal.tolerance);
    }
  }

  /**
   * Check for milestone achievements
   */
  checkMilestones(plan, progressEntry) {
    const achievedMilestones = [];
    const template = this.planTemplates[plan.type];
    const currentPhase = template.phases[plan.current_phase];
    
    if (currentPhase.milestones) {
      for (const milestone of currentPhase.milestones) {
        if (plan.current_day >= milestone.day) {
          const achieved = this.checkMilestoneRequirement(
            milestone.requirement, 
            plan.progress_history, 
            progressEntry
          );
          
          if (achieved && !this.isMilestoneAlreadyAchieved(plan, milestone)) {
            achievedMilestones.push({
              ...milestone,
              achieved_on: new Date().toISOString(),
              phase: plan.current_phase
            });
          }
        }
      }
    }
    
    return achievedMilestones;
  }

  /**
   * Check for adaptive goal adjustments
   */
  async checkAdaptiveGoals(plan, progressEntry) {
    const adaptations = [];
    
    for (const goalType of progressEntry.goals_completed) {
      const rule = this.adaptiveRules[goalType];
      if (rule) {
        const shouldAdapt = this.shouldTriggerAdaptation(plan, goalType, rule);
        if (shouldAdapt) {
          const adaptation = this.generateAdaptation(plan, goalType, rule);
          adaptations.push(adaptation);
        }
      }
    }
    
    return adaptations;
  }

  /**
   * Apply adaptive adjustments to plan
   */
  async applyAdaptations(plan, adaptations) {
    for (const adaptation of adaptations) {
      switch (adaptation.type) {
        case 'increase_target':
          await this.increaseGoalTarget(plan, adaptation);
          break;
        
        case 'add_goal':
          await this.addNewGoal(plan, adaptation);
          break;
        
        case 'unlock_feature':
          await this.unlockFeature(plan, adaptation);
          break;
        
        case 'add_challenge':
          await this.addChallenge(plan, adaptation);
          break;
      }
    }
  }

  /**
   * Calculate plan completion percentage
   */
  calculateCompletionPercentage(plan) {
    const totalDays = 90;
    const currentDay = plan.current_day;
    const dayProgress = (currentDay / totalDays) * 100;
    
    // Factor in goal completion rate
    const recentGoalCompletion = this.calculateRecentGoalCompletion(plan);
    const weightedProgress = (dayProgress * 0.7) + (recentGoalCompletion * 0.3);
    
    return Math.min(100, Math.round(weightedProgress));
  }

  // Helper methods

  async getUserBaseline(userId) {
    // In production, fetch user's recent health data
    return {
      average_sleep: 7.2,
      average_steps: 6500,
      fitness_level: 'beginner',
      stress_level: 6,
      current_habits: ['irregular_sleep', 'sedentary'],
      health_goals: ['better_sleep', 'more_energy']
    };
  }

  async personalizePlan(template, baseline, customizations) {
    const personalizedGoals = template.phases[30].goals.map(goal => {
      // Adjust targets based on baseline
      if (goal.type === 'sleep_duration' && baseline.average_sleep) {
        goal.target = Math.max(goal.target, baseline.average_sleep + 0.5);
      }
      
      if (goal.type === 'daily_steps' && baseline.average_steps) {
        goal.target = Math.max(goal.target, baseline.average_steps + 1500);
      }
      
      return goal;
    });

    return {
      goals: personalizedGoals,
      milestones: template.phases[30].milestones || []
    };
  }

  getWeeklyFocus(plan, week) {
    const focuses = {
      sleep_optimization: [
        'Sleep Schedule Foundation', 'Environment Optimization', 'Pre-sleep Routine',
        'Consistency Building', 'Quality Enhancement', 'Recovery Tracking'
      ],
      fitness_transformation: [
        'Movement Habits', 'Cardio Foundation', 'Strength Building',
        'Endurance Growth', 'Performance Optimization', 'Recovery Mastery'
      ]
    };
    
    const planFocuses = focuses[plan.type] || ['Health Improvement'];
    return planFocuses[Math.min(week - 1, planFocuses.length - 1)];
  }

  getWeeklyGoals(plan, week) {
    // Return goals relevant to this week
    return plan.goals.filter(goal => 
      goal.frequency === 'weekly' || goal.frequency === 'daily'
    ).slice(0, 3);
  }

  getWeeklyChallenges(plan, week) {
    const challenges = {
      sleep_optimization: [
        'Perfect Week Challenge: 7 nights of target sleep',
        'Consistency Master: Same bedtime 7 days',
        'Digital Detox: No screens 2 hours before bed'
      ],
      fitness_transformation: [
        'Step It Up: Exceed step goal 5 days',
        'Workout Warrior: Complete all planned workouts',
        'Active Recovery: Try new movement activities'
      ]
    };
    
    const planChallenges = challenges[plan.type] || [];
    return [planChallenges[Math.min(week - 1, planChallenges.length - 1)]].filter(Boolean);
  }

  getPhaseSpecificTasks(planType, phase, day) {
    const tasks = [];
    
    if (planType === 'sleep_optimization') {
      if (phase === 30) {
        tasks.push({
          id: 'sleep_environment_check',
          task: 'Optimize sleep environment (temperature, darkness, quiet)',
          target: 1,
          unit: 'check',
          completed: false,
          priority: 'medium',
          estimated_time: 10
        });
      }
    }
    
    return tasks;
  }

  getTaskPriority(taskType) {
    const priorities = {
      'sleep_duration': 'high',
      'bedtime_consistency': 'high',
      'daily_steps': 'medium',
      'meditation_practice': 'medium',
      'food_logging': 'low'
    };
    
    return priorities[taskType] || 'medium';
  }

  getEstimatedTime(taskType) {
    const times = {
      'sleep_duration': 0, // No active time required
      'bedtime_consistency': 5,
      'daily_steps': 60,
      'meditation_practice': 10,
      'food_logging': 15,
      'water_intake': 5
    };
    
    return times[taskType] || 15;
  }

  isWithinTolerance(value, target, tolerance) {
    if (typeof target === 'object') {
      // Handle complex targets like macro ratios
      return Object.keys(target).every(key => 
        Math.abs(value[key] - target[key]) <= tolerance
      );
    }
    
    return Math.abs(value - target) <= tolerance;
  }

  initializeToolkit() {
    console.log('Health Planning Toolkit initialized with', Object.keys(this.planTemplates).length, 'plan templates');
  }
}

// Export singleton instance
const healthPlanningToolkit = new HealthPlanningToolkit();

module.exports = {
  HealthPlanningToolkit,
  healthPlanningToolkit
};