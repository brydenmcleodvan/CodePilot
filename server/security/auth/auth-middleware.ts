import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { storage } from '../../storage';

// JWT token payload interface
interface JwtTokenPayload extends JwtPayload {
  userId: number;
  tokenId: string;
  roles: string[];
  type: 'access' | 'refresh';
}

// JWT verification options
const JWT_SECRET = process.env.JWT_SECRET || 'healthmap-development-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'healthmap-refresh-development-secret';

// Access token expiration (15 minutes)
const ACCESS_TOKEN_EXPIRY = '15m';
// Refresh token expiration (7 days)
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Middleware to verify JWT access token
 */
export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
    
    // Check if token type is 'access'
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    // Check if token has been revoked
    storage.getTokenById(decoded.tokenId).then((tokenMeta: any) => {
      if (!tokenMeta || tokenMeta.isRevoked) {
        return res.status(401).json({ message: 'Token has been revoked' });
      }
      
      // Set user info from token (extend Express.User interface)
      (req as any).user = { 
        id: decoded.userId,
        roles: decoded.roles,
        username: '', // Will be populated if needed
        email: '', // Will be populated if needed  
        name: null
      };
      
      next();
    }).catch((error: any) => {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Middleware to handle token refresh
 */
export function handleTokenRefresh(req: Request, res: Response, next: NextFunction) {
  // Get refresh token from httpOnly cookie
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }
  
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtTokenPayload;
    
    // Check if token type is 'refresh'
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    // Check if token has been revoked
    storage.getTokenById(decoded.tokenId).then((tokenMeta) => {
      if (!tokenMeta || tokenMeta.isRevoked) {
        return res.status(401).json({ message: 'Refresh token has been revoked' });
      }
      
      // Generate new tokens
      generateTokens(decoded.userId, decoded.roles)
        .then(({ accessToken, refreshToken, accessTokenId }) => {
          // Revoke old refresh token
          storage.revokeToken(decoded.tokenId);
          
          // Set new refresh token as http-only cookie
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            sameSite: 'strict'
          });
          
          // Return new access token
          res.json({ accessToken });
        })
        .catch((error) => {
          console.error('Error generating new tokens:', error);
          return res.status(500).json({ message: 'Failed to refresh token' });
        });
    }).catch((error) => {
      console.error('Error verifying refresh token:', error);
      return res.status(401).json({ message: 'Token refresh failed' });
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired', expired: true });
    }
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

/**
 * Middleware to verify JWT in cookie
 * This is used for routes that don't require the full user object
 */
export function authenticateJwtCookie(req: Request, res: Response, next: NextFunction) {
  // Get refresh token from httpOnly cookie
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return next(); // No token, continue (user is not authenticated)
  }
  
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtTokenPayload;
    
    // Check if token has been revoked
    storage.getTokenById(decoded.tokenId).then((tokenMeta) => {
      if (!tokenMeta || tokenMeta.isRevoked) {
        return next(); // Invalid token, continue (user is not authenticated)
      }
      
      // Set basic user info
      req.user = { 
        id: decoded.userId,
        roles: decoded.roles,
        tokenId: decoded.tokenId
      };
      
      next();
    }).catch((error) => {
      console.error('Error verifying cookie token:', error);
      next(); // Error, continue (user is not authenticated)
    });
  } catch (error) {
    next(); // Invalid token, continue (user is not authenticated)
  }
}

/**
 * Generate JWT tokens for a user (overloaded function)
 */
export async function generateTokens(user: { id: number; roles: string[] }): Promise<{ accessToken: string, refreshToken: string, accessTokenId: string }>;
export async function generateTokens(userId: number, roles: string[]): Promise<{ accessToken: string, refreshToken: string, accessTokenId: string }>;
export async function generateTokens(userOrId: { id: number; roles: string[] } | number, roles?: string[]): Promise<{ accessToken: string, refreshToken: string, accessTokenId: string }> {
  let userId: number;
  let userRoles: string[];

  if (typeof userOrId === 'object') {
    userId = userOrId.id;
    userRoles = userOrId.roles;
  } else {
    userId = userOrId;
    userRoles = roles || [];
  }

  // Generate unique token IDs
  const accessTokenId = generateTokenId();
  const refreshTokenId = generateTokenId();

  // Create token payload
  const accessPayload: JwtTokenPayload = {
    userId,
    tokenId: accessTokenId,
    roles: userRoles,
    type: 'access'
  };

  const refreshPayload: JwtTokenPayload = {
    userId,
    tokenId: refreshTokenId,
    roles: userRoles,
    type: 'refresh'
  };

  // Sign tokens
  const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  // Store token metadata
  await storage.storeTokenMetadata({
    userId,
    tokenId: refreshTokenId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    issuedAt: new Date(),
    isRevoked: false,
    clientInfo: {}
  });

  return { accessToken, refreshToken, accessTokenId };
}

/**
 * Generate a unique token ID
 */
function generateTokenId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}