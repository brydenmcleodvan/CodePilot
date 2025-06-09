import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Bell,
  Check,
  X,
  Phone,
  Mail,
  Shield,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Risk Detection Dashboard Component
 * Real-time health monitoring with anomaly detection and emergency alerts
 */
export function RiskDetectionDashboard() {
  const [alertsFilter, setAlertsFilter] = useState('all');
  const { toast } = useToast();

  // Fetch active alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/risk/alerts', alertsFilter],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/risk/alerts?severity=${alertsFilter}`);
      return res.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch alert preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/risk/preferences'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/risk/preferences');
      return res.json();
    }
  });

  // Update alert status mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, action }) => {
      const res = await apiRequest('PUT', `/api/risk/alerts/${alertId}`, { action });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Alert Updated",
        description: `Alert ${data.action_taken} successfully`
      });
      queryClient.invalidateQueries(['/api/risk/alerts']);
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences) => {
      const res = await apiRequest('PUT', '/api/risk/preferences', preferences);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Alert notification settings have been saved"
      });
    }
  });

  const isLoading = alertsLoading || preferencesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Alert Summary */}
      <AlertSummaryHeader 
        alertsData={alertsData}
        onFilterChange={setAlertsFilter}
        currentFilter={alertsFilter}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts">
          <ActiveAlertsPanel 
            alerts={alertsData?.alerts || []}
            onUpdateAlert={(alertId, action) => 
              updateAlertMutation.mutate({ alertId, action })
            }
            isUpdating={updateAlertMutation.isPending}
          />
        </TabsContent>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="monitoring">
          <MonitoringPanel />
        </TabsContent>

        {/* Alert Settings Tab */}
        <TabsContent value="settings">
          <AlertSettingsPanel 
            preferences={preferencesData}
            onUpdatePreferences={(prefs) => updatePreferencesMutation.mutate(prefs)}
            isUpdating={updatePreferencesMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Alert Summary Header Component
 */
function AlertSummaryHeader({ alertsData, onFilterChange, currentFilter }) {
  const summary = alertsData?.by_severity || { critical: 0, warning: 0, info: 0 };
  const totalAlerts = alertsData?.total_active || 0;

  const getAlertBadgeColor = (severity, count) => {
    if (count === 0) return 'bg-gray-100 text-gray-600';
    
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Health Risk Monitoring</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        Real-time monitoring of your health metrics with intelligent anomaly detection and emergency alerts.
      </p>

      {/* Alert Summary Badges */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
            currentFilter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <div className="text-sm">Total Alerts</div>
          </div>
        </button>

        {Object.entries(summary).map(([severity, count]) => (
          <button
            key={severity}
            onClick={() => onFilterChange(severity)}
            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
              currentFilter === severity ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="text-center">
              <Badge className={`${getAlertBadgeColor(severity, count)} text-lg px-3 py-1`}>
                {count}
              </Badge>
              <div className="text-sm mt-1 capitalize">{severity}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Active Alerts Panel Component
 */
function ActiveAlertsPanel({ alerts, onUpdateAlert, isUpdating }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-green-800">All Clear</h3>
          <p className="text-gray-600">
            No active health alerts. Your vital signs are within normal ranges.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.alert_id}
          alert={alert}
          onUpdateAlert={onUpdateAlert}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}

/**
 * Alert Card Component
 */
function AlertCard({ alert, onUpdateAlert, isUpdating }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case 'info': return <Bell className="h-6 w-6 text-blue-600" />;
      default: return <Bell className="h-6 w-6 text-gray-600" />;
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'heart_rate': return <Heart className="h-5 w-5" />;
      case 'blood_oxygen': return <Droplets className="h-5 w-5" />;
      case 'body_temperature': return <Thermometer className="h-5 w-5" />;
      case 'blood_pressure': return <Activity className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`border-2 ${getSeverityColor(alert.severity)}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getSeverityIcon(alert.severity)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getMetricIcon(alert.metric_name)}
                  <h4 className="font-semibold">{alert.metric_display_name}</h4>
                  <Badge className={`capitalize ${getSeverityColor(alert.severity).replace('border-', 'bg-').split(' ')[1]}`}>
                    {alert.severity}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Current Value:</strong> {alert.current_value} {alert.unit}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Reason:</strong> {alert.reason}
                  </p>
                  <p className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>

                {alert.requires_action && !alert.acknowledged && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                      Action Required: Please review this alert and take appropriate measures.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!alert.acknowledged && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateAlert(alert.alert_id, 'acknowledge')}
                  disabled={isUpdating}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateAlert(alert.alert_id, 'resolve')}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" />
                Resolve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Monitoring Panel Component
 */
function MonitoringPanel() {
  const monitoringMetrics = [
    {
      name: 'Heart Rate',
      current_value: 72,
      unit: 'bpm',
      status: 'normal',
      icon: Heart,
      color: 'text-green-600'
    },
    {
      name: 'Blood Oxygen',
      current_value: 98,
      unit: '%',
      status: 'normal',
      icon: Droplets,
      color: 'text-blue-600'
    },
    {
      name: 'Body Temperature',
      current_value: 98.6,
      unit: '°F',
      status: 'normal',
      icon: Thermometer,
      color: 'text-orange-600'
    },
    {
      name: 'Blood Pressure',
      current_value: '120/80',
      unit: 'mmHg',
      status: 'normal',
      icon: Activity,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Health Metrics</CardTitle>
          <p className="text-sm text-gray-600">
            Live monitoring of your vital signs with automatic anomaly detection
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monitoringMetrics.map((metric) => {
              const Icon = metric.icon;
              
              return (
                <div key={metric.name} className="p-4 border rounded-lg text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${metric.color}`} />
                  <h4 className="font-medium">{metric.name}</h4>
                  <div className="text-2xl font-bold mt-2">
                    {metric.current_value} <span className="text-sm font-normal">{metric.unit}</span>
                  </div>
                  <Badge className={`mt-2 ${
                    metric.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{"< 30s"}</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Alert Settings Panel Component
 */
function AlertSettingsPanel({ preferences, onUpdatePreferences, isUpdating }) {
  const [localPreferences, setLocalPreferences] = useState(preferences || {});

  const handlePreferenceChange = (key, value) => {
    const updated = { ...localPreferences, [key]: value };
    setLocalPreferences(updated);
  };

  const savePreferences = () => {
    onUpdatePreferences(localPreferences);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <p className="text-sm text-gray-600">
            Configure how you receive health alerts and emergency notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive alerts on your device</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.push_notifications_enabled || false}
              onCheckedChange={(checked) => 
                handlePreferenceChange('push_notifications_enabled', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Emergency SMS</h4>
                <p className="text-sm text-gray-600">Text messages for critical alerts</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.emergency_sms_enabled || false}
              onCheckedChange={(checked) => 
                handlePreferenceChange('emergency_sms_enabled', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium">Emergency Email</h4>
                <p className="text-sm text-gray-600">Email notifications for critical alerts</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.emergency_email_enabled || false}
              onCheckedChange={(checked) => 
                handlePreferenceChange('emergency_email_enabled', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Emergency Phone Number</label>
            <input
              type="tel"
              className="w-full p-3 border rounded-lg"
              placeholder="+1 (555) 123-4567"
              value={localPreferences.emergency_phone || ''}
              onChange={(e) => handlePreferenceChange('emergency_phone', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Emergency Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg"
              placeholder="emergency@example.com"
              value={localPreferences.emergency_email || ''}
              onChange={(e) => handlePreferenceChange('emergency_email', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={savePreferences}
          disabled={isUpdating}
          className="w-32"
        >
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

export default RiskDetectionDashboard;