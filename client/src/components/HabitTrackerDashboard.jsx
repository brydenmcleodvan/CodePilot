import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  TrendingUp,
  Target,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Flame,
  Star,
  Plus,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Habit Tracker Dashboard Component
 * Displays current habit streaks, progress, and behavioral psychology insights
 */
export function HabitTrackerDashboard({ userId, className = "" }) {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const { toast } = useToast();

  // Fetch habit data and logs
  const { data: habitData, isLoading } = useQuery({
    queryKey: ['/api/behavioral/habits'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/behavioral/habits');
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 60000 // Refresh every minute for real-time streak updates
  });

  // Mark habit as completed for today
  const completeHabitMutation = useMutation({
    mutationFn: async (habitId) => {
      const res = await apiRequest('POST', `/api/behavioral/habits/${habitId}/complete`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Habit Completed!",
        description: `Great job! Your streak continues.`
      });
      queryClient.invalidateQueries(['/api/behavioral/habits']);
    }
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600 animate-pulse" />
            Loading Habit Progress...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const habits = habitData?.active_habits || [];
  const streakStats = habitData?.streak_stats || {};
  const achievements = habitData?.recent_achievements || [];

  if (habits.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Habit Formation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Building Healthy Habits</h3>
            <p className="text-gray-600 mb-4">
              Use behavioral psychology to create sustainable health improvements
            </p>
            <Link href="/habits">
              <Button>Create Your First Habit</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <CardTitle>Habit Progress</CardTitle>
            {streakStats.total_active_streaks > 0 && (
              <Badge className="bg-green-100 text-green-800">
                {streakStats.total_active_streaks} Active
              </Badge>
            )}
          </div>
          <Link href="/habits">
            <Button variant="outline" size="sm">
              View All Habits
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Habit Streak Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{streakStats.longest_current_streak || 0}</div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{streakStats.completed_today || 0}</div>
            <div className="text-sm text-gray-600">Completed Today</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-gray-600">New Badges</div>
          </div>
        </div>

        {/* Active Habits List */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            Today's Habits
          </h4>
          
          {habits.slice(0, 4).map((habit) => (
            <HabitCard 
              key={habit.habit_id} 
              habit={habit}
              onComplete={() => completeHabitMutation.mutate(habit.habit_id)}
              isCompleting={completeHabitMutation.isPending}
            />
          ))}

          {habits.length > 4 && (
            <div className="text-center pt-2">
              <Link href="/habits">
                <Button variant="outline" size="sm">
                  View All {habits.length} Habits
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              Recent Achievements
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {achievements.slice(0, 3).map((achievement, index) => (
                <Badge 
                  key={index}
                  className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1"
                >
                  <Star className="h-3 w-3 mr-1" />
                  {achievement.name}
                </Badge>
              ))}
              {achievements.length > 3 && (
                <Badge variant="outline">
                  +{achievements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Weekly Progress */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            This Week's Progress
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Habit Consistency</span>
              <span>{streakStats.weekly_completion_rate || 0}%</span>
            </div>
            <Progress 
              value={streakStats.weekly_completion_rate || 0} 
              className="h-2"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {streakStats.completed_this_week || 0} of {streakStats.total_habit_days || 0} completed
              </span>
              <span>
                {7 - (streakStats.days_remaining_this_week || 0)} days left
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual Habit Card Component
 */
function HabitCard({ habit, onComplete, isCompleting }) {
  const getHabitIcon = (category) => {
    switch (category) {
      case 'exercise':
        return '🏃';
      case 'nutrition':
        return '🥗';
      case 'sleep':
        return '😴';
      case 'mindfulness':
        return '🧘';
      case 'hydration':
        return '💧';
      default:
        return '✅';
    }
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-blue-600';
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const today = new Date().toDateString();
  const lastCompleted = habit.last_completed ? new Date(habit.last_completed).toDateString() : null;
  const completedToday = lastCompleted === today;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 transition-all ${
        completedToday 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getHabitIcon(habit.category)}</span>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="font-medium">{habit.title}</h5>
              {habit.current_streak > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className={`h-4 w-4 ${getStreakColor(habit.current_streak)}`} />
                  <span className={`text-sm font-medium ${getStreakColor(habit.current_streak)}`}>
                    {habit.current_streak}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {habit.frequency || 'Daily'}
              </span>
              {habit.target_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {habit.target_time}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {completedToday ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Done!</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onComplete}
              disabled={isCompleting}
              className="flex items-center gap-1"
            >
              <Circle className="h-4 w-4" />
              {isCompleting ? 'Marking...' : 'Complete'}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar for Habits with Targets */}
      {habit.daily_target && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span>Today's Progress</span>
            <span>{habit.today_progress || 0} / {habit.daily_target}</span>
          </div>
          <Progress 
            value={((habit.today_progress || 0) / habit.daily_target) * 100} 
            className="h-1.5"
          />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Compact Habit Status Widget
 * For use in other dashboard sections
 */
export function HabitStatusWidget({ userId, className = "" }) {
  const { data: habitData } = useQuery({
    queryKey: ['/api/behavioral/habits/summary'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/behavioral/habits?summary=true');
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const completedToday = habitData?.completed_today || 0;
  const totalToday = habitData?.total_today || 0;
  const longestStreak = habitData?.longest_streak || 0;

  if (!habitData || totalToday === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">
            {completedToday}/{totalToday}
          </span>
        </div>
        <span className="text-xs text-gray-500">habits today</span>
      </div>
      
      {longestStreak > 0 && (
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">{longestStreak}</span>
          <span className="text-xs text-gray-500">day streak</span>
        </div>
      )}
    </div>
  );
}

export default HabitTrackerDashboard;