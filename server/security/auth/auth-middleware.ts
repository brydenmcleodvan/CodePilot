import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { User } from '@shared/schema';
import { randomUUID } from 'crypto';
import { storage } from '../../storage';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'healthmap-dev-secret';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Interface for the JWT payload
interface JwtTokenPayload extends JwtPayload {
  userId: number;
  tokenId: string;
  roles: string[];
  type: 'access' | 'refresh';
}

/**
 * Middleware to verify JWT access token
 */
export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET as Secret) as JwtTokenPayload;
    
    // Check token type
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    // Check if token has been revoked
    storage.getTokenById(decoded.tokenId).then(tokenMeta => {
      if (!tokenMeta || tokenMeta.isRevoked) {
        return res.status(401).json({ message: 'Token has been revoked' });
      }
      
      // Set user info in request object
      req.user = { id: decoded.userId, roles: decoded.roles } as User;
      next();
    }).catch(error => {
      console.error('Error checking token revocation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Access token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
    console.error('JWT verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Middleware to handle token refresh
 */
export function handleTokenRefresh(req: Request, res: Response, next: NextFunction) {
  // Extract refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET as Secret) as JwtTokenPayload;
    
    // Check token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    // Check if token has been revoked
    storage.getTokenById(decoded.tokenId).then(async tokenMeta => {
      if (!tokenMeta || tokenMeta.isRevoked) {
        return res.status(401).json({ message: 'Refresh token has been revoked' });
      }
      
      // Get user
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Revoke old refresh token
      await storage.revokeToken(decoded.tokenId, 'Rotation during refresh');
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);
      
      // Set new refresh token cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Set response
      res.locals.user = user;
      res.locals.accessToken = accessToken;
      
      next();
    }).catch(error => {
      console.error('Error during token refresh:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    console.error('JWT verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Middleware to verify JWT in cookie
 * This is used for routes that don't require the full user object
 */
export function authenticateJwtCookie(req: Request, res: Response, next: NextFunction) {
  // Extract token from cookie
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET as Secret) as JwtTokenPayload;
    
    // Check if token has been revoked
    storage.getTokenById(decoded.tokenId).then(tokenMeta => {
      if (!tokenMeta || tokenMeta.isRevoked) {
        return res.status(401).json({ message: 'Token has been revoked' });
      }
      
      // Set user ID in request object
      req.user = { id: decoded.userId, roles: decoded.roles } as User;
      next();
    }).catch(error => {
      console.error('Error checking token revocation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('JWT verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Generate JWT tokens for a user
 */
export async function generateTokens(user: User): Promise<{ accessToken: string, refreshToken: string }> {
  // Generate unique token IDs
  const accessTokenId = randomUUID();
  const refreshTokenId = randomUUID();
  
  // Current time
  const now = Math.floor(Date.now() / 1000);
  
  // Calculate expiration times
  const accessExpiry = now + parseInt(JWT_ACCESS_EXPIRY.replace('m', '')) * 60;
  const refreshExpiry = now + parseInt(JWT_REFRESH_EXPIRY.replace('d', '')) * 24 * 60 * 60;
  
  // Create token payloads
  const accessPayload: JwtTokenPayload = {
    userId: user.id,
    tokenId: accessTokenId,
    roles: user.roles || [],
    type: 'access',
    iat: now,
    exp: accessExpiry
  };
  
  const refreshPayload: JwtTokenPayload = {
    userId: user.id,
    tokenId: refreshTokenId,
    roles: user.roles || [],
    type: 'refresh',
    iat: now,
    exp: refreshExpiry
  };
  
  // Sign tokens
  const accessToken = jwt.sign(accessPayload, JWT_SECRET as Secret);
  const refreshToken = jwt.sign(refreshPayload, JWT_SECRET as Secret);
  
  // Store refresh token metadata
  await storage.storeTokenMetadata({
    tokenId: refreshTokenId,
    userId: user.id,
    expiresAt: new Date(refreshExpiry * 1000),
    isRevoked: false,
    clientInfo: { userAgent: 'unknown' }
  });
  
  return { accessToken, refreshToken };
}