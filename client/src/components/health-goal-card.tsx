import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  TrendingUp,
  Flame,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Moon,
  Footprints,
  Activity,
  Droplets,
  Thermometer,
} from 'lucide-react';

export interface HealthGoalCardProps {
  id: string;
  metric: 'heart_rate' | 'sleep' | 'steps' | 'hrv' | 'glucose' | 'blood_pressure' | 'weight';
  goalType: 'target' | 'minimum' | 'maximum' | 'range';
  goalValue: number | { min: number; max: number };
  unit: string;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  status: 'on_track' | 'behind' | 'ahead' | 'completed' | 'at_risk';
  timeframe: 'daily' | 'weekly' | 'monthly';
  daysCompleted: number;
  totalDays: number;
  streak: number;
  createdAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

const metricConfig = {
  heart_rate: {
    name: 'Heart Rate',
    icon: Heart,
    color: '#EF4444',
  },
  sleep: {
    name: 'Sleep Duration',
    icon: Moon,
    color: '#6366F1',
  },
  steps: {
    name: 'Daily Steps',
    icon: Footprints,
    color: '#10B981',
  },
  hrv: {
    name: 'Heart Rate Variability',
    icon: Activity,
    color: '#8B5CF6',
  },
  glucose: {
    name: 'Blood Glucose',
    icon: Droplets,
    color: '#F59E0B',
  },
  blood_pressure: {
    name: 'Blood Pressure',
    icon: Heart,
    color: '#DC2626',
  },
  weight: {
    name: 'Weight',
    icon: Thermometer,
    color: '#F97316',
  },
};

const statusConfig = {
  on_track: {
    label: 'On Track',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: TrendingUp,
    iconColor: 'text-green-600',
  },
  behind: {
    label: 'Behind',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  ahead: {
    label: 'Ahead',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  at_risk: {
    label: 'At Risk',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
};

const timeframeLabels = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
};

export default function HealthGoalCard({
  id,
  metric,
  goalType,
  goalValue,
  unit,
  progress,
  status,
  timeframe,
  daysCompleted,
  totalDays,
  streak,
  createdAt,
  onEdit,
  onDelete,
  onViewDetails,
}: HealthGoalCardProps) {
  const config = metricConfig[metric];
  const statusInfo = statusConfig[status];
  const Icon = config.icon;
  const StatusIcon = statusInfo.icon;

  const formatGoalValue = () => {
    if (typeof goalValue === 'object') {
      return `${goalValue.min}-${goalValue.max} ${unit}`;
    }
    
    switch (goalType) {
      case 'minimum':
        return `≥ ${goalValue} ${unit}`;
      case 'maximum':
        return `≤ ${goalValue} ${unit}`;
      default:
        return `${goalValue} ${unit}`;
    }
  };

  const getProgressColor = () => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'on_track' || status === 'ahead') return 'bg-blue-500';
    if (status === 'behind') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysText = () => {
    if (timeframe === 'daily') {
      return progress.percentage >= 100 ? 'Goal achieved today!' : 'In progress today';
    }
    return `${daysCompleted}/${totalDays} days`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: config.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
                <Icon className="h-5 w-5" style={{ color: config.color }} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{config.name} Goal</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatGoalValue()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Streak Display */}
              {streak > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    {streak}
                  </span>
                </div>
              )}
              <Badge className={statusInfo.color}>
                <StatusIcon className={`h-3 w-3 mr-1 ${statusInfo.iconColor}`} />
                {statusInfo.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={onViewDetails}>
                      <Target className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Goal
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Goal
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{progress.percentage.toFixed(0)}%</span>
            </div>
            <Progress 
              value={Math.min(progress.percentage, 100)} 
              className="h-3"
              style={{ 
                backgroundColor: '#f3f4f6',
              }}
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{progress.current} {unit}</span>
              <span>{progress.target} {unit}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: config.color }}>
                {getDaysText()}
              </div>
              <div className="text-xs text-gray-500">
                {timeframeLabels[timeframe]}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {streak}
              </div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {Math.ceil((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs text-gray-500">Days Active</div>
            </div>
          </div>

          {/* Action Suggestions */}
          {status === 'behind' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    You're behind on this goal
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                    {getMotivationalMessage(metric, progress, timeframe)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-800 dark:text-green-200 font-medium mb-1">
                    Goal completed! 🎉
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-xs">
                    Great job maintaining your {config.name.toLowerCase()} target. Keep up the momentum!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onViewDetails}
            >
              <Calendar className="h-3 w-3 mr-1" />
              View Progress
            </Button>
            {status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <Target className="h-3 w-3 mr-1" />
                Log Entry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getMotivationalMessage(metric: string, progress: any, timeframe: string): string {
  const remaining = progress.target - progress.current;
  
  switch (metric) {
    case 'sleep':
      return `You need ${remaining.toFixed(1)} more hours this ${timeframe === 'weekly' ? 'week' : 'period'}. Try going to bed 30 minutes earlier tonight.`;
    case 'steps':
      return `${remaining.toLocaleString()} more steps needed. Take a 15-minute walk to get back on track.`;
    case 'heart_rate':
      return `Focus on relaxation techniques and avoid caffeine to help lower your heart rate.`;
    case 'hrv':
      return `Prioritize recovery with good sleep and stress management to improve your HRV.`;
    default:
      return `You're ${remaining.toFixed(1)} ${metric} away from your goal. Small consistent efforts add up!`;
  }
}