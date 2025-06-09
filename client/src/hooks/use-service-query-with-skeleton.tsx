/**
 * useServiceQueryWithSkeleton Hook
 * 
 * A custom hook that combines useServiceQuery with skeleton loading states.
 * It provides a render function that can be used to render different UI states.
 */

import React from 'react';
import { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useServiceQuery, ServiceQueryOptions } from './use-service-query';
import { ServiceSkeletonProps } from '@/components/service-skeleton';
import { 
  CardSkeleton, 
  ChartSkeleton, 
  TableSkeleton, 
  ListSkeleton 
} from '@/components/ui/skeleton-loader';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ServiceError } from '@/services/core/base-service';

/**
 * Options for useServiceQueryWithSkeleton
 */
export interface UseServiceQueryWithSkeletonOptions<TData, TError> 
  extends ServiceQueryOptions<TData, TError> {
  /** Skeleton loader type */
  skeletonType?: 'card' | 'chart' | 'table' | 'list' | 'custom';
  
  /** Custom skeleton component */
  customSkeleton?: React.ReactNode;
  
  /** Props for the skeleton loader */
  skeletonProps?: Record<string, any>;
  
  /** Custom error component */
  errorComponent?: (error: TError, retry: () => void) => React.ReactNode;
  
  /** Custom empty state component */
  emptyComponent?: (refetch: () => void) => React.ReactNode;
  
  /** Message to show when data is empty */
  emptyMessage?: string;
  
  /** Function to check if data is empty */
  isEmpty?: (data: TData) => boolean;
  
  /** Minimum loading time in ms (to prevent flashing) */
  minLoadingTime?: number;
}

/**
 * Return type for useServiceQueryWithSkeleton
 */
export interface UseServiceQueryWithSkeletonResult<TData, TError> {
  /** Data from the query */
  data?: TData;
  
  /** Whether the query is loading */
  isLoading: boolean;
  
  /** Error from the query */
  error: TError | null;
  
  /** Function to refetch the data */
  refetch: () => void;
  
  /** Function to render the UI based on query state */
  render: (renderData: (data: TData) => React.ReactNode) => React.ReactNode;
  
  /** Whether the data is empty */
  isEmpty: boolean;
}

/**
 * Hook for querying services with skeleton loading states
 */
export function useServiceQueryWithSkeleton<TData, TError = Error>(
  queryKey: QueryKey,
  serviceMethod: (...args: any[]) => Promise<TData>,
  params: any[] = [],
  options: UseServiceQueryWithSkeletonOptions<TData, TError> = {}
): UseServiceQueryWithSkeletonResult<TData, TError> {
  // Extract skeleton options
  const {
    skeletonType = 'card',
    customSkeleton,
    skeletonProps = {},
    errorComponent,
    emptyComponent,
    emptyMessage = 'No data available',
    isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
    minLoadingTime = 0,
    ...queryOptions
  } = options;
  
  // Track loading state for minimum loading time
  const [shouldShowLoading, setShouldShowLoading] = React.useState(true);
  
  // Use service query
  const {
    data,
    isLoading: isQueryLoading,
    error,
    refetch
  } = useServiceQuery<TData, TError>(queryKey, serviceMethod, params, queryOptions);
  
  // Compute if the data is empty
  const isDataEmpty = data !== undefined && isEmpty(data);
  
  // Handle minimum loading time
  React.useEffect(() => {
    if (!isQueryLoading) {
      if (minLoadingTime > 0) {
        const timer = setTimeout(() => {
          setShouldShowLoading(false);
        }, minLoadingTime);
        
        return () => clearTimeout(timer);
      } else {
        setShouldShowLoading(false);
      }
    } else {
      setShouldShowLoading(true);
    }
  }, [isQueryLoading, minLoadingTime]);
  
  // Combine loading states
  const isLoading = isQueryLoading || shouldShowLoading;
  
  // Render function
  const render = React.useCallback((renderData: (data: TData) => React.ReactNode) => {
    // If loading, show skeleton
    if (isLoading) {
      if (customSkeleton) {
        return customSkeleton;
      }
      
      switch (skeletonType) {
        case 'card':
          return (
            <CardSkeleton
              contentLines={3}
              hasHeader={true}
              {...skeletonProps}
            />
          );
        case 'chart':
          return (
            <ChartSkeleton
              type="bar"
              height="15rem"
              {...skeletonProps}
            />
          );
        case 'table':
          return (
            <TableSkeleton
              rows={5}
              columns={3}
              {...skeletonProps}
            />
          );
        case 'list':
          return (
            <ListSkeleton
              items={5}
              linesPerItem={2}
              {...skeletonProps}
            />
          );
        default:
          return (
            <CardSkeleton
              contentLines={3}
              hasHeader={true}
              {...skeletonProps}
            />
          );
      }
    }
    
    // If error, show error UI
    if (error) {
      if (errorComponent) {
        return errorComponent(error, refetch);
      }
      
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              {error instanceof ServiceError 
                ? error.message 
                : error instanceof Error 
                  ? error.message 
                  : 'An unexpected error occurred'}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    // If empty data, show empty state
    if (isDataEmpty) {
      if (emptyComponent) {
        return emptyComponent(refetch);
      }
      
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      );
    }
    
    // Render the data
    return renderData(data as TData);
  }, [
    data, 
    isLoading, 
    error, 
    refetch, 
    skeletonType, 
    customSkeleton,
    skeletonProps,
    errorComponent,
    emptyComponent,
    emptyMessage,
    isDataEmpty
  ]);
  
  return {
    data,
    isLoading,
    error,
    refetch,
    render,
    isEmpty: isDataEmpty
  };
}