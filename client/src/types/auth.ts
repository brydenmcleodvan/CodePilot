/**
 * Authentication and User Types
 * Core types used across the authentication system
 */

// Basic user profile
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  prefersDarkMode?: boolean;
  role?: UserRole;
  permissions?: string[];
  settings?: UserSettings;
}

// User roles for permission management
export type UserRole = 'user' | 'practitioner' | 'admin';

// User settings
export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: UserPreferences;
}

// Notification preferences
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Privacy settings
export interface PrivacySettings {
  shareHealthData: boolean;
  allowResearchUse: boolean;
  showProfileToUsers: boolean;
  showActivityStatus: boolean;
}

// User preferences
export interface UserPreferences {
  measurementUnit: 'metric' | 'imperial';
  language: string;
  theme: 'light' | 'dark' | 'system';
}

// Auth state returned from useAuth hook
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
  agreeToTerms: boolean;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password reset confirmation
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

// Email verification request
export interface EmailVerificationRequest {
  token: string;
}

// Profile update data
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
  settings?: Partial<UserSettings>;
}

// Authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// OAuth provider types
export type OAuthProvider = 'google' | 'apple' | 'facebook';

// OAuth authentication request
export interface OAuthRequest {
  provider: OAuthProvider;
  code: string;
}

// Session info
export interface SessionInfo {
  expiresAt: string;
  lastActive: string;
  device: string;
  location?: string;
  ipAddress?: string;
}

// Two-factor authentication setup
export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
}

// Two-factor authentication verification
export interface TwoFactorVerification {
  code: string;
  rememberDevice?: boolean;
}