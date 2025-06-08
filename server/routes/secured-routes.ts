import { Router } from 'express';
import userRoutes from './user-routes';
import healthRoutes from './health-routes';
import authRoutes from './auth-routes';
import { authenticateToken } from '../security/auth/auth-middleware';
import { apiRateLimiter, userRateLimiter } from '../security/utils/rate-limiter';
import { sanitizeInputs } from '../security/utils/input-sanitization';
import { setCsrfToken, verifyCsrfToken } from '../security/utils/csrf-protection';

const router = Router();

// Apply global middleware to all routes
router.use(sanitizeInputs);
router.use(apiRateLimiter);

// Public routes (no authentication required)
// Auth routes have their own specific rate limiters applied internally
router.use('/auth', authRoutes);

// Apply authentication to all routes below this point
router.use(authenticateToken);

// Apply CSRF protection for authenticated routes
router.use(setCsrfToken);
router.use(verifyCsrfToken);

// Apply user-based rate limiting for authenticated routes
router.use(userRateLimiter);

// User routes
router.use('/user', userRoutes);

// Health routes
router.use('/health', healthRoutes);

export default router;