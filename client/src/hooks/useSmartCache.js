import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Smart Caching Layer
 * Intelligent caching with background revalidation for health data
 */

// Cache configuration for different data types
const CACHE_CONFIG = {
  // Fast-changing data - short cache with background updates
  'health-metrics': {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes background refresh
  },
  
  // Medium-changing data
  'user-profile': {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  },
  
  // Slow-changing data - long cache
  'medications': {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
  },
  
  // Static-like data - very long cache
  'user-goals': {
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 4 * 60 * 60 * 1000, // 4 hours
  },
  
  // Real-time data - minimal cache
  'symptoms': {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  }
};

/**
 * Smart health metrics caching
 */
export function useHealthMetrics(userId, timeframe = '7d') {
  const cacheKey = ['/api/health-metrics', userId, timeframe];
  const config = CACHE_CONFIG['health-metrics'];
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/health-metrics?timeframe=${timeframe}`);
      return res.json();
    },
    ...config,
    enabled: !!userId,
    // Intelligent background refetch based on user activity
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

/**
 * Cached user profile with optimistic updates
 */
export function useUserProfile() {
  const cacheKey = ['/api/user/profile'];
  const config = CACHE_CONFIG['user-profile'];
  
  const query = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/profile');
      return res.json();
    },
    ...config,
  });

  const updateProfile = useMutation({
    mutationFn: async (profileData) => {
      const res = await apiRequest('PUT', '/api/user/profile', profileData);
      return res.json();
    },
    // Optimistic update for instant UI response
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previousProfile = queryClient.getQueryData(cacheKey);
      
      queryClient.setQueryData(cacheKey, (old) => ({
        ...old,
        ...newProfile
      }));
      
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // Revert on error
      queryClient.setQueryData(cacheKey, context.previousProfile);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: cacheKey });
    },
  });

  return { ...query, updateProfile };
}

/**
 * Smart medication tracking with predictive prefetching
 */
export function useMedications() {
  const cacheKey = ['/api/medications'];
  const config = CACHE_CONFIG['medications'];
  
  const query = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/medications');
      return res.json();
    },
    ...config,
    onSuccess: (data) => {
      // Prefetch related data
      if (data?.medications?.length > 0) {
        // Prefetch medication reminders
        queryClient.prefetchQuery({
          queryKey: ['/api/medication-reminders'],
          queryFn: async () => {
            const res = await apiRequest('GET', '/api/medication-reminders');
            return res.json();
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  });

  const addMedication = useMutation({
    mutationFn: async (medicationData) => {
      const res = await apiRequest('POST', '/api/medications', medicationData);
      return res.json();
    },
    onSuccess: (newMedication) => {
      // Update cache with new medication
      queryClient.setQueryData(cacheKey, (old) => ({
        ...old,
        medications: [...(old?.medications || []), newMedication]
      }));
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/medication-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/health-summary'] });
    },
  });

  return { ...query, addMedication };
}

/**
 * Symptom tracking with smart batching
 */
export function useSymptoms(options = {}) {
  const { timeframe = '30d', autoRefresh = true } = options;
  const cacheKey = ['/api/symptoms', timeframe];
  const config = CACHE_CONFIG['symptoms'];
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/symptoms?timeframe=${timeframe}`);
      return res.json();
    },
    ...config,
    refetchInterval: autoRefresh ? config.refetchInterval : false,
    // Use stale data while revalidating for better UX
    keepPreviousData: true,
  });
}

/**
 * Batch operations for better performance
 */
export function useBatchOperations() {
  const batchUpdate = useMutation({
    mutationFn: async (operations) => {
      const res = await apiRequest('POST', '/api/batch-update', { operations });
      return res.json();
    },
    onSuccess: (results) => {
      // Intelligently update multiple caches
      results.forEach((result) => {
        if (result.type === 'health-metric') {
          queryClient.invalidateQueries({ queryKey: ['/api/health-metrics'] });
        } else if (result.type === 'symptom') {
          queryClient.invalidateQueries({ queryKey: ['/api/symptoms'] });
        } else if (result.type === 'medication') {
          queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
        }
      });
    },
  });

  return { batchUpdate };
}

/**
 * Health summary with intelligent aggregation
 */
export function useHealthSummary() {
  const cacheKey = ['/api/health-summary'];
  
  return useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/health-summary');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    // Depends on multiple data sources
    onSuccess: () => {
      // Mark dependent queries as potentially stale
      queryClient.invalidateQueries({ queryKey: ['/api/health-metrics'] });
    }
  });
}

/**
 * Prefetch strategy for common user flows
 */
export function usePrefetchStrategy() {
  const prefetchCommonData = () => {
    // Prefetch data likely to be needed soon
    const commonQueries = [
      { key: ['/api/health-summary'], endpoint: '/api/health-summary' },
      { key: ['/api/recent-activities'], endpoint: '/api/recent-activities' },
      { key: ['/api/upcoming-reminders'], endpoint: '/api/upcoming-reminders' }
    ];

    commonQueries.forEach(({ key, endpoint }) => {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: async () => {
          const res = await apiRequest('GET', endpoint);
          return res.json();
        },
        staleTime: 2 * 60 * 1000,
      });
    });
  };

  const prefetchUserFlow = (flow) => {
    // Prefetch based on user navigation patterns
    const flowPrefetches = {
      'dashboard-to-metrics': ['/api/health-metrics', '/api/health-trends'],
      'symptoms-to-analysis': ['/api/symptom-analysis', '/api/health-recommendations'],
      'medications-to-reminders': ['/api/medication-reminders', '/api/medication-schedule']
    };

    const endpoints = flowPrefetches[flow] || [];
    endpoints.forEach(endpoint => {
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        queryFn: async () => {
          const res = await apiRequest('GET', endpoint);
          return res.json();
        },
        staleTime: 1 * 60 * 1000,
      });
    });
  };

  return { prefetchCommonData, prefetchUserFlow };
}

/**
 * Cache management utilities
 */
export function useCacheManagement() {
  const clearUserCache = () => {
    // Clear all user-specific cached data
    queryClient.removeQueries({ predicate: (query) => 
      query.queryKey[0]?.toString().includes('/api/') 
    });
  };

  const refreshCriticalData = () => {
    // Force refresh of critical health data
    const criticalQueries = [
      ['/api/health-metrics'],
      ['/api/medications'],
      ['/api/symptoms']
    ];

    criticalQueries.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  const getCacheStats = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.isActive()).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      cacheSize: queries.reduce((size, query) => {
        const data = query.state.data;
        return size + (data ? JSON.stringify(data).length : 0);
      }, 0)
    };
  };

  return {
    clearUserCache,
    refreshCriticalData,
    getCacheStats
  };
}