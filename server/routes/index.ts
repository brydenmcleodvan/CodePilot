import { Router } from 'express';
import authRoutes from './auth-routes';
import { authenticateToken, requireAdmin, requireOwnership } from '../middleware/auth-middleware';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Add route protection to other existing routes
// Example of how to protect routes with our new middleware
router.get('/user/profile', authenticateToken, async (req, res) => {
  // This route is now protected by our enhanced JWT validation
  // The implementation would be moved from the current routes.ts file
  res.json({ message: 'This is a protected route' });
});

// Example of admin-only route
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  // Only accessible to admin users
  res.json({ message: 'Admin only route' });
});

// Example of resource ownership protection
router.get('/user/:userId/data', authenticateToken, requireOwnership('userId'), async (req, res) => {
  // Only accessible to the user who owns this resource
  res.json({ message: 'User can only access their own data' });
});

export default router;