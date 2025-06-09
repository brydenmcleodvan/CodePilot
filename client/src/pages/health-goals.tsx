import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import HealthGoalCard from '@/components/health-goal-card';
import GoalAIRecommendations from '@/components/goal-ai-recommendations';
import SmartGoalCreator from '@/components/smart-goal-creator';
import GoalCreator from '@/components/goal-creator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Brain,
} from 'lucide-react';

const createGoalSchema = z.object({
  metricType: z.string().min(1, 'Please select a metric type'),
  goalType: z.enum(['target', 'minimum', 'maximum', 'range']),
  goalValue: z.number().min(0, 'Goal value must be positive'),
  unit: z.string().min(1, 'Please specify a unit'),
  timeframe: z.enum(['daily', 'weekly', 'monthly']),
  notes: z.string().optional(),
});

type CreateGoalForm = z.infer<typeof createGoalSchema>;

interface HealthGoalWithProgress {
  id: string;
  metricType: string;
  goalType: string;
  goalValue: number;
  unit: string;
  timeframe: string;
  status: 'on_track' | 'behind' | 'ahead' | 'completed' | 'at_risk';
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  daysCompleted: number;
  totalDays: number;
  streak: number;
  createdAt: string;
  notes?: string;
}

export default function HealthGoalsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBasicCreatorOpen, setIsBasicCreatorOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<HealthGoalWithProgress | null>(null);

  const form = useForm<CreateGoalForm>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      metricType: '',
      goalType: 'target',
      goalValue: 0,
      unit: '',
      timeframe: 'daily',
      notes: '',
    },
  });

  // Fetch health goals
  const { data: goals = [], isLoading } = useQuery<HealthGoalWithProgress[]>({
    queryKey: ['/api/health-goals'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/health-goals');
      return response.json();
    },
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: CreateGoalForm) => {
      const response = await apiRequest('POST', '/api/health-goals', goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-goals'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiRequest('DELETE', `/api/health-goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-goals'] });
    },
  });

  const onSubmit = (data: CreateGoalForm) => {
    createGoalMutation.mutate(data);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoalMutation.mutate(goalId);
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const onTrack = goals.filter(g => g.status === 'on_track').length;
    const behind = goals.filter(g => g.status === 'behind' || g.status === 'at_risk').length;
    
    return { total, completed, onTrack, behind };
  };

  const stats = getGoalStats();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Health Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set and track your personal health objectives
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Smart Goal
          </Button>
          <Button variant="outline" onClick={() => setIsBasicCreatorOpen(true)}>
            <Target className="h-4 w-4 mr-2" />
            Quick Goal
          </Button>
        </div>
      </div>

      {/* Smart Goal Creator */}
      <SmartGoalCreator
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          // Refresh goals after successful creation
          queryClient.invalidateQueries({ queryKey: ['/api/health-goals'] });
        }}
      />

      {/* Basic Goal Creator Dialog */}
      <Dialog open={isBasicCreatorOpen} onOpenChange={setIsBasicCreatorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quick Goal Creator</DialogTitle>
          </DialogHeader>
          <GoalCreator />
        </DialogContent>
      </Dialog>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="my-goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-goals" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>My Goals</span>
          </TabsTrigger>
          <TabsTrigger value="ai-recommendations" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Recommendations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-goals" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.onTrack}</div>
                <div className="text-sm text-gray-600">On Track</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.behind}</div>
                <div className="text-sm text-gray-600">Needs Attention</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No health goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start your health journey by setting your first goal
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <HealthGoalCard
                id={goal.id}
                metric={goal.metricType as any}
                goalType={goal.goalType as any}
                goalValue={goal.goalValue}
                unit={goal.unit}
                progress={goal.progress}
                status={goal.status}
                timeframe={goal.timeframe as any}
                daysCompleted={goal.daysCompleted}
                totalDays={goal.totalDays}
                streak={goal.streak}
                createdAt={goal.createdAt}
                onDelete={() => handleDeleteGoal(goal.id)}
                onViewDetails={() => setSelectedGoal(goal)}
              />
            </motion.div>
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="ai-recommendations" className="space-y-6">
          <GoalAIRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}