import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";

interface AdminMetrics {
  totalUsers: number;
  topModules: string[];
  errorLogs: string[];
}

export default function Admin() {
  const { data: metrics, isLoading } = useQuery<AdminMetrics>({
    queryKey: ["/api/admin/metrics"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <Card className="bg-white p-4 rounded shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Active registered users</p>
          </CardContent>
        </Card>

        {/* Top Modules Card */}
        <Card className="bg-white p-4 rounded shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Modules</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.topModules?.map((module, index) => (
                <div key={module} className="flex items-center justify-between">
                  <span className="text-sm font-medium">#{index + 1} {module}</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              )) || (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Logs Card */}
        <Card className="bg-white p-4 rounded shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.errorLogs?.map((error, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )) || (
                <div className="text-sm text-muted-foreground">No recent errors</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Statistics */}
      <div className="mt-8">
        <Card className="bg-white p-4 rounded shadow">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{metrics?.totalUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{metrics?.topModules?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Active Modules</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{metrics?.errorLogs?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Recent Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}