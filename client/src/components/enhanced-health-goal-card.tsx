import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Pause, 
  Play, 
  Edit3, 
  Calendar,
  Check,
  X,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HealthGoal {
  id: number;
  metricType: string;
  target: number;
  unit: string;
  currentValue: number;
  progress: number;
  status: 'on_track' | 'behind' | 'completed' | 'ahead' | 'at_risk';
  streak: number;
  isPaused: boolean;
  createdAt: string;
  targetDate?: string;
}

interface EnhancedHealthGoalCardProps {
  goal: HealthGoal;
  onEdit: (goalId: number, updates: Partial<HealthGoal>) => void;
  onTogglePause: (goalId: number) => void;
  onDelete: (goalId: number) => void;
}

export default function EnhancedHealthGoalCard({ 
  goal, 
  onEdit, 
  onTogglePause, 
  onDelete 
}: EnhancedHealthGoalCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(goal.target.toString());
  const [editTargetDate, setEditTargetDate] = useState(goal.targetDate || '');

  const getStatusColor = (status: string, isPaused: boolean) => {
    if (isPaused) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'ahead': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on_track': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'behind': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'at_risk': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getProgressColor = (status: string, isPaused: boolean) => {
    if (isPaused) return 'bg-gray-400';
    
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'ahead': return 'bg-blue-500';
      case 'on_track': return 'bg-emerald-500';
      case 'behind': return 'bg-yellow-500';
      case 'at_risk': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleEdit = () => {
    const updatedGoal = {
      target: parseFloat(editTarget),
      targetDate: editTargetDate || undefined,
    };
    onEdit(goal.id, updatedGoal);
    setIsEditDialogOpen(false);
  };

  const formatMetricType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTrendIcon = () => {
    if (goal.isPaused) return <Pause className="h-4 w-4" />;
    if (goal.progress >= 100) return <Check className="h-4 w-4" />;
    if (goal.status === 'ahead' || goal.status === 'on_track') return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <Card className={`overflow-hidden transition-all hover:shadow-lg ${
          goal.isPaused ? 'opacity-75' : ''
        } ${
          goal.status === 'completed' ? 'ring-2 ring-green-200 dark:ring-green-800' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  goal.isPaused ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <Target className={`h-5 w-5 ${
                    goal.isPaused ? 'text-gray-500' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{formatMetricType(goal.metricType)}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Goal: {goal.target} {goal.unit}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(goal.status, goal.isPaused)}>
                  {getTrendIcon()}
                  <span className="ml-1 capitalize">
                    {goal.isPaused ? 'Paused' : goal.status.replace('_', ' ')}
                  </span>
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Goal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTogglePause(goal.id)}>
                      {goal.isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Goal
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Goal
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(goal.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete Goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-semibold">
                  {goal.currentValue} / {goal.target} {goal.unit} ({Math.round(goal.progress)}%)
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={Math.min(goal.progress, 100)} 
                  className="h-3"
                />
                <div 
                  className={`absolute inset-0 h-3 rounded-full transition-all ${getProgressColor(goal.status, goal.isPaused)}`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Current Streak</div>
                  <div className="font-semibold">{goal.streak} days</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Target Date</div>
                  <div className="font-semibold">
                    {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No date set'}
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            {!goal.isPaused && (
              <div className={`p-3 rounded-lg text-sm ${
                goal.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                goal.status === 'ahead' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                goal.status === 'on_track' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' :
                goal.status === 'behind' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                {goal.status === 'completed' && '🎉 Goal completed! Amazing work!'}
                {goal.status === 'ahead' && '🚀 You\'re ahead of schedule! Keep it up!'}
                {goal.status === 'on_track' && '✅ Perfect! You\'re right on track!'}
                {goal.status === 'behind' && '💪 You can catch up! Stay focused!'}
                {goal.status === 'at_risk' && '⚡ Time to refocus and push harder!'}
              </div>
            )}

            {goal.isPaused && (
              <div className="p-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                ⏸️ Goal is paused. Resume when you're ready to continue!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Value</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="target"
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">{goal.unit}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (Optional)</Label>
              <Input
                id="targetDate"
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}