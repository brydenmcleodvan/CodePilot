import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  HealthService, 
  healthServiceConfig, 
  ConnectedService,
  connectHealthService,
  getConnectedServices,
  disconnectHealthService,
  syncHealthService
} from "@/lib/health-api-integration";

export default function IntegrationsPage() {
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingService, setSyncingService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"connected" | "available">("connected");
  const { toast } = useToast();

  // Fetch connected services on component mount
  useEffect(() => {
    const services = getConnectedServices();
    setConnectedServices(services);
    setIsLoading(false);
  }, []);

  // Get available services (services that are not connected)
  const getAvailableServices = () => {
    const connectedServiceTypes = connectedServices.map(service => service.service);
    return Object.values(HealthService).filter(
      service => !connectedServiceTypes.includes(service)
    );
  };

  // Connect to a health service
  const handleConnect = async (service: HealthService) => {
    try {
      await connectHealthService(service);
      // The actual connection happens through OAuth redirect
      // We don't need to update the state here as the page will reload
    } catch (error) {
      console.error(`Error connecting to ${service}:`, error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect service",
        variant: "destructive",
      });
    }
  };

  // Disconnect a health service
  const handleDisconnect = (serviceId: string, serviceName: string) => {
    try {
      const success = disconnectHealthService(serviceId);
      
      if (success) {
        // Update the state to remove the disconnected service
        setConnectedServices(prevServices => 
          prevServices.filter(service => service.id !== serviceId)
        );
        
        toast({
          title: "Service Disconnected",
          description: `Successfully disconnected from ${serviceName}`,
        });
      } else {
        throw new Error("Failed to disconnect service");
      }
    } catch (error) {
      console.error(`Error disconnecting service ${serviceId}:`, error);
      toast({
        title: "Disconnection Error",
        description: error instanceof Error ? error.message : "Failed to disconnect service",
        variant: "destructive",
      });
    }
  };

  // Sync a health service
  const handleSync = async (serviceId: string, serviceName: string) => {
    try {
      setSyncingService(serviceId);
      
      const success = await syncHealthService(serviceId);
      
      if (success) {
        // Refresh the connected services
        const updatedServices = getConnectedServices();
        setConnectedServices(updatedServices);
        
        toast({
          title: "Sync Complete",
          description: `Successfully synced data from ${serviceName}`,
        });
      } else {
        throw new Error("Failed to sync service data");
      }
    } catch (error) {
      console.error(`Error syncing service ${serviceId}:`, error);
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Failed to sync service data",
        variant: "destructive",
      });
    } finally {
      setSyncingService(null);
    }
  };

  // Format relative time for last synced
  const formatLastSynced = (date: Date | null): string => {
    if (!date) return "Never";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  };

  // Format data points number
  const formatDataPoints = (points: number): string => {
    if (points === 0) return "No data";
    if (points < 1000) return `${points} points`;
    if (points < 1000000) return `${(points / 1000).toFixed(1)}K points`;
    return `${(points / 1000000).toFixed(1)}M points`;
  };

  // Get service configuration by type
  const getServiceConfig = (serviceType: HealthService) => {
    return healthServiceConfig[serviceType];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-white mb-2">Health Integrations</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your health apps and wearables to enhance your health insights.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/profile#connected-services">
              <Button variant="outline" className="mr-2">
                <i className="ri-user-line mr-2"></i>
                View in Profile
              </Button>
            </Link>
          </div>
        </div>

        <Tabs 
          defaultValue="connected" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "connected" | "available")}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="connected" className="text-sm md:text-base">
              Connected Services
              {connectedServices.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400">
                  {connectedServices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="available" className="text-sm md:text-base">
              Available Services
              <Badge variant="outline" className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                {getAvailableServices().length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connected" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : connectedServices.length === 0 ? (
              <Card className="border-dashed border-2 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <i className="ri-link-m text-2xl text-gray-500 dark:text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2 dark:text-white">No Connected Services</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                    Connect your health apps and wearables to get better insights and track your progress.
                  </p>
                  <Button onClick={() => setActiveTab("available")}>
                    Connect Your First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {connectedServices.map((service) => {
                  const config = getServiceConfig(service.service);
                  return (
                    <motion.div 
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden dark:border-gray-700">
                        <CardHeader className={`${config.color} pb-3`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="rounded-full p-2 bg-white dark:bg-gray-800 flex items-center justify-center">
                                <i className={`${config.icon} text-xl`}></i>
                              </div>
                              <div>
                                <CardTitle className="text-lg font-medium">{config.name}</CardTitle>
                                <CardDescription>{service.dataPoints > 0 ? `${formatDataPoints(service.dataPoints)}` : 'No data yet'}</CardDescription>
                              </div>
                            </div>
                            <Badge 
                              className={
                                service.status === "active" 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                                  : service.status === "error"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              }
                            >
                              {service.status === "active" ? "Connected" : service.status === "error" ? "Error" : "Expired"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4">
                          <div className="flex justify-between items-center">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Last synced</p>
                                <p className="font-medium dark:text-gray-200">{formatLastSynced(service.lastSynced)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Connected since</p>
                                <p className="font-medium dark:text-gray-200">
                                  {service.connectedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => handleSync(service.id, config.name)}
                                disabled={syncingService === service.id}
                              >
                                {syncingService === service.id ? (
                                  <>
                                    <i className="ri-loader-2-line animate-spin"></i>
                                    Syncing...
                                  </>
                                ) : (
                                  <>
                                    <i className="ri-refresh-line"></i>
                                    Sync
                                  </>
                                )}
                              </Button>
                              <div className="flex items-center">
                                <Switch id={`auto-sync-${service.id}`} checked={service.autoSync} />
                                <label htmlFor={`auto-sync-${service.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  Auto-sync
                                </label>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 border-t border-gray-100 dark:border-gray-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                            onClick={() => handleDisconnect(service.id, config.name)}
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            Disconnect
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getAvailableServices().map((service) => {
                const config = getServiceConfig(service);
                return (
                  <motion.div 
                    key={service}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="dark:border-gray-700 h-full flex flex-col">
                      <CardHeader className={`${config.color} pb-3`}>
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full p-2 bg-white dark:bg-gray-800 flex items-center justify-center">
                            <i className={`${config.icon} text-xl`}></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-medium">{config.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 flex-grow">
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                          {config.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {config.scopes.map(scope => (
                            <Badge key={scope} variant="outline" className="bg-gray-50 dark:bg-gray-800">
                              {scope.charAt(0).toUpperCase() + scope.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(service)}
                        >
                          <i className="ri-link mr-1"></i>
                          Connect
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-medium mb-4 dark:text-white">About Health Integrations</h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              Connecting your health apps and devices allows Healthmap to provide more personalized insights and a comprehensive view of your health.
            </p>
            <p>
              Your data is securely stored and never shared without your explicit permission. You can disconnect any service at any time.
            </p>
            <p>
              <strong>Note:</strong> For the best experience, enable auto-sync to keep your data up to date automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}