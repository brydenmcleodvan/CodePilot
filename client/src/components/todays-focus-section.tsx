import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Calendar,
  Activity,
  Heart,
  Moon,
  Brain,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TodaysFocus {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'goal' | 'habit' | 'health_check' | 'improvement';
  estimatedTime: string;
  aiReasoning: string;
  relatedGoals: string[];
  quickActions: {
    label: string;
    action: string;
    type: 'log_data' | 'complete_task' | 'view_insights';
  }[];
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  healthImpact: number; // 1-10 scale
}

interface DailyGuidance {
  motivationalMessage: string;
  keyMetricToWatch: {
    name: string;
    current: number;
    target: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
  };
  priorityFocus: TodaysFocus[];
  weatherBasedTips: string[];
  energyLevelOptimization: string;
  generatedAt: string;
}

export default function TodaysFocusSection() {
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);

  // Fetch today's AI-generated guidance
  const { data: guidance, isLoading, refetch } = useQuery<DailyGuidance>({
    queryKey: ['/api/daily-guidance'],
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <Zap className="h-4 w-4 text-red-600" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'goal': return <Target className="h-4 w-4" />;
      case 'habit': return <Calendar className="h-4 w-4" />;
      case 'health_check': return <Heart className="h-4 w-4" />;
      case 'improvement': return <Brain className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCompletionIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'not_started': return <Target className="h-4 w-4 text-gray-400" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Today's Focus</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!guidance) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Generating your personalized daily guidance...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
                <Brain className="h-6 w-6" />
                <span>Today's Focus</span>
              </h2>
              <p className="text-purple-100 text-lg">
                {guidance.motivationalMessage}
              </p>
              <p className="text-purple-200 text-sm mt-2">
                AI guidance generated at {new Date(guidance.generatedAt).toLocaleTimeString()}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => refetch()}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metric to Watch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Key Metric Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {guidance.keyMetricToWatch.name}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {guidance.keyMetricToWatch.current} / {guidance.keyMetricToWatch.target}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {guidance.keyMetricToWatch.unit}
              </div>
            </div>
            
            <Progress 
              value={(guidance.keyMetricToWatch.current / guidance.keyMetricToWatch.target) * 100} 
              className="h-2"
            />
            
            <div className="flex items-center justify-center space-x-2">
              <Badge className={
                guidance.keyMetricToWatch.trend === 'improving' ? 'bg-green-100 text-green-800' :
                guidance.keyMetricToWatch.trend === 'declining' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {guidance.keyMetricToWatch.trend === 'improving' ? '📈' : 
                 guidance.keyMetricToWatch.trend === 'declining' ? '📉' : '➡️'}
                {guidance.keyMetricToWatch.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Energy Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Energy Optimization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm leading-relaxed">
                {guidance.energyLevelOptimization}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weather-Based Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Moon className="h-5 w-5 text-indigo-600" />
              <span>Smart Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {guidance.weatherBasedTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <Lightbulb className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Priority Focus Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Priority Actions</span>
            <Badge variant="outline">
              {guidance.priorityFocus.filter(f => f.completionStatus !== 'completed').length} remaining
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {guidance.priorityFocus.map((focus, index) => (
            <motion.div
              key={focus.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border-l-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                getPriorityColor(focus.priority)
              } ${
                selectedFocus === focus.id ? 'ring-2 ring-purple-300' : ''
              } ${
                focus.completionStatus === 'completed' ? 'opacity-75' : ''
              }`}
              onClick={() => setSelectedFocus(selectedFocus === focus.id ? null : focus.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    {getCompletionIcon(focus.completionStatus)}
                    {getCategoryIcon(focus.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${
                        focus.completionStatus === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {focus.title}
                      </h3>
                      <Badge className="text-xs" variant="outline">
                        {focus.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {focus.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{focus.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>Impact: {focus.healthImpact}/10</span>
                      </div>
                      {getPriorityIcon(focus.priority)}
                      <span className="capitalize">{focus.priority}</span>
                    </div>
                  </div>
                </div>
                
                <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${
                  selectedFocus === focus.id ? 'rotate-90' : ''
                }`} />
              </div>

              {/* Expanded Details */}
              {selectedFocus === focus.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        AI Reasoning:
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded">
                        {focus.aiReasoning}
                      </p>
                    </div>

                    {focus.relatedGoals.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Related Goals:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {focus.relatedGoals.map((goal, goalIndex) => (
                            <Badge key={goalIndex} variant="secondary" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Quick Actions:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {focus.quickActions.map((action, actionIndex) => (
                          <Button key={actionIndex} size="sm" variant="outline">
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}