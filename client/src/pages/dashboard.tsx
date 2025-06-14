import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Brain, Sun, Moon, Clock, Dumbbell, Award, BookOpen, ChevronRight, Calendar, Utensils, Shield, Dna, AlertTriangle, TrendingUp, Users, Stethoscope, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { LongevityScoreCard } from "@/components/longevity/longevity-score-card";
import { GlucoseWidget } from "@/components/metabolic/glucose-widget";
import { RiskAlertCard } from "@/components/RiskAlertCard";
import { GeneticRiskPanel } from "@/components/GeneticRiskPanel";
import { HabitTrackerDashboard } from "@/components/HabitTrackerDashboard";
import ProviderDashboardView from "@/components/ProviderDashboardView";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import NotificationCenter from "@/components/NotificationCenter";
import AchievementCard from "@/components/AchievementCard";
import HealthTimeline from "@/components/HealthTimeline";

// Import advanced health modules (will be dynamically loaded)
// import { BehavioralPsychologyLayer } from "@/components/BehavioralPsychologyLayer";
// import { MedicalProviderMode } from "@/components/MedicalProviderMode";
// import { RiskDetectionDashboard } from "@/components/RiskDetectionDashboard";
// import DNAInsightsDashboard from "@/components/DNAInsightsDashboard";

import { User } from "@shared/schema";

interface MetricCard {
  title: string;
  value: number;
  icon: JSX.Element;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Check user permissions and data availability for advanced modules
  const isProviderUser = user?.roles?.includes('provider') || user?.roles?.includes('admin');
  const hasGeneticData = !!user?.preferences?.geneticDataUploaded;
  const hasActiveAlerts = true; // Will be determined by risk detection queries
  const hasHealthData = !!user?.preferences?.connectedDevices;
  
  // Use consolidated dashboard API endpoint instead of multiple requests
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
    staleTime: 60000, // Cache data for 1 minute
  });
  
  // Individual data entities - extracted from the consolidated endpoint
  const profile = dashboardData?.profile || {};
  const healthStats = dashboardData?.healthStats || [];
  const medications = dashboardData?.medications || [];
  const connections = dashboardData?.connections || [];
  const productRecommendations = dashboardData?.recommendations || [];
  
  // Fetch additional data for advanced modules
  const { data: journeyEntries = [] } = useQuery({
    queryKey: ["/api/health-journey"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const { data: coachingPlans = [] } = useQuery({
    queryKey: ["/api/coaching-plans"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/challenges"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: challengeProgress = [] } = useQuery({
    queryKey: ["/api/challenge-progress"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const { data: mentalHealthAssessments = [] } = useQuery({
    queryKey: ["/api/mental-health"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const { data: healthArticles = [] } = useQuery({
    queryKey: ["/api/health-articles"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ["/api/meal-plans"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Progress tracking and achievements data
  const { data: progressData } = useQuery({
    queryKey: ["/api/progress-tracking"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const metrics: MetricCard[] = [
    { 
      title: "Daily Activity",
      value: 75,
      icon: <Activity className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Heart Rate",
      value: 68,
      icon: <Heart className="h-6 w-6" />,
      color: "bg-red-500"
    },
    {
      title: "Mental Wellness",
      value: 85,
      icon: <Brain className="h-6 w-6" />,
      color: "bg-purple-500"
    },
    {
      title: "Sleep Quality",
      value: 90,
      icon: <Moon className="h-6 w-6" />,
      color: "bg-indigo-500"
    }
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
    <div className="clean-container py-10">
      <div className="clean-header mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Health Dashboard</h1>
        <p className="text-muted-foreground text-body-text">
          Welcome back, <span className="font-medium text-dark-text">{user?.name || user?.username}</span>. Here's your personalized health overview.
        </p>
      </div>

      {/* Clean tabs with consistent spacing */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="clean-tabs overflow-x-auto pb-2 mb-4">
          <TabsList className="bg-muted border border-light-blue-border rounded-lg p-1">
            <TabsTrigger value="overview" className="text-sm rounded-md">Overview</TabsTrigger>
            <TabsTrigger value="metrics" className="text-sm rounded-md">Health Metrics</TabsTrigger>
            <TabsTrigger value="goals" className="text-sm rounded-md">Goals</TabsTrigger>
            <TabsTrigger value="insights" className="text-sm rounded-md">AI Insights</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Alert Card - Prominent placement at top */}
          <RiskAlertCard 
            userId={user?.id} 
            className="mb-6"
          />

          {/* Genetic Risk Panel - Show if user has DNA data */}
          {hasGeneticData && (
            <GeneticRiskPanel 
              userId={user?.id} 
              className="mb-6"
            />
          )}

          {/* Notification Center and Achievements Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <NotificationCenter />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recent Achievements</h3>
              {progressData?.achievements?.slice(0, 3).map((achievement: any) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  compact={true}
                />
              ))}
            </div>
          </div>

          {/* Daily Health Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Health Tips</CardTitle>
              <CardDescription>
                Personalized recommendations based on your health data
              </CardDescription>
            </CardHeader>
              <CardContent>
                <motion.ul className="space-y-4">
                  {[
                    "Take a 10-minute mindfulness break",
                    "Drink 8 glasses of water",
                    "Get 30 minutes of moderate exercise",
                    "Practice good posture while working"
                  ].map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {tip}
                    </motion.li>
                  ))}
                </motion.ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Exercise Goals", progress: 80 },
                    { label: "Nutrition Goals", progress: 65 },
                    { label: "Sleep Goals", progress: 90 },
                    { label: "Mindfulness Goals", progress: 70 }
                  ].map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.label}</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      >
                        <Progress value={goal.progress} className="h-2" />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Journey Tab */}
        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Health Journey</CardTitle>
              <CardDescription>
                Track your health milestones and progress over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-end">
                <Button variant="outline" size="sm">Add New Entry</Button>
              </div>
              
              {(journeyEntries || []).map((entry: any) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full p-2 bg-primary/10">
                        {entry.category === "nutrition" ? (
                          <Utensils className="h-5 w-5 text-primary" />
                        ) : entry.category === "exercise" ? (
                          <Dumbbell className="h-5 w-5 text-primary" />
                        ) : (
                          <Clock className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{entry.category}</Badge>
                          <Badge variant="secondary" className="capitalize">{entry.sentiment}</Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm">{entry.description}</p>
                  
                  {entry.metrics && (
                    <div className="bg-muted rounded-md p-3">
                      <h4 className="text-sm font-medium mb-2">Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(JSON.parse(entry.metrics || '{}')).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-xs font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Combined timeline */}
              <HealthTimeline />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Active Challenges</CardTitle>
                <CardDescription>
                  Track your progress on current wellness challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(challengeProgress || []).map((progress: any) => (
                  <div key={progress.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{progress.challenge.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge>{progress.challenge.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Joined {formatDate(progress.joined)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="font-medium">{progress.currentProgress} / {progress.challenge.requirementTarget}</div>
                        <div className="text-xs text-muted-foreground">{progress.challenge.requirementType}</div>
                      </div>
                    </div>
                    
                    <Progress value={(progress.currentProgress / progress.challenge.requirementTarget) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Started {formatDate(progress.challenge.startDate)}</span>
                      <span>Ends {formatDate(progress.challenge.endDate)}</span>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Update Progress</Button>
                      <Button variant="secondary" size="sm">View Details</Button>
                    </div>
                    
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Available Challenges</CardTitle>
                <CardDescription>
                  Discover new challenges to boost your health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(challenges || [])
                  .filter((challenge: WellnessChallenge) => !(challengeProgress || []).some((p: UserChallengeProgress) => p.challengeId === challenge.id))
                  .map((challenge: WellnessChallenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge>{challenge.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {challenge.pointsReward} points
                            </span>
                          </div>
                        </div>
                        {challenge.image && (
                          <div className="h-12 w-12 rounded overflow-hidden">
                            <img 
                              src={challenge.image} 
                              alt={challenge.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm">{challenge.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Target: {challenge.requirementTarget} {challenge.requirementType}</span>
                        <span>Ends {formatDate(challenge.endDate)}</span>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button size="sm">Join Challenge</Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Coaching Tab */}
        <TabsContent value="coaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Health Coaching Plans</CardTitle>
              <CardDescription>
                Personalized plans to achieve your health goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(coachingPlans || []).map((plan: any) => (
                <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{plan.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(plan.createdAt)} • Last updated {formatDate(plan.updatedAt)}
                      </p>
                    </div>
                    <Badge variant={plan.active ? "default" : "outline"}>
                      {plan.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm">{plan.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Progress</h4>
                      <span className="text-sm">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Goals</h4>
                      <ul className="space-y-1">
                        {plan.goals?.map((goal: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="rounded-full h-1.5 w-1.5 bg-primary mt-1.5"></span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recommendations</h4>
                      <ul className="space-y-1">
                        {plan.recommendations?.map((rec: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="rounded-full h-1.5 w-1.5 bg-primary mt-1.5"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Update Progress</Button>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Meal Plans</CardTitle>
              <CardDescription>
                Nutritional plans customized for your health goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(mealPlans || []).length > 0 ? (
                <div className="space-y-6">
                  {(mealPlans || []).map((plan: any) => (
                    <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{plan.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={plan.active ? "default" : "outline"}>
                              {plan.active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(plan.startDate)} - {plan.endDate ? formatDate(plan.endDate) : "Ongoing"}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Meals <Calendar className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        {plan.dietaryPreferences && (
                          <div>
                            <h4 className="font-medium">Dietary Preferences</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plan.dietaryPreferences.map((pref: string, index: number) => (
                                <Badge key={index} variant="outline" className="capitalize">
                                  {pref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {plan.healthGoals && (
                          <div>
                            <h4 className="font-medium">Health Goals</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plan.healthGoals.map((goal: string, index: number) => (
                                <Badge key={index} variant="outline" className="capitalize">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {plan.allergies && (
                          <div>
                            <h4 className="font-medium">Allergies & Restrictions</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plan.allergies.map((allergy: string, index: number) => (
                                <Badge key={index} variant="destructive" className="capitalize">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="font-medium text-lg">No Meal Plans Yet</h3>
                  <p className="text-muted-foreground mt-1">Create your first personalized meal plan</p>
                  <Button className="mt-4">Create Meal Plan</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mental Health Tab */}
        <TabsContent value="mental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mental Health Assessments</CardTitle>
              <CardDescription>
                Track your mental wellbeing over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mentalHealthAssessments.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">Take New Assessment</Button>
                  </div>
                  
                  {(mentalHealthAssessments || []).map((assessment: any) => (
                    <div key={assessment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold capitalize">{assessment.assessmentType} Assessment</h3>
                          <p className="text-sm text-muted-foreground">
                            Completed {formatDate(assessment.timestamp)}
                          </p>
                        </div>
                        
                        {assessment.score !== null && (
                          <div className="flex items-center gap-2">
                            <div 
                              className={`rounded-full h-8 w-8 flex items-center justify-center font-medium text-white ${
                                assessment.score <= 3 ? "bg-green-500" : 
                                assessment.score <= 7 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                            >
                              {assessment.score}
                            </div>
                            <span className="text-sm text-muted-foreground">/ 10</span>
                          </div>
                        )}
                      </div>
                      
                      {assessment.notes && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Notes</h4>
                          <p className="text-sm">{assessment.notes}</p>
                        </div>
                      )}
                      
                      {assessment.recommendations && assessment.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Recommendations</h4>
                          <ul className="space-y-1">
                            {assessment.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <span className="rounded-full h-1.5 w-1.5 bg-primary mt-1.5"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="font-medium text-lg">No Assessments Yet</h3>
                  <p className="text-muted-foreground mt-1">Complete an assessment to track your mental wellbeing</p>
                  <Button className="mt-4">Take Assessment</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Knowledge Library</CardTitle>
              <CardDescription>
                Explore curated health articles and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(healthArticles || []).map((article: any) => (
                  <Card key={article.id} className="overflow-hidden">
                    {article.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="object-cover w-full h-full" 
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{article.category}</Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {article.readTime} min read
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.summary}
                      </p>
                      
                      {article.tags && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="capitalize">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {article.authorName && (
                          <p>By {article.authorName}</p>
                        )}
                        <p>{formatDate(article.publishedAt)}</p>
                      </div>
                      <Button size="sm">Read Article</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DNA Health Tab */}
        {hasGeneticData && (
          <TabsContent value="dna-health" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-6">
                <Dna className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">DNA Health Analysis</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Personalized health insights based on your genetic profile
                </p>
              </div>

              {/* Full Genetic Risk Panel */}
              <GeneticRiskPanel 
                userId={user?.id}
                className="mb-6"
              />

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Dna className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Upload New Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your genetic analysis with new test results
                    </p>
                    <Link href="/dna-insights">
                      <Button variant="outline" size="sm">
                        Upload DNA
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Privacy Settings</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage your genetic data privacy and sharing preferences
                    </p>
                    <Link href="/dna-insights?tab=privacy">
                      <Button variant="outline" size="sm">
                        Privacy Controls
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Full Report</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View comprehensive genetic analysis and recommendations
                    </p>
                    <Link href="/dna-insights">
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        )}

        {/* Risk Detection & Alerts Tab */}
        {hasActiveAlerts && (
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  Health Risk Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of your health metrics with intelligent anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Risk Detection System</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced monitoring for early warning signs of health deterioration
                  </p>
                  <Button>
                    <Link href="/risk-detection">View Risk Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* DNA Insights Tab */}
        {hasGeneticData && (
          <TabsContent value="dna" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-6 w-6 text-purple-500" />
                  Genetic Analysis
                </CardTitle>
                <CardDescription>
                  Personalized health insights based on your genetic data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Dna className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">DNA Insights</h3>
                  <p className="text-gray-600 mb-4">
                    Transform your genetic data into actionable health recommendations
                  </p>
                  <Button>
                    <Link href="/dna-insights">View DNA Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Habits & Behavioral Psychology Tab */}
        <TabsContent value="habits" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Habit Formation & Psychology</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Build sustainable health improvements through evidence-based behavioral science
              </p>
            </div>

            {/* Enhanced Habit Tracker Dashboard */}
            <HabitTrackerDashboard 
              userId={user?.id}
              className="mb-6"
            />

            {/* Behavioral Psychology Insights */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Psychology Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Habit Loop Analysis
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Your morning routine shows strong cue-action-reward patterns
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-300 mb-1">
                        Implementation Intentions
                      </h5>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        "When I wake up, I will drink water" - 85% success rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Habit Stacking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium mb-1">Suggested Stack:</div>
                      <div className="space-y-1 text-gray-600">
                        <div>1. Morning alarm → Drink water</div>
                        <div>2. Drink water → 5-minute meditation</div>
                        <div>3. Meditation → Review daily goals</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Link href="/habits/create">Create Habit Stack</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* Progress & Health Outcomes Tab */}
        <TabsContent value="progress" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Health Progress & Outcomes</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real-world biometric trends and measurable health improvements
              </p>
            </div>

            {/* Comprehensive Progress Dashboard */}
            <ProgressDashboard 
              userId={user?.id}
              className="mb-6"
            />
          </motion.div>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                Health Marketplace
              </CardTitle>
              <CardDescription>
                Outcome-based product recommendations and community reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Recommended for You</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Magnesium Supplement</div>
                        <div className="text-sm text-gray-600">Based on sleep patterns</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">94% effective</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Blue Light Glasses</div>
                        <div className="text-sm text-gray-600">For screen time</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">87% effective</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Your Reviews</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="font-medium">Omega-3 Supplement</div>
                      <div className="text-gray-600">+12% joint health improvement</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Meditation App</div>
                      <div className="text-gray-600">+28% stress reduction</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Data Transparency Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-500" />
                Privacy & Data Control
              </CardTitle>
              <CardDescription>
                Complete transparency and control over your health data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Data Usage Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health metrics analyzed</span>
                      <span>247 times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI recommendations generated</span>
                      <span>89 times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data shared with providers</span>
                      <span>0 times</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Privacy Controls</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Analytics participation</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data sharing</span>
                      <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Research participation</span>
                      <Badge className="bg-blue-100 text-blue-800">Optional</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Provider Mode Tab */}
        {isProviderUser && (
          <TabsContent value="provider" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-6">
                <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Medical Provider Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Secure clinical interface for authorized healthcare professionals
                </p>
              </div>

              {/* Enhanced Provider Dashboard with Role-Based Access */}
              <ProviderDashboardView 
                userId={user?.id}
                userRole={user?.role}
                className="mb-6"
              />
            </motion.div>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}