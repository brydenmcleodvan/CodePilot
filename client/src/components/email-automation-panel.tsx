import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Mail, 
  Clock, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  Send,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EmailPreferences {
  weeklyEmailReports: boolean;
  emailFrequency: string;
  lastEmailSent: string | null;
}

export default function EmailAutomationPanel() {
  const { toast } = useToast();
  const [isAutomationActive, setIsAutomationActive] = useState(false);

  // Fetch user email preferences
  const { data: emailPreferences, isLoading: preferencesLoading } = useQuery<EmailPreferences>({
    queryKey: ['/api/user/email-preferences'],
  });

  // Start automation mutation
  const startAutomationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/email-automation/start');
      return res.json();
    },
    onSuccess: () => {
      setIsAutomationActive(true);
      toast({
        title: "Email Automation Started",
        description: "Weekly health reports will be sent every Monday at 8:00 AM",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Start Automation",
        description: "Please check your permissions and try again",
        variant: "destructive",
      });
    },
  });

  // Stop automation mutation
  const stopAutomationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/email-automation/stop');
      return res.json();
    },
    onSuccess: () => {
      setIsAutomationActive(false);
      toast({
        title: "Email Automation Stopped",
        description: "Weekly health reports have been disabled",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Stop Automation",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/email-automation/test');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your email for the weekly health report preview",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Send Test Email",
        description: "Please check your email settings and try again",
        variant: "destructive",
      });
    },
  });

  // Update email preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<EmailPreferences>) => {
      const res = await apiRequest('POST', '/api/user/email-preferences', preferences);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/email-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your email preferences have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Update Preferences",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  if (preferencesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold text-gray-900">Weekly Email Automation</h2>
        <p className="text-gray-600">
          Automatically send comprehensive health reports to your users every week
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isAutomationActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {isAutomationActive ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Pause className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Automation Status
                  </CardTitle>
                  <CardDescription>
                    Weekly health report automation is currently{' '}
                    <Badge variant={isAutomationActive ? 'default' : 'secondary'}>
                      {isAutomationActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                {isAutomationActive ? (
                  <Button
                    onClick={() => stopAutomationMutation.mutate()}
                    disabled={stopAutomationMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={() => startAutomationMutation.mutate()}
                    disabled={startAutomationMutation.isPending}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Schedule</p>
                  <p className="text-sm text-gray-600">Mondays at 8:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Last Sent</p>
                  <p className="text-sm text-gray-600">
                    {emailPreferences?.lastEmailSent 
                      ? new Date(emailPreferences.lastEmailSent).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-sm text-gray-600">All opted-in users</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Your Email Preferences</span>
            </CardTitle>
            <CardDescription>
              Manage your personal email notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Health Reports</p>
                <p className="text-sm text-gray-600">
                  Receive comprehensive health summaries every week
                </p>
              </div>
              <Switch
                checked={emailPreferences?.weeklyEmailReports ?? true}
                onCheckedChange={(checked) => 
                  updatePreferencesMutation.mutate({ weeklyEmailReports: checked })
                }
                disabled={updatePreferencesMutation.isPending}
              />
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-2">Email Frequency</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={emailPreferences?.emailFrequency === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreferencesMutation.mutate({ emailFrequency: 'weekly' })}
                  disabled={updatePreferencesMutation.isPending}
                >
                  Weekly
                </Button>
                <Button
                  variant={emailPreferences?.emailFrequency === 'biweekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreferencesMutation.mutate({ emailFrequency: 'biweekly' })}
                  disabled={updatePreferencesMutation.isPending}
                >
                  Bi-weekly
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Testing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Test Email System</span>
            </CardTitle>
            <CardDescription>
              Send yourself a preview of the weekly health report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sendTestEmailMutation.mutate()}
              disabled={sendTestEmailMutation.isPending}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">What's Included in Weekly Reports</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Comprehensive health score with trend analysis</li>
                  <li>• Risk detection alerts and health anomalies</li>
                  <li>• Population comparison insights</li>
                  <li>• Clinical assessment recommendations</li>
                  <li>• Personalized achievements and goals progress</li>
                  <li>• AI-generated health recommendations</li>
                  <li>• Professional PDF report attachment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SendGrid Integration Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Email Service Configuration</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  To enable email delivery, configure your SendGrid API key in the environment settings. 
                  Without proper email service configuration, the system will log email attempts for testing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}