import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Calendar,
  AlertCircle,
  DollarSign,
  Zap,
  Clock,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useThemeSync } from "@/hooks/useThemeSync";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function TelemetryDashboard() {
  const [timeframe, setTimeframe] = useState('7d');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const { effectiveTheme } = useThemeSync();

  // Real-time telemetry data
  const { data: telemetryData, isLoading } = useQuery({
    queryKey: ['/api/admin/telemetry', timeframe],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/telemetry?timeframe=${timeframe}`);
      return res.json();
    },
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true
  });

  // Real-time active users
  const { data: activeUsers } = useQuery({
    queryKey: ['/api/admin/active-users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/active-users');
      return res.json();
    },
    refetchInterval: 10000, // 10 seconds for real-time feel
  });

  // System performance metrics
  const { data: systemMetrics } = useQuery({
    queryKey: ['/api/admin/system-metrics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/system-metrics');
      return res.json();
    },
    refetchInterval: refreshInterval,
  });

  const isDark = effectiveTheme === 'dark';
  const chartColors = {
    primary: '#4A90E2',
    secondary: '#7B68EE',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: isDark ? '#F3F4F6' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    featureUsageOverTime = [],
    supportTicketsByTopic = {},
    userEngagementMetrics = {},
    subscriptionBreakdown = {},
    realTimeActivity = [],
    systemHealth = {}
  } = telemetryData || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <span>Telemetry Dashboard</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time platform analytics and system monitoring</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-3xl font-bold">{activeUsers?.current || 0}</p>
                    <p className="text-sm text-green-600">
                      +{activeUsers?.growth || 0}% from yesterday
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Feature Usage</p>
                    <p className="text-3xl font-bold">{systemMetrics?.totalFeatureUsage?.toLocaleString() || 0}</p>
                    <p className="text-sm text-blue-600">
                      {systemMetrics?.avgUsagePerUser || 0} avg per user
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-600" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support Tickets</p>
                    <p className="text-3xl font-bold">{systemMetrics?.openTickets || 0}</p>
                    <p className="text-sm text-orange-600">
                      {systemMetrics?.avgResponseTime || 'N/A'} avg response
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-red-600" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                    <p className="text-3xl font-bold">{systemHealth?.score || 100}%</p>
                    <p className="text-sm text-green-600">
                      All systems operational
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Feature Usage</TabsTrigger>
            <TabsTrigger value="support">Support Analytics</TabsTrigger>
            <TabsTrigger value="users">User Metrics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
          </TabsList>

          {/* Feature Usage Analytics */}
          <TabsContent value="usage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Feature Usage Over Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line
                      data={{
                        labels: featureUsageOverTime.map(item => 
                          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        ),
                        datasets: [
                          {
                            label: 'Health Tracking',
                            data: featureUsageOverTime.map(item => item.healthTracking || 0),
                            borderColor: chartColors.primary,
                            backgroundColor: `${chartColors.primary}20`,
                            tension: 0.4,
                          },
                          {
                            label: 'Symptom Checker',
                            data: featureUsageOverTime.map(item => item.symptomChecker || 0),
                            borderColor: chartColors.secondary,
                            backgroundColor: `${chartColors.secondary}20`,
                            tension: 0.4,
                          },
                          {
                            label: 'AI Insights',
                            data: featureUsageOverTime.map(item => item.aiInsights || 0),
                            borderColor: chartColors.success,
                            backgroundColor: `${chartColors.success}20`,
                            tension: 0.4,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: { color: chartColors.text }
                          },
                        },
                        scales: {
                          x: {
                            grid: { color: chartColors.grid },
                            ticks: { color: chartColors.text }
                          },
                          y: {
                            grid: { color: chartColors.grid },
                            ticks: { color: chartColors.text }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(featureUsageOverTime.reduce((acc, day) => {
                      Object.entries(day).forEach(([feature, count]) => {
                        if (feature !== 'date') {
                          acc[feature] = (acc[feature] || 0) + (count || 0);
                        }
                      });
                      return acc;
                    }, {}))
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([feature, count], index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <span className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <Badge variant="outline">{count?.toLocaleString()}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Analytics */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets by Topic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: Object.keys(supportTicketsByTopic),
                        datasets: [{
                          data: Object.values(supportTicketsByTopic),
                          backgroundColor: [
                            chartColors.primary,
                            chartColors.secondary,
                            chartColors.success,
                            chartColors.warning,
                            chartColors.danger,
                          ],
                          borderWidth: 2,
                          borderColor: isDark ? '#374151' : '#ffffff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: chartColors.text }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{systemMetrics?.resolutionRate || 0}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{systemMetrics?.avgResponseTime || 'N/A'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Ticket Priorities</h4>
                      {['high', 'medium', 'low'].map(priority => {
                        const count = supportTicketsByTopic[priority] || 0;
                        const total = Object.values(supportTicketsByTopic).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        
                        return (
                          <div key={priority} className="flex items-center justify-between">
                            <span className="capitalize font-medium">{priority} Priority</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    priority === 'high' ? 'bg-red-600' : 
                                    priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Metrics */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{userEngagementMetrics?.high || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">High Engagement</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{userEngagementMetrics?.medium || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Medium Engagement</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{userEngagementMetrics?.low || 0}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Low Engagement</p>
                      </div>
                    </div>

                    <div className="h-64">
                      <Bar
                        data={{
                          labels: ['Daily Active', 'Weekly Active', 'Monthly Active'],
                          datasets: [{
                            label: 'Active Users',
                            data: [
                              activeUsers?.daily || 0,
                              activeUsers?.weekly || 0,
                              activeUsers?.monthly || 0
                            ],
                            backgroundColor: [
                              chartColors.primary,
                              chartColors.secondary,
                              chartColors.success
                            ],
                            borderRadius: 6
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            x: {
                              grid: { color: chartColors.grid },
                              ticks: { color: chartColors.text }
                            },
                            y: {
                              grid: { color: chartColors.grid },
                              ticks: { color: chartColors.text }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {realTimeActivity.slice(0, 20).map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.userRole}
                        </Badge>
                      </motion.div>
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
                  <CardTitle>Subscription Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: Object.keys(subscriptionBreakdown),
                        datasets: [{
                          data: Object.values(subscriptionBreakdown),
                          backgroundColor: [
                            chartColors.success,
                            chartColors.primary,
                            chartColors.warning,
                          ],
                          borderWidth: 2,
                          borderColor: isDark ? '#374151' : '#ffffff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: chartColors.text }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(subscriptionBreakdown).map(([plan, count]) => (
                        <div key={plan} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-semibold capitalize">{plan} Plan</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {plan === 'basic' ? 'Free' : plan === 'premium' ? '$14.99/mo' : '$29.99/mo'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">users</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Revenue Projection</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ${((subscriptionBreakdown.premium || 0) * 14.99 + (subscriptionBreakdown.pro || 0) * 29.99).toLocaleString()}/mo
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly recurring revenue</p>
                    </div>
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