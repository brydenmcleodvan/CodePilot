import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Award, 
  Target, 
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StreakSummary {
  goalId: number;
  goalType: string;
  currentStreak: number;
  longestStreak: number;
  achievementRate: number;
  level: 'excellent' | 'good' | 'needs-improvement';
  nextMilestone: number;
}

interface StreakSummaryData {
  goals: StreakSummary[];
  summary: {
    totalGoals: number;
    activeStreaks: number;
    averageCurrentStreak: number;
    longestOverallStreak: number;
  };
}

export default function StreakDashboard() {
  const { data: streakData, isLoading } = useQuery<StreakSummaryData>({
    queryKey: ['/api/health-goals/streak-summary']
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Set up health goals to track your streaks!
          </p>
        </CardContent>
      </Card>
    );
  }

  const { goals, summary } = streakData;

  const getStreakIcon = (streakLength: number) => {
    if (streakLength >= 30) return { icon: Award, color: 'text-yellow-500' };
    if (streakLength >= 14) return { icon: Flame, color: 'text-orange-500' };
    if (streakLength >= 7) return { icon: TrendingUp, color: 'text-blue-500' };
    if (streakLength >= 3) return { icon: Target, color: 'text-green-500' };
    return { icon: Calendar, color: 'text-gray-500' };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs-improvement': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.totalGoals}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Goals
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.activeStreaks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Streaks
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {summary.averageCurrentStreak.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Streak
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.longestOverallStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best Streak
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Individual Goal Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Goal Streaks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Create health goals to start tracking your streaks!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => {
                const { icon: StreakIcon, color } = getStreakIcon(goal.currentStreak);
                
                return (
                  <motion.div
                    key={goal.goalId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                        <StreakIcon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{goal.goalType}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Current: <span className="font-medium">{goal.currentStreak} days</span>
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Best: <span className="font-medium">{goal.longestStreak} days</span>
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Success: <span className="font-medium">{goal.achievementRate.toFixed(0)}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Next milestone: {goal.nextMilestone} days
                        </div>
                        <Progress 
                          value={(goal.currentStreak / goal.nextMilestone) * 100} 
                          className="w-24 h-2"
                        />
                      </div>
                      <Badge className={getLevelColor(goal.level)}>
                        {goal.level.replace('-', ' ')}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Message */}
      {summary.activeStreaks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Keep the momentum going! 🔥
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                You have {summary.activeStreaks} active streak{summary.activeStreaks !== 1 ? 's' : ''} going. 
                Consistency is the key to lasting health improvements!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}