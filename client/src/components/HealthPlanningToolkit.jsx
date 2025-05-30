import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Target,
  Calendar,
  CheckSquare,
  TrendingUp,
  Award,
  Clock,
  Zap,
  Moon,
  Activity,
  Utensils,
  Brain,
  Play,
  Pause,
  RotateCcw,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Health Planning Toolkit Component
 * Structured, goal-driven health journeys with adaptive goals
 */
export function HealthPlanningToolkit() {
  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [showPlanCreation, setShowPlanCreation] = useState(false);
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch current health plan
  const { data: planData, isLoading } = useQuery({
    queryKey: ['/api/health-plan/current'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/health-plan/current');
      return res.json();
    }
  });

  // Create health plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planConfig) => {
      const res = await apiRequest('POST', '/api/health-plan/create', planConfig);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Health Journey Started!",
        description: `Your ${data.plan.template} has begun with ${data.initial_goals} initial goals.`
      });
      queryClient.invalidateQueries(['/api/health-plan/current']);
      setShowPlanCreation(false);
    }
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData) => {
      const res = await apiRequest('POST', '/api/health-plan/progress', progressData);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.new_milestones.length > 0) {
        toast({
          title: "Milestone Achieved!",
          description: `You've unlocked: ${data.new_milestones[0].reward}`
        });
      }
      queryClient.invalidateQueries(['/api/health-plan/current']);
    }
  });

  const hasActivePlan = planData?.plan;
  const isDark = effectiveTheme === 'dark';

  const planTypes = [
    {
      id: 'sleep_optimization',
      name: 'Sleep Optimization Journey',
      icon: Moon,
      description: 'Improve sleep quality and establish consistent patterns',
      duration: '90 days',
      difficulty: 'Beginner',
      outcomes: ['Better sleep quality', 'Consistent schedule', 'Increased energy']
    },
    {
      id: 'fitness_transformation',
      name: 'Fitness Transformation',
      icon: Activity,
      description: 'Build strength, endurance, and healthy exercise habits',
      duration: '90 days',
      difficulty: 'Intermediate',
      outcomes: ['Increased strength', 'Better endurance', 'Daily movement habit']
    },
    {
      id: 'nutrition_optimization',
      name: 'Nutrition Optimization',
      icon: Utensils,
      description: 'Develop sustainable healthy eating habits',
      duration: '90 days',
      difficulty: 'Beginner',
      outcomes: ['Balanced nutrition', 'Mindful eating', 'Sustainable habits']
    },
    {
      id: 'stress_management',
      name: 'Stress Management & Mental Wellness',
      icon: Brain,
      description: 'Build resilience and stress management techniques',
      duration: '90 days',
      difficulty: 'Beginner',
      outcomes: ['Reduced stress', 'Better resilience', 'Emotional balance']
    }
  ];

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
          <Target className="h-8 w-8 text-blue-600" />
          <span>Health Planning Toolkit</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Transform insights into action with structured 30/60/90-day health journeys. 
          Set adaptive goals, track progress, and unlock achievements as you build lasting healthy habits.
        </p>
      </div>

      {/* Plan Selection or Current Plan */}
      {!hasActivePlan ? (
        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20">
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Start Your Health Journey</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Choose a structured health plan with adaptive goals, weekly challenges, 
                and milestone achievements to transform your wellness.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="space-y-2">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto" />
                  <h4 className="font-semibold">Structured Timeline</h4>
                  <p className="text-sm text-gray-600">30/60/90-day phases</p>
                </div>
                <div className="space-y-2">
                  <Zap className="h-8 w-8 text-orange-600 mx-auto" />
                  <h4 className="font-semibold">Adaptive Goals</h4>
                  <p className="text-sm text-gray-600">Goals that evolve with progress</p>
                </div>
                <div className="space-y-2">
                  <Award className="h-8 w-8 text-purple-600 mx-auto" />
                  <h4 className="font-semibold">Achievement System</h4>
                  <p className="text-sm text-gray-600">Unlocks and milestones</p>
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => setShowPlanCreation(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Choose Your Journey
              </Button>
            </CardContent>
          </Card>

          {/* Plan Types Grid */}
          {showPlanCreation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {planTypes.map((planType) => (
                <PlanTypeCard
                  key={planType.id}
                  planType={planType}
                  selected={selectedPlanType === planType.id}
                  onSelect={() => setSelectedPlanType(planType.id)}
                  onStart={() => {
                    createPlanMutation.mutate({
                      plan_type: planType.id,
                      customizations: {}
                    });
                  }}
                  isLoading={createPlanMutation.isPending}
                />
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <ActivePlanDashboard
          planData={planData}
          onUpdateProgress={(data) => updateProgressMutation.mutate(data)}
          isUpdating={updateProgressMutation.isPending}
        />
      )}
    </div>
  );
}

/**
 * Plan Type Card Component
 */
function PlanTypeCard({ planType, selected, onSelect, onStart, isLoading }) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selected ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <planType.icon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">{planType.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Badge variant="outline">{planType.duration}</Badge>
                <Badge variant="outline">{planType.difficulty}</Badge>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {planType.description}
          </p>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Expected Outcomes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {planType.outcomes.map((outcome, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <CheckSquare className="h-3 w-3 text-green-600" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {selected && (
            <Button 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Starting Journey...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start This Journey
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Active Plan Dashboard Component
 */
function ActivePlanDashboard({ planData, onUpdateProgress, isUpdating }) {
  const { plan, stats, current_streak, upcoming_milestones } = planData;

  return (
    <div className="space-y-6">
      {/* Plan Status Header */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-800 dark:to-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{plan.template}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Day {plan.current_day} • Phase {plan.current_phase} • {plan.completion_percentage}% Complete
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {current_streak} day streak
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats?.goals_completed || 0} goals completed
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {plan.completion_percentage}%
              </div>
              <Progress value={plan.completion_percentage} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today">
          <TodayPanel 
            plan={plan} 
            onUpdateProgress={onUpdateProgress}
            isUpdating={isUpdating}
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <GoalsPanel plan={plan} upcomingMilestones={upcoming_milestones} />
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <CalendarPanel plan={plan} />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <ProgressPanel plan={plan} stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Today Panel Component
 */
function TodayPanel({ plan, onUpdateProgress, isUpdating }) {
  const [completedTasks, setCompletedTasks] = useState({});

  const handleTaskToggle = (taskId, completed) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: completed
    }));
  };

  const handleSubmitProgress = () => {
    const progressData = {};
    
    // Convert completed tasks to progress data
    plan.daily_checklist.tasks.forEach(task => {
      if (completedTasks[task.id]) {
        progressData[task.id] = task.target;
      }
    });

    onUpdateProgress(progressData);
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = plan.daily_checklist.tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Focus</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Daily Progress</span>
              <span className="font-medium">{completedCount}/{totalTasks} completed</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Estimated Time:</span>
                <div>{plan.daily_checklist.estimated_total_time} minutes</div>
              </div>
              <div>
                <span className="font-medium">Current Phase:</span>
                <div>Phase {plan.current_phase} days</div>
              </div>
              <div>
                <span className="font-medium">Next Milestone:</span>
                <div>Day {plan.current_day + 3}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <span>Today's Checklist</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.daily_checklist.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                completed={completedTasks[task.id] || false}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
              />
            ))}
            
            <div className="pt-4 border-t">
              <Button 
                onClick={handleSubmitProgress}
                disabled={isUpdating || completedCount === 0}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Updating Progress...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Update Progress ({completedCount} tasks)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Task Item Component
 */
function TaskItem({ task, completed, onToggle }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getPriorityColor(task.priority)} ${completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={completed}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        
        <div className="flex-1">
          <h4 className={`font-medium ${completed ? 'line-through text-gray-500' : ''}`}>
            {task.task}
          </h4>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>{task.target} {task.unit}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimated_time}min</span>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${
                task.priority === 'high' ? 'border-red-300 text-red-700' :
                task.priority === 'medium' ? 'border-orange-300 text-orange-700' :
                'border-green-300 text-green-700'
              }`}
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Goals Panel Component
 */
function GoalsPanel({ plan, upcomingMilestones }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Phase Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.goals.slice(0, 3).map((goal, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{goal.description}</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    Target: {goal.target} {goal.unit} • {goal.frequency}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Upcoming Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMilestones?.slice(0, 3).map((milestone, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-medium">{milestone.reward}</h4>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Day {milestone.day} • {milestone.description}
                  </div>
                </div>
              )) || (
                <p className="text-gray-600 text-center py-4">
                  Keep going! More milestones coming soon.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Calendar Panel Component
 */
function CalendarPanel({ plan }) {
  const currentWeek = Math.ceil(plan.current_day / 7);
  const weeklyCalendar = plan.weekly_calendar?.slice(0, 4) || []; // Show next 4 weeks

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyCalendar.map((week, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg ${
                  week.week_number === currentWeek ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Week {week.week_number}</h4>
                  {week.week_number === currentWeek && (
                    <Badge className="bg-blue-100 text-blue-800">Current Week</Badge>
                  )}
                </div>
                
                <div className="text-sm">
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    Focus: {week.focus_areas}
                  </div>
                  <div className="text-gray-600 mt-1">
                    Challenges: {week.challenges?.[0] || 'Complete weekly goals'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Progress Panel Component
 */
function ProgressPanel({ plan, stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{plan.current_day}</div>
            <div className="text-sm text-gray-600">Days Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.goals_completed || 0}</div>
            <div className="text-sm text-gray-600">Goals Achieved</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats?.milestones_achieved || 0}</div>
            <div className="text-sm text-gray-600">Milestones Unlocked</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.progress_history?.slice(-7).map((entry, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="text-sm font-medium">Day {entry.day}</div>
                <div className="flex-1">
                  <div className="text-sm">
                    {entry.goals_completed.length} goals completed
                  </div>
                  {entry.milestones_achieved.length > 0 && (
                    <div className="text-xs text-green-600">
                      🏆 {entry.milestones_achieved[0].reward}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </div>
            )) || (
              <p className="text-gray-600 text-center py-4">
                Progress history will appear as you complete daily goals.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HealthPlanningToolkit;