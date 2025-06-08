import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Target, 
  ArrowRight, 
  X, 
  Calendar,
  TrendingUp,
  Heart,
  Moon,
  Footprints,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface TipCardData {
  id: string;
  title: string;
  message: string;
  category: 'sleep' | 'exercise' | 'nutrition' | 'wellness' | 'mental_health';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedGoal?: {
    metricType: string;
    suggestedTarget: number;
    unit: string;
    timeframe: string;
  };
  relatedMetrics: string[];
  timestamp: Date;
}

interface EnhancedTipCardProps {
  tip: TipCardData;
  onDismiss: (tipId: string) => void;
}

export default function EnhancedTipCard({ tip, onDismiss }: EnhancedTipCardProps) {
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [goalTarget, setGoalTarget] = useState(tip.suggestedGoal?.suggestedTarget.toString() || '');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await apiRequest('POST', '/api/health-goals', goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-goals'] });
      setIsGoalDialogOpen(false);
      onDismiss(tip.id);
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'nutrition': return <Heart className="h-4 w-4" />;
      case 'wellness': return <TrendingUp className="h-4 w-4" />;
      case 'mental_health': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'exercise': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'nutrition': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'wellness': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'mental_health': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleCreateGoal = () => {
    if (!tip.suggestedGoal) return;

    const goalData = {
      metricType: tip.suggestedGoal.metricType,
      target: parseFloat(goalTarget),
      unit: tip.suggestedGoal.unit,
      timeframe: tip.suggestedGoal.timeframe,
      targetDate: goalDeadline || undefined,
      notes: `Created from tip: ${tip.title}`
    };

    createGoalMutation.mutate(goalData);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="group"
      >
        <Card className={`overflow-hidden border-l-4 hover:shadow-lg transition-all ${getPriorityColor(tip.priority)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                  {getCategoryIcon(tip.category)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{tip.title}</span>
                    <Badge className={getCategoryColor(tip.category)}>
                      {tip.category.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimeAgo(tip.timestamp)} • Priority: {tip.priority}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(tip.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tip Message */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {tip.message}
            </p>

            {/* Related Metrics */}
            {tip.relatedMetrics.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Related to:
                </p>
                <div className="flex flex-wrap gap-1">
                  {tip.relatedMetrics.map((metric, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {metric.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                {tip.actionable && tip.suggestedGoal && (
                  <Button
                    onClick={() => setIsGoalDialogOpen(true)}
                    className="flex items-center space-x-2"
                    disabled={createGoalMutation.isPending}
                  >
                    <Target className="h-4 w-4" />
                    <span>Try This</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={() => onDismiss(tip.id)}>
                  Got it
                </Button>
              </div>

              {tip.suggestedGoal && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Suggested goal: {tip.suggestedGoal.suggestedTarget} {tip.suggestedGoal.unit}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          
          {tip.suggestedGoal && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Goal Type:</strong> {tip.suggestedGoal.metricType.replace('_', ' ')}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  <strong>Timeframe:</strong> {tip.suggestedGoal.timeframe}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goalTarget">Target Value</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="goalTarget"
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="flex-1"
                    placeholder={tip.suggestedGoal.suggestedTarget.toString()}
                  />
                  <span className="text-sm text-gray-500">{tip.suggestedGoal.unit}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goalDeadline">Target Date (Optional)</Label>
                <Input
                  id="goalDeadline"
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  💡 <strong>Why this helps:</strong> {tip.message}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGoal}
              disabled={createGoalMutation.isPending || !goalTarget}
            >
              {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}