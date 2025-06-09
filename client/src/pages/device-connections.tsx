import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Watch, 
  Activity, 
  Heart, 
  Droplets, 
  Gauge,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DeviceConnection {
  id: string;
  userId: number;
  deviceType: 'apple_watch' | 'oura_ring' | 'whoop' | 'dexcom' | 'qardio';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string | null;
  permissions: string[];
  metadata: {
    deviceName: string;
    capabilities: string[];
    [key: string]: any;
  };
}

const deviceConfig = {
  apple_watch: {
    name: 'Apple Watch',
    icon: Watch,
    color: 'bg-gray-900',
    description: 'Connect your Apple Watch to track heart rate, ECG, blood oxygen, and activity data.',
    capabilities: ['Heart Rate', 'ECG', 'Blood Oxygen', 'Fall Detection', 'AFib History']
  },
  oura_ring: {
    name: 'Oura Ring',
    icon: Activity,
    color: 'bg-blue-600',
    description: 'Track sleep stages, HRV, temperature, and readiness scores from your Oura Ring.',
    capabilities: ['Sleep Stages', 'HRV', 'Temperature', 'Readiness Score']
  },
  whoop: {
    name: 'WHOOP',
    icon: Heart,
    color: 'bg-red-600',
    description: 'Monitor strain score, recovery metrics, and sleep performance with WHOOP.',
    capabilities: ['Strain Score', 'Recovery Score', 'Sleep Performance', 'HRV']
  },
  dexcom: {
    name: 'Dexcom CGM',
    icon: Droplets,
    color: 'bg-orange-600',
    description: 'Real-time blood glucose monitoring with Dexcom continuous glucose monitor.',
    capabilities: ['Real-time Glucose', 'Glucose Trends', 'Alerts']
  },
  qardio: {
    name: 'QardioArm',
    icon: Gauge,
    color: 'bg-green-600',
    description: 'Track blood pressure and heart rhythm with QardioArm blood pressure monitor.',
    capabilities: ['Blood Pressure', 'Pulse', 'Irregular Heartbeat Detection']
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <XCircle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DeviceConnections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery<DeviceConnection[]>({
    queryKey: ['/api/devices/connections'],
  });

  const connectDeviceMutation = useMutation({
    mutationFn: async (deviceType: string) => {
      const response = await apiRequest('POST', `/api/devices/connect/${deviceType}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Device Connection Started',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices/connections'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect device',
        variant: 'destructive',
      });
    },
  });

  const disconnectDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await apiRequest('DELETE', `/api/devices/disconnect/${deviceId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Device Disconnected',
        description: 'Device has been successfully disconnected',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices/connections'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Disconnection Failed',
        description: error.message || 'Failed to disconnect device',
        variant: 'destructive',
      });
    },
  });

  const getDeviceConnection = (deviceType: keyof typeof deviceConfig) => {
    return connections.find(conn => conn.deviceType === deviceType);
  };

  const isDeviceConnected = (deviceType: keyof typeof deviceConfig) => {
    const connection = getDeviceConnection(deviceType);
    return connection?.status === 'connected';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Device Connections</h1>
        <p className="text-gray-600 mt-2">
          Connect your health devices to get comprehensive insights from all your health data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(deviceConfig).map(([deviceType, config]) => {
          const connection = getDeviceConnection(deviceType as keyof typeof deviceConfig);
          const Icon = config.icon;
          
          return (
            <Card key={deviceType} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(connection?.status || 'disconnected')}
                        <Badge className={getStatusColor(connection?.status || 'disconnected')}>
                          {connection?.status || 'Not Connected'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {config.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {config.capabilities.map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>

                {connection && connection.lastSync && (
                  <div>
                    <p className="text-sm text-gray-600">
                      Last sync: {new Date(connection.lastSync).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex space-x-2">
                  {isDeviceConnected(deviceType as keyof typeof deviceConfig) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => connection && disconnectDeviceMutation.mutate(connection.id)}
                      disabled={disconnectDeviceMutation.isPending}
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      onClick={() => connectDeviceMutation.mutate(deviceType)}
                      disabled={connectDeviceMutation.isPending}
                      className="flex-1"
                    >
                      {connection?.status === 'pending' ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Devices Summary</CardTitle>
            <CardDescription>
              Overview of all your connected health devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {connections.filter(conn => conn.status === 'connected').length}
                </div>
                <div className="text-sm text-gray-600">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {connections.filter(conn => conn.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {connections.reduce((total, conn) => total + conn.permissions.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Permissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}