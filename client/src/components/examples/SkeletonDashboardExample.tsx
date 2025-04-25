/**
 * Skeleton Dashboard Example
 * 
 * Demonstrates using the skeleton loading components with our service architecture.
 */

import React, { useState } from 'react';
import { useServiceQueryWithSkeleton } from '@/hooks/use-service-query-with-skeleton';
import { services } from '@/services/service-factory';
import { MetricType, type TimeRange } from '@/services/api/health-metrics-service';
import { ServiceSkeleton } from '@/components/service-skeleton';
import { format, subDays } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  RefreshCw, 
  Activity,
  Heart,
  Bed,
  Weight,
  Dumbbell,
  PieChart,
  BarChart2
} from 'lucide-react';

export function SkeletonDashboardExample() {
  // State for skeleton demo settings
  const [demoMode, setDemoMode] = useState<'instant' | 'loading' | 'error' | 'empty'>('loading');
  const [skeletonType, setSkeletonType] = useState<'card' | 'chart' | 'table' | 'list'>('chart');
  
  // Health metrics parameters
  const [metricType, setMetricType] = useState<MetricType>(MetricType.STEPS);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Query for health metrics with skeleton integration
  const metricsQuery = useServiceQueryWithSkeleton(
    ['health-metrics-demo', metricType, timeRange, demoMode],
    () => {
      // In real use, we'd call the actual service:
      // return services.healthMetrics.getMetricsByType(metricType, timeRange)
      
      // For demo purposes, we'll simulate different states:
      return new Promise((resolve, reject) => {
        const delay = demoMode === 'instant' ? 0 : 2000;
        
        setTimeout(() => {
          if (demoMode === 'error') {
            reject(new Error('Failed to load health metrics. This is a simulated error for demonstration purposes.'));
            return;
          }
          
          if (demoMode === 'empty') {
            resolve([]);
            return;
          }
          
          // Generate sample data
          const data = Array.from({ length: 14 }).map((_, i) => {
            const date = subDays(new Date(), 13 - i);
            
            let value: number;
            switch (metricType) {
              case MetricType.STEPS:
                value = Math.floor(Math.random() * 5000) + 3000;
                break;
              case MetricType.HEART_RATE:
                value = Math.floor(Math.random() * 30) + 60;
                break;
              case MetricType.SLEEP:
                value = Math.floor(Math.random() * 3) + 5;
                break;
              case MetricType.WEIGHT:
                value = Math.floor(Math.random() * 5) + 70;
                break;
              default:
                value = Math.floor(Math.random() * 100);
            }
            
            return {
              id: `metric-${i}`,
              userId: 1,
              type: metricType,
              value,
              timestamp: date.toISOString(),
              unit: getMetricInfo(metricType).unit
            };
          });
          
          resolve(data);
        }, delay);
      });
    },
    [],
    {
      skeletonType,
      skeletonProps: {
        type: skeletonType === 'chart' ? 'bar' : undefined,
        height: '300px',
        hasHeader: true,
        contentLines: 4
      },
      minLoadingTime: 500,
      emptyMessage: `No ${getMetricInfo(metricType).label.toLowerCase()} data available for the selected period`,
      retry: true
    }
  );
  
  // Get units and descriptions for different metric types
  function getMetricInfo(type: MetricType) {
    switch (type) {
      case MetricType.STEPS:
        return { unit: 'steps', label: 'Steps', color: '#4A90E2', icon: Activity };
      case MetricType.HEART_RATE:
        return { unit: 'bpm', label: 'Heart Rate', color: '#E53E3E', icon: Heart };
      case MetricType.SLEEP:
        return { unit: 'hours', label: 'Sleep', color: '#9F7AEA', icon: Bed };
      case MetricType.WEIGHT:
        return { unit: 'kg', label: 'Weight', color: '#38A169', icon: Weight };
      default:
        return { unit: '', label: 'Value', color: '#718096', icon: Dumbbell };
    }
  }
  
  // Format data for chart
  const formatChartData = (data: any[]) => {
    return data.map(metric => ({
      date: format(new Date(metric.timestamp), 'MMM dd'),
      value: metric.value
    }));
  };
  
  // Get average, min, max from metrics
  const getMetricStats = (data: any[]) => {
    if (!data.length) return { avg: 0, min: 0, max: 0 };
    
    const values = data.map(d => d.value);
    return {
      avg: values.reduce((acc, val) => acc + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };
  
  const metricInfo = getMetricInfo(metricType);
  
  // Change time range handler
  const handleTimeRangeChange = (days: number) => {
    setTimeRange({
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    });
  };
  
  return (
    <div className="space-y-8">
      {/* Demo controls */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Loading Demo Controls</CardTitle>
          <CardDescription>
            Try different loading states and skeleton types to see how they look
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Demo Mode</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={demoMode === 'instant' ? 'default' : 'outline'}
                onClick={() => setDemoMode('instant')}
              >
                Instant
              </Button>
              <Button 
                size="sm" 
                variant={demoMode === 'loading' ? 'default' : 'outline'}
                onClick={() => setDemoMode('loading')}
              >
                Loading
              </Button>
              <Button 
                size="sm" 
                variant={demoMode === 'error' ? 'default' : 'outline'}
                onClick={() => setDemoMode('error')}
              >
                Error
              </Button>
              <Button 
                size="sm" 
                variant={demoMode === 'empty' ? 'default' : 'outline'}
                onClick={() => setDemoMode('empty')}
              >
                Empty
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Skeleton Type</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={skeletonType === 'card' ? 'default' : 'outline'}
                onClick={() => setSkeletonType('card')}
              >
                Card
              </Button>
              <Button 
                size="sm" 
                variant={skeletonType === 'chart' ? 'default' : 'outline'}
                onClick={() => setSkeletonType('chart')}
              >
                Chart
              </Button>
              <Button 
                size="sm" 
                variant={skeletonType === 'table' ? 'default' : 'outline'}
                onClick={() => setSkeletonType('table')}
              >
                Table
              </Button>
              <Button 
                size="sm" 
                variant={skeletonType === 'list' ? 'default' : 'outline'}
                onClick={() => setSkeletonType('list')}
              >
                List
              </Button>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={() => metricsQuery.refetch()}
              disabled={metricsQuery.isLoading}
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${metricsQuery.isLoading ? 'animate-spin' : ''}`} />
              Reload Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Main chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <metricInfo.icon className="h-5 w-5 text-primary" />
            {metricInfo.label} Metrics
          </CardTitle>
          <CardDescription>
            View and analyze your {metricInfo.label.toLowerCase()} data
          </CardDescription>
        </CardHeader>
        
        <Tabs 
          defaultValue="chart" 
          className="w-full"
        >
          <div className="px-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="chart" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Chart</span>
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center gap-1">
                  <PieChart className="h-4 w-4" />
                  <span>Distribution</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2 text-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleTimeRangeChange(7)}
                  className={timeRange.startDate === format(subDays(new Date(), 7), 'yyyy-MM-dd') ? 'bg-secondary' : ''}
                >
                  7d
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleTimeRangeChange(30)}
                  className={timeRange.startDate === format(subDays(new Date(), 30), 'yyyy-MM-dd') ? 'bg-secondary' : ''}
                >
                  30d
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleTimeRangeChange(90)}
                  className={timeRange.startDate === format(subDays(new Date(), 90), 'yyyy-MM-dd') ? 'bg-secondary' : ''}
                >
                  90d
                </Button>
              </div>
            </div>
          </div>
          
          <div className="px-1 pt-4">
            <TabsContent value="chart" className="mt-0">
              <div className="px-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Tabs 
                      value={metricType} 
                      onValueChange={(value) => setMetricType(value as MetricType)}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-4 w-full md:w-auto">
                        <TabsTrigger value={MetricType.STEPS}>Steps</TabsTrigger>
                        <TabsTrigger value={MetricType.HEART_RATE}>Heart Rate</TabsTrigger>
                        <TabsTrigger value={MetricType.SLEEP}>Sleep</TabsTrigger>
                        <TabsTrigger value={MetricType.WEIGHT}>Weight</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                {/* Chart with skeleton loading */}
                <div className="h-[300px] w-full">
                  {metricsQuery.render(data => {
                    const chartData = formatChartData(data);
                    const stats = getMetricStats(data);
                    
                    return (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              unit={` ${metricInfo.unit}`} 
                              width={70} 
                            />
                            <Tooltip
                              formatter={(value) => [`${value} ${metricInfo.unit}`, metricInfo.label]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name={metricInfo.label}
                              stroke={metricInfo.color}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        
                        <div className="grid grid-cols-3 gap-4 mt-6 px-6">
                          <div className="bg-background rounded-lg p-3 border">
                            <div className="text-sm font-medium text-muted-foreground">Average</div>
                            <div className="text-2xl font-bold">{Math.round(stats.avg)}</div>
                            <div className="text-xs text-muted-foreground">{metricInfo.unit}</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 border">
                            <div className="text-sm font-medium text-muted-foreground">Maximum</div>
                            <div className="text-2xl font-bold">{stats.max}</div>
                            <div className="text-xs text-muted-foreground">{metricInfo.unit}</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 border">
                            <div className="text-sm font-medium text-muted-foreground">Minimum</div>
                            <div className="text-2xl font-bold">{stats.min}</div>
                            <div className="text-xs text-muted-foreground">{metricInfo.unit}</div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="mt-0">
              <div className="h-[300px] w-full">
                {metricsQuery.render(data => {
                  // Process data for distribution chart
                  const getDistributionData = () => {
                    const ranges: Record<string, number> = {};
                    
                    data.forEach(metric => {
                      let range = '';
                      
                      switch(metricType) {
                        case MetricType.STEPS:
                          if (metric.value < 5000) range = '<5k';
                          else if (metric.value < 7500) range = '5-7.5k';
                          else if (metric.value < 10000) range = '7.5-10k';
                          else range = '10k+';
                          break;
                        
                        case MetricType.HEART_RATE:
                          if (metric.value < 60) range = '<60';
                          else if (metric.value < 70) range = '60-70';
                          else if (metric.value < 80) range = '70-80';
                          else if (metric.value < 90) range = '80-90';
                          else range = '90+';
                          break;
                          
                        case MetricType.SLEEP:
                          if (metric.value < 6) range = '<6h';
                          else if (metric.value < 7) range = '6-7h';
                          else if (metric.value < 8) range = '7-8h';
                          else range = '8h+';
                          break;
                          
                        case MetricType.WEIGHT:
                          if (metric.value < 70) range = '<70kg';
                          else if (metric.value < 75) range = '70-75kg';
                          else if (metric.value < 80) range = '75-80kg';
                          else range = '80kg+';
                          break;
                          
                        default:
                          range = 'Unknown';
                      }
                      
                      ranges[range] = (ranges[range] || 0) + 1;
                    });
                    
                    return Object.entries(ranges).map(([range, count]) => ({
                      range,
                      count,
                      percentage: (count / data.length) * 100
                    }));
                  };
                  
                  const distributionData = getDistributionData();
                  
                  return (
                    <div className="px-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="count" name="Frequency" fill="#8884d8" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="percentage" name="Percentage (%)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <CardFooter className="pt-2 border-t">
          <div className="w-full text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Date range: {format(new Date(timeRange.startDate), 'MMM dd, yyyy')} - {format(new Date(timeRange.endDate), 'MMM dd, yyyy')}</span>
              <span>Updated {metricsQuery.isLoading ? 'now' : 'recently'}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}