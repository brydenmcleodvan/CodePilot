import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Calendar, 
  Target, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastAchievementDate: string | null;
  achievementRate: number;
  streakHistory: {
    date: string;
    achieved: boolean;
    value: number;
    streakCount: number;
  }[];
}

interface StreakInsights {
  message: string;
  level: 'excellent' | 'good' | 'needs-improvement';
  motivationalTip: string;
  nextMilestone: number;
}

interface StreakPrediction {
  continuationProbability: number;
  riskFactors: string[];
  recommendations: string[];
}

interface StreakTrackerProps {
  goalId: number;
  goalType: string;
  compact?: boolean;
}

export default function StreakTracker({ goalId, goalType, compact = false }: StreakTrackerProps) {
  const { data: streakData, isLoading } = useQuery({
    queryKey: ['/api/health-goals', goalId, 'streak'],
    enabled: !!goalId
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  const { streak, insights, prediction }: {
    streak: StreakData;
    insights: StreakInsights;
    prediction: StreakPrediction;
  } = streakData;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs-improvement': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStreakIcon = (streakLength: number) => {
    if (streakLength >= 30) return <Award className="h-6 w-6 text-yellow-500" />;
    if (streakLength >= 14) return <Flame className="h-6 w-6 text-orange-500" />;
    if (streakLength >= 7) return <TrendingUp className="h-6 w-6 text-blue-500" />;
    if (streakLength >= 3) return <Target className="h-6 w-6 text-green-500" />;
    return <Clock className="h-6 w-6 text-gray-500" />;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {getStreakIcon(streak.currentStreak)}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {streak.achievementRate.toFixed(0)}% success
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{insights.message}</p>
              <p className="text-gray-600">{insights.motivationalTip}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Streak Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              {getStreakIcon(streak.currentStreak)}
              <span>Current Streak</span>
            </span>
            <Badge className={getLevelColor(insights.level)}>
              {insights.level.replace('-', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Streak Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {streak.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current Days
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {streak.longestStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Best Streak
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {streak.achievementRate.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Success Rate
              </div>
            </div>
          </div>

          {/* Progress to Next Milestone */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {insights.nextMilestone} days</span>
              <span>{streak.currentStreak}/{insights.nextMilestone}</span>
            </div>
            <Progress 
              value={(streak.currentStreak / insights.nextMilestone) * 100} 
              className="h-2"
            />
          </div>

          {/* Motivational Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {insights.message}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {insights.motivationalTip}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak History Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {streak.streakHistory.slice(-28).map((day, index) => (
              <TooltipProvider key={day.date}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`w-4 h-4 rounded-sm cursor-pointer ${
                        day.achieved 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </p>
                      <p>
                        {day.achieved ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Goal achieved: {day.value}
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Goal missed: {day.value}
                          </span>
                        )}
                      </p>
                      {day.streakCount > 0 && (
                        <p className="text-blue-600">
                          Streak: {day.streakCount} days
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>28 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Streak Prediction & Recommendations */}
      {(prediction.riskFactors.length > 0 || prediction.recommendations.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Streak Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Continuation Probability */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Streak continuation probability</span>
                <span className="font-medium">
                  {prediction.continuationProbability.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={prediction.continuationProbability} 
                className="h-2"
              />
            </div>

            {/* Risk Factors */}
            {prediction.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Risk Factors</h4>
                <ul className="text-sm space-y-1">
                  {prediction.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
                <ul className="text-sm space-y-1">
                  {prediction.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}