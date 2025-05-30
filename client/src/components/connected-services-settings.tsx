import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ConnectedService {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  dataTypes: string[];
}

export default function ConnectedServicesSettings() {
  const { toast } = useToast();
  const [services, setServices] = useState<ConnectedService[]>([
    {
      id: 'health-app',
      name: 'Health App',
      description: 'Sync steps, heart rate, and activity data',
      icon: 'ri-heart-pulse-line',
      connected: true,
      lastSync: '2024-05-30T14:30:00Z',
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Exercise']
    },
    {
      id: 'dna-service',
      name: 'DNA Testing Service',
      description: 'Import genetic risk factors and health insights',
      icon: 'ri-dna-line',
      connected: true,
      lastSync: '2024-05-29T09:15:00Z',
      dataTypes: ['Genetic Risks', 'Drug Metabolism', 'Ancestry']
    },
    {
      id: 'family-tree',
      name: 'Family Tree Service',
      description: 'Connect family health history and hereditary conditions',
      icon: 'ri-parent-line',
      connected: false,
      dataTypes: ['Family History', 'Hereditary Conditions', 'Medical Records']
    },
    {
      id: 'fitness-tracker',
      name: 'Fitness Tracker',
      description: 'Sync workout data and fitness metrics',
      icon: 'ri-run-line',
      connected: false,
      dataTypes: ['Workouts', 'Calories', 'Distance', 'Active Minutes']
    },
    {
      id: 'nutrition-app',
      name: 'Nutrition Tracker',
      description: 'Import meal logs and nutritional data',
      icon: 'ri-restaurant-line',
      connected: false,
      dataTypes: ['Meals', 'Calories', 'Macros', 'Micronutrients']
    }
  ]);

  const toggleConnection = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { 
            ...s, 
            connected: !s.connected,
            lastSync: !s.connected ? new Date().toISOString() : undefined
          }
        : s
    ));

    toast({
      title: service.connected ? "Service Disconnected" : "Service Connected",
      description: service.connected 
        ? `${service.name} has been disconnected from your account.`
        : `${service.name} is now connected and syncing data.`,
    });
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionStatus = (connected: boolean) => {
    return connected 
      ? { label: 'Connected', color: 'bg-green-100 text-green-800 border-green-200' }
      : { label: 'Disconnected', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
          Connected Services
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your health data connections and sync preferences
        </p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => {
          const status = getConnectionStatus(service.connected);
          
          return (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                        <i className={`${service.icon} text-xl text-primary`}></i>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {service.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.dataTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      {service.connected && service.lastSync && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last synced: {formatLastSync(service.lastSync)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={service.connected}
                      onCheckedChange={() => toggleConnection(service.id)}
                    />
                    
                    {service.connected && (
                      <Button variant="outline" size="sm">
                        <i className="ri-refresh-line mr-2"></i>
                        Sync Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="ri-shield-check-line text-primary"></i>
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Encryption</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All health data is encrypted in transit and at rest
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Enabled
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Sharing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control how your health data is shared with third parties
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Export</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download a copy of all your health data
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}