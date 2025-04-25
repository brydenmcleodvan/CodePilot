/**
 * API Types
 * Core types for API interactions
 */

// HTTP methods supported by our API
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Base API response structure
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}

// Error response from the API
export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  stack?: string;
  timestamp?: string;
  path?: string;
}

// Pagination parameters for API requests
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Pagination metadata in responses
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// API request options
export interface ApiRequestOptions extends RequestInit {
  secure?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
  withCredentials?: boolean;
  responseType?: 'json' | 'blob' | 'text';
  retries?: number;
  retryDelay?: number;
}

// Query parameters for filtering
export interface QueryFilters {
  [key: string]: string | number | boolean | string[] | undefined;
}

// API cache control options
export interface CacheOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
  ignoreCache?: boolean;
}

// API service configuration
export interface ApiServiceConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  defaultCacheOptions?: CacheOptions;
}