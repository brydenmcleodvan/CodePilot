import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import InsightCard, { 
  SleepInsightCard, 
  ActivityInsightCard, 
  HeartHealthInsightCard 
} from './insight-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  RefreshCw,
  Settings,
  TrendingUp,
} from 'lucide-react';

interface MetricsAnalysis {
  trends: Array<{
    metric: string;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
    timeframe: string;
    status: 'improving' | 'declining' | 'stable' | 'concerning';
    description: string;
  }>;
  anomalies: Array<{
    metric: string;
    type: 'spike' | 'drop' | 'pattern' | 'outlier';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: string;
    suggestions: string[];
  }>;
  insights: Array<{
    category: 'sleep' | 'activity' | 'heart_health' | 'metabolic' | 'stress' | 'recovery';
    priority: 'low' | 'medium' | 'high';
    insight: string;
    actionable_advice: string[];
    confidence: number;
  }>;
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

interface DashboardInsightsProps {
  showAll?: boolean;
  maxInsights?: number;
}

export default function DashboardInsights({ 
  showAll = false, 
  maxInsights = 3 
}: DashboardInsightsProps) {
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const { data: analysis, isLoading, refetch } = useQuery<MetricsAnalysis>({
    queryKey: ['/api/metrics/analysis'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/metrics/analysis?timeframe=30d');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const handleAction = (category: string) => {
    // Handle insight actions based on category
    switch (category) {
      case 'sleep':
        // Navigate to sleep tracking or tips
        console.log('Navigate to sleep improvement');
        break;
      case 'activity':
        // Navigate to activity goals or challenges
        console.log('Navigate to activity goals');
        break;
      case 'heart_health':
        // Navigate to stress management or heart health
        console.log('Navigate to heart health');
        break;
      default:
        console.log('Navigate to general health tips');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Health Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Health Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">Unable to load health insights</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Generate insight cards from analysis data
  const generateInsightCards = () => {
    const cards: JSX.Element[] = [];

    // Process high-priority insights first
    const highPriorityInsights = analysis.insights
      .filter(insight => insight.priority === 'high')
      .slice(0, showAll ? undefined : 2);

    highPriorityInsights.forEach((insight, index) => {
      const insightId = `insight-${insight.category}-${index}`;
      if (dismissedInsights.has(insightId)) return;

      cards.push(
        <InsightCard
          key={insightId}
          id={insightId}
          title={`${insight.category.replace('_', ' ').toUpperCase()} Alert`}
          message={insight.insight}
          suggestion={insight.actionable_advice[0] || 'Monitor this metric closely'}
          type="alert"
          category={insight.category}
          confidence={insight.confidence}
          onDismiss={() => handleDismissInsight(insightId)}
          onAction={() => handleAction(insight.category)}
          actionText="Learn More"
        />
      );
    });

    // Process anomalies as warning cards
    const criticalAnomalies = analysis.anomalies
      .filter(anomaly => anomaly.severity === 'high' || anomaly.severity === 'critical')
      .slice(0, showAll ? undefined : 1);

    criticalAnomalies.forEach((anomaly, index) => {
      const anomalyId = `anomaly-${anomaly.metric}-${index}`;
      if (dismissedInsights.has(anomalyId)) return;

      cards.push(
        <InsightCard
          key={anomalyId}
          id={anomalyId}
          title={`${anomaly.metric.replace('_', ' ').toUpperCase()} Alert`}
          message={anomaly.description}
          suggestion={anomaly.suggestions[0] || 'Consider consulting with your healthcare provider'}
          type={anomaly.severity === 'critical' ? 'alert' : 'warning'}
          onDismiss={() => handleDismissInsight(anomalyId)}
          onAction={() => handleAction(anomaly.metric)}
          actionText="Take Action"
        />
      );
    });

    // Process trends as info/success cards
    const significantTrends = analysis.trends
      .filter(trend => trend.status === 'improving' || trend.status === 'concerning')
      .slice(0, showAll ? undefined : maxInsights - cards.length);

    significantTrends.forEach((trend, index) => {
      const trendId = `trend-${trend.metric}-${index}`;
      if (dismissedInsights.has(trendId)) return;

      // Create specialized cards for specific metrics
      if (trend.metric === 'sleep') {
        const avgSleep = 7.2; // This would come from actual data
        const weeklyChange = trend.trend === 'down' ? -trend.percentage/10 : trend.percentage/10;
        
        cards.push(
          <SleepInsightCard
            key={trendId}
            avgSleep={avgSleep}
            weeklyChange={weeklyChange}
            onAction={() => handleAction('sleep')}
          />
        );
      } else if (trend.metric === 'steps') {
        const avgSteps = 8543; // This would come from actual data
        const weeklyChange = trend.trend === 'up' ? trend.percentage * 50 : -trend.percentage * 50;
        
        cards.push(
          <ActivityInsightCard
            key={trendId}
            avgSteps={avgSteps}
            weeklyChange={weeklyChange}
            onAction={() => handleAction('activity')}
          />
        );
      } else if (trend.metric === 'hrv') {
        const avgHRV = 45; // This would come from actual data
        const weeklyChange = trend.trend === 'down' ? -trend.percentage : trend.percentage;
        
        cards.push(
          <HeartHealthInsightCard
            key={trendId}
            avgHRV={avgHRV}
            weeklyChange={weeklyChange}
            onAction={() => handleAction('heart_health')}
          />
        );
      } else {
        // Generic trend card
        cards.push(
          <InsightCard
            key={trendId}
            id={trendId}
            title={`${trend.metric.replace('_', ' ')} Trend`}
            message={trend.description}
            suggestion="Keep monitoring this trend and maintain healthy habits"
            type={trend.status === 'improving' ? 'success' : 'info'}
            trend={trend.trend}
            value={`${trend.percentage.toFixed(1)}% change`}
            onDismiss={() => handleDismissInsight(trendId)}
            onAction={() => handleAction(trend.metric)}
          />
        );
      }
    });

    return cards.slice(0, showAll ? undefined : maxInsights);
  };

  const insightCards = generateInsightCards();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Health Insights</h3>
          <Badge variant="outline" className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            Score: {analysis.healthScore.overall}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {insightCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Everything looks great!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your health metrics are stable and within normal ranges.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {insightCards.map((card, index) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {card}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {!showAll && insightCards.length === maxInsights && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            View All Insights
          </Button>
        </div>
      )}
    </div>
  );
}