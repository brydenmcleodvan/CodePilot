/**
 * API Service
 * Base class for all API-backed services with standardized request/response handling.
 */

import { apiRequest } from '../api/base-api';
import { queryClient } from '@/lib/queryClient';
import { 
  BaseService, 
  ServiceRequestOptions, 
  ServiceResponse,
  ErrorType,
  ServiceError
} from './base-service';

/**
 * Cache behavior options
 */
export enum CacheBehavior {
  /** Use cache first, then network (fast UI updates) */
  CACHE_FIRST = 'cache-first',
  /** Use network first, fallback to cache if offline */
  NETWORK_FIRST = 'network-first',
  /** Use cache only (offline mode) */
  CACHE_ONLY = 'cache-only',
  /** Use network only (bypass cache) */
  NETWORK_ONLY = 'network-only',
  /** Use stale cache while revalidating in background */
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate'
}

/**
 * Extended API request options
 */
export interface ApiServiceRequestOptions extends ServiceRequestOptions {
  /** Cache behavior strategy */
  cacheBehavior?: CacheBehavior;
  /** Query parameters */
  params?: Record<string, any>;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Response type */
  responseType?: 'json' | 'text' | 'blob';
  /** Disable global loading state */
  silent?: boolean;
  /** Skip result transformation */
  skipTransform?: boolean;
}

/**
 * Base API service class
 */
export abstract class ApiService extends BaseService {
  /**
   * Base API endpoint path
   */
  protected abstract basePath: string;

  /**
   * Get full URL path
   */
  protected getFullPath(path: string): string {
    // Remove trailing slash from base path and leading slash from path
    const basePath = this.basePath.endsWith('/') 
      ? this.basePath.slice(0, -1) 
      : this.basePath;
    
    const relativePath = path.startsWith('/') ? path.slice(1) : path;
    
    return `${basePath}/${relativePath}`;
  }

  /**
   * Create cache key for query cache
   */
  protected createCacheKey(path: string, params?: Record<string, any>): string[] {
    const key = [this.getFullPath(path)];
    
    // Add params to cache key if present
    if (params && Object.keys(params).length > 0) {
      key.push(JSON.stringify(params));
    }
    
    return key;
  }

  /**
   * Transform response data before returning to caller
   */
  protected transformResponse<T, R>(response: T): R {
    // Default implementation returns unmodified data
    // Subclasses can override to transform specific responses
    return response as unknown as R;
  }

  /**
   * Clear service cache for specific path
   */
  async clearCache(path?: string): Promise<void> {
    if (path) {
      await queryClient.invalidateQueries({ queryKey: [this.getFullPath(path)] });
    } else {
      await queryClient.invalidateQueries({ queryKey: [this.basePath] });
    }
  }

  /**
   * Execute GET request with error handling, retries, and caching
   */
  protected async get<T, R = T>(
    path: string,
    options: ApiServiceRequestOptions = {}
  ): Promise<R> {
    const fullPath = this.getFullPath(path);
    
    return this.executeWithRetry(
      async () => {
        const response = await apiRequest<T>(
          'GET',
          fullPath,
          undefined,
          {
            params: options.params,
            headers: options.headers,
            responseType: options.responseType,
            abortSignal: options.abortSignal,
          }
        );
        
        return options.skipTransform ? (response as unknown as R) : this.transformResponse<T, R>(response);
      },
      options
    );
  }

  /**
   * Execute POST request with error handling and retries
   */
  protected async post<T, R = T, D = any>(
    path: string,
    data?: D,
    options: ApiServiceRequestOptions = {}
  ): Promise<R> {
    const fullPath = this.getFullPath(path);
    
    return this.executeWithRetry(
      async () => {
        const response = await apiRequest<T>(
          'POST',
          fullPath,
          data,
          {
            params: options.params,
            headers: options.headers,
            responseType: options.responseType,
            abortSignal: options.abortSignal,
          }
        );
        
        // Invalidate related cache queries if cache behavior is not explicitly set
        if (!options.cacheBehavior || options.cacheBehavior !== CacheBehavior.CACHE_ONLY) {
          await this.clearCache();
        }
        
        return options.skipTransform ? (response as unknown as R) : this.transformResponse<T, R>(response);
      },
      options
    );
  }

  /**
   * Execute PUT request with error handling and retries
   */
  protected async put<T, R = T, D = any>(
    path: string,
    data?: D,
    options: ApiServiceRequestOptions = {}
  ): Promise<R> {
    const fullPath = this.getFullPath(path);
    
    return this.executeWithRetry(
      async () => {
        const response = await apiRequest<T>(
          'PUT',
          fullPath,
          data,
          {
            params: options.params,
            headers: options.headers,
            responseType: options.responseType,
            abortSignal: options.abortSignal,
          }
        );
        
        // Invalidate related cache queries
        if (!options.cacheBehavior || options.cacheBehavior !== CacheBehavior.CACHE_ONLY) {
          await this.clearCache();
        }
        
        return options.skipTransform ? (response as unknown as R) : this.transformResponse<T, R>(response);
      },
      options
    );
  }

  /**
   * Execute PATCH request with error handling and retries
   */
  protected async patch<T, R = T, D = any>(
    path: string,
    data?: D,
    options: ApiServiceRequestOptions = {}
  ): Promise<R> {
    const fullPath = this.getFullPath(path);
    
    return this.executeWithRetry(
      async () => {
        const response = await apiRequest<T>(
          'PATCH',
          fullPath,
          data,
          {
            params: options.params,
            headers: options.headers,
            responseType: options.responseType,
            abortSignal: options.abortSignal,
          }
        );
        
        // Invalidate related cache queries
        if (!options.cacheBehavior || options.cacheBehavior !== CacheBehavior.CACHE_ONLY) {
          await this.clearCache();
        }
        
        return options.skipTransform ? (response as unknown as R) : this.transformResponse<T, R>(response);
      },
      options
    );
  }

  /**
   * Execute DELETE request with error handling and retries
   */
  protected async delete<T, R = T>(
    path: string,
    options: ApiServiceRequestOptions = {}
  ): Promise<R> {
    const fullPath = this.getFullPath(path);
    
    return this.executeWithRetry(
      async () => {
        const response = await apiRequest<T>(
          'DELETE',
          fullPath,
          undefined,
          {
            params: options.params,
            headers: options.headers,
            responseType: options.responseType,
            abortSignal: options.abortSignal,
          }
        );
        
        // Invalidate related cache queries
        if (!options.cacheBehavior || options.cacheBehavior !== CacheBehavior.CACHE_ONLY) {
          await this.clearCache();
        }
        
        return options.skipTransform ? (response as unknown as R) : this.transformResponse<T, R>(response);
      },
      options
    );
  }

  /**
   * Create an abort controller for request cancellation
   */
  createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Create service response wrapper
   */
  protected createServiceResponse<T>(data: T, meta: Partial<Omit<ServiceResponse<T>['meta'], 'requestStartTime' | 'requestEndTime' | 'success'>> = {}): ServiceResponse<T> {
    const now = Date.now();
    return {
      data,
      meta: {
        requestStartTime: now - 1, // Simulate a request that just completed
        requestEndTime: now,
        success: true,
        status: 200,
        source: 'server',
        ...meta
      }
    };
  }
}