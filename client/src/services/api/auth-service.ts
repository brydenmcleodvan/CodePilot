/**
 * Auth Service
 * Handles all authentication-related API interactions
 */

import { apiRequest, handleApiResponse, invalidateQueries } from './base-api';
import type { 
  User, 
  LoginCredentials, 
  RegisterData,
  ProfileUpdateData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  EmailVerificationRequest,
  SessionInfo,
  OAuthRequest,
  OAuthProvider,
  AuthTokens
} from '@/types';

/**
 * Auth Service Interface
 * Defines all authentication operations
 */
export interface IAuthService {
  // User authentication
  getCurrentUser(): Promise<User>;
  login(credentials: LoginCredentials): Promise<User>;
  register(userData: RegisterData): Promise<User>;
  logout(): Promise<void>;
  
  // Password management
  requestPasswordReset(request: PasswordResetRequest): Promise<{ success: boolean }>;
  resetPassword(data: PasswordResetConfirmation): Promise<{ success: boolean }>;
  changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean }>;
  
  // Email verification
  verifyEmail(verification: EmailVerificationRequest): Promise<{ success: boolean }>;
  resendVerificationEmail(email: string): Promise<{ success: boolean }>;
  
  // Profile management
  updateProfile(userId: number, profileData: ProfileUpdateData): Promise<User>;
  uploadProfilePicture(userId: number, file: File): Promise<{ url: string }>;
  
  // Session management
  getSessions(userId: number): Promise<SessionInfo[]>;
  terminateSession(userId: number, sessionId: string): Promise<{ success: boolean }>;
  terminateAllSessions(userId: number): Promise<{ success: boolean }>;
  
  // OAuth integration
  getOAuthUrl(provider: OAuthProvider): string;
  authenticateWithOAuth(request: OAuthRequest): Promise<User>;
  
  // Token management
  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;
}

/**
 * Auth Service Implementation
 */
class AuthService implements IAuthService {
  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): Promise<User> {
    return handleApiResponse(
      apiRequest<User>('GET', '/api/user')
    );
  }
  
  /**
   * Login a user with credentials
   */
  login(credentials: LoginCredentials): Promise<User> {
    return handleApiResponse(
      apiRequest<User>('POST', '/api/login', credentials)
    );
  }
  
  /**
   * Register a new user
   */
  register(userData: RegisterData): Promise<User> {
    return handleApiResponse(
      apiRequest<User>('POST', '/api/register', userData)
    );
  }
  
  /**
   * Logout the current user
   */
  logout(): Promise<void> {
    return handleApiResponse(
      apiRequest<void>('POST', '/api/logout')
        .then(response => {
          // Clear any user-related cache on logout
          invalidateQueries(['/api/user']);
          return response;
        })
    );
  }
  
  /**
   * Request a password reset
   */
  requestPasswordReset(request: PasswordResetRequest): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('POST', '/api/auth/password-reset', request)
    );
  }
  
  /**
   * Reset password with token
   */
  resetPassword(data: PasswordResetConfirmation): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('POST', '/api/auth/password-reset/confirm', data)
    );
  }
  
  /**
   * Change password (when user knows current password)
   */
  changePassword(
    userId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('POST', `/api/user/${userId}/change-password`, {
        currentPassword,
        newPassword
      })
    );
  }
  
  /**
   * Verify email with token
   */
  verifyEmail(verification: EmailVerificationRequest): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('POST', '/api/auth/verify-email', verification)
    );
  }
  
  /**
   * Resend verification email
   */
  resendVerificationEmail(email: string): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('POST', '/api/auth/resend-verification', { email })
    );
  }
  
  /**
   * Update user profile
   */
  updateProfile(userId: number, profileData: ProfileUpdateData): Promise<User> {
    return handleApiResponse(
      apiRequest<User>('PATCH', `/api/user/${userId}`, profileData)
        .then(updatedUser => {
          // Update user in cache
          invalidateQueries(['/api/user']);
          return updatedUser;
        })
    );
  }
  
  /**
   * Upload profile picture
   */
  uploadProfilePicture(userId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return handleApiResponse(
      apiRequest<{ url: string }>(
        'POST', 
        `/api/user/${userId}/profile-picture`,
        formData,
        { 
          headers: {
            // Don't set Content-Type here, it will be set automatically with boundary
          }
        }
      ).then(response => {
        invalidateQueries(['/api/user']);
        return response;
      })
    );
  }
  
  /**
   * Get user sessions
   */
  getSessions(userId: number): Promise<SessionInfo[]> {
    return handleApiResponse(
      apiRequest<SessionInfo[]>('GET', `/api/user/${userId}/sessions`)
    );
  }
  
  /**
   * Terminate a specific session
   */
  terminateSession(userId: number, sessionId: string): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('DELETE', `/api/user/${userId}/sessions/${sessionId}`)
    );
  }
  
  /**
   * Terminate all sessions
   */
  terminateAllSessions(userId: number): Promise<{ success: boolean }> {
    return handleApiResponse(
      apiRequest<{ success: boolean }>('DELETE', `/api/user/${userId}/sessions`)
    );
  }
  
  /**
   * Get OAuth URL for given provider
   */
  getOAuthUrl(provider: OAuthProvider): string {
    const baseUrl = window.location.origin;
    return `/api/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(`${baseUrl}/auth/callback`)}`;
  }
  
  /**
   * Authenticate with OAuth
   */
  authenticateWithOAuth(request: OAuthRequest): Promise<User> {
    return handleApiResponse(
      apiRequest<User>('POST', `/api/auth/oauth/${request.provider}/callback`, {
        code: request.code
      }).then(user => {
        invalidateQueries(['/api/user']);
        return user;
      })
    );
  }
  
  /**
   * Refresh access token
   */
  refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    return handleApiResponse(
      apiRequest<AuthTokens>('POST', '/api/auth/refresh-token', { refreshToken })
    );
  }
}

// Export a singleton instance of the auth service
export const authService = new AuthService();

// Export the service interface type
export type AuthServiceType = IAuthService;