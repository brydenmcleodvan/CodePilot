import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertUserSchema, loginSchema, insertForumPostSchema } from "@shared/schema";
import { 
  insertUserFeedbackSchema, 
  insertErrorLogSchema, 
  insertUserEventSchema 
} from "@shared/analytics-schema";
import { ZodError } from "zod";
import { handlePerplexityRequest } from "./perplexity";
import { z } from "zod";
import {
  generateCoachingInsights,
  generateCorrelationalInsights,
  analyzeMoodPatterns,
  generateGeneralHealthInsights,
  type HealthData,
  type HealthInsight
} from "./ai-intelligence";
import { addToWaitlist, getWaitlistCount } from './api/waitlist';
import { getChangelog, addChangelogEntry } from './api/changelog';
import { 
  getFeatureRequests, 
  addFeatureRequest, 
  voteForFeature, 
  addComment, 
  updateFeatureStatus 
} from './api/feature-requests';
import { processFeedback, getFeedbackStats } from './api/feedback/process-feedback';

// Import the enhanced authentication middleware
import { authenticateToken, requireAdmin, requireOwnership } from './middleware/auth-middleware';
import apiRoutes from './routes/index';

// Enable session-based auth typing
declare global {
  namespace Express {
    interface Request {
      isAuthenticated?: () => boolean;
    }
  }
}

// Import Stripe - we're not actually initializing it yet since we need the API key
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Define API router prefix
  const apiRouter = '/api';
  
  // Leave legacy routes intact while we implement the new security architecture
  
  // User profile routes
  app.get(`${apiRouter}/user/profile`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
  
  // Update user profile
  app.patch(`${apiRouter}/user/profile`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get update data from request body
      const { gender, preferences, ...otherUpdateData } = req.body;
      
      // Create update object
      const updateData: any = { ...otherUpdateData };
      
      // Only update specified fields
      if (gender !== undefined) {
        updateData.gender = gender;
      }
      
      if (preferences !== undefined) {
        updateData.preferences = preferences;
      }
      
      // Update user in database
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  });
  
  // User preferences endpoint
  app.post(`${apiRouter}/user/preferences`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get preferences and gender from request body
      const { preferences, gender } = req.body;
      
      // Create update object
      const updateData: any = {};
      
      if (preferences !== undefined) {
        updateData.preferences = preferences;
      }
      
      if (gender !== undefined) {
        updateData.gender = gender;
      }
      
      // Update user in database
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: 'Server error updating preferences' });
    }
  });
  
  // Privacy Settings Routes
  // Get privacy settings for current user
  app.get(`${apiRouter}/user/privacy-settings`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Parse the current user preferences
      let privacySettings = {};
      try {
        if (user.preferences) {
          const preferences = JSON.parse(user.preferences);
          privacySettings = preferences.privacy || {};
        }
      } catch (e) {
        console.warn('Failed to parse existing preferences');
      }
      
      // Return privacy settings
      res.json({ preferences: privacySettings });
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      res.status(500).json({ message: 'Server error fetching privacy settings' });
    }
  });
  
  // Update privacy settings
  app.post(`${apiRouter}/user/privacy-settings`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get privacy preferences from request body
      const { preferences } = req.body;
      
      if (!preferences) {
        return res.status(400).json({ message: 'Privacy preferences are required' });
      }
      
      // Parse the current user preferences
      let currentPreferences: any = {};
      try {
        if (user.preferences) {
          currentPreferences = JSON.parse(user.preferences);
        }
      } catch (e) {
        console.warn('Failed to parse existing preferences, starting fresh');
      }
      
      // Update with new privacy settings
      const updatedPreferences = {
        ...currentPreferences,
        privacy: preferences
      };
      
      // Save to database
      const updatedUser = await storage.updateUser(userId, {
        preferences: JSON.stringify(updatedPreferences)
      });
      
      // Return success response
      res.status(200).json({ 
        message: 'Privacy settings updated successfully',
        preferences: updatedPreferences.privacy
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ message: 'Server error updating privacy settings' });
    }
  });
  
  // Women's Health - Cycle Tracking Routes
  
  // Get all cycle entries for current user
  app.get(`${apiRouter}/women-health/cycles`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Parse optional date range parameters
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const entries = await storage.getUserCycleEntries(userId, startDate, endDate);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching cycle entries:', error);
      res.status(500).json({ message: 'Server error fetching cycle entries' });
    }
  });
  
  // Get specific cycle entry
  app.get(`${apiRouter}/women-health/cycles/:id`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      
      const entry = await storage.getCycleEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Cycle entry not found' });
      }
      
      // Verify entry belongs to current user
      if (entry.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error fetching cycle entry:', error);
      res.status(500).json({ message: 'Server error fetching cycle entry' });
    }
  });
  
  // Create new cycle entry
  app.post(`${apiRouter}/women-health/cycles`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Create entry data
      const entryData = {
        ...req.body,
        userId
      };
      
      // Convert date string to Date object
      if (entryData.date && typeof entryData.date === 'string') {
        entryData.date = new Date(entryData.date);
      }
      
      const entry = await storage.createCycleEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating cycle entry:', error);
      res.status(500).json({ message: 'Server error creating cycle entry' });
    }
  });
  
  // Update cycle entry
  app.patch(`${apiRouter}/women-health/cycles/:id`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      
      // Verify entry belongs to current user
      const entry = await storage.getCycleEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Cycle entry not found' });
      }
      
      if (entry.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update entry
      const updatedEntry = await storage.updateCycleEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating cycle entry:', error);
      res.status(500).json({ message: 'Server error updating cycle entry' });
    }
  });
  
  // Delete cycle entry
  app.delete(`${apiRouter}/women-health/cycles/:id`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const entryId = parseInt(req.params.id);
      
      // Verify entry belongs to current user
      const entry = await storage.getCycleEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: 'Cycle entry not found' });
      }
      
      if (entry.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Delete entry
      const success = await storage.deleteCycleEntry(entryId);
      
      if (success) {
        res.json({ message: 'Cycle entry deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete cycle entry' });
      }
    } catch (error) {
      console.error('Error deleting cycle entry:', error);
      res.status(500).json({ message: 'Server error deleting cycle entry' });
    }
  });
  
  // Get cycle analysis for current user
  app.get(`${apiRouter}/women-health/analysis`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const analysis = await storage.getUserCycleAnalysis(userId);
      
      if (!analysis) {
        return res.status(404).json({ message: 'Cycle analysis not found' });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error('Error fetching cycle analysis:', error);
      res.status(500).json({ message: 'Server error fetching cycle analysis' });
    }
  });
  
  // Create or update cycle analysis
  app.post(`${apiRouter}/cycle/analysis`, authenticateToken, async (req, res) => {
    try {
      const userId = req.body.user.id;
      
      // Check if analysis already exists
      const existingAnalysis = await storage.getUserCycleAnalysis(userId);
      
      // Create analysis data
      const analysisData = {
        ...req.body,
        userId
      };
      
      // Convert date strings to Date objects
      if (analysisData.cycleStartDate && typeof analysisData.cycleStartDate === 'string') {
        analysisData.cycleStartDate = new Date(analysisData.cycleStartDate);
      }
      if (analysisData.cycleEndDate && typeof analysisData.cycleEndDate === 'string') {
        analysisData.cycleEndDate = new Date(analysisData.cycleEndDate);
      }
      if (analysisData.ovulationDate && typeof analysisData.ovulationDate === 'string') {
        analysisData.ovulationDate = new Date(analysisData.ovulationDate);
      }
      if (analysisData.nextPeriodPrediction && typeof analysisData.nextPeriodPrediction === 'string') {
        analysisData.nextPeriodPrediction = new Date(analysisData.nextPeriodPrediction);
      }
      if (analysisData.fertileWindowStart && typeof analysisData.fertileWindowStart === 'string') {
        analysisData.fertileWindowStart = new Date(analysisData.fertileWindowStart);
      }
      if (analysisData.fertileWindowEnd && typeof analysisData.fertileWindowEnd === 'string') {
        analysisData.fertileWindowEnd = new Date(analysisData.fertileWindowEnd);
      }
      
      let analysis;
      if (existingAnalysis) {
        // Update existing analysis
        analysis = await storage.updateCycleAnalysis(existingAnalysis.id, analysisData);
      } else {
        // Create new analysis
        analysis = await storage.createCycleAnalysis(analysisData);
      }
      
      res.status(201).json(analysis);
    } catch (error) {
      console.error('Error creating/updating cycle analysis:', error);
      res.status(500).json({ message: 'Server error creating/updating cycle analysis' });
    }
  });
  
  // Health stats routes
  app.get(`${apiRouter}/health/stats`, authenticateToken, async (req, res) => {
    try {
      console.log('GET health/stats - user:', req.user);
      const userId = req.user.id;
      console.log('GET health/stats - userId:', userId);
      
      const stats = await storage.getUserHealthStats(userId);
      console.log('GET health/stats - result:', stats);
      
      // Ensure we're sending JSON response
      res.setHeader('Content-Type', 'application/json');
      res.json(stats);
    } catch (error) {
      console.error('Error fetching health stats:', error);
      res.status(500).json({ message: 'Server error fetching health stats' });
    }
  });
  
  app.post(`${apiRouter}/health/stats`, authenticateToken, async (req, res) => {
    try {
      console.log('POST health/stats - user:', req.user);
      console.log('POST health/stats - body:', req.body);
      
      const userId = req.user.id;
      
      // Remove user from the body to avoid conflicts
      const { user, ...requestData } = req.body;
      
      const statData = {
        ...requestData,
        userId,
        timestamp: requestData.timestamp ? new Date(requestData.timestamp) : new Date()
      };
      
      console.log('POST health/stats - processed data:', statData);
      
      const newStat = await storage.addHealthStat(statData);
      console.log('POST health/stats - result:', newStat);
      
      // Ensure we're sending JSON response
      res.setHeader('Content-Type', 'application/json');
      res.json(newStat);
    } catch (error) {
      console.error('Error adding health stat:', error);
      res.status(500).json({ message: 'Server error adding health stat' });
    }
  });
  
  // Consolidated dashboard data endpoint
  app.get(`${apiRouter}/dashboard`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Fetch all data in parallel using Promise.all
      const [user, healthStats, medications, connections] = await Promise.all([
        storage.getUser(userId),
        storage.getUserHealthStats(userId),
        storage.getUserMedications(userId),
        storage.getUserConnections(userId)
      ]);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from user data
      const { password, ...userWithoutPassword } = user;
      
      // Get product recommendations if available
      let recommendations = [];
      try {
        recommendations = await storage.getProductRecommendations(userId);
      } catch (error) {
        console.error('Error fetching product recommendations:', error);
        // Continue even if recommendations fail
      }
      
      // Return consolidated data
      res.json({
        profile: userWithoutPassword,
        healthStats,
        medications,
        connections,
        recommendations
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Server error fetching dashboard data' });
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
      const userId = req.user.id;
      const medications = await storage.getUserMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medications' });
    }
  });

  app.post(`${apiRouter}/medications`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this medication' });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medication' });
    }
  });

  app.post(`${apiRouter}/medications/:id/take`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching connections' });
    }
  });
  
  app.post(`${apiRouter}/connections`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
      if (check.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this symptom check' });
      }
      
      res.json(check);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching symptom check' });
    }
  });
  
  app.post(`${apiRouter}/symptom-checks`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this appointment' });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching appointment' });
    }
  });
  
  app.post(`${apiRouter}/appointments`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const connections = await storage.getUserHealthDataConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching health data connections' });
    }
  });
  
  app.post(`${apiRouter}/health-data-connections`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const entries = await storage.getUserHealthJourneyEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching health journey entries:", error);
      res.status(500).json({ error: "Failed to fetch health journey entries" });
    }
  });

  app.post(`${apiRouter}/health-journey`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const plans = await storage.getUserHealthCoachingPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching coaching plans:", error);
      res.status(500).json({ error: "Failed to fetch coaching plans" });
    }
  });

  app.post(`${apiRouter}/coaching-plans`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const progresses = await storage.getUserChallengeProgresses(userId);
      res.json(progresses);
    } catch (error) {
      console.error("Error fetching challenge progress:", error);
      res.status(500).json({ error: "Failed to fetch challenge progress" });
    }
  });

  app.post(`${apiRouter}/challenge-progress`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const assessments = await storage.getUserMentalHealthAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching mental health assessments:", error);
      res.status(500).json({ error: "Failed to fetch mental health assessments" });
    }
  });

  app.post(`${apiRouter}/mental-health`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const mealPlans = await storage.getUserMealPlans(userId);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ error: "Failed to fetch meal plans" });
    }
  });

  app.post(`${apiRouter}/meal-plans`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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

  // Tip Jar - Stripe integration
  // This is a placeholder implementation until we get the Stripe API key
  app.post(`${apiRouter}/tip-jar/create-checkout`, async (req, res) => {
    try {
      // Validate the request body
      const tipSchema = z.object({
        amount: z.number().min(1).max(1000),
      });

      const { amount } = tipSchema.parse(req.body);

      // If we don't have the Stripe API key, return a mock response for now
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(200).json({
          url: '#mock-stripe-checkout-url',
          message: 'This is a mock response. To enable actual payments, please set up the STRIPE_SECRET_KEY environment variable.'
        });
      }

      // With a real Stripe implementation, this would be:
      /*
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Healthmap Support',
                description: `$${amount} contribution to support Healthmap development`,
              },
              unit_amount: amount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.json({ url: session.url });
      */

      // For now, without the API key, return a mock response
      res.status(200).json({
        url: '#mock-stripe-checkout-url',
        message: 'This is a mock response. To enable actual payments, please set up the STRIPE_SECRET_KEY environment variable.'
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  });

  // Thank you page webhook for successful payments
  app.get(`${apiRouter}/tip-jar/session-status`, async (req, res) => {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ message: 'Missing session ID' });
    }

    try {
      // If we don't have the Stripe API key, return a mock response
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.json({
          status: 'complete',
          customer_email: 'user@example.com',
          amount_total: 1000, // $10.00
          message: 'This is a mock response. To enable actual session verification, please set up the STRIPE_SECRET_KEY environment variable.'
        });
      }

      // With a real Stripe implementation, this would be:
      /*
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      res.json({
        status: session.status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
      });
      */
      
      // For now, return a mock response
      res.json({
        status: 'complete',
        customer_email: 'user@example.com',
        amount_total: 1000, // $10.00
        message: 'This is a mock response. To enable actual session verification, please set up the STRIPE_SECRET_KEY environment variable.'
      });
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      res.status(500).json({ message: 'Error retrieving session details' });
    }
  });
  
  // AI Intelligence - API Routes
  
  // Get Smart Coaching Assistant insights
  app.get(`${apiRouter}/ai/coaching-insights`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const focusArea = req.query.focusArea as string | undefined;
      
      // Get user's health data for the last 30 days
      const healthData = await storage.getUserHealthStats(userId);
      
      if (!healthData || healthData.length === 0) {
        return res.status(200).json({ 
          insights: [{
            type: "coaching",
            message: "We need more health data to provide personalized coaching insights. Try tracking your daily activity, sleep, and other health metrics.",
            confidence: 0.5,
            relatedMetrics: [],
            actionable: false
          }]
        });
      }
      
      // Generate coaching insights using OpenAI
      const insights = await generateCoachingInsights(healthData, focusArea);
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating coaching insights:', error);
      res.status(500).json({ 
        message: 'Error generating coaching insights',
        insights: [{
          type: "coaching",
          message: "We're having trouble analyzing your health data right now. Try again later.",
          confidence: 0,
          relatedMetrics: [],
          actionable: false
        }]
      });
    }
  });
  
  // Get Correlational Insights
  app.get(`${apiRouter}/ai/correlational-insights`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's health data for the last 30 days
      const healthData = await storage.getUserHealthStats(userId);
      
      if (!healthData || healthData.length === 0) {
        return res.status(200).json({ 
          insights: [{
            type: "correlation",
            message: "We need more health data to identify correlations. Try tracking multiple health metrics consistently.",
            confidence: 0.5,
            relatedMetrics: [],
            actionable: false
          }]
        });
      }
      
      // Generate correlational insights
      const insights = generateCorrelationalInsights(healthData);
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating correlational insights:', error);
      res.status(500).json({ 
        message: 'Error generating correlational insights',
        insights: [{
          type: "correlation",
          message: "We're having trouble analyzing correlations in your health data right now. Try again later.",
          confidence: 0,
          relatedMetrics: [],
          actionable: false
        }]
      });
    }
  });
  
  // Get Mood Analysis
  app.get(`${apiRouter}/ai/mood-analysis`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's mood data for the last 30 days
      const moodEntries = await storage.getUserMoodEntries(userId);
      
      if (!moodEntries || moodEntries.length === 0) {
        return res.status(200).json({ 
          insights: [{
            type: "mood",
            message: "We need more mood tracking data to provide insights. Try logging your mood daily.",
            confidence: 0.5,
            relatedMetrics: ["mood"],
            actionable: false
          }]
        });
      }
      
      // Format mood entries for analysis
      const moodData = moodEntries.map(entry => ({
        date: new Date(entry.date).toISOString().split('T')[0],
        mood: entry.mood,
        notes: entry.notes || "",
        activities: entry.factors || []
      }));
      
      // Analyze mood patterns
      const insights = await analyzeMoodPatterns(moodData);
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating mood analysis:', error);
      res.status(500).json({ 
        message: 'Error generating mood analysis',
        insights: [{
          type: "mood",
          message: "We're having trouble analyzing your mood data right now. Try again later.",
          confidence: 0,
          relatedMetrics: ["mood"],
          actionable: false
        }]
      });
    }
  });
  
  // Get General Health Insights
  app.get(`${apiRouter}/ai/general-insights`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user profile
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove sensitive information
      const { password, ...userProfile } = user;
      
      // Generate general health insights
      const insights = await generateGeneralHealthInsights(userProfile);
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating general health insights:', error);
      res.status(500).json({ 
        message: 'Error generating general health insights',
        insights: [{
          type: "general",
          message: "We're having trouble generating health insights right now. Try again later.",
          confidence: 0,
          relatedMetrics: [],
          actionable: false
        }]
      });
    }
  });

  // =============================
  // Analytics & Feedback API Routes
  // =============================
  
  // Submit user feedback
  app.post(`${apiRouter}/analytics/feedback`, async (req, res) => {
    try {
      const feedbackData = insertUserFeedbackSchema.parse(req.body);
      
      // If the user is authenticated, add their ID
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        feedbackData.userId = req.user.id;
      }
      
      // Ensure timestamp is set
      feedbackData.timestamp = new Date();
      
      // Create feedback entry
      const feedback = await storage.createUserFeedback(feedbackData);
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error submitting feedback' });
    }
  });
  
  // Get all feedback (admin only)
  app.get(`${apiRouter}/analytics/feedback`, authenticateToken, async (req, res) => {
    try {
      // Check if user is admin (you might want to implement proper role-based access)
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.id !== 1) { // Using ID 1 as admin for simplicity
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get optional filters from query params
      const sourceFilter = req.query.source as string | undefined;
      const userIdFilter = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const feedback = await storage.getUserFeedback(userIdFilter, sourceFilter);
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Server error fetching feedback' });
    }
  });
  
  // Report client-side error
  app.post(`${apiRouter}/analytics/error`, async (req, res) => {
    try {
      const errorData = insertErrorLogSchema.parse(req.body);
      
      // If the user is authenticated, add their ID
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        errorData.userId = req.user.id;
      }
      
      // Ensure timestamp is set
      errorData.timestamp = new Date();
      
      // Create error log
      const errorLog = await storage.createErrorLog(errorData);
      
      res.status(201).json({ success: true, id: errorLog.id });
    } catch (error) {
      console.error('Error logging client error:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error logging client error' });
    }
  });
  
  // Get error logs (admin only)
  app.get(`${apiRouter}/analytics/errors`, authenticateToken, async (req, res) => {
    try {
      // Check if user is admin (you might want to implement proper role-based access)
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.id !== 1) { // Using ID 1 as admin for simplicity
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get limit from query params
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const errors = await storage.getErrorLogs(limit);
      res.json(errors);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      res.status(500).json({ message: 'Server error fetching error logs' });
    }
  });
  
  // Track user event
  app.post(`${apiRouter}/analytics/event`, async (req, res) => {
    try {
      const eventData = insertUserEventSchema.parse(req.body);
      
      // If the user is authenticated, add their ID
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        eventData.userId = req.user.id;
      }
      
      // Ensure timestamp is set
      eventData.timestamp = new Date();
      
      // Create event
      const event = await storage.createUserEvent(eventData);
      
      res.status(201).json({ success: true, id: event.id });
    } catch (error) {
      console.error('Error tracking event:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error tracking event' });
    }
  });
  
  // Get user events (admin or self only)
  app.get(`${apiRouter}/analytics/events`, authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get optional filters from query params
      const category = req.query.category as string | undefined;
      const userIdParam = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      // Only allow viewing other users' events if user is admin
      const isAdmin = user.id === 1; // Using ID 1 as admin for simplicity
      
      if (userIdParam && userIdParam !== userId && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Use the requested userId if specified and allowed, otherwise use the current user's ID
      const targetUserId = userIdParam || userId;
      
      const events = await storage.getUserEvents(targetUserId, category);
      res.json(events);
    } catch (error) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ message: 'Server error fetching user events' });
    }
  });

  // API handlers for iteration loop features

  // Waitlist Routes
  app.post(`${apiRouter}/waitlist`, addToWaitlist);
  app.get(`${apiRouter}/waitlist/count`, getWaitlistCount);

  // Changelog Routes
  app.get(`${apiRouter}/changelog`, getChangelog);
  app.post(`${apiRouter}/changelog`, authenticateToken, addChangelogEntry);

  // Feature Requests Routes
  app.get(`${apiRouter}/feature-requests`, getFeatureRequests);
  app.post(`${apiRouter}/feature-requests`, authenticateToken, addFeatureRequest);
  app.post(`${apiRouter}/feature-requests/:id/vote`, authenticateToken, voteForFeature);
  app.post(`${apiRouter}/feature-requests/:id/comment`, authenticateToken, addComment);
  app.patch(`${apiRouter}/feature-requests/:id/status`, authenticateToken, updateFeatureStatus);

  // User Feedback Routes
  app.post(`${apiRouter}/feedback`, processFeedback);
  app.get(`${apiRouter}/feedback/stats`, authenticateToken, getFeedbackStats);

  const httpServer = createServer(app);
  return httpServer;
}
