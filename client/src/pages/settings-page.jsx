import React, { useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Settings, 
  User, 
  Globe, 
  Crown, 
  Download, 
  Shield, 
  Bell,
  Eye,
  Trash2,
  Edit3,
  Save,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SubscriptionPaywall } from "@/components/SubscriptionPaywall";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const { toast } = useToast();
  const [showPaywall, setShowPaywall] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch user data and subscription status
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      // Mock user data - would connect to your user management system
      return {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        subscription: {
          planId: 'basic',
          status: 'active',
          features: ['Basic tracking'],
          nextBilling: '2024-02-01'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: false,
            weeklyReport: true
          },
          privacy: {
            dataSharing: false,
            analytics: true
          }
        }
      };
    }
  });

  // Export health data mutation
  const exportDataMutation = useMutation({
    mutationFn: async (format) => {
      const res = await apiRequest('POST', '/api/user/export-data', { format });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Started",
        description: "Your health report will be emailed to you shortly.",
      });
      
      // Trigger download
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      const res = await apiRequest('PUT', '/api/user/profile', updates);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries(['/api/user/profile']);
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences) => {
      const res = await apiRequest('PUT', '/api/user/preferences', preferences);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your settings have been saved.",
      });
      queryClient.invalidateQueries(['/api/user/profile']);
    }
  });

  const handleExportData = (format = 'pdf') => {
    if (user?.subscription?.planId === 'basic') {
      toast({
        title: "Premium Feature",
        description: "Data export requires a Premium or Pro subscription.",
        variant: "destructive",
      });
      setShowPaywall(true);
      return;
    }
    
    exportDataMutation.mutate(format);
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePreferenceChange = (category, key, value) => {
    const newPreferences = {
      ...user.preferences,
      [category]: {
        ...user.preferences[category],
        [key]: value
      }
    };
    updatePreferencesMutation.mutate(newPreferences);
  };

  const getPlanDisplayName = (planId) => {
    const names = {
      'basic': 'Basic',
      'premium': 'Premium',
      'pro': 'Professional'
    };
    return names[planId] || planId;
  };

  const getPlanColor = (planId) => {
    const colors = {
      'basic': 'bg-gray-100 text-gray-800',
      'premium': 'bg-blue-100 text-blue-800',
      'pro': 'bg-purple-100 text-purple-800'
    };
    return colors[planId] || colors.basic;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account, subscription, and preferences</p>
        </motion.div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? profileData.name : user?.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? profileData.email : user?.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={isEditing ? profileData.phone : user?.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleProfileSave}
                          disabled={updateProfileMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => {
                          setIsEditing(true);
                          setProfileData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || ''
                          });
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Language Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Language & Region</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Interface Language</Label>
                      <div className="mt-2">
                        <LanguageSwitcher variant="buttons" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>Current Subscription</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPlanColor(user?.subscription?.planId)}>
                          {getPlanDisplayName(user?.subscription?.planId)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Status: {user?.subscription?.status}
                        </span>
                      </div>
                      {user?.subscription?.nextBilling && (
                        <p className="text-sm text-gray-600">
                          Next billing: {new Date(user.subscription.nextBilling).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button onClick={() => setShowPaywall(true)}>
                      {user?.subscription?.planId === 'basic' ? 'Upgrade Plan' : 'Manage Subscription'}
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h4 className="font-medium mb-2">Current Features:</h4>
                    <ul className="space-y-1">
                      {user?.subscription?.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <Check className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Health Data Export</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Download your complete health data for sharing with healthcare providers or personal records.
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => handleExportData('pdf')}
                      disabled={exportDataMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF Report
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleExportData('csv')}
                      disabled={exportDataMutation.isPending}
                    >
                      Export Raw Data (CSV)
                    </Button>
                  </div>
                  
                  {user?.subscription?.planId === 'basic' && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      📋 Data export requires Premium or Pro subscription
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive health insights and updates via email</p>
                      </div>
                      <Switch 
                        checked={user?.preferences?.notifications?.email}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'email', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Health Report</Label>
                        <p className="text-sm text-gray-600">Get a summary of your health metrics every Monday</p>
                      </div>
                      <Switch 
                        checked={user?.preferences?.notifications?.weeklyReport}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'weeklyReport', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">Receive reminders and alerts on your device</p>
                      </div>
                      <Switch 
                        checked={user?.preferences?.notifications?.push}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'push', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Anonymous Analytics</Label>
                        <p className="text-sm text-gray-600">Help improve Healthmap with anonymous usage data</p>
                      </div>
                      <Switch 
                        checked={user?.preferences?.privacy?.analytics}
                        onCheckedChange={(checked) => handlePreferenceChange('privacy', 'analytics', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-gray-600">Allow sharing aggregated health insights with research partners</p>
                      </div>
                      <Switch 
                        checked={user?.preferences?.privacy?.dataSharing}
                        onCheckedChange={(checked) => handlePreferenceChange('privacy', 'dataSharing', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Data Management</h4>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Privacy Policy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download My Data
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Subscription Paywall Modal */}
        <SubscriptionPaywall 
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          currentPlan={user?.subscription?.planId || 'basic'}
        />
      </div>
    </div>
  );
}