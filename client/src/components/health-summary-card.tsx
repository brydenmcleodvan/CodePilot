import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Target,
  BarChart3,
  Clock,
  Mail,
  Bell,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Heart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthChange {
  metric: string;
  change: number;
  unit: string;
  direction: 'up' | 'down' | 'stable';
  significance: 'major' | 'moderate' | 'minor';
  description: string;
}

interface HealthAlert {
  type: 'warning' | 'concern' | 'celebration';
  metric: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
}

interface HealthWin {
  type: 'streak' | 'improvement' | 'goal_achieved' | 'milestone';
  title: string;
  description: string;
  impact: string;
}

interface HealthSummary {
  period: 'daily' | 'weekly';
  dateRange: {
    start: string;
    end: string;
  };
  overallScore: number;
  topChanges: HealthChange[];
  alerts: HealthAlert[];
  wins: HealthWin[];
  goalProgress: {
    achieved: number;
    total: number;
    percentage: number;
  };
  keyInsight: string;
  motivationalMessage: string;
  trendAnalysis: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
}

interface HealthSummaryCardProps {
  period?: 'daily' | 'weekly';
  variant?: 'default' | 'compact' | 'detailed';
  showDeliveryOptions?: boolean;
}

export default function HealthSummaryCard({ 
  period = 'weekly', 
  variant = 'default',
  showDeliveryOptions = false 
}: HealthSummaryCardProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);

  // Fetch health summary
  const { data: summary, isLoading, refetch } = useQuery<HealthSummary>({
    queryKey: [`/api/health-summary/${period}`],
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'concern': return AlertCircle;
      case 'celebration': return Trophy;
      default: return AlertCircle;
    }
  };

  const getWinIcon = (type: string) => {
    switch (type) {
      case 'streak': return Target;
      case 'improvement': return TrendingUp;
      case 'goal_achieved': return CheckCircle2;
      case 'milestone': return Trophy;
      default: return Trophy;
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (period === 'daily') {
      return startDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    } else {
      return `${startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }
  };

  const handleDeliveryToggle = (method: string) => {
    setSelectedDelivery(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No health data available for summary. Start tracking your health metrics!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {period} Summary
                </span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(summary.overallScore)}`}>
                {summary.overallScore}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {summary.keyInsight}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDateRange(summary.dateRange.start, summary.dateRange.end)}</span>
              <span>{summary.goalProgress.achieved}/{summary.goalProgress.total} goals</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="capitalize">{period} Health Summary</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {formatDateRange(summary.dateRange.start, summary.dateRange.end)}
              </p>
            </div>
            
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-black ${getScoreColor(summary.overallScore)} mb-1`}>
                {summary.overallScore}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Health Score
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className={`p-4 rounded-lg bg-gradient-to-r ${getScoreGradient(summary.overallScore)} text-white mb-4`}>
            <p className="font-medium">{summary.keyInsight}</p>
          </div>

          {/* Goal Progress */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Goal Progress
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {summary.goalProgress.achieved}/{summary.goalProgress.total}
                </span>
              </div>
              <Progress value={summary.goalProgress.percentage} className="h-2" />
            </div>
            <div className="ml-4 text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {summary.goalProgress.percentage}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="changes">Changes</TabsTrigger>
          <TabsTrigger value="wins">Wins</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          {summary.topChanges.length > 0 ? (
            summary.topChanges.map((change, index) => {
              const ChangeIcon = getChangeIcon(change.direction);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          change.direction === 'up' ? 'bg-green-100 dark:bg-green-900/30' :
                          change.direction === 'down' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-gray-100 dark:bg-gray-900/30'
                        }`}>
                          <ChangeIcon className={`h-4 w-4 ${
                            change.direction === 'up' ? 'text-green-600' :
                            change.direction === 'down' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {change.metric}
                            </span>
                            <Badge variant={change.significance === 'major' ? 'destructive' : 'secondary'}>
                              {change.significance}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {change.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            change.direction === 'up' ? 'text-green-600' :
                            change.direction === 'down' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : ''}
                            {Math.abs(change.change).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">{change.unit}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No significant changes detected</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wins" className="space-y-4">
          {summary.wins.length > 0 ? (
            summary.wins.map((win, index) => {
              const WinIcon = getWinIcon(win.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <WinIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {win.title}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {win.description}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-400">
                            💪 {win.impact}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Keep working towards your wins!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {summary.alerts.length > 0 ? (
            summary.alerts.map((alert, index) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${
                    alert.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                    alert.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            alert.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                            alert.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            <AlertIcon className={`h-4 w-4 ${
                              alert.priority === 'high' ? 'text-red-600' :
                              alert.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {alert.message}
                            </p>
                            {alert.suggestedAction && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                💡 {alert.suggestedAction}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                          {alert.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">All good! No alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-400">Improving</span>
                </div>
                {summary.trendAnalysis.improving.length > 0 ? (
                  <ul className="space-y-1">
                    {summary.trendAnalysis.improving.map((metric, index) => (
                      <li key={index} className="text-sm text-green-700 dark:text-green-300 capitalize">
                        • {metric}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600 dark:text-green-400">None detected</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-400">Declining</span>
                </div>
                {summary.trendAnalysis.declining.length > 0 ? (
                  <ul className="space-y-1">
                    {summary.trendAnalysis.declining.map((metric, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300 capitalize">
                        • {metric}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400">None detected</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-800 dark:text-gray-400">Stable</span>
                </div>
                {summary.trendAnalysis.stable.length > 0 ? (
                  <ul className="space-y-1">
                    {summary.trendAnalysis.stable.map((metric, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        • {metric}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">None detected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-purple-800 dark:text-purple-300 font-medium">
              {summary.motivationalMessage}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Options */}
      {showDeliveryOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Get Your Summary Delivered</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Never miss your health insights! Choose how you'd like to receive your {period} summaries.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant={selectedDelivery.includes('email') ? 'default' : 'outline'}
                  onClick={() => handleDeliveryToggle('email')}
                  className="flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Button>
                
                <Button
                  variant={selectedDelivery.includes('push') ? 'default' : 'outline'}
                  onClick={() => handleDeliveryToggle('push')}
                  className="flex items-center space-x-2"
                >
                  <Bell className="h-4 w-4" />
                  <span>Push Notifications</span>
                </Button>
                
                <Button
                  variant={selectedDelivery.includes('ai') ? 'default' : 'outline'}
                  onClick={() => handleDeliveryToggle('ai')}
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Chat Recap</span>
                </Button>
              </div>
              
              {selectedDelivery.length > 0 && (
                <div className="pt-2">
                  <Button className="w-full">
                    Save Delivery Preferences
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}