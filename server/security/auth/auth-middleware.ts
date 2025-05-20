import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../../storage';
import { User } from '@shared/schema';

/**
 * Configuration for authentication middleware
 */
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'healthmap-dev-secret',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};

/**
 * Interface for decoded JWT token payload
 */
export interface TokenPayload {
  userId: number;
  tokenId: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, AUTH_CONFIG.jwtSecret) as TokenPayload;
    
    // Check if token has been revoked
    const tokenMetadata = await storage.getTokenById(decoded.tokenId);
    if (!tokenMetadata || tokenMetadata.isRevoked) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach token data and user to request
    req.user = user;
    req.tokenData = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to handle token refresh
 */
export const handleTokenRefresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, AUTH_CONFIG.jwtSecret) as TokenPayload;
    
    // Check if token has been revoked
    const tokenMetadata = await storage.getTokenById(decoded.tokenId);
    if (!tokenMetadata || tokenMetadata.isRevoked) {
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    // Revoke old refresh token
    await storage.revokeToken(decoded.tokenId, 'Token refresh');

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, AUTH_CONFIG.cookieOptions);

    // Return new access token
    res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
    }
    
    console.error('Token refresh error:', error);
    return res.status(401).json({ message: 'Token refresh failed' });
  }
};

/**
 * Optional authentication middleware - doesn't require auth but attaches user if available
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, AUTH_CONFIG.jwtSecret) as TokenPayload;
    
    // Check if token has been revoked
    const tokenMetadata = await storage.getTokenById(decoded.tokenId);
    if (!tokenMetadata || tokenMetadata.isRevoked) {
      return next();
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return next();
    }

    // Attach token data and user to request
    req.user = user;
    req.tokenData = decoded;

    next();
  } catch (error) {
    // In optional auth, we don't fail on errors
    next();
  }
};

/**
 * Generate JWT tokens (access and refresh) for a user
 */
export const generateTokens = async (user: User) => {
  // Generate token ID
  const tokenId = generateTokenId();
  
  // Generate access token
  const accessToken = jwt.sign(
    { userId: user.id, tokenId },
    AUTH_CONFIG.jwtSecret,
    { expiresIn: AUTH_CONFIG.accessTokenExpiry }
  );
  
  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId: user.id, tokenId },
    AUTH_CONFIG.jwtSecret,
    { expiresIn: AUTH_CONFIG.refreshTokenExpiry }
  );

  // Store token metadata
  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  
  await storage.storeTokenMetadata({
    tokenId,
    userId: user.id,
    expiresAt: new Date(decoded.exp! * 1000),
    isRevoked: false,
    clientInfo: {}
  });

  return { accessToken, refreshToken };
};

/**
 * Generate a random token ID
 */
const generateTokenId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Extend Express Request interface to include user and token data
declare global {
  namespace Express {
    interface Request {
      user?: User;
      tokenData?: TokenPayload;
    }
  }
}