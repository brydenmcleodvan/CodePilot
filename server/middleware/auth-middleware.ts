import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Secure JWT configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'access-secret-key-8x97H';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-secret-key-2p9R';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'; // Longer-lived refresh token

// Warning for default secrets in production
if (process.env.NODE_ENV === 'production' && 
    (JWT_ACCESS_SECRET === 'access-secret-key-8x97H' || JWT_REFRESH_SECRET === 'refresh-secret-key-2p9R')) {
  console.warn(
    'WARNING: Using default JWT secrets in production. ' +
    'Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.'
  );
}

// Token types for validation
enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh'
}

// Token interfaces
interface TokenBase {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}

interface AccessTokenPayload extends TokenBase {
  type: TokenType.ACCESS;
  jti?: string; // JWT ID used for token revocation
}

interface RefreshTokenPayload extends TokenBase {
  type: TokenType.REFRESH;
  jti?: string; // JWT ID used for token revocation
  family?: string; // Token family for detecting theft/reuse
}

/**
 * Create a new access token for a user
 */
export function createAccessToken(userId: number, username: string): string {
  const payload: AccessTokenPayload = {
    id: userId,
    username,
    type: TokenType.ACCESS,
    jti: generateTokenId()
  };
  
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    audience: 'healthmap-api',
    issuer: 'healthmap-auth'
  });
}

/**
 * Create a new refresh token for a user
 */
export function createRefreshToken(userId: number, username: string, family?: string): string {
  const payload: RefreshTokenPayload = {
    id: userId,
    username,
    type: TokenType.REFRESH,
    jti: generateTokenId(),
    family: family || generateTokenId() // Create a new family if not provided
  };
  
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    audience: 'healthmap-api',
    issuer: 'healthmap-auth'
  });
}

/**
 * Generate a unique token ID for revocation
 */
function generateTokenId(): string {
  return Math.random().toString(36).substring(2) + 
         Date.now().toString(36) + 
         Math.random().toString(36).substring(2);
}

/**
 * Authentication middleware that validates JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decodedToken = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
    
    // Ensure token is an access token
    if (decodedToken.type !== TokenType.ACCESS) {
      return res.status(403).json({ message: 'Invalid token type' });
    }
    
    // TODO: Check if token has been revoked (when token storage is implemented)
    // if (isTokenRevoked(decodedToken.jti)) {
    //   return res.status(403).json({ message: 'Token has been revoked' });
    // }
    
    // Set user on request for further use
    req.user = {
      id: decodedToken.id,
      username: decodedToken.username
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'token_expired' // Client can use this to request a token refresh
      });
    }
    
    return res.status(403).json({ message: 'Invalid token' });
  }
};

/**
 * Handles refresh token requests to issue new access tokens
 */
export const handleTokenRefresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }
  
  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    
    // Ensure token is a refresh token
    if (decodedToken.type !== TokenType.REFRESH) {
      return res.status(403).json({ message: 'Invalid token type' });
    }
    
    // TODO: Check if token has been revoked (when token storage is implemented)
    // if (isTokenRevoked(decodedToken.jti)) {
    //   return res.status(403).json({ message: 'Token has been revoked' });
    // }
    
    // Get user from database to verify they still exist
    const user = await storage.getUser(decodedToken.id);
    if (!user) {
      return res.status(403).json({ message: 'User no longer exists' });
    }
    
    // Create new tokens (token rotation)
    const newAccessToken = createAccessToken(user.id, user.username);
    const newRefreshToken = createRefreshToken(user.id, user.username, decodedToken.family);
    
    // TODO: Invalidate the old refresh token (when token storage is implemented)
    // await revokeToken(decodedToken.jti);
    
    // Return the new tokens
    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired, please login again' });
    }
    
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

/**
 * Middleware to require admin role
 * Note: Depends on the authenticateToken middleware being called first
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // This would check if the user has admin role
  // For now, we'll assume a simple admin check by username
  if (req.user && (req.user.username === 'admin' || req.user.isAdmin)) {
    return next();
  }
  
  return res.status(403).json({ message: 'Admin privileges required' });
};

/**
 * Middleware to check ownership of a resource
 * Usage: requireOwnership('userId')
 */
export function requireOwnership(userIdField: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resourceUserId = parseInt(req.params[userIdField] || req.body[userIdField]);
    
    if (isNaN(resourceUserId)) {
      return res.status(400).json({ message: 'Invalid user ID parameter' });
    }
    
    if (req.user && req.user.id === resourceUserId) {
      return next();
    }
    
    // Allow admins to bypass ownership check
    if (req.user && (req.user.username === 'admin' || req.user.isAdmin)) {
      return next();
    }
    
    return res.status(403).json({ message: 'You do not have permission to access this resource' });
  };
}