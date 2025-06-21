import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertForumPostSchema } from "@shared/schema";
import { ZodError } from "zod";
import { handlePerplexityRequest } from "./perplexity";

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
  
  // Neural Profile routes
  app.get(`${apiRouter}/neural-profile`, async (req, res) => {
    try {
      // Read the neural profile data from the JSON file
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(process.cwd(), 'data', 'neural_profile.json');
      
      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const profileData = JSON.parse(rawData);
        res.json(profileData);
      } else {
        res.status(404).json({ message: 'Neural profile data not found' });
      }
    } catch (error) {
      console.error('Error fetching neural profile:', error);
      res.status(500).json({ message: 'Server error fetching neural profile data' });
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

  // AI Health Coach route
  app.get(`${apiRouter}/coach/ai`, (req, res) => {
    const tips = [
      "Drink more water - aim for 8 glasses daily",
      "Stretch after walking to improve flexibility",
      "Limit screen time before bed for better sleep",
      "Take breaks every hour when working at a computer",
      "Practice deep breathing for 5 minutes daily",
      "Include more colorful vegetables in your meals",
      "Walk for 10 minutes after meals to aid digestion",
      "Keep a consistent sleep schedule"
    ];
    res.json({ tips });
  });

  // Admin metrics route
  app.get(`${apiRouter}/admin/metrics`, (req, res) => {
    res.json({
      totalUsers: 2187,
      topModules: ["Dashboard", "Profile", "Messenger"],
      errorLogs: ["GET /api/user failed", "POST /api/coach/ai timeout"]
    });
  });

  // DNA insights route
  app.get(`${apiRouter}/user/dna`, (req, res) => {
    res.json({
      vitamin_d: "low",
      cyp1a2: "slow caffeine metabolizer",
      apoe4: "risk gene for Alzheimer's"
    });
  });

  // Health marketplace route
  app.get(`${apiRouter}/market`, (req, res) => {
    res.json({
      products: [
        { id: 1, name: "Zinc Supplement", price: "$9.99", discount: "20%" },
        { id: 2, name: "Sleep Tracker Band", price: "$49.99", discount: "15%" }
      ]
    });
  });

  // Health alerts route
  app.get(`${apiRouter}/alerts`, (req, res) => {
    res.json({
      alerts: [
        "Zinc Deficiency detected",
        "Low sleep quality for 3 consecutive days"
      ]
    });
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

  // Perplexity API route
  app.post(`${apiRouter}/perplexity`, async (req, res) => {
    handlePerplexityRequest(req, res);
  });

  const httpServer = createServer(app);
  return httpServer;
}
