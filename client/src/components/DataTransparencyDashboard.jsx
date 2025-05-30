import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Shield,
  Eye,
  Settings,
  FileText,
  Clock,
  Users,
  Lock,
  Download,
  AlertCircle,
  CheckCircle,
  Globe,
  Database,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useThemeSync } from '@/hooks/useThemeSync';

/**
 * Data Transparency Dashboard Component
 * Complete privacy management and data usage transparency
 */
export function DataTransparencyDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('90');
  const [complianceFramework, setComplianceFramework] = useState('gdpr');
  const { toast } = useToast();
  const { effectiveTheme } = useThemeSync();

  // Fetch data usage history
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['/api/privacy/usage-history', selectedTimeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/privacy/usage-history?timeframe=${selectedTimeframe}`);
      return res.json();
    }
  });

  // Fetch user permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/privacy/permissions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/privacy/permissions');
      return res.json();
    }
  });

  // Fetch compliance report
  const { data: complianceData, isLoading: complianceLoading } = useQuery({
    queryKey: ['/api/privacy/compliance', complianceFramework],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/privacy/compliance?framework=${complianceFramework}`);
      return res.json();
    }
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions) => {
      const res = await apiRequest('PUT', '/api/privacy/permissions', permissions);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated",
        description: "Your data usage permissions have been saved"
      });
      queryClient.invalidateQueries(['/api/privacy/permissions']);
    }
  });

  // Data subject request mutation
  const dataRequestMutation = useMutation({
    mutationFn: async (requestData) => {
      const res = await apiRequest('POST', '/api/privacy/data-request', requestData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Submitted",
        description: `Your ${data.request_type} request has been processed`
      });
    }
  });

  const isDark = effectiveTheme === 'dark';
  const isLoading = usageLoading || permissionsLoading || complianceLoading;

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
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span>Data Transparency & Privacy</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Complete transparency about how your health data is used, with full control over your privacy settings and compliance with global data protection regulations.
        </p>
      </div>

      {/* Privacy Status Overview */}
      <PrivacyStatusCard 
        complianceData={complianceData}
        usageData={usageData}
        permissionsData={permissionsData}
      />

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time Period</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">6 Months</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Compliance Framework</label>
                <Select value={complianceFramework} onValueChange={setComplianceFramework}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gdpr">GDPR (EU)</SelectItem>
                    <SelectItem value="ccpa">CCPA (CA)</SelectItem>
                    <SelectItem value="hipaa">HIPAA (US)</SelectItem>
                    <SelectItem value="pipeda">PIPEDA (CA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => dataRequestMutation.mutate({ request_type: 'access' })}
              >
                <FileText className="h-4 w-4 mr-2" />
                Request Data Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Data Usage Log</TabsTrigger>
          <TabsTrigger value="permissions">Privacy Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="requests">Data Rights</TabsTrigger>
        </TabsList>

        {/* Data Usage Log Tab */}
        <TabsContent value="usage">
          <DataUsagePanel 
            usageData={usageData}
            timeframe={selectedTimeframe}
          />
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="permissions">
          <PrivacySettingsPanel 
            permissionsData={permissionsData}
            onUpdatePermissions={(permissions) => updatePermissionsMutation.mutate(permissions)}
            isUpdating={updatePermissionsMutation.isPending}
          />
        </TabsContent>

        {/* Compliance Status Tab */}
        <TabsContent value="compliance">
          <CompliancePanel 
            complianceData={complianceData}
            framework={complianceFramework}
          />
        </TabsContent>

        {/* Data Rights Tab */}
        <TabsContent value="requests">
          <DataRightsPanel 
            onSubmitRequest={(requestData) => dataRequestMutation.mutate(requestData)}
            isProcessing={dataRequestMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Privacy Status Card Component
 */
function PrivacyStatusCard({ complianceData, usageData, permissionsData }) {
  const complianceStatus = complianceData?.compliance_report?.compliance_status || 'unknown';
  const totalUsageEvents = usageData?.total_usage_events || 0;
  const activePermissions = permissionsData ? 
    Object.values(permissionsData.data_processing || {}).filter(Boolean).length : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'non-compliant': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor(complianceStatus)}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold">{complianceStatus.toUpperCase()}</div>
            <div className="text-sm font-medium">Compliance Status</div>
            <div className="text-xs text-gray-600 mt-1">GDPR, CCPA, HIPAA</div>
          </div>
          
          <div className="text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold">{totalUsageEvents}</div>
            <div className="text-sm font-medium">Data Usage Events</div>
            <div className="text-xs text-gray-600 mt-1">Last 90 days</div>
          </div>
          
          <div className="text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold">{activePermissions}</div>
            <div className="text-sm font-medium">Active Permissions</div>
            <div className="text-xs text-gray-600 mt-1">Data processing enabled</div>
          </div>
          
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-lg font-bold">FULL</div>
            <div className="text-sm font-medium">Transparency Level</div>
            <div className="text-xs text-gray-600 mt-1">Complete visibility</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Data Usage Panel Component
 */
function DataUsagePanel({ usageData, timeframe }) {
  const usageByCategory = usageData?.usage_by_category || {};
  const usageByPurpose = usageData?.usage_by_purpose || {};
  const recentLogs = usageData?.recent_logs || [];

  return (
    <div className="space-y-6">
      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-blue-600" />
              <span>Data Categories Used</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usageByCategory).map(([key, category]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{category.category_name}</h4>
                    <p className="text-sm text-gray-600">
                      {category.purposes.length} purpose{category.purposes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{category.usage_count}</div>
                    <div className="text-xs text-gray-500">uses</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-purple-600" />
              <span>Processing Purposes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usageByPurpose).map(([key, purpose]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{purpose.purpose_name}</h4>
                    <p className="text-sm text-gray-600">
                      {purpose.data_categories.length} data type{purpose.data_categories.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{purpose.usage_count}</div>
                    <div className="text-xs text-gray-500">times</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Usage Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-green-600" />
            <span>Recent Data Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent data usage events
              </div>
            ) : (
              recentLogs.map((log, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        We used your {log.data_category.replace('_', ' ')} data to {log.processing_purpose.replace('_', ' ')}
                      </p>
                      {log.result_description && (
                        <p className="text-sm text-gray-600 mt-1">
                          Result: {log.result_description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Method: {log.processing_method}</span>
                        <span>Legal basis: {log.legal_basis}</span>
                        {log.third_party_sharing && (
                          <Badge variant="outline" className="text-xs">
                            Third party sharing
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Privacy Settings Panel Component
 */
function PrivacySettingsPanel({ permissionsData, onUpdatePermissions, isUpdating }) {
  const [localPermissions, setLocalPermissions] = useState(permissionsData || {});

  const handlePermissionChange = (category, key, value) => {
    const updated = {
      ...localPermissions,
      [category]: {
        ...localPermissions[category],
        [key]: value
      }
    };
    setLocalPermissions(updated);
  };

  const savePermissions = () => {
    onUpdatePermissions(localPermissions);
  };

  const permissionCategories = [
    {
      key: 'data_processing',
      name: 'Data Processing',
      description: 'How we use your health data for analysis and insights',
      icon: Database
    },
    {
      key: 'communication',
      name: 'Communications',
      description: 'Notifications and messages you receive from us',
      icon: Users
    },
    {
      key: 'data_sharing',
      name: 'Data Sharing',
      description: 'Sharing your data with third parties and integrations',
      icon: Share2
    }
  ];

  return (
    <div className="space-y-6">
      {permissionCategories.map((category) => {
        const Icon = category.icon;
        const categoryPermissions = localPermissions[category.key] || {};
        
        return (
          <Card key={category.key}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon className="h-6 w-6 text-blue-600" />
                <span>{category.name}</span>
              </CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryPermissions).map(([key, value]) => {
                  if (key === 'created_at' || key === 'consent_version' || key === 'update_history') {
                    return null;
                  }
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getPermissionDescription(category.key, key)}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(category.key, key, checked)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button 
          onClick={savePermissions}
          disabled={isUpdating}
          className="w-32"
        >
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Compliance Panel Component
 */
function CompliancePanel({ complianceData, framework }) {
  const report = complianceData?.compliance_report;
  const userRights = report?.user_rights_status || {};
  const recommendations = report?.recommendations || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-blue-600" />
            <span>{report?.framework || 'Compliance Framework'}</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Jurisdiction: {report?.jurisdiction || 'Unknown'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">User Rights Status</h4>
              <div className="space-y-2">
                {Object.entries(userRights).map(([right, status]) => (
                  <div key={right} className="flex items-center justify-between p-2 border rounded">
                    <span className="capitalize text-sm">{right.replace('_', ' ')}</span>
                    {status === 'compliant' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Recommendations</h4>
              <div className="space-y-2">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-gray-600">No recommendations at this time</p>
                ) : (
                  recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      {rec.description || rec.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Data Rights Panel Component
 */
function DataRightsPanel({ onSubmitRequest, isProcessing }) {
  const dataRights = [
    {
      type: 'access',
      name: 'Access My Data',
      description: 'Get a copy of all data we have about you',
      icon: FileText
    },
    {
      type: 'delete',
      name: 'Delete My Data',
      description: 'Request deletion of your personal data',
      icon: AlertCircle
    },
    {
      type: 'portability',
      name: 'Data Portability',
      description: 'Export your data in a portable format',
      icon: Download
    },
    {
      type: 'rectification',
      name: 'Correct My Data',
      description: 'Request correction of inaccurate data',
      icon: Settings
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
          <p className="text-sm text-gray-600">
            Exercise your rights under data protection regulations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataRights.map((right) => {
              const Icon = right.icon;
              
              return (
                <div key={right.type} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Icon className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{right.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        {right.description}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onSubmitRequest({ request_type: right.type })}
                        disabled={isProcessing}
                      >
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function for permission descriptions
function getPermissionDescription(category, key) {
  const descriptions = {
    data_processing: {
      personal_health_insights: 'Generate personalized health insights and recommendations',
      trend_analysis: 'Analyze patterns in your health data over time',
      goal_tracking: 'Track progress toward your health goals',
      recommendation_generation: 'Create personalized health recommendations',
      platform_analytics: 'Use aggregated data to improve our platform',
      third_party_sharing: 'Share data with approved third-party services',
      research_participation: 'Include anonymized data in health research'
    },
    communication: {
      health_alerts: 'Receive important health alerts and notifications',
      progress_notifications: 'Get updates on your health progress',
      marketing_emails: 'Receive promotional emails about new features',
      research_invitations: 'Invitations to participate in health studies'
    },
    data_sharing: {
      anonymized_research: 'Contribute anonymized data to medical research',
      healthcare_providers: 'Share data with your healthcare providers',
      family_caregivers: 'Allow family members to access your health data',
      fitness_apps: 'Sync data with fitness and activity apps',
      nutrition_apps: 'Share nutrition data with diet tracking apps'
    }
  };
  
  return descriptions[category]?.[key] || 'Manage this data usage permission';
}

export default DataTransparencyDashboard;