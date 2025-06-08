/**
 * Service Query Hook
 * React Query integration for services
 */

import { 
  useQuery, 
  useMutation, 
  UseQueryResult, 
  UseMutationResult,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { services } from '@/services/service-factory';
import { ServiceError, ErrorType } from '@/services/core/base-service';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced query options with service-specific extensions
 */
export interface ServiceQueryOptions<TData, TError> 
  extends Omit<UseQueryOptions<TData, TError, TData, any[]>, 'queryKey' | 'queryFn'> {
  /** Auto-toast errors */
  toastErrors?: boolean;
  /** Custom toast configurations for error types */
  errorToasts?: Partial<Record<ErrorType, { title: string; description: string }>>;
}

/**
 * Enhanced mutation options with service-specific extensions
 */
export interface ServiceMutationOptions<TData, TError, TVariables>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  /** Auto-toast errors */
  toastErrors?: boolean;
  /** Auto-toast success */
  toastSuccess?: boolean;
  /** Success toast configuration */
  successToast?: { title: string; description: string };
  /** Custom toast configurations for error types */
  errorToasts?: Partial<Record<ErrorType, { title: string; description: string }>>;
  /** Queries to invalidate on success */
  invalidateQueries?: string | string[][];
}

/**
 * Hook for querying service methods with React Query
 */
export function useServiceQuery<TData, TError = ServiceError>(
  queryKey: any[],
  serviceMethod: (...args: any[]) => Promise<TData>,
  params: any[] = [],
  options: ServiceQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> {
  const { 
    toastErrors = true, 
    errorToasts = {},
    ...queryOptions 
  } = options;
  
  const { toast } = useToast();
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await serviceMethod(...params);
      } catch (err) {
        if (err instanceof ServiceError && toastErrors) {
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
            handleErrorToast(err, toast);
          }
        }
        throw err;
      }
    },
    ...queryOptions
  });
}

/**
 * Hook for mutating with service methods using React Query
 */
export function useServiceMutation<TData, TVariables, TError = ServiceError>(
  serviceMethod: (variables: TVariables) => Promise<TData>,
  options: ServiceMutationOptions<TData, TError, TVariables> = {}
): UseMutationResult<TData, TError, TVariables> {
  const { 
    toastErrors = true,
    toastSuccess = false,
    successToast,
    errorToasts = {},
    invalidateQueries,
    ...mutationOptions 
  } = options;
  
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await serviceMethod(variables);
      } catch (err) {
        if (err instanceof ServiceError && toastErrors) {
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
            handleErrorToast(err, toast);
          }
        }
        throw err;
      }
    },
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      // Show success toast if enabled
      if (toastSuccess && successToast) {
        toast({
          title: successToast.title,
          description: successToast.description,
        });
      }
      
      // Invalidate queries if specified
      if (invalidateQueries) {
        if (typeof invalidateQueries === 'string') {
          queryClient.invalidateQueries({ queryKey: [invalidateQueries] });
        } else if (Array.isArray(invalidateQueries)) {
          invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      }
      
      // Call original onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
}

/**
 * Helper to handle error toasts based on error type
 */
function handleErrorToast(
  error: ServiceError,
  toast: ReturnType<typeof useToast>['toast']
): void {
  let title = 'Error';
  let description = error.message;
  
  switch (error.details.type) {
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
      const fieldErrors = error.details.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        // Combine the first error from each field
        description = Object.entries(fieldErrors)
          .map(([field, errors]) => `${field}: ${errors[0]}`)
          .join(', ');
      }
      break;
      
    case ErrorType.TIMEOUT:
      title = 'Request Timeout';
      description = 'The request took too long to complete. Please try again';
      break;
      
    case ErrorType.RATE_LIMIT:
      title = 'Rate Limit Exceeded';
      description = 'You\'ve made too many requests. Please try again later';
      break;
  }
  
  toast({
    title,
    description,
    variant: 'destructive',
  });
}

/**
 * Export services for easier imports
 */
export { services };