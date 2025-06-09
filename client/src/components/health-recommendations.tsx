import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Target, 
  AlertTriangle, 
  Heart, 
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface HealthRecommendation {
  type: 'habit_tip' | 'pattern_insight' | 'motivational' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  insight: string;
  tip: string;
  actionItems: string[];
  category: string;
  confidenceLevel: number;
  personalizedFor: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  goalId?: number;
  goalType?: string;
}

interface RecommendationsData {
  recommendations: HealthRecommendation[];
  summary: {
    totalRecommendations: number;
    highPriority: number;
    categories: string[];
    averageConfidence: number;
  };
  generatedAt: string;
  goalsAnalyzed: number;
}

export default function HealthRecommendations() {
  const { data: recommendationsData, isLoading } = useQuery<RecommendationsData>({
    queryKey: ['/api/health-recommendations']
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendationsData || recommendationsData.recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your health goals to receive personalized coaching tips!
          </p>
        </CardContent>
      </Card>
    );
  }

  const { recommendations, summary } = recommendationsData;

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'habit_tip': return <Target className="h-5 w-5 text-blue-600" />;
      case 'pattern_insight': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'motivational': return <Sparkles className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Your Health Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalRecommendations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.highPriority}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.averageConfidence}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{recommendationsData.goalsAnalyzed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Goals Analyzed</div>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {summary.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="capitalize">
                  {category.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {rec.title}
                      </h3>
                      {rec.goalType && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {rec.goalType} Goal
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {rec.confidenceLevel}% confidence
                      </div>
                      <div className={`text-xs font-medium ${getImpactColor(rec.estimatedImpact)}`}>
                        {rec.estimatedImpact} impact
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Insight */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                    💡 {rec.insight}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    {rec.tip}
                  </p>
                </div>

                {/* Action Items */}
                {rec.actionItems.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Action Steps
                    </h4>
                    <ul className="space-y-2">
                      {rec.actionItems.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {rec.personalizedFor.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {rec.category.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Motivational Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border"
      >
        <div className="flex items-center space-x-3">
          <Heart className="h-6 w-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Your Health Journey Matters! 💪
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              These personalized recommendations are based on your unique patterns and goals. 
              Small consistent improvements lead to remarkable long-term results!
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {new Date(recommendationsData.generatedAt).toLocaleString()}
        </div>
      </motion.div>
    </div>
  );
}