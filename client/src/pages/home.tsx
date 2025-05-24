import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import HealthStats from "@/components/health-stats";
import MedicationTracker from "@/components/medication-tracker";
import NewsUpdates from "@/components/news-updates";
import ProductRecommendations from "@/components/product-recommendations";
import HealthGoalCard from "@/components/health-goal-card";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, TrendingUp } from "lucide-react";

interface HealthGoalWithProgress {
  id: string;
  metricType: string;
  goalType: string;
  goalValue: number;
  unit: string;
  timeframe: string;
  status: 'on_track' | 'behind' | 'ahead' | 'completed' | 'at_risk';
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  daysCompleted: number;
  totalDays: number;
  streak: number;
  createdAt: string;
  recommendation?: string;
  nextMilestone?: string;
  riskFactors?: string[];
}

const Home = () => {
  const { user } = useAuth();

  // Query for health goals with real-time progress
  const { data: healthGoals = [], isLoading: goalsLoading } = useQuery<HealthGoalWithProgress[]>({
    queryKey: ['/api/health-goals'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/health-goals');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // Auto-refresh every 30 seconds as data syncs
  });

  // Query for recommended products based on health data
  const { data: recommendedProducts } = useQuery({
    queryKey: ['/api/products/recommendations'],
    enabled: !!user,
  });

  // Query for news updates
  const { data: newsItems, isLoading: newsLoading } = useQuery({
    queryKey: ['/api/news', { limit: 3 }],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <section id="home" className="py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl overflow-hidden shadow-lg mb-12">
          <div className="md:flex">
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                Transform Your Health Journey
              </h1>
              <p className="text-white text-lg mb-6">
                Healthmap unifies your genetics, genealogy, and health data into
                one powerful platform.
              </p>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link
                    href="/profile"
                    className="bg-white text-primary font-medium py-2 px-6 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    My Profile
                  </Link>
                ) : (
                  <Link
                    href="/auth/register"
                    className="bg-white text-primary font-medium py-2 px-6 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                )}
                <Link
                  href="/forum"
                  className="bg-transparent text-white border border-white font-medium py-2 px-6 rounded-md hover:bg-white/10 transition-colors duration-200"
                >
                  Community
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80"
                alt="Health Technology"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* My Health Goals Section */}
        {user && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Goals</h2>
                <p className="text-gray-600 dark:text-gray-400">Track your health objectives in real-time</p>
              </div>
              <Link href="/health-goals">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Goal</span>
                </Button>
              </Link>
            </div>

            {goalsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : healthGoals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Set Your First Health Goal
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your journey by setting meaningful health objectives
                  </p>
                  <Link href="/health-goals">
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthGoals.slice(0, 6).map((goal) => (
                  <HealthGoalCard
                    key={goal.id}
                    id={goal.id}
                    metric={goal.metricType as any}
                    goalType={goal.goalType as any}
                    goalValue={goal.goalValue}
                    unit={goal.unit}
                    progress={goal.progress}
                    status={goal.status}
                    timeframe={goal.timeframe as any}
                    daysCompleted={goal.daysCompleted}
                    totalDays={goal.totalDays}
                    streak={goal.streak}
                    createdAt={goal.createdAt}
                  />
                ))}
              </div>
            )}

            {healthGoals.length > 6 && (
              <div className="text-center mt-6">
                <Link href="/health-goals">
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View All Goals ({healthGoals.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Health Stats Section */}
        {user && <HealthStats />}

        {/* News & Updates */}
        <NewsUpdates newsItems={newsItems || []} isLoading={newsLoading} />

        {/* Personalized Health Store */}
        <ProductRecommendations user={user} products={recommendedProducts || []} />
      </section>
    </div>
  );
};

export default Home;
