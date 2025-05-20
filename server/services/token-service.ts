import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from '../storage';
import { TokenRevocation, InsertTokenRevocation } from '@shared/token-schema';

// Token types
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface TokenPayload {
  id: number;
  username: string;
  tokenId?: string; // For token invalidation
  type: TokenType;
}

// Token service for secure JWT operations
export class TokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;
  
  constructor() {
    // Ensure secure secrets are used
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || this.generateSecureSecret();
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || this.generateSecureSecret();
    
    // Set token expiration times
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m'; // Short-lived access token
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d'; // Longer-lived refresh token
    
    // Warn if default secrets are being used in production
    if (process.env.NODE_ENV === 'production' && 
        (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) {
      console.warn(
        'WARNING: Using auto-generated JWT secrets in production. ' +
        'Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.'
      );
    }
  }
  
  // Generate a secure random secret
  private generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }
  
  // Generate a unique token ID for revocation
  private generateTokenId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
  
  // Create an access token
  public createAccessToken(userId: number, username: string): string {
    const tokenId = this.generateTokenId();
    
    const payload: TokenPayload = {
      id: userId,
      username,
      tokenId,
      type: TokenType.ACCESS
    };
    
    const options: SignOptions = {
      expiresIn: this.accessTokenExpiry,
      audience: 'healthmap-api',
      issuer: 'healthmap-auth',
    };
    
    const token = jwt.sign(payload, this.accessTokenSecret, options);
    
    // Store token info for potential revocation
    this.storeTokenMetadata(userId, tokenId, TokenType.ACCESS);
    
    return token;
  }
  
  // Create a refresh token
  public createRefreshToken(userId: number, username: string): string {
    const tokenId = this.generateTokenId();
    
    const payload: TokenPayload = {
      id: userId,
      username,
      tokenId,
      type: TokenType.REFRESH
    };
    
    const options: SignOptions = {
      expiresIn: this.refreshTokenExpiry,
      audience: 'healthmap-api',
      issuer: 'healthmap-auth',
    };
    
    const token = jwt.sign(payload, this.refreshTokenSecret, options);
    
    // Store token info for potential revocation
    this.storeTokenMetadata(userId, tokenId, TokenType.REFRESH);
    
    return token;
  }
  
  // Verify an access token
  public verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        audience: 'healthmap-api',
        issuer: 'healthmap-auth',
      }) as TokenPayload;
      
      // Check if token has been revoked
      if (payload.tokenId && this.isTokenRevoked(payload.tokenId)) {
        throw new Error('Token has been revoked');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
  
  // Verify a refresh token
  public verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        audience: 'healthmap-api',
        issuer: 'healthmap-auth',
      }) as TokenPayload;
      
      // Check if token has been revoked
      if (payload.tokenId && this.isTokenRevoked(payload.tokenId)) {
        throw new Error('Token has been revoked');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  // Store token metadata for revocation
  private async storeTokenMetadata(userId: number, tokenId: string, type: TokenType): Promise<void> {
    // This would be implemented with storage.addToken
    // For now, we'll just log it
    console.log(`Storing token metadata: userId=${userId}, tokenId=${tokenId}, type=${type}`);
    // Todo: Implement storage for token validation
  }
  
  // Check if a token has been revoked
  private isTokenRevoked(tokenId: string): boolean {
    // This would be implemented with storage.isTokenRevoked
    // For now, always return false (not revoked)
    return false;
    // Todo: Implement token revocation check
  }
  
  // Revoke a specific token
  public async revokeToken(tokenId: string): Promise<void> {
    // This would be implemented with storage.revokeToken
    console.log(`Revoking token: tokenId=${tokenId}`);
    // Todo: Implement token revocation
  }
  
  // Revoke all tokens for a user
  public async revokeAllUserTokens(userId: number): Promise<void> {
    // This would be implemented with storage.revokeAllUserTokens
    console.log(`Revoking all tokens for user: userId=${userId}`);
    // Todo: Implement all user tokens revocation
  }
}

// Export singleton instance
export const tokenService = new TokenService();