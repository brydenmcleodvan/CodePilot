import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
const Line = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));

function ChartFallback() {
  return (
    <div className="flex justify-center items-center h-48">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );
}
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Activity,
  Moon,
  Footprints,
  Thermometer,
  Droplets,
  Info,
  BarChart3,
  Zap,
  Calendar,
  HelpCircle,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricCardProps {
  metricType: 'heart_rate' | 'hrv' | 'sleep' | 'steps' | 'glucose' | 'blood_pressure' | 'temperature';
  currentValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  source: string;
  color: string;
}

interface MetricData {
  date: string;
  value: number;
  quality?: 'good' | 'fair' | 'poor';
}

interface ComparisonMetric {
  name: string;
  data: MetricData[];
  color: string;
  unit: string;
}

const metricConfig = {
  heart_rate: {
    name: 'Heart Rate',
    icon: Heart,
    color: '#EF4444',
    normalRange: '60-100 bpm',
    description: 'Your resting heart rate indicates cardiovascular fitness. Lower rates often indicate better fitness.',
    comparisons: ['hrv', 'sleep'],
  },
  hrv: {
    name: 'Heart Rate Variability',
    icon: Activity,
    color: '#8B5CF6',
    normalRange: '20-100 ms',
    description: 'HRV measures the variation in time between heartbeats, indicating recovery and stress levels.',
    comparisons: ['heart_rate', 'sleep'],
  },
  sleep: {
    name: 'Sleep Duration',
    icon: Moon,
    color: '#6366F1',
    normalRange: '7-9 hours',
    description: 'Quality sleep is essential for physical recovery, mental health, and cognitive performance.',
    comparisons: ['hrv', 'heart_rate'],
  },
  steps: {
    name: 'Daily Steps',
    icon: Footprints,
    color: '#10B981',
    normalRange: '8,000-10,000+ steps',
    description: 'Regular walking improves cardiovascular health, maintains weight, and boosts mental well-being.',
    comparisons: ['heart_rate', 'sleep'],
  },
  glucose: {
    name: 'Blood Glucose',
    icon: Droplets,
    color: '#F59E0B',
    normalRange: '70-140 mg/dL',
    description: 'Blood glucose levels indicate how well your body processes sugar and can affect energy levels.',
    comparisons: ['sleep', 'steps'],
  },
  blood_pressure: {
    name: 'Blood Pressure',
    icon: Gauge,
    color: '#DC2626',
    normalRange: '90/60 - 140/90 mmHg',
    description: 'Blood pressure measures the force of blood against artery walls, indicating cardiovascular health.',
    comparisons: ['heart_rate', 'steps'],
  },
  temperature: {
    name: 'Body Temperature',
    icon: Thermometer,
    color: '#F97316',
    normalRange: '97.8-99.1°F',
    description: 'Body temperature can indicate recovery status, illness, or changes in metabolic rate.',
    comparisons: ['sleep', 'hrv'],
  },
};

export default function ExpandableMetricCard({
  metricType,
  currentValue,
  unit,
  trend,
  trendValue,
  source,
  color,
}: MetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [comparisonMetric, setComparisonMetric] = useState<string | null>(null);

  const config = metricConfig[metricType];
  const Icon = config.icon;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  // Fetch detailed metric data when expanded
  const { data: metricData = [], isLoading } = useQuery<MetricData[]>({
    queryKey: ['/api/metrics/detailed', metricType, selectedTimeframe],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/metrics/detailed?type=${metricType}&timeframe=${selectedTimeframe}`);
      return response.json();
    },
    enabled: isExpanded,
  });

  // Fetch comparison data when comparison is selected
  const { data: comparisonData = [] } = useQuery<MetricData[]>({
    queryKey: ['/api/metrics/detailed', comparisonMetric, selectedTimeframe],
    queryFn: async () => {
      if (!comparisonMetric) return [];
      const response = await apiRequest('GET', `/api/metrics/detailed?type=${comparisonMetric}&timeframe=${selectedTimeframe}`);
      return response.json();
    },
    enabled: isExpanded && !!comparisonMetric,
  });

  const formatDate = (dateStr: string, timeframe: string) => {
    const date = new Date(dateStr);
    if (timeframe === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const chartData = {
    labels: metricData.map(item => formatDate(item.date, selectedTimeframe)),
    datasets: [
      {
        label: config.name,
        data: metricData.map(item => item.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        pointBackgroundColor: metricData.map(item => {
          if (!item.quality) return color;
          switch (item.quality) {
            case 'good': return '#10B981';
            case 'fair': return '#F59E0B';
            case 'poor': return '#EF4444';
            default: return color;
          }
        }),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: false,
      },
      ...(comparisonMetric && comparisonData.length > 0 ? [{
        label: metricConfig[comparisonMetric as keyof typeof metricConfig].name,
        data: comparisonData.map(item => item.value),
        borderColor: metricConfig[comparisonMetric as keyof typeof metricConfig].color,
        backgroundColor: `${metricConfig[comparisonMetric as keyof typeof metricConfig].color}20`,
        pointBackgroundColor: metricConfig[comparisonMetric as keyof typeof metricConfig].color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
        yAxisID: 'y1',
      }] : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!comparisonMetric,
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: TooltipItem<'line'>[]) => {
            const index = context[0].dataIndex;
            return new Date(metricData[index].date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          },
          label: (context: TooltipItem<'line'>) => {
            const index = context.dataIndex;
            const quality = metricData[index]?.quality;
            let qualityText = '';
            if (quality) {
              qualityText = ` (${quality.charAt(0).toUpperCase() + quality.slice(1)})`;
            }
            return `${context.dataset.label}: ${context.parsed.y} ${unit}${qualityText}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#666666', font: { size: 12 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          color: '#666666',
          font: { size: 12 },
          callback: function(value: any) {
            return `${value} ${unit}`;
          },
        },
      },
      ...(comparisonMetric ? {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#666666',
            font: { size: 12 },
            callback: function(value: any) {
              return `${value} ${metricConfig[comparisonMetric as keyof typeof metricConfig].unit || ''}`;
            },
          },
        },
      } : {}),
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <>
      {/* Compact Card View */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: color }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {config.name}
            </CardTitle>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold" style={{ color }}>
                  {currentValue} {unit}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-3 w-3 ${
                      trend === 'up' ? 'text-green-500' : 
                      trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`} />
                    <span className={`text-xs ${
                      trend === 'up' ? 'text-green-500' : 
                      trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {trendValue}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {source}
                  </Badge>
                </div>
              </div>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expanded Graph Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{config.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-3xl font-bold" style={{ color }}>
                    {currentValue} {unit}
                  </span>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-4 w-4 ${
                      trend === 'up' ? 'text-green-500' : 
                      trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      trend === 'up' ? 'text-green-500' : 
                      trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {trendValue}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {source}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
                <TabsList>
                  <TabsTrigger value="7d">7 Days</TabsTrigger>
                  <TabsTrigger value="30d">30 Days</TabsTrigger>
                  <TabsTrigger value="90d">90 Days</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Compare to:</span>
                <div className="flex space-x-1">
                  {config.comparisons.map((comparison) => (
                    <Button
                      key={comparison}
                      variant={comparisonMetric === comparison ? "default" : "outline"}
                      size="sm"
                      onClick={() => setComparisonMetric(comparisonMetric === comparison ? null : comparison)}
                    >
                      {metricConfig[comparison as keyof typeof metricConfig].name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Suspense fallback={<ChartFallback />}>
                  <Line data={chartData} options={chartOptions} />
                </Suspense>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
                <div className="text-lg font-semibold">
                  {metricData.length > 0 ? 
                    (metricData.reduce((sum, item) => sum + item.value, 0) / metricData.length).toFixed(1) : 
                    '—'
                  } {unit}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Highest</div>
                <div className="text-lg font-semibold">
                  {metricData.length > 0 ? 
                    Math.max(...metricData.map(item => item.value)).toFixed(1) : 
                    '—'
                  } {unit}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Lowest</div>
                <div className="text-lg font-semibold">
                  {metricData.length > 0 ? 
                    Math.min(...metricData.map(item => item.value)).toFixed(1) : 
                    '—'
                  } {unit}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Data Points</div>
                <div className="text-lg font-semibold">{metricData.length}</div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Understanding This Metric</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">{config.description}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Normal Range:</strong> {config.normalRange}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}