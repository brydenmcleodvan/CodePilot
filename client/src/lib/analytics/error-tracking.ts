/**
 * Error Tracking Service
 * 
 * A simple error tracking implementation that can be configured
 * to use Sentry in production environments.
 */

// Environment variables
const isProduction = import.meta.env.PROD;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Types
export interface ErrorDetails {
  message: string;
  source?: string;
  stack?: string;
  context?: Record<string, any>;
  user?: {
    id?: string | number;
    username?: string;
    email?: string;
  };
}

/**
 * Initialize the error tracking service
 * Should be called once when the app starts
 */
export const initErrorTracking = async (): Promise<void> => {
  if (!isProduction) {
    console.log('[ErrorTracking] Error tracking disabled in development');
    return;
  }

  if (!SENTRY_DSN) {
    console.warn('[ErrorTracking] Sentry DSN not configured. Set VITE_SENTRY_DSN env variable.');
    return;
  }

  try {
    // Dynamically import Sentry to avoid loading it in development
    const Sentry = await import('@sentry/browser');
    
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions
      // Session replay
      replaysSessionSampleRate: 0.1, // Capture 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Capture all sessions with errors
    });
    
    console.log('[ErrorTracking] Sentry initialized');
  } catch (error) {
    console.error('[ErrorTracking] Failed to initialize Sentry:', error);
  }
};

/**
 * Track an error
 */
export const trackError = async (error: Error | ErrorDetails): Promise<void> => {
  // Always log to console for development
  if (!isProduction) {
    console.error('[ErrorTracking]', error);
    return;
  }

  // If Sentry is not available, log the error to our backend
  if (!SENTRY_DSN) {
    try {
      const errorData = error instanceof Error 
        ? { 
            message: error.message, 
            stack: error.stack 
          } 
        : error;
      
      // Send error to backend API
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorData,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (e) {
      // Fallback to console if even our API fails
      console.error('[ErrorTracking] Failed to log error:', e);
    }
    return;
  }

  // Use Sentry if available
  try {
    const Sentry = await import('@sentry/browser');
    
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      // Set user context if available
      if (error.user) {
        Sentry.setUser(error.user);
      }
      
      // Set additional context
      if (error.context) {
        Sentry.setContext('additional', error.context);
      }
      
      // Capture the error
      Sentry.captureMessage(error.message, {
        level: 'error',
        tags: {
          source: error.source || 'unknown',
        },
      });
    }
  } catch (e) {
    console.error('[ErrorTracking] Failed to send error to Sentry:', e);
  }
};

/**
 * Set user information for error tracking
 */
export const setErrorTrackingUser = async (user: { id: string | number; username?: string; email?: string }): Promise<void> => {
  if (!isProduction || !SENTRY_DSN) return;
  
  try {
    const Sentry = await import('@sentry/browser');
    Sentry.setUser(user);
  } catch (e) {
    console.error('[ErrorTracking] Failed to set user:', e);
  }
};

/**
 * Clear user information from error tracking
 */
export const clearErrorTrackingUser = async (): Promise<void> => {
  if (!isProduction || !SENTRY_DSN) return;
  
  try {
    const Sentry = await import('@sentry/browser');
    Sentry.setUser(null);
  } catch (e) {
    console.error('[ErrorTracking] Failed to clear user:', e);
  }
};