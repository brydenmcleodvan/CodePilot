/**
 * Analytics Service
 * 
 * A privacy-respecting analytics implementation using Plausible.
 * Docs: https://plausible.io/docs
 */

// Check if we're in a production environment
const isProduction = import.meta.env.PROD;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

// Types for events
export type AnalyticsEventOptions = {
  props?: Record<string, string | number | boolean>;
};

/**
 * Initialize Plausible analytics.
 * This should be called once when the application loads.
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

  // Load Plausible script
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = 'https://plausible.io/js/script.js';
  
  document.head.appendChild(script);
};

/**
 * Track a page view.
 * This should be called whenever a route changes.
 */
export const trackPageView = (url?: string): void => {
  if (!isProduction) {
    console.log(`[Analytics] Page View: ${url || window.location.pathname}`);
    return;
  }

  // Use the Plausible custom event function if available
  if (window.plausible) {
    window.plausible('pageview', { u: url });
  }
};

/**
 * Track a custom event.
 * @param eventName The name of the event to track
 * @param options Additional options and properties for the event
 */
export const trackEvent = (eventName: string, options?: AnalyticsEventOptions): void => {
  if (!isProduction) {
    console.log(`[Analytics] Event: ${eventName}`, options?.props || {});
    return;
  }

  // Use the Plausible custom event function if available
  if (window.plausible) {
    window.plausible(eventName, { props: options?.props });
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