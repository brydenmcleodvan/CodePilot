import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Brain,
  Calendar,
  Target,
  TrendingUp,
  Star,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Award,
  Lightbulb,
  Settings,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DailyPlan {
  day: number;
  date: string;
  theme: string;
  primaryFocus: string;
  tasks: {
    id: string;
    type: 'exercise' | 'nutrition' | 'mindfulness' | 'sleep' | 'habit';
    title: string;
    description: string;
    duration: number;
    difficulty: 'easy' | 'moderate' | 'challenging';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
    instructions: string[];
    adaptations: {
      easier: string;
      harder: string;
    };
    trackingMetric?: string;
    motivationalNote: string;
    completed?: boolean;
  }[];
  adaptiveElements: {
    weatherBackup: string;
    timeConstraints: string;
    energyLevelAdjustment: string;
  };
  progressMilestones: string[];
  reflectionPrompts: string[];
}

interface AIHealthPlan {
  id: string;
  userId: number;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  completionRate: number;
  objectives: {
    primary: string;
    secondary: string[];
    measurableGoals: {
      metric: string;
      target: number;
      unit: string;
      timeframe: string;
      currentProgress: number;
    }[];
  };
  adaptationStrategy: {
    performanceThresholds: {
      excellent: number;
      good: number;
      needsImprovement: number;
    };
    adjustmentTriggers: string[];
    progressIndicators: string[];
  };
  dailyPlans: DailyPlan[];
  weeklyThemes: {
    week: number;
    theme: string;
    focus: string;
    expectedOutcomes: string[];
    completed: boolean;
  }[];
  personalizedElements: {
    motivationalStyle: string;
    challengeLevel: string;
    preferredActivities: string[];
    adaptationFactors: string[];
  };
  progressTracking: {
    dailyCheckins: string[];
    weeklyAssessments: string[];
    adaptationPoints: number[];
  };
  status: 'active' | 'paused' | 'completed' | 'draft';
}

interface DailyAdvice {
  advice: string;
  adaptiveInstructions: string[];
  motivationalMessage: string;
  focusTips: string[];
}

export default function AIHealthPlansDashboard() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Fetch AI health plans
  const { data: healthPlans, isLoading } = useQuery<AIHealthPlan[]>({
    queryKey: ['/api/ai-health-plans'],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  // Fetch daily advice for current day
  const { data: dailyAdvice } = useQuery<DailyAdvice>({
    queryKey: ['/api/ai-health-plans/daily-advice', selectedPlan, currentDay],
    enabled: !!selectedPlan,
  });

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise': return '💪';
      case 'nutrition': return '🥗';
      case 'mindfulness': return '🧘';
      case 'sleep': return '😴';
      case 'habit': return '📝';
      default: return '✨';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'moderate': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'challenging': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      case 'anytime': return '⏰';
      default: return '📅';
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
  };

  const handleStartPlan = (planId: string) => {
    // In a real implementation, this would start the plan
    setSelectedPlan(planId);
    setCurrentDay(1);
  };

  // Sample data for demonstration
  const samplePlans: AIHealthPlan[] = [
    {
      id: 'plan-1',
      userId: 1,
      title: 'Foundation Builder: Strength & Wellness',
      description: 'A comprehensive 30-day program designed to build sustainable healthy habits with a focus on strength training, mindful nutrition, and stress management.',
      duration: 30,
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentDay: 5,
      completionRate: 78,
      objectives: {
        primary: 'Build sustainable healthy habits',
        secondary: [
          'Improve fitness and energy levels',
          'Establish consistent routines',
          'Enhance overall well-being'
        ],
        measurableGoals: [
          {
            metric: 'Exercise Frequency',
            target: 5,
            unit: 'days/week',
            timeframe: '30 days',
            currentProgress: 4
          },
          {
            metric: 'Sleep Quality',
            target: 8,
            unit: 'hours/night',
            timeframe: '30 days',
            currentProgress: 7.2
          },
          {
            metric: 'Stress Level',
            target: 3,
            unit: 'scale 1-10',
            timeframe: '30 days',
            currentProgress: 4.5
          }
        ]
      },
      adaptationStrategy: {
        performanceThresholds: {
          excellent: 90,
          good: 75,
          needsImprovement: 60
        },
        adjustmentTriggers: [
          'Low adherence rate (< 60%)',
          'Consistently low energy ratings',
          'User feedback indicating difficulty'
        ],
        progressIndicators: [
          'Task completion rate',
          'Subjective well-being scores',
          'Objective health metrics improvement'
        ]
      },
      dailyPlans: [
        {
          day: 5,
          date: new Date().toISOString(),
          theme: 'Foundation Building',
          primaryFocus: 'Strength Focus',
          tasks: [
            {
              id: 'task-5-exercise',
              type: 'exercise',
              title: 'Upper Body Strength',
              description: 'Tailored strength workout for moderate intensity',
              duration: 30,
              difficulty: 'moderate',
              timeOfDay: 'morning',
              instructions: [
                'Warm up for 5 minutes with light cardio',
                'Perform 3 sets of push-ups (8-12 reps)',
                'Complete 3 sets of dumbbell rows (8-10 reps)',
                'Finish with shoulder stretches'
              ],
              adaptations: {
                easier: 'Reduce to 2 sets or do modified push-ups',
                harder: 'Add extra set or increase weight resistance'
              },
              trackingMetric: 'duration',
              motivationalNote: 'Every rep brings you closer to your goals!',
              completed: false
            },
            {
              id: 'task-5-nutrition',
              type: 'nutrition',
              title: 'Protein-Rich Breakfast',
              description: 'Focus on balanced, energizing morning meal',
              duration: 15,
              difficulty: 'easy',
              timeOfDay: 'morning',
              instructions: [
                'Include high-quality protein (eggs, Greek yogurt, or protein smoothie)',
                'Add complex carbohydrates (oatmeal, whole grain toast)',
                'Include healthy fats (avocado, nuts, or seeds)',
                'Stay hydrated with water or herbal tea'
              ],
              adaptations: {
                easier: 'Prepare the night before or use simple options',
                harder: 'Track macronutrients and meal timing precisely'
              },
              motivationalNote: 'Fuel your body like the amazing machine it is!',
              completed: true
            },
            {
              id: 'task-5-mindfulness',
              type: 'mindfulness',
              title: 'Stress Check-In',
              description: '5-minute mindfulness practice',
              duration: 5,
              difficulty: 'easy',
              timeOfDay: 'evening',
              instructions: [
                'Find a quiet, comfortable position',
                'Take 5 deep breaths, focusing on exhale',
                'Notice any tension in your body',
                'Set intention for tomorrow'
              ],
              adaptations: {
                easier: 'Just focus on breathing for 2 minutes',
                harder: 'Extend to 10 minutes with guided meditation'
              },
              motivationalNote: 'This moment of mindfulness is a gift to yourself',
              completed: false
            }
          ],
          adaptiveElements: {
            weatherBackup: 'Indoor alternatives available for all outdoor activities',
            timeConstraints: 'All activities can be modified for 15-60 minute sessions',
            energyLevelAdjustment: 'Difficulty can be scaled based on daily energy levels'
          },
          progressMilestones: ['🎯 Started your wellness journey!'],
          reflectionPrompts: [
            'What felt most energizing today?',
            'How can I build on today\'s success tomorrow?',
            'What would I adjust about today\'s plan?'
          ]
        }
      ],
      weeklyThemes: [
        {
          week: 1,
          theme: 'Foundation Building',
          focus: 'Establishing routines and baseline habits',
          expectedOutcomes: ['Consistent daily movement', 'Better sleep schedule', 'Mindful eating habits'],
          completed: false
        },
        {
          week: 2,
          theme: 'Momentum Building',
          focus: 'Increasing activity levels and variety',
          expectedOutcomes: ['Improved endurance', 'More energy', 'Stronger habits'],
          completed: false
        },
        {
          week: 3,
          theme: 'Challenge and Growth',
          focus: 'Pushing boundaries and building resilience',
          expectedOutcomes: ['Increased strength', 'Better stress management', 'Confidence boost'],
          completed: false
        },
        {
          week: 4,
          theme: 'Integration and Sustainability',
          focus: 'Creating long-term lifestyle changes',
          expectedOutcomes: ['Sustainable routines', 'Improved metrics', 'Lasting motivation'],
          completed: false
        }
      ],
      personalizedElements: {
        motivationalStyle: 'achievement',
        challengeLevel: 'moderate',
        preferredActivities: ['strength_training', 'yoga', 'walking'],
        adaptationFactors: ['progress_rate', 'adherence', 'user_feedback']
      },
      progressTracking: {
        dailyCheckins: [
          'How did today\'s activities feel?',
          'What was your energy level?',
          'Any challenges or wins?'
        ],
        weeklyAssessments: [
          'Overall progress satisfaction',
          'Areas needing adjustment',
          'Motivation level check'
        ],
        adaptationPoints: [7, 14, 21]
      },
      status: 'active'
    }
  ];

  const sampleDailyAdvice: DailyAdvice = {
    advice: 'Day 5: You\'re building great momentum! Today\'s focus on upper body strength will complement your recent cardio work. Listen to your body and adjust intensity as needed.',
    adaptiveInstructions: [
      'Start with a dynamic warm-up to prepare your muscles',
      'Focus on form over speed - quality repetitions matter most',
      'Take 60-90 second rest between sets to maintain good form',
      'End with gentle stretching to aid recovery'
    ],
    motivationalMessage: 'You\'re 5 days into building a healthier you. Every workout is an investment in your future strength and vitality!',
    focusTips: [
      'Breathe steadily throughout each exercise',
      'Visualize your muscles working and getting stronger',
      'Celebrate the fact that you showed up today'
    ]
  };

  const displayPlans = healthPlans || samplePlans;
  const displayAdvice = dailyAdvice || sampleDailyAdvice;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <span>AI Health Plans</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Personalized 30-day wellness programs that adapt to your progress
          </p>
        </div>
        
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Zap className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Active Plan Overview */}
      {selectedPlan && (
        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <Brain className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800 dark:text-purple-200">
            <strong>Active Plan:</strong> {displayPlans.find(p => p.id === selectedPlan)?.title} - Day {currentDay} of 30
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="today">Today's Plan</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* AI Health Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPlan(plan.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {plan.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={
                          plan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' :
                          plan.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30' :
                          plan.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30'
                        }>
                          {plan.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress Overview */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{plan.completionRate}%</span>
                      </div>
                      <Progress value={plan.completionRate} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Day {plan.currentDay} of {plan.duration}
                      </p>
                    </div>

                    {/* Primary Objective */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Primary Goal
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {plan.objectives.primary}
                      </p>
                    </div>

                    {/* Measurable Goals */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Current Progress</h4>
                      <div className="space-y-2">
                        {plan.objectives.measurableGoals.slice(0, 2).map((goal, goalIndex) => (
                          <div key={goalIndex} className="flex items-center justify-between text-sm">
                            <span>{goal.metric}</span>
                            <span className="font-medium">
                              {goal.currentProgress}/{goal.target} {goal.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Themes */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Weekly Themes</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {plan.weeklyThemes.map((week, weekIndex) => (
                          <div key={weekIndex} className={`p-2 rounded-lg border text-xs ${
                            week.completed ? 'bg-green-50 border-green-200 text-green-800' :
                            weekIndex + 1 === Math.ceil(plan.currentDay / 7) ? 'bg-blue-50 border-blue-200 text-blue-800' :
                            'bg-gray-50 border-gray-200 text-gray-600'
                          }`}>
                            <p className="font-medium">Week {week.week}</p>
                            <p>{week.theme}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        {plan.status === 'active' ? (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        ) : plan.status === 'paused' ? (
                          <Button size="sm" onClick={() => handleStartPlan(plan.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleStartPlan(plan.id)}>
                            <Play className="h-4 w-4 mr-1" />
                            Start Plan
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          {selectedPlan ? (
            <div className="space-y-6">
              {/* Today's AI Advice */}
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <span>Today's AI Guidance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Daily Advice</h4>
                    <p className="text-gray-700 dark:text-gray-300">{displayAdvice.advice}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Adaptive Instructions</h4>
                    <ul className="space-y-1">
                      {displayAdvice.adaptiveInstructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                    <p className="text-purple-800 dark:text-purple-200 font-medium">
                      💜 {displayAdvice.motivationalMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Today's Tasks - Day {currentDay}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayPlans.find(p => p.id === selectedPlan)?.dailyPlans[0]?.tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`transition-all duration-200 ${
                        completedTasks.has(task.id) || task.completed 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20' 
                          : 'hover:shadow-md'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getTaskTypeIcon(task.type)}</span>
                              <div>
                                <CardTitle className="text-base">{task.title}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={getDifficultyColor(task.difficulty)}>
                                    {task.difficulty}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {task.duration}min
                                  </span>
                                  <span className="text-sm">{getTimeOfDayIcon(task.timeOfDay)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {(completedTasks.has(task.id) || task.completed) && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {task.description}
                          </p>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Instructions:</h5>
                            <ul className="space-y-1">
                              {task.instructions.slice(0, 3).map((instruction, instructionIndex) => (
                                <li key={instructionIndex} className="text-xs flex items-start space-x-2">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                              💪 {task.motivationalNote}
                            </p>
                          </div>
                          
                          {!(completedTasks.has(task.id) || task.completed) && (
                            <Button 
                              className="w-full" 
                              size="sm"
                              onClick={() => handleTaskComplete(task.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Focus Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Today's Focus Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {displayAdvice.focusTips.map((tip, index) => (
                      <div key={index} className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Active Plan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a plan to see today's personalized guidance
                </p>
                <Button onClick={() => setSelectedPlan(displayPlans[0]?.id)}>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress Overview */}
          {selectedPlan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Days Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Award className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Goals Progress */}
          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayPlans.find(p => p.id === selectedPlan)?.objectives.measurableGoals.map((goal, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{goal.metric}</span>
                        <span>{goal.currentProgress}/{goal.target} {goal.unit}</span>
                      </div>
                      <Progress value={(goal.currentProgress / goal.target) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Progress Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Your consistency has improved 40% since starting</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Morning workouts show highest completion rates</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Strength training sessions are your strongest area</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 text-sm">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Consider adding 5 minutes to meditation sessions</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Nutrition tracking could be improved on weekends</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>Plan adaptation suggested for week 2</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Adaptation Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Adaptation Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Performance Thresholds</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excellent</span>
                      <span className="text-green-600 font-medium">90%+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Good</span>
                      <span className="text-blue-600 font-medium">75-89%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Needs Improvement</span>
                      <span className="text-orange-600 font-medium">&lt;75%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Next Adaptation Point</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Day 7: Plan will automatically adjust based on your progress and feedback
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}