/**
 * Base API Service
 * Foundation for all API interactions with robust error handling and TypeScript support
 */

import { queryClient } from "@/lib/queryClient";
import type { 
  HttpMethod, 
  ApiRequestOptions, 
  ApiResponse, 
  ApiErrorResponse,
  QueryFilters
} from "@/types/api";

/**
 * Custom API error class with typed properties
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
  
  constructor(message: string, status: number, data?: Partial<ApiErrorResponse>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    
    if (data) {
      this.code = data.code;
      this.errors = data.errors;
      this.timestamp = data.timestamp;
      this.path = data.path;
    }
    
    // Maintains proper stack trace for where error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Parse URL parameters and append them to the URL
 */
function parseParams(url: string, params?: Record<string, any>): string {
  if (!params) return url;
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(`${key}[]`, String(item)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
}

/**
 * Generate request headers with proper content type and authorization
 */
function getHeaders(customHeaders: HeadersInit = {}): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  });
  
  return headers;
}

/**
 * Generic API request function with strong typing
 */
export async function apiRequest<T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  // Process URL parameters if provided
  const fullUrl = parseParams(url, options.params);
  
  // Setup request headers
  const headers = getHeaders(options.headers);
  
  // Build request configuration
  const config: RequestInit = {
    method,
    headers,
    credentials: options.withCredentials ? 'include' : 'same-origin',
    ...options,
  };
  
  // Add request body for non-GET requests
  if (method !== 'GET' && data !== undefined) {
    config.body = JSON.stringify(data);
  }
  
  try {
    // Make the API request
    const response = await fetch(fullUrl, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('Content-Type') || '';
    
    // If the response is not JSON, handle accordingly
    if (!contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(response.statusText, response.status);
      }
      
      if (options.responseType === 'blob') {
        return await response.blob() as unknown as T;
      }
      
      if (options.responseType === 'text') {
        return await response.text() as unknown as T;
      }
      
      return undefined as unknown as T;
    }
    
    // Parse JSON response
    const responseData = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      const errorMessage = responseData.message || 'An unexpected error occurred';
      throw new ApiError(errorMessage, response.status, responseData);
    }
    
    // Return successful response
    return responseData;
  } catch (error) {
    // Handle fetch errors
    if (!(error instanceof ApiError)) {
      console.error('API Request Failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
    
    throw error;
  }
}

/**
 * Utility for invalidating queries in the cache
 */
export function invalidateQueries(queryKey: string | string[]) {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  return queryClient.invalidateQueries({ queryKey: key });
}

/**
 * Global response handler for common error patterns
 */
export function handleApiResponse<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((error: unknown) => {
    console.error('API Error:', error);
    
    // You could add global error notification here
    if (error instanceof ApiError) {
      // Handle specific HTTP status codes
      if (error.status === 401) {
        // Handle unauthorized/authentication error
        console.warn('Authentication required');
        // Could redirect to login page or refresh token
      } else if (error.status === 403) {
        // Handle forbidden/authorization error
        console.warn('Insufficient permissions');
      } else if (error.status === 404) {
        // Handle not found error
        console.warn('Resource not found');
      } else if (error.status >= 500) {
        // Handle server errors
        console.error('Server error occurred');
      }
    }
    
    throw error;
  });
}

/**
 * Helper to build query filters
 */
export function buildQueryFilters(filters: QueryFilters): Record<string, string> {
  const queryParams: Record<string, string> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        queryParams[`${key}`] = value.join(',');
      } else {
        queryParams[key] = String(value);
      }
    }
  });
  
  return queryParams;
}