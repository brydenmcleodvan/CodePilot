import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Award,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StreakBadge from './streak-badge';
import TipCard from './tip-card';

interface ConsistencyData {
  streaks: {
    goalId: number;
    goalType: string;
    currentStreak: number;
    longestStreak: number;
    weeklySuccessRate: number;
  }[];
  tips: {
    id: string;
    title: string;
    message: string;
    category: 'sleep' | 'exercise' | 'nutrition' | 'hydration' | 'stress' | 'general';
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedAction?: string;
    relatedMetric?: string;
  }[];
  weeklyStats: {
    totalGoals: number;
    achievedDays: number;
    consistencyScore: number;
    improvement: number;
  };
}

export default function ConsistencyDashboard() {
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  // Fetch consistency data
  const { data: consistencyData, isLoading } = useQuery<ConsistencyData>({
    queryKey: ['/api/consistency-dashboard'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleTipDismiss = (tipId: string) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  const handleTipAction = (action: string) => {
    // Handle tip actions - could navigate to specific pages or trigger other actions
    console.log('Tip action:', action);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!consistencyData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No consistency data available. Start tracking your health goals to see your streaks!
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeTips = consistencyData.tips.filter(tip => !dismissedTips.includes(tip.id));
  const highPriorityTips = activeTips.filter(tip => tip.priority === 'high');
  const otherTips = activeTips.filter(tip => tip.priority !== 'high');

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {consistencyData.weeklyStats.totalGoals}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {consistencyData.weeklyStats.achievedDays}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Days Achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {consistencyData.weeklyStats.consistencyScore}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Consistency Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`h-5 w-5 ${
                consistencyData.weeklyStats.improvement >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {consistencyData.weeklyStats.improvement > 0 ? '+' : ''}{consistencyData.weeklyStats.improvement}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Weekly Change</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="streaks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="streaks">Current Streaks</TabsTrigger>
          <TabsTrigger value="insights">Health Insights</TabsTrigger>
          <TabsTrigger value="history">Consistency History</TabsTrigger>
        </TabsList>

        <TabsContent value="streaks" className="space-y-6">
          {/* Featured Streak */}
          {consistencyData.streaks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  🔥 Your Best Streak
                </h3>
                <StreakBadge
                  streak={Math.max(...consistencyData.streaks.map(s => s.currentStreak))}
                  goalType={consistencyData.streaks.find(s => s.currentStreak === Math.max(...consistencyData.streaks.map(s => s.currentStreak)))?.goalType || 'health'}
                  variant="hero"
                />
              </div>
            </motion.div>
          )}

          {/* All Streaks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consistencyData.streaks.map((streak, index) => (
              <motion.div
                key={streak.goalId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StreakBadge
                  streak={streak.currentStreak}
                  goalType={streak.goalType}
                  variant="detailed"
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* High Priority Tips */}
          {highPriorityTips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-600" />
                Priority Insights
              </h3>
              <div className="space-y-4">
                {highPriorityTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TipCard
                      tip={tip}
                      variant="featured"
                      onDismiss={handleTipDismiss}
                      onActionClick={handleTipAction}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Other Tips */}
          {otherTips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Additional Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TipCard
                      tip={tip}
                      variant="default"
                      onDismiss={handleTipDismiss}
                      onActionClick={handleTipAction}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTips.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Great job!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You're doing well with your health goals. Keep up the excellent work!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Consistency History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consistencyData.streaks.map((streak) => (
                  <div key={streak.goalId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <StreakBadge
                        streak={streak.currentStreak}
                        goalType={streak.goalType}
                        variant="compact"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {streak.goalType}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Best: {streak.longestStreak} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {streak.weeklySuccessRate}%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This week
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}