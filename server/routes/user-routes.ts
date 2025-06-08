import { Router } from 'express';
import { storage } from '../storage';
import { authenticateToken } from '../security/auth/auth-middleware';
import { requireOwnership } from '../security/auth/auth-middleware';
import { sanitizeInputs, validateWith } from '../security/utils/input-sanitization';
import { ResourceType, ResourceAction } from '../security/permissions/permission-types';
import { requirePermission } from '../security/permissions/permission-checker';
import { z } from 'zod';

const router = Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// Profile update validation schema
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  profilePicture: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  preferences: z.string().optional().nullable()
});

/**
 * @route GET /user/profile
 * @description Get user profile
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    // Remove sensitive data
    const { password, ...userProfile } = user;
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve user profile',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route PATCH /user/profile
 * @description Update user profile
 * @access Private
 */
router.patch(
  '/profile', 
  authenticateToken,
  requirePermission(ResourceType.USER, ResourceAction.UPDATE),
  validateWith(updateProfileSchema),
  async (req, res) => {
    try {
      // Verify user exists
      const existingUser = await storage.getUser(req.user.id);
      
      if (!existingUser) {
        return res.status(404).json({ 
          message: 'User not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Check if email is being updated and is already in use
      if (req.body.email && req.body.email !== existingUser.email) {
        const emailExists = await storage.getUserByEmail(req.body.email);
        if (emailExists) {
          return res.status(409).json({ 
            message: 'Email already in use',
            code: 'DUPLICATE_RESOURCE'
          });
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      
      // Remove sensitive data
      const { password, ...userProfile } = updatedUser;
      
      res.json({
        user: userProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ 
        message: 'Failed to update user profile',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route GET /user/settings
 * @description Get user settings
 * @access Private
 */
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    // Get user settings (assuming it's stored in the preferences field as JSON)
    let settings = {};
    
    if (user.preferences) {
      try {
        settings = JSON.parse(user.preferences);
      } catch (error) {
        // If preferences is not valid JSON, use empty object
        console.error('Error parsing user preferences:', error);
      }
    }
    
    res.json({
      settings,
      userId: user.id
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve user settings',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route PATCH /user/settings
 * @description Update user settings
 * @access Private
 */
router.patch('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    // Get existing settings
    let settings = {};
    
    if (user.preferences) {
      try {
        settings = JSON.parse(user.preferences);
      } catch (error) {
        // If preferences is not valid JSON, use empty object
        console.error('Error parsing user preferences:', error);
      }
    }
    
    // Merge with new settings
    const updatedSettings = {
      ...settings,
      ...req.body
    };
    
    // Save updated settings
    await storage.updateUser(req.user.id, {
      preferences: JSON.stringify(updatedSettings)
    });
    
    res.json({
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ 
      message: 'Failed to update user settings',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route GET /user/health-data
 * @description Get user health data
 * @access Private
 */
router.get('/health-data', authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    // Get health data (assuming it's stored in the healthData field as JSON)
    let healthData = {};
    
    if (user.healthData) {
      try {
        healthData = JSON.parse(user.healthData);
      } catch (error) {
        // If healthData is not valid JSON, use empty object
        console.error('Error parsing user health data:', error);
      }
    }
    
    res.json(healthData);
  } catch (error) {
    console.error('Error getting user health data:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve health data',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route PATCH /user/health-data
 * @description Update user health data
 * @access Private
 */
router.patch(
  '/health-data', 
  authenticateToken,
  requirePermission(ResourceType.HEALTH_DATA, ResourceAction.UPDATE),
  async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Get existing health data
      let healthData = {};
      
      if (user.healthData) {
        try {
          healthData = JSON.parse(user.healthData);
        } catch (error) {
          // If healthData is not valid JSON, use empty object
          console.error('Error parsing user health data:', error);
        }
      }
      
      // Merge with new health data
      const updatedHealthData = {
        ...healthData,
        ...req.body,
        lastUpdated: new Date().toISOString()
      };
      
      // Save updated health data
      await storage.updateUser(req.user.id, {
        healthData: JSON.stringify(updatedHealthData)
      });
      
      res.json({
        healthData: updatedHealthData,
        message: 'Health data updated successfully'
      });
    } catch (error) {
      console.error('Error updating user health data:', error);
      res.status(500).json({ 
        message: 'Failed to update health data',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /user/account
 * @description Delete user account
 * @access Private
 */
router.delete(
  '/account', 
  authenticateToken,
  requirePermission(ResourceType.USER, ResourceAction.DELETE),
  async (req, res) => {
    try {
      // Delete user account
      const deleted = await storage.deleteUser(req.user.id);
      
      if (!deleted) {
        return res.status(404).json({ 
          message: 'User not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user account:', error);
      res.status(500).json({ 
        message: 'Failed to delete account',
        code: 'SERVER_ERROR'
      });
    }
  }
);

export default router;