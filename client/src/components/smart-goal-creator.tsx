import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Moon,
  Activity,
  Apple,
  Droplets,
  Heart,
  Dumbbell,
  Brain,
  CheckCircle,
  Target,
  Calendar,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface GoalCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  metrics: GoalMetric[];
}

interface GoalMetric {
  id: string;
  name: string;
  unit: string;
  suggestedTargets: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  description: string;
}

interface SmartGoalCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const goalCategories: GoalCategory[] = [
  {
    id: 'sleep',
    name: 'Sleep & Recovery',
    icon: Moon,
    description: 'Improve sleep quality and duration for better recovery',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    metrics: [
      {
        id: 'sleep_hours',
        name: 'Sleep Duration',
        unit: 'hours',
        suggestedTargets: { beginner: 7, intermediate: 8, advanced: 8.5 },
        description: 'Daily sleep hours for optimal recovery'
      },
      {
        id: 'bedtime_consistency',
        name: 'Bedtime Consistency',
        unit: 'days/week',
        suggestedTargets: { beginner: 5, intermediate: 6, advanced: 7 },
        description: 'Consistent bedtime schedule'
      }
    ]
  },
  {
    id: 'activity',
    name: 'Physical Activity',
    icon: Activity,
    description: 'Stay active with daily movement and exercise goals',
    color: 'bg-green-100 text-green-700 border-green-300',
    metrics: [
      {
        id: 'steps',
        name: 'Daily Steps',
        unit: 'steps',
        suggestedTargets: { beginner: 8000, intermediate: 10000, advanced: 12000 },
        description: 'Daily step count for cardiovascular health'
      },
      {
        id: 'workout_minutes',
        name: 'Exercise Minutes',
        unit: 'minutes',
        suggestedTargets: { beginner: 20, intermediate: 30, advanced: 45 },
        description: 'Daily active exercise time'
      }
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition & Hydration',
    icon: Apple,
    description: 'Maintain healthy eating and hydration habits',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    metrics: [
      {
        id: 'water_intake',
        name: 'Water Intake',
        unit: 'glasses',
        suggestedTargets: { beginner: 6, intermediate: 8, advanced: 10 },
        description: 'Daily water consumption'
      },
      {
        id: 'vegetable_servings',
        name: 'Vegetable Servings',
        unit: 'servings',
        suggestedTargets: { beginner: 3, intermediate: 5, advanced: 7 },
        description: 'Daily vegetable intake'
      }
    ]
  },
  {
    id: 'mindfulness',
    name: 'Mental Wellness',
    icon: Brain,
    description: 'Practice mindfulness and stress management',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    metrics: [
      {
        id: 'meditation_minutes',
        name: 'Meditation',
        unit: 'minutes',
        suggestedTargets: { beginner: 5, intermediate: 15, advanced: 30 },
        description: 'Daily meditation practice'
      },
      {
        id: 'stress_level',
        name: 'Stress Management',
        unit: 'level (1-10)',
        suggestedTargets: { beginner: 6, intermediate: 5, advanced: 4 },
        description: 'Maintain low stress levels'
      }
    ]
  }
];

const timeframes = [
  { id: 'daily', name: 'Daily', description: 'Track progress every day' },
  { id: 'weekly', name: 'Weekly', description: 'Weekly targets and check-ins' },
  { id: 'monthly', name: 'Monthly', description: 'Long-term monthly goals' }
];

export default function SmartGoalCreator({ isOpen, onClose, onSuccess }: SmartGoalCreatorProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<GoalMetric | null>(null);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [timeframe, setTimeframe] = useState('daily');
  const [notes, setNotes] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await apiRequest('POST', '/api/health-goals', goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-goals'] });
      toast({
        title: 'Goal Created Successfully!',
        description: `Your ${selectedMetric?.name} goal has been set up and tracking begins now.`,
      });
      handleClose();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: 'Goal Creation Failed',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedMetric(null);
    setTargetValue(0);
    setTimeframe('daily');
    setNotes('');
    setExperienceLevel('beginner');
    onClose();
  };

  const handleCategorySelect = (category: GoalCategory) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleMetricSelect = (metric: GoalMetric) => {
    setSelectedMetric(metric);
    setTargetValue(metric.suggestedTargets[experienceLevel]);
    setStep(3);
  };

  const handleCreateGoal = () => {
    if (!selectedCategory || !selectedMetric) return;

    const goalData = {
      metricType: selectedMetric.id,
      goalType: 'target',
      goalValue: targetValue,
      unit: selectedMetric.unit,
      timeframe,
      notes: notes || `${selectedCategory.name} goal: ${selectedMetric.name}`,
    };

    createGoalMutation.mutate(goalData);
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Smart Goal Creator
          </DialogTitle>
          <DialogDescription>
            Create personalized health goals with guided recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {step} of 4</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Category Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">Choose Your Goal Category</h3>
                  <p className="text-gray-600">Select the area you'd like to improve</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goalCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card
                        key={category.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:scale-105"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${category.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{category.name}</h4>
                              <p className="text-sm text-gray-600">{category.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {category.metrics.length} metrics available
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Metric Selection */}
            {step === 2 && selectedCategory && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Choose Your Metric</h3>
                    <p className="text-gray-600">What would you like to track in {selectedCategory.name}?</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </div>

                <div className="grid gap-4">
                  {selectedCategory.metrics.map((metric) => (
                    <Card
                      key={metric.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleMetricSelect(metric)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{metric.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Beginner: {metric.suggestedTargets.beginner} {metric.unit}</Badge>
                              <Badge variant="outline">Advanced: {metric.suggestedTargets.advanced} {metric.unit}</Badge>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Target Setting */}
            {step === 3 && selectedMetric && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Set Your Target</h3>
                    <p className="text-gray-600">Configure your {selectedMetric.name} goal</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Experience Level</Label>
                      <Select value={experienceLevel} onValueChange={(value: any) => {
                        setExperienceLevel(value);
                        setTargetValue(selectedMetric.suggestedTargets[value as keyof typeof selectedMetric.suggestedTargets]);
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Target Value</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={targetValue}
                          onChange={(e) => setTargetValue(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 min-w-fit">{selectedMetric.unit}</span>
                      </div>
                    </div>

                    <div>
                      <Label>Timeframe</Label>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeframes.map((tf) => (
                            <SelectItem key={tf.id} value={tf.id}>
                              {tf.name} - {tf.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes about your goal..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-sm">Suggested Targets</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Beginner:</span>
                          <span className="font-medium">{selectedMetric.suggestedTargets.beginner} {selectedMetric.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Intermediate:</span>
                          <span className="font-medium">{selectedMetric.suggestedTargets.intermediate} {selectedMetric.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Advanced:</span>
                          <span className="font-medium">{selectedMetric.suggestedTargets.advanced} {selectedMetric.unit}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-green-700">
                            Your goal: <strong>{targetValue} {selectedMetric.unit}</strong> {timeframe}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(4)}>
                    Review Goal
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && selectedCategory && selectedMetric && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Review Your Goal</h3>
                    <p className="text-gray-600">Confirm your goal details before creating</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </div>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${selectedCategory.color}`}>
                        {React.createElement(selectedCategory.icon, { className: "h-6 w-6" })}
                      </div>
                      <div>
                        <CardTitle>{selectedMetric.name}</CardTitle>
                        <p className="text-sm text-gray-600">{selectedCategory.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Target</Label>
                        <p className="font-semibold">{targetValue} {selectedMetric.unit}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Frequency</Label>
                        <p className="font-semibold capitalize">{timeframe}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Experience Level</Label>
                        <p className="font-semibold capitalize">{experienceLevel}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Category</Label>
                        <p className="font-semibold">{selectedCategory.name}</p>
                      </div>
                    </div>

                    {notes && (
                      <div>
                        <Label className="text-sm text-gray-500">Notes</Label>
                        <p className="text-sm">{notes}</p>
                      </div>
                    )}

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Success Conditions</span>
                      </div>
                      <ul className="mt-2 text-sm text-green-700 space-y-1">
                        <li>• Track {targetValue} {selectedMetric.unit} {timeframe}</li>
                        <li>• Receive reminders and progress updates</li>
                        <li>• Build consistent habits over time</li>
                        <li>• Celebrate milestones and achievements</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGoal}
                    disabled={createGoalMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createGoalMutation.isPending ? 'Creating Goal...' : 'Create Goal'}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}