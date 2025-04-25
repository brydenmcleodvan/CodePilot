/**
 * Auth Adapter
 * Maintains backward compatibility with existing auth hooks and components
 */

import { authService, type AuthServiceType } from '../api/auth-service';
import type { LoginCredentials, RegisterData, User } from '@/types';

// Let's look at what our existing useAuth hook returns
// This is a simplified version based on common patterns - adjust to match your actual implementation
interface ExistingAuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: {
    mutate: (credentials: LoginCredentials) => void;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    onError?: (error: Error) => void;
  };
  registerMutation: {
    mutate: (data: RegisterData) => void;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    onError?: (error: Error) => void;
  };
  logoutMutation: {
    mutate: () => void;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

/**
 * Auth Adapter Class
 * Provides backward compatibility between the new service and existing auth patterns
 */
export class AuthAdapter {
  private service: AuthServiceType;
  
  constructor(service: AuthServiceType = authService) {
    this.service = service;
  }
  
  /**
   * Adapter method for login
   * Maintains the same API as the original hook
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      return await this.service.login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
  
  /**
   * Adapter method for registration
   * Maintains the same API as the original hook
   */
  async register(data: RegisterData): Promise<User> {
    try {
      return await this.service.register(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Adapter method for logout
   * Maintains the same API as the original hook
   */
  async logout(): Promise<void> {
    try {
      return await this.service.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
  
  /**
   * Adapter for getting the current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await this.service.getCurrentUser();
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }
  
  /**
   * Adapter for updating profile
   */
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    try {
      return await this.service.updateProfile(userId, data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
  
  /**
   * Creates an adapter that integrates with the existing useAuth hook
   * This allows gradual migration without breaking existing components
   */
  createAuthContextAdapter(existingAuth: ExistingAuthContextType): ExistingAuthContextType {
    return {
      ...existingAuth, // Keep all existing properties
      
      // Override with new implementations that call our service
      login: async (credentials: LoginCredentials) => {
        try {
          return await this.service.login(credentials);
        } catch (error) {
          // Use the existing error handler if available
          if (existingAuth.loginMutation.onError && error instanceof Error) {
            existingAuth.loginMutation.onError(error);
          }
          throw error;
        }
      },
      
      register: async (data: RegisterData) => {
        try {
          return await this.service.register(data);
        } catch (error) {
          // Use the existing error handler if available
          if (existingAuth.registerMutation.onError && error instanceof Error) {
            existingAuth.registerMutation.onError(error);
          }
          throw error;
        }
      },
      
      logout: async () => {
        try {
          return await this.service.logout();
        } catch (error) {
          console.error('Logout failed:', error);
          throw error;
        }
      }
    };
  }
}

// Export a singleton instance of the auth adapter
export const authAdapter = new AuthAdapter(authService);

// Direct export of the service for new code
export { authService };