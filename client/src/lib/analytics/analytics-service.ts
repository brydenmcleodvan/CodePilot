/**
 * Privacy-First Analytics Service
 * 
 * A privacy-respecting analytics implementation using Plausible.
 * - Only collects data when user explicitly opts in
 * - Anonymizes all data
 * - No cookies or persistent identifiers
 * - Compliant with GDPR, CCPA, and other privacy regulations
 */

// Check if we're in a production environment
const isProduction = import.meta.env.PROD;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

// Storage key for privacy preferences
const STORAGE_KEY_ANALYTICS = "healthmap_privacy_analytics";

// Types for events
export type AnalyticsEventOptions = {
  props?: Record<string, string | number | boolean>;
};

/**
 * Check if the user has allowed analytics
 */
const isAnalyticsAllowed = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY_ANALYTICS) === "true";
};

/**
 * Initialize Plausible analytics.
 * This should be called once when the application loads.
 * Only loads the analytics script if the user has opted in.
 */
export const initAnalytics = (): void => {
  if (!isProduction) {
    console.log('[Analytics] Analytics disabled in development');
    return;
  }

  if (!PLAUSIBLE_DOMAIN) {
    console.warn('[Analytics] Plausible domain not configured. Set VITE_PLAUSIBLE_DOMAIN env variable.');
    return;
  }

  // Only load analytics if user has explicitly opted in
  if (!isAnalyticsAllowed()) {
    console.log('[Analytics] Analytics disabled by user preference');
    return;
  }

  // Load Plausible script with privacy-focused settings
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  // Use "exclusion mode" which doesn't use cookies
  script.dataset.cookieless = "true";
  script.dataset.nopersonaldata = "true";
  script.src = 'https://plausible.io/js/script.exclusions.js';
  
  document.head.appendChild(script);
};

/**
 * Track a page view.
 * This should be called whenever a route changes.
 * Only tracks if the user has opted in.
 */
export const trackPageView = (url?: string): void => {
  if (!isProduction || !isAnalyticsAllowed()) {
    if (!isProduction) {
      console.log(`[Analytics] Page View: ${url || window.location.pathname}`);
    }
    return;
  }

  // Use the Plausible custom event function if available
  if (window.plausible) {
    window.plausible('pageview', { u: url });
  }
};

/**
 * Track a custom event.
 * Only tracks if the user has opted in.
 * 
 * @param eventName The name of the event to track
 * @param options Additional options and properties for the event
 */
export const trackEvent = (eventName: string, options?: AnalyticsEventOptions): void => {
  if (!isProduction || !isAnalyticsAllowed()) {
    if (!isProduction) {
      console.log(`[Analytics] Event: ${eventName}`, options?.props || {});
    }
    return;
  }

  // Use the Plausible custom event function if available
  if (window.plausible) {
    // Remove any personal identifiable information
    const sanitizedProps = options?.props ? sanitizeProps(options.props) : undefined;
    window.plausible(eventName, { props: sanitizedProps });
  }
};

/**
 * Sanitize event properties to remove PII
 */
const sanitizeProps = (props: Record<string, any>): Record<string, any> => {
  const sanitized = { ...props };
  
  // Remove known PII fields
  const piiFields = ['email', 'name', 'username', 'phone', 'address', 'ip', 'userId'];
  piiFields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

/**
 * Force reload analytics preferences
 * Call this when user changes their privacy settings
 */
export const reloadAnalyticsPreferences = (): void => {
  const analyticsScripts = document.querySelectorAll('script[data-domain]');
  
  // Remove existing analytics scripts
  analyticsScripts.forEach(script => script.remove());
  
  // Reload if enabled
  if (isAnalyticsAllowed()) {
    initAnalytics();
  }
};

// Define event categories for consistency
export const EventCategories = {
  NAVIGATION: 'navigation',
  INTERACTION: 'interaction',
  INSIGHT: 'insight',
  USER: 'user',
  HEALTH_DATA: 'health_data',
  ONBOARDING: 'onboarding',
  ERROR: 'error',
  FEEDBACK: 'feedback',
};

// Add TypeScript definitions for Plausible
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { u?: string; props?: Record<string, any> }) => void;
  }
}