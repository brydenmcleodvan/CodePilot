import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from '../tokens/jwt-handler';
import { tokenStorage } from '../tokens/token-storage';
import { hashPassword, comparePasswords } from '../utils/password-utils';
import { storage } from '../../storage';

/**
 * Authentication service with enhanced security
 */
export class AuthService {
  /**
   * Register a new user with secure password hashing
   * 
   * @param userData User registration data
   * @returns The created user without password
   */
  async registerUser(userData: any) {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }
    
    // Hash password with improved security
    const hashedPassword = await hashPassword(userData.password);
    
    // Create new user with hashed password
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Remove password from the returned user object
    const { password, ...userWithoutPassword } = newUser;
    
    return userWithoutPassword;
  }
  
  /**
   * Login a user and generate secure tokens
   * 
   * @param loginData User login credentials
   * @returns Access token, refresh token, and user data
   */
  async loginUser(loginData: { username: string; password: string }) {
    // Find user by username
    const user = await storage.getUserByUsername(loginData.username);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Verify password using secure comparison
    const isPasswordValid = await comparePasswords(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Remove password from the returned user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      ...tokens,
      user: userWithoutPassword
    };
  }
  
  /**
   * Generate access and refresh tokens for a user
   * 
   * @param user User to generate tokens for
   * @returns Access and refresh tokens
   */
  async generateTokens(user: any) {
    // Prepare user payload with minimal required data
    const userPayload = {
      id: user.id,
      username: user.username,
      role: user.role || 'user' // Default role
    };
    
    // Create tokens
    const accessToken = createAccessToken(userPayload);
    const refreshToken = createRefreshToken(userPayload);
    
    // Store token metadata for potential revocation
    // Extract token ID (jti) from the refresh token
    const refreshTokenData = verifyRefreshToken(refreshToken);
    if (refreshTokenData.jti) {
      // Calculate token expiry
      const refreshExpiry = new Date();
      refreshExpiry.setDate(refreshExpiry.getDate() + 7); // 7 days
      
      // Store token metadata
      await tokenStorage.storeToken(user.id, refreshTokenData.jti, refreshExpiry);
    }
    
    return {
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Refresh tokens using a valid refresh token
   * 
   * @param refreshToken The refresh token to use
   * @returns New access and refresh tokens
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Verify the refresh token
      const userData = verifyRefreshToken(refreshToken);
      
      // Check if token has been revoked
      if (userData.jti && await tokenStorage.isTokenRevoked(userData.jti)) {
        throw new Error('Token has been revoked');
      }
      
      // Get the user from storage
      const user = await storage.getUser(userData.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Revoke the old refresh token
      if (userData.jti) {
        await tokenStorage.revokeToken(userData.jti, 'Token rotation');
      }
      
      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      // If token validation fails, force re-authentication
      throw new Error('Invalid refresh token. Please log in again.');
    }
  }
  
  /**
   * Logout a user by revoking their refresh token
   * 
   * @param refreshToken The refresh token to revoke
   * @returns True if logout was successful
   */
  async logoutUser(refreshToken: string) {
    try {
      // Verify the refresh token
      const userData = verifyRefreshToken(refreshToken);
      
      // Revoke the token if it has a valid ID
      if (userData.jti) {
        await tokenStorage.revokeToken(userData.jti, 'User logout');
      }
      
      return true;
    } catch (error) {
      // If token is invalid, logout is still considered successful
      return true;
    }
  }
  
  /**
   * Revoke all tokens for a user (force logout everywhere)
   * 
   * @param userId The user ID
   * @param reason Optional reason for revocation
   * @returns Number of tokens revoked
   */
  async revokeAllUserTokens(userId: number, reason?: string) {
    return await tokenStorage.revokeAllUserTokens(userId, reason || 'Admin revocation');
  }
  
  /**
   * Verify and decode an access token
   * 
   * @param accessToken The access token to verify
   * @returns Decoded user data
   */
  verifyToken(accessToken: string) {
    return verifyAccessToken(accessToken);
  }
}

// Export singleton instance
export const authService = new AuthService();