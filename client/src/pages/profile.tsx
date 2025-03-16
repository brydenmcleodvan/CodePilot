import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import HealthStats from "@/components/health-stats";
import ConnectionCard from "@/components/connection-card";

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

  if (!user) {
    return null; // Return nothing until redirect happens
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-24">
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
                  onClick={() => setActiveTab("overview")}
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
                  onClick={() => setActiveTab("health-data")}
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
                  onClick={() => setActiveTab("genetic-profile")}
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
        <div className="md:w-2/3 lg:w-3/4">
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
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Health Data</h2>
              <p className="text-gray-600 mb-4">
                Connect and manage your health data from various sources.
              </p>
              
              <HealthStats userId={user.id} detailed={true} />
            </div>
          )}

          {activeTab === "genetic-profile" && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Genetic Profile</h2>
              <p className="text-gray-600 mb-4">
                Connect your genetic testing data to gain insights into your health.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <i className="ri-information-line text-amber-500 text-xl mt-1 mr-2"></i>
                  <div>
                    <h3 className="font-medium text-amber-800">DNA Testing Not Connected</h3>
                    <p className="text-amber-700 text-sm">
                      Connect your DNA testing service to unlock genetic insights and personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="ri-dna-line text-primary text-2xl"></i>
                    <h3 className="font-medium">23andMe</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Connect your 23andMe genetic test results for detailed health insights.
                  </p>
                  <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition-colors duration-200">
                    Connect
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="ri-dna-line text-primary text-2xl"></i>
                    <h3 className="font-medium">AncestryDNA</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Import your AncestryDNA test results to enhance your health profile.
                  </p>
                  <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition-colors duration-200">
                    Connect
                  </button>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
