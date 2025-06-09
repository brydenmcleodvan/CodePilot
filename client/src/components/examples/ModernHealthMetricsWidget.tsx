/**
 * Modern Health Metrics Widget Example
 * Demonstrates using the new service architecture with React Query
 */

import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import { useServiceQuery, useServiceMutation } from '@/hooks/use-service-query';
import { services } from '@/services/service-factory';
import { MetricType, type HealthMetric, type TimeRange } from '@/services/api/health-metrics-service';
import { ErrorType, ServiceError } from '@/services/core/base-service';

export function ModernHealthMetricsWidget() {
  // State for selected metric type and date range
  const [metricType, setMetricType] = useState<MetricType>(MetricType.STEPS);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Fetch health metrics data using our service query hook
  const { 
    data: metrics = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useServiceQuery(
    ['health-metrics', metricType, timeRange],
    () => services.healthMetrics.getMetricsByType(metricType, timeRange),
    [],
    {
      toastErrors: true,
      errorToasts: {
        [ErrorType.NETWORK]: {
          title: 'Connection Error',
          description: 'Unable to fetch your health data. Please check your connection.'
        }
      }
    }
  );
  
  // Query for metric summary stats
  const { 
    data: summary, 
    isLoading: isSummaryLoading 
  } = useServiceQuery(
    ['health-metrics-summary', metricType, timeRange],
    () => services.healthMetrics.getMetricSummary(metricType, timeRange),
    [],
    { 
      enabled: metrics.length > 0,
      toastErrors: false // Don't show toast errors for summary - less important
    }
  );
  
  // Mutation for syncing new data
  const { 
    mutate: syncData, 
    isPending: isSyncing 
  } = useServiceMutation(
    () => services.healthMetrics.importMetrics([
      // In a real app, this would come from a connected health device
      {
        userId: 1,
        type: metricType,
        value: Math.floor(Math.random() * 1000) + 5000, // Random steps between 5000-6000
        unit: 'steps',
        timestamp: new Date().toISOString()
      }
    ]),
    {
      onSuccess: () => {
        // Refetch metrics after successful import
        refetch();
      },
      toastSuccess: true,
      successToast: {
        title: 'Data Synced',
        description: 'Your health data has been successfully synchronized'
      }
    }
  );
  
  // Format data for chart
  const chartData = metrics.map(metric => ({
    date: format(new Date(metric.timestamp), 'MMM dd'),
    value: typeof metric.value === 'number' ? metric.value : 0
  }));
  
  // Get units and descriptions for different metric types
  const getMetricInfo = (type: MetricType) => {
    switch (type) {
      case MetricType.STEPS:
        return { unit: 'steps', label: 'Steps', color: '#4A90E2' };
      case MetricType.HEART_RATE:
        return { unit: 'bpm', label: 'Heart Rate', color: '#E53E3E' };
      case MetricType.SLEEP:
        return { unit: 'hours', label: 'Sleep', color: '#9F7AEA' };
      case MetricType.BLOOD_PRESSURE:
        return { unit: 'mmHg', label: 'Blood Pressure', color: '#F56565' };
      case MetricType.WEIGHT:
        return { unit: 'kg', label: 'Weight', color: '#38A169' };
      default:
        return { unit: '', label: 'Value', color: '#718096' };
    }
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
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Track your health and wellness data</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => syncData()}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Data
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <Tabs 
          defaultValue={MetricType.STEPS} 
          value={metricType}
          onValueChange={(value) => setMetricType(value as MetricType)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value={MetricType.STEPS}>Steps</TabsTrigger>
            <TabsTrigger value={MetricType.HEART_RATE}>Heart Rate</TabsTrigger>
            <TabsTrigger value={MetricType.SLEEP}>Sleep</TabsTrigger>
            <TabsTrigger value={MetricType.WEIGHT}>Weight</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-end space-x-2 text-sm">
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
          
          <TabsContent value={metricType} className="pt-4 px-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-medium">Failed to load data</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  {error instanceof ServiceError 
                    ? error.message 
                    : 'An unexpected error occurred while loading your health data.'}
                </p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            ) : metrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Data Available</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  No {metricInfo.label.toLowerCase()} data found for the selected period.
                </p>
                <Button onClick={() => syncData()}>Sync Data</Button>
              </div>
            ) : (
              <>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                </div>
                
                {summary && (
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-sm font-medium text-muted-foreground">Average</div>
                      <div className="text-2xl font-bold">{Math.round(summary.statistics.average)}</div>
                      <div className="text-xs text-muted-foreground">{metricInfo.unit}</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-sm font-medium text-muted-foreground">Maximum</div>
                      <div className="text-2xl font-bold">{summary.statistics.max}</div>
                      <div className="text-xs text-muted-foreground">{metricInfo.unit}</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-sm font-medium text-muted-foreground">Minimum</div>
                      <div className="text-2xl font-bold">{summary.statistics.min}</div>
                      <div className="text-xs text-muted-foreground">{metricInfo.unit}</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="text-sm font-medium text-muted-foreground">Trend</div>
                      <div className={`text-2xl font-bold ${summary.statistics.trend > 0 ? 'text-green-500' : summary.statistics.trend < 0 ? 'text-red-500' : ''}`}>
                        {summary.statistics.trend > 0 ? '+' : ''}{summary.statistics.trend}%
                      </div>
                      <div className="text-xs text-muted-foreground">vs. previous period</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-4">
        <div className="w-full text-xs text-muted-foreground">
          {!isLoading && metrics.length > 0 && (
            <div className="flex justify-between">
              <span>Date range: {format(new Date(timeRange.startDate), 'PP')} - {format(new Date(timeRange.endDate), 'PP')}</span>
              <span>{metrics.length} data points</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}