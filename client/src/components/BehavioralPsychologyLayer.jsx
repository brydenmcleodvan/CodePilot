import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Brain,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Lightbulb,
  Coffee,
  Moon,
  Activity,
  Calendar,
  CheckCircle,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Behavioral Psychology Layer Component
 * Subtle habit science and reinforcement without heavy gamification
 */
export function BehavioralPsychologyLayer() {
  const [nudgesEnabled, setNudgesEnabled] = useState(true);
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch behavioral insights
  const { data: behaviorData, isLoading } = useQuery({
    queryKey: ['/api/behavior/insights'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/behavior/insights');
      return res.json();
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch habit streaks
  const { data: streaksData } = useQuery({
    queryKey: ['/api/behavior/streaks'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/behavior/streaks');
      return res.json();
    }
  });

  // Update habit completion mutation
  const updateHabitMutation = useMutation({
    mutationFn: async (habitData) => {
      const res = await apiRequest('POST', '/api/behavior/habit-update', habitData);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.streak_continued && data.is_personal_best) {
        toast({
          title: "Personal Best!",
          description: `You've reached a ${data.current_streak}-day streak - your longest yet!`
        });
      }
      queryClient.invalidateQueries(['/api/behavior/streaks']);
    }
  });

  const isDark = effectiveTheme === 'dark';
  const currentHour = new Date().getHours();

  // Get time-of-day context
  const getTimeContext = () => {
    if (currentHour >= 6 && currentHour <= 10) return 'morning';
    if (currentHour >= 13 && currentHour <= 16) return 'afternoon';
    if (currentHour >= 19 && currentHour <= 22) return 'evening';
    return 'other';
  };

  const timeContext = getTimeContext();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <span>Habit Intelligence</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Science-backed habit formation that works with your natural patterns. 
          Gentle nudges, streak protection, and micro-commitments that make healthy behaviors effortless.
        </p>
      </div>

      {/* Contextual Nudge */}
      <ContextualNudgeCard 
        timeContext={timeContext} 
        enabled={nudgesEnabled}
        behaviorData={behaviorData}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="habits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="habits">Habit Streaks</TabsTrigger>
          <TabsTrigger value="nudges">Smart Nudges</TabsTrigger>
          <TabsTrigger value="micro">Micro-Commitments</TabsTrigger>
          <TabsTrigger value="patterns">Your Patterns</TabsTrigger>
        </TabsList>

        {/* Habit Streaks Tab */}
        <TabsContent value="habits">
          <HabitStreaksPanel 
            streaksData={streaksData} 
            onHabitUpdate={(data) => updateHabitMutation.mutate(data)}
            isUpdating={updateHabitMutation.isPending}
          />
        </TabsContent>

        {/* Smart Nudges Tab */}
        <TabsContent value="nudges">
          <SmartNudgesPanel 
            enabled={nudgesEnabled}
            onToggle={setNudgesEnabled}
            timeContext={timeContext}
          />
        </TabsContent>

        {/* Micro-Commitments Tab */}
        <TabsContent value="micro">
          <MicroCommitmentsPanel behaviorData={behaviorData} />
        </TabsContent>

        {/* Behavior Patterns Tab */}
        <TabsContent value="patterns">
          <BehaviorPatternsPanel behaviorData={behaviorData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Contextual Nudge Card Component
 */
function ContextualNudgeCard({ timeContext, enabled, behaviorData }) {
  const [currentNudge, setCurrentNudge] = useState(null);

  useEffect(() => {
    if (enabled && behaviorData?.suggested_nudge) {
      setCurrentNudge(behaviorData.suggested_nudge);
    }
  }, [enabled, behaviorData]);

  const getTimeIcon = () => {
    switch (timeContext) {
      case 'morning': return <Coffee className="h-6 w-6 text-orange-600" />;
      case 'afternoon': return <Activity className="h-6 w-6 text-blue-600" />;
      case 'evening': return <Moon className="h-6 w-6 text-purple-600" />;
      default: return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getContextualMessage = () => {
    const messages = {
      morning: "Your energy is naturally high right now - perfect time for challenging habits!",
      afternoon: "Energy dipping? Great time for gentle movement or hydration.",
      evening: "Winding down time - ideal for reflection and tomorrow's preparation."
    };
    return messages[timeContext] || "Consider what small healthy action fits this moment.";
  };

  if (!enabled) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Smart Nudges Disabled</h3>
          <p className="text-gray-400">Enable contextual nudges to get gentle habit reminders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getTimeIcon()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold">Right Now</h3>
                  <Badge variant="outline" className="text-xs capitalize">
                    {timeContext}
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {getContextualMessage()}
                </p>
                
                {currentNudge && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-sm">Gentle Nudge</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {currentNudge.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Habit Streaks Panel Component
 */
function HabitStreaksPanel({ streaksData, onHabitUpdate, isUpdating }) {
  const habits = streaksData?.habits || [];

  const getStreakColor = (streak) => {
    if (streak >= 21) return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    if (streak >= 7) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    if (streak >= 3) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  return (
    <div className="space-y-4">
      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Building Streaks</h3>
            <p className="text-gray-600">
              Complete daily habits to build momentum and create lasting change.
            </p>
          </CardContent>
        </Card>
      ) : (
        habits.map((habit) => (
          <HabitStreakCard
            key={habit.id}
            habit={habit}
            onUpdate={onHabitUpdate}
            isUpdating={isUpdating}
            getStreakColor={getStreakColor}
          />
        ))
      )}
    </div>
  );
}

/**
 * Habit Streak Card Component
 */
function HabitStreakCard({ habit, onUpdate, isUpdating, getStreakColor }) {
  const [completed, setCompleted] = useState(habit.completed_today || false);

  const handleToggleCompletion = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    onUpdate({
      habit_type: habit.type,
      completed: newCompleted
    });
  };

  return (
    <Card className={`transition-all ${completed ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStreakColor(habit.current_streak)}`}>
              <Flame className="h-6 w-6" />
            </div>
            
            <div>
              <h4 className="font-semibold capitalize">{habit.name}</h4>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span>Current:</span>
                  <span className="font-medium">{habit.current_streak} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Best:</span>
                  <span className="font-medium">{habit.longest_streak} days</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {habit.risk_level > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                Streak at risk
              </Badge>
            )}
            
            <Button
              variant={completed ? "default" : "outline"}
              onClick={handleToggleCompletion}
              disabled={isUpdating}
              className={completed ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {completed ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Done Today
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </div>
        
        {habit.recovery_plan && habit.risk_level > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h5 className="font-medium text-orange-800 dark:text-orange-400 mb-1">
              Recovery Suggestion
            </h5>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {habit.recovery_plan.support_message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Smart Nudges Panel Component
 */
function SmartNudgesPanel({ enabled, onToggle, timeContext }) {
  const nudgeExamples = {
    morning: [
      "After I pour my coffee, I will write one thing I'm grateful for",
      "Before I check my phone, I will do 5 deep breaths",
      "When I wake up, I will drink a glass of water"
    ],
    afternoon: [
      "If I feel tired at 3 PM, I will take a 5-minute walk",
      "Before my afternoon meeting, I will stretch my neck and shoulders",
      "When I finish lunch, I will log what I ate"
    ],
    evening: [
      "After dinner, I will review my day's accomplishments",
      "Before I watch TV, I will prepare tomorrow's clothes",
      "When I brush my teeth, I will think of three good moments from today"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Nudge Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Smart Nudge System</span>
            <Switch checked={enabled} onCheckedChange={onToggle} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Receive gentle, context-aware suggestions based on your natural patterns and optimal timing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Coffee className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium">Morning Energy</h4>
              <p className="text-sm text-gray-600">Ambitious goals and challenges</p>
            </div>
            <div className="text-center">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Afternoon Support</h4>
              <p className="text-sm text-gray-600">Gentle movement and hydration</p>
            </div>
            <div className="text-center">
              <Moon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">Evening Reflection</h4>
              <p className="text-sm text-gray-600">Preparation and wind-down</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Intentions */}
      <Card>
        <CardHeader>
          <CardTitle>If-Then Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Research shows that "if-then" plans increase success rates by 85%. Here are some for your current time:
          </p>
          
          <div className="space-y-3">
            {nudgeExamples[timeContext]?.map((example, index) => (
              <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm font-medium">{example}</p>
              </div>
            )) || (
              <p className="text-gray-500 italic">Context-specific suggestions will appear here</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Micro-Commitments Panel Component
 */
function MicroCommitmentsPanel({ behaviorData }) {
  const microCommitments = behaviorData?.micro_commitments || [];

  const commitmentExamples = [
    {
      original: "Exercise for 30 minutes daily",
      micro: "Put on workout clothes",
      principle: "Two-minute rule"
    },
    {
      original: "Meditate for 20 minutes",
      micro: "Take one conscious breath",
      principle: "Implementation minimum"
    },
    {
      original: "Eat 5 servings of vegetables",
      micro: "Eat one piece of fruit",
      principle: "Habit stacking"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Friction-Free Micro-Commitments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start with ridiculously small habits that take less than 2 minutes. 
            Success builds momentum for bigger changes.
          </p>
          
          <div className="space-y-4">
            {commitmentExamples.map((example, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Original goal:</span>
                    <span className="text-sm line-through text-gray-400">{example.original}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {example.micro}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {example.principle}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
              Why This Works
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Removes decision fatigue and resistance</li>
              <li>• Creates immediate success and momentum</li>
              <li>• Builds neural pathways for the full habit</li>
              <li>• Often leads to doing more than planned</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Behavior Patterns Panel Component
 */
function BehaviorPatternsPanel({ behaviorData }) {
  const patterns = behaviorData?.patterns || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Optimal Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Exercise</span>
                <span className="font-medium">7:30 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Meal Planning</span>
                <span className="font-medium">6:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reflection</span>
                <span className="font-medium">9:30 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Well-rested mornings (95% success)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">After meal completion (88% success)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Weekend mornings (82% success)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Habit Personality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Strengths</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Consistent morning routines</li>
                <li>• Responds well to environmental cues</li>
                <li>• High weekend motivation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Growth Areas</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Afternoon energy management</li>
                <li>• Travel day adaptations</li>
                <li>• Stress response habits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BehavioralPsychologyLayer;