import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from "@tanstack/react-query";
import { Line, Scatter } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BarChart3,
  Eye,
  Heart,
  Activity,
  Brain,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Health Insights Correlation Component
 * Displays intelligent correlations and cause-effect relationships
 */
export function HealthInsightsCorrelation() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedMetrics, setSelectedMetrics] = useState(['sleep_duration', 'glucose_level']);
  const { effectiveTheme } = useThemeSync();

  // Fetch correlation insights
  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['/api/health-insights/correlations', selectedTimeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/health-insights/correlations?timeframe=${selectedTimeframe}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch visualization data for selected metrics
  const { data: visualizationData } = useQuery({
    queryKey: ['/api/health-insights/visualization', selectedMetrics[0], selectedMetrics[1], selectedTimeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', 
        `/api/health-insights/visualization?metric1=${selectedMetrics[0]}&metric2=${selectedMetrics[1]}&timeframe=${selectedTimeframe}`
      );
      return res.json();
    },
    enabled: selectedMetrics.length === 2
  });

  const isDark = effectiveTheme === 'dark';
  
  const chartColors = {
    primary: '#4A90E2',
    secondary: '#7B68EE',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: isDark ? '#F3F4F6' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB'
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const {
    success = false,
    insights: correlationInsights = [],
    dataPoints = 0,
    correlations = 0
  } = insights || {};

  if (!success) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Building Your Health Insights</h3>
          <p className="text-gray-600 mb-4">
            We need at least 7 days of health data to discover meaningful patterns and correlations.
          </p>
          <p className="text-sm text-gray-500">
            Keep tracking your health metrics, and we'll automatically start finding insights for you!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <span>Health Insights & Correlations</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Discover meaningful patterns and cause-effect relationships in your health data
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Data Points Analyzed</p>
                <p className="text-2xl font-bold">{dataPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Correlations Found</p>
                <p className="text-2xl font-bold">{correlations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Insights Generated</p>
                <p className="text-2xl font-bold">{correlationInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="visualizations">Data Visualizations</TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="space-y-4">
            <AnimatePresence>
              {correlationInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <InsightCard insight={insight} />
                </motion.div>
              ))}
            </AnimatePresence>

            {correlationInsights.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Significant Patterns Yet</h3>
                  <p className="text-gray-600">
                    Continue tracking your health metrics. We'll automatically discover insights as patterns emerge in your data.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations">
          <div className="space-y-6">
            {/* Metric Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Correlation Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Metric</label>
                    <Select 
                      value={selectedMetrics[0]} 
                      onValueChange={(value) => setSelectedMetrics([value, selectedMetrics[1]])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sleep_duration">Sleep Duration</SelectItem>
                        <SelectItem value="heart_rate_variability">Heart Rate Variability</SelectItem>
                        <SelectItem value="glucose_level">Blood Glucose</SelectItem>
                        <SelectItem value="exercise_duration">Exercise Duration</SelectItem>
                        <SelectItem value="stress_level">Stress Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Metric</label>
                    <Select 
                      value={selectedMetrics[1]} 
                      onValueChange={(value) => setSelectedMetrics([selectedMetrics[0], value])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glucose_level">Blood Glucose</SelectItem>
                        <SelectItem value="heart_rate_variability">Heart Rate Variability</SelectItem>
                        <SelectItem value="sleep_duration">Sleep Duration</SelectItem>
                        <SelectItem value="stress_level">Stress Level</SelectItem>
                        <SelectItem value="mood_score">Mood Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {visualizationData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scatter Plot */}
                    <div>
                      <h3 className="font-semibold mb-3">Correlation Scatter Plot</h3>
                      <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Scatter
                          data={{
                            datasets: [{
                              label: 'Data Points',
                              data: visualizationData.scatterPlot || [],
                              backgroundColor: chartColors.primary + '60',
                              borderColor: chartColors.primary,
                              pointRadius: 4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                            },
                            scales: {
                              x: {
                                title: {
                                  display: true,
                                  text: selectedMetrics[0].replace('_', ' '),
                                  color: chartColors.text
                                },
                                grid: { color: chartColors.grid },
                                ticks: { color: chartColors.text }
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: selectedMetrics[1].replace('_', ' '),
                                  color: chartColors.text
                                },
                                grid: { color: chartColors.grid },
                                ticks: { color: chartColors.text }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Timeline Overlay */}
                    <div>
                      <h3 className="font-semibold mb-3">Timeline Comparison</h3>
                      <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Line
                          data={{
                            labels: visualizationData.timeline?.metric1Data?.map(d => 
                              new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            ) || [],
                            datasets: [
                              {
                                label: selectedMetrics[0].replace('_', ' '),
                                data: visualizationData.timeline?.metric1Data?.map(d => d.value) || [],
                                borderColor: chartColors.primary,
                                backgroundColor: chartColors.primary + '20',
                                tension: 0.4
                              },
                              {
                                label: selectedMetrics[1].replace('_', ' '),
                                data: visualizationData.timeline?.metric2Data?.map(d => d.value) || [],
                                borderColor: chartColors.secondary,
                                backgroundColor: chartColors.secondary + '20',
                                tension: 0.4,
                                yAxisID: 'y1'
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: { color: chartColors.text }
                              }
                            },
                            scales: {
                              x: {
                                grid: { color: chartColors.grid },
                                ticks: { color: chartColors.text }
                              },
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                grid: { color: chartColors.grid },
                                ticks: { color: chartColors.text }
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                grid: { drawOnChartArea: false },
                                ticks: { color: chartColors.text }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Correlation Stats */}
                {visualizationData?.correlation && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Correlation Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Correlation</p>
                        <p className="font-bold">{visualizationData.correlation.coefficient.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Strength</p>
                        <Badge className={
                          visualizationData.correlation.strength === 'strong' ? 'bg-green-100 text-green-800' :
                          visualizationData.correlation.strength === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {visualizationData.correlation.strength}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Direction</p>
                        <div className="flex items-center space-x-1">
                          {visualizationData.correlation.direction === 'positive' ? 
                            <TrendingUp className="h-4 w-4 text-green-600" /> :
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          }
                          <span className="font-medium">{visualizationData.correlation.direction}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Significance</p>
                        <p className="font-bold">{(visualizationData.correlation.significance * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Individual Insight Card Component
 */
function InsightCard({ insight }) {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'correlation':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'recommendation':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'very strong':
      case 'strong':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            {getInsightIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{insight.title}</h3>
              <div className="flex items-center space-x-2">
                {insight.strength && (
                  <Badge className={getStrengthColor(insight.strength)}>
                    {insight.strength}
                  </Badge>
                )}
                {insight.actionable && (
                  <Badge variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Actionable
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {insight.message}
            </p>
            
            {insight.coefficient && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Correlation: {insight.coefficient.toFixed(3)}</span>
                {insight.significance && (
                  <span>Significance: {(insight.significance * 100).toFixed(1)}%</span>
                )}
              </div>
            )}
            
            {insight.metrics && (
              <div className="flex flex-wrap gap-2 mt-3">
                {insight.metrics.map((metric, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {metric.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HealthInsightsCorrelation;