/**
 * Service Skeleton HOC
 * 
 * A Higher Order Component that handles loading states for components that use services.
 * It automatically shows skeleton loading UI while data is being fetched.
 */

import React from 'react';
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
 * Service skeleton props
 */
export interface ServiceSkeletonProps<T> {
  /** The data from a service call */
  data?: T;
  
  /** Whether the data is loading */
  isLoading: boolean;
  
  /** Error from the service call, if any */
  error?: Error | null;
  
  /** Function to retry the data fetch */
  retry?: () => void;
  
  /** Children to render when data is loaded */
  children: React.ReactNode;
  
  /** Type of skeleton to show */
  type?: 'card' | 'chart' | 'table' | 'list' | 'custom';
  
  /** Custom skeleton to show instead of the default ones */
  customSkeleton?: React.ReactNode;
  
  /** Props for the skeleton based on type */
  skeletonProps?: Record<string, any>;
  
  /** Whether to show an error UI when there's an error */
  showError?: boolean;
  
  /** Custom error UI */
  errorComponent?: React.ReactNode;
  
  /** Message to show when there's no data */
  emptyMessage?: string;
  
  /** Custom empty state UI */
  emptyComponent?: React.ReactNode;
  
  /** Function to check if data is empty */
  isEmpty?: (data: T) => boolean;
  
  /** Function to get error message from error */
  getErrorMessage?: (error: Error) => string;
  
  /** Minimum loading time in ms (to prevent flashing) */
  minLoadingTime?: number;
}

/**
 * Service skeleton component
 */
export function ServiceSkeleton<T>({
  data,
  isLoading,
  error,
  retry,
  children,
  type = 'card',
  customSkeleton,
  skeletonProps = {},
  showError = true,
  errorComponent,
  emptyMessage = 'No data available',
  emptyComponent,
  isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
  getErrorMessage = (error) => error instanceof ServiceError 
    ? error.message 
    : error?.message || 'An error occurred while loading the data',
  minLoadingTime = 0
}: ServiceSkeletonProps<T>) {
  // Use state to track if we should still show loading UI
  const [shouldShowLoading, setShouldShowLoading] = React.useState(isLoading);
  
  // Timer for minimum loading time
  React.useEffect(() => {
    if (!isLoading) {
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
  }, [isLoading, minLoadingTime]);
  
  // If loading, show skeleton
  if (shouldShowLoading) {
    if (customSkeleton) {
      return <>{customSkeleton}</>;
    }
    
    switch (type) {
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
  if (error && showError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{getErrorMessage(error)}</p>
          {retry && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={retry}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // If empty data, show empty state
  if (data && isEmpty(data)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        {retry && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={retry}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
    );
  }
  
  // Otherwise, render children
  return <>{children}</>;
}

/**
 * Higher Order Component that adds service loading skeleton
 */
export function withServiceSkeleton<P, T>(
  Component: React.ComponentType<P & { data: T }>,
  options: Omit<ServiceSkeletonProps<T>, 'data' | 'isLoading' | 'error' | 'retry' | 'children'> = {}
) {
  return function SkeletonWrappedComponent(
    props: P & { 
      data?: T;
      isLoading: boolean;
      error?: Error | null;
      refetch?: () => void;
    }
  ) {
    const { data, isLoading, error, refetch, ...rest } = props;
    
    return (
      <ServiceSkeleton
        data={data}
        isLoading={isLoading}
        error={error}
        retry={refetch}
        {...options}
      >
        <Component data={data as T} {...rest as P} />
      </ServiceSkeleton>
    );
  };
}