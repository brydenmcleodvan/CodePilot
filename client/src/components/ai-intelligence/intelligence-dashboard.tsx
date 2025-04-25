import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Brain, TrendingUp, Smile, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types imported from server/ai-intelligence.ts
interface HealthInsight {
  type: "coaching" | "correlation" | "mood" | "general";
  message: string;
  confidence: number;
  relatedMetrics: string[];
  actionable: boolean;
  suggestedAction?: string;
}

interface IntelligenceDashboardProps {
  coachingInsights: HealthInsight[];
  correlationInsights: HealthInsight[];
  moodInsights: HealthInsight[];
  generalInsights: HealthInsight[];
}

export default function IntelligenceDashboard({
  coachingInsights,
  correlationInsights,
  moodInsights,
  generalInsights
}: IntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Combined insights
  const allInsights = [
    ...coachingInsights,
    ...correlationInsights,
    ...moodInsights,
    ...generalInsights
  ];

  // Get top insights by confidence
  const topInsights = [...allInsights]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // If we have too few insights, just use all of them
  const displayedInsights = topInsights.length < 3 ? allInsights : topInsights;

  // Count insights by type
  const insightCounts = {
    coaching: coachingInsights.length,
    correlation: correlationInsights.length,
    mood: moodInsights.length,
    general: generalInsights.length,
    total: allInsights.length
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'coaching':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'correlation':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'mood':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'general':
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'coaching':
        return "border-yellow-200 dark:border-yellow-900/30";
      case 'correlation':
        return "border-blue-200 dark:border-blue-900/30";
      case 'mood':
        return "border-green-200 dark:border-green-900/30";
      case 'general':
      default:
        return "border-purple-200 dark:border-purple-900/30";
    }
  };

  const renderInsightCard = (insight: HealthInsight, index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="w-full"
      >
        <Card className={`overflow-hidden border ${getColorClass(insight.type)} h-full`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <CardTitle className="text-lg font-semibold">
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Insight
                </CardTitle>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                {Math.round(insight.confidence * 100)}% confidence
              </div>
            </div>
            <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
              Based on {insight.relatedMetrics.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-text dark:text-gray-300 mb-4">{insight.message}</p>
            {insight.actionable && insight.suggestedAction && (
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1">
                {insight.suggestedAction} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 dark:border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-primary">{insightCounts.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personalized health insights</p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 dark:border-yellow-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Coaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-yellow-500">{insightCounts.coaching}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Actionable recommendations</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 dark:border-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Correlations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-blue-500">{insightCounts.correlation}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Health pattern correlations</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 dark:border-green-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Smile className="h-5 w-5 text-green-500" />
              Mood Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-green-500">{insightCounts.mood}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mood-related insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard tabs */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-[300px] mb-6">
          <TabsTrigger value="overview">Top Insights</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedInsights.length > 0 ? (
              displayedInsights.map((insight, index) => renderInsightCard(insight, index))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No insights available yet. Keep tracking your health data!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold text-dark-text dark:text-white">Recent Health Activity</h3>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Activity Timeline - We'd ideally pull this from user's activity data */}
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-dark-text dark:text-white">Sleep tracked</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">7.5 hours of sleep recorded</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Smile className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-dark-text dark:text-white">Mood logged</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Feeling good (8/10)</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-dark-text dark:text-white">AI analysis completed</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">3 new health insights generated</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Insight Explanation */}
      <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="md:w-16 w-full flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-semibold text-dark-text dark:text-white mb-2">
                How AI Intelligence Works
              </h3>
              <p className="text-body-text dark:text-gray-300 mb-4">
                Our AI analyzes your health data to identify patterns and correlations that might not be obvious. 
                The more data you track, the more accurate and personalized your insights become.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p><span className="font-medium">Smart Coaching</span>: Actionable recommendations based on your health goals</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p><span className="font-medium">Correlational Insights</span>: Connects different health metrics to identify patterns</p>
                </div>
                <div className="flex items-start gap-2">
                  <Smile className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p><span className="font-medium">Mood Tracking</span>: Analyzes factors affecting your emotional wellbeing</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}