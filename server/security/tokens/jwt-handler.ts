import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Configure JWT secrets and expiration times
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Longer-lived refresh token

// Warn if using default secrets in production
if (process.env.NODE_ENV === 'production' && 
    (!process.env.JWT_ACCESS_SECRET && !process.env.JWT_SECRET)) {
  console.warn(
    'WARNING: Using randomly generated JWT secrets in production. ' +
    'Set JWT_ACCESS_SECRET or JWT_SECRET environment variables.'
  );
}

/**
 * Token types for better security
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh'
}

/**
 * User payload for JWT tokens
 */
export interface UserPayload {
  id: number;
  username: string;
  [key: string]: any; // Allow for additional claims
}

/**
 * Create a JWT access token with enhanced security
 */
export function createAccessToken(user: UserPayload): string {
  return jwt.sign(
    { 
      ...user,
      type: TokenType.ACCESS,
      jti: generateTokenId() // Add unique token ID for potential revocation
    },
    ACCESS_TOKEN_SECRET,
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      audience: 'healthmap-api',
      issuer: 'healthmap-auth'
    }
  );
}

/**
 * Create a JWT refresh token for token rotation
 */
export function createRefreshToken(user: UserPayload): string {
  return jwt.sign(
    { 
      ...user,
      type: TokenType.REFRESH,
      jti: generateTokenId(),
      family: generateTokenId() // Token family for refresh token rotation
    },
    REFRESH_TOKEN_SECRET,
    { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      audience: 'healthmap-api',
      issuer: 'healthmap-auth'
    }
  );
}

/**
 * Verify a JWT access token
 */
export function verifyAccessToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as UserPayload & { type?: TokenType };
    
    // Ensure token is an access token
    if (decoded.type !== TokenType.ACCESS) {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw error; // Let caller handle different error types
  }
}

/**
 * Verify a JWT refresh token
 */
export function verifyRefreshToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload & { type?: TokenType };
    
    // Ensure token is a refresh token
    if (decoded.type !== TokenType.REFRESH) {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw error; // Let caller handle different error types
  }
}

/**
 * Generate a unique token ID for revocation
 */
function generateTokenId(): string {
  return crypto.randomBytes(16).toString('hex');
}