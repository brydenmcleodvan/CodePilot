import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  maxAge?: number;
  private?: boolean;
  immutable?: boolean;
}

/**
 * Middleware that sets Cache-Control headers for static assets
 * 
 * @param options Cache configuration options
 * @returns Express middleware function
 */
export const cacheControl = (options: CacheOptions = {}) => {
  const { 
    maxAge = 86400, // 1 day in seconds by default
    private: isPrivate = false,
    immutable = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Setting the Cache-Control header
    const directives = [
      isPrivate ? 'private' : 'public',
      `max-age=${maxAge}`
    ];

    if (immutable) {
      directives.push('immutable');
    }

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
};

/**
 * Sets appropriate cache headers based on file type
 * 
 * @returns Express middleware function
 */
export const setAssetCacheHeaders = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    
    // Handle different asset types with appropriate cache settings
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
      // Images - cache for longer periods
      cacheControl({ 
        maxAge: 2592000, // 30 days
        immutable: true 
      })(req, res, next);
    } 
    else if (path.match(/\.(css|js)$/i)) {
      // CSS and JS files - cache but may change on deploys
      cacheControl({ 
        maxAge: 604800, // 7 days
        immutable: false 
      })(req, res, next);
    } 
    else if (path.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
      // Fonts - rarely change, long cache
      cacheControl({ 
        maxAge: 31536000, // 1 year
        immutable: true 
      })(req, res, next);
    } 
    else {
      // Default handling for other assets
      next();
    }
  };
};