import { Request, Response, NextFunction } from "express";

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
    // Skip the redirect in development environment
    if (process.env.NODE_ENV === "development") {
      return next();
    }

    // Check for Replit-specific headers or standard proxy headers
    const isSecure = req.secure || 
                    (req.headers["x-forwarded-proto"] === "https") || 
                    (req.headers["x-forwarded-ssl"] === "on");
    
    if (isSecure) {
      // Connection is already secure, proceed to next middleware
      return next();
    } else {
      // Redirect to HTTPS version of the same URL
      const host = req.headers.host || req.hostname;
      const redirectUrl = `https://${host}${req.originalUrl}`;
      
      // 301 status means "permanently moved"
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
    // Prevent browsers from incorrectly detecting non-scripts as scripts
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Restrict a page from being displayed in an iframe (anti-clickjacking)
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    
    // Enable browser's XSS filtering
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Prevent loading any resources from external domains (security enhancement)
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "connect-src 'self' api.openai.com api.perplexity.ai;"
      );
    }
    
    // Instructs browsers to strictly use HTTPS for the specified time
    res.setHeader(
      "Strict-Transport-Security", 
      "max-age=31536000; includeSubDomains"
    );
    
    // Disallow sending the referrer header when navigating from HTTPS to HTTP
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Prevent MIME type sniffing 
    res.setHeader("X-Download-Options", "noopen");
    
    // Permissions policy to restrict access to browser features
    res.setHeader(
      "Permissions-Policy", 
      "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
    );
    
    next();
  };
};