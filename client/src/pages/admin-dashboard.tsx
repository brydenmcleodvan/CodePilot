<<<<<<< HEAD
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  MessageSquare,
  Activity,
  DollarSign,
  Clock,
  Eye,
  Filter,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('30');
  const [ticketFilter, setTicketFilter] = useState('all');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics', timeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/analytics?timeframe=${timeframe}`);
      return res.json();
    }
  });

  // Fetch support tickets
  const { data: ticketsData } = useQuery({
    queryKey: ['/api/admin/tickets', ticketFilter],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/tickets?status=${ticketFilter}`);
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading analytics...</span>
      </div>
    );
  }

  const {
    overview = {},
    featureAnalytics = [],
    userEngagement = {},
    supportMetrics = {},
    revenueInsights = {},
    topUsers = [],
    alerts = []
  } = analyticsData || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Business insights and platform analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <span className="font-medium">{alert.message}</span>
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold">{overview.totalUsers?.toLocaleString() || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {overview.activeUsers || 0} active this period
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Feature Usage</p>
                    <p className="text-3xl font-bold">{overview.totalFeatureUsage?.toLocaleString() || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {overview.avgUsagePerUser || 0} avg per user
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upgrade Opportunities</p>
                    <p className="text-3xl font-bold">{revenueInsights.upgradeOpportunities || 0}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  High potential users
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                    <p className="text-3xl font-bold">{overview.openTickets || 0}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {overview.avgResponseTime || 'N/A'} avg response
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Feature Analytics</TabsTrigger>
            <TabsTrigger value="users">User Engagement</TabsTrigger>
            <TabsTrigger value="support">Support Metrics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
          </TabsList>

          {/* Feature Analytics */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Most Used Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureAnalytics.slice(0, 8).map((feature, index) => (
                      <div key={feature.name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{feature.name}</span>
                            <span className="text-sm text-gray-600">{feature.totalUsage}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(feature.totalUsage / featureAnalytics[0]?.totalUsage * 100) || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureAnalytics.slice(0, 5).map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          <p className="text-sm text-gray-600">
                            {feature.uniqueUsers} unique users
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            {feature.successRate}% success
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {feature.adoptionRate}% adoption
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Engagement */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(userEngagement.engagementDistribution || {}).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="capitalize font-medium">{level} Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                level === 'high' ? 'bg-green-600' : 
                                level === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${(count / overview.totalUsers * 100) || 0}%` }}
                            />
                          </div>
                          <span className="font-bold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topUsers.slice(0, 8).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">User {user.userId}</p>
                            <p className="text-xs text-gray-600">
                              {user.featuresUsed} features used
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {user.engagementScore} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Metrics */}
          <TabsContent value="support">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Support Tickets</h3>
                <Select value={ticketFilter} onValueChange={setTicketFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                        <p className="text-2xl font-bold">{supportMetrics.totalTickets || 0}</p>
                      </div>
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                        <p className="text-2xl font-bold">{supportMetrics.resolutionRate || 0}%</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Response</p>
                        <p className="text-2xl font-bold">{supportMetrics.avgResponseTime || 'N/A'}</p>
                      </div>
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(ticketsData?.tickets || []).slice(0, 10).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge className={
                              ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {ticket.priority}
                            </Badge>
                            <span className="font-medium">{ticket.subject}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {ticket.category} • User {ticket.userId} • {ticket.userPlan}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{ticket.status}</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Insights */}
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upgrade Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <h3 className="text-3xl font-bold text-green-600">
                        {revenueInsights.upgradeOpportunities || 0}
                      </h3>
                      <p className="text-gray-600">High-potential users ready to upgrade</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{revenueInsights.premiumFeatureUsage || 0}</p>
                        <p className="text-sm text-gray-600">Premium feature attempts</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{revenueInsights.avgUpgradeScore?.toFixed(1) || 0}</p>
                        <p className="text-sm text-gray-600">Avg upgrade score</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Features most likely to drive upgrades:
                    </p>
                    {[
                      { name: 'AI Health Insights', attempts: 156, conversions: '12%' },
                      { name: 'Data Export', attempts: 89, conversions: '18%' },
                      { name: 'Telehealth Consultations', attempts: 234, conversions: '8%' },
                      { name: 'Family Management', attempts: 45, conversions: '22%' }
                    ].map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          <p className="text-sm text-gray-600">{feature.attempts} attempts</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                          {feature.conversions} conversion
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
=======
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Metrics {
  activeUsers: number;
  syncCount: number;
  topActions: Record<string, number>;
}

export default function AdminDashboard() {
  const { data } = useQuery<Metrics>({ queryKey: ['/api/admin/metrics'] });

  if (!data) return <div className="p-4">Loading...</div>;

  const actionsData = Object.entries(data.topActions).map(([action, count]) => ({ action, count }));

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Platform Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Active Sessions: {data.activeUsers}</p>
          <p>Total Health Syncs: {data.syncCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Popular Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={actionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="action" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
