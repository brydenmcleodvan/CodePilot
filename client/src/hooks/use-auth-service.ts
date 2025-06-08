/**
 * Auth Service Hook
 * Modern React Query hook for auth service that can be used in new components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api/auth-service';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  ProfileUpdateData
} from '@/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for using auth service with React Query
 */
export function useAuthService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query for current user
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    // Don't throw errors to the UI if we just aren't logged in
    throwOnError: false
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      authService.login(credentials),
    onSuccess: (loggedInUser: User) => {
      // Update the user in cache
      queryClient.setQueryData(['/api/user'], loggedInUser);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back${loggedInUser.name ? ', ' + loggedInUser.name.split(' ')[0] : ''}!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      authService.register(data),
    onSuccess: (newUser: User) => {
      // Update the user in cache
      queryClient.setQueryData(['/api/user'], newUser);
      
      toast({
        title: 'Registration Successful',
        description: `Welcome to Healthmap${newUser.name ? ', ' + newUser.name.split(' ')[0] : ''}!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unable to create account. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Remove user from cache
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout Failed',
        description: error.message || 'Something went wrong during logout.',
        variant: 'destructive',
      });
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number, data: ProfileUpdateData }) => 
      authService.updateProfile(userId, data),
    onSuccess: (updatedUser: User) => {
      // Update the user in cache
      queryClient.setQueryData(['/api/user'], updatedUser);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Unable to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Helper function for getting the auth status
  const isAuthenticated = !!user;
  
  // Helper functions that wrap mutations with better DX
  const login = (credentials: LoginCredentials) => loginMutation.mutate(credentials);
  const register = (data: RegisterData) => registerMutation.mutate(data);
  const logout = () => logoutMutation.mutate();
  const updateProfile = (userId: number, data: ProfileUpdateData) => 
    updateProfileMutation.mutate({ userId, data });
  
  return {
    // Auth state
    user,
    isLoading,
    error,
    isAuthenticated,
    refetchUser: refetch,
    
    // Helper functions
    login,
    register,
    logout,
    updateProfile,
    
    // Raw mutations (for more control)
    loginMutation,
    registerMutation,
    logoutMutation,
    updateProfileMutation,
    
    // Raw service for advanced use cases
    authService,
  };
}