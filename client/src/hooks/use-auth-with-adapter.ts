/**
 * Combined Auth Hook with Adapter
 * Provides backward compatibility during the transition period
 */

import { useAuth as useOriginalAuth } from '@/lib/auth';
import { authAdapter } from '@/services/adapters/auth-adapter';
import { useAuthService } from './use-auth-service';

/**
 * This hook provides a smooth transition path:
 * 1. For legacy components, they can keep using useAuth() as before
 * 2. For new components, they can use useAuthService() directly
 * 3. During transition, this hook ensures both remain compatible
 */
export function useAuth() {
  // Get the original auth context
  const originalAuth = useOriginalAuth();
  
  // Optionally, also get the new auth service
  // This isn't strictly necessary for the adapter pattern,
  // but could be useful during transition if you want to
  // access new functionality while maintaining compatibility
  const newAuthService = useAuthService();
  
  // Create an adapter that makes the new service work with the old interface
  const adaptedAuth = authAdapter.createAuthContextAdapter(originalAuth);
  
  // Return the adapted auth
  // Components using this hook will continue to work as before
  return adaptedAuth;
}

// For new code, export the modern hook directly
export { useAuthService };