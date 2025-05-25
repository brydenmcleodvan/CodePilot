import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Heart, 
  Activity, 
  Moon, 
  Droplets,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  BookOpen,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TipCardProps {
  tip: {
    id: string;
    title: string;
    message: string;
    category: 'sleep' | 'exercise' | 'nutrition' | 'hydration' | 'stress' | 'general';
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedAction?: string;
    relatedMetric?: string;
  };
  variant?: 'default' | 'compact' | 'featured';
  onDismiss?: (tipId: string) => void;
  onActionClick?: (action: string) => void;
}

export default function TipCard({ 
  tip, 
  variant = 'default',
  onDismiss,
  onActionClick 
}: TipCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep': return Moon;
      case 'exercise': return Activity;
      case 'nutrition': return Heart;
      case 'hydration': return Droplets;
      case 'stress': return Target;
      case 'general': return Lightbulb;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep': return 'from-purple-500 to-indigo-600';
      case 'exercise': return 'from-green-500 to-emerald-600';
      case 'nutrition': return 'from-red-500 to-pink-600';
      case 'hydration': return 'from-blue-500 to-cyan-600';
      case 'stress': return 'from-yellow-500 to-orange-600';
      case 'general': return 'from-gray-500 to-slate-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return TrendingUp;
      case 'low': return CheckCircle2;
      default: return Lightbulb;
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      setTimeout(() => onDismiss(tip.id), 300);
    }
  };

  const handleActionClick = () => {
    if (tip.suggestedAction && onActionClick) {
      onActionClick(tip.suggestedAction);
    }
  };

  const CategoryIcon = getCategoryIcon(tip.category);
  const PriorityIcon = getPriorityIcon(tip.priority);
  const categoryGradient = getCategoryColor(tip.category);
  const priorityColor = getPriorityColor(tip.priority);

  if (isDismissed) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryGradient} shadow-sm`}>
                <CategoryIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {tip.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {tip.message}
                </p>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative"
      >
        <Card className="overflow-hidden border-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryGradient} shadow-lg`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {tip.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={priorityColor}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {tip.priority} priority
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {tip.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Message */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {tip.message}
                </p>
              </div>

              {/* Related Metric */}
              {tip.relatedMetric && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Related to: {tip.relatedMetric}</span>
                </div>
              )}

              {/* Action Button */}
              {tip.actionable && tip.suggestedAction && (
                <div className="pt-2">
                  <Button 
                    onClick={handleActionClick}
                    className={`bg-gradient-to-r ${categoryGradient} text-white border-0 hover:opacity-90`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {tip.suggestedAction}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="relative"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryGradient} shadow-sm`}>
                  <CategoryIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {tip.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={priorityColor} variant="secondary">
                      <PriorityIcon className="h-3 w-3 mr-1" />
                      {tip.priority}
                    </Badge>
                    <span className="text-xs text-gray-500 capitalize">
                      {tip.category}
                    </span>
                  </div>
                </div>
              </div>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Message */}
            <p className="text-sm text-gray-700 dark:text-gray-300 pl-11">
              {tip.message}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pl-11">
              {tip.relatedMetric && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <BookOpen className="h-3 w-3" />
                  <span>{tip.relatedMetric}</span>
                </div>
              )}
              
              {tip.actionable && tip.suggestedAction && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleActionClick}
                  className="text-xs h-7"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {tip.suggestedAction}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}