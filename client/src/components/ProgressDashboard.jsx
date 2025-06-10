import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Moon,
  Heart,
  Footprints,
  Calendar,
  BarChart3,
  LineChart,
  Target,
  Award,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Progress Dashboard Component
 * Real-world health outcome reporting with biometric trend analysis
 */
export function ProgressDashboard({ userId, className = "" }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Fetch biometric trends data
  const { data: trendsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/biometric/trends', timeRange],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/biometric/trends?period=${timeRange}`);
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch progress summary
  const { data: progressSummary } = useQuery({
    queryKey: ['/api/health/progress-summary', timeRange],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/health/progress-summary?period=${timeRange}`);
      return res.json();
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600 animate-pulse" />
            Loading Progress Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trends = trendsData?.trends || {};
  const summary = progressSummary || {};

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <CardTitle>Health Progress & Outcomes</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <ProgressCard
            title="Steps"
            value={summary.steps?.current || 0}
            previousValue={summary.steps?.previous || 0}
            unit="steps/day"
            icon={<Footprints className="h-5 w-5" />}
            color="blue"
          />
          
          <ProgressCard
            title="Sleep Quality"
            value={summary.sleep?.current || 0}
            previousValue={summary.sleep?.previous || 0}
            unit="hours"
            icon={<Moon className="h-5 w-5" />}
            color="purple"
          />
          
          <ProgressCard
            title="HRV"
            value={summary.hrv?.current || 0}
            previousValue={summary.hrv?.previous || 0}
            unit="ms"
            icon={<Heart className="h-5 w-5" />}
            color="red"
          />
          
          <ProgressCard
            title="Activity Score"
            value={summary.activity?.current || 0}
            previousValue={summary.activity?.previous || 0}
            unit="points"
            icon={<Activity className="h-5 w-5" />}
            color="green"
          />
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="goals">Goal Progress</TabsTrigger>
            <TabsTrigger value="insights">Health Insights</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Trend Analysis */}
          <TabsContent value="trends" className="space-y-4">
            <TrendAnalysisView trends={trends} timeRange={timeRange} />
          </TabsContent>

          {/* Goal Progress */}
          <TabsContent value="goals" className="space-y-4">
            <GoalProgressView summary={summary} />
          </TabsContent>

          {/* Health Insights */}
          <TabsContent value="insights" className="space-y-4">
            <HealthInsightsView trends={trends} summary={summary} />
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-4">
            <AchievementsView summary={summary} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Progress Card Component with Delta Visualization
 */
function ProgressCard({ title, value, previousValue, unit, icon, color }) {
  const delta = value - previousValue;
  const deltaPercentage = previousValue > 0 ? ((delta / previousValue) * 100) : 0;
  
  const getDeltaColor = () => {
    if (delta > 0) return 'text-green-600';
    if (delta < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDeltaIcon = () => {
    if (delta > 0) return <ArrowUp className="h-3 w-3" />;
    if (delta < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600';
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600';
      case 'red': return 'bg-red-50 dark:bg-red-900/20 text-red-600';
      case 'green': return 'bg-green-50 dark:bg-green-900/20 text-green-600';
      default: return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${getColorClasses()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="text-xs text-gray-600">{unit}</div>
        
        <div className={`flex items-center gap-1 text-xs ${getDeltaColor()}`}>
          {getDeltaIcon()}
          <span>
            {Math.abs(deltaPercentage).toFixed(1)}% vs prev period
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Trend Analysis View Component
 */
function TrendAnalysisView({ trends, timeRange }) {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const createChartData = (data, label, color) => ({
    labels: data?.dates || [],
    datasets: [
      {
        label,
        data: data?.values || [],
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Steps Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Footprints className="h-4 w-4 text-blue-600" />
              Daily Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.steps ? (
              <Line 
                data={createChartData(trends.steps, 'Steps', '#3B82F6')} 
                options={{...chartOptions, maintainAspectRatio: false}} 
                height={200}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No steps data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Moon className="h-4 w-4 text-purple-600" />
              Sleep Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.sleep ? (
              <Line 
                data={createChartData(trends.sleep, 'Hours', '#8B5CF6')} 
                options={{...chartOptions, maintainAspectRatio: false}} 
                height={200}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sleep data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* HRV Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-red-600" />
              Heart Rate Variability
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.hrv ? (
              <Line 
                data={createChartData(trends.hrv, 'HRV (ms)', '#EF4444')} 
                options={{...chartOptions, maintainAspectRatio: false}} 
                height={200}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No HRV data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-green-600" />
              Activity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.activity ? (
              <Line 
                data={createChartData(trends.activity, 'Score', '#10B981')} 
                options={{...chartOptions, maintainAspectRatio: false}} 
                height={200}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activity data available for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Goal Progress View Component
 */
function GoalProgressView({ summary }) {
  const goals = summary.goals || [];

  return (
    <div className="space-y-4">
      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
          <p className="text-gray-600 mb-4">Set health goals to track your progress</p>
          <Button>Set Goals</Button>
        </div>
      ) : (
        goals.map((goal, index) => (
          <GoalProgressCard key={index} goal={goal} />
        ))
      )}
    </div>
  );
}

/**
 * Goal Progress Card Component
 */
function GoalProgressCard({ goal }) {
  const progressPercentage = (goal.current / goal.target) * 100;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{goal.title}</h4>
          <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
            {Math.round(progressPercentage)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{goal.current} {goal.unit}</span>
            <span>Goal: {goal.target} {goal.unit}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {goal.timeframe} • {goal.current >= goal.target ? 'Completed!' : `${goal.target - goal.current} ${goal.unit} remaining`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Health Insights View Component
 */
function HealthInsightsView({ trends, summary }) {
  const insights = summary.insights || [];

  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generating Insights</h3>
          <p className="text-gray-600">Keep tracking your health data to receive personalized insights</p>
        </div>
      ) : (
        insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'improvement' ? 'bg-green-100 text-green-600' :
                  insight.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-blue-600 mt-2">💡 {insight.recommendation}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/**
 * Achievements View Component
 */
function AchievementsView({ summary }) {
  const achievements = summary.achievements || [];

  return (
    <div className="space-y-4">
      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
          <p className="text-gray-600">Keep tracking your health to unlock achievements</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Earned {new Date(achievement.earned_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;