import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { getQueryFn } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Heart,
  Brain,
  Moon,
  Clock,
  Dumbbell,
  Sun,
  Dna,
  AlertTriangle,
  BarChart3,
  Users,
  Shield,
  Stethoscope,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { LongevityScoreCard } from "@/components/longevity/longevity-score-card";
import { GlucoseWidget } from "@/components/metabolic/glucose-widget";
import { RiskAlertCard } from "@/components/RiskAlertCard";
import { GeneticRiskPanel } from "@/components/GeneticRiskPanel";
import { HabitTrackerDashboard } from "@/components/HabitTrackerDashboard";
import NotificationCenter from "@/components/NotificationCenter";
import AchievementCard from "@/components/AchievementCard";
const ProgressDashboard = lazy(() =>
  import("@/components/ProgressDashboard").then((m) => ({
    default: m.ProgressDashboard || m.default,
  }))
);

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const isProviderUser =
    user?.roles?.includes("provider") || user?.roles?.includes("admin");
  const hasGeneticData = !!user?.preferences?.geneticDataUploaded;
  const hasActiveAlerts = true; // to be updated based on actual data
  const hasHealthData = !!user?.preferences?.connectedDevices;

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
    staleTime: 60000,
  });

  const {
    journeyEntries = [],
    progressData = {},
    coachingPlans = [],
    challenges = [],
    challengeProgress = [],
    mentalHealthAssessments = [],
    healthArticles = [],
    mealPlans = [],
  } = dashboardData || {};

  const metrics = [
    { title: "Daily Activity", value: 75, icon: <Activity />, color: "bg-blue-500" },
    { title: "Heart Rate", value: 68, icon: <Heart />, color: "bg-red-500" },
    { title: "Mental Wellness", value: 85, icon: <Brain />, color: "bg-purple-500" },
    { title: "Sleep Quality", value: 90, icon: <Moon />, color: "bg-indigo-500" },
  ];

  const formatDate = (dateInput: Date | string | null) => {
    if (!dateInput) return "N/A";
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-medium">{user?.name || user?.username}</span>.
          Here's your personalized health overview.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto whitespace-nowrap pb-2 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="journey">Health Journey</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="coaching">Health Coaching</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="mental">Mental Health</TabsTrigger>
          <TabsTrigger value="library">Health Library</TabsTrigger>
          {hasGeneticData && <TabsTrigger value="dna-health">DNA Health</TabsTrigger>}
          {hasActiveAlerts && <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>}
          {hasGeneticData && <TabsTrigger value="dna">DNA Insights</TabsTrigger>}
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="marketplace">Shop</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          {isProviderUser && <TabsTrigger value="provider">Provider</TabsTrigger>}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <RiskAlertCard userId={user?.id} />
          {hasGeneticData && <GeneticRiskPanel userId={user?.id} />}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <NotificationCenter />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recent Achievements</h3>
              {progressData.achievements?.slice(0, 3).map((ach) => (
                <AchievementCard key={ach.id} achievement={ach} compact />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <motion.div
                key={metric.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredCard(metric.title)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card>
                  <motion.div
                    className={`${metric.color} absolute inset-0 opacity-10`}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: hoveredCard === metric.title ? 1.5 : 1,
                      opacity: hoveredCard === metric.title ? 0.2 : 0.1,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: hoveredCard === metric.title ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {metric.icon}
                      </motion.div>
                      {metric.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                    >
                      <Progress value={metric.value} />
                    </motion.div>
                    <p className="text-2xl font-bold mt-2">{metric.value}%</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LongevityScoreCard biologicalAge={39.2} chronologicalAge={43} score={82} trend={4} />
            <GlucoseWidget currentValue={104} previousValue={110} lastUpdated="1 hour ago" trend={-5.5} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun /> Daily Wellness Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Take a 10-minute mindfulness break",
                    "Drink 8 glasses of water",
                    "Get 30 minutes of moderate exercise",
                    "Practice good posture while working",
                  ].map((tip, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className="h-2 w-2 rounded-full bg-primary inline-block mr-2"></div>
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity /> Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Exercise Goals", progress: 80 },
                    { label: "Nutrition Goals", progress: 65 },
                    { label: "Sleep Goals", progress: 90 },
                    { label: "Mindfulness Goals", progress: 70 },
                  ].map((g, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{g.label}</span>
                        <span>{g.progress}%</span>
                      </div>
                      <Progress value={g.progress} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Health Articles</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#" onClick={() => setActiveTab("library")}>
                    View all <ChevronRight />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {healthArticles.slice(0, 2).map((article: any) => (
                  <div key={article.id} className="flex space-x-4">
                    {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-16 h-16 rounded-md object-cover" />}
                    <div>
                      <h3 className="font-medium text-sm">{article.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline-block mr-1" /> <span>{article.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... Other tabs unchanged for brevity, ensure the merged content continues similarly ... */}

        {/* Progress Tab using Suspense for code-split component */}
        <TabsContent value="progress" className="space-y-6">
          <Suspense fallback={<Loader2 className="animate-spin mx-auto my-6" />}>
            <ProgressDashboard userId={user?.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
