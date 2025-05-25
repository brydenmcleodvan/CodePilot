import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Trophy, 
  Star,
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Lightbulb,
  BarChart3,
  Flame,
  ChevronRight,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface MicroGoal {
  id: string;
  parentGoalId?: number;
  type: 'frequency' | 'streak' | 'volume' | 'consistency';
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
  completedAt?: string;
  isActive: boolean;
}

interface HabitLoop {
  id: string;
  goalId: number;
  habitName: string;
  category: string;
  currentLevel: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  microGoals: MicroGoal[];
  nextMilestone: {
    level: number;
    xpRequired: number;
    reward: string;
  };
  weeklyPattern: number[];
  insights: string[];
}

interface HabitRecommendation {
  id: string;
  type: 'micro_goal' | 'habit_stack' | 'environment_design' | 'time_optimization';
  title: string;
  description: string;
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeToForm: number;
  suggestedMicroGoals: MicroGoal[];
  category: string;
  priority: number;
}

interface HabitLoopCardProps {
  habitLoop?: HabitLoop;
  variant?: 'full' | 'compact' | 'mini';
  showRecommendations?: boolean;
}

export default function HabitLoopCard({ 
  habitLoop, 
  variant = 'full',
  showRecommendations = true 
}: HabitLoopCardProps) {
  const [selectedTab, setSelectedTab] = useState('progress');
  const [expandedMicroGoal, setExpandedMicroGoal] = useState<string | null>(null);

  // Fetch habit recommendations
  const { data: recommendations = [] } = useQuery<HabitRecommendation[]>({
    queryKey: ['/api/habit-recommendations'],
    enabled: showRecommendations,
  });

  // Create micro goal mutation
  const createMicroGoalMutation = useMutation({
    mutationFn: async (microGoal: Partial<MicroGoal>) => {
      const response = await apiRequest('POST', '/api/micro-goals', microGoal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habit-loops'] });
    }
  });

  const getLevelColor = (level: number) => {
    const colors = [
      'from-gray-400 to-gray-600',
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600'
    ];
    return colors[Math.min(level - 1, colors.length - 1)] || colors[0];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getMicroGoalIcon = (type: string) => {
    switch (type) {
      case 'frequency': return Calendar;
      case 'streak': return Flame;
      case 'volume': return BarChart3;
      case 'consistency': return Clock;
      default: return Target;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'micro_goal': return Target;
      case 'habit_stack': return TrendingUp;
      case 'environment_design': return Lightbulb;
      case 'time_optimization': return Clock;
      default: return Star;
    }
  };

  const handleCreateMicroGoal = (microGoal: MicroGoal) => {
    createMicroGoalMutation.mutate(microGoal);
  };

  if (!habitLoop && variant !== 'mini') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Start Building Habits
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first health goal to begin building sustainable habits with AI-powered micro goals.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create First Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'mini') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getLevelColor(habitLoop?.currentLevel || 1)}`}>
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Level {habitLoop?.currentLevel || 1}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {habitLoop?.category || 'Habit'} Master
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {habitLoop?.totalXP || 0} XP
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress to Level {(habitLoop?.currentLevel || 1) + 1}</span>
              <span>{habitLoop?.nextMilestone?.xpRequired || 100} XP needed</span>
            </div>
            <Progress 
              value={habitLoop ? 100 - (habitLoop.nextMilestone.xpRequired / 100 * 100) : 0} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${getLevelColor(habitLoop?.currentLevel || 1)} shadow-lg`}>
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  Level {habitLoop?.currentLevel || 1} {habitLoop?.category || 'Habit'} Master
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {habitLoop?.completionRate || 0}% completion rate
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {habitLoop?.totalXP || 0}
              </div>
              <div className="text-xs text-gray-500">XP</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {habitLoop?.currentStreak || 0}
              </div>
              <div className="text-xs text-gray-500">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {habitLoop?.microGoals?.filter(g => g.completedAt).length || 0}
              </div>
              <div className="text-xs text-gray-500">Micro Goals</div>
            </div>
          </div>

          {habitLoop?.insights && habitLoop.insights.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {habitLoop.insights[0]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl bg-gradient-to-r ${getLevelColor(habitLoop?.currentLevel || 1)} shadow-lg`}
            >
              <Trophy className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                Level {habitLoop?.currentLevel || 1} {habitLoop?.category || 'Habit'} Master
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {habitLoop?.habitName || 'Building healthy habits'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {habitLoop?.totalXP || 0}
            </div>
            <div className="text-sm text-gray-500">Experience Points</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress to Next Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress to Level {(habitLoop?.currentLevel || 1) + 1}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {habitLoop?.nextMilestone?.xpRequired || 100} XP needed
            </span>
          </div>
          <Progress 
            value={habitLoop ? 100 - (habitLoop.nextMilestone.xpRequired / 100 * 100) : 0} 
            className="h-3" 
          />
          <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
            <Trophy className="h-4 w-4" />
            <span>Next reward: {habitLoop?.nextMilestone?.reward || 'Achievement Unlocked'}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {habitLoop?.currentStreak || 0}
            </div>
            <div className="text-xs text-green-600 dark:text-green-500">Current Streak</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {habitLoop?.completionRate || 0}%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Success Rate</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {habitLoop?.longestStreak || 0}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500">Best Streak</div>
          </div>
        </div>

        {/* Insights */}
        {habitLoop?.insights && habitLoop.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Habit Insights</span>
            </h4>
            <div className="space-y-2">
              {habitLoop.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for Micro Goals and Recommendations */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">Micro Goals</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {habitLoop?.microGoals && habitLoop.microGoals.length > 0 ? (
              <div className="space-y-3">
                {habitLoop.microGoals.map((microGoal) => {
                  const MicroGoalIcon = getMicroGoalIcon(microGoal.type);
                  return (
                    <motion.div
                      key={microGoal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        microGoal.completedAt 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200' 
                          : 'bg-white dark:bg-gray-800 hover:shadow-md'
                      }`}
                      onClick={() => setExpandedMicroGoal(
                        expandedMicroGoal === microGoal.id ? null : microGoal.id
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            microGoal.completedAt 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {microGoal.completedAt ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <MicroGoalIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {microGoal.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {microGoal.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getDifficultyColor(microGoal.difficulty)}>
                                {microGoal.difficulty}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {microGoal.targetValue} {microGoal.unit} {microGoal.timeframe}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                          expandedMicroGoal === microGoal.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      
                      <AnimatePresence>
                        {expandedMicroGoal === microGoal.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Created: {new Date(microGoal.createdAt).toLocaleDateString()}
                              </span>
                              {!microGoal.completedAt && (
                                <Button size="sm" variant="outline">
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No micro goals yet. Check the AI recommendations to get started!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((recommendation) => {
                  const RecommendationIcon = getRecommendationIcon(recommendation.type);
                  return (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <RecommendationIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {recommendation.title}
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {recommendation.description}
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                            💡 {recommendation.reasoning}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getDifficultyColor(recommendation.difficulty)}>
                                {recommendation.difficulty}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ~{recommendation.estimatedTimeToForm} days to form
                              </span>
                            </div>
                            
                            <Button 
                              size="sm"
                              onClick={() => {
                                if (recommendation.suggestedMicroGoals.length > 0) {
                                  handleCreateMicroGoal(recommendation.suggestedMicroGoals[0]);
                                }
                              }}
                              disabled={createMicroGoalMutation.isPending}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Try This
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Keep tracking your goals to unlock personalized AI recommendations!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}