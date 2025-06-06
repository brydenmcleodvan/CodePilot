import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import HealthStats from "@/components/health-stats";
import ConnectionCard from "@/components/connection-card";
import AIHealthAssistant from "@/components/ai-health-assistant";
import HealthVisualization from "@/components/health-visualization";
import MedicationTracker from "@/components/medication-tracker";
import { GoalTracker } from "@/components/goal-tracker";
import { FamilyTree } from "@/components/family-tree";
import StreamlitEmbed from "@/components/streamlit-embed";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import HealthDashboard from "@/components/health-dashboard";
import { OptimizedImage } from "@/components/ui/optimized-image";
import ProgressBadges from "@/components/progress-badges";
import { progressTracker } from "@/services/progress-tracker";

const Profile = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth/login");
    }
  }, [user, setLocation]);

  // Match hash from URL and set active tab
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tab = hash.substring(1);
      setActiveTab(tab);
    }
  }, [location]);

  // Query for user connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/connections'],
    enabled: !!user,
  });

  // Query for user health stats
  const { data: healthStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/health/stats'],
    enabled: !!user,
  });

  // Query for progress data (streaks, achievements, improvements)
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return progressTracker.getProgressData(user.id);
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return null; // Return nothing until redirect happens
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/10 p-6 mb-6 sticky top-24 dark:border dark:border-gray-700">
            <div className="flex flex-col items-center text-center mb-6">
              <OptimizedImage
                src={user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt="Profile Picture"
                className="w-24 h-24 rounded-full border-4 border-primary mb-4 overflow-hidden"
                width={96}
                height={96}
                priority={true}
              />
<<<<<<< HEAD
              <h2 className="text-xl font-medium dark:text-white">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <button className="mt-4 w-full bg-white dark:bg-gray-700 text-primary dark:text-primary-400 border border-primary dark:border-primary-500 font-medium py-2 rounded-md hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200">
=======
              <h2 className="text-xl font-medium">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <Link
                href="/profile/edit"
                className="mt-4 w-full bg-white text-primary border border-primary font-medium py-2 rounded-md hover:bg-primary/5 transition-colors duration-200 text-center"
              >
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
                Edit Profile
              </Link>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <nav className="flex flex-col space-y-2">
                <a
                  href="#profile-overview"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "overview"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-user-line"></i>
                  <span>Profile Overview</span>
                </a>
                <a
                  href="#health-data"
                  onClick={() => setActiveTab("health-data")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "health-data"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-heart-line"></i>
                  <span>Health Data</span>
                </a>
                <a
                  href="#progress-badges"
                  onClick={() => setActiveTab("progress-badges")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "progress-badges"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-trophy-line"></i>
                  <span>Progress & Badges</span>
                </a>
                <a
                  href="#genetic-profile"
                  onClick={() => setActiveTab("genetic-profile")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "genetic-profile"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-dna-line"></i>
                  <span>Genetic Profile</span>
                </a>
                <a
                  href="#family-connections"
                  onClick={() => setActiveTab("family-connections")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "family-connections"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-group-line"></i>
                  <span>Family & Friends</span>
                </a>
                <a
                  href="#neural-profile"
                  onClick={() => setActiveTab("neural-profile")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "neural-profile"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-brain-line"></i>
                  <span>Neural Profile</span>
                </a>
                <a
                  href="#settings"
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "settings"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-settings-line"></i>
                  <span>Settings</span>
                </a>
                <a
                  href="#connected-services"
                  onClick={() => setActiveTab("connected-services")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "connected-services"
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-link"></i>
                  <span>Connected Services</span>
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="md:w-2/3 lg:w-3/4">
          {activeTab === "overview" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-dark-text dark:text-white">Profile Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {healthStats && healthStats.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`bg-${stat.colorScheme}/5 rounded-lg p-4 flex flex-col items-center`}
                  >
                    <div className={`text-${stat.colorScheme} text-4xl font-bold`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-600">
                      {stat.statType.replace('_', ' ').charAt(0).toUpperCase() + 
                       stat.statType.replace('_', ' ').slice(1)} 
                      {stat.unit && ` (${stat.unit})`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 text-dark-text dark:text-gray-100">Health Summary</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Based on your connected health data, genetic profile, and family history, we've identified several key health insights:
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start space-x-2">
                    <i className="ri-alert-line text-danger mt-1"></i>
                    <span className="dark:text-gray-200">Zinc deficiency detected - may impact immune function and wound healing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-500 mt-1"></i>
                    <span className="dark:text-gray-200">Sleep quality is good but could be optimized for better recovery</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-line text-primary mt-1"></i>
                    <span className="dark:text-gray-200">Heart rate and cardiovascular metrics within healthy range</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 text-dark-text dark:text-gray-100">Medication Schedule</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <MedicationTracker />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4 text-dark-text dark:text-gray-100">Connected Data Sources</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <i className="ri-heart-pulse-line text-primary"></i>
                      <span className="font-medium dark:text-gray-200">Health App</span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <i className="ri-dna-line text-blue-500"></i>
                      <span className="font-medium dark:text-gray-200">DNA Testing Service</span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <i className="ri-parent-line text-amber-500"></i>
                      <span className="font-medium dark:text-gray-200">Family Tree Service</span>
                    </div>
                    <button className="text-sm text-primary hover:text-secondary">Connect</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "progress-badges" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-dark-text dark:text-white">Progress & Achievements</h2>
              
              {progressLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your progress...</p>
                </div>
              ) : progressData ? (
                <ProgressBadges
                  streaks={progressData.streaks}
                  improvements={progressData.improvements}
                  achievements={progressData.achievements}
                  healthScore={progressData.healthScore}
                  previousHealthScore={progressData.previousHealthScore}
                />
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-500 dark:text-gray-400">
                    <i className="ri-trophy-line text-4xl mb-4 block"></i>
                    <p>Start tracking your health goals to see progress and earn achievements!</p>
                    <Button className="mt-4" onClick={() => setActiveTab("health-data")}>
                      Connect Health Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "family-connections" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-heading font-semibold text-dark-text dark:text-white">Family & Friends</h2>
                <button className="text-primary hover:text-secondary flex items-center space-x-1">
                  <i className="ri-user-add-line"></i>
                  <span>Add Connection</span>
                </button>
              </div>
              
              {connectionsLoading ? (
                <div className="text-center py-10">Loading connections...</div>
              ) : connections && connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((connection, index) => (
                    <ConnectionCard 
                      key={index}
                      connection={connection.connection}
                      relationship={connection.relationship}
                      specific={connection.specific}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">You don't have any connections yet.</p>
                  <Button variant="outline">Add Your First Connection</Button>
                </div>
              )}
              
              {connections && connections.length > 0 && (
                <div className="mt-6 text-center">
                  <button className="text-primary hover:text-secondary font-medium">
                    View All Connections
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "health-data" && (
            <div className="space-y-6">
<<<<<<< HEAD
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-heading font-semibold text-dark-text dark:text-white">Health Data</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <i className="ri-refresh-line mr-1"></i> Sync Devices
                      </Button>
                      <Button size="sm">
                        <i className="ri-add-line mr-1"></i> Connect Device
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your comprehensive health dashboard with data from Apple Watch, Whoop Strap, and medical records.
                  </p>
                </div>
                
                {/* Enhanced Dashboard Component */}
                <div className="mt-8">
                  <HealthDashboard />
                </div>
=======
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-heading font-semibold mb-6">Health Data</h2>
                <p className="text-gray-600 mb-4">
                  Connect and manage your health data from various sources.
                </p>
                <HealthStats userId={user.id} detailed={true} />
                <div className="mt-8">
                  <HealthVisualization />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GoalTracker />
                <MedicationTracker />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <FamilyTree />
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
              </div>
            </div>
          )}

          {activeTab === "genetic-profile" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 dark:border dark:border-gray-700">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-dark-text dark:text-white">Genetic Profile</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect your genetic testing data to gain insights into your health.
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <i className="ri-information-line text-amber-500 dark:text-amber-400 text-xl mt-1 mr-2"></i>
                  <div>
                    <h3 className="font-medium text-amber-800 dark:text-amber-300">DNA Testing Not Connected</h3>
                    <p className="text-amber-700 dark:text-amber-200 text-sm">
                      Connect your DNA testing service to unlock genetic insights and personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary-400 transition-colors duration-200 dark:bg-gray-800/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="ri-dna-line text-primary dark:text-primary-400 text-2xl"></i>
                    <h3 className="font-medium dark:text-white">23andMe</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Connect your 23andMe genetic test results for detailed health insights.
                  </p>
                  <button className="w-full bg-primary dark:bg-primary-600 text-white py-2 rounded-md hover:bg-secondary dark:hover:bg-primary-500 transition-colors duration-200">
                    Connect
                  </button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary-400 transition-colors duration-200 dark:bg-gray-800/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="ri-dna-line text-primary dark:text-primary-400 text-2xl"></i>
                    <h3 className="font-medium dark:text-white">AncestryDNA</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Import your AncestryDNA test results to enhance your health profile.
                  </p>
                  <button className="w-full bg-primary dark:bg-primary-600 text-white py-2 rounded-md hover:bg-secondary dark:hover:bg-primary-500 transition-colors duration-200">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "neural-profile" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-heading font-semibold text-dark-text dark:text-white">Neural Profile</h2>
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-600">Medical Record</Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your comprehensive neurological profile provides insights into brain activity patterns, 
                  seizure history, cognitive assessments, and personalized treatment recommendations.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-6 dark:border dark:border-gray-700">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium dark:text-white">John Doe</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Age at Record</p>
                      <p className="font-medium dark:text-white">42</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Record Date</p>
                      <p className="font-medium dark:text-white">April 1, 2025</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Health Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2 dark:bg-gray-700 dark:text-gray-200">Zinc Deficiency</Badge>
                        <span className="text-red-500 dark:text-red-400 font-medium">Present</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Confirmed by blood tests</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2 dark:bg-gray-700 dark:text-gray-200">Sleep Quality</Badge>
                        <span className="text-amber-500 dark:text-amber-400 font-medium">Suboptimal</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Type: Good but suboptimal</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Average: 7.8 hours per night, occasional disruptions</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2 dark:bg-gray-700 dark:text-gray-200">Migraines</Badge>
                        <span className="text-green-500 dark:text-green-400 font-medium">Not Present</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">No history of migraines</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2 dark:bg-gray-700 dark:text-gray-200">Headaches</Badge>
                        <span className="text-amber-500 dark:text-amber-400 font-medium">Occasional</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Occasional headaches related to stress</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Diagnostic Tests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2 dark:bg-gray-700 dark:text-gray-200">Blood Work</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Low zinc levels (65 μg/dL, normal range: 70-120 μg/dL)</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2 dark:bg-gray-700 dark:text-gray-200">Sleep Study</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Normal sleep architecture, minor disruptions during REM cycles</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Treatment Plan</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium mb-2 dark:text-white">Medications</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="w-1/3 text-gray-600 dark:text-gray-400">Zinc Supplement</span>
                          <span className="text-gray-800 dark:text-gray-200">50mg daily - Treat zinc deficiency</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1/3 text-gray-600 dark:text-gray-400">Vitamin D3</span>
                          <span className="text-gray-800 dark:text-gray-200">2000 IU daily - Support immune function</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1/3 text-gray-600 dark:text-gray-400">Magnesium Glycinate</span>
                          <span className="text-gray-800 dark:text-gray-200">200mg before bedtime - Improve sleep quality</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium mb-2 dark:text-white">Referrals</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <i className="ri-arrow-right-line text-primary dark:text-primary-400 mr-2"></i>
                          <span className="dark:text-gray-200">Nutritional counseling</span>
                        </li>
                        <li className="flex items-center">
                          <i className="ri-arrow-right-line text-primary dark:text-primary-400 mr-2"></i>
                          <span className="dark:text-gray-200">Sleep optimization program</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Social Health Impact</h3>
                  <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="font-medium mb-1 dark:text-white">Impact on Daily Life</h4>
                        <p className="text-gray-600 dark:text-gray-300">Mild fatigue and reduced immune function affect work productivity and exercise capacity</p>
                      </div>
                      <Separator className="dark:bg-gray-700" />
                      <div>
                        <h4 className="font-medium mb-1 dark:text-white">Support Network</h4>
                        <p className="text-gray-600 dark:text-gray-300">Family, health coach, online health communities</p>
                      </div>
                      <Separator className="dark:bg-gray-700" />
                      <div>
                        <h4 className="font-medium mb-1 dark:text-white">Self Management</h4>
                        <p className="text-gray-600 dark:text-gray-300">Regular nutritional tracking, sleep monitoring with Whoop strap, Apple Watch health metrics tracking</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Wearable Device Integration</h3>
                  <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 dark:text-white">Connected Devices</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li className="text-gray-600 dark:text-gray-300">Apple Watch Series 9</li>
                          <li className="text-gray-600 dark:text-gray-300">Whoop Strap 4.0</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 dark:text-white">Metrics Tracked</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li className="text-gray-600 dark:text-gray-300">Heart rate variability</li>
                          <li className="text-gray-600 dark:text-gray-300">Sleep quality and stages</li>
                          <li className="text-gray-600 dark:text-gray-300">Recovery scores</li>
                          <li className="text-gray-600 dark:text-gray-300">Activity levels</li>
                          <li className="text-gray-600 dark:text-gray-300">Respiration rate</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium mb-2 dark:text-white">Integration Status</h4>
                      <div className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-300 mr-2">Fully connected and synchronized daily</span>
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Interactive Neural Profile</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Access the interactive neural profile visualization with more detailed analysis below:
                  </p>
                  <StreamlitEmbed />
                </div>
              </div>
            </div>
          )}

          {activeTab === "connected-services" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-heading font-semibold text-dark-text dark:text-white">Connected Services</h2>
                  <Link href="/integrations" className="flex items-center space-x-1 text-primary hover:text-primary-600 transition-colors">
                    <i className="ri-add-line"></i>
                    <span>Connect New Service</span>
                  </Link>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Manage your connected health and fitness platforms. Data from these services enhances your health insights and recommendations.
                </p>
                
                <div className="space-y-4">
                  {/* Apple Health */}
                  <Card className="overflow-hidden dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 flex items-center justify-center">
                            <i className="ri-apple-fill text-xl text-black dark:text-white"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-medium">Apple Health</CardTitle>
                            <CardDescription>Syncing activity, sleep, and vitals</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last synced</p>
                            <p className="font-medium dark:text-gray-200">Today, 2:45 PM</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Data points</p>
                            <p className="font-medium dark:text-gray-200">24,521</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Connected since</p>
                            <p className="font-medium dark:text-gray-200">Oct 12, 2024</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="text-gray-500 hover:text-primary dark:text-gray-400">
                            <i className="ri-refresh-line text-lg"></i>
                          </button>
                          <div className="flex items-center">
                            <Switch id="apple-auto-sync" defaultChecked />
                            <label htmlFor="apple-auto-sync" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Auto-sync
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fitbit */}
                  <Card className="overflow-hidden dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-2 flex items-center justify-center">
                            <i className="ri-heart-pulse-line text-xl text-blue-500 dark:text-blue-400"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-medium">Fitbit</CardTitle>
                            <CardDescription>Tracking activity and sleep metrics</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last synced</p>
                            <p className="font-medium dark:text-gray-200">Yesterday, 8:30 PM</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Data points</p>
                            <p className="font-medium dark:text-gray-200">12,879</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Connected since</p>
                            <p className="font-medium dark:text-gray-200">Sep 5, 2024</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="text-gray-500 hover:text-primary dark:text-gray-400">
                            <i className="ri-refresh-line text-lg"></i>
                          </button>
                          <div className="flex items-center">
                            <Switch id="fitbit-auto-sync" defaultChecked />
                            <label htmlFor="fitbit-auto-sync" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Auto-sync
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Oura Ring */}
                  <Card className="overflow-hidden dark:border-gray-700">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-full p-2 flex items-center justify-center">
                            <i className="ri-fingerprint-line text-xl text-purple-500 dark:text-purple-400"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-medium">Oura Ring</CardTitle>
                            <CardDescription>Sleep and recovery data</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Last synced</p>
                            <p className="font-medium dark:text-gray-200">Today, 7:15 AM</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Data points</p>
                            <p className="font-medium dark:text-gray-200">8,413</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Connected since</p>
                            <p className="font-medium dark:text-gray-200">Jan 18, 2025</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="text-gray-500 hover:text-primary dark:text-gray-400">
                            <i className="ri-refresh-line text-lg"></i>
                          </button>
                          <div className="flex items-center">
                            <Switch id="oura-auto-sync" defaultChecked />
                            <label htmlFor="oura-auto-sync" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Auto-sync
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connect More */}
                  <div className="mt-6 text-center">
                    <Link href="/integrations" className="inline-flex items-center justify-center space-x-2 text-primary hover:text-primary-600 font-medium">
                      <i className="ri-add-circle-line text-lg"></i>
                      <span>Connect More Health Services</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-dark-text dark:text-white">Settings</h2>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h3 className="text-lg font-medium mb-4 text-dark-text dark:text-gray-100">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      readOnly
                    />
                  </div>
                </div>
                <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-200">
                  Edit Account Information
                </button>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h3 className="text-lg font-medium mb-4 text-dark-text dark:text-gray-100">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium dark:text-gray-200">Share Health Data with Family</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow family members to see your basic health data</p>
                    </div>
                    <button className="bg-gray-200 dark:bg-gray-600 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium dark:text-gray-200">Public Profile</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible to other users</p>
                    </div>
                    <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium dark:text-gray-200">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates about health insights</p>
                    </div>
                    <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-dark-text dark:text-gray-100">Danger Zone</h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="bg-white dark:bg-transparent text-red-600 border border-red-600 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
