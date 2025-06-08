import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * User Role Hook
 * Provides modular access control for role-based UI elements
 */
export function useUserRole() {
  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user-role'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/auth/user-role');
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const permissions = userRole?.permissions || [];
  const role = userRole?.role || 'user';
  const subscription = userRole?.subscription || 'basic';

  return {
    // Role checks
    isAdmin: role === 'admin',
    isProvider: role === 'provider' || role === 'admin',
    isUser: role === 'user',
    
    // Subscription checks
    isBasic: subscription === 'basic',
    isPremium: subscription === 'premium' || subscription === 'pro',
    isPro: subscription === 'pro',
    
    // Permission checks
    canViewAnalytics: permissions.includes('view_analytics') || role === 'admin',
    canManageUsers: permissions.includes('manage_users') || role === 'admin',
    canAccessTelehealth: permissions.includes('telehealth') || subscription !== 'basic',
    canExportData: permissions.includes('export_data') || subscription === 'pro',
    canUsePremiumFeatures: subscription !== 'basic' || role === 'admin',
    
    // Raw data
    role,
    subscription,
    permissions,
    userRole,
    isLoading,
    error
  };
}

/**
 * Component wrapper for role-based visibility
 */
export function RoleGuard({ 
  children, 
  roles = [], 
  subscriptions = [], 
  permissions = [], 
  fallback = null,
  requireAll = false 
}) {
  const { 
    role, 
    subscription, 
    permissions: userPermissions, 
    isLoading 
  } = useUserRole();

  if (isLoading) {
    return fallback || <div className="animate-pulse bg-gray-200 h-4 rounded" />;
  }

  // Check role access
  const hasRole = roles.length === 0 || roles.includes(role);
  
  // Check subscription access
  const hasSubscription = subscriptions.length === 0 || subscriptions.includes(subscription);
  
  // Check permission access
  const hasPermission = permissions.length === 0 || 
    (requireAll 
      ? permissions.every(p => userPermissions.includes(p))
      : permissions.some(p => userPermissions.includes(p))
    );

  const hasAccess = requireAll 
    ? hasRole && hasSubscription && hasPermission
    : hasRole || hasSubscription || hasPermission;

  return hasAccess ? children : fallback;
}

/**
 * Hook for feature access control
 */
export function useFeatureAccess() {
  const roleData = useUserRole();

  const checkFeatureAccess = (feature) => {
    const featureMap = {
      // Basic features (always available)
      'symptom_checker': true,
      'health_tracking': true,
      'medication_reminders': true,
      
      // Premium features
      'ai_insights': roleData.isPremium,
      'advanced_analytics': roleData.isPremium,
      'telehealth_booking': roleData.isPremium,
      'family_management': roleData.isPremium,
      
      // Pro features
      'data_export': roleData.isPro,
      'api_access': roleData.isPro,
      'white_label': roleData.isPro,
      'priority_support': roleData.isPro,
      
      // Admin features
      'admin_dashboard': roleData.isAdmin,
      'user_management': roleData.isAdmin,
      'system_analytics': roleData.isAdmin,
      
      // Provider features
      'patient_management': roleData.isProvider,
      'consultation_tools': roleData.isProvider,
      'medical_records': roleData.isProvider
    };

    return featureMap[feature] || false;
  };

  return {
    checkFeatureAccess,
    ...roleData
  };
}