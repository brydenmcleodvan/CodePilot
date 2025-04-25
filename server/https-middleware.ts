import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to enforce HTTPS connections
 * 
 * This middleware checks if the request is secure; if not, it redirects to HTTPS.
 * It handles Replit's proxy by checking various headers.
 * 
 * @returns Express middleware function
 */
export const enforceHttps = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip in development environment
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    // Check if request is already secure or is a localhost request
    const isSecure = req.secure ||
      req.headers['x-forwarded-proto'] === 'https' ||
      (req.headers['x-forwarded-ssl'] === 'on');

    if (isSecure) {
      // Request is already secure, proceed
      return next();
    } else {
      // Check if we're in an environment that supports HTTPS
      const host = req.headers.host || req.hostname;
      
      // If it's localhost or a Replit preview, just continue without redirect
      if (host?.includes('localhost') || host?.includes('0.0.0.0') || host?.includes('127.0.0.1')) {
        return next();
      }

      // Redirect to HTTPS
      const redirectUrl = `https://${host}${req.originalUrl}`;
      return res.redirect(301, redirectUrl);
    }
  };
};

/**
 * Middleware to add security headers
 * 
 * Adds various security headers to protect against common web vulnerabilities
 * 
 * @returns Express middleware function
 */
export const securityHeaders = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' plausible.io; style-src 'self' 'unsafe-inline'; connect-src 'self' api.openai.com plausible.io; img-src 'self' data: https://*;"
    );

    // Prevent browsers from incorrectly detecting non-scripts as scripts
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Disable browser features that might compromise security
    res.setHeader('Permissions-Policy', 'geolocation=self, microphone=(), camera=()');

    // Don't expose what server technology we're using
    res.setHeader('X-Powered-By', 'Healthmap');

    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    next();
  };
};