// Analytics utility for tracking user events
export const trackEvent = async (event: string, data?: any) => {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        event, 
        data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Common event types
export const ANALYTICS_EVENTS = {
  PROFILE_VIEWED: 'profile_viewed',
  PROFILE_TAB_CHANGED: 'profile_tab_changed',
  DNA_INSIGHTS_VIEWED: 'dna_insights_viewed',
  HEALTH_COACH_ACCESSED: 'health_coach_accessed',
  MARKETPLACE_VISITED: 'marketplace_visited',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  DASHBOARD_VISITED: 'dashboard_visited',
  HEALTH_ALERTS_VIEWED: 'health_alerts_viewed',
  LOGIN_SUCCESS: 'login_success',
  LOGOUT: 'logout',
  NAVIGATION: 'navigation'
} as const;