import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { setupAuth } from './auth';
import { authenticateJwt } from './security/auth/auth-middleware';
import { checkPermission } from './security/permissions/permission-checker';
import { ResourceType } from './security/permissions/permission-types';
import { deviceManager } from './integrations/device-manager';

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

  // Protected routes - require authentication and proper permissions
  app.get('/api/health-metrics', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to read health metrics
      const hasPermission = await checkPermission(user, 'read', ResourceType.HEALTH_METRIC);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot access health metrics' });
      }

      const metrics = await storage.getHealthMetrics(user.id);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      res.status(500).json({ message: 'Failed to fetch health metrics' });
    }
  });

  app.post('/api/health-metrics', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to create health metrics
      const hasPermission = await checkPermission(user, 'create', ResourceType.HEALTH_METRIC);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot create health metrics' });
      }

      const metricData = { ...req.body, userId: user.id, timestamp: new Date() };
      const newMetric = await storage.addHealthMetric(metricData);
      res.status(201).json(newMetric);
    } catch (error) {
      console.error('Error adding health metric:', error);
      res.status(500).json({ message: 'Failed to add health metric' });
    }
  });

  // Medications - with RBAC enforcement
  app.get('/api/medications', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to read medications
      const hasPermission = await checkPermission(user, 'read', ResourceType.MEDICATION);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot access medications' });
      }

      const medications = await storage.getMedications(user.id);
      res.json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: 'Failed to fetch medications' });
    }
  });

  app.post('/api/medications', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to create medications
      const hasPermission = await checkPermission(user, 'create', ResourceType.MEDICATION);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot create medications' });
      }

      const medicationData = { 
        ...req.body, 
        userId: user.id, 
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date() 
      };
      const newMedication = await storage.addMedication(medicationData);
      res.status(201).json(newMedication);
    } catch (error) {
      console.error('Error adding medication:', error);
      res.status(500).json({ message: 'Failed to add medication' });
    }
  });

  // Symptoms - with RBAC enforcement
  app.get('/api/symptoms', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to read symptoms
      const hasPermission = await checkPermission(user, 'read', ResourceType.SYMPTOM);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot access symptoms' });
      }

      const symptoms = await storage.getSymptoms(user.id);
      res.json(symptoms);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      res.status(500).json({ message: 'Failed to fetch symptoms' });
    }
  });

  app.post('/api/symptoms', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to create symptoms
      const hasPermission = await checkPermission(user, 'create', ResourceType.SYMPTOM);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot create symptoms' });
      }

      const symptomData = { 
        ...req.body, 
        userId: user.id, 
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

  // Appointments - with RBAC enforcement
  app.get('/api/appointments', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to read appointments
      const hasPermission = await checkPermission(user, 'read', ResourceType.APPOINTMENT);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot access appointments' });
      }

      const appointments = await storage.getAppointments(user.id);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.post('/api/appointments', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to create appointments
      const hasPermission = await checkPermission(user, 'create', ResourceType.APPOINTMENT);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot create appointments' });
      }

      const appointmentData = { 
        ...req.body, 
        userId: user.id,
        datetime: req.body.datetime ? new Date(req.body.datetime) : new Date()
      };
      const newAppointment = await storage.addAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      console.error('Error adding appointment:', error);
      res.status(500).json({ message: 'Failed to add appointment' });
    }
  });

  // Health data connections - with RBAC enforcement
  app.get('/api/health-connections', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to read health connections
      const hasPermission = await checkPermission(user, 'read', ResourceType.HEALTH_CONNECTION);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot access health connections' });
      }

      const connections = await storage.getHealthDataConnections(user.id);
      res.json(connections);
    } catch (error) {
      console.error('Error fetching health connections:', error);
      res.status(500).json({ message: 'Failed to fetch health connections' });
    }
  });

  app.post('/api/health-connections', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Check if user has permission to create health connections
      const hasPermission = await checkPermission(user, 'create', ResourceType.HEALTH_CONNECTION);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied: Cannot create health connections' });
      }

      const connectionData = { ...req.body, userId: user.id };
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

  // Healthcare provider endpoints - with comprehensive RBAC
  app.get('/api/patients', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      
      // Verify provider role - only healthcare providers can access patient lists
      if (!user.roles.includes('provider') && !user.roles.includes('admin')) {
        return res.status(403).json({ 
          message: 'Permission denied: Only healthcare providers can access patient information' 
        });
      }

      const relationships = await storage.getHealthcareRelationships(user.id);
      
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
          startDate: rel.startDate,
          status: rel.status
        };
      });
      
      const patients = (await Promise.all(patientPromises)).filter((p: any) => p !== null);
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Failed to fetch patients' });
    }
  });

  // Provider access to patient health data
  app.get('/api/patients/:patientId/health-metrics', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      const patientId = parseInt(req.params.patientId);
      
      // Check if provider has permission to access this patient's data
      const hasRelationship = await storage.hasHealthcareRelationship(user.id, patientId);
      if (!hasRelationship && !user.roles.includes('admin')) {
        return res.status(403).json({ 
          message: 'Permission denied: No healthcare relationship with this patient' 
        });
      }

      // Additional permission check using our RBAC system
      const hasPermission = await checkPermission(user, 'read', ResourceType.HEALTH_METRIC, patientId);
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Permission denied: Insufficient access level for patient data' 
        });
      }

      const metrics = await storage.getHealthMetrics(patientId);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching patient health metrics:', error);
      res.status(500).json({ message: 'Failed to fetch patient health metrics' });
    }
  });

  // Provider access to patient medications
  app.get('/api/patients/:patientId/medications', authenticateJwt, async (req, res) => {
    try {
      const user = (req as any).user!;
      const patientId = parseInt(req.params.patientId);
      
      // Check healthcare relationship and permissions
      const hasRelationship = await storage.hasHealthcareRelationship(user.id, patientId);
      if (!hasRelationship && !user.roles.includes('admin')) {
        return res.status(403).json({ 
          message: 'Permission denied: No healthcare relationship with this patient' 
        });
      }

      const hasPermission = await checkPermission(user, 'read', ResourceType.MEDICATION, patientId);
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Permission denied: Insufficient access level for patient medications' 
        });
      }

      const medications = await storage.getMedications(patientId);
      res.json(medications);
    } catch (error) {
      console.error('Error fetching patient medications:', error);
      res.status(500).json({ message: 'Failed to fetch patient medications' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}