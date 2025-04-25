/**
 * Service Hook
 * React hook for consuming services with typed error handling
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { services } from '@/services/service-factory';
import { ServiceError, ErrorType } from '@/services/core/base-service';
import { useToast } from '@/hooks/use-toast';

/**
 * Options for the useService hook
 */
export interface UseServiceOptions<T, E = Error> {
  /** Auto-load on mount */
  autoLoad?: boolean;
  /** Default data (before loading) */
  defaultData?: T;
  /** Custom error mapping function */
  mapError?: (error: ServiceError) => E;
  /** Auto-toast errors */
  toastErrors?: boolean;
  /** Custom toast configurations for error types */
  errorToasts?: Partial<Record<ErrorType, { title: string; description: string }>>;
  /** Dependencies for auto-loading */
  dependencies?: unknown[];
}

/**
 * Result interface for useService hook
 */
export interface UseServiceResult<T, E = Error> {
  /** The data returned from the service call */
  data: T | undefined;
  /** Whether the service call is currently in progress */
  loading: boolean;
  /** The error from the service call, if any */
  error: E | null;
  /** Function to execute the service call */
  execute: (...args: any[]) => Promise<T>;
  /** Function to reset the state */
  reset: () => void;
  /** The service call was successful */
  success: boolean;
}

/**
 * Custom hook for interacting with services
 */
export function useService<T, E = Error>(
  serviceMethod: (...args: any[]) => Promise<T>,
  options: UseServiceOptions<T, E> = {}
): UseServiceResult<T, E> {
  const {
    autoLoad = false,
    defaultData,
    mapError,
    toastErrors = true,
    errorToasts = {},
    dependencies = []
  } = options;
  
  const [data, setData] = useState<T | undefined>(defaultData);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<E | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const { toast } = useToast();
  const isMounted = useRef(true);
  
  // Function to execute the service method
  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      try {
        const result = await serviceMethod(...args);
        
        if (isMounted.current) {
          setData(result);
          setSuccess(true);
        }
        
        return result;
      } catch (err) {
        let processedError: E;
        
        // Process the error
        if (err instanceof ServiceError) {
          // Use custom error mapping if provided
          processedError = mapError ? mapError(err) : err as unknown as E;
          
          // Show toast for error
          if (toastErrors) {
            const errorType = err.details.type;
            const errorToast = errorToasts[errorType];
            
            if (errorToast) {
              // Use custom toast for this error type
              toast({
                title: errorToast.title,
                description: errorToast.description,
                variant: 'destructive',
              });
            } else {
              // Use default toast based on error type
              let title = 'Error';
              let description = err.message;
              
              switch (errorType) {
                case ErrorType.AUTHENTICATION:
                  title = 'Authentication Error';
                  description = 'Please sign in to continue';
                  break;
                  
                case ErrorType.AUTHORIZATION:
                  title = 'Permission Denied';
                  description = 'You do not have permission to perform this action';
                  break;
                  
                case ErrorType.NETWORK:
                  title = 'Network Error';
                  description = 'Please check your connection and try again';
                  break;
                  
                case ErrorType.SERVER:
                  title = 'Server Error';
                  description = 'Our servers are experiencing issues. Please try again later';
                  break;
                  
                case ErrorType.VALIDATION:
                  title = 'Validation Error';
                  const fieldErrors = err.details.fieldErrors;
                  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
                    // Combine the first error from each field
                    description = Object.entries(fieldErrors)
                      .map(([field, errors]) => `${field}: ${errors[0]}`)
                      .join(', ');
                  }
                  break;
              }
              
              toast({
                title,
                description,
                variant: 'destructive',
              });
            }
          }
        } else {
          // Handle non-ServiceError errors
          processedError = err as E;
          
          if (toastErrors) {
            toast({
              title: 'Error',
              description: err instanceof Error ? err.message : 'An unexpected error occurred',
              variant: 'destructive',
            });
          }
        }
        
        // Set the error state if component is still mounted
        if (isMounted.current) {
          setError(processedError);
        }
        
        throw processedError;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [serviceMethod, mapError, toastErrors, errorToasts, toast]
  );
  
  // Function to reset the state
  const reset = useCallback(() => {
    setData(defaultData);
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, [defaultData]);
  
  // Auto-execute on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      execute();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [autoLoad, execute, ...dependencies]);
  
  return {
    data,
    loading,
    error,
    execute,
    reset,
    success
  };
}

/**
 * Export services for easier imports
 */
export { services };