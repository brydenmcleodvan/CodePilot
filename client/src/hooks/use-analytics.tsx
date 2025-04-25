import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView, trackEvent, EventCategories, AnalyticsEventOptions } from '@/lib/analytics/analytics-service';

/**
 * Hook to track page views and provide event tracking
 * @returns Event tracking functions
 */
export function useAnalytics() {
  const [location] = useLocation();
  
  // Track page views when location changes
  useEffect(() => {
    trackPageView();
  }, [location]);

  /**
   * Track a navigation event
   * @param destination The destination path or name
   */
  const trackNavigation = (destination: string) => {
    trackEvent(`${EventCategories.NAVIGATION}_click`, {
      props: { destination }
    });
  };

  /**
   * Track a user interaction
   * @param element The UI element that was interacted with
   * @param details Optional details about the interaction
   */
  const trackInteraction = (element: string, details?: string) => {
    trackEvent(`${EventCategories.INTERACTION}_${element}`, {
      props: details ? { details } : undefined
    });
  };

  /**
   * Track when a user engages with an insight
   * @param insightType The type of insight (coaching, correlation, mood, general)
   * @param action The action taken (view, click, dismiss)
   */
  const trackInsightEngagement = (insightType: string, action: 'view' | 'click' | 'dismiss') => {
    trackEvent(`${EventCategories.INSIGHT}_${action}`, {
      props: { insightType }
    });
  };

  /**
   * Track an onboarding step completion
   * @param step The step that was completed
   * @param timeInSeconds Optional time taken to complete the step
   */
  const trackOnboardingStep = (step: string, timeInSeconds?: number) => {
    trackEvent(`${EventCategories.ONBOARDING}_step`, {
      props: { 
        step,
        ...(timeInSeconds ? { timeInSeconds } : {})
      }
    });
  };

  /**
   * Track user feedback
   * @param feedbackType The type of feedback (helpful, not_helpful)
   * @param source Where the feedback was given
   * @param comment Optional user comment
   */
  const trackFeedback = (feedbackType: 'helpful' | 'not_helpful', source: string, comment?: string) => {
    trackEvent(`${EventCategories.FEEDBACK}_submit`, {
      props: { 
        feedbackType, 
        source,
        hasComment: !!comment
      }
    });
  };

  /**
   * Track an error that occurred
   * @param errorType Type of error
   * @param errorMessage Error message
   * @param errorLocation Where the error occurred
   */
  const trackError = (errorType: string, errorMessage: string, errorLocation: string) => {
    trackEvent(`${EventCategories.ERROR}_occurred`, {
      props: { 
        errorType, 
        errorMessage: errorMessage.substring(0, 100), // Truncate long messages
        errorLocation
      }
    });
  };

  /**
   * General-purpose event tracking
   * @param category Event category
   * @param action Event action
   * @param options Additional options
   */
  const track = (category: string, action: string, options?: AnalyticsEventOptions) => {
    trackEvent(`${category}_${action}`, options);
  };

  return {
    trackNavigation,
    trackInteraction,
    trackInsightEngagement,
    trackOnboardingStep,
    trackFeedback,
    trackError,
    track
  };
}