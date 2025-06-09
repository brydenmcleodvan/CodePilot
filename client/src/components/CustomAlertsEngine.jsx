import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Bell, 
  Heart, 
  Activity, 
  Droplets, 
  TrendingDown, 
  TrendingUp,
  Clock,
  Trash2,
  Edit,
  Toggle,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom Alerts Engine
 * Allows users to create personalized health monitoring rules
 */
export function CustomAlertsEngine() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const { toast } = useToast();

  // Fetch user's custom alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/custom-alerts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/custom-alerts');
      return res.json();
    }
  });

  // Create new alert
  const createAlertMutation = useMutation({
    mutationFn: async (alertData) => {
      const res = await apiRequest('POST', '/api/custom-alerts', alertData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/custom-alerts']);
      setIsCreating(false);
      toast({
        title: "Alert Created",
        description: "Your custom health alert has been set up successfully."
      });
    }
  });

  // Update alert
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, alertData }) => {
      const res = await apiRequest('PUT', `/api/custom-alerts/${alertId}`, alertData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/custom-alerts']);
      setEditingAlert(null);
      toast({
        title: "Alert Updated",
        description: "Your alert settings have been saved."
      });
    }
  });

  // Delete alert
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      const res = await apiRequest('DELETE', `/api/custom-alerts/${alertId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/custom-alerts']);
      toast({
        title: "Alert Deleted",
        description: "Your custom alert has been removed."
      });
    }
  });

  // Toggle alert active state
  const toggleAlertMutation = useMutation({
    mutationFn: async ({ alertId, isActive }) => {
      const res = await apiRequest('PATCH', `/api/custom-alerts/${alertId}/toggle`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/custom-alerts']);
    }
  });

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <span>Custom Health Alerts</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Set up personalized notifications based on your health metrics
          </p>
        </div>
        
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Alert</span>
        </Button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{alerts.filter(a => a.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Triggered Today</p>
                <p className="text-2xl font-bold">
                  {alerts.reduce((sum, alert) => sum + (alert.triggeredToday || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AlertCard
                alert={alert}
                onEdit={setEditingAlert}
                onDelete={deleteAlertMutation.mutate}
                onToggle={(isActive) => toggleAlertMutation.mutate({ alertId: alert.id, isActive })}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Alerts</h3>
              <p className="text-gray-600 mb-4">
                Create your first custom health alert to get personalized notifications
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Alert Modal */}
      <AnimatePresence>
        {(isCreating || editingAlert) && (
          <AlertBuilder
            alert={editingAlert}
            onSave={(alertData) => {
              if (editingAlert) {
                updateAlertMutation.mutate({ alertId: editingAlert.id, alertData });
              } else {
                createAlertMutation.mutate(alertData);
              }
            }}
            onCancel={() => {
              setIsCreating(false);
              setEditingAlert(null);
            }}
            isLoading={createAlertMutation.isPending || updateAlertMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Alert Card Component
 */
function AlertCard({ alert, onEdit, onDelete, onToggle }) {
  const getMetricIcon = (metric) => {
    const icons = {
      'heart_rate': Heart,
      'hrv': Activity,
      'glucose': Droplets,
      'blood_pressure': TrendingUp,
      'weight': TrendingDown,
      'sleep': Clock
    };
    const Icon = icons[metric] || Activity;
    return <Icon className="h-5 w-5" />;
  };

  const getConditionText = (condition, value) => {
    const conditions = {
      'above': `above ${value}`,
      'below': `below ${value}`,
      'equals': `equals ${value}`,
      'between': `between ${value}`,
      'trend_up': 'trending up',
      'trend_down': 'trending down'
    };
    return conditions[condition] || condition;
  };

  return (
    <Card className={`transition-all ${alert.isActive ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${alert.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {getMetricIcon(alert.metric)}
            </div>
            
            <div>
              <h3 className="font-semibold">{alert.name}</h3>
              <p className="text-sm text-gray-600">
                Alert when {alert.metric.replace('_', ' ')} is {getConditionText(alert.condition, alert.value)}
                {alert.duration && ` for ${alert.duration}`}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'default' : 'secondary'}>
                  {alert.priority} priority
                </Badge>
                {alert.notificationMethods?.includes('email') && (
                  <Badge variant="outline">Email</Badge>
                )}
                {alert.notificationMethods?.includes('push') && (
                  <Badge variant="outline">Push</Badge>
                )}
                {alert.lastTriggered && (
                  <span className="text-xs text-gray-500">
                    Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={alert.isActive}
              onCheckedChange={onToggle}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(alert)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(alert.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Alert Builder Modal Component
 */
function AlertBuilder({ alert, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    metric: '',
    condition: '',
    value: '',
    duration: '',
    priority: 'medium',
    notificationMethods: ['push'],
    isActive: true,
    ...alert
  });

  const metricOptions = [
    { value: 'heart_rate', label: 'Heart Rate (BPM)', icon: Heart },
    { value: 'hrv', label: 'Heart Rate Variability', icon: Activity },
    { value: 'glucose', label: 'Blood Glucose (mg/dL)', icon: Droplets },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: TrendingUp },
    { value: 'weight', label: 'Weight', icon: TrendingDown },
    { value: 'sleep', label: 'Sleep Duration (hours)', icon: Clock }
  ];

  const conditionOptions = [
    { value: 'above', label: 'Above', description: 'Trigger when value exceeds threshold' },
    { value: 'below', label: 'Below', description: 'Trigger when value drops below threshold' },
    { value: 'equals', label: 'Equals', description: 'Trigger when value matches exactly' },
    { value: 'trend_up', label: 'Trending Up', description: 'Trigger when showing upward trend' },
    { value: 'trend_down', label: 'Trending Down', description: 'Trigger when showing downward trend' }
  ];

  const durationOptions = [
    { value: '', label: 'Immediately' },
    { value: '15_minutes', label: '15 minutes' },
    { value: '1_hour', label: '1 hour' },
    { value: '3_hours', label: '3 hours' },
    { value: '1_day', label: '1 day' },
    { value: '3_days', label: '3 days' },
    { value: '1_week', label: '1 week' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {alert ? 'Edit Alert' : 'Create Custom Alert'}
            </h2>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert Name */}
            <div>
              <Label htmlFor="name">Alert Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., High Heart Rate Alert"
                required
              />
            </div>

            {/* Metric Selection */}
            <div>
              <Label>Health Metric</Label>
              <Select value={formData.metric} onValueChange={(value) => setFormData({ ...formData, metric: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a health metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition and Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.condition === 'above' || formData.condition === 'below' || formData.condition === 'equals') && (
                <div>
                  <Label htmlFor="value">Threshold Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter threshold value"
                    required
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <Label>Duration (Optional)</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How long should the condition persist?" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label>Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Info only</SelectItem>
                  <SelectItem value="medium">Medium - Standard notification</SelectItem>
                  <SelectItem value="high">High - Urgent notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notification Methods */}
            <div>
              <Label>Notification Methods</Label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.notificationMethods?.includes('push')}
                    onChange={(e) => {
                      const methods = formData.notificationMethods || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, notificationMethods: [...methods, 'push'] });
                      } else {
                        setFormData({ ...formData, notificationMethods: methods.filter(m => m !== 'push') });
                      }
                    }}
                  />
                  <span>Push Notification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.notificationMethods?.includes('email')}
                    onChange={(e) => {
                      const methods = formData.notificationMethods || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, notificationMethods: [...methods, 'email'] });
                      } else {
                        setFormData({ ...formData, notificationMethods: methods.filter(m => m !== 'email') });
                      }
                    }}
                  />
                  <span>Email</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {alert ? 'Update Alert' : 'Create Alert'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CustomAlertsEngine;