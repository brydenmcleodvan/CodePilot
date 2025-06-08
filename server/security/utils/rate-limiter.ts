import { Request, Response, NextFunction } from 'express';
import { CurrentSecurityPolicy } from './security-config';

/**
 * Rate limiter implementation to protect against brute force attacks
 * 
 * Uses in-memory storage with IP and user-based tracking
 */

// Types for rate limit tracking
interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  lastAttempt: number;
  warnings: number;
}

// Stores for different limit types
const ipLimitStore = new Map<string, RateLimitRecord>();
const userLimitStore = new Map<string, RateLimitRecord>();
const endpointLimitStore = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Get the first IP if it's a comma-separated list
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0];
  }
  
  return req.ip || req.socket.remoteAddress || '0.0.0.0';
}

/**
 * Clean up expired rate limit records
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  let count = 0;
  
  // Clean IP limits
  for (const [ip, record] of ipLimitStore.entries()) {
    if (record.resetTime < now && !record.blocked) {
      ipLimitStore.delete(ip);
      count++;
    }
  }
  
  // Clean user limits
  for (const [userId, record] of userLimitStore.entries()) {
    if (record.resetTime < now && !record.blocked) {
      userLimitStore.delete(userId);
      count++;
    }
  }
  
  // Clean endpoint limits
  for (const [endpoint, userMap] of endpointLimitStore.entries()) {
    let deleted = 0;
    for (const [key, record] of userMap.entries()) {
      if (record.resetTime < now && !record.blocked) {
        userMap.delete(key);
        deleted++;
        count++;
      }
    }
    
    // If all records for an endpoint are deleted, remove the endpoint
    if (deleted > 0 && userMap.size === 0) {
      endpointLimitStore.delete(endpoint);
    }
  }
  
  if (count > 0) {
    console.log(`Rate limiter cleanup: removed ${count} expired records`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);

/**
 * IP-based rate limiter for general API limits
 * 
 * @param options Customization options
 */
export function ipRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  statusCode?: number;
  blockDuration?: number;  // how long to block after max attempts in ms
  includeHeaders?: boolean;
} = {}) {
  const {
    windowMs = CurrentSecurityPolicy.rateLimit.standard.windowMs,
    maxRequests = CurrentSecurityPolicy.rateLimit.standard.maxRequests,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    blockDuration = 60 * 60 * 1000, // 1 hour
    includeHeaders = true
  } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();
    
    // Skip if it's a safe method (GET, HEAD)
    if (['GET', 'HEAD'].includes(req.method) && options.maxRequests === undefined) {
      return next();
    }
    
    // Get or create rate limit record
    let record = ipLimitStore.get(ip);
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false,
        lastAttempt: now,
        warnings: 0
      };
      ipLimitStore.set(ip, record);
    }
    
    // Check if IP is blocked
    if (record.blocked) {
      if (includeHeaders) {
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      }
      
      return res.status(statusCode).json({
        message: 'Access temporarily blocked due to suspicious activity',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    // Reset count if window has expired
    if (record.resetTime <= now) {
      record.count = 0;
      record.resetTime = now + windowMs;
      record.warnings = 0;
    }
    
    // Increment request count
    record.count++;
    record.lastAttempt = now;
    
    // Calculate remaining requests
    const remaining = Math.max(0, maxRequests - record.count);
    
    // Add rate limit headers if requested
    if (includeHeaders) {
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());
    }
    
    // If we've exceeded the limit, send a warning first
    if (record.count > maxRequests) {
      record.warnings++;
      
      // After 3 warnings, block the IP
      if (record.warnings >= 3) {
        record.blocked = true;
        record.resetTime = now + blockDuration;
        
        if (includeHeaders) {
          res.setHeader('Retry-After', Math.ceil(blockDuration / 1000));
        }
        
        return res.status(statusCode).json({
          message: 'Access temporarily blocked due to suspicious activity',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(blockDuration / 1000)
        });
      }
      
      // Just a warning for now
      return res.status(statusCode).json({
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        warning: true,
        warningCount: record.warnings,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

/**
 * User-based rate limiter for authenticated requests
 * 
 * @param options Customization options
 */
export function userRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  statusCode?: number;
  blockDuration?: number;
  includeHeaders?: boolean;
} = {}) {
  const {
    windowMs = CurrentSecurityPolicy.rateLimit.standard.windowMs,
    maxRequests = CurrentSecurityPolicy.rateLimit.standard.maxRequests,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    blockDuration = 60 * 60 * 1000, // 1 hour
    includeHeaders = true
  } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if not authenticated
    if (!req.user || !req.user.id) {
      return next();
    }
    
    const userId = req.user.id.toString();
    const now = Date.now();
    
    // Get or create rate limit record
    let record = userLimitStore.get(userId);
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false,
        lastAttempt: now,
        warnings: 0
      };
      userLimitStore.set(userId, record);
    }
    
    // Check if user is blocked
    if (record.blocked) {
      if (includeHeaders) {
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      }
      
      return res.status(statusCode).json({
        message: 'Access temporarily blocked due to suspicious activity',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    // Reset count if window has expired
    if (record.resetTime <= now) {
      record.count = 0;
      record.resetTime = now + windowMs;
      record.warnings = 0;
    }
    
    // Increment request count
    record.count++;
    record.lastAttempt = now;
    
    // Calculate remaining requests
    const remaining = Math.max(0, maxRequests - record.count);
    
    // Add rate limit headers if requested
    if (includeHeaders) {
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());
    }
    
    // If we've exceeded the limit
    if (record.count > maxRequests) {
      record.warnings++;
      
      // After 3 warnings, block the user
      if (record.warnings >= 3) {
        record.blocked = true;
        record.resetTime = now + blockDuration;
        
        if (includeHeaders) {
          res.setHeader('Retry-After', Math.ceil(blockDuration / 1000));
        }
        
        return res.status(statusCode).json({
          message: 'Access temporarily blocked due to too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(blockDuration / 1000)
        });
      }
      
      return res.status(statusCode).json({
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        warning: true,
        warningCount: record.warnings,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

/**
 * Endpoint-specific rate limiter - useful for limiting specific actions
 * like login attempts, password resets, etc.
 * 
 * @param endpoint The endpoint identifier
 * @param options Customization options
 */
export function endpointRateLimiter(
  endpoint: string,
  options: {
    windowMs?: number;
    maxRequests?: number;
    message?: string;
    statusCode?: number;
    blockDuration?: number;
    includeHeaders?: boolean;
    identifierExtractor?: (req: Request) => string;
  } = {}
) {
  const {
    windowMs = CurrentSecurityPolicy.rateLimit.login.windowMs,
    maxRequests = CurrentSecurityPolicy.rateLimit.login.maxRequests,
    message = 'Too many attempts, please try again later',
    statusCode = 429,
    blockDuration = 60 * 60 * 1000, // 1 hour
    includeHeaders = true,
    identifierExtractor = getClientIp // Default to IP-based identification
  } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = identifierExtractor(req);
    const now = Date.now();
    
    // Get or create endpoint store
    let endpointStore = endpointLimitStore.get(endpoint);
    if (!endpointStore) {
      endpointStore = new Map<string, RateLimitRecord>();
      endpointLimitStore.set(endpoint, endpointStore);
    }
    
    // Get or create rate limit record
    let record = endpointStore.get(identifier);
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false,
        lastAttempt: now,
        warnings: 0
      };
      endpointStore.set(identifier, record);
    }
    
    // Check if client is blocked
    if (record.blocked) {
      if (includeHeaders) {
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      }
      
      return res.status(statusCode).json({
        message: 'Access temporarily blocked due to too many failed attempts',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    // Reset count if window has expired
    if (record.resetTime <= now) {
      record.count = 0;
      record.resetTime = now + windowMs;
      record.warnings = 0;
    }
    
    // Increment request count
    record.count++;
    record.lastAttempt = now;
    
    // Calculate remaining requests
    const remaining = Math.max(0, maxRequests - record.count);
    
    // Add rate limit headers if requested
    if (includeHeaders) {
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());
    }
    
    // If we've exceeded the limit
    if (record.count > maxRequests) {
      // For sensitive endpoints like login, we block immediately
      record.blocked = true;
      record.resetTime = now + blockDuration;
      
      if (includeHeaders) {
        res.setHeader('Retry-After', Math.ceil(blockDuration / 1000));
      }
      
      return res.status(statusCode).json({
        message: 'Too many attempts, access temporarily blocked',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(blockDuration / 1000)
      });
    }
    
    next();
  };
}

/**
 * Create login attempt rate limiter
 * Stricter limits for authentication endpoints
 */
export const loginRateLimiter = endpointRateLimiter('login', {
  windowMs: CurrentSecurityPolicy.rateLimit.login.windowMs,
  maxRequests: CurrentSecurityPolicy.rateLimit.login.maxRequests,
  message: 'Too many login attempts, please try again later',
  blockDuration: 30 * 60 * 1000 // 30 minutes
});

/**
 * Create password reset rate limiter
 */
export const passwordResetRateLimiter = endpointRateLimiter('password-reset', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // Only 3 requests per hour
  message: 'Too many password reset attempts, please try again later',
  blockDuration: 24 * 60 * 60 * 1000 // 24 hours
});

/**
 * Create registration rate limiter
 */
export const registrationRateLimiter = endpointRateLimiter('registration', {
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 5, // Only 5 registrations per day
  message: 'Too many registration attempts, please try again later',
  blockDuration: 24 * 60 * 60 * 1000 // 24 hours
});

/**
 * Create API rate limiter for general use
 */
export const apiRateLimiter = ipRateLimiter({
  windowMs: CurrentSecurityPolicy.rateLimit.standard.windowMs,
  maxRequests: CurrentSecurityPolicy.rateLimit.standard.maxRequests
});