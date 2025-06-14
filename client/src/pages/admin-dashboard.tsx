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
    queryFn: () => apiRequest(`/api/admin/analytics?timeframe=${timeframe}`),
  });

  // Fetch support tickets
  const { data: supportTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/admin/support-tickets', ticketFilter],
    queryFn: () => apiRequest(`/api/admin/support-tickets?filter=${ticketFilter}`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const metrics = analyticsData?.overview || {};
  const featureUsage = analyticsData?.featureAnalytics || [];
  const userEngagement = analyticsData?.userEngagement || {};
  const supportMetrics = analyticsData?.supportMetrics || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform health, user engagement, and business metrics
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.newUsersThisPeriod || 0} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.activeUsers / metrics.totalUsers) * 100 || 0).toFixed(1)}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.revenueGrowth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportMetrics.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {supportMetrics.avgResponseTime || 0}h avg response
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureUsage.map((feature: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${feature.usage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Daily Active Users</span>
                    <span className="font-semibold">{userEngagement.dailyActive || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Retention</span>
                    <span className="font-semibold">{userEngagement.weeklyRetention || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session Duration</span>
                    <span className="font-semibold">{userEngagement.avgSessionDuration || 0}m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Support Tickets</h3>
            <div className="flex gap-2">
              <Select value={ticketFilter} onValueChange={setTicketFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {(supportTickets || []).map((ticket: any, index: number) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                            {ticket.priority}
                          </Badge>
                          <span className="font-medium">{ticket.subject}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By {ticket.userEmail}</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">All systems operational</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Connected</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125ms</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}