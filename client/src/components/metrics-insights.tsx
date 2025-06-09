import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  Heart,
  Activity,
  Moon,
  Zap,
  Target,
  Brain,
} from 'lucide-react';

interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  timeframe: string;
  status: 'improving' | 'declining' | 'stable' | 'concerning';
  description: string;
}

interface AnomalyDetection {
  metric: string;
  type: 'spike' | 'drop' | 'pattern' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  suggestions: string[];
}

interface PersonalizedInsight {
  category: 'sleep' | 'activity' | 'heart_health' | 'metabolic' | 'stress' | 'recovery';
  priority: 'low' | 'medium' | 'high';
  insight: string;
  actionable_advice: string[];
  confidence: number;
}

interface MetricsAnalysis {
  trends: TrendAnalysis[];
  anomalies: AnomalyDetection[];
  insights: PersonalizedInsight[];
  healthScore: {
    overall: number;
    categories: {
      cardiovascular: number;
      sleep: number;
      activity: number;
      metabolic: number;
    };
  };
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const categoryIcons = {
  sleep: Moon,
  activity: Activity,
  heart_health: Heart,
  metabolic: Zap,
  stress: Brain,
  recovery: Target,
};

const statusColors = {
  improving: 'text-green-600 bg-green-50 border-green-200',
  stable: 'text-blue-600 bg-blue-50 border-blue-200',
  declining: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  concerning: 'text-red-600 bg-red-50 border-red-200',
};

const severityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
};

export default function MetricsInsights() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: analysis, isLoading, error } = useQuery<MetricsAnalysis>({
    queryKey: ['/api/metrics/analysis', timeframe],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/metrics/analysis?timeframe=${timeframe}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-600">Unable to load health insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>Health Analytics</span>
            </CardTitle>
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
              <TabsList>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.healthScore.overall)}`}>
                {analysis.healthScore.overall}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(analysis.healthScore.categories.cardiovascular)}`}>
                {analysis.healthScore.categories.cardiovascular}
              </div>
              <div className="text-xs text-gray-600">Cardiovascular</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(analysis.healthScore.categories.sleep)}`}>
                {analysis.healthScore.categories.sleep}
              </div>
              <div className="text-xs text-gray-600">Sleep</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(analysis.healthScore.categories.activity)}`}>
                {analysis.healthScore.categories.activity}
              </div>
              <div className="text-xs text-gray-600">Activity</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(analysis.healthScore.categories.metabolic)}`}>
                {analysis.healthScore.categories.metabolic}
              </div>
              <div className="text-xs text-gray-600">Metabolic</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="anomalies">Alerts</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {analysis.insights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No insights available yet</p>
              </CardContent>
            </Card>
          ) : (
            analysis.insights.map((insight, index) => {
              const Icon = categoryIcons[insight.category];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{insight.category.replace('_', ' ')}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={priorityColors[insight.priority]}>
                                {insight.priority}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{insight.insight}</p>
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium text-gray-900">Recommendations:</h5>
                            {insight.actionable_advice.map((advice, adviceIndex) => (
                              <div key={adviceIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{advice}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {analysis.trends.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No trend data available</p>
              </CardContent>
            </Card>
          ) : (
            analysis.trends.map((trend, index) => {
              const TrendIcon = trendIcons[trend.trend];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`${statusColors[trend.status]} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <TrendIcon className="h-5 w-5" />
                          <div>
                            <h4 className="font-medium capitalize">{trend.metric.replace('_', ' ')}</h4>
                            <p className="text-sm">{trend.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'} {trend.percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm capitalize">{trend.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          {analysis.anomalies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-600">No alerts - everything looks normal!</p>
              </CardContent>
            </Card>
          ) : (
            analysis.anomalies.map((anomaly, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{anomaly.metric.replace('_', ' ')}</h4>
                          <Badge className={severityColors[anomaly.severity]}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{anomaly.description}</p>
                        <div className="text-xs text-gray-500 mb-2">
                          Detected: {new Date(anomaly.detectedAt).toLocaleDateString()}
                        </div>
                        {anomaly.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium text-gray-900">Suggestions:</h5>
                            {anomaly.suggestions.map((suggestion, suggestionIndex) => (
                              <div key={suggestionIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                <span className="block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}