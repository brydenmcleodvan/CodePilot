/**
 * Configuration for security settings
 * 
 * Centralizes security-related configuration to ensure consistency
 * across the application and enable easy updates.
 */

export const SecurityConfig = {
  /**
   * JWT configuration
   */
  jwt: {
    // Token expiration times
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    
    // Cookie settings
    cookies: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: 'strict' as const
    },
    
    // Claims to include in tokens
    claims: {
      issuer: 'healthmap-auth',
      audience: 'healthmap-api'
    }
  },
  
  /**
   * Password policy settings
   */
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptCost: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes in milliseconds
  },
  
  /**
   * Session configuration
   */
  session: {
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
    absoluteTimeout: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  },
  
  /**
   * HTTP Security Headers
   */
  headers: {
    // Content Security Policy
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://*'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.healthmap.com']
    },
    
    // Other security headers
    frameOptions: 'DENY',
    xssProtection: '1; mode=block',
    noSniff: true,
    referrerPolicy: 'strict-origin-when-cross-origin'
  },
  
  /**
   * Rate limiting configuration
   */
  rateLimit: {
    // General API limits
    standard: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // requests per window
    },
    
    // Login attempt limits
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5 // login attempts per window
    }
  }
};

/**
 * Apply the proper security policy based on environment
 */
export function getSecurityPolicy(env: string = process.env.NODE_ENV || 'development'): typeof SecurityConfig {
  // For production, use stricter settings
  if (env === 'production') {
    return {
      ...SecurityConfig,
      jwt: {
        ...SecurityConfig.jwt,
        accessTokenExpiry: '5m', // Shorter token lifetime in production
      },
      password: {
        ...SecurityConfig.password,
        bcryptCost: 14, // Higher cost factor for production
      }
    };
  }
  
  // For testing, use relaxed settings
  if (env === 'test') {
    return {
      ...SecurityConfig,
      jwt: {
        ...SecurityConfig.jwt,
        accessTokenExpiry: '1h', // Longer expiry for testing
      },
      password: {
        ...SecurityConfig.password,
        bcryptCost: 4, // Lower cost factor for faster tests
      }
    };
  }
  
  // Default to development settings
  return SecurityConfig;
}

// Export current environment's security policy
export const CurrentSecurityPolicy = getSecurityPolicy();