import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HealthInsight {
  type: "coaching" | "correlation" | "mood" | "general";
  message: string;
  confidence: number;
  relatedMetrics: string[];
  actionable: boolean;
  suggestedAction?: string;
}

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<string>("coaching");
  const { toast } = useToast();

  // Fetch coaching insights
  const { 
    data: coachingData,
    isLoading: isCoachingLoading,
    error: coachingError 
  } = useQuery<{ insights: HealthInsight[] }>({
    queryKey: ['/api/ai/coaching-insights'],
    refetchOnWindowFocus: false,
  });

  // Fetch correlational insights
  const { 
    data: correlationData,
    isLoading: isCorrelationLoading,
    error: correlationError 
  } = useQuery<{ insights: HealthInsight[] }>({
    queryKey: ['/api/ai/correlational-insights'],
    refetchOnWindowFocus: false,
  });

  // Fetch mood insights
  const { 
    data: moodData,
    isLoading: isMoodLoading,
    error: moodError 
  } = useQuery<{ insights: HealthInsight[] }>({
    queryKey: ['/api/ai/mood-analysis'],
    refetchOnWindowFocus: false,
  });

  // Fetch general insights
  const { 
    data: generalData,
    isLoading: isGeneralLoading,
    error: generalError 
  } = useQuery<{ insights: HealthInsight[] }>({
    queryKey: ['/api/ai/general-insights'],
    refetchOnWindowFocus: false,
  });

  // Handle errors
  useEffect(() => {
    const errors = [coachingError, correlationError, moodError, generalError].filter(Boolean);
    
    if (errors.length > 0) {
      toast({
        title: "Error loading insights",
        description: "We're having trouble loading your personalized health insights. Please try again later.",
        variant: "destructive",
      });
    }
  }, [coachingError, correlationError, moodError, generalError, toast]);

  // Get confidence level label and color
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: "High", color: "text-green-600 dark:text-green-400" };
    if (confidence >= 0.5) return { label: "Medium", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Low", color: "text-red-600 dark:text-red-400" };
  };

  // Get badge color based on metric
  const getMetricColor = (metric: string) => {
    const metricColors: {[key: string]: string} = {
      steps: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      sleep: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      mood: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      water: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      nutrition: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      workout: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      stress: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      heart: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      weight: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    };
    
    // Default color for metrics not specifically mapped
    return metricColors[metric.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };
  
  const renderInsightCard = (insight: HealthInsight, index: number) => {
    const confidenceInfo = getConfidenceLevel(insight.confidence);
    
    return (
      <motion.div
        key={`${insight.type}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="mb-4 overflow-hidden border-l-4 dark:border-gray-700" 
          style={{ borderLeftColor: insight.type === 'coaching' ? '#4A90E2' : 
                              insight.type === 'correlation' ? '#47B881' : 
                              insight.type === 'mood' ? '#9166CC' : '#F7D154' }}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                {insight.type === 'coaching' ? 'Coaching Insight' : 
                 insight.type === 'correlation' ? 'Pattern Detected' : 
                 insight.type === 'mood' ? 'Mood Analysis' : 'Health Tip'}
              </CardTitle>
              <div className={`text-xs font-medium ${confidenceInfo.color}`}>
                {confidenceInfo.label} confidence
              </div>
            </div>
            <CardDescription className="flex flex-wrap gap-1 pt-1">
              {insight.relatedMetrics.map((metric, i) => (
                <span key={i} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(metric)}`}>
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </span>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{insight.message}</p>
          </CardContent>
          {insight.actionable && insight.suggestedAction && (
            <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-3 pb-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Try this:</span> {insight.suggestedAction}
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderLoader = () => (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const renderEmptyState = (type: string) => (
    <Card className="border-dashed border-2 dark:border-gray-700">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <i className="ri-brain-line text-2xl text-gray-500 dark:text-gray-400"></i>
        </div>
        <h3 className="text-xl font-medium mb-2 dark:text-white">No Insights Available</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
          {type === "coaching" 
            ? "Add more health data to receive personalized coaching insights. Track your steps, sleep, and other metrics." 
            : type === "correlation" 
            ? "We need more data to identify patterns in your health. Continue tracking multiple metrics consistently."
            : type === "mood"
            ? "Start tracking your mood daily to receive personalized insights about your emotional patterns."
            : "Complete your health profile to receive general health recommendations."}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading dark:text-white">AI Health Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized insights powered by AI to help you optimize your health
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <i className="ri-refresh-line"></i>
            Refresh Insights
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="coaching" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coaching" className="text-sm md:text-base">
            <i className="ri-brain-line mr-1.5 text-lg hidden md:inline-block"></i>
            Coaching
          </TabsTrigger>
          <TabsTrigger value="correlation" className="text-sm md:text-base">
            <i className="ri-line-chart-line mr-1.5 text-lg hidden md:inline-block"></i>
            Patterns
          </TabsTrigger>
          <TabsTrigger value="mood" className="text-sm md:text-base">
            <i className="ri-mental-health-line mr-1.5 text-lg hidden md:inline-block"></i>
            Mood
          </TabsTrigger>
          <TabsTrigger value="general" className="text-sm md:text-base">
            <i className="ri-heart-pulse-line mr-1.5 text-lg hidden md:inline-block"></i>
            General
          </TabsTrigger>
        </TabsList>

        {/* Coaching Insights Tab */}
        <TabsContent value="coaching" className="space-y-4">
          {isCoachingLoading ? (
            renderLoader()
          ) : coachingData?.insights && coachingData.insights.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 italic">
                Your AI health coach analyzes your data to provide personalized guidance
              </p>
              {coachingData.insights.map((insight, index) => renderInsightCard(insight, index))}
            </>
          ) : (
            renderEmptyState("coaching")
          )}
        </TabsContent>

        {/* Correlational Insights Tab */}
        <TabsContent value="correlation" className="space-y-4">
          {isCorrelationLoading ? (
            renderLoader()
          ) : correlationData?.insights && correlationData.insights.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 italic">
                Patterns detected in your health data that reveal what works best for you
              </p>
              {correlationData.insights.map((insight, index) => renderInsightCard(insight, index))}
            </>
          ) : (
            renderEmptyState("correlation")
          )}
        </TabsContent>

        {/* Mood Analysis Tab */}
        <TabsContent value="mood" className="space-y-4">
          {isMoodLoading ? (
            renderLoader()
          ) : moodData?.insights && moodData.insights.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 italic">
                Insights from your mood tracking to help improve emotional wellbeing
              </p>
              {moodData.insights.map((insight, index) => renderInsightCard(insight, index))}
            </>
          ) : (
            renderEmptyState("mood")
          )}
        </TabsContent>

        {/* General Health Insights Tab */}
        <TabsContent value="general" className="space-y-4">
          {isGeneralLoading ? (
            renderLoader()
          ) : generalData?.insights && generalData.insights.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 italic">
                General health recommendations based on your profile
              </p>
              {generalData.insights.map((insight, index) => renderInsightCard(insight, index))}
            </>
          ) : (
            renderEmptyState("general")
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-2 dark:text-white">About AI Health Intelligence</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Our AI analyzes your health data to provide personalized insights and recommendations.
          The more data you track, the more accurate and helpful these insights become.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Coaching Assistant</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provides actionable health recommendations based on your recent data
            </p>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Correlational Insights</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identifies patterns like "You feel best with 8,000 steps + 7.5 hours sleep"
            </p>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Mood Tracker Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyzes your mood data to find triggers and patterns affecting emotional wellbeing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}