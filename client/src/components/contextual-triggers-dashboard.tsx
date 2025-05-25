import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Cloud,
  Sun,
  CloudRain,
  MapPin,
  Calendar,
  Clock,
  Target,
  Lightbulb,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Activity,
  Heart,
  Brain,
  Utensils,
  Moon,
  Dumbbell,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface ContextualTrigger {
  id: string;
  type: 'weather' | 'calendar' | 'location' | 'hybrid';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timing: 'immediate' | 'within_hour' | 'today' | 'this_week';
  trigger: {
    condition: string;
    context: any;
    confidence: number;
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
    effectiveness: number;
  };
  metadata: {
    createdAt: string;
    expiresAt: string;
    dismissed: boolean;
    actionTaken: boolean;
    userFeedback?: 'helpful' | 'not_helpful' | 'irrelevant';
  };
}

interface ContextualRecommendations {
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

export default function ContextualTriggersDashboard() {
  const [dismissedTriggers, setDismissedTriggers] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  // Fetch contextual recommendations
  const { data: recommendations, isLoading } = useQuery<ContextualRecommendations>({
    queryKey: ['/api/contextual-recommendations'],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudRain className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'location': return <MapPin className="h-5 w-5" />;
      case 'hybrid': return <Zap className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'exercise': return <Dumbbell className="h-4 w-4" />;
      case 'nutrition': return <Utensils className="h-4 w-4" />;
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'stress': return <Brain className="h-4 w-4" />;
      case 'health_check': return <Heart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTimingIcon = (timing: string) => {
    switch (timing) {
      case 'immediate': return '🔥';
      case 'within_hour': return '⏰';
      case 'today': return '📅';
      case 'this_week': return '📋';
      default: return '💡';
    }
  };

  const handleDismissTrigger = (triggerId: string) => {
    setDismissedTriggers(prev => new Set([...prev, triggerId]));
  };

  const handleCompleteAction = (triggerId: string) => {
    setCompletedActions(prev => new Set([...prev, triggerId]));
  };

  const handleFeedback = (triggerId: string, feedback: 'helpful' | 'not_helpful') => {
    // In a real implementation, this would send feedback to the server
    console.log(`Feedback for ${triggerId}: ${feedback}`);
  };

  // Sample data for demonstration
  const sampleRecommendations: ContextualRecommendations = {
    immediate: [
      {
        id: 'weather-rain-1',
        type: 'weather',
        priority: 'medium',
        timing: 'immediate',
        trigger: {
          condition: 'Rainy weather detected',
          context: { condition: 'rainy', temperature: 22 },
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
          userPreferences: ['cardio', 'strength'],
          healthGoals: ['fitness', 'consistency'],
          pastBehavior: 'User typically exercises 4x/week',
          effectiveness: 0.8
        },
        metadata: {
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          dismissed: false,
          actionTaken: false
        }
      },
      {
        id: 'location-gym-1',
        type: 'location',
        priority: 'high',
        timing: 'immediate',
        trigger: {
          condition: 'At gym location',
          context: { type: 'gym', name: 'Fitness First Gym' },
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
          userPreferences: ['strength', 'cardio'],
          healthGoals: ['muscle_building', 'endurance'],
          pastBehavior: 'User typically does strength training at gym',
          effectiveness: 0.95
        },
        metadata: {
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          dismissed: false,
          actionTaken: false
        }
      }
    ],
    upcomingToday: [
      {
        id: 'calendar-stress-prep-1',
        type: 'calendar',
        priority: 'medium',
        timing: 'within_hour',
        trigger: {
          condition: 'High-stress event approaching',
          context: { event: 'Team Meeting', startTime: new Date(Date.now() + 2 * 60 * 60 * 1000) },
          confidence: 0.85
        },
        suggestion: {
          title: 'Pre-Meeting Stress Prep 🧘',
          message: 'You have "Team Meeting" coming up. Take a few minutes to prepare mentally.',
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
          userPreferences: ['breathing', 'meditation'],
          healthGoals: ['stress_reduction', 'performance'],
          pastBehavior: 'User benefits from pre-meeting preparation',
          effectiveness: 0.9
        },
        metadata: {
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          dismissed: false,
          actionTaken: false
        }
      },
      {
        id: 'hybrid-sunny-stressed-park-1',
        type: 'hybrid',
        priority: 'high',
        timing: 'today',
        trigger: {
          condition: 'Sunny weather + high stress + near park',
          context: { weather: 'sunny', stress: 'high', location: 'near_park' },
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
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          dismissed: false,
          actionTaken: false
        }
      }
    ],
    weeklyPlan: [
      {
        day: 'Monday',
        triggers: [],
        adaptations: [
          'Adjust workout timing based on weather forecast',
          'Plan indoor alternatives for rainy days',
          'Schedule stress management before high-pressure meetings'
        ]
      },
      {
        day: 'Tuesday',
        triggers: [],
        adaptations: [
          'Use lunch break for outdoor activities if sunny',
          'Plan healthy restaurant visits near work location',
          'Schedule gym time when energy levels are highest'
        ]
      }
    ],
    insights: {
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
    }
  };

  const displayData = recommendations || sampleRecommendations;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Lightbulb className="h-8 w-8 text-purple-600" />
            </div>
            <span>Smart Suggestions</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered contextual triggers based on weather, calendar, and location
          </p>
        </div>
        
        <div className="text-right">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Zap className="h-4 w-4 mr-1" />
            {displayData.immediate.length + displayData.upcomingToday.length} Active Suggestions
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current Suggestions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Today</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Immediate Contextual Triggers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span>Immediate Suggestions</span>
            </h3>
            
            {displayData.immediate.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayData.immediate
                  .filter(trigger => !dismissedTriggers.has(trigger.id))
                  .map((trigger, index) => (
                    <motion.div
                      key={trigger.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-l-4 hover:shadow-lg transition-shadow ${getPriorityColor(trigger.priority)}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              {getTypeIcon(trigger.type)}
                              <div>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <span>{trigger.suggestion.title}</span>
                                  <span className="text-lg">{getTimingIcon(trigger.timing)}</span>
                                </CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {trigger.type}
                                  </Badge>
                                  <Badge className={getPriorityColor(trigger.priority)}>
                                    {trigger.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismissTrigger(trigger.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {trigger.suggestion.message}
                            </p>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                              <span>Confidence: {Math.round(trigger.trigger.confidence * 100)}%</span>
                              <span>•</span>
                              <span>Effectiveness: {Math.round(trigger.personalization.effectiveness * 100)}%</span>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center space-x-1">
                              {getActionIcon(trigger.suggestion.actionType)}
                              <span>Recommended Actions:</span>
                            </h4>
                            <ul className="text-sm space-y-1">
                              {trigger.suggestion.specificActions.slice(0, 3).map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start space-x-2">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span className="text-gray-600 dark:text-gray-400">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {trigger.suggestion.alternativeOptions.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Alternative Options:</h4>
                              <div className="flex flex-wrap gap-2">
                                {trigger.suggestion.alternativeOptions.slice(0, 2).map((option, optionIndex) => (
                                  <Badge key={optionIndex} variant="outline" className="text-xs">
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleCompleteAction(trigger.id)}
                                disabled={completedActions.has(trigger.id)}
                                className="flex items-center space-x-1"
                              >
                                <Check className="h-4 w-4" />
                                <span>{completedActions.has(trigger.id) ? 'Completed' : 'Mark Done'}</span>
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(trigger.id, 'helpful')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(trigger.id, 'not_helpful')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Expires: {new Date(trigger.metadata.expiresAt).toLocaleTimeString()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Immediate Suggestions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We're monitoring your context and will suggest actions when opportunities arise.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {/* Upcoming Today Triggers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
              <span className="text-2xl">📅</span>
              <span>Coming Up Today</span>
            </h3>
            
            <div className="space-y-4">
              {displayData.upcomingToday
                .filter(trigger => !dismissedTriggers.has(trigger.id))
                .map((trigger, index) => (
                  <motion.div
                    key={trigger.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-l-4 ${getPriorityColor(trigger.priority)}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getTypeIcon(trigger.type)}
                              <h4 className="font-semibold">{trigger.suggestion.title}</h4>
                              <Badge className={getPriorityColor(trigger.priority)}>
                                {trigger.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {trigger.suggestion.message}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Quick Actions:</h5>
                                <ul className="text-sm space-y-1">
                                  {trigger.suggestion.specificActions.slice(0, 2).map((action, actionIndex) => (
                                    <li key={actionIndex} className="flex items-start space-x-2">
                                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium mb-2">Context:</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {trigger.trigger.condition}
                                </p>
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(trigger.trigger.confidence * 100)}% confidence
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500 capitalize">
                              {trigger.timing.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          {/* Weekly Plan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Weekly Contextual Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayData.weeklyPlan.slice(0, 6).map((dayPlan, index) => (
                <Card key={dayPlan.day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{dayPlan.day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Planned Adaptations:</h4>
                      <ul className="text-sm space-y-1">
                        {dayPlan.adaptations.map((adaptation, adaptationIndex) => (
                          <li key={adaptationIndex} className="flex items-start space-x-2">
                            <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-600 dark:text-gray-400">{adaptation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Smart Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CloudRain className="h-5 w-5 text-blue-600" />
                  <span>Weather Patterns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.weatherPatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Schedule Optimizations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.scheduleOptimizations.map((optimization, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{optimization}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span>Location Behaviors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.locationBehaviors.map((behavior, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{behavior}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Contextual Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {displayData.insights.contextualTrends.map((trend, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300">{trend}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Effectiveness Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Suggestion Effectiveness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">78%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actions Completed</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Weather-based suggestions</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Location-based suggestions</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calendar-based suggestions</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hybrid suggestions</span>
                    <span>91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}