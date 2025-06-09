/**
 * Core security types that are shared across the security module
 */

/**
 * User with authentication information
 */
export interface AuthUser {
  id: number;
  username: string;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

/**
 * Resource with ownership information
 */
export interface OwnedResource {
  id: number;
  userId: number;
  [key: string]: any;
}

/**
 * Authentication result
 */
export interface AuthResult {
  user: Omit<AuthUser, 'password'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Security error types
 */
export enum SecurityErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_ERROR = 'CSRF_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

/**
 * Standard security error response
 */
export interface SecurityErrorResponse {
  message: string;
  code: SecurityErrorType;
  details?: any;
  status: number;
}

/**
 * User login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * User registration data
 */
export interface RegistrationData {
  username: string;
  password: string;
  email: string;
  name: string;
  [key: string]: any;
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLogEntry {
  timestamp: Date;
  userId?: number;
  action: string;
  resource?: string;
  resourceId?: number | string;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  isBlocked: boolean;
  blockDuration?: number;
}

/**
 * Consent record for privacy management
 */
export interface ConsentRecord {
  userId: number;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  expiresAt?: Date;
  details?: any;
}