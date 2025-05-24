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
import {
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  Clock,
  Heart,
  Moon,
  Activity,
  Zap,
  Brain,
  ChevronRight,
  X,
} from 'lucide-react';

export interface InsightCardProps {
  id?: string;
  title: string;
  message: string;
  suggestion: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  category?: 'sleep' | 'activity' | 'heart_health' | 'metabolic' | 'stress' | 'recovery';
  trend?: 'up' | 'down' | 'stable';
  value?: string;
  confidence?: number;
  actionable?: boolean;
  onDismiss?: () => void;
  onAction?: () => void;
  actionText?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-600',
    textColor: 'text-green-800 dark:text-green-200',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
    borderColor: 'border-l-yellow-500',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-800 dark:text-yellow-200',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  alert: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-600',
    textColor: 'text-red-800 dark:text-red-200',
  },
};

const categoryIcons = {
  sleep: Moon,
  activity: Activity,
  heart_health: Heart,
  metabolic: Zap,
  stress: Brain,
  recovery: Activity,
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Clock,
};

export default function InsightCard({
  id,
  title,
  message,
  suggestion,
  type,
  category,
  trend,
  value,
  confidence,
  actionable = true,
  onDismiss,
  onAction,
  actionText = 'Take Action',
}: InsightCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const config = typeConfig[type];
  const TypeIcon = config.icon;
  const CategoryIcon = category ? categoryIcons[category] : Lightbulb;
  const TrendIcon = trend ? trendIcons[trend] : null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={`${config.bgColor} border-l-4 ${config.borderColor} hover:shadow-lg transition-all duration-200`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <CategoryIcon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {trend && TrendIcon && (
                    <TrendIcon className={`h-4 w-4 ${
                      trend === 'up' ? 'text-green-500' : 
                      trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`} />
                  )}
                  {value && (
                    <Badge variant="outline" className="text-xs">
                      {value}
                    </Badge>
                  )}
                  {confidence && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TypeIcon className={`h-5 w-5 ${config.iconColor}`} />
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
            
            <div className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor.replace('border-l-', 'border-')}`}>
              <div className="flex items-start space-x-2">
                <Lightbulb className={`h-4 w-4 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                <p className={`text-sm ${config.textColor} leading-relaxed`}>
                  <strong>Suggestion:</strong> {suggestion}
                </p>
              </div>
            </div>

            {actionable && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500">
                  AI-powered health insight
                </div>
                <Button
                  onClick={onAction}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{actionText}</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Specialized insight card components for different health categories
export function SleepInsightCard({ 
  avgSleep, 
  weeklyChange, 
  onAction 
}: { 
  avgSleep: number; 
  weeklyChange: number; 
  onAction?: () => void; 
}) {
  const isDecline = weeklyChange < 0;
  const changeText = `${Math.abs(weeklyChange).toFixed(1)} hrs`;
  
  return (
    <InsightCard
      title="Sleep Insight"
      message={`Your average sleep ${isDecline ? 'dropped' : 'increased'} ${changeText} this week.`}
      suggestion={isDecline ? 
        "Try winding down earlier with a consistent bedtime routine." :
        "Great progress! Keep maintaining your sleep schedule."
      }
      type={isDecline ? "warning" : "success"}
      category="sleep"
      trend={isDecline ? "down" : "up"}
      value={`${avgSleep.toFixed(1)}h avg`}
      confidence={0.85}
      onAction={onAction}
      actionText="Improve Sleep"
    />
  );
}

export function ActivityInsightCard({ 
  avgSteps, 
  weeklyChange, 
  onAction 
}: { 
  avgSteps: number; 
  weeklyChange: number; 
  onAction?: () => void; 
}) {
  const isIncrease = weeklyChange > 0;
  const changeText = `${Math.abs(weeklyChange).toFixed(0)} steps`;
  
  return (
    <InsightCard
      title="Activity Insight"
      message={`Your daily steps ${isIncrease ? 'increased' : 'decreased'} by ${changeText} this week.`}
      suggestion={!isIncrease ? 
        "Try taking short walking breaks every hour during the day." :
        "Excellent! You're building great activity habits."
      }
      type={!isIncrease ? "info" : "success"}
      category="activity"
      trend={isIncrease ? "up" : "down"}
      value={`${avgSteps.toLocaleString()} avg`}
      confidence={0.92}
      onAction={onAction}
      actionText="Set Step Goal"
    />
  );
}

export function HeartHealthInsightCard({ 
  avgHRV, 
  weeklyChange, 
  onAction 
}: { 
  avgHRV: number; 
  weeklyChange: number; 
  onAction?: () => void; 
}) {
  const isDecline = weeklyChange < 0;
  const changePercent = `${Math.abs(weeklyChange).toFixed(1)}%`;
  
  return (
    <InsightCard
      title="Heart Rate Variability"
      message={`Your HRV has ${isDecline ? 'decreased' : 'increased'} by ${changePercent} this week.`}
      suggestion={isDecline ? 
        "Consider stress management techniques like deep breathing or meditation." :
        "Your recovery is improving! Keep up your current routine."
      }
      type={isDecline ? "warning" : "success"}
      category="heart_health"
      trend={isDecline ? "down" : "up"}
      value={`${avgHRV.toFixed(0)}ms avg`}
      confidence={0.78}
      onAction={onAction}
      actionText="Manage Stress"
    />
  );
}