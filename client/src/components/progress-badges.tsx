import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Zap,
  Heart,
  Moon,
  Activity,
  Apple,
  Droplets,
  Brain,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface StreakData {
  current: number;
  longest: number;
  type: string;
  lastUpdate: string;
}

interface HealthImprovement {
  metric: string;
  improvement: number;
  period: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  unlockedAt?: string;
  category: 'health' | 'consistency' | 'milestone' | 'special';
}

interface ProgressBadgesProps {
  streaks: StreakData[];
  improvements: HealthImprovement[];
  achievements: Achievement[];
  healthScore?: number;
  previousHealthScore?: number;
}

const achievementIcons = {
  trophy: Trophy,
  flame: Flame,
  target: Target,
  heart: Heart,
  moon: Moon,
  activity: Activity,
  apple: Apple,
  droplets: Droplets,
  brain: Brain,
  shield: Shield,
  star: Star,
  award: Award,
  zap: Zap,
  calendar: Calendar,
  check: CheckCircle2
};

export default function ProgressBadges({ 
  streaks, 
  improvements, 
  achievements, 
  healthScore = 0, 
  previousHealthScore = 0 
}: ProgressBadgesProps) {
  const scoreDelta = healthScore - previousHealthScore;
  
  const getStreakIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sleep': return Moon;
      case 'steps': case 'exercise': return Activity;
      case 'water': case 'hydration': return Droplets;
      case 'meditation': case 'mindfulness': return Brain;
      case 'nutrition': return Apple;
      default: return Flame;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingUp;
      case 'stable': return Target;
      default: return TrendingUp;
    }
  };

  const getAchievementColor = (category: string) => {
    switch (category) {
      case 'health': return 'bg-green-100 text-green-800 border-green-300';
      case 'consistency': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'milestone': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'special': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Health Score Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-primary">{healthScore}</div>
              <div className="text-sm text-gray-600">Current Score</div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-semibold ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta}
              </div>
              <div className="text-sm text-gray-600">
                {scoreDelta >= 0 ? 'Improvement' : 'Change'} (30 days)
              </div>
            </div>
          </div>
          <Progress value={healthScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Active Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Current Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streaks.map((streak, index) => {
              const StreakIcon = getStreakIcon(streak.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <StreakIcon className="h-6 w-6 text-orange-600" />
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {streak.current} days
                    </Badge>
                  </div>
                  <h4 className="font-semibold capitalize mb-1">{streak.type} Streak</h4>
                  <p className="text-sm text-gray-600">
                    Best: {streak.longest} days
                  </p>
                  {streak.current >= 7 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-medium text-orange-600">
                        {streak.current >= 30 ? 'On Fire!' : 'Building Momentum!'}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Health Improvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Recent Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvements.map((improvement, index) => {
              const TrendIcon = getTrendIcon(improvement.trend);
              const isPositive = improvement.improvement > 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${
                    isPositive 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">
                      {improvement.metric.replace(/_/g, ' ')}
                    </h4>
                    <div className={`flex items-center gap-1 ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="font-bold">
                        {isPositive ? '+' : ''}{improvement.improvement}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Over the last {improvement.period}
                  </p>
                  {Math.abs(improvement.improvement) >= 10 && (
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${
                        isPositive 
                          ? 'border-green-300 text-green-700' 
                          : 'border-red-300 text-red-700'
                      }`}
                    >
                      {isPositive ? 'Great Progress!' : 'Needs Attention'}
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    achievement.completed 
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-md' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.completed 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {achievement.completed && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className="font-semibold mb-1">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  {!achievement.completed && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}
                  
                  {achievement.completed && achievement.unlockedAt && (
                    <p className="text-xs text-amber-600 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${getAchievementColor(achievement.category)}`}
                  >
                    {achievement.category}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-500" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {achievements.filter(a => a.completed).length}
              </div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...streaks.map(s => s.current), 0)}
              </div>
              <div className="text-sm text-gray-600">Longest Active Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {improvements.filter(i => i.improvement > 0).length}
              </div>
              <div className="text-sm text-gray-600">Improving Metrics</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta}%
              </div>
              <div className="text-sm text-gray-600">Score Change</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}