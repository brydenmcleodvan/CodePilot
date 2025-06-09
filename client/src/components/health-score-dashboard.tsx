import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Heart,
  Brain,
  Activity,
  Moon,
  Zap,
  Target,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';
const Line = lazy(() => import('react-chartjs-2').then(m => ({ default: m.Line })));

function ChartFallback() {
  return (
    <div className="flex justify-center items-center h-48">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );
}

interface DailyHealthScore {
  date: string;
  overallScore: number;
  components: {
    cardiovascular: {
      score: number;
      weight: number;
      trend: 'improving' | 'stable' | 'declining';
      riskFactors: string[];
    };
    sleep: {
      score: number;
      weight: number;
      trend: 'improving' | 'stable' | 'declining';
      riskFactors: string[];
    };
    physical: {
      score: number;
      weight: number;
      trend: 'improving' | 'stable' | 'declining';
      riskFactors: string[];
    };
    mental: {
      score: number;
      weight: number;
      trend: 'improving' | 'stable' | 'declining';
      riskFactors: string[];
    };
    metabolic: {
      score: number;
      weight: number;
      trend: 'improving' | 'stable' | 'declining';
      riskFactors: string[];
    };
  };
  riskAlerts: {
    level: 'low' | 'moderate' | 'high' | 'critical';
    type: string;
    message: string;
    confidence: number;
    timeframe: string;
    recommendations: string[];
  }[];
  predictions: {
    sevenDayForecast: {
      date: string;
      predictedScore: number;
      confidence: number;
      factors: string[];
    }[];
    burnoutRisk: {
      probability: number;
      timeframe: string;
      triggers: string[];
      preventionSteps: string[];
    };
    sleepDeclineRisk: {
      probability: number;
      timeframe: string;
      causes: string[];
      interventions: string[];
    };
    healthTrends: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
  };
  actionablePriorities: {
    immediate: string[];
    thisWeek: string[];
    longTerm: string[];
  };
}

export default function HealthScoreDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch current health score
  const { data: healthScore, isLoading } = useQuery<DailyHealthScore>({
    queryKey: ['/api/health-score/current'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch score history for trending
  const { data: scoreHistory = [] } = useQuery<{date: string; score: number; components: any}[]>({
    queryKey: ['/api/health-score/history', selectedTimeframe],
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 70) return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    if (score >= 55) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'cardiovascular': return <Heart className="h-5 w-5" />;
      case 'sleep': return <Moon className="h-5 w-5" />;
      case 'physical': return <Activity className="h-5 w-5" />;
      case 'mental': return <Brain className="h-5 w-5" />;
      case 'metabolic': return <Zap className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Prepare chart data for score trends
  const chartData = {
    labels: scoreHistory.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Health Score',
        data: scoreHistory.map(item => item.score),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        pointBackgroundColor: '#4A90E2',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
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
        borderColor: '#4A90E2',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
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
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return `${value}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!healthScore) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Generating your health score based on recent data...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className={`border-2 ${getScoreBackground(healthScore.overallScore)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Daily Health Score
              </h2>
              <div className="flex items-center space-x-4">
                <div className={`text-5xl font-bold ${getScoreColor(healthScore.overallScore)}`}>
                  {healthScore.overallScore}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <div className="text-sm">out of 100</div>
                  <div className="text-xs">
                    Updated {new Date(healthScore.date).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {healthScore.overallScore >= 85 ? 'Excellent' :
                 healthScore.overallScore >= 70 ? 'Good' :
                 healthScore.overallScore >= 55 ? 'Fair' : 'Needs Attention'}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={healthScore.riskAlerts.length === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {healthScore.riskAlerts.length === 0 ? 'No Alerts' : `${healthScore.riskAlerts.length} Alert${healthScore.riskAlerts.length > 1 ? 's' : ''}`}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          {/* Component Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(healthScore.components).map(([componentName, component], index) => (
              <motion.div
                key={componentName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getScoreBackground(component.score)}`}>
                          {getComponentIcon(componentName)}
                        </div>
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {componentName.replace('_', ' ')}
                          </CardTitle>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Weight: {Math.round(component.weight * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(component.score)}`}>
                          {component.score}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(component.trend)}
                          <span className="text-sm capitalize">{component.trend}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <Progress value={component.score} className="h-2" />
                    
                    {component.riskFactors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Risk Factors:
                        </p>
                        <div className="space-y-1">
                          {component.riskFactors.map((factor, factorIndex) => (
                            <div key={factorIndex} className="flex items-start space-x-2 text-sm">
                              <AlertTriangle className="h-3 w-3 text-orange-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>7-Day Health Score Forecast</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {healthScore.predictions.sevenDayForecast.map((forecast, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(forecast.predictedScore)}`}>
                      {forecast.predictedScore}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(forecast.confidence * 100)}% confidence
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Risk Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Burnout Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-red-600" />
                  <span>Burnout Risk Prediction</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                  <Badge className={
                    healthScore.predictions.burnoutRisk.probability > 0.7 ? 'bg-red-100 text-red-800' :
                    healthScore.predictions.burnoutRisk.probability > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {Math.round(healthScore.predictions.burnoutRisk.probability * 100)}%
                  </Badge>
                </div>
                
                <Progress 
                  value={healthScore.predictions.burnoutRisk.probability * 100} 
                  className="h-2"
                />
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prevention Steps:
                  </p>
                  <ul className="text-sm space-y-1">
                    {healthScore.predictions.burnoutRisk.preventionSteps.slice(0, 3).map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-600 dark:text-gray-400">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Decline Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-purple-600" />
                  <span>Sleep Decline Risk</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                  <Badge className={
                    healthScore.predictions.sleepDeclineRisk.probability > 0.6 ? 'bg-red-100 text-red-800' :
                    healthScore.predictions.sleepDeclineRisk.probability > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {Math.round(healthScore.predictions.sleepDeclineRisk.probability * 100)}%
                  </Badge>
                </div>
                
                <Progress 
                  value={healthScore.predictions.sleepDeclineRisk.probability * 100} 
                  className="h-2"
                />
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interventions:
                  </p>
                  <ul className="text-sm space-y-1">
                    {healthScore.predictions.sleepDeclineRisk.interventions.slice(0, 3).map((intervention, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-600 dark:text-gray-400">{intervention}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Risk Alerts */}
          {healthScore.riskAlerts.length > 0 ? (
            <div className="space-y-4">
              {healthScore.riskAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-l-4 rounded-lg ${getRiskColor(alert.level)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-semibold capitalize">
                          {alert.type.replace('_', ' ')} Risk Alert
                        </h3>
                        <Badge variant="outline">
                          {Math.round(alert.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-3">
                        {alert.message}
                      </p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommendations:</p>
                        <ul className="text-sm space-y-1">
                          {alert.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start space-x-2">
                              <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <Badge className={getRiskColor(alert.level)}>
                        {alert.level}
                      </Badge>
                      <div className="text-xs mt-1">
                        Timeframe: {alert.timeframe}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Risk Alerts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your health metrics are all within healthy ranges. Keep up the great work!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actionable Priorities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Actionable Priorities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Immediate
                  </h4>
                  <ul className="text-sm space-y-1">
                    {healthScore.actionablePriorities.immediate.map((priority, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700 dark:text-gray-300">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    This Week
                  </h4>
                  <ul className="text-sm space-y-1">
                    {healthScore.actionablePriorities.thisWeek.map((priority, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700 dark:text-gray-300">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Long Term
                  </h4>
                  <ul className="text-sm space-y-1">
                    {healthScore.actionablePriorities.longTerm.map((priority, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700 dark:text-gray-300">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Score History Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Health Score Trends</CardTitle>
                <div className="flex space-x-2">
                  {(['7d', '30d', '90d'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedTimeframe === timeframe
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      }`}
                    >
                      {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : '90 Days'}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Suspense fallback={<ChartFallback />}>
                  <Line data={chartData} options={chartOptions} />
                </Suspense>
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <span>Improving</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthScore.predictions.healthTrends.improving.length > 0 ? (
                  <ul className="space-y-2">
                    {healthScore.predictions.healthTrends.improving.map((trend, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm capitalize">{trend.replace('_', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No improving trends detected
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-600">
                  <Minus className="h-5 w-5" />
                  <span>Stable</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthScore.predictions.healthTrends.stable.length > 0 ? (
                  <ul className="space-y-2">
                    {healthScore.predictions.healthTrends.stable.map((trend, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Minus className="h-4 w-4 text-gray-600" />
                        <span className="text-sm capitalize">{trend.replace('_', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No stable trends detected
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  <span>Declining</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthScore.predictions.healthTrends.declining.length > 0 ? (
                  <ul className="space-y-2">
                    {healthScore.predictions.healthTrends.declining.map((trend, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <ArrowDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm capitalize">{trend.replace('_', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No declining trends detected
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}