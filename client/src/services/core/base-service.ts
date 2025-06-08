/**
 * Base Service Interface
 * Core template for all service interfaces with advanced features.
 */

import type { ApiError } from '../api/base-api';

/**
 * Request options for services
 */
export interface ServiceRequestOptions {
  /** Enable request retry on failure */
  retry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in ms (can be function for exponential backoff) */
  retryDelay?: number | ((attempt: number, error: Error) => number);
  /** Abort controller for cancellation */
  abortSignal?: AbortSignal;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Cache results for specified time (in seconds) */
  cacheTTL?: number;
  /** Priority (lower means higher priority) */
  priority?: number;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  /** Request start timestamp */
  requestStartTime: number;
  /** Request completion timestamp */
  requestEndTime: number;
  /** HTTP status code */
  status: number;
  /** Request fulfilled from cache */
  fromCache?: boolean;
  /** Cache expiration timestamp */
  cacheExpiry?: number;
  /** Success/failure flag */
  success: boolean;
  /** Request source (server/cache/local) */
  source: 'server' | 'cache' | 'local';
}

/**
 * Service response wrapper
 */
export interface ServiceResponse<T> {
  /** Response data */
  data: T;
  /** Response metadata */
  meta: ResponseMeta;
}

/**
 * Service error types
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

/**
 * Service error details
 */
export interface ServiceErrorDetails {
  /** Error type */
  type: ErrorType;
  /** Human-readable error message */
  message: string;
  /** Original error object */
  originalError?: Error | ApiError;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Field-specific validation errors */
  fieldErrors?: Record<string, string[]>;
  /** Request that caused the error */
  requestInfo?: {
    method: string;
    url: string;
    timestamp: number;
  };
  /** Error context data */
  context?: Record<string, any>;
  /** Error code (if available) */
  code?: string;
  /** Retry count (if retries were attempted) */
  retries?: number;
}

/**
 * Service error class
 */
export class ServiceError extends Error {
  details: ServiceErrorDetails;

  constructor(details: ServiceErrorDetails) {
    super(details.message);
    this.name = 'ServiceError';
    this.details = details;

    // Maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}

/**
 * Base service interface
 */
export interface IBaseService {
  /**
   * Configure global service options
   */
  configure(options: Partial<ServiceRequestOptions>): void;

  /**
   * Get current service configuration
   */
  getConfiguration(): ServiceRequestOptions;

  /**
   * Reset service configuration to defaults
   */
  resetConfiguration(): void;

  /**
   * Clear service cache
   */
  clearCache(): Promise<void>;

  /**
   * Handle and process errors
   */
  handleError(error: unknown, context?: Record<string, any>): ServiceError;
}

/**
 * Base service class with shared functionality
 */
export abstract class BaseService implements IBaseService {
  // Default service configuration
  private config: ServiceRequestOptions = {
    retry: true,
    maxRetries: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    timeout: 30000,
    priority: 5
  };

  /**
   * Configure service options
   */
  configure(options: Partial<ServiceRequestOptions>): void {
    this.config = {
      ...this.config,
      ...options
    };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): ServiceRequestOptions {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  resetConfiguration(): void {
    this.config = {
      retry: true,
      maxRetries: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      timeout: 30000,
      priority: 5
    };
  }

  /**
   * Clear service cache
   */
  async clearCache(): Promise<void> {
    // Implemented by subclasses that use caching
  }

  /**
   * Process API error into standard ServiceError
   */
  handleError(error: unknown, context: Record<string, any> = {}): ServiceError {
    // Default error details
    const errorDetails: ServiceErrorDetails = {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      context
    };

    // Process based on error type
    if (error instanceof ServiceError) {
      // Already a ServiceError, return as is
      return error;
    } else if (error instanceof ApiError) {
      // Process ApiError into ServiceError
      errorDetails.originalError = error;
      errorDetails.statusCode = error.status;
      errorDetails.message = error.message;
      errorDetails.code = error.code;
      errorDetails.fieldErrors = error.errors;

      // Map HTTP status to error type
      if (error.status === 401) {
        errorDetails.type = ErrorType.AUTHENTICATION;
        errorDetails.message = 'Authentication required';
      } else if (error.status === 403) {
        errorDetails.type = ErrorType.AUTHORIZATION;
        errorDetails.message = 'You do not have permission to perform this action';
      } else if (error.status === 404) {
        errorDetails.type = ErrorType.NOT_FOUND;
        errorDetails.message = 'The requested resource was not found';
      } else if (error.status === 422 || error.status === 400) {
        errorDetails.type = ErrorType.VALIDATION;
        errorDetails.message = 'Validation error';
      } else if (error.status === 429) {
        errorDetails.type = ErrorType.RATE_LIMIT;
        errorDetails.message = 'Rate limit exceeded. Please try again later';
      } else if (error.status >= 500) {
        errorDetails.type = ErrorType.SERVER;
        errorDetails.message = 'Server error occurred';
      }
    } else if (error instanceof Error) {
      // Process regular Error object
      errorDetails.originalError = error;
      errorDetails.message = error.message;

      // Try to infer error type from message
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('offline') || message.includes('connection')) {
        errorDetails.type = ErrorType.NETWORK;
        errorDetails.message = 'Network error. Please check your connection';
      } else if (message.includes('timeout')) {
        errorDetails.type = ErrorType.TIMEOUT;
        errorDetails.message = 'Request timed out';
      } else if (message.includes('abort') || message.includes('cancel')) {
        errorDetails.type = ErrorType.CANCELLED;
        errorDetails.message = 'Request was cancelled';
      }
    } else if (typeof error === 'string') {
      // Handle string errors
      errorDetails.message = error;
    }

    return new ServiceError(errorDetails);
  }

  /**
   * Execute a request with retry logic
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    options?: Partial<ServiceRequestOptions>
  ): Promise<T> {
    const config = { ...this.config, ...options };
    let lastError: Error | undefined;
    let attempt = 0;

    // Create timeout promise if timeout is specified
    const createTimeoutPromise = (ms: number) => {
      return new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error(`Request timed out after ${ms}ms`));
        }, ms);
      });
    };

    while (attempt <= (config.retry ? (config.maxRetries || 0) : 0)) {
      try {
        // Use Promise.race to implement timeout
        if (config.timeout) {
          return await Promise.race([
            fn(),
            createTimeoutPromise(config.timeout)
          ]);
        } else {
          return await fn();
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If we've exceeded retry attempts, throw the last error
        if (attempt >= (config.maxRetries || 0)) {
          throw this.handleError(lastError, { 
            retryAttempt: attempt,
            maxRetries: config.maxRetries
          });
        }

        // Calculate delay before next retry
        const delay = typeof config.retryDelay === 'function'
          ? config.retryDelay(attempt, lastError)
          : (config.retryDelay || 1000);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increment attempt counter
        attempt++;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw this.handleError(
      lastError || new Error('Maximum retry attempts exceeded'),
      { retryAttempt: attempt, maxRetries: config.maxRetries }
    );
  }
}