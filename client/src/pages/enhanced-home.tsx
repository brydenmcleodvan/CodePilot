import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveSection } from '@/components/layout/responsive-container';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { HealthNarrativeLoop } from '@/components/health-narrative/narrative-loop';
import GuidedIntro from '@/components/onboarding/guided-intro';
import { getSkipToContentProps } from '@/lib/accessibility';
import { OptimizedImage } from '@/components/ui/optimized-image';

export default function EnhancedHomePage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [healthStats, setHealthStats] = useState({
    steps: 8456,
    sleep: 6.8,
    mood: 7.5,
    score: 82,
    water: 6,
    meditation: 20,
    calories: 1850,
    heartRate: 68
  });

  // Check if this is user's first visit to display onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboardingComplete') === 'true';
    setShowOnboarding(!hasSeenOnboarding);
  }, []);

  // Handle completion of onboarding
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {/* Accessibility: Skip to content link */}
      <a {...getSkipToContentProps("main-content")} />
      
      {/* Onboarding flow */}
      {showOnboarding && <GuidedIntro onComplete={handleOnboardingComplete} />}
      
      <main id="main-content" className="pb-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800 dark:to-gray-900 py-10 md:py-16">
          <ResponsiveContainer>
            <div className="flex flex-col md:flex-row items-center md:justify-between">
              <div className="mb-8 md:mb-0 md:max-w-lg">
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gray-900 dark:text-white">
                  Welcome back, {user?.name || 'Friend'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Track your health journey, monitor progress, and achieve your wellness goals all in one place.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <i className="ri-add-line mr-2"></i>
                    Log Activity
                  </Button>
                  <Button variant="outline">
                    <i className="ri-eye-line mr-2"></i>
                    View Insights
                  </Button>
                </div>
              </div>
              
              <div className="flex-shrink-0 max-w-xs">
                <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-3">
                      <OptimizedImage
                        src={user?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt="Profile"
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-primary h-14 w-14"
                      />
                      <div>
                        <div className="font-medium">Today's Health Score</div>
                        <div className="text-2xl font-bold text-primary">{healthStats.score}<span className="text-sm font-normal text-gray-500">/100</span></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ResponsiveContainer>
        </section>
        
        {/* Health Narrative Section */}
        <ResponsiveSection
          title="Your Health Story"
          description="See how your daily activities, sleep, and mood connect to impact your overall health score."
        >
          <ResponsiveContainer>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <HealthNarrativeLoop 
                healthData={{
                  steps: healthStats.steps,
                  sleep: healthStats.sleep,
                  mood: healthStats.mood,
                  score: healthStats.score
                }}
              />
            </div>
          </ResponsiveContainer>
        </ResponsiveSection>
        
        {/* Progress Cards Section */}
        <ResponsiveSection
          title="Today's Progress"
          description="Track your daily health metrics and see how you're progressing toward your goals."
        >
          <ResponsiveContainer>
            <ResponsiveGrid 
              columns={{ sm: 1, md: 2, lg: 4 }}
              gap="gap-6"
            >
              <ProgressCard
                title="Daily Steps"
                value={healthStats.steps}
                maxValue={10000}
                icon="ri-footprint-line"
                color="green-500"
                progressType="bar"
                formatValue={(value) => value.toLocaleString()}
                label="steps"
              />
              
              <ProgressCard
                title="Sleep Duration"
                value={healthStats.sleep}
                maxValue={8}
                icon="ri-zzz-line"
                color="blue-500"
                progressType="circle"
                formatValue={(value) => value.toFixed(1)}
                label="hours"
              />
              
              <ProgressCard
                title="Water Intake"
                value={healthStats.water}
                maxValue={8}
                icon="ri-cup-line"
                color="cyan-500"
                progressType="steps"
                formatValue={(value, max) => `${value}/${max}`}
                label="glasses"
              />
              
              <ProgressCard
                title="Meditation"
                value={healthStats.meditation}
                maxValue={30}
                icon="ri-mental-health-line"
                color="purple-500"
                progressType="bar"
                formatValue={(value) => value.toString()}
                label="minutes"
              />
            </ResponsiveGrid>
          </ResponsiveContainer>
        </ResponsiveSection>
        
        {/* Quick Links */}
        <ResponsiveSection>
          <ResponsiveContainer>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col items-center h-auto py-6">
                <i className="ri-calendar-line text-2xl mb-2 text-primary"></i>
                <span>Appointments</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center h-auto py-6">
                <i className="ri-medicine-bottle-line text-2xl mb-2 text-amber-500"></i>
                <span>Medications</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center h-auto py-6">
                <i className="ri-heart-pulse-line text-2xl mb-2 text-red-500"></i>
                <span>Vitals</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center h-auto py-6">
                <i className="ri-user-heart-line text-2xl mb-2 text-blue-500"></i>
                <span>Family Health</span>
              </Button>
            </div>
          </ResponsiveContainer>
        </ResponsiveSection>
      </main>
    </>
  );
}