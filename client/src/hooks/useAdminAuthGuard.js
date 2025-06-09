import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

/**
 * Admin Authentication Guard
 * Protects admin routes and provides unauthorized access handling
 */
export function useAdminAuthGuard() {
  // Check user role and permissions
  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user-role'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/auth/user-role');
      return res.json();
    },
    retry: false
  });

  const isAdmin = userRole?.role === 'admin' || userRole?.permissions?.includes('admin_access');
  const hasAccess = !isLoading && !error && isAdmin;

  return {
    isAdmin,
    hasAccess,
    isLoading,
    userRole,
    error
  };
}

/**
 * Admin Route Protection Component
 */
export function AdminRouteGuard({ children, fallbackUrl = '/' }) {
  const { hasAccess, isLoading, isAdmin } = useAdminAuthGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <UnauthorizedAccess />;
  }

  return children;
}

/**
 * Unauthorized Access Component
 */
function UnauthorizedAccess() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-gray-600">
                You don't have permission to access this area. Admin access is required to view this content.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-sm">Admin Access Required</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Contact your administrator if you believe you should have access to this area.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={handleGoHome}
                className="flex-1"
              >
                Home
              </Button>
            </div>

            <div className="text-xs text-gray-500 border-t pt-4">
              <p>Need admin access? Contact support at admin@healthmap.ai</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Higher-order component for protecting admin routes
 */
export function withAdminGuard(WrappedComponent) {
  return function AdminProtectedComponent(props) {
    return (
      <AdminRouteGuard>
        <WrappedComponent {...props} />
      </AdminRouteGuard>
    );
  };
}