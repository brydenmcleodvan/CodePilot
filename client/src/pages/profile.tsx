import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { getQueryFn } from "@/lib/queryClient";
import { Sun, Coffee, Brain, AlertTriangle, CheckCircle } from "lucide-react";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

const Profile = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch DNA insights data
  const { data: dnaInsights, isLoading: dnaLoading } = useQuery({
    queryKey: ["/api/user/dna"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth/login");
    } else {
      // Track profile page view
      trackEvent(ANALYTICS_EVENTS.PROFILE_VIEWED, { userId: user.id });
    }
  }, [user, setLocation]);

  // Track tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    trackEvent(ANALYTICS_EVENTS.PROFILE_TAB_CHANGED, { 
      tab, 
      userId: user?.id 
    });
    
    // Track specific interactions
    if (tab === "genetic-profile" && dnaInsights) {
      trackEvent(ANALYTICS_EVENTS.DNA_INSIGHTS_VIEWED, { userId: user?.id });
    }
  };

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

  if (!user) {
    return null; // Return nothing until redirect happens
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Profile Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6 lg:sticky lg:top-24">
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt="Profile Picture"
                className="w-24 h-24 rounded-full border-4 border-primary mb-4"
              />
              <h2 className="text-xl font-medium">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <button className="mt-4 w-full bg-white text-primary border border-primary font-medium py-2 rounded-md hover:bg-primary/5 transition-colors duration-200">
                Edit Profile
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <nav className="flex flex-col space-y-2">
                <a
                  href="#profile-overview"
                  onClick={() => handleTabChange("overview")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "overview"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-user-line"></i>
                  <span>Profile Overview</span>
                </a>
                <a
                  href="#health-data"
                  onClick={() => handleTabChange("health-data")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "health-data"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-heart-line"></i>
                  <span>Health Data</span>
                </a>
                <a
                  href="#genetic-profile"
                  onClick={() => handleTabChange("genetic-profile")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "genetic-profile"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
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
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
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
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-brain-line"></i>
                  <span>Neural Profile</span>
                </a>
                <a
                  href="#devices"
                  onClick={() => setActiveTab("devices")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "devices"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-smartphone-line"></i>
                  <span>Connected Devices</span>
                </a>
                <a
                  href="#achievements"
                  onClick={() => setActiveTab("achievements")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "achievements"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-trophy-line"></i>
                  <span>Health Achievements</span>
                </a>
                <a
                  href="#data-sharing"
                  onClick={() => setActiveTab("data-sharing")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "data-sharing"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-share-line"></i>
                  <span>Data Sharing</span>
                </a>
                <a
                  href="#settings"
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    activeTab === "settings"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  }`}
                >
                  <i className="ri-settings-line"></i>
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="lg:w-2/3 xl:w-3/4">
          {activeTab === "overview" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Profile Overview</h2>

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
                <h3 className="text-xl font-medium mb-4">Health Summary</h3>
                <p className="text-gray-600">
                  Based on your connected health data, genetic profile, and family history, we've identified several key health insights:
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start space-x-2">
                    <i className="ri-alert-line text-danger mt-1"></i>
                    <span>Zinc deficiency detected - may impact immune function and wound healing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-500 mt-1"></i>
                    <span>Sleep quality is good but could be optimized for better recovery</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-line text-primary mt-1"></i>
                    <span>Heart rate and cardiovascular metrics within healthy range</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Medication Schedule</h3>
                <div className="bg-white rounded-lg border border-gray-200">
                  <MedicationTracker />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4">Connected Data Sources</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <i className="ri-heart-pulse-line text-primary"></i>
                      <span className="font-medium">Health App</span>
                    </div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <i className="ri-dna-line text-blue-500"></i>
                      <span className="font-medium">DNA Testing Service</span>
                    </div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <i className="ri-parent-line text-amber-500"></i>
                      <span className="font-medium">Family Tree Service</span>
                    </div>
                    <button className="text-sm text-primary hover:text-secondary">Connect</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "family-connections" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-heading font-semibold">Family & Friends</h2>
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
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-heading font-semibold">Health Data</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <i className="ri-refresh-line mr-1"></i> Sync Devices
                      </Button>
                      <Button size="sm">
                        <i className="ri-add-line mr-1"></i> Connect Device
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Your comprehensive health dashboard with data from Apple Watch, Whoop Strap, and medical records.
                  </p>
                </div>
                
                {/* Enhanced Dashboard Component */}
                <div className="mt-8">
                  <HealthDashboard />
                </div>
              </div>
            </div>
          )}

          {activeTab === "genetic-profile" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Genetic Profile</h2>
              <p className="text-gray-600 mb-6">
                Your genetic insights reveal important traits that can guide your health decisions.
              </p>
              
              {dnaLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading DNA insights...</span>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 w-5 h-5 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-green-800">DNA Analysis Complete</h3>
                        <p className="text-green-700 text-sm">
                          Your genetic profile has been analyzed. Review your key traits below.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="border border-orange-200 rounded-lg p-4 md:p-6 bg-orange-50">
                      <div className="flex items-center space-x-3 mb-4">
                        <Sun className="text-orange-500 w-8 h-8" />
                        <div>
                          <h3 className="font-semibold text-orange-800">Vitamin D Levels</h3>
                          <p className="text-sm text-orange-600">Current Status</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-800 mb-2">
                        {dnaInsights?.vitamin_d === "low" ? "Low" : dnaInsights?.vitamin_d}
                      </div>
                      <p className="text-sm text-orange-700">
                        Consider increasing sun exposure and vitamin D supplementation.
                      </p>
                    </div>
                    
                    <div className="border border-brown-200 rounded-lg p-4 md:p-6 bg-amber-50">
                      <div className="flex items-center space-x-3 mb-4">
                        <Coffee className="text-amber-600 w-8 h-8" />
                        <div>
                          <h3 className="font-semibold text-amber-800">Caffeine Metabolism</h3>
                          <p className="text-sm text-amber-600">CYP1A2 Gene</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-amber-800 mb-2">
                        {dnaInsights?.cyp1a2 === "slow caffeine metabolizer" ? "Slow Metabolizer" : dnaInsights?.cyp1a2}
                      </div>
                      <p className="text-sm text-amber-700">
                        Limit caffeine intake, especially in afternoon and evening.
                      </p>
                    </div>
                    
                    <div className="border border-red-200 rounded-lg p-4 md:p-6 bg-red-50">
                      <div className="flex items-center space-x-3 mb-4">
                        <Brain className="text-red-500 w-8 h-8" />
                        <div>
                          <h3 className="font-semibold text-red-800">Alzheimer's Risk</h3>
                          <p className="text-sm text-red-600">APOE4 Gene</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-red-800 mb-2">
                        {dnaInsights?.apoe4 === "risk gene for Alzheimer's" ? "Risk Present" : dnaInsights?.apoe4}
                      </div>
                      <p className="text-sm text-red-700">
                        Focus on brain-healthy lifestyle: exercise, Mediterranean diet, cognitive training.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <AlertTriangle className="text-blue-500 w-5 h-5 mt-1 mr-3" />
                      <div>
                        <h3 className="font-medium text-blue-800">Personalized Recommendations</h3>
                        <p className="text-blue-700 text-sm mt-2">
                          Based on your genetic profile, consider consulting with a healthcare provider about:
                        </p>
                        <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
                          <li>Regular vitamin D testing and appropriate supplementation</li>
                          <li>Optimal caffeine timing and dosage for your metabolism</li>
                          <li>Preventive strategies for cognitive health</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "neural-profile" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-heading font-semibold">Neural Profile</h2>
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Medical Record</Badge>
                </div>
                <p className="text-gray-600 mb-6">
                  Your comprehensive neurological profile provides insights into brain activity patterns, 
                  seizure history, cognitive assessments, and personalized treatment recommendations.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-medium mb-4">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">Patient X</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age at Record</p>
                      <p className="font-medium">17</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Record Date</p>
                      <p className="font-medium">November 28, 2002</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Neurological History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2">Brain Injury</Badge>
                        <span className="text-red-500 font-medium">Positive</span>
                      </div>
                      <p className="text-gray-600 text-sm">Neonatal brain injury documented</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2">Seizures</Badge>
                        <span className="text-red-500 font-medium">Present</span>
                      </div>
                      <p className="text-gray-600 text-sm">Type: Partial complex epilepsy</p>
                      <p className="text-gray-600 text-sm">Frequency: Frequent partial seizures, some progressing to generalized</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2">Migraines</Badge>
                        <span className="text-red-500 font-medium">Present</span>
                      </div>
                      <p className="text-gray-600 text-sm">Documented migraine history</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2">Headaches</Badge>
                        <span className="text-amber-500 font-medium">Fluctuating</span>
                      </div>
                      <p className="text-gray-600 text-sm">Headaches: Fluctuating, occasional</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Diagnostic Tests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2">EEG</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">No consistent epileptiform activity; noted slowing in frontotemporal region</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Badge variant="secondary" className="mr-2">MRI</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">Images provided (axial and sagittal views show brain structure and ventricles)</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Treatment Plan</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Medications</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="w-1/3 text-gray-600">Naprosyn</span>
                          <span className="text-gray-800">Migraine treatment</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-1/3 text-gray-600">Tylenol with codeine</span>
                          <span className="text-gray-800">Pain management</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Referrals</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <i className="ri-arrow-right-line text-primary mr-2"></i>
                          <span>Headache clinic</span>
                        </li>
                        <li className="flex items-center">
                          <i className="ri-arrow-right-line text-primary mr-2"></i>
                          <span>Counseling services</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-4">Social Health Impact</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Impact on Daily Life</h4>
                        <p className="text-gray-600">Seizure and migraine activity may affect social interactions and routines</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-1">Support Network</h4>
                        <p className="text-gray-600">Family, friends, and healthcare providers</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-1">Self Management</h4>
                        <p className="text-gray-600">Regular follow-ups and supportive counseling recommended</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-medium mb-4">Interactive Neural Profile</h3>
                  <p className="text-gray-600 mb-4">
                    Access the interactive neural profile visualization with more detailed analysis below:
                  </p>
                  <StreamlitEmbed />
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Settings</h2>
              
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      readOnly
                    />
                  </div>
                </div>
                <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors duration-200">
                  Edit Account Information
                </button>
              </div>
              
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Share Health Data with Family</h4>
                      <p className="text-sm text-gray-600">Allow family members to see your basic health data</p>
                    </div>
                    <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Public Profile</h4>
                      <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                    </div>
                    <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates about health insights</p>
                    </div>
                    <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-heading font-semibold mb-6">Connected Devices</h2>
                <p className="text-gray-600 mb-6">
                  Manage your health tracking devices and data synchronization settings.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Apple Watch */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                            <i className="ri-apple-line text-white text-xl"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg">Apple Watch Series 8</CardTitle>
                            <p className="text-sm text-gray-600">Connected via HealthKit</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="font-medium">2 minutes ago</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Data Types:</span>
                          <span className="font-medium">Heart Rate, Steps, Sleep</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Configure Sync
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fitbit */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i className="ri-pulse-line text-white text-xl"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg">Fitbit Charge 5</CardTitle>
                            <p className="text-sm text-gray-600">Connected via API</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="font-medium">15 minutes ago</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Data Types:</span>
                          <span className="font-medium">Activity, Stress, SpO2</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Configure Sync
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Smart Scale */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                            <i className="ri-scales-3-line text-white text-xl"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg">Withings Body+</CardTitle>
                            <p className="text-sm text-gray-600">Not connected</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Connect your smart scale to track weight, body composition, and health trends.
                        </p>
                        <Button size="sm" className="w-full">
                          Connect Device
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Blood Pressure Monitor */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                            <i className="ri-heart-pulse-line text-white text-xl"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg">Omron Blood Pressure</CardTitle>
                            <p className="text-sm text-gray-600">Not connected</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Monitor blood pressure trends and cardiovascular health metrics.
                        </p>
                        <Button size="sm" className="w-full">
                          Connect Device
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Add New Device</h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Connect additional health tracking devices to get a comprehensive view of your wellness data.
                  </p>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Browse Compatible Devices
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-heading font-semibold mb-6">Health Achievements</h2>
                <p className="text-gray-600 mb-6">
                  Track your health milestones and celebrate your wellness journey progress.
                </p>

                {/* Achievement Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-700 mb-2">12</div>
                      <div className="text-yellow-600 font-medium">Total Achievements</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-700 mb-2">847</div>
                      <div className="text-green-600 font-medium">Points Earned</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-purple-700 mb-2">23</div>
                      <div className="text-purple-600 font-medium">Day Streak</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Achievements */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Recent Achievements</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-trophy-line text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-800">10K Steps Master</h4>
                        <p className="text-green-700 text-sm">Achieved 10,000+ steps for 7 consecutive days</p>
                        <p className="text-green-600 text-xs">Earned 3 days ago • +50 points</p>
                      </div>
                      <Badge className="bg-green-200 text-green-800">New</Badge>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="ri-heart-line text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800">Heart Health Champion</h4>
                        <p className="text-blue-700 text-sm">Maintained resting heart rate in healthy range</p>
                        <p className="text-blue-600 text-xs">Earned 1 week ago • +75 points</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <i className="ri-moon-line text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-800">Sleep Optimizer</h4>
                        <p className="text-purple-700 text-sm">Consistent 7+ hours sleep for 14 days</p>
                        <p className="text-purple-600 text-xs">Earned 2 weeks ago • +100 points</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Towards Next Achievement */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Progress Towards Next Achievement</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Hydration Hero</span>
                        <span className="text-sm text-gray-600">6/8 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Track water intake for 8 consecutive days</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Meditation Master</span>
                        <span className="text-sm text-gray-600">12/21 sessions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '57%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Complete 21 meditation sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data-sharing" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-heading font-semibold mb-6">Data Sharing Preferences</h2>
                <p className="text-gray-600 mb-6">
                  Control how your health data is shared with healthcare providers, family members, and research initiatives.
                </p>

                {/* Healthcare Providers */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Healthcare Providers</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <i className="ri-user-heart-line text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold">Dr. Sarah Johnson</h4>
                          <p className="text-sm text-gray-600">Primary Care Physician</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <i className="ri-brain-line text-white"></i>
                        </div>
                        <div>
                          <h4 className="font-semibold">Dr. Michael Chen</h4>
                          <p className="text-sm text-gray-600">Neurologist</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Limited Access</Badge>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full border-dashed">
                      <i className="ri-add-line mr-2"></i>
                      Add Healthcare Provider
                    </Button>
                  </div>
                </div>

                {/* Family & Emergency Contacts */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Family & Emergency Contacts</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Share with Emergency Contacts</h4>
                        <p className="text-sm text-gray-600">Allow emergency contacts to access critical health data</p>
                      </div>
                      <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Family Wellness Sharing</h4>
                        <p className="text-sm text-gray-600">Share basic wellness metrics with family members</p>
                      </div>
                      <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white"></span>
                      </button>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">Emergency Contact</h4>
                      <p className="text-sm text-orange-700">Jane Smith (Spouse) - Full emergency access enabled</p>
                    </div>
                  </div>
                </div>

                {/* Research & Analytics */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Research & Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Contribute to Health Research</h4>
                        <p className="text-sm text-gray-600">Share anonymized data for medical research initiatives</p>
                      </div>
                      <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Platform Analytics</h4>
                        <p className="text-sm text-gray-600">Help improve our platform with usage analytics</p>
                      </div>
                      <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Personalized Recommendations</h4>
                        <p className="text-sm text-gray-600">Use data to provide personalized health insights</p>
                      </div>
                      <button className="bg-primary relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white"></span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Export & Control */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Data Control</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <i className="ri-download-line mr-2"></i>
                      Export My Data
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <i className="ri-file-text-line mr-2"></i>
                      View Data Usage Log
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <i className="ri-shield-check-line mr-2"></i>
                      Privacy Policy
                    </Button>
                    <Button variant="outline" className="justify-start text-red-600 border-red-300 hover:bg-red-50">
                      <i className="ri-delete-bin-line mr-2"></i>
                      Delete All Data
                    </Button>
                  </div>
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
