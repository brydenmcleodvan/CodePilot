import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Calendar,
  Activity,
  Heart,
  Moon,
  Footprints,
  Thermometer,
  Droplets,
  GitCompare,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

export interface MetricData {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  source: string;
  icon: 'heart' | 'activity' | 'moon' | 'footprints' | 'thermometer' | 'droplets';
  color: string;
  data7d: Array<{ date: string; value: number; quality?: 'good' | 'fair' | 'poor' }>;
  data30d: Array<{ date: string; value: number; quality?: 'good' | 'fair' | 'poor' }>;
  data90d: Array<{ date: string; value: number; quality?: 'good' | 'fair' | 'poor' }>;
  insights: {
    meaning: string;
    recommendations: string[];
    normalRange: string;
    currentStatus: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricData | null;
  availableMetrics?: MetricData[];
}

const iconMap = {
  heart: Heart,
  activity: Activity,
  moon: Moon,
  footprints: Footprints,
  thermometer: Thermometer,
  droplets: Droplets,
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'good':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'poor':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

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

export default function MetricDetailModal({ isOpen, onClose, metric, availableMetrics = [] }: MetricDetailModalProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [compareWith, setCompareWith] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);

  if (!metric) return null;

  const Icon = iconMap[metric.icon];
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  const getData = () => {
    switch (selectedTimeframe) {
      case '7d':
        return metric.data7d;
      case '30d':
        return metric.data30d;
      case '90d':
        return metric.data90d;
      default:
        return metric.data7d;
    }
  };

  const data = getData();
  const compareMetric = compareWith ? availableMetrics.find(m => m.id === compareWith) : null;
  const compareData = compareMetric ? 
    (selectedTimeframe === '7d' ? compareMetric.data7d : 
     selectedTimeframe === '30d' ? compareMetric.data30d : 
     compareMetric.data90d) : null;

  const datasets = [
    {
      label: metric.name,
      data: data.map(item => item.value),
      borderColor: metric.color,
      backgroundColor: `${metric.color}20`,
      pointBackgroundColor: data.map(item => {
        if (!item.quality) return metric.color;
        switch (item.quality) {
          case 'good':
            return '#10B981';
          case 'fair':
            return '#F59E0B';
          case 'poor':
            return '#EF4444';
          default:
            return metric.color;
        }
      }),
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: false,
    },
  ];

  if (compareData && compareMetric) {
    datasets.push({
      label: compareMetric.name,
      data: compareData.map(item => item.value),
      borderColor: compareMetric.color,
      backgroundColor: `${compareMetric.color}20`,
      pointBackgroundColor: compareMetric.color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: false,
      borderDash: [5, 5],
    });
  }

  const chartData = {
    labels: data.map(item => formatDate(item.date, selectedTimeframe)),
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: metric.color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: TooltipItem<'line'>[]) => {
            const index = context[0].dataIndex;
            return new Date(data[index].date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          },
          label: (context: TooltipItem<'line'>) => {
            const index = context.dataIndex;
            const quality = data[index].quality;
            let qualityText = '';
            if (quality) {
              qualityText = ` (${quality.charAt(0).toUpperCase() + quality.slice(1)})`;
            }
            return `${metric.name}: ${context.parsed.y} ${metric.unit}${qualityText}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return `${value} ${metric.unit}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverBackgroundColor: metric.color,
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
              <Icon className="h-6 w-6" style={{ color: metric.color }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{metric.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-3xl font-bold" style={{ color: metric.color }}>
                  {metric.value} {metric.unit}
                </span>
                <div className="flex items-center space-x-1">
                  <TrendIcon 
                    className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`} 
                  />
                  <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                    {metric.trendValue}
                  </span>
                </div>
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
                  {metric.source}
                </Badge>
                <Badge className={getStatusColor(metric.insights.currentStatus)}>
                  {metric.insights.currentStatus.charAt(0).toUpperCase() + metric.insights.currentStatus.slice(1)}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Trend Analysis</h3>
              <div className="flex items-center space-x-3">
                {availableMetrics.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <GitCompare className="h-4 w-4 text-gray-600" />
                    <Select value={compareWith || ""} onValueChange={setCompareWith}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Compare with..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availableMetrics
                          .filter(m => m.id !== metric.id)
                          .map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as '7d' | '30d' | '90d')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="7d">7 Days</TabsTrigger>
                    <TabsTrigger value="30d">30 Days</TabsTrigger>
                    <TabsTrigger value="90d">90 Days</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
                <div className="text-lg font-semibold">
                  {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)} {metric.unit}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Highest</div>
                <div className="text-lg font-semibold">
                  {Math.max(...data.map(item => item.value)).toFixed(1)} {metric.unit}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Lowest</div>
                <div className="text-lg font-semibold">
                  {Math.min(...data.map(item => item.value)).toFixed(1)} {metric.unit}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Data Points</div>
                <div className="text-lg font-semibold">{data.length}</div>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expert health insights based on your data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What This Means</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{metric.insights.meaning}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Normal Range</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.insights.normalRange}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {metric.insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-green-800 dark:text-green-200">
                    <span className="block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Data Source</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Synced from {metric.source}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Last updated: {new Date(data[data.length - 1]?.date || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}