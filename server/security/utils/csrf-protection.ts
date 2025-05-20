import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF Token generation and validation
 * 
 * Uses double submit cookie pattern for CSRF protection
 */

// Constants
const CSRF_COOKIE_NAME = 'X-CSRF-Token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_BYTES = 32;
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Token storage for server-side validation
const tokenStore = new Map<string, { userId: number, expires: Date }>();

/**
 * Generate a cryptographically secure CSRF token
 * 
 * @returns A random token
 */
function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * Clean up expired tokens periodically
 */
function cleanupExpiredTokens() {
  const now = new Date();
  let count = 0;
  
  for (const [token, data] of tokenStore.entries()) {
    if (data.expires < now) {
      tokenStore.delete(token);
      count++;
    }
  }
  
  if (count > 0) {
    console.log(`Cleaned up ${count} expired CSRF tokens`);
  }
}

// Set up a timer to clean expired tokens
setInterval(cleanupExpiredTokens, 60 * 60 * 1000); // Run every hour

/**
 * Middleware to set CSRF token
 * 
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Only set for authenticated users
  if (!req.user || !req.user.id) {
    return next();
  }
  
  // Generate a new token
  const token = generateToken();
  
  // Store the token with user ID and expiration
  const expires = new Date(Date.now() + TOKEN_TTL);
  tokenStore.set(token, { userId: req.user.id, expires });
  
  // Set as a cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_TTL
  });
  
  // Also make it available in the response for JS
  res.setHeader('X-CSRF-Token', token);
  
  next();
}

/**
 * Middleware to verify CSRF token
 * 
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Only verify for authenticated users
  if (!req.user || !req.user.id) {
    return next();
  }
  
  // Get token from header
  const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string;
  
  // Get token from cookie
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  
  // Verify both tokens exist and match
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      message: 'CSRF token validation failed',
      code: 'CSRF_ERROR'
    });
  }
  
  // Get token data
  const tokenData = tokenStore.get(headerToken);
  
  // Verify token exists, belongs to correct user, and is not expired
  if (!tokenData || 
      tokenData.userId !== req.user.id || 
      tokenData.expires < new Date()) {
    
    // Clean up if token is expired
    if (tokenData && tokenData.expires < new Date()) {
      tokenStore.delete(headerToken);
    }
    
    return res.status(403).json({
      message: 'CSRF token is invalid or expired',
      code: 'CSRF_ERROR'
    });
  }
  
  next();
}

/**
 * Regenerate CSRF token for a user
 * 
 * @param req Request object
 * @param res Response object
 */
export function regenerateCsrfToken(req: Request, res: Response) {
  if (!req.user || !req.user.id) {
    return;
  }
  
  // Clear old token if it exists
  const oldToken = req.cookies[CSRF_COOKIE_NAME];
  if (oldToken) {
    tokenStore.delete(oldToken);
  }
  
  // Generate a new token
  const token = generateToken();
  
  // Store the token with user ID and expiration
  const expires = new Date(Date.now() + TOKEN_TTL);
  tokenStore.set(token, { userId: req.user.id, expires });
  
  // Set as a cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_TTL
  });
  
  // Also make it available in the response for JS
  res.setHeader('X-CSRF-Token', token);
  
  return token;
}