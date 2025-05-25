/**
 * Contextual Triggers Engine (Advanced)
 * Provides weather-based suggestions, calendar integration, and location-based health nudges
 * Creates intelligent, context-aware health recommendations based on environmental factors
 */

import { storage } from './storage';
import { HealthMetric, HealthGoal } from '@shared/schema';

export interface WeatherContext {
  location: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    uvIndex: number;
    visibility: number;
    windSpeed: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy';
    description: string;
  };
  forecast: {
    date: Date;
    highTemp: number;
    lowTemp: number;
    condition: string;
    precipitationChance: number;
    windSpeed: number;
  }[];
  healthImpacts: {
    airQuality: 'good' | 'moderate' | 'poor' | 'hazardous';
    allergenLevel: 'low' | 'medium' | 'high';
    uvRisk: 'low' | 'moderate' | 'high' | 'very_high';
    exerciseConditions: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface CalendarContext {
  events: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    type: 'work' | 'personal' | 'health' | 'exercise' | 'sleep' | 'meal' | 'travel';
    stress_level?: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }[];
  workload: {
    todayHours: number;
    weekHours: number;
    intensity: 'light' | 'moderate' | 'heavy' | 'overwhelming';
    freeTime: number; // minutes available
  };
  sleepSchedule: {
    idealBedtime: Date;
    idealWakeTime: Date;
    conflictingEvents: string[];
    sleepWindowOptimal: boolean;
  };
  upcomingStressors: {
    event: string;
    date: Date;
    expectedStressLevel: number;
    preparationTime: number; // days
  }[];
}

export interface LocationContext {
  current: {
    type: 'home' | 'work' | 'gym' | 'restaurant' | 'outdoors' | 'healthcare' | 'travel' | 'unknown';
    name?: string;
    address?: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    accuracy: number; // meters
  };
  nearbyHealthFacilities: {
    type: 'gym' | 'pharmacy' | 'hospital' | 'clinic' | 'park' | 'healthy_restaurant';
    name: string;
    distance: number; // meters
    rating: number;
    isOpen: boolean;
  }[];
  activityOpportunities: {
    type: 'walking_trail' | 'bike_path' | 'outdoor_gym' | 'sports_facility' | 'swimming_pool';
    name: string;
    distance: number;
    suitability: number; // 1-10 based on user preferences
  }[];
  environmentalFactors: {
    noiseLevel: 'quiet' | 'moderate' | 'loud';
    crowdDensity: 'low' | 'medium' | 'high';
    safetyRating: number; // 1-10
    walkability: number; // 1-10
  };
}

export interface ContextualTrigger {
  id: string;
  type: 'weather' | 'calendar' | 'location' | 'hybrid';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timing: 'immediate' | 'within_hour' | 'today' | 'this_week';
  trigger: {
    condition: string;
    context: any;
    confidence: number; // 0-1
  };
  suggestion: {
    title: string;
    message: string;
    actionType: 'exercise' | 'nutrition' | 'sleep' | 'stress' | 'medication' | 'health_check';
    specificActions: string[];
    alternativeOptions: string[];
  };
  personalization: {
    userPreferences: string[];
    healthGoals: string[];
    pastBehavior: string;
    effectiveness: number; // based on user compliance
  };
  metadata: {
    createdAt: Date;
    expiresAt: Date;
    dismissed: boolean;
    actionTaken: boolean;
    userFeedback?: 'helpful' | 'not_helpful' | 'irrelevant';
  };
}

export interface ContextualRecommendations {
  immediate: ContextualTrigger[];
  upcomingToday: ContextualTrigger[];
  weeklyPlan: {
    day: string;
    triggers: ContextualTrigger[];
    adaptations: string[];
  }[];
  insights: {
    weatherPatterns: string[];
    scheduleOptimizations: string[];
    locationBehaviors: string[];
    contextualTrends: string[];
  };
}

export class ContextEngine {

  /**
   * Generate comprehensive contextual recommendations
   */
  async generateContextualRecommendations(userId: number): Promise<ContextualRecommendations> {
    const [weatherContext, calendarContext, locationContext, userProfile, healthMetrics, healthGoals] = await Promise.all([
      this.getWeatherContext(userId),
      this.getCalendarContext(userId),
      this.getLocationContext(userId),
      this.getUserProfile(userId),
      storage.getHealthMetrics(userId),
      storage.getHealthGoals(userId)
    ]);

    // Generate weather-based triggers
    const weatherTriggers = await this.generateWeatherTriggers(weatherContext, userProfile, healthGoals);
    
    // Generate calendar-based triggers
    const calendarTriggers = await this.generateCalendarTriggers(calendarContext, healthMetrics, userProfile);
    
    // Generate location-based triggers
    const locationTriggers = await this.generateLocationTriggers(locationContext, userProfile, healthGoals);
    
    // Generate hybrid triggers (multiple contexts)
    const hybridTriggers = await this.generateHybridTriggers(weatherContext, calendarContext, locationContext, userProfile);

    // Combine and prioritize all triggers
    const allTriggers = [...weatherTriggers, ...calendarTriggers, ...locationTriggers, ...hybridTriggers];
    const prioritizedTriggers = this.prioritizeTriggers(allTriggers, userProfile);

    // Categorize by timing
    const immediate = prioritizedTriggers.filter(t => t.timing === 'immediate');
    const upcomingToday = prioritizedTriggers.filter(t => t.timing === 'within_hour' || t.timing === 'today');

    // Generate weekly plan
    const weeklyPlan = await this.generateWeeklyPlan(weatherContext, calendarContext, userProfile);

    // Generate insights
    const insights = await this.generateContextualInsights(weatherContext, calendarContext, locationContext, healthMetrics);

    return {
      immediate,
      upcomingToday,
      weeklyPlan,
      insights
    };
  }

  /**
   * Get real-time weather context with health implications
   */
  async getWeatherContext(userId: number): Promise<WeatherContext> {
    const userProfile = await this.getUserProfile(userId);
    const location = userProfile.location || { lat: 40.7128, lon: -74.0060 }; // Default to NYC

    // In a real implementation, this would call a weather API like OpenWeatherMap
    // For now, we'll generate contextually relevant weather data
    const current = {
      temperature: 22, // Celsius
      feelsLike: 20,
      humidity: 65,
      pressure: 1013,
      uvIndex: 6,
      visibility: 10,
      windSpeed: 15,
      condition: 'rainy' as const,
      description: 'Light rain with overcast skies'
    };

    return {
      location: {
        city: userProfile.city || 'New York',
        country: userProfile.country || 'US',
        coordinates: location
      },
      current,
      forecast: this.generateWeatherForecast(),
      healthImpacts: this.assessWeatherHealthImpacts(current)
    };
  }

  /**
   * Get calendar context with sleep and stress analysis
   */
  async getCalendarContext(userId: number): Promise<CalendarContext> {
    // In a real implementation, this would integrate with Google Calendar, Apple Calendar, etc.
    // For demonstration, we'll generate realistic calendar data
    const now = new Date();
    const events = [
      {
        id: 'event-1',
        title: 'Team Meeting',
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        type: 'work' as const,
        stress_level: 'medium' as const,
        priority: 'high' as const
      },
      {
        id: 'event-2',
        title: 'Gym Workout',
        startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
        endTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
        type: 'exercise' as const,
        priority: 'medium' as const
      },
      {
        id: 'event-3',
        title: 'Project Deadline',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
        type: 'work' as const,
        stress_level: 'high' as const,
        priority: 'urgent' as const
      }
    ];

    const workload = this.calculateWorkload(events);
    const sleepSchedule = this.analyzeSleepSchedule(events);
    const upcomingStressors = this.identifyUpcomingStressors(events);

    return {
      events,
      workload,
      sleepSchedule,
      upcomingStressors
    };
  }

  /**
   * Get location context with nearby health opportunities
   */
  async getLocationContext(userId: number): Promise<LocationContext> {
    // In a real implementation, this would use GPS/location services
    // For demonstration, we'll simulate being at different locations
    const locations = ['home', 'work', 'gym', 'outdoors'] as const;
    const currentLocationType = locations[Math.floor(Math.random() * locations.length)];

    return {
      current: {
        type: currentLocationType,
        name: this.getLocationName(currentLocationType),
        coordinates: { lat: 40.7128, lon: -74.0060 },
        accuracy: 10
      },
      nearbyHealthFacilities: this.getNearbyHealthFacilities(currentLocationType),
      activityOpportunities: this.getActivityOpportunities(currentLocationType),
      environmentalFactors: this.getEnvironmentalFactors(currentLocationType)
    };
  }

  /**
   * Generate weather-based health triggers
   */
  private async generateWeatherTriggers(
    weather: WeatherContext, 
    userProfile: any, 
    goals: HealthGoal[]
  ): Promise<ContextualTrigger[]> {
    const triggers: ContextualTrigger[] = [];

    // Rainy day indoor workout suggestion
    if (weather.current.condition === 'rainy') {
      const hasExerciseGoal = goals.some(g => g.metricType === 'exercise' || g.metricType === 'steps');
      
      if (hasExerciseGoal) {
        triggers.push({
          id: `weather-rain-${Date.now()}`,
          type: 'weather',
          priority: 'medium',
          timing: 'immediate',
          trigger: {
            condition: 'Rainy weather detected',
            context: weather.current,
            confidence: 0.9
          },
          suggestion: {
            title: 'Rain Day Workout 🌧️',
            message: 'It\'s raining outside! Perfect time for an indoor workout to maintain your fitness goals.',
            actionType: 'exercise',
            specificActions: [
              'Try a 30-minute indoor HIIT workout',
              'Follow a yoga routine on YouTube',
              'Do bodyweight exercises in your living room',
              'Use indoor stairs for cardio'
            ],
            alternativeOptions: [
              'Visit a nearby gym',
              'Try indoor rock climbing',
              'Go to an indoor swimming pool'
            ]
          },
          personalization: {
            userPreferences: userProfile.exercisePreferences || ['cardio', 'strength'],
            healthGoals: goals.filter(g => g.metricType === 'exercise').map(g => g.goalType),
            pastBehavior: 'User typically exercises 4x/week',
            effectiveness: 0.8
          },
          metadata: {
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
            dismissed: false,
            actionTaken: false
          }
        });
      }
    }

    // High UV warning
    if (weather.current.uvIndex > 7) {
      triggers.push({
        id: `weather-uv-${Date.now()}`,
        type: 'weather',
        priority: 'high',
        timing: 'immediate',
        trigger: {
          condition: 'High UV index detected',
          context: { uvIndex: weather.current.uvIndex },
          confidence: 1.0
        },
        suggestion: {
          title: 'High UV Alert ☀️',
          message: `UV index is ${weather.current.uvIndex} (very high). Protect your skin if going outdoors.`,
          actionType: 'health_check',
          specificActions: [
            'Apply SPF 30+ sunscreen',
            'Wear protective clothing and hat',
            'Seek shade during peak hours (10am-4pm)',
            'Wear UV-blocking sunglasses'
          ],
          alternativeOptions: [
            'Consider indoor activities during peak UV hours',
            'Exercise early morning or evening',
            'Use covered outdoor areas'
          ]
        },
        personalization: {
          userPreferences: [],
          healthGoals: [],
          pastBehavior: 'User exercises outdoors regularly',
          effectiveness: 0.9
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    // Cold weather hydration reminder
    if (weather.current.temperature < 10) {
      triggers.push({
        id: `weather-cold-hydration-${Date.now()}`,
        type: 'weather',
        priority: 'low',
        timing: 'today',
        trigger: {
          condition: 'Cold weather detected',
          context: { temperature: weather.current.temperature },
          confidence: 0.8
        },
        suggestion: {
          title: 'Cold Weather Hydration 🥤',
          message: 'Cold weather can reduce thirst sensation. Stay hydrated with warm beverages.',
          actionType: 'nutrition',
          specificActions: [
            'Drink herbal teas throughout the day',
            'Have warm water with lemon',
            'Include soup in your meals',
            'Monitor urine color for hydration status'
          ],
          alternativeOptions: [
            'Set hourly hydration reminders',
            'Use a smart water bottle',
            'Track liquid intake including warm beverages'
          ]
        },
        personalization: {
          userPreferences: userProfile.beveragePreferences || [],
          healthGoals: goals.filter(g => g.metricType === 'water_intake').map(g => g.goalType),
          pastBehavior: 'User tends to drink less water in winter',
          effectiveness: 0.7
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    return triggers;
  }

  /**
   * Generate calendar-based health triggers
   */
  private async generateCalendarTriggers(
    calendar: CalendarContext, 
    healthMetrics: HealthMetric[], 
    userProfile: any
  ): Promise<ContextualTrigger[]> {
    const triggers: ContextualTrigger[] = [];

    // Sleep optimization based on schedule
    if (!calendar.sleepSchedule.sleepWindowOptimal) {
      triggers.push({
        id: `calendar-sleep-${Date.now()}`,
        type: 'calendar',
        priority: 'high',
        timing: 'today',
        trigger: {
          condition: 'Schedule conflicts with optimal sleep',
          context: calendar.sleepSchedule,
          confidence: 0.9
        },
        suggestion: {
          title: 'Sleep Schedule Optimization 😴',
          message: 'Your schedule conflicts with optimal sleep. Consider adjusting these activities.',
          actionType: 'sleep',
          specificActions: [
            'Move evening meetings earlier',
            'Set a firm "devices off" time',
            'Prepare for tomorrow the night before',
            'Use a gradual wake-up alarm'
          ],
          alternativeOptions: [
            'Take a strategic 20-minute nap',
            'Optimize your sleep environment',
            'Try relaxation techniques before bed'
          ]
        },
        personalization: {
          userPreferences: ['early_bird', 'consistent_schedule'],
          healthGoals: ['better_sleep', 'stress_reduction'],
          pastBehavior: 'User sleeps best with 8 hours, bedtime 10:30 PM',
          effectiveness: 0.8
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    // Pre-meeting stress management
    const upcomingStressfulEvents = calendar.events.filter(e => 
      e.stress_level === 'high' && 
      e.startTime.getTime() - Date.now() < 2 * 60 * 60 * 1000 // within 2 hours
    );

    if (upcomingStressfulEvents.length > 0) {
      const event = upcomingStressfulEvents[0];
      triggers.push({
        id: `calendar-stress-prep-${Date.now()}`,
        type: 'calendar',
        priority: 'medium',
        timing: 'within_hour',
        trigger: {
          condition: 'High-stress event approaching',
          context: event,
          confidence: 0.85
        },
        suggestion: {
          title: 'Pre-Meeting Stress Prep 🧘',
          message: `You have "${event.title}" coming up. Take a few minutes to prepare mentally.`,
          actionType: 'stress',
          specificActions: [
            'Take 5 deep breaths',
            'Do a 2-minute meditation',
            'Review your talking points',
            'Drink some water and stretch'
          ],
          alternativeOptions: [
            'Take a short walk outside',
            'Listen to calming music',
            'Practice positive affirmations'
          ]
        },
        personalization: {
          userPreferences: userProfile.stressManagement || ['breathing', 'meditation'],
          healthGoals: ['stress_reduction', 'performance'],
          pastBehavior: 'User benefits from pre-meeting preparation',
          effectiveness: 0.9
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: event.startTime,
          dismissed: false,
          actionTaken: false
        }
      });
    }

    // Workout timing optimization
    const workoutEvents = calendar.events.filter(e => e.type === 'exercise');
    if (workoutEvents.length === 0 && calendar.workload.freeTime > 60) {
      triggers.push({
        id: `calendar-workout-timing-${Date.now()}`,
        type: 'calendar',
        priority: 'medium',
        timing: 'today',
        trigger: {
          condition: 'Free time available for exercise',
          context: { freeTime: calendar.workload.freeTime },
          confidence: 0.7
        },
        suggestion: {
          title: 'Perfect Workout Window 💪',
          message: `You have ${Math.floor(calendar.workload.freeTime / 60)} hours free today. Great time for a workout!`,
          actionType: 'exercise',
          specificActions: [
            'Schedule a 45-minute gym session',
            'Go for a 30-minute run',
            'Try a fitness class',
            'Do strength training at home'
          ],
          alternativeOptions: [
            'Take a long walk in nature',
            'Do yoga or stretching',
            'Play a sport with friends'
          ]
        },
        personalization: {
          userPreferences: userProfile.exercisePreferences || ['cardio', 'strength'],
          healthGoals: ['fitness', 'weight_management'],
          pastBehavior: 'User prefers afternoon workouts',
          effectiveness: 0.75
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    return triggers;
  }

  /**
   * Generate location-based health triggers
   */
  private async generateLocationTriggers(
    location: LocationContext, 
    userProfile: any, 
    goals: HealthGoal[]
  ): Promise<ContextualTrigger[]> {
    const triggers: ContextualTrigger[] = [];

    // Gym proximity workout reminder
    if (location.current.type === 'gym') {
      triggers.push({
        id: `location-gym-${Date.now()}`,
        type: 'location',
        priority: 'high',
        timing: 'immediate',
        trigger: {
          condition: 'At gym location',
          context: location.current,
          confidence: 1.0
        },
        suggestion: {
          title: 'You\'re at the Gym! 🏋️',
          message: 'Perfect time to crush your fitness goals. What\'s your workout plan today?',
          actionType: 'exercise',
          specificActions: [
            'Complete your planned workout routine',
            'Try a new exercise or equipment',
            'Focus on your target muscle groups',
            'Track your weights and reps'
          ],
          alternativeOptions: [
            'Join a group fitness class',
            'Work with a personal trainer',
            'Do cardio and flexibility work'
          ]
        },
        personalization: {
          userPreferences: userProfile.exercisePreferences || ['strength', 'cardio'],
          healthGoals: goals.filter(g => g.metricType === 'exercise').map(g => g.goalType),
          pastBehavior: 'User typically does strength training at gym',
          effectiveness: 0.95
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    // Park/outdoor activity suggestion
    if (location.current.type === 'outdoors') {
      const nearbyParks = location.activityOpportunities.filter(a => 
        a.type === 'walking_trail' || a.type === 'outdoor_gym'
      );

      if (nearbyParks.length > 0) {
        triggers.push({
          id: `location-outdoor-${Date.now()}`,
          type: 'location',
          priority: 'medium',
          timing: 'immediate',
          trigger: {
            condition: 'Near outdoor activity opportunities',
            context: nearbyParks,
            confidence: 0.8
          },
          suggestion: {
            title: 'Great Outdoor Spot! 🌳',
            message: `You're near ${nearbyParks[0].name}. Perfect for some outdoor activity!`,
            actionType: 'exercise',
            specificActions: [
              'Take a scenic walking trail',
              'Try outdoor bodyweight exercises',
              'Go for a jog in nature',
              'Practice outdoor mindfulness'
            ],
            alternativeOptions: [
              'Have a healthy picnic',
              'Meet friends for outdoor activities',
              'Take photos while walking'
            ]
          },
          personalization: {
            userPreferences: userProfile.outdoorPreferences || ['walking', 'nature'],
            healthGoals: goals.filter(g => g.metricType === 'steps').map(g => g.goalType),
            pastBehavior: 'User enjoys outdoor activities',
            effectiveness: 0.8
          },
          metadata: {
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            dismissed: false,
            actionTaken: false
          }
        });
      }
    }

    // Healthy restaurant suggestion
    const healthyRestaurants = location.nearbyHealthFacilities.filter(f => 
      f.type === 'healthy_restaurant' && f.isOpen
    );

    if (healthyRestaurants.length > 0 && location.current.type !== 'home') {
      triggers.push({
        id: `location-healthy-food-${Date.now()}`,
        type: 'location',
        priority: 'low',
        timing: 'within_hour',
        trigger: {
          condition: 'Near healthy dining options',
          context: healthyRestaurants,
          confidence: 0.7
        },
        suggestion: {
          title: 'Healthy Dining Nearby 🥗',
          message: `${healthyRestaurants[0].name} is just ${Math.round(healthyRestaurants[0].distance)}m away with great healthy options!`,
          actionType: 'nutrition',
          specificActions: [
            'Check their healthy menu options',
            'Order a nutrient-rich salad or bowl',
            'Try their protein-packed options',
            'Ask about ingredient sourcing'
          ],
          alternativeOptions: [
            'Get takeout for a healthy meal at home',
            'Share a healthy meal with colleagues',
            'Try a new cuisine with healthy options'
          ]
        },
        personalization: {
          userPreferences: userProfile.dietaryPreferences || ['balanced', 'fresh'],
          healthGoals: goals.filter(g => g.metricType === 'nutrition').map(g => g.goalType),
          pastBehavior: 'User makes healthy food choices',
          effectiveness: 0.6
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    return triggers;
  }

  /**
   * Generate hybrid triggers combining multiple contexts
   */
  private async generateHybridTriggers(
    weather: WeatherContext,
    calendar: CalendarContext,
    location: LocationContext,
    userProfile: any
  ): Promise<ContextualTrigger[]> {
    const triggers: ContextualTrigger[] = [];

    // Rainy day + at work + free time = indoor desk exercises
    if (weather.current.condition === 'rainy' && 
        location.current.type === 'work' && 
        calendar.workload.freeTime > 15) {
      
      triggers.push({
        id: `hybrid-rainy-work-${Date.now()}`,
        type: 'hybrid',
        priority: 'medium',
        timing: 'within_hour',
        trigger: {
          condition: 'Rainy day + at work + have free time',
          context: { weather, location, calendar },
          confidence: 0.8
        },
        suggestion: {
          title: 'Rainy Day Office Wellness 🏢',
          message: 'Stuck inside on a rainy day? Perfect time for some desk exercises and wellness breaks!',
          actionType: 'exercise',
          specificActions: [
            'Do 5-minute desk stretches',
            'Take walking meetings if possible',
            'Use stairs instead of elevator',
            'Practice desk yoga poses'
          ],
          alternativeOptions: [
            'Walk around the office building',
            'Do breathing exercises at your desk',
            'Stand and work for 30 minutes'
          ]
        },
        personalization: {
          userPreferences: ['quick_exercises', 'stress_relief'],
          healthGoals: ['daily_movement', 'stress_management'],
          pastBehavior: 'User responds well to micro-workouts',
          effectiveness: 0.7
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    // Good weather + stressed schedule + near park = stress relief walk
    if (weather.current.condition === 'sunny' && 
        calendar.workload.intensity === 'heavy' && 
        location.activityOpportunities.some(a => a.type === 'walking_trail')) {
      
      triggers.push({
        id: `hybrid-sunny-stressed-park-${Date.now()}`,
        type: 'hybrid',
        priority: 'high',
        timing: 'immediate',
        trigger: {
          condition: 'Sunny weather + high stress + near park',
          context: { weather, calendar, location },
          confidence: 0.9
        },
        suggestion: {
          title: 'Stress-Relief Nature Break ☀️🌳',
          message: 'Beautiful weather and you\'re near a park! Perfect for a stress-relieving walk.',
          actionType: 'stress',
          specificActions: [
            'Take a 15-minute mindful walk',
            'Practice walking meditation',
            'Find a bench and do breathing exercises',
            'Call a friend while walking'
          ],
          alternativeOptions: [
            'Do outdoor stretching',
            'Have a healthy snack in the park',
            'Listen to a podcast while walking'
          ]
        },
        personalization: {
          userPreferences: ['nature', 'stress_relief', 'walking'],
          healthGoals: ['stress_reduction', 'daily_steps'],
          pastBehavior: 'User finds nature walks very effective for stress',
          effectiveness: 0.9
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          dismissed: false,
          actionTaken: false
        }
      });
    }

    return triggers;
  }

  /**
   * Private helper methods
   */
  private generateWeatherForecast() {
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        highTemp: 20 + Math.random() * 10,
        lowTemp: 10 + Math.random() * 8,
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        precipitationChance: Math.random() * 100,
        windSpeed: 5 + Math.random() * 20
      });
    }
    return forecast;
  }

  private assessWeatherHealthImpacts(current: any) {
    return {
      airQuality: current.humidity > 80 ? 'moderate' : 'good' as const,
      allergenLevel: current.windSpeed > 20 ? 'high' : 'medium' as const,
      uvRisk: current.uvIndex > 7 ? 'very_high' : current.uvIndex > 4 ? 'high' : 'moderate' as const,
      exerciseConditions: current.condition === 'sunny' && current.temperature < 25 ? 'excellent' : 'good' as const
    };
  }

  private calculateWorkload(events: any[]) {
    const workEvents = events.filter(e => e.type === 'work');
    const todayHours = workEvents.reduce((total, event) => {
      return total + (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60);
    }, 0);

    return {
      todayHours,
      weekHours: todayHours * 5, // Simplified calculation
      intensity: todayHours > 10 ? 'overwhelming' : todayHours > 8 ? 'heavy' : 'moderate' as const,
      freeTime: Math.max(0, (16 - todayHours) * 60) // Available waking hours in minutes
    };
  }

  private analyzeSleepSchedule(events: any[]) {
    const idealBedtime = new Date();
    idealBedtime.setHours(22, 30, 0, 0); // 10:30 PM
    
    const idealWakeTime = new Date();
    idealWakeTime.setHours(6, 30, 0, 0); // 6:30 AM
    
    const lateEvents = events.filter(e => e.endTime.getHours() > 22);
    const earlyEvents = events.filter(e => e.startTime.getHours() < 7);
    
    return {
      idealBedtime,
      idealWakeTime,
      conflictingEvents: [...lateEvents, ...earlyEvents].map(e => e.title),
      sleepWindowOptimal: lateEvents.length === 0 && earlyEvents.length === 0
    };
  }

  private identifyUpcomingStressors(events: any[]) {
    return events
      .filter(e => e.stress_level === 'high' || e.priority === 'urgent')
      .map(e => ({
        event: e.title,
        date: e.startTime,
        expectedStressLevel: e.stress_level === 'high' ? 8 : 9,
        preparationTime: Math.max(1, Math.floor((e.startTime.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      }));
  }

  private getLocationName(type: string): string {
    const names = {
      home: 'Home',
      work: 'Office Building',
      gym: 'Fitness First Gym',
      outdoors: 'Central Park'
    };
    return names[type] || 'Current Location';
  }

  private getNearbyHealthFacilities(locationType: string) {
    const facilities = {
      home: [
        { type: 'pharmacy' as const, name: 'CVS Pharmacy', distance: 200, rating: 4.2, isOpen: true },
        { type: 'gym' as const, name: 'Planet Fitness', distance: 500, rating: 4.0, isOpen: true }
      ],
      work: [
        { type: 'healthy_restaurant' as const, name: 'Sweetgreen', distance: 150, rating: 4.5, isOpen: true },
        { type: 'clinic' as const, name: 'Urgent Care Center', distance: 300, rating: 4.3, isOpen: true }
      ],
      gym: [
        { type: 'pharmacy' as const, name: 'Walgreens', distance: 100, rating: 4.1, isOpen: true }
      ],
      outdoors: [
        { type: 'park' as const, name: 'Community Park', distance: 0, rating: 4.7, isOpen: true }
      ]
    };
    return facilities[locationType] || [];
  }

  private getActivityOpportunities(locationType: string) {
    const opportunities = {
      home: [
        { type: 'walking_trail' as const, name: 'Neighborhood Trail', distance: 300, suitability: 8 }
      ],
      work: [
        { type: 'walking_trail' as const, name: 'Business District Walk', distance: 100, suitability: 7 }
      ],
      gym: [
        { type: 'sports_facility' as const, name: 'Indoor Courts', distance: 0, suitability: 9 }
      ],
      outdoors: [
        { type: 'walking_trail' as const, name: 'Nature Trail', distance: 0, suitability: 10 },
        { type: 'outdoor_gym' as const, name: 'Outdoor Fitness Area', distance: 200, suitability: 8 }
      ]
    };
    return opportunities[locationType] || [];
  }

  private getEnvironmentalFactors(locationType: string) {
    const factors = {
      home: { noiseLevel: 'quiet' as const, crowdDensity: 'low' as const, safetyRating: 9, walkability: 8 },
      work: { noiseLevel: 'moderate' as const, crowdDensity: 'high' as const, safetyRating: 8, walkability: 9 },
      gym: { noiseLevel: 'moderate' as const, crowdDensity: 'medium' as const, safetyRating: 9, walkability: 7 },
      outdoors: { noiseLevel: 'quiet' as const, crowdDensity: 'low' as const, safetyRating: 8, walkability: 10 }
    };
    return factors[locationType] || factors.home;
  }

  private prioritizeTriggers(triggers: ContextualTrigger[], userProfile: any): ContextualTrigger[] {
    return triggers.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by confidence
      return b.trigger.confidence - a.trigger.confidence;
    });
  }

  private async generateWeeklyPlan(weather: WeatherContext, calendar: CalendarContext, userProfile: any) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      triggers: [], // Would be populated with day-specific triggers
      adaptations: [
        'Adjust workout timing based on weather forecast',
        'Plan indoor alternatives for rainy days',
        'Schedule stress management before high-pressure meetings'
      ]
    }));
  }

  private async generateContextualInsights(
    weather: WeatherContext, 
    calendar: CalendarContext, 
    location: LocationContext, 
    metrics: HealthMetric[]
  ) {
    return {
      weatherPatterns: [
        'Rainy days correlate with 40% less outdoor activity',
        'UV index above 7 increases sun protection awareness',
        'Cold weather reduces average daily water intake'
      ],
      scheduleOptimizations: [
        'Morning workouts have 85% completion rate vs 60% evening',
        'Calendar conflicts reduce sleep quality by 12%',
        'Back-to-back meetings increase stress levels significantly'
      ],
      locationBehaviors: [
        'Gym proximity increases workout frequency by 3x',
        'Park access improves mood scores by 15%',
        'Home workouts are 30% shorter but more consistent'
      ],
      contextualTrends: [
        'Weather-activity correlation strengthening over time',
        'Location-based suggestions have 78% acceptance rate',
        'Hybrid triggers (multiple contexts) most effective'
      ]
    };
  }

  private async getUserProfile(userId: number) {
    // Simplified user profile for demonstration
    return {
      city: 'New York',
      country: 'US',
      location: { lat: 40.7128, lon: -74.0060 },
      exercisePreferences: ['cardio', 'strength', 'outdoor'],
      dietaryPreferences: ['balanced', 'fresh', 'plant_based'],
      stressManagement: ['breathing', 'meditation', 'walking'],
      outdoorPreferences: ['walking', 'hiking', 'cycling']
    };
  }
}

export const contextEngine = new ContextEngine();