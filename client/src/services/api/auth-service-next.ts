/**
 * Auth Service Next Generation
 * Enhanced version based on the new service architecture
 */

import { ApiService } from '../core/api-service';
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
 * Enhanced Auth Service Implementation
 */
class AuthServiceNext extends ApiService implements IAuthService {
  /**
   * Base API endpoint path
   */
  protected basePath = '/api/auth';

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): Promise<User> {
    return this.get<User>('/user');
  }
  
  /**
   * Login a user with credentials
   */
  login(credentials: LoginCredentials): Promise<User> {
    return this.post<User>('/login', credentials);
  }
  
  /**
   * Register a new user
   */
  register(userData: RegisterData): Promise<User> {
    return this.post<User>('/register', userData);
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await this.post<void>('/logout');
    // Clear user-related cache on logout
    await this.clearCache('/user');
  }
  
  /**
   * Request a password reset
   */
  requestPasswordReset(request: PasswordResetRequest): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/password-reset', request);
  }
  
  /**
   * Reset password with token
   */
  resetPassword(data: PasswordResetConfirmation): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/password-reset/confirm', data);
  }
  
  /**
   * Change password (when user knows current password)
   */
  changePassword(
    userId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>(`/user/${userId}/change-password`, {
      currentPassword,
      newPassword
    });
  }
  
  /**
   * Verify email with token
   */
  verifyEmail(verification: EmailVerificationRequest): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/verify-email', verification);
  }
  
  /**
   * Resend verification email
   */
  resendVerificationEmail(email: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/resend-verification', { email });
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId: number, profileData: ProfileUpdateData): Promise<User> {
    const updatedUser = await this.patch<User>(`/user/${userId}`, profileData);
    // Update user in cache
    await this.clearCache('/user');
    return updatedUser;
  }
  
  /**
   * Upload profile picture
   */
  async uploadProfilePicture(userId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await this.post<{ url: string }>(
      `/user/${userId}/profile-picture`,
      formData,
      { 
        headers: {
          // Don't set Content-Type here, it will be set automatically with boundary
        }
      }
    );
    
    // Update user in cache since profile picture has changed
    await this.clearCache('/user');
    return response;
  }
  
  /**
   * Get user sessions
   */
  getSessions(userId: number): Promise<SessionInfo[]> {
    return this.get<SessionInfo[]>(`/user/${userId}/sessions`);
  }
  
  /**
   * Terminate a specific session
   */
  terminateSession(userId: number, sessionId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/user/${userId}/sessions/${sessionId}`);
  }
  
  /**
   * Terminate all sessions
   */
  terminateAllSessions(userId: number): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/user/${userId}/sessions`);
  }
  
  /**
   * Get OAuth URL for given provider
   */
  getOAuthUrl(provider: OAuthProvider): string {
    const baseUrl = window.location.origin;
    return `${this.basePath}/oauth/${provider}?redirect_uri=${encodeURIComponent(`${baseUrl}/auth/callback`)}`;
  }
  
  /**
   * Authenticate with OAuth
   */
  async authenticateWithOAuth(request: OAuthRequest): Promise<User> {
    const user = await this.post<User>(`/oauth/${request.provider}/callback`, {
      code: request.code
    });
    
    // Update user in cache
    await this.clearCache('/user');
    return user;
  }
  
  /**
   * Refresh access token
   */
  refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    return this.post<AuthTokens>('/refresh-token', { refreshToken });
  }
}

// Export a singleton instance of the auth service
export const authServiceNext = new AuthServiceNext();

// Export the service interface type
export type AuthServiceType = IAuthService;