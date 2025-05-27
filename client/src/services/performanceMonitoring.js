/**
 * Firebase Performance Monitoring Service
 * Tracks slow load times, failed API calls, and render bottlenecks
 */

import { getPerformance, trace, connectPerformanceEmulator } from 'firebase/performance';
import { app } from './firebaseConfig';

class PerformanceMonitoringService {
  constructor() {
    this.perf = null;
    this.traces = new Map();
    this.apiMetrics = new Map();
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize Firebase Performance Monitoring
   */
  async initializePerformanceMonitoring() {
    try {
      if (app) {
        this.perf = getPerformance(app);
        
        // Connect to emulator in development
        if (import.meta.env.DEV) {
          try {
            connectPerformanceEmulator(this.perf, 'localhost', 9187);
            console.log('Connected to Performance Monitoring emulator');
          } catch (error) {
            console.log('Performance Monitoring emulator not available');
          }
        }
        
        console.log('Firebase Performance Monitoring initialized');
        this.setupAutomaticTracking();
      } else {
        // Fallback to local performance tracking
        this.setupLocalPerformanceTracking();
      }
    } catch (error) {
      console.warn('Performance monitoring setup failed, using local tracking:', error);
      this.setupLocalPerformanceTracking();
    }
  }

  /**
   * Setup automatic performance tracking
   */
  setupAutomaticTracking() {
    // Track page load performance
    this.trackPageLoad();
    
    // Track API call performance
    this.interceptApiCalls();
    
    // Track component render performance
    this.trackComponentRenders();
    
    // Track user interactions
    this.trackUserInteractions();
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const pageLoadTrace = this.startTrace('page_load');
        
        // Get navigation timing data
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          pageLoadTrace.putMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          pageLoadTrace.putMetric('load_complete', navigation.loadEventEnd - navigation.loadEventStart);
          pageLoadTrace.putMetric('total_load_time', navigation.loadEventEnd - navigation.fetchStart);
        }
        
        pageLoadTrace.stop();
      });
    }
  }

  /**
   * Intercept and track API call performance
   */
  interceptApiCalls() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const startTime = performance.now();
      
      // Create API trace
      const apiTrace = this.startTrace(`api_${this.getEndpointName(url)}`);
      apiTrace.putAttribute('endpoint', url.toString());
      apiTrace.putAttribute('method', options?.method || 'GET');
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Track metrics
        apiTrace.putMetric('response_time', Math.round(duration));
        apiTrace.putMetric('status_code', response.status);
        apiTrace.putAttribute('success', response.ok ? 'true' : 'false');
        
        // Track slow API calls
        if (duration > 2000) {
          this.trackSlowApiCall(url, duration, response.status);
        }
        
        // Track failed API calls
        if (!response.ok) {
          this.trackFailedApiCall(url, response.status, duration);
        }
        
        apiTrace.stop();
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        apiTrace.putAttribute('error', error.message);
        apiTrace.putMetric('response_time', Math.round(duration));
        apiTrace.stop();
        
        this.trackFailedApiCall(url, 0, duration, error.message);
        throw error;
      }
    };
  }

  /**
   * Track component render performance
   */
  trackComponentRenders() {
    // React DevTools integration for component performance
    if (typeof window !== 'undefined' && window.React) {
      const originalCreateElement = window.React.createElement;
      
      window.React.createElement = function(type, props, ...children) {
        if (typeof type === 'function' && type.name) {
          const componentTrace = this.startTrace(`component_${type.name}`);
          const startTime = performance.now();
          
          const result = originalCreateElement.call(this, type, props, ...children);
          
          const renderTime = performance.now() - startTime;
          componentTrace.putMetric('render_time', Math.round(renderTime));
          
          if (renderTime > 100) {
            this.trackSlowComponentRender(type.name, renderTime);
          }
          
          componentTrace.stop();
          return result;
        }
        
        return originalCreateElement.call(this, type, props, ...children);
      }.bind(this);
    }
  }

  /**
   * Track user interactions
   */
  trackUserInteractions() {
    if (typeof window !== 'undefined') {
      // Track click interactions
      document.addEventListener('click', (event) => {
        const target = event.target;
        const elementType = target.tagName.toLowerCase();
        const elementId = target.id || target.className || 'unknown';
        
        const interactionTrace = this.startTrace(`interaction_click`);
        interactionTrace.putAttribute('element_type', elementType);
        interactionTrace.putAttribute('element_id', elementId);
        interactionTrace.stop();
      });
      
      // Track form submissions
      document.addEventListener('submit', (event) => {
        const form = event.target;
        const formId = form.id || form.className || 'unknown';
        
        const formTrace = this.startTrace(`form_submission`);
        formTrace.putAttribute('form_id', formId);
        formTrace.stop();
      });
    }
  }

  /**
   * Start a custom trace
   */
  startTrace(traceName) {
    if (this.perf) {
      const firebaseTrace = trace(this.perf, traceName);
      firebaseTrace.start();
      this.traces.set(traceName, firebaseTrace);
      return firebaseTrace;
    } else {
      // Local trace fallback
      return this.createLocalTrace(traceName);
    }
  }

  /**
   * Create local performance trace
   */
  createLocalTrace(traceName) {
    const startTime = performance.now();
    const localTrace = {
      name: traceName,
      startTime,
      metrics: {},
      attributes: {},
      
      putMetric(metricName, value) {
        this.metrics[metricName] = value;
      },
      
      putAttribute(attributeName, value) {
        this.attributes[attributeName] = value;
      },
      
      stop() {
        const duration = performance.now() - this.startTime;
        this.metrics.duration = Math.round(duration);
        
        // Store locally for later analysis
        this.storeLocalTrace({
          name: this.name,
          duration: this.metrics.duration,
          metrics: this.metrics,
          attributes: this.attributes,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    return localTrace;
  }

  /**
   * Store local trace data
   */
  storeLocalTrace(traceData) {
    try {
      const existingTraces = JSON.parse(localStorage.getItem('healthmap_performance_traces') || '[]');
      existingTraces.push(traceData);
      
      // Keep only last 100 traces
      const recentTraces = existingTraces.slice(-100);
      localStorage.setItem('healthmap_performance_traces', JSON.stringify(recentTraces));
    } catch (error) {
      console.warn('Failed to store local trace:', error);
    }
  }

  /**
   * Track slow API calls
   */
  trackSlowApiCall(url, duration, statusCode) {
    console.warn(`Slow API call detected: ${url} took ${duration}ms`);
    
    this.logPerformanceIssue({
      type: 'slow_api_call',
      url,
      duration,
      statusCode,
      threshold: 2000,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track failed API calls
   */
  trackFailedApiCall(url, statusCode, duration, errorMessage = '') {
    console.error(`Failed API call: ${url} - Status: ${statusCode}, Error: ${errorMessage}`);
    
    this.logPerformanceIssue({
      type: 'failed_api_call',
      url,
      statusCode,
      duration,
      errorMessage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track slow component renders
   */
  trackSlowComponentRender(componentName, renderTime) {
    console.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
    
    this.logPerformanceIssue({
      type: 'slow_component_render',
      componentName,
      renderTime,
      threshold: 100,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log performance issues
   */
  logPerformanceIssue(issue) {
    try {
      const existingIssues = JSON.parse(localStorage.getItem('healthmap_performance_issues') || '[]');
      existingIssues.push(issue);
      
      // Keep only last 50 issues
      const recentIssues = existingIssues.slice(-50);
      localStorage.setItem('healthmap_performance_issues', JSON.stringify(recentIssues));
      
      // Send to analytics if severe
      if (this.isSeverePerformanceIssue(issue)) {
        this.reportSevereIssue(issue);
      }
    } catch (error) {
      console.warn('Failed to log performance issue:', error);
    }
  }

  /**
   * Check if performance issue is severe
   */
  isSeverePerformanceIssue(issue) {
    return (
      (issue.type === 'slow_api_call' && issue.duration > 5000) ||
      (issue.type === 'failed_api_call' && issue.statusCode >= 500) ||
      (issue.type === 'slow_component_render' && issue.renderTime > 500)
    );
  }

  /**
   * Report severe performance issues
   */
  async reportSevereIssue(issue) {
    try {
      // This would integrate with your error reporting service
      console.error('Severe performance issue detected:', issue);
      
      // Queue for server reporting
      const severIssues = JSON.parse(localStorage.getItem('healthmap_severe_issues') || '[]');
      severIssues.push(issue);
      localStorage.setItem('healthmap_severe_issues', JSON.stringify(severIssues));
    } catch (error) {
      console.warn('Failed to report severe issue:', error);
    }
  }

  /**
   * Get endpoint name from URL
   */
  getEndpointName(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      return pathname.replace('/api/', '').replace(/\//g, '_') || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Setup local performance tracking fallback
   */
  setupLocalPerformanceTracking() {
    console.log('Using local performance tracking');
    
    // Basic performance observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            this.storeLocalTrace({
              name: entry.name,
              duration: entry.duration,
              entryType: entry.entryType,
              timestamp: new Date().toISOString()
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    try {
      const traces = JSON.parse(localStorage.getItem('healthmap_performance_traces') || '[]');
      const issues = JSON.parse(localStorage.getItem('healthmap_performance_issues') || '[]');
      
      return {
        totalTraces: traces.length,
        avgDuration: traces.length > 0 ? 
          traces.reduce((sum, trace) => sum + (trace.duration || 0), 0) / traces.length : 0,
        issueCount: issues.length,
        slowApiCalls: issues.filter(issue => issue.type === 'slow_api_call').length,
        failedApiCalls: issues.filter(issue => issue.type === 'failed_api_call').length,
        slowRenders: issues.filter(issue => issue.type === 'slow_component_render').length
      };
    } catch (error) {
      console.warn('Failed to get performance summary:', error);
      return {};
    }
  }
}

// Export singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();