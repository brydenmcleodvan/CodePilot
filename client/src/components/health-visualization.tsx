
import { useState } from 'react';
import { useFetchWithFallback } from '@/hooks/use-fetch-with-fallback';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import HealthStatCard from './health-stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { transformHealthData } from '@/lib/transformHealthData';
import { useAuth } from '@/lib/auth';
import { hasFeature } from '@/lib/featureFlags';
import { downloadCSV } from '@/lib/utils';
import AdvancedTrendAnalysis from './advanced-trend-analysis';


// Create custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-bold text-xs mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}${entry.unit || ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Color schemes for charts
const COLORS = {
  heartRate: '#f87171',
  steps: '#60a5fa',
  sleep: '#818cf8',
  bloodPressure: '#a78bfa',
  weight: '#34d399',
  calories: '#fbbf24',
  stress: '#fb923c'
};

// Visualization Types
type VisualizationType = 'line' | 'area' | 'bar' | 'pie';

export default function HealthVisualization() {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('line');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('7days');
  const { user } = useAuth();
  const canAdvanced = hasFeature(user, 'advancedTrendAnalysis');
  const canExportCsv = hasFeature(user, 'exportCsv');
  
  // Fetch health data from API
  const {
    data: healthStats,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchWithFallback<any[]>('/api/health/stats', []);
  
  // Transform the data for visualization
  const chartData = transformHealthData(healthStats as any[]);
  
  // Calculate summary statistics for health metrics
  const calculateSummary = () => {
    if (!chartData.length) return {};
    
    return {
      avgHeartRate: Math.round(
        chartData.reduce((sum, d) => sum + (d.heartRate || 0), 0) / 
        chartData.filter(d => d.heartRate).length
      ),
      totalSteps: chartData.reduce((sum, d) => sum + (d.steps || 0), 0),
      avgSleep: parseFloat((
        chartData.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / 
        chartData.filter(d => d.sleepHours).length
      ).toFixed(1)),
      avgStressLevel: parseFloat((
        chartData.reduce((sum, d) => sum + (d.stressLevel || 0), 0) / 
        chartData.filter(d => d.stressLevel).length
      ).toFixed(1))
    };
  };
  
  const summary = calculateSummary();
  
  // For simplicity, we're preparing pie chart data based on the relative proportions
  // of different health metrics
  const preparePieData = () => {
    return [
      { name: 'Heart Rate', value: summary.avgHeartRate || 0, color: COLORS.heartRate },
      { name: 'Sleep', value: (summary.avgSleep || 0) * 10, color: COLORS.sleep },
      { name: 'Steps', value: ((summary.totalSteps || 0) / 1000), color: COLORS.steps },
      { name: 'Stress', value: (summary.avgStressLevel || 0) * 20, color: COLORS.stress }
    ];
  };
  
  const pieData = preparePieData();
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription className="text-red-500">
            {`Failed to load health data${error ? `: ${error.message}` : ''}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>No health data available yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-xl font-heading">Health Trends</CardTitle>
            <CardDescription>
              Visualize and track your health metrics over time
            </CardDescription>
          </div>
          
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Tabs defaultValue="7days" value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList className="grid grid-cols-3 w-[260px]">
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="90days">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Chart type selector */}
        <div className="flex justify-end mb-4 flex-wrap gap-2">
          <Button 
            variant={visualizationType === 'line' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setVisualizationType('line')}
            className="text-xs"
          >
            <i className="ri-line-chart-line mr-1"></i> Line
          </Button>
          <Button 
            variant={visualizationType === 'area' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setVisualizationType('area')}
            className="text-xs"
          >
            <i className="ri-area-chart-line mr-1"></i> Area
          </Button>
          <Button 
            variant={visualizationType === 'bar' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setVisualizationType('bar')}
            className="text-xs"
          >
            <i className="ri-bar-chart-horizontal-line mr-1"></i> Bar
          </Button>
          <Button
            variant={visualizationType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVisualizationType('pie')}
            className="text-xs"
          >
            <i className="ri-pie-chart-line mr-1"></i> Pie
          </Button>
          {canExportCsv ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(chartData, 'health-stats.csv')}
              className="text-xs"
            >
              <i className="ri-download-line mr-1"></i> Export CSV
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="text-xs opacity-60 cursor-not-allowed">
              Export CSV
            </Button>
          )}
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <HealthStatCard
            title="Avg. Heart Rate"
            value={summary.avgHeartRate ?? 'N/A'}
            unit="BPM"
            icon="ri-heart-pulse-line"
            className="bg-primary/5"
          />

          <HealthStatCard
            title="Total Steps"
            value={summary.totalSteps ? summary.totalSteps.toLocaleString() : 'N/A'}
            icon="ri-walk-line"
            className="bg-blue-50"
          />

          <HealthStatCard
            title="Avg. Sleep"
            value={summary.avgSleep ?? 'N/A'}
            unit="hrs"
            icon="ri-zzz-line"
            className="bg-indigo-50"
          />

          <HealthStatCard
            title="Avg. Stress"
            value={summary.avgStressLevel ?? 'N/A'}
            unit="/10"
            icon="ri-emotion-line"
            className="bg-orange-50"
          />
        </div>
        
        {/* Visualization Chart */}
        <div className="h-[350px]">
          {visualizationType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {chartData.some(d => d.heartRate) && (
                  <Line 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke={COLORS.heartRate} 
                    name="Heart Rate (BPM)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {chartData.some(d => d.sleepHours) && (
                  <Line 
                    type="monotone" 
                    dataKey="sleepHours" 
                    stroke={COLORS.sleep} 
                    name="Sleep (hours)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {chartData.some(d => d.steps) && (
                  <Line 
                    type="monotone" 
                    dataKey="steps" 
                    stroke={COLORS.steps} 
                    name="Steps" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    yAxisId={1}
                  />
                )}
                {chartData.some(d => d.stressLevel) && (
                  <Line 
                    type="monotone" 
                    dataKey="stressLevel" 
                    stroke={COLORS.stress} 
                    name="Stress Level" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : null}
            
          {visualizationType === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {chartData.some(d => d.heartRate) && (
                  <Area 
                    type="monotone" 
                    dataKey="heartRate" 
                    fill={`${COLORS.heartRate}40`} 
                    stroke={COLORS.heartRate} 
                    name="Heart Rate (BPM)" 
                    strokeWidth={2}
                  />
                )}
                {chartData.some(d => d.sleepHours) && (
                  <Area 
                    type="monotone" 
                    dataKey="sleepHours" 
                    fill={`${COLORS.sleep}40`} 
                    stroke={COLORS.sleep} 
                    name="Sleep (hours)" 
                    strokeWidth={2}
                  />
                )}
                {chartData.some(d => d.stressLevel) && (
                  <Area 
                    type="monotone" 
                    dataKey="stressLevel" 
                    fill={`${COLORS.stress}40`} 
                    stroke={COLORS.stress} 
                    name="Stress Level" 
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
            
          {visualizationType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {chartData.some(d => d.heartRate) && (
                  <Bar dataKey="heartRate" fill={COLORS.heartRate} name="Heart Rate (BPM)" />
                )}
                {chartData.some(d => d.sleepHours) && (
                  <Bar dataKey="sleepHours" fill={COLORS.sleep} name="Sleep (hours)" />
                )}
                {chartData.some(d => d.stressLevel) && (
                  <Bar dataKey="stressLevel" fill={COLORS.stress} name="Stress Level" />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : null}
            
          {visualizationType === 'pie' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        {canAdvanced && <AdvancedTrendAnalysis data={chartData} />}
      </CardContent>
    </Card>
  );
}
