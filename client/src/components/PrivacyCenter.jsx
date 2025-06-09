import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  FileText,
  Settings,
  Globe,
  Key,
  Database,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Privacy Center Component
 * Comprehensive privacy controls, data management, and monetization options
 */
export function PrivacyCenter({ userId, className = "" }) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { toast } = useToast();

  // Fetch privacy settings
  const { data: privacySettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/privacy/settings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/privacy/settings');
      return res.json();
    },
    enabled: !!userId
  });

  // Fetch data access logs
  const { data: accessLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/privacy/access-logs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/privacy/access-logs');
      return res.json();
    },
    enabled: !!userId
  });

  // Fetch monetization status
  const { data: monetizationData } = useQuery({
    queryKey: ['/api/privacy/monetization'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/privacy/monetization');
      return res.json();
    },
    enabled: !!userId
  });

  // Update privacy settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const res = await apiRequest('PUT', '/api/privacy/settings', settings);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved successfully"
      });
      queryClient.invalidateQueries(['/api/privacy/settings']);
    }
  });

  // Export user data
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/privacy/export-data');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Data Export Initiated",
        description: "Your data export will be ready for download shortly"
      });
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
    }
  });

  // Delete user data
  const deleteDataMutation = useMutation({
    mutationFn: async (dataTypes) => {
      const res = await apiRequest('DELETE', '/api/privacy/delete-data', { dataTypes });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Data Deleted",
        description: "Selected data has been permanently removed"
      });
      queryClient.invalidateQueries(['/api/privacy/access-logs']);
    }
  });

  if (settingsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 animate-pulse" />
            Loading Privacy Center...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const settings = privacySettings || {};
  const logs = accessLogs || [];
  const monetization = monetizationData || {};

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <CardTitle>Privacy & Data Center</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Lock className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="monetization" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Monetization
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Data Controls
            </TabsTrigger>
          </TabsList>

          {/* Privacy Overview */}
          <TabsContent value="overview" className="space-y-4">
            <PrivacyOverview settings={settings} logs={logs} />
          </TabsContent>

          {/* Data Permissions */}
          <TabsContent value="permissions" className="space-y-4">
            <DataPermissions 
              settings={settings}
              onUpdate={(newSettings) => updateSettingsMutation.mutate(newSettings)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Data Activity Logs */}
          <TabsContent value="activity" className="space-y-4">
            <DataActivityLogs logs={logs} isLoading={logsLoading} />
          </TabsContent>

          {/* Monetization Settings */}
          <TabsContent value="monetization" className="space-y-4">
            <MonetizationSettings 
              data={monetization}
              onUpdate={(newSettings) => updateSettingsMutation.mutate(newSettings)}
              isUpdating={updateSettingsMutation.isPending}
            />
          </TabsContent>

          {/* Data Controls */}
          <TabsContent value="controls" className="space-y-4">
            <DataControls 
              onExport={() => exportDataMutation.mutate()}
              onDelete={(dataTypes) => deleteDataMutation.mutate(dataTypes)}
              isExporting={exportDataMutation.isPending}
              isDeleting={deleteDataMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/**
 * Privacy Overview Component
 */
function PrivacyOverview({ settings, logs }) {
  const recentAccess = logs.slice(0, 5);
  const privacyScore = calculatePrivacyScore(settings);

  return (
    <div className="space-y-6">
      {/* Privacy Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Privacy Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Privacy Protection Level</span>
                <span className="font-medium">{privacyScore}%</span>
              </div>
              <Progress value={privacyScore} className="h-3" />
            </div>
            <Badge className={`${
              privacyScore >= 80 ? 'bg-green-100 text-green-800' :
              privacyScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {privacyScore >= 80 ? 'Strong' : privacyScore >= 60 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Your privacy score is based on your current consent settings, data sharing preferences, and security configurations.</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Database className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{logs.length}</div>
          <div className="text-sm text-gray-600">Total Access Events</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{settings.active_consents || 0}</div>
          <div className="text-sm text-gray-600">Active Consents</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{settings.shared_with || 0}</div>
          <div className="text-sm text-gray-600">Data Partners</div>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Data Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAccess.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent data access activity
            </div>
          ) : (
            <div className="space-y-3">
              {recentAccess.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{log.accessor_name || 'System Access'}</div>
                      <div className="text-sm text-gray-600">{log.data_type} • {log.purpose}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(log.accessed_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Data Permissions Component
 */
function DataPermissions({ settings, onUpdate, isUpdating }) {
  const permissions = settings.permissions || {};

  const handlePermissionChange = (category, permission, value) => {
    const updatedPermissions = {
      ...permissions,
      [category]: {
        ...permissions[category],
        [permission]: value
      }
    };
    
    onUpdate({
      ...settings,
      permissions: updatedPermissions
    });
  };

  const permissionCategories = [
    {
      id: 'health_data',
      title: 'Health Data',
      description: 'Biometric data, medical records, and health metrics',
      permissions: [
        { key: 'research_sharing', label: 'Share for medical research', description: 'Anonymous contribution to health studies' },
        { key: 'provider_access', label: 'Healthcare provider access', description: 'Allow authorized clinicians to view your data' },
        { key: 'ai_analysis', label: 'AI health insights', description: 'Use AI to generate personalized health recommendations' }
      ]
    },
    {
      id: 'behavioral_data',
      title: 'Behavioral Data',
      description: 'Activity patterns, habits, and lifestyle information',
      permissions: [
        { key: 'analytics', label: 'Usage analytics', description: 'Help improve platform features and user experience' },
        { key: 'recommendations', label: 'Personalized recommendations', description: 'Receive tailored health and wellness suggestions' },
        { key: 'social_features', label: 'Social features', description: 'Enable leaderboards, challenges, and community features' }
      ]
    },
    {
      id: 'marketing_data',
      title: 'Marketing & Communications',
      description: 'Contact preferences and promotional content',
      permissions: [
        { key: 'email_marketing', label: 'Email marketing', description: 'Receive health tips and product updates' },
        { key: 'targeted_ads', label: 'Targeted advertisements', description: 'Show relevant health and wellness products' },
        { key: 'partner_offers', label: 'Partner offers', description: 'Receive offers from trusted health partners' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Changes to data permissions may affect your experience and personalized recommendations. 
          You can modify these settings at any time.
        </AlertDescription>
      </Alert>

      {permissionCategories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="text-lg">{category.title}</CardTitle>
            <p className="text-sm text-gray-600">{category.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.permissions.map((permission) => (
                <div key={permission.key} className="flex items-start justify-between space-x-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{permission.label}</h4>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                  <Switch
                    checked={permissions[category.id]?.[permission.key] || false}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(category.id, permission.key, checked)
                    }
                    disabled={isUpdating}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Data Activity Logs Component
 */
function DataActivityLogs({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Access History</h3>
        <Badge variant="outline">{logs.length} total events</Badge>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Access Logs</h3>
          <p className="text-gray-600">No data access events have been recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    log.access_type === 'authorized' ? 'bg-green-500' :
                    log.access_type === 'system' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}></div>
                  
                  <div>
                    <h4 className="font-medium">{log.accessor_name || 'Unknown Accessor'}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{log.data_type}</span>
                      <span>•</span>
                      <span>{log.purpose}</span>
                      <span>•</span>
                      <span>{new Date(log.accessed_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <Badge variant={
                  log.access_type === 'authorized' ? 'default' :
                  log.access_type === 'system' ? 'secondary' :
                  'destructive'
                }>
                  {log.access_type}
                </Badge>
              </div>
              
              {log.details && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{log.details}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Monetization Settings Component
 */
function MonetizationSettings({ data, onUpdate, isUpdating }) {
  const monetization = data.settings || {};
  const earnings = data.earnings || {};

  const handleMonetizationChange = (key, value) => {
    onUpdate({
      monetization: {
        ...monetization,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          Opt into data monetization to earn rewards while contributing to health research. 
          Your data remains anonymous and secure.
        </AlertDescription>
      </Alert>

      {/* Monetization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Monetization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Enable Data Monetization</h4>
              <p className="text-sm text-gray-600">
                Earn rewards by sharing anonymized health data for research
              </p>
            </div>
            <Switch
              checked={monetization.enabled || false}
              onCheckedChange={(checked) => handleMonetizationChange('enabled', checked)}
              disabled={isUpdating}
            />
          </div>

          {monetization.enabled && (
            <div className="space-y-4">
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${earnings.total_earned || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${earnings.this_month || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monetization Options */}
      {monetization.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Monetization Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium">Research Participation</h4>
                <p className="text-sm text-gray-600">
                  Share anonymized data with medical research institutions
                </p>
              </div>
              <Switch
                checked={monetization.research_participation || false}
                onCheckedChange={(checked) => 
                  handleMonetizationChange('research_participation', checked)
                }
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium">Product Development</h4>
                <p className="text-sm text-gray-600">
                  Help improve health apps and devices through data insights
                </p>
              </div>
              <Switch
                checked={monetization.product_development || false}
                onCheckedChange={(checked) => 
                  handleMonetizationChange('product_development', checked)
                }
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium">Market Research</h4>
                <p className="text-sm text-gray-600">
                  Contribute to health and wellness market analysis
                </p>
              </div>
              <Switch
                checked={monetization.market_research || false}
                onCheckedChange={(checked) => 
                  handleMonetizationChange('market_research', checked)
                }
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Data Controls Component
 */
function DataControls({ onExport, onDelete, isExporting, isDeleting }) {
  const [selectedDataTypes, setSelectedDataTypes] = useState([]);

  const dataTypes = [
    { id: 'health_metrics', label: 'Health Metrics', description: 'Biometric data, vitals, and measurements' },
    { id: 'activity_data', label: 'Activity Data', description: 'Exercise logs, steps, and movement patterns' },
    { id: 'sleep_data', label: 'Sleep Data', description: 'Sleep patterns and quality metrics' },
    { id: 'nutrition_data', label: 'Nutrition Data', description: 'Food logs and dietary information' },
    { id: 'mental_health', label: 'Mental Health', description: 'Mood tracking and wellness assessments' },
    { id: 'preferences', label: 'Preferences', description: 'Settings and personal preferences' }
  ];

  const handleDataTypeToggle = (dataTypeId) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataTypeId) 
        ? prev.filter(id => id !== dataTypeId)
        : [...prev, dataTypeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Export Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Download a complete copy of your health data in a portable format.
          </p>
          <Button 
            onClick={onExport} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Preparing Export...' : 'Export All Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: Data deletion is permanent and cannot be undone. 
              Consider exporting your data first.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 mb-4">
            {dataTypes.map((dataType) => (
              <div key={dataType.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={dataType.id}
                  checked={selectedDataTypes.includes(dataType.id)}
                  onChange={() => handleDataTypeToggle(dataType.id)}
                  className="mt-1"
                />
                <label htmlFor={dataType.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{dataType.label}</div>
                  <div className="text-sm text-gray-600">{dataType.description}</div>
                </label>
              </div>
            ))}
          </div>

          <Button 
            variant="destructive"
            onClick={() => onDelete(selectedDataTypes)}
            disabled={isDeleting || selectedDataTypes.length === 0}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : `Delete Selected Data (${selectedDataTypes.length})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Calculate privacy score based on settings
 */
function calculatePrivacyScore(settings) {
  let score = 0;
  const permissions = settings.permissions || {};
  
  // Base score for having settings configured
  score += 20;
  
  // Score for restrictive permissions (higher privacy = higher score)
  Object.values(permissions).forEach(category => {
    if (typeof category === 'object') {
      Object.values(category).forEach(permission => {
        if (permission === false) score += 5; // Points for disabling sharing
      });
    }
  });
  
  // Additional points for specific privacy measures
  if (settings.two_factor_enabled) score += 15;
  if (settings.encryption_enabled) score += 15;
  if (settings.audit_logs_enabled) score += 10;
  
  return Math.min(score, 100);
}

export default PrivacyCenter;