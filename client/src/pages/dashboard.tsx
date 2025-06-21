import { useState, useEffect } from "react";
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
import { Activity, Heart, Brain, Sun, Moon, Clock, Dumbbell, Award, BookOpen, ChevronRight, Calendar, Utensils, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
import {
  HealthJourneyEntry,
  HealthCoachingPlan,
  WellnessChallenge,
  UserChallengeProgress,
  MentalHealthAssessment,
  HealthArticle,
  MealPlan
} from "@shared/schema";

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

  // Fetch health alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Track dashboard visit and health alerts view
  useEffect(() => {
    if (user) {
      trackEvent(ANALYTICS_EVENTS.DASHBOARD_VISITED, { userId: user.id });
      
      if (alertsData?.alerts && alertsData.alerts.length > 0) {
        trackEvent(ANALYTICS_EVENTS.HEALTH_ALERTS_VIEWED, { 
          userId: user.id,
          alertCount: alertsData.alerts.length,
          alerts: alertsData.alerts
        });
      }
    }
  }, [user, alertsData]);

  // Fetch health journey entries
  const { data: journeyEntries = [] } = useQuery<HealthJourneyEntry[]>({
    queryKey: ["/api/health-journey"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Fetch coaching plans
  const { data: coachingPlans = [] } = useQuery<HealthCoachingPlan[]>({
    queryKey: ["/api/coaching-plans"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Fetch wellness challenges
  const { data: challenges = [] } = useQuery<WellnessChallenge[]>({
    queryKey: ["/api/challenges"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch user challenge progress
  const { data: challengeProgress = [] } = useQuery<(UserChallengeProgress & { challenge: WellnessChallenge })[]>({
    queryKey: ["/api/challenge-progress"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Fetch mental health assessments
  const { data: mentalHealthAssessments = [] } = useQuery<MentalHealthAssessment[]>({
    queryKey: ["/api/mental-health"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Fetch health articles
  const { data: healthArticles = [] } = useQuery<HealthArticle[]>({
    queryKey: ["/api/health-articles"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch meal plans
  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans"],
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
            <TabsTrigger value="journey" className="text-sm rounded-md">Health Journey</TabsTrigger>
            <TabsTrigger value="challenges" className="text-sm rounded-md">Challenges</TabsTrigger>
            <TabsTrigger value="coaching" className="text-sm rounded-md">Health Coaching</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-sm rounded-md">Nutrition</TabsTrigger>
            <TabsTrigger value="mental" className="text-sm rounded-md">Mental Health</TabsTrigger>
            <TabsTrigger value="library" className="text-sm rounded-md">Health Library</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.h1 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Wellness Dashboard
          </motion.h1>

          {/* Health Alerts Section */}
          {!alertsLoading && alertsData?.alerts && alertsData.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="text-red-600 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-semibold mb-2">Health Alerts</h3>
                    <div className="space-y-2">
                      {alertsData.alerts.map((alert: string, index: number) => (
                        <div key={index} className="text-red-800 text-sm bg-red-50 rounded p-2 border border-red-200">
                          {alert}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <motion.div
                key={metric.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredCard(metric.title)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card className="relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 opacity-10 ${metric.color}`}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: hoveredCard === metric.title ? 1.5 : 1,
                      opacity: hoveredCard === metric.title ? 0.2 : 0.1
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ 
                          rotate: hoveredCard === metric.title ? 360 : 0 
                        }}
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
                      <Progress value={metric.value} className="h-2" />
                    </motion.div>
                    <p className="text-2xl font-bold mt-2">{metric.value}%</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-6 w-6 text-primary" />
                  Daily Wellness Tips
                </CardTitle>
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
          </motion.div>
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
              
              {journeyEntries.map((entry: HealthJourneyEntry) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Active Challenges</CardTitle>
                <CardDescription>
                  Track your progress on current wellness challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {challengeProgress.map((progress: UserChallengeProgress & { challenge: WellnessChallenge }) => (
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
                {challenges
                  .filter((challenge: WellnessChallenge) => !challengeProgress.some((p: UserChallengeProgress) => p.challengeId === challenge.id))
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
              {coachingPlans.map((plan: HealthCoachingPlan) => (
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
                  
                  <div className="grid md:grid-cols-2 gap-4">
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
              {mealPlans.length > 0 ? (
                <div className="space-y-6">
                  {mealPlans.map((plan: MealPlan) => (
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
                  
                  {mentalHealthAssessments.map((assessment: MentalHealthAssessment) => (
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
                {healthArticles.map((article: HealthArticle) => (
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
      </Tabs>
    </div>
  );
}