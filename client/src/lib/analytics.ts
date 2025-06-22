/**
 * Analytics utility for tracking user interactions across the platform
 */

interface AnalyticsEvent {
  event: string;
  metadata?: Record<string, any>;
}

export const trackEvent = async (event: string, metadata?: Record<string, any>) => {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, metadata }),
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
};

// Predefined event types for consistency
export const ANALYTICS_EVENTS = {
  // Telehealth Events
  TELEHEALTH_SESSION_BOOKED: 'telehealth_session_booked',
  TELEHEALTH_SESSION_STARTED: 'telehealth_session_started',
  TELEHEALTH_SESSION_COMPLETED: 'telehealth_session_completed',
  TELEHEALTH_PROVIDER_VIEWED: 'telehealth_provider_viewed',
  
  // Forum Events
  FORUM_POST_VIEWED: 'forum_post_viewed',
  FORUM_POST_CREATED: 'forum_post_created',
  FORUM_POST_SAVED: 'forum_post_saved',
  FORUM_POST_LIKED: 'forum_post_liked',
  FORUM_COMMENT_CREATED: 'forum_comment_created',
  
  // Insurance Events
  INSURANCE_TAB_OPENED: 'insurance_tab_opened',
  INSURANCE_PLAN_VIEWED: 'insurance_plan_viewed',
  INSURANCE_COVERAGE_CHECKED: 'insurance_coverage_checked',
  INSURANCE_CLAIM_SUBMITTED: 'insurance_claim_submitted',
  
  // Dashboard & Goals Events
  GOAL_COMPLETED: 'goal_completed',
  GOAL_CREATED: 'goal_created',
  GOAL_UPDATED: 'goal_updated',
  DASHBOARD_VIEWED: 'dashboard_viewed',
  HEALTH_METRIC_LOGGED: 'health_metric_logged',
  
  // Marketplace Events
  MARKETPLACE_VISITED: 'marketplace_visited',
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_PURCHASED: 'product_purchased',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  CART_ITEM_ADDED: 'cart_item_added',
  CHECKOUT_STARTED: 'checkout_started',
  
  // Coach Events
  AI_COACH_TIPS_VIEWED: 'ai_coach_tips_viewed',
  SLEEP_COACH_ACCESSED: 'sleep_coach_accessed',
  NUTRITION_ADVICE_VIEWED: 'nutrition_advice_viewed',
  
  // Profile & Settings Events
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  HEALTH_DATA_CONNECTED: 'health_data_connected',
  
  // Navigation Events
  PAGE_VIEWED: 'page_viewed',
  MODULE_ACCESSED: 'module_accessed',
  FEATURE_USED: 'feature_used',
} as const;

// Convenience functions for common tracking scenarios
export const trackPageView = (pageName: string) => {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEWED, { page: pageName });
};

export const trackModuleAccess = (moduleName: string) => {
  trackEvent(ANALYTICS_EVENTS.MODULE_ACCESSED, { module: moduleName });
};

export const trackFeatureUsage = (featureName: string, additionalData?: Record<string, any>) => {
  trackEvent(ANALYTICS_EVENTS.FEATURE_USED, { feature: featureName, ...additionalData });
};