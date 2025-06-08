import { Router } from 'express';
import authRoutes from './auth-routes';
import { authenticateToken } from '../security/auth/auth-middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes - all routes below this middleware require authentication
router.use(authenticateToken);

// User routes will go here
// router.use('/user', userRoutes);

// Health data routes will go here
// router.use('/health', healthRoutes);

export default router;