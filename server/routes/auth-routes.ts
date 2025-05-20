import { Router } from 'express';
import { ZodError } from 'zod';
import { insertUserSchema, loginSchema } from '@shared/schema';
import { authService } from '../security/auth/auth-service';
import { loginRateLimiter, registrationRateLimiter, passwordResetRateLimiter } from '../security/utils/rate-limiter';
import { sanitizeInputs, validateWith } from '../security/utils/input-sanitization';

const router = Router();

// Apply sanitization to all routes
router.use(sanitizeInputs);

/**
 * @route POST /auth/register
 * @description Register a new user with secure password handling
 * @access Public
 */
router.post('/register', registrationRateLimiter, validateWith(insertUserSchema), async (req, res) => {
  try {
    // Validate input with Zod schema
    const userData = insertUserSchema.parse(req.body);
    
    // Register new user with secure password handling
    const user = await authService.registerUser(userData);
    
    // Generate tokens
    const tokens = await authService.generateTokens(user);
    
    // Return user data and tokens
    res.status(201).json({
      user,
      ...tokens,
      message: 'User registered successfully'
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('already in use')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'DUPLICATE_RESOURCE'
        });
      }
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route POST /auth/login
 * @description Login user and issue tokens
 * @access Public
 */
router.post('/login', loginRateLimiter, validateWith(loginSchema), async (req, res) => {
  try {
    // Validate login data
    const loginData = loginSchema.parse(req.body);
    
    // Authenticate user and generate tokens
    const { user, accessToken, refreshToken } = await authService.loginUser(loginData);
    
    // Set refresh token as an HTTP-only cookie for better security
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    // Return user data and access token
    res.json({
      user,
      accessToken,
      message: 'Login successful'
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (error instanceof Error && 
        (error.message.includes('Invalid username') || error.message.includes('Invalid password'))) {
      return res.status(401).json({ 
        message: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route POST /auth/refresh
 * @description Refresh access token using refresh token
 * @access Public (with refresh token)
 */
router.post('/refresh', async (req, res) => {
  // Get refresh token from cookie or request body
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ 
      message: 'Refresh token is required',
      code: 'TOKEN_REQUIRED'
    });
  }
  
  try {
    // Generate new tokens
    const tokens = await authService.refreshTokens(refreshToken);
    
    // Set new refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    // Return new access token
    res.json({
      accessToken: tokens.accessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      message: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

/**
 * @route POST /auth/logout
 * @description Logout user and revoke tokens
 * @access Public (with refresh token)
 */
router.post('/logout', async (req, res) => {
  // Get refresh token from cookie or request body
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (refreshToken) {
    // Revoke the token
    await authService.logoutUser(refreshToken);
  }
  
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  
  res.json({ message: 'Logged out successfully' });
});

/**
 * @route POST /auth/logout-all
 * @description Logout from all devices (revoke all tokens)
 * @access Private
 */
router.post('/logout-all', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  try {
    // Revoke all tokens for the user
    const count = await authService.revokeAllUserTokens(req.user.id, 'User-initiated logout from all devices');
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.json({ 
      message: 'Logged out from all devices successfully',
      tokenCount: count
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ 
      message: 'Server error during logout',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;