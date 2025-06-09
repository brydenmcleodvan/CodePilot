import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Loader2, BarChart3, Users, Settings, MessageSquare } from 'lucide-react';

/**
 * Progressive Loading Components
 * Lazy-load feature-heavy components for optimal performance
 */

// Lazy load heavy dashboard components
export const AdminDashboard = lazy(() => 
  import('@/pages/admin-dashboard').then(module => ({ default: module.default }))
);

export const HealthGraph = lazy(() => 
  import('@/components/health-graph').then(module => ({ default: module.default }))
);

export const AnalyticsCharts = lazy(() => 
  import('@/components/analytics-charts').then(module => ({ default: module.default }))
);

export const TelehealthConsole = lazy(() => 
  import('@/components/telehealth-console').then(module => ({ default: module.default }))
);

export const AffiliateMarketplace = lazy(() => 
  import('@/pages/affiliate-marketplace').then(module => ({ default: module.default }))
);

/**
 * Loading fallback components with contextual information
 */
export function AdminDashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Metrics cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </motion.div>
            ))}
          </div>

          {/* Loading message */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600 animate-pulse" />
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Loading Analytics Dashboard</p>
                <p className="text-sm text-gray-600">Preparing your business insights...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function HealthGraphLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
      
      {/* Graph skeleton */}
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-3">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto animate-pulse" />
          <p className="text-sm text-gray-500">Loading health trends...</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TelehealthLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <MessageSquare className="h-12 w-12 text-blue-600 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Preparing Telehealth Console</h2>
          <p className="text-gray-600">Setting up secure consultation environment...</p>
        </div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function MarketplaceLoader() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="h-48 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading Personalized Recommendations</span>
          </div>
          <p className="text-gray-600">Finding products tailored to your health profile...</p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Generic loading wrapper with error boundary
 */
export function LoadingWrapper({ 
  children, 
  fallback, 
  errorFallback,
  minLoadTime = 500 
}) {
  const [showFallback, setShowFallback] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  if (showFallback && fallback) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback || <DefaultLoader />}>
      {children}
    </Suspense>
  );
}

/**
 * Default loader for components without specific loaders
 */
export function DefaultLoader({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Higher-order component for lazy loading with analytics
 */
export function withLazyLoading(importFunction, loader, componentName) {
  const LazyComponent = lazy(() => {
    const startTime = performance.now();
    
    return importFunction().then(module => {
      const loadTime = performance.now() - startTime;
      
      // Track component load time for performance analytics
      console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // This could integrate with your analytics service
      if (window.gtag) {
        window.gtag('event', 'component_load', {
          component_name: componentName,
          load_time: Math.round(loadTime)
        });
      }
      
      return module;
    });
  });

  return function LazyLoadedComponent(props) {
    return (
      <Suspense fallback={loader || <DefaultLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}