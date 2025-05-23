import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { setupAuth } from './auth';
import { authenticateJwt } from './security/auth/auth-middleware';
import { checkPermission } from './security/permissions/permission-checker';
import { ResourceType } from './security/permissions/permission-types';

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Public routes
  app.get('/api/news', async (req, res) => {
    try {
      const news = await storage.getHealthNews();
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ message: 'Failed to fetch news' });
    }
  });

  // Protected routes - require authentication
  app.get('/api/health-metrics', authenticateJwt, async (req, res) => {
    try {
      // Get user ID from authenticated request
      const userId = (req as any).user!.id;
      const metrics = await storage.getHealthMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      res.status(500).json({ message: 'Failed to fetch health metrics' });
    }
  });

  app.post('/api/health-metrics', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const metricData = { ...req.body, userId, timestamp: new Date() };
      const newMetric = await storage.addHealthMetric(metricData);
      res.status(201).json(newMetric);
    } catch (error) {
      console.error('Error adding health metric:', error);
      res.status(500).json({ message: 'Failed to add health metric' });
    }
  });

  // Medications
  app.get('/api/medications', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: 'Failed to fetch medications' });
    }
  });

  app.post('/api/medications', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const medicationData = { ...req.body, userId, startDate: req.body.startDate ? new Date(req.body.startDate) : new Date() };
      const newMedication = await storage.addMedication(medicationData);
      res.status(201).json(newMedication);
    } catch (error) {
      console.error('Error adding medication:', error);
      res.status(500).json({ message: 'Failed to add medication' });
    }
  });

  // Symptoms
  app.get('/api/symptoms', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const symptoms = await storage.getSymptoms(userId);
      res.json(symptoms);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      res.status(500).json({ message: 'Failed to fetch symptoms' });
    }
  });

  app.post('/api/symptoms', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const symptomData = { 
        ...req.body, 
        userId, 
        startTime: req.body.startTime ? new Date(req.body.startTime) : new Date(),
        severity: req.body.severity || 1
      };
      const newSymptom = await storage.addSymptom(symptomData);
      res.status(201).json(newSymptom);
    } catch (error) {
      console.error('Error adding symptom:', error);
      res.status(500).json({ message: 'Failed to add symptom' });
    }
  });

  // Appointments
  app.get('/api/appointments', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.post('/api/appointments', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const appointmentData = { 
        ...req.body, 
        userId,
        datetime: req.body.datetime ? new Date(req.body.datetime) : new Date()
      };
      const newAppointment = await storage.addAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      console.error('Error adding appointment:', error);
      res.status(500).json({ message: 'Failed to add appointment' });
    }
  });

  // Health data connections
  app.get('/api/health-connections', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const connections = await storage.getHealthDataConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error('Error fetching health connections:', error);
      res.status(500).json({ message: 'Failed to fetch health connections' });
    }
  });

  app.post('/api/health-connections', authenticateJwt, async (req, res) => {
    try {
      const userId = (req as any).user!.id;
      const connectionData = { ...req.body, userId };
      const newConnection = await storage.addHealthDataConnection(connectionData);
      res.status(201).json(newConnection);
    } catch (error) {
      console.error('Error adding health connection:', error);
      res.status(500).json({ message: 'Failed to add health connection' });
    }
  });

  // Health articles
  app.get('/api/articles', async (req, res) => {
    try {
      const articles = await storage.getHealthArticles();
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  // Healthcare provider endpoints
  app.get('/api/patients', authenticateJwt, async (req, res) => {
    try {
      const providerId = (req as any).user!.id;
      const relationships = await storage.getHealthcareRelationships(providerId);
      
      // Get patient details for each relationship
      const patientPromises = relationships.map(async (rel: any) => {
        const patient = await storage.getUser(rel.patientId);
        if (!patient) return null;
        
        // Return only necessary patient information (no password, etc.)
        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          relationshipType: rel.relationshipType,
          accessLevel: rel.accessLevel,
          startDate: rel.startDate
        };
      });
      
      const patients = (await Promise.all(patientPromises)).filter((p: any) => p !== null);
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Failed to fetch patients' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}