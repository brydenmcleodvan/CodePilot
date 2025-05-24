import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Target, 
  MessageCircle, 
  Loader2, 
  Heart, 
  Moon, 
  Activity, 
  Droplets,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface GoalRecommendation {
  metricType: string;
  goalType: 'minimum' | 'maximum' | 'target' | 'range';
  recommendedValue: number | { min: number; max: number };
  unit: string;
  timeframe: string;
  reasoning: string;
  scientificBasis: string;
  adjustmentFactors: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  personalizedTips: string[];
}

interface AIRecommendationResponse {
  recommendations: GoalRecommendation[];
  aiResponse: string;
  userProfile: {
    metricsAnalyzed: number;
    timeframeDays: number;
  };
}

const QUICK_QUESTIONS = [
  "What should my sleep goal be?",
  "Suggest a heart rate range for my age",
  "How many steps should I aim for daily?",
  "What's a healthy water intake goal?",
  "How much exercise should I get weekly?"
];

const getMetricIcon = (metricType: string) => {
  switch (metricType) {
    case 'sleep_duration': return Moon;
    case 'heart_rate_resting': return Heart;
    case 'steps': return Activity;
    case 'water_intake': return Droplets;
    case 'exercise_minutes': return TrendingUp;
    default: return Target;
  }
};

const getConfidenceColor = (level: string) => {
  switch (level) {
    case 'high': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function GoalAIRecommendations() {
  const [question, setQuestion] = useState("");
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const [aiResponse, setAiResponse] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get AI recommendations
  const getRecommendationsMutation = useMutation({
    mutationFn: async (data: { question?: string; requestedMetrics?: string[] }) => {
      const response = await apiRequest('POST', '/api/health-goals/recommend', data);
      return response.json() as Promise<AIRecommendationResponse>;
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      setAiResponse(data.aiResponse);
      setShowRecommendations(true);
      toast({
        title: "AI Recommendations Ready",
        description: `Found ${data.recommendations.length} personalized goal suggestions`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Recommendation Error",
        description: error.message || "Failed to get AI recommendations",
        variant: "destructive",
      });
    }
  });

  // Create goal from recommendation
  const createGoalMutation = useMutation({
    mutationFn: async (recommendation: GoalRecommendation) => {
      const response = await apiRequest('POST', '/api/health-goals/create-from-recommendation', {
        metricType: recommendation.metricType,
        goalType: recommendation.goalType,
        recommendedValue: recommendation.recommendedValue,
        unit: recommendation.unit,
        timeframe: recommendation.timeframe,
        reasoning: recommendation.reasoning
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-goals'] });
      toast({
        title: "Goal Created Successfully",
        description: "Your AI-recommended goal has been added to your dashboard",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    }
  });

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
    getRecommendationsMutation.mutate({ question: quickQuestion });
  };

  const handleCustomQuestion = () => {
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your health goal question",
        variant: "destructive",
      });
      return;
    }
    getRecommendationsMutation.mutate({ question });
  };

  const handleGetGeneralRecommendations = () => {
    getRecommendationsMutation.mutate({});
  };

  const formatRecommendedValue = (value: number | { min: number; max: number }, unit: string) => {
    if (typeof value === 'number') {
      return `${value} ${unit}`;
    } else {
      return `${value.min}-${value.max} ${unit}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Question Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Goal Recommendations</span>
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get personalized health goal suggestions based on your data and scientific guidelines
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Questions */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Questions:</h4>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((quickQ, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(quickQ)}
                  disabled={getRecommendationsMutation.isPending}
                  className="text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {quickQ}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Question */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Ask Your Own Question:</h4>
            <div className="flex space-x-2">
              <Textarea
                placeholder="e.g., What's a realistic weight loss goal for someone my age?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 min-h-[80px]"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleCustomQuestion}
                disabled={getRecommendationsMutation.isPending}
                className="flex-1"
              >
                {getRecommendationsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Get AI Recommendation
              </Button>
              <Button
                variant="outline"
                onClick={handleGetGeneralRecommendations}
                disabled={getRecommendationsMutation.isPending}
              >
                General Goals
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Response & Recommendations */}
      {showRecommendations && (
        <div className="space-y-4">
          {/* AI Response */}
          {aiResponse && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium mb-1">AI Health Coach:</p>
                    <p className="text-gray-700 dark:text-gray-300">{aiResponse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              const MetricIcon = getMetricIcon(rec.metricType);
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MetricIcon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium capitalize">
                          {rec.metricType.replace('_', ' ')}
                        </h4>
                      </div>
                      <Badge className={getConfidenceColor(rec.confidenceLevel)}>
                        {rec.confidenceLevel} confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Recommended Value */}
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatRecommendedValue(rec.recommendedValue, rec.unit)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {rec.goalType} • {rec.timeframe}
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rec.reasoning}
                      </p>
                    </div>

                    {/* Adjustment Factors */}
                    {rec.adjustmentFactors.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Personalized for:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rec.adjustmentFactors.slice(0, 2).map((factor, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips Preview */}
                    {rec.personalizedTips.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Quick Tip:
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {rec.personalizedTips[0]}
                        </p>
                      </div>
                    )}

                    {/* Create Goal Button */}
                    <Button
                      className="w-full"
                      onClick={() => createGoalMutation.mutate(rec)}
                      disabled={createGoalMutation.isPending}
                    >
                      {createGoalMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Create This Goal
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}