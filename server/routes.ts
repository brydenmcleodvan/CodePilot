import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertForumPostSchema } from "@shared/schema";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "healthmap-secret-key";

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
        lastSynced: now
      };
      
      const updatedConnection = await storage.updateHealthDataConnection(connectionId, updateData);
      
      // Create a health stat from the sync
      await storage.addHealthStat({
        userId,
        statType: "sync_heart_rate", 
        value: (70 + Math.floor(Math.random() * 20)).toString(), // Simulated heart rate data
        unit: "bpm",
        timestamp: now,
        icon: "ri-heart-pulse-line",
        colorScheme: "primary"
      });
      
      res.json(updatedConnection);
    } catch (error) {
      res.status(500).json({ message: 'Server error syncing health data connection' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
