/**
 * Services Barrel File
 * Provides convenient access to all services
 */

// API Base
export * from './api/base-api';

// Auth Service
export { authService, type AuthServiceType } from './api/auth-service';

// Auth Adapter
export { authAdapter } from './adapters/auth-adapter';