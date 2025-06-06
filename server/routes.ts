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

  // AI Health Assistant route
  app.post(`${apiRouter}/health/assistant`, authenticateToken, async (req, res) => {
    try {
      const { query } = req.body;
      // For now, return mock responses
      const responses = {
        'sleep': 'Based on your sleep data, you\'re averaging 7.2 hours per night. Try to maintain a consistent sleep schedule for better quality rest.',
        'stress': 'Your stress levels appear elevated. Consider trying meditation or deep breathing exercises.',
        'nutrition': 'Your nutrient levels are generally good, but you might benefit from increasing zinc intake.',
      };
      const response = responses[query.toLowerCase().split(' ')[0]] || 
        'I understand you\'re asking about your health. Could you please be more specific?';
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: 'Error processing health assistant query' });
    }
  });

  // Medication tracking routes
  app.get(`${apiRouter}/medications`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medications = await storage.getUserMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medications' });
    }
  });

  app.post(`${apiRouter}/medications`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medicationData = {
        ...req.body,
        userId,
        active: true,
        lastTaken: req.body.lastTaken ? new Date(req.body.lastTaken) : null,
        nextDose: req.body.nextDose ? new Date(req.body.nextDose) : null
      };
      
      const medication = await storage.addMedication(medicationData);
      res.status(201).json(medication);
    } catch (error) {
      res.status(500).json({ message: 'Error adding medication' });
    }
  });

  app.get(`${apiRouter}/medications/:id`, authenticateToken, async (req, res) => {
    try {
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedicationById(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      // Verify that the medication belongs to the user
      if (medication.userId !== req.body.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this medication' });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medication' });
    }
  });

  app.post(`${apiRouter}/medications/:id/take`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medicationId = parseInt(req.params.id);
      const result = await storage.markMedicationTaken(userId, medicationId);
      
      if (!result) {
        return res.status(404).json({ message: 'Medication not found or not authorized' });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating medication status' });
    }
  });

  // Medication history routes
  app.get(`${apiRouter}/medications/:id/history`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medicationId = parseInt(req.params.id);
      
      // Verify medication belongs to user
      const medication = await storage.getMedicationById(medicationId);
      if (!medication || medication.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this medication history' });
      }
      
      const history = await storage.getMedicationHistory(medicationId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medication history' });
    }
  });
  
  app.get(`${apiRouter}/medications/:id/adherence`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medicationId = parseInt(req.params.id);
      
      // Verify medication belongs to user
      const medication = await storage.getMedicationById(medicationId);
      if (!medication || medication.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this medication data' });
      }
      
      const adherenceRate = await storage.getMedicationAdherenceRate(medicationId);
      res.json({ medicationId, adherenceRate });
    } catch (error) {
      res.status(500).json({ message: 'Error calculating adherence rate' });
    }
  });
  
  app.patch(`${apiRouter}/medications/:id`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medicationId = parseInt(req.params.id);
      
      // Verify medication belongs to user
      const medication = await storage.getMedicationById(medicationId);
      if (!medication || medication.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this medication' });
      }
      
      // Handle date conversions
      const updateData = { ...req.body };
      if (updateData.nextDose) updateData.nextDose = new Date(updateData.nextDose);
      if (updateData.lastTaken) updateData.lastTaken = new Date(updateData.lastTaken);
      
      // Don't allow changing userId
      delete updateData.userId;
      
      const updatedMedication = await storage.updateMedication(medicationId, updateData);
      res.json(updatedMedication);
    } catch (error) {
      res.status(500).json({ message: 'Error updating medication' });
    }
  });
  
  app.post(`${apiRouter}/medications/:id/share`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const medicationId = parseInt(req.params.id);
      const shareWithUserId = parseInt(req.body.shareWithUserId);
      
      // Verify medication belongs to user
      const medication = await storage.getMedicationById(medicationId);
      if (!medication || medication.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to share this medication' });
      }
      
      // Verify the user to share with exists
      const shareWithUser = await storage.getUser(shareWithUserId);
      if (!shareWithUser) {
        return res.status(404).json({ message: 'User to share with not found' });
      }
      
      // Update the sharedWith array
      const sharedWith = medication.sharedWith || [];
      if (!sharedWith.includes(shareWithUserId.toString())) {
        sharedWith.push(shareWithUserId.toString());
      }
      
      const updatedMedication = await storage.updateMedication(medicationId, { sharedWith });
      res.json(updatedMedication);
    } catch (error) {
      res.status(500).json({ message: 'Error sharing medication' });
    }
  });
  
  // Connections routes
  app.get(`${apiRouter}/connections`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching connections' });
    }
  });
  
  app.post(`${apiRouter}/connections`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const connectionId = parseInt(req.body.connectionId);
      const relationshipType = req.body.relationshipType;
      const relationshipSpecific = req.body.relationshipSpecific;
      
      // Check if connection exists
      const connectionUser = await storage.getUser(connectionId);
      if (!connectionUser) {
        return res.status(404).json({ message: 'User to connect with not found' });
      }
      
      // Add connection
      const connection = await storage.addConnection({
        userId,
        connectionId,
        relationshipType,
        relationshipSpecific
      });
      
      res.status(201).json(connection);
    } catch (error) {
      res.status(500).json({ message: 'Server error adding connection' });
    }
  });

  // Messaging routes
  app.post(`${apiRouter}/messages`, authenticateToken, async (req, res) => {
    try {
      const senderId = req.body.user.id;
      const recipientId = parseInt(req.body.recipientId);
      const content = req.body.content;

      if (await storage.isBlocked(recipientId, senderId) || await storage.isBlocked(senderId, recipientId)) {
        return res.status(403).json({ message: 'User is blocked' });
      }

      const message = await storage.sendMessage({
        senderId,
        recipientId,
        content,
        timestamp: new Date(),
        read: false,
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: 'Server error sending message' });
    }
  });

  app.get(`${apiRouter}/messages/:userId`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const otherId = parseInt(req.params.userId);
      const messages = await storage.getMessagesBetweenUsers(userId, otherId);
      await storage.markMessagesRead(userId, otherId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching messages' });
    }
  });

  app.get(`${apiRouter}/messages/unread-count`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching unread count' });
    }
  });

  app.post(`${apiRouter}/block`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const blockedId = parseInt(req.body.blockedId);
      await storage.blockUser(userId, blockedId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Server error blocking user' });
    }
  });

  app.post(`${apiRouter}/messages/:id/report`, authenticateToken, async (req, res) => {
    try {
      const reporterId = req.body.user.id;
      const messageId = parseInt(req.params.id);
      const reason = req.body.reason || '';
      const report = await storage.reportMessage({
        messageId,
        reporterId,
        reason,
        reportedAt: new Date(),
      });
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Server error reporting message' });
    }
  });

  // Forum posts routes
  app.get(`${apiRouter}/forum/posts`, async (req, res) => {
    try {
      const subreddit = req.query.subreddit as string | undefined;
      const posts = await storage.getForumPosts(subreddit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching forum posts' });
    }
  });
  
  app.post(`${apiRouter}/forum/posts`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const postData = insertForumPostSchema.parse({
        ...req.body,
        userId,
        timestamp: new Date()
      });
      
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating forum post' });
    }
  });
  
  app.post(`${apiRouter}/forum/posts/:id/vote`, authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const isUpvote = req.body.upvote === true;
      
      const updatedPost = await storage.updateForumPostVotes(postId, isUpvote);
      if (!updatedPost) {
        return res.status(404).json({ message: 'Forum post not found' });
      }
      
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: 'Server error voting on post' });
    }
  });
  
  // News & Updates routes
  app.get(`${apiRouter}/news`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const category = req.query.category as string | undefined;

      const news = await storage.getNewsUpdates(limit, category);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching news' });
    }
  });

  app.get(`${apiRouter}/alerts`, async (_req, res) => {
    try {
      const alerts = await storage.getNewsUpdates(undefined, 'System');
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching alerts' });
    }
  });
  
  // Products routes
  app.get(`${apiRouter}/products`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const recommendedFor = req.query.recommendedFor 
        ? (req.query.recommendedFor as string).split(',') 
        : undefined;
      
      const products = await storage.getProducts(category, recommendedFor);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching products' });
    }
  });
  
  app.get(`${apiRouter}/products/recommendations`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      
      // Get user health stats to determine recommendations
      const healthStats = await storage.getUserHealthStats(userId);
      
      // Extract health conditions that need recommendations
      const recommendationTags = healthStats.map(stat => {
        if (stat.statType === 'nutrient_status' && stat.value === 'Zinc Deficient') {
          return 'zinc_deficiency';
        }
        return null;
      }).filter(Boolean) as string[];
      
      if (recommendationTags.length === 0) {
        // Default recommendations if no specific health conditions
        recommendationTags.push('general_health');
      }
      
      const recommendedProducts = await storage.getProducts(undefined, recommendationTags);
      res.json(recommendedProducts);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching product recommendations' });
    }
  });
  
  // Symptom Checker routes
  app.get(`${apiRouter}/symptoms`, async (req, res) => {
    try {
      const bodyArea = req.query.bodyArea as string | undefined;
      const severity = req.query.severity as string | undefined;
      
      const symptoms = await storage.getSymptoms(bodyArea, severity);
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching symptoms' });
    }
  });
  
  app.get(`${apiRouter}/symptoms/:id`, async (req, res) => {
    try {
      const symptomId = parseInt(req.params.id);
      const symptom = await storage.getSymptomById(symptomId);
      
      if (!symptom) {
        return res.status(404).json({ message: 'Symptom not found' });
      }
      
      res.json(symptom);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching symptom' });
    }
  });
  
  app.post(`${apiRouter}/symptoms`, authenticateToken, async (req, res) => {
    try {
      // Only admins can add symptoms
      if (req.body.user.username !== 'admin') {
        return res.status(403).json({ message: 'Only administrators can add symptoms' });
      }
      
      const symptomData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.createSymptom(symptomData);
      res.status(201).json(symptom);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating symptom' });
    }
  });
  
  // Symptom Checks routes
  app.get(`${apiRouter}/symptom-checks`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const checks = await storage.getUserSymptomChecks(userId);
      res.json(checks);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching symptom checks' });
    }
  });
  
  app.get(`${apiRouter}/symptom-checks/:id`, authenticateToken, async (req, res) => {
    try {
      const checkId = parseInt(req.params.id);
      const check = await storage.getSymptomCheckById(checkId);
      
      if (!check) {
        return res.status(404).json({ message: 'Symptom check not found' });
      }
      
      // Verify user can access this check
      if (check.userId !== req.body.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this symptom check' });
      }
      
      res.json(check);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching symptom check' });
    }
  });
  
  app.post(`${apiRouter}/symptom-checks`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const checkData = insertSymptomCheckSchema.parse({
        ...req.body,
        userId,
        timestamp: new Date()
      });
      
      const check = await storage.createSymptomCheck(checkData);
      res.status(201).json(check);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating symptom check' });
    }
  });
  
  // Appointments routes
  app.get(`${apiRouter}/appointments`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const appointments = await storage.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching appointments' });
    }
  });
  
  app.get(`${apiRouter}/appointments/:id`, authenticateToken, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointmentById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Verify user can access this appointment
      if (appointment.userId !== req.body.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this appointment' });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching appointment' });
    }
  });
  
  app.post(`${apiRouter}/appointments`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      
      // Handle date conversion
      const startTime = new Date(req.body.startTime);
      const endTime = new Date(req.body.endTime);
      
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId,
        startTime,
        endTime
      });
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating appointment' });
    }
  });
  
  app.patch(`${apiRouter}/appointments/:id`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const appointmentId = parseInt(req.params.id);
      
      // Verify appointment exists and belongs to user
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      if (appointment.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this appointment' });
      }
      
      // Handle date conversions if provided
      const updateData = { ...req.body };
      if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
      if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);
      
      // Don't allow changing userId
      delete updateData.userId;
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, updateData);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: 'Server error updating appointment' });
    }
  });

  // OAuth routes for health data providers
  app.get(`${apiRouter}/oauth/:provider`, authenticateToken, async (req, res) => {
    const providerParam = req.params.provider;
    const userId = req.body.user.id;

    if (!['google-fit', 'fitbit', 'apple-health'].includes(providerParam)) {
      return res.status(400).json({ message: 'Unsupported provider' });
    }

    const provider = providerParam.replace('-', '_');
    let connection = (await storage.getUserHealthDataConnections(userId))
      .find(c => c.provider === provider);

    if (!connection) {
      connection = await storage.createHealthDataConnection({
        userId,
        provider,
        connected: false,
        lastSynced: null,
      });
    }

    const state = crypto.randomBytes(8).toString('hex');
    oauthStateMap.set(state, connection.id);

    const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/oauth/${providerParam}/callback`;
    let authUrl = '';

    if (providerParam === 'google-fit') {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_FIT_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/fitness.activity.read',
        access_type: 'offline',
        state,
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else if (providerParam === 'fitbit') {
      const params = new URLSearchParams({
        client_id: process.env.FITBIT_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'activity sleep heartrate',
        state,
      });
      authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
    } else {
      const params = new URLSearchParams({
        client_id: process.env.APPLE_HEALTH_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'activity heartrate sleep',
        state,
      });
      authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    }

    res.redirect(authUrl);
  });

  app.get(`${apiRouter}/oauth/:provider/callback`, async (req, res) => {
    const providerParam = req.params.provider;
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }

    const connectionId = oauthStateMap.get(state);
    if (!connectionId) {
      return res.status(400).send('Invalid OAuth state');
    }
    oauthStateMap.delete(state);

    const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/oauth/${providerParam}/callback`;

    let tokenData: any;
    if (providerParam === 'google-fit') {
      tokenData = await exchangeGoogleFitCode(code, redirectUri);
    } else if (providerParam === 'fitbit') {
      tokenData = await exchangeFitbitCode(code, redirectUri);
    } else if (providerParam === 'apple-health') {
      tokenData = await exchangeAppleHealthCode(code, redirectUri);
    } else {
      return res.status(400).send('Unsupported provider');
    }

    await storage.updateHealthDataConnection(connectionId, {
      connected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      scope: tokenData.scope.split(' '),
      expiresAt: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000),
    });

    res.send('Authorization successful. You may close this window.');
  });

  // User device routes
  app.get(`${apiRouter}/devices`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching devices' });
    }
  });

  app.post(`${apiRouter}/devices`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const deviceData = insertUserDeviceSchema.parse({ ...req.body, userId });
      const device = await storage.createUserDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating device' });
    }
  });

  // Connected device routes
  app.get(`${apiRouter}/connected-devices`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const devices = await storage.getConnectedDevices(userId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching connected devices' });
    }
  });

  app.post(`${apiRouter}/connected-devices`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const deviceData = insertConnectedDeviceSchema.parse({ ...req.body, userId });
      const device = await storage.createConnectedDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating connected device' });
    }
  });

  // Health Data Connection routes
  app.get(`${apiRouter}/health-data-connections`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const connections = await storage.getUserHealthDataConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching health data connections' });
    }
  });
  
  app.post(`${apiRouter}/health-data-connections`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      
      const connectionData = insertHealthDataConnectionSchema.parse({
        ...req.body,
        userId,
        connected: false, // Always start as disconnected
        lastSynced: null
      });
      
      const connection = await storage.createHealthDataConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating health data connection' });
    }
  });
  
  app.patch(`${apiRouter}/health-data-connections/:id/sync`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const connectionId = parseInt(req.params.id);
      
      // Verify connection exists and belongs to user
      const connection = await storage.getHealthDataConnectionById(connectionId);
      if (!connection) {
        return res.status(404).json({ message: 'Health data connection not found' });
      }
      
      if (connection.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to sync this connection' });
      }
      
      // Update connection with sync information
      const now = new Date();
      const updateData = {
        connected: true,
        lastSynced: now,
      };

      const updatedConnection = await storage.updateHealthDataConnection(
        connectionId,
        updateData,
      );

      // Fetch provider data using stored OAuth credentials
      let providerStats: InsertHealthStat[] = [];
      if (connection.provider === "apple_health") {
        let accessToken = connection.accessToken || "";
        if (connection.expiresAt && connection.expiresAt < now && connection.refreshToken) {
          const refreshed = await refreshAppleHealthToken(connection.refreshToken);
          accessToken = refreshed.access_token;
          await storage.updateHealthDataConnection(connectionId, {
            accessToken,
            expiresAt: new Date(Date.now() + (refreshed.expires_in || 3600) * 1000),
          });
        }
        providerStats = (await fetchAppleHealthData(accessToken)).map((s) => ({
          ...s,
          userId,
          deviceId: connection.deviceId ?? undefined,
          timestamp: new Date(s.timestamp),
        }));
      } else if (connection.provider === "google_fit") {
        let accessToken = connection.accessToken || "";
        if (connection.expiresAt && connection.expiresAt < now && connection.refreshToken) {
          const refreshed = await refreshGoogleFitToken(connection.refreshToken);
          accessToken = refreshed.access_token;
          await storage.updateHealthDataConnection(connectionId, {
            accessToken,
            expiresAt: new Date(Date.now() + (refreshed.expires_in || 3600) * 1000),
          });
        }
        providerStats = (await fetchGoogleFitData(accessToken)).map((s) => ({
          ...s,
          userId,
          deviceId: connection.deviceId ?? undefined,
          timestamp: new Date(s.timestamp),
        }));
      } else if (connection.provider === "fitbit") {
        let accessToken = connection.accessToken || "";
        if (connection.expiresAt && connection.expiresAt < now && connection.refreshToken) {
          const refreshed = await refreshFitbitToken(connection.refreshToken);
          accessToken = refreshed.access_token;
          await storage.updateHealthDataConnection(connectionId, {
            accessToken,
            expiresAt: new Date(Date.now() + (refreshed.expires_in || 3600) * 1000),
          });
        }
        providerStats = (await fetchFitbitData(accessToken)).map((s) => ({
          ...s,
          userId,
          deviceId: connection.deviceId ?? undefined,
          timestamp: new Date(s.timestamp),
        }));
      }

      for (const stat of providerStats) {
        await storage.addHealthStat(stat);
      }

      await storage.addMetric({ userId, actionType: 'health_sync', timestamp: new Date() });

      res.json(updatedConnection);
    } catch (error) {
      await logError('Error syncing health data connection', req.body?.user?.id, (error as Error).stack);
      res.status(500).json({ message: 'Server error syncing health data connection' });
    }
  });

  // Health Journey Entries
  app.get(`${apiRouter}/health-journey`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const entries = await storage.getUserHealthJourneyEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching health journey entries:", error);
      res.status(500).json({ error: "Failed to fetch health journey entries" });
    }
  });

  app.post(`${apiRouter}/health-journey`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const entryData = {
        ...req.body,
        userId,
        timestamp: new Date()
      };
      const newEntry = await storage.createHealthJourneyEntry(entryData);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating health journey entry:", error);
      res.status(500).json({ error: "Failed to create health journey entry" });
    }
  });

  app.get(`${apiRouter}/health-journey/:id`, authenticateToken, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getHealthJourneyEntryById(entryId);
      if (!entry) {
        return res.status(404).json({ error: "Health journey entry not found" });
      }
      
      // Check if the entry belongs to the authenticated user
      const userId = req.body.user.id;
      if (entry.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching health journey entry:", error);
      res.status(500).json({ error: "Failed to fetch health journey entry" });
    }
  });

  // Health Coaching Plans
  app.get(`${apiRouter}/coaching-plans`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const plans = await storage.getUserHealthCoachingPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching coaching plans:", error);
      res.status(500).json({ error: "Failed to fetch coaching plans" });
    }
  });

  app.post(`${apiRouter}/coaching-plans`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const now = new Date();
      const planData = {
        ...req.body,
        userId,
        createdAt: now,
        updatedAt: now,
        active: true
      };
      const newPlan = await storage.createHealthCoachingPlan(planData);
      res.status(201).json(newPlan);
    } catch (error) {
      console.error("Error creating coaching plan:", error);
      res.status(500).json({ error: "Failed to create coaching plan" });
    }
  });

  app.patch(`${apiRouter}/coaching-plans/:id`, authenticateToken, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getHealthCoachingPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Coaching plan not found" });
      }
      
      // Check if the plan belongs to the authenticated user
      const userId = req.body.user.id;
      if (plan.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedPlan = await storage.updateHealthCoachingPlan(planId, {
        ...req.body,
        updatedAt: new Date()
      });
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating coaching plan:", error);
      res.status(500).json({ error: "Failed to update coaching plan" });
    }
  });

  // Wellness Challenges
  app.get(`${apiRouter}/challenges`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const challenges = await storage.getWellnessChallenges(category);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching wellness challenges:", error);
      res.status(500).json({ error: "Failed to fetch wellness challenges" });
    }
  });

  app.get(`${apiRouter}/challenges/:id`, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getWellnessChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });

  // User Challenge Progress
  app.get(`${apiRouter}/challenge-progress`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const progresses = await storage.getUserChallengeProgresses(userId);
      res.json(progresses);
    } catch (error) {
      console.error("Error fetching challenge progress:", error);
      res.status(500).json({ error: "Failed to fetch challenge progress" });
    }
  });

  app.post(`${apiRouter}/challenge-progress`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const progressData = {
        ...req.body,
        userId,
        joined: new Date(),
        currentProgress: 0,
        completed: false,
        completedAt: null
      };
      
      // Check if the challenge exists
      const challenge = await storage.getWellnessChallengeById(progressData.challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const newProgress = await storage.createUserChallengeProgress(progressData);
      res.status(201).json(newProgress);
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ error: "Failed to join challenge" });
    }
  });

  app.patch(`${apiRouter}/challenge-progress/:id`, authenticateToken, async (req, res) => {
    try {
      const progressId = parseInt(req.params.id);
      const progress = await storage.getUserChallengeProgressById(progressId);
      
      if (!progress) {
        return res.status(404).json({ error: "Challenge progress not found" });
      }
      
      // Check if the progress belongs to the authenticated user
      const userId = req.body.user.id;
      if (progress.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedProgress = await storage.updateUserChallengeProgress(progressId, req.body);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      res.status(500).json({ error: "Failed to update challenge progress" });
    }
  });

  // Mental Health Assessments
  app.get(`${apiRouter}/mental-health`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const assessments = await storage.getUserMentalHealthAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching mental health assessments:", error);
      res.status(500).json({ error: "Failed to fetch mental health assessments" });
    }
  });

  app.post(`${apiRouter}/mental-health`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const assessmentData = {
        ...req.body,
        userId,
        timestamp: new Date()
      };
      
      const newAssessment = await storage.createMentalHealthAssessment(assessmentData);
      res.status(201).json(newAssessment);
    } catch (error) {
      console.error("Error creating mental health assessment:", error);
      res.status(500).json({ error: "Failed to create mental health assessment" });
    }
  });

  // Health Articles Library
  app.get(`${apiRouter}/health-articles`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      
      const articles = await storage.getHealthArticles(category, tags);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching health articles:", error);
      res.status(500).json({ error: "Failed to fetch health articles" });
    }
  });

  app.get(`${apiRouter}/health-articles/:id`, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getHealthArticleById(articleId);
      
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Meal Planning
  app.get(`${apiRouter}/meal-plans`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const mealPlans = await storage.getUserMealPlans(userId);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ error: "Failed to fetch meal plans" });
    }
  });

  app.post(`${apiRouter}/meal-plans`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const mealPlanData = {
        ...req.body,
        userId,
        createdAt: new Date(),
        active: true
      };
      
      const newMealPlan = await storage.createMealPlan(mealPlanData);
      res.status(201).json(newMealPlan);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      res.status(500).json({ error: "Failed to create meal plan" });
    }
  });

  app.get(`${apiRouter}/meal-plans/:id/entries`, authenticateToken, async (req, res) => {
    try {
      const mealPlanId = parseInt(req.params.id);
      const mealPlan = await storage.getMealPlanById(mealPlanId);
      
      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }
      
      // Check if the meal plan belongs to the authenticated user
      const userId = req.body.user.id;
      if (mealPlan.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const entries = await storage.getMealPlanEntries(mealPlanId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching meal plan entries:", error);
      res.status(500).json({ error: "Failed to fetch meal plan entries" });
    }
  });

  app.post(`${apiRouter}/meal-plans/:id/entries`, authenticateToken, async (req, res) => {
    try {
      const mealPlanId = parseInt(req.params.id);
      const mealPlan = await storage.getMealPlanById(mealPlanId);
      
      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }
      
      // Check if the meal plan belongs to the authenticated user
      const userId = req.body.user.id;
      if (mealPlan.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const entryData = {
        ...req.body,
        mealPlanId
      };
      
      const newEntry = await storage.createMealPlanEntry(entryData);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating meal plan entry:", error);
      res.status(500).json({ error: "Failed to create meal plan entry" });
    }
  });

  // Mood Tracking routes
  app.get(`${apiRouter}/mood/entries`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const entries = await storage.getUserMoodEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.get(`${apiRouter}/mood/entries/:id`, authenticateToken, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getMoodEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      // Check if the entry belongs to the authenticated user
      const userId = req.body.user.id;
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching mood entry:", error);
      res.status(500).json({ message: "Failed to fetch mood entry" });
    }
  });

  app.post(`${apiRouter}/mood/entries`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      
      // Ensure date is properly parsed as Date object
      const entryData = {
        ...req.body,
        userId,
        date: req.body.date ? new Date(req.body.date) : new Date()
      };
      
      const newEntry = await storage.createMoodEntry(entryData);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  app.patch(`${apiRouter}/mood/entries/:id`, authenticateToken, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getMoodEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      // Check if the entry belongs to the authenticated user
      const userId = req.body.user.id;
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Ensure date is properly handled if it's being updated
      const updateData = { ...req.body };
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      
      // Don't allow changing userId
      delete updateData.userId;
      
      const updatedEntry = await storage.updateMoodEntry(entryId, updateData);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating mood entry:", error);
      res.status(500).json({ message: "Failed to update mood entry" });
    }
  });

  app.delete(`${apiRouter}/mood/entries/:id`, authenticateToken, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getMoodEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }
      
      // Check if the entry belongs to the authenticated user
      const userId = req.body.user.id;
      if (entry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteMoodEntry(entryId);
      if (success) {
        res.json({ message: "Mood entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete mood entry" });
      }
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      res.status(500).json({ message: "Failed to delete mood entry" });
    }
  });

  // Partner ads and wellness partnerships
  app.get(`${apiRouter}/partner-ads`, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const tag = req.query.tag as string | undefined;
      const ads = await storage.getPartnerAds(category, tag);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch partner ads' });
    }
  });

  // Add-on modules and purchases
  app.get(`${apiRouter}/add-on-modules`, async (_req, res) => {
    try {
      const modules = await storage.getAddOnModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch add-on modules' });
    }
  });

  app.get(`${apiRouter}/purchases`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch purchases' });
    }
  });

  app.post(`${apiRouter}/purchases`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const moduleId = parseInt(req.body.moduleId);
      const purchase = await storage.createUserPurchase({ userId, moduleId, purchasedAt: new Date() });
      res.status(201).json(purchase);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create purchase' });
    }
  });

  // Data licensing consent
  app.get(`${apiRouter}/data-licenses`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const licenses = await storage.getDataLicenses(userId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch data licenses' });
    }
  });

  app.post(`${apiRouter}/data-licenses`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      const { partner, consent } = req.body;
      const license = await storage.createDataLicense({ userId, partner, consent: !!consent, createdAt: new Date() });
      res.status(201).json(license);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create data license' });
    }
  });

  // Challenge sponsorships
  app.get(`${apiRouter}/challenge-sponsorships`, async (req, res) => {
    try {
      const challengeId = req.query.challengeId ? parseInt(req.query.challengeId as string) : undefined;
      const sponsors = await storage.getChallengeSponsorships(challengeId);
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch sponsorships' });
    }
  });

  app.get(`${apiRouter}/admin/metrics`, async (_req, res) => {
    try {
      const activeUsers = await storage.getActiveSessionCount();
      const actionCounts = await storage.getActionCounts();
      const syncCount = actionCounts['health_sync'] || 0;
      res.json({ activeUsers, syncCount, topActions: actionCounts });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  app.post(`${apiRouter}/logs`, async (req, res) => {
    try {
      const { level, message, stack } = req.body;
      const userId = req.body.user?.id;
      await storage.addLog({ level: level || 'info', message, stack, userId, timestamp: new Date() });
      res.status(201).json({ status: 'logged' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to store log' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
