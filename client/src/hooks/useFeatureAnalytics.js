import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Feature Analytics Hook
 * Tracks user interactions and feature usage for business insights
 */
export function useFeatureAnalytics() {
  
  // Log feature usage mutation
  const logFeatureUsage = useMutation({
    mutationFn: async ({ featureName, metadata = {} }) => {
      const res = await apiRequest('POST', '/api/log-feature-usage', {
        featureName,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
          ...metadata
        }
      });
      return res.json();
    },
    onError: (error) => {
      // Fail silently for analytics - don't interrupt user experience
      console.warn('Analytics tracking failed:', error);
    }
  });

  /**
   * Track feature access - successful or blocked
   */
  const trackFeatureAccess = (featureName, accessGranted = true, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: accessGranted ? `feature_accessed_${featureName}` : `feature_blocked_${featureName}`,
      metadata: {
        accessGranted,
        ...metadata
      }
    });
  };

  /**
   * Track button or action clicks
   */
  const trackClick = (elementName, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: `click_${elementName}`,
      metadata: {
        action: 'click',
        ...metadata
      }
    });
  };

  /**
   * Track page/route visits
   */
  const trackPageView = (pageName, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: `page_view_${pageName}`,
      metadata: {
        action: 'page_view',
        referrer: document.referrer,
        ...metadata
      }
    });
  };

  /**
   * Track user actions with timing
   */
  const trackTimedAction = (actionName, startTime, success = true, metadata = {}) => {
    const duration = Date.now() - startTime;
    logFeatureUsage.mutate({
      featureName: `action_${actionName}`,
      metadata: {
        duration,
        success,
        action: 'timed_action',
        ...metadata
      }
    });
  };

  /**
   * Track conversion events (upgrades, purchases, etc.)
   */
  const trackConversion = (conversionType, value = null, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: `conversion_${conversionType}`,
      metadata: {
        action: 'conversion',
        value,
        ...metadata
      }
    });
  };

  /**
   * Track errors or failures
   */
  const trackError = (errorType, errorMessage, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: `error_${errorType}`,
      metadata: {
        action: 'error',
        errorMessage,
        success: false,
        ...metadata
      }
    });
  };

  /**
   * Track subscription-related events
   */
  const trackSubscriptionEvent = (eventType, planType, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: `subscription_${eventType}`,
      metadata: {
        action: 'subscription',
        planType,
        ...metadata
      }
    });
  };

  /**
   * Track onboarding progress
   */
  const trackOnboardingStep = (stepName, completed = true, metadata = {}) => {
    logFeatureUsage.mutate({
      featureName: `onboarding_${stepName}`,
      metadata: {
        action: 'onboarding',
        completed,
        ...metadata
      }
    });
  };

  return {
    trackFeatureAccess,
    trackClick,
    trackPageView,
    trackTimedAction,
    trackConversion,
    trackError,
    trackSubscriptionEvent,
    trackOnboardingStep,
    logFeatureUsage: logFeatureUsage.mutate
  };
}

/**
 * Higher-order component to automatically track page views
 */
export function withPageTracking(WrappedComponent, pageName) {
  return function TrackedPageComponent(props) {
    const { trackPageView } = useFeatureAnalytics();
    
    React.useEffect(() => {
      trackPageView(pageName);
    }, [trackPageView]);
    
    return <WrappedComponent {...props} />;
  };
}

/**
 * Hook to track button clicks automatically
 */
export function useClickTracking(elementName, metadata = {}) {
  const { trackClick } = useFeatureAnalytics();
  
  return () => trackClick(elementName, metadata);
}

/**
 * Hook to track timed actions (like form submissions)
 */
export function useTimedTracking(actionName) {
  const { trackTimedAction } = useFeatureAnalytics();
  const [startTime, setStartTime] = React.useState(null);
  
  const startTracking = () => {
    setStartTime(Date.now());
  };
  
  const endTracking = (success = true, metadata = {}) => {
    if (startTime) {
      trackTimedAction(actionName, startTime, success, metadata);
      setStartTime(null);
    }
  };
  
  return { startTracking, endTracking };
}