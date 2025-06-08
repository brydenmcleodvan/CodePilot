import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * Subscription Guard Hook
 * Protects premium features and manages access control based on subscription tier
 */
export function useSubscriptionGuard(requiredPlan = 'premium', featureName = null) {
  const { toast } = useToast();
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Get current user subscription status
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['/api/subscription/status'],
    queryFn: async () => {
      // This would connect to your subscription manager
      return {
        planId: 'basic', // Current user's plan
        status: 'active',
        features: ['Basic tracking'],
        limits: {
          aiInsights: 0,
          telehealthConsults: 0,
          dataExport: false
        }
      };
    }
  });

  // Plan hierarchy for access control
  const planHierarchy = {
    'basic': 0,
    'premium': 1,
    'pro': 2
  };

  // Check if user has required access level
  useEffect(() => {
    if (!subscription || isLoading) return;

    const userPlanLevel = planHierarchy[subscription.planId] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 1;
    
    const hasRequiredAccess = userPlanLevel >= requiredPlanLevel;
    setHasAccess(hasRequiredAccess);

    // If user doesn't have access and tries to use feature, show upgrade prompt
    if (!hasRequiredAccess && featureName) {
      toast({
        title: "Premium Feature",
        description: `${featureName} requires a ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} subscription.`,
        variant: "destructive",
      });
    }
  }, [subscription, requiredPlan, featureName, toast, isLoading]);

  // Function to check access and show paywall if needed
  const checkAccess = (callback = null) => {
    if (hasAccess) {
      if (callback) callback();
      return true;
    } else {
      setShowPaywall(true);
      return false;
    }
  };

  // Function to check feature usage limits
  const checkUsageLimit = (limitType) => {
    if (!subscription) return { allowed: false, reason: 'No subscription data' };
    
    const limit = subscription.limits[limitType];
    
    // If feature is completely blocked (like basic plan trying to use AI)
    if (limit === 0 || limit === false) {
      return { 
        allowed: false, 
        reason: `This feature requires ${requiredPlan} subscription`,
        upgrade: true
      };
    }
    
    // If unlimited access
    if (limit === -1 || limit === true) {
      return { allowed: true };
    }
    
    // Check numeric limits (would need usage tracking from server)
    return { 
      allowed: true, // Would check actual usage here
      remaining: limit
    };
  };

  return {
    hasAccess,
    isLoading,
    subscription,
    showPaywall,
    setShowPaywall,
    checkAccess,
    checkUsageLimit,
    currentPlan: subscription?.planId || 'basic'
  };
}

/**
 * Feature-specific subscription guards for common use cases
 */
export const useAIInsightsGuard = () => {
  return useSubscriptionGuard('premium', 'AI Health Insights');
};

export const useTelehealthGuard = () => {
  return useSubscriptionGuard('premium', 'Telehealth Consultations');
};

export const useDataExportGuard = () => {
  return useSubscriptionGuard('premium', 'Health Data Export');
};

export const useFamilyManagementGuard = () => {
  return useSubscriptionGuard('pro', 'Family Health Management');
};

export const useAdvancedAnalyticsGuard = () => {
  return useSubscriptionGuard('premium', 'Advanced Health Analytics');
};

/**
 * Higher-order component for protecting routes/components
 */
export function withSubscriptionGuard(WrappedComponent, requiredPlan = 'premium') {
  return function ProtectedComponent(props) {
    const { hasAccess, isLoading, showPaywall, setShowPaywall } = useSubscriptionGuard(requiredPlan);
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Checking access...</span>
        </div>
      );
    }
    
    if (!hasAccess) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
            <p className="text-gray-600 mb-6">
              This feature requires a {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} subscription.
            </p>
            <button 
              onClick={() => setShowPaywall(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}