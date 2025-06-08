/**
 * Service Factory
 * Central access point for all services with automatic initialization
 */

import { authServiceNext, type IAuthService } from './api/auth-service-next';
import { healthMetricsService, type IHealthMetricsService } from './api/health-metrics-service';

/**
 * Service Registry
 * Add all services here to make them available through the factory
 */
export interface ServiceRegistry {
  auth: IAuthService;
  healthMetrics: IHealthMetricsService;
  // Add other services as they are created
}

/**
 * Service Factory
 * Provides unified access to all services
 */
class ServiceFactory implements ServiceRegistry {
  private static _instance: ServiceFactory;
  
  // Service instances
  private _auth: IAuthService = authServiceNext;
  private _healthMetrics: IHealthMetricsService = healthMetricsService;
  
  /**
   * Get singleton instance
   */
  static getInstance(): ServiceFactory {
    if (!ServiceFactory._instance) {
      ServiceFactory._instance = new ServiceFactory();
    }
    return ServiceFactory._instance;
  }
  
  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}
  
  /**
   * Get auth service
   */
  get auth(): IAuthService {
    return this._auth;
  }
  
  /**
   * Get health metrics service
   */
  get healthMetrics(): IHealthMetricsService {
    return this._healthMetrics;
  }
  
  /**
   * Set a service implementation
   * Useful for testing and dependency injection
   */
  setService<K extends keyof ServiceRegistry>(
    serviceKey: K, 
    implementation: ServiceRegistry[K]
  ): void {
    const privateKey = `_${serviceKey}` as `_${K}`;
    (this as any)[privateKey] = implementation;
  }
  
  /**
   * Initialize all services with shared configuration
   */
  initialize(): void {
    // Set common configuration across services
    [this._auth, this._healthMetrics].forEach(service => {
      service.configure({
        retry: true,
        maxRetries: 3,
        timeout: 30000
      });
    });
  }
  
  /**
   * Reset all service configurations
   */
  reset(): void {
    [this._auth, this._healthMetrics].forEach(service => {
      service.resetConfiguration();
    });
  }
}

// Export a singleton instance
export const services = ServiceFactory.getInstance();

// Initialize services on import
services.initialize();