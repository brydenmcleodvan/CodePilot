import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Accessibility, 
  Palette, 
  Database, 
  Globe,
  ChevronLeft
} from "lucide-react";
import { AccessibilitySettingsPanel } from "@/components/AccessibilitySettingsPanel";
import { PrivacyCenter } from "@/components/PrivacyCenter";
import { motion } from "framer-motion";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and accessibility options
            </p>
          </motion.div>
        </div>

        <Tabs defaultValue="accessibility" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-1">
              <Accessibility className="h-4 w-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <ProfileSettings user={user} />
          </TabsContent>

          {/* Accessibility Settings */}
          <TabsContent value="accessibility">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AccessibilitySettingsPanel userId={user?.id} />
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PrivacyCenter userId={user?.id} />
            </motion.div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <DataManagementSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Profile Settings Component
 */
function ProfileSettings({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Manage your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Username</label>
            <div className="mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
              {user?.username || 'Not set'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
              {user?.email || 'Not set'}
            </div>
          </div>
        </div>
        <Button>Edit Profile</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Notification Settings Component
 */
function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-green-600" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
          <p className="text-gray-600 mb-4">
            Configure your notification preferences for health alerts, reminders, and updates
          </p>
          <Button variant="outline">Configure Notifications</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Privacy Settings Component
 */
function PrivacySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-orange-600" />
          Privacy & Security
        </CardTitle>
        <CardDescription>
          Manage your privacy settings and data sharing preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Privacy Controls</h3>
          <p className="text-gray-600 mb-4">
            Control who can access your health data and manage consent preferences
          </p>
          <Button variant="outline">Manage Privacy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Appearance Settings Component
 */
function AppearanceSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-purple-600" />
          Appearance & Theme
        </CardTitle>
        <CardDescription>
          Customize the visual appearance of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Theme Settings</h3>
          <p className="text-gray-600 mb-4">
            Choose your preferred color scheme and visual style
          </p>
          <Button variant="outline">Customize Theme</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Data Management Settings Component
 */
function DataManagementSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6 text-red-600" />
          Data Management
        </CardTitle>
        <CardDescription>
          Export, import, or delete your health data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Data Controls</h3>
          <p className="text-gray-600 mb-4">
            Export your data, import from other sources, or manage data retention
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline">Export Data</Button>
            <Button variant="outline">Import Data</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}