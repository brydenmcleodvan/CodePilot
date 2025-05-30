import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface HealthGoal {
  goalType: string;
  target: number;
  duration: number;
  unit: string;
}

export default function GoalCreator() {
  const [goalType, setGoalType] = useState('');
  const [target, setTarget] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const goalOptions = [
    { value: 'steps', label: 'Daily Steps', unit: 'steps', placeholder: '10000' },
    { value: 'sleep', label: 'Sleep Hours', unit: 'hours', placeholder: '8' },
    { value: 'water', label: 'Water Intake', unit: 'glasses', placeholder: '8' },
    { value: 'meditation', label: 'Meditation Minutes', unit: 'minutes', placeholder: '15' },
    { value: 'exercise', label: 'Exercise Sessions', unit: 'sessions/week', placeholder: '5' },
    { value: 'nutrition', label: 'Nutrition Score', unit: 'points', placeholder: '85' }
  ];

  const selectedGoal = goalOptions.find(option => option.value === goalType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalType || !target || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to create your goal.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const goalData = {
        metricType: goalType,
        goalType: 'target',
        goalValue: parseInt(target),
        unit: selectedGoal?.unit || '',
        timeframe: 'daily',
        notes: `${selectedGoal?.label} goal for ${duration} days`
      };

      // Send to backend API
      const response = await fetch('/api/health-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      const result = await response.json();
      
      toast({
        title: "Goal Created Successfully!",
        description: `Your ${selectedGoal?.label} goal has been set for ${duration} days.`,
      });

      // Reset form
      setGoalType('');
      setTarget('');
      setDuration('');
      
      // Refresh goals list if callback provided
      if (typeof window !== 'undefined' && window.location.pathname.includes('health-goals')) {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error Creating Goal",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-heading flex items-center space-x-2">
          <i className="ri-target-line text-primary"></i>
          <span>Create Health Goal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your health goal..." />
              </SelectTrigger>
              <SelectContent>
                {goalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      <span className="text-sm text-gray-500">({option.unit})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGoal && (
            <div className="space-y-2">
              <Label htmlFor="target">
                Target {selectedGoal.label} ({selectedGoal.unit})
              </Label>
              <Input
                id="target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={`e.g., ${selectedGoal.placeholder}`}
                min="1"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 30"
              min="1"
              max="365"
            />
          </div>

          {goalType && target && duration && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-medium text-primary mb-2">Goal Summary</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Achieve <strong>{target} {selectedGoal?.unit}</strong> of{' '}
                <strong>{selectedGoal?.label}</strong> for the next{' '}
                <strong>{duration} days</strong>.
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !goalType || !target || !duration}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Goal...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <i className="ri-add-line"></i>
                <span>Create Goal</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}