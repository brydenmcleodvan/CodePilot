import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { getSkipToContentProps } from "@/lib/accessibility";
import { ResponsiveContainer, ResponsiveSection, ResponsiveGrid } from "@/components/layout/responsive-container";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

// Icons for each service
const serviceIcons = {
  "apple": "ri-apple-fill",
  "fitbit": "ri-watch-line",
  "garmin": "ri-watch-line",
  "whoop": "ri-heart-pulse-line",
  "oura": "ri-fingerprint-line",
  "myfitnesspal": "ri-restaurant-line",
  "google": "ri-google-fill",
  "stripe": "ri-bank-card-line",
  "buymeacoffee": "ri-cup-line",
  "strava": "ri-run-line",
  "withings": "ri-scales-3-line",
  "peloton": "ri-bike-line",
  "polar": "ri-heart-pulse-line"
};

// Integration services with details
const healthServices = [
  {
    id: "apple",
    name: "Apple Health",
    description: "Sync your Apple Health data including workouts, steps, heart rate, and more.",
    icon: "ri-apple-fill",
    category: "activity",
    isPopular: true,
    connected: false
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description: "Connect your Fitbit device to sync activities, sleep tracking, and heart rate data.",
    icon: "ri-watch-line",
    category: "activity",
    isPopular: true,
    connected: false
  },
  {
    id: "garmin",
    name: "Garmin",
    description: "Import your Garmin Connect data including workouts, body metrics, and sleep.",
    icon: "ri-watch-line",
    category: "activity",
    isPopular: false,
    connected: false
  },
  {
    id: "whoop",
    name: "Whoop",
    description: "Sync recovery, strain, and sleep data from your Whoop strap.",
    icon: "ri-heart-pulse-line",
    category: "activity",
    isPopular: false,
    connected: false
  },
  {
    id: "oura",
    name: "Oura Ring",
    description: "Import sleep quality, readiness, and activity data from your Oura Ring.",
    icon: "ri-fingerprint-line", 
    category: "activity",
    isPopular: true,
    connected: false
  },
  {
    id: "myfitnesspal",
    name: "MyFitnessPal",
    description: "Sync your nutrition and calorie tracking data from MyFitnessPal.",
    icon: "ri-restaurant-line",
    category: "nutrition",
    isPopular: true,
    connected: false
  },
  {
    id: "strava",
    name: "Strava",
    description: "Connect your Strava account to import runs, rides, and other activities.",
    icon: "ri-run-line",
    category: "activity",
    isPopular: true,
    connected: false
  },
  {
    id: "withings",
    name: "Withings",
    description: "Sync weight, body composition, and other metrics from Withings devices.",
    icon: "ri-scales-3-line",
    category: "metrics",
    isPopular: false,
    connected: false
  },
  {
    id: "peloton",
    name: "Peloton",
    description: "Import your Peloton workouts and fitness metrics.",
    icon: "ri-bike-line",
    category: "activity",
    isPopular: false,
    connected: false
  },
  {
    id: "polar",
    name: "Polar",
    description: "Connect your Polar device to sync heart rate, training load, and recovery.",
    icon: "ri-heart-pulse-line",
    category: "activity",
    isPopular: false,
    connected: false
  }
];

export default function IntegrationsPage() {
  const [services, setServices] = useState(healthServices);
  const [localStorageEnabled, setLocalStorageEnabled] = useState(
    localStorage.getItem("healthfolioOfflineMode") === "enabled"
  );
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock connection handler - in a real app this would initiate OAuth flow
  const handleConnect = (serviceId: string) => {
    // This would typically redirect to OAuth flow
    setTimeout(() => {
      setServices(services.map(service => 
        service.id === serviceId ? { ...service, connected: true } : service
      ));
      
      toast({
        title: "Integration Connected",
        description: `Successfully connected to ${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)}`,
        variant: "default",
      });
      
      // In a real app, we would save this connection to the user's profile
    }, 1000);
  };

  // Mock disconnect handler
  const handleDisconnect = (serviceId: string) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, connected: false } : service
    ));
    
    toast({
      title: "Integration Disconnected",
      description: `Disconnected from ${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)}`,
      variant: "default",
    });
  };

  // Toggle localStorage/offline mode
  const toggleOfflineMode = (enabled: boolean) => {
    setLocalStorageEnabled(enabled);
    if (enabled) {
      localStorage.setItem("healthfolioOfflineMode", "enabled");
      toast({
        title: "Offline Mode Enabled",
        description: "Your data will be stored locally for offline access",
        variant: "default",
      });
    } else {
      localStorage.setItem("healthfolioOfflineMode", "disabled");
      toast({
        title: "Offline Mode Disabled",
        description: "Your data will only be accessible while online",
        variant: "default",
      });
    }
  };

  return (
    <>
      {/* Accessibility: Skip to content link */}
      <a {...getSkipToContentProps("main-content")} />
      
      <main id="main-content" className="pb-12">
        <ResponsiveSection>
          <ResponsiveContainer>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gray-900 dark:text-white">
                Integrations & Services
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                Connect your favorite health apps and devices to create a complete picture of your health journey. Your data remains private and secure.
              </p>
            </div>

            <Tabs defaultValue="health" className="w-full">
              <div className="mb-6">
                <TabsList className="grid grid-cols-4 md:w-[600px] w-full">
                  <TabsTrigger value="health">Health Trackers</TabsTrigger>
                  <TabsTrigger value="login">Login Options</TabsTrigger>
                  <TabsTrigger value="storage">Data Storage</TabsTrigger>
                  <TabsTrigger value="support">Tip Jar</TabsTrigger>
                </TabsList>
              </div>

              {/* Health Trackers Tab */}
              <TabsContent value="health" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Popular Integrations</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Connect your existing health and fitness apps to import your data
                      </p>
                      
                      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }} gap="gap-6">
                        {services
                          .filter(service => service.isPopular)
                          .map(service => (
                            <Card key={service.id} className="hover:shadow-md transition-shadow duration-300">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 rounded-full items-center justify-center bg-primary/10 text-primary`}>
                                      <i className={`${service.icon} text-2xl`} aria-hidden="true"></i>
                                    </div>
                                    <CardTitle className="text-lg">{service.name}</CardTitle>
                                  </div>
                                  {service.connected && (
                                    <div className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300 rounded-full">
                                      Connected
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <CardDescription>{service.description}</CardDescription>
                              </CardContent>
                              <CardFooter>
                                {!service.connected ? (
                                  <Button 
                                    onClick={() => handleConnect(service.id)}
                                    variant="default"
                                    className="w-full"
                                  >
                                    Connect
                                  </Button>
                                ) : (
                                  <Button 
                                    onClick={() => handleDisconnect(service.id)}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    Disconnect
                                  </Button>
                                )}
                              </CardFooter>
                            </Card>
                          ))}
                      </ResponsiveGrid>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-2">All Integrations</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Browse all available health and fitness service integrations
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map(service => (
                          <div 
                            key={service.id} 
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-700 text-primary`}>
                                <i className={`${service.icon} text-xl`} aria-hidden="true"></i>
                              </div>
                              <div>
                                <h3 className="font-medium">{service.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {service.connected ? "Connected" : "Not connected"}
                                </p>
                              </div>
                            </div>
                            {!service.connected ? (
                              <Button 
                                onClick={() => handleConnect(service.id)}
                                variant="outline"
                                size="sm"
                              >
                                Connect
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleDisconnect(service.id)}
                                variant="ghost"
                                size="sm"
                              >
                                Disconnect
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Login Options Tab */}
              <TabsContent value="login" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">OAuth Login Options</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Connect these services to enable single sign-on for quicker access to your account
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 rounded-full items-center justify-center bg-red-100 text-red-600">
                                <i className="ri-google-fill text-2xl" aria-hidden="true"></i>
                              </div>
                              <CardTitle className="text-lg">Google Sign-In</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <CardDescription>
                              Sign in with your Google account for seamless access to your health data.
                            </CardDescription>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full"
                              onClick={() => {
                                toast({
                                  title: "Google Sign-In",
                                  description: "This would initiate Google OAuth in a production environment",
                                });
                              }}
                            >
                              Connect Google
                            </Button>
                          </CardFooter>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 rounded-full items-center justify-center bg-gray-100 text-black">
                                <i className="ri-apple-fill text-2xl" aria-hidden="true"></i>
                              </div>
                              <CardTitle className="text-lg">Apple Sign-In</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <CardDescription>
                              Use your Apple ID to quickly and securely access your Healthfolio account.
                            </CardDescription>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full border-gray-800 text-gray-800 dark:text-white hover:bg-gray-100"
                              onClick={() => {
                                toast({
                                  title: "Apple Sign-In",
                                  description: "This would initiate Apple OAuth in a production environment",
                                });
                              }}
                            >
                              Connect Apple ID
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-2">Account Security</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Additional security options for your Healthfolio account
                      </p>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Two-Factor Authentication</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Add an extra layer of security to your account
                                </p>
                              </div>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "2FA Setup",
                                    description: "Two-factor authentication setup would be initiated here",
                                  });
                                }}
                              >
                                Setup 2FA
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Password Recovery Email</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user?.email || "Add an email for account recovery"}
                                </p>
                              </div>
                              <Button 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Recovery Email",
                                    description: "Email update form would open here",
                                  });
                                }}
                              >
                                Update
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Storage Tab */}
              <TabsContent value="storage" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Local Data Storage</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Configure how your health data is stored and accessed on this device
                      </p>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Offline Mode</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Store your data locally for access without an internet connection
                                </p>
                              </div>
                              <Switch 
                                checked={localStorageEnabled} 
                                onCheckedChange={toggleOfflineMode}
                                aria-label="Toggle offline mode"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">IndexedDB Storage</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Use browser database for larger data storage needs
                                </p>
                              </div>
                              <Switch 
                                checked={false} 
                                onCheckedChange={(checked) => {
                                  toast({
                                    title: checked ? "IndexedDB Enabled" : "IndexedDB Disabled",
                                    description: checked ? 
                                      "Your data will be stored in the browser database" : 
                                      "IndexedDB storage has been disabled",
                                  });
                                }}
                                aria-label="Toggle IndexedDB storage"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Data Backup</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Export your health data as a downloadable file
                                </p>
                              </div>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Data Export",
                                    description: "Your health data would be exported here",
                                  });
                                }}
                              >
                                Export Data
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-2">Storage Management</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Manage your data storage and clear cached information
                      </p>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-1">Local Storage Usage</h3>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: '10%' }}></div>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Using 0.5 MB of 5 MB (10%)
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Cache Cleared",
                                    description: "Your cached data has been cleared",
                                  });
                                }}
                              >
                                Clear Cache
                              </Button>
                              
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Preference Reset",
                                    description: "Your local preferences have been reset to default",
                                  });
                                }}
                              >
                                Reset Preferences
                              </Button>
                              
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  toast({
                                    title: "Warning",
                                    description: "This would delete all locally stored data",
                                    variant: "destructive",
                                  });
                                }}
                              >
                                Delete All Data
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tip Jar Tab */}
              <TabsContent value="support" className="mt-0">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Support Healthfolio</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Help us continue to provide the best health tracking experience
                      </p>
                      
                      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-800 dark:to-gray-900 border-0">
                        <CardContent className="pt-6">
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
                              <i className="ri-heart-fill text-3xl" aria-hidden="true"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tip Jar</h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                              If you're enjoying Healthfolio, consider supporting our team with a small contribution.
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                            <Button
                              variant="outline"
                              className="bg-white dark:bg-gray-800"
                              onClick={() => {
                                toast({
                                  title: "Stripe",
                                  description: "This would open Stripe payment in production",
                                });
                              }}
                            >
                              <i className="ri-bank-card-line mr-2"></i>
                              Support with Stripe
                            </Button>
                            
                            <Button
                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                              onClick={() => {
                                toast({
                                  title: "Buy Me A Coffee",
                                  description: "This would redirect to BuyMeACoffee in production",
                                });
                              }}
                            >
                              <i className="ri-cup-line mr-2"></i>
                              Buy Me A Coffee
                            </Button>
                          </div>
                          
                          <div className="text-center">
                            <h4 className="font-medium mb-3">Choose an amount</h4>
                            <div className="flex flex-wrap justify-center gap-3 mb-4">
                              {[5, 10, 20, 50].map(amount => (
                                <Button
                                  key={amount}
                                  variant="outline"
                                  size="sm"
                                  className="w-20 bg-white dark:bg-gray-800"
                                  onClick={() => {
                                    toast({
                                      title: `$${amount} Selected`,
                                      description: "Thank you for your support!",
                                    });
                                  }}
                                >
                                  ${amount}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-20 bg-white dark:bg-gray-800"
                                onClick={() => {
                                  toast({
                                    title: "Custom Amount",
                                    description: "You would be able to enter a custom amount here",
                                  });
                                }}
                              >
                                Custom
                              </Button>
                            </div>
                            
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Your support helps us add new features and improve Healthfolio!
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-2">Supporter Benefits</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Exclusive perks for our valued supporters
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="hover:shadow-md transition-all">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <i className="ri-vip-crown-line text-amber-500"></i>
                              Ad-Free Experience
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              Enjoy Healthfolio without any advertisements or promotions.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="hover:shadow-md transition-all">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <i className="ri-brush-line text-purple-500"></i>
                              Custom Themes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              Access exclusive color schemes and personalization options.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="hover:shadow-md transition-all">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <i className="ri-rocket-line text-blue-500"></i>
                              Early Features
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              Be the first to try new features before they're widely released.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ResponsiveContainer>
        </ResponsiveSection>
      </main>
    </>
  );
}