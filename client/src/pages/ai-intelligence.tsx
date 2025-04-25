import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

// Redirect to Health Coach page with Intelligence tab selected
export default function AIIntelligencePage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Use a session storage flag to indicate we want the intelligence tab
    sessionStorage.setItem('healthCoachTab', 'intelligence');
    
    // Redirect to health coach page
    setLocation("/health-coach");
  }, [setLocation]);
  
  // Show loading indicator while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-body-text dark:text-gray-300">Redirecting to Health Coach...</p>
    </div>
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      
      // Fetch all types of insights
      const [coachingRes, correlationRes, moodRes, generalRes] = await Promise.all([
        apiRequest("GET", "/api/ai/coaching-insights"),
        apiRequest("GET", "/api/ai/correlation-insights"),
        apiRequest("GET", "/api/ai/mood-insights"),
        apiRequest("GET", "/api/ai/general-insights")
      ]);

      // Parse responses considering the API response structure
      const coachingData = await coachingRes.json();
      const correlationData = await correlationRes.json();
      const moodData = await moodRes.json();
      const generalData = await generalRes.json();

      // Handle different response formats (direct array or {insights: array})
      setCoachingInsights(Array.isArray(coachingData) ? coachingData : coachingData.insights || []);
      setCorrelationInsights(Array.isArray(correlationData) ? correlationData : correlationData.insights || []);
      setMoodInsights(Array.isArray(moodData) ? moodData : moodData.insights || []);
      setGeneralInsights(Array.isArray(generalData) ? generalData : generalData.insights || []);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      toast({
        title: "Error loading insights",
        description: "We couldn't load your health insights. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-heading font-bold mb-2">Sign in required</h1>
        <p className="text-body-text dark:text-gray-300 max-w-md mb-6">
          Please sign in to access personalized AI health insights.
        </p>
        <Button asChild>
          <a href="/auth/login">Sign In</a>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-body-text dark:text-gray-300">Loading your personalized health insights...</p>
      </div>
    );
  }

  const allInsights = [
    ...coachingInsights,
    ...correlationInsights,
    ...moodInsights,
    ...generalInsights
  ];

  const containsInsights = allInsights.length > 0;

  return (
    <div className="flex flex-col w-full max-w-screen-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-dark-text dark:text-white mb-2">
              AI Health Intelligence
            </h1>
            <p className="text-body-text dark:text-gray-300">
              Personalized insights and recommendations based on your health data
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>

        <Tabs 
          defaultValue="dashboard" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 md:w-[600px] mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {containsInsights ? (
              <IntelligenceDashboard 
                coachingInsights={coachingInsights}
                correlationInsights={correlationInsights}
                moodInsights={moodInsights}
                generalInsights={generalInsights}
              />
            ) : (
              <NoInsightsMessage />
            )}
          </TabsContent>

          <TabsContent value="coaching">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coachingInsights.length > 0 ? (
                coachingInsights.map((insight, index) => (
                  <InsightCard 
                    key={index}
                    insight={insight}
                    icon={<Lightbulb className="h-5 w-5 text-yellow-500" />}
                    colorClass="border-yellow-200 dark:border-yellow-900/30"
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <NoInsightsMessage type="coaching" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="correlations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {correlationInsights.length > 0 ? (
                correlationInsights.map((insight, index) => (
                  <InsightCard 
                    key={index}
                    insight={insight}
                    icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
                    colorClass="border-blue-200 dark:border-blue-900/30"
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <NoInsightsMessage type="correlation" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mood">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moodInsights.length > 0 ? (
                moodInsights.map((insight, index) => (
                  <InsightCard 
                    key={index}
                    insight={insight}
                    icon={<Smile className="h-5 w-5 text-green-500" />}
                    colorClass="border-green-200 dark:border-green-900/30"
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <NoInsightsMessage type="mood" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generalInsights.length > 0 ? (
                generalInsights.map((insight, index) => (
                  <InsightCard 
                    key={index}
                    insight={insight}
                    icon={<Brain className="h-5 w-5 text-purple-500" />}
                    colorClass="border-purple-200 dark:border-purple-900/30"
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <NoInsightsMessage type="general" />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

interface InsightCardProps {
  insight: HealthInsight;
  icon: React.ReactNode;
  colorClass: string;
}

function InsightCard({ insight, icon, colorClass }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden border ${colorClass} h-full`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {icon}
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
          <p className="text-body-text dark:text-gray-300">{insight.message}</p>
        </CardContent>
        {insight.actionable && insight.suggestedAction && (
          <CardFooter className="pt-2 pb-4">
            <Button variant="outline" size="sm" className="w-full">
              {insight.suggestedAction}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

interface NoInsightsMessageProps {
  type?: "coaching" | "correlation" | "mood" | "general";
}

function NoInsightsMessage({ type }: NoInsightsMessageProps) {
  const messages = {
    coaching: "We don't have enough data yet to provide coaching insights. Keep tracking your health data for personalized recommendations.",
    correlation: "We're still learning about how different aspects of your health relate to each other. Add more health data to see correlations.",
    mood: "Track your mood regularly alongside other health metrics to receive mood pattern insights.",
    general: "Keep using Healthmap to receive AI-powered general health insights based on your data."
  };

  const message = type 
    ? messages[type] 
    : "We don't have any insights to show yet. Keep tracking your health data regularly to receive personalized insights.";

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <Lightbulb className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-xl font-heading font-bold mb-2">No insights available yet</h3>
      <p className="text-body-text dark:text-gray-400 max-w-lg mb-6">
        {message}
      </p>
      <Button variant="outline">
        Track New Health Data
      </Button>
    </div>
  );
}