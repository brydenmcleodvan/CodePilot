import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { storage } from '../storage';
import { insertUserSchema, loginSchema } from '@shared/schema';
import { 
  createAccessToken, 
  createRefreshToken, 
  handleTokenRefresh, 
  authenticateToken 
} from '../middleware/auth-middleware';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password with increased cost factor for better security
    const BCRYPT_COST_FACTOR = 12; // Increased from 10
    const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_COST_FACTOR);
    
    // Create new user
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Generate tokens
    const accessToken = createAccessToken(newUser.id, newUser.username);
    const refreshToken = createRefreshToken(newUser.id, newUser.username);
    
    // Return user without password and include tokens
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      user: userWithoutPassword, 
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login with username and password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginData = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(loginData.username);
    if (!user) {
      // Use the same message for both username and password errors
      // to prevent username enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = createAccessToken(user.id, user.username);
    const refreshToken = createRefreshToken(user.id, user.username);
    
    // Return user without password and include tokens
    const { password, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword, 
      accessToken,
      refreshToken 
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout endpoint - invalidate tokens
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // TODO: Implement token revocation when token storage is implemented
    // Currently, the client is responsible for removing tokens

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Refresh token endpoint
router.post('/refresh-token', handleTokenRefresh);

// Get current user info
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

export default router;