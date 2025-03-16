import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertForumPostSchema } from "@shared/schema";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "healthfolio-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
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
      
      // Generate JWT token
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
        expiresIn: '1d'
      });
      
      // Return user without password and include token
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword, token });
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
      
      // Generate JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '1d'
      });
      
      // Return user without password and include token
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error during login' });
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

  const httpServer = createServer(app);
  return httpServer;
}
