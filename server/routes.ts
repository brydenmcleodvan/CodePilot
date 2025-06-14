import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  insertUserSchema,
  loginSchema,
  insertForumPostSchema,
  insertUserDeviceSchema,
  insertConnectedDeviceSchema,
  type InsertHealthStat,
} from "@shared/schema";
import {
  fetchAppleHealthData,
  exchangeAppleHealthCode,
  refreshAppleHealthToken,
} from "./providers/appleHealth";
import {
  fetchFitbitData,
  exchangeFitbitCode,
  refreshFitbitToken,
} from "./providers/fitbit";
import { fetchGoogleFitData, exchangeGoogleFitCode, refreshGoogleFitToken } from "./providers/googleFit";
import { sendEmail, verificationEmailTemplate, resetPasswordEmailTemplate } from "./utils/email";
import { logError } from "./utils/logger";
import { ZodError, z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "healthmap-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "healthmap-refresh-secret";

// Temporary in-memory store mapping OAuth state strings to connection IDs
const oauthStateMap = new Map<string, number>();

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    req.body.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = '/api';
  
  // Auth routes
  app.post(`${apiRouter}/auth/register`, async (req, res) => {
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
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create new user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT token and refresh token
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
        expiresIn: '15m'
      });
      const refreshTokenValue = crypto.randomBytes(40).toString('hex');
      await storage.createRefreshToken({
        userId: newUser.id,
        token: refreshTokenValue,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        revoked: false,
      });

      // Return user without password and include token
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword, token, refreshToken: refreshTokenValue });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  app.post(`${apiRouter}/auth/login`, async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      // Generate JWT token and refresh token
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '15m'
      });
      const refreshTokenValue = crypto.randomBytes(40).toString('hex');
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshTokenValue,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        revoked: false,
      });
      await storage.createSession(user.id);
      await storage.addMetric({ userId: user.id, actionType: 'login', timestamp: new Date() });

      // Return user without password and include token
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token, refreshToken: refreshTokenValue });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      await logError('Server error during login', undefined, (error as Error).stack);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  app.post(`${apiRouter}/auth/refresh`, async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
    const stored = await storage.getRefreshToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const user = await storage.getUser(stored.userId);
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    await storage.revokeRefreshToken(refreshToken);
    const newRefresh = crypto.randomBytes(40).toString('hex');
    await storage.createRefreshToken({
      userId: stored.userId,
      token: newRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      revoked: false,
    });

    const newAccess = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token: newAccess, refreshToken: newRefresh });
  });

  app.post(`${apiRouter}/auth/logout`, async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (refreshToken) {
      await storage.revokeRefreshToken(refreshToken);
    }
    if (req.body.user?.id) {
      await storage.addMetric({ userId: req.body.user.id, actionType: 'logout', timestamp: new Date() });
    }
    res.json({ message: 'Logged out' });
  });

  app.post(`${apiRouter}/auth/request-password-reset`, async (req, res) => {
    const { email } = req.body as { email: string };
    const user = email ? await storage.getUserByEmail(email) : undefined;
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link was sent' });
    }
    const token = jwt.sign({ id: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    await sendEmail(user.email, 'Password Reset', resetPasswordEmailTemplate(token));
    res.json({ message: 'Reset email sent' });
  });

  app.post(`${apiRouter}/auth/reset-password`, async (req, res) => {
    try {
      const { token, password } = req.body as { token: string; password: string };
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload.type !== 'reset') throw new Error('invalid token');
      const user = await storage.getUser(payload.id);
      if (!user) return res.status(400).json({ message: 'Invalid token' });
      const hashed = await bcrypt.hash(password, 10);
      await storage.updateUser(user.id, { password: hashed });
      res.json({ message: 'Password updated' });
    } catch {
      res.status(400).json({ message: 'Invalid or expired token' });
    }
  });

  app.post(`${apiRouter}/auth/send-verification`, authenticateToken, async (req, res) => {
    const userId = req.body.user.id;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = jwt.sign({ id: user.id, type: 'verify' }, JWT_SECRET, { expiresIn: '1d' });
    await sendEmail(user.email, 'Verify Email', verificationEmailTemplate(token));
    res.json({ message: 'Verification email sent' });
  });

  app.get(`${apiRouter}/auth/verify-email`, async (req, res) => {
    try {
      const token = req.query.token as string;
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload.type !== 'verify') throw new Error('invalid');
      const user = await storage.getUser(payload.id);
      if (!user) return res.status(400).json({ message: 'Invalid token' });
      await storage.updateUser(user.id, { emailVerified: true });
      res.send('Email verified');
    } catch {
      res.status(400).send('Invalid or expired token');
    }
  });
  
  // User profile routes
  app.get(`${apiRouter}/user/profile`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching profile' });
    }
  });

  app.patch(`${apiRouter}/user/profile`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        age: z.number().int().positive().optional(),
        healthGoals: z.string().optional(),
      });
      const updateData = updateSchema.parse(req.body);

      const updated = await storage.updateUser(userId, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error updating profile' });
    }
  });
  
  // Health stats routes
  app.get(`${apiRouter}/health/stats`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const stats = await storage.getUserHealthStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching health stats' });
    }
  });

  // Return HTTP server
  return createServer(app);
}