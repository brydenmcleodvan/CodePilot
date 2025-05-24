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

  // ===========================================
  // DEVICE INTEGRATION ENDPOINTS
  // ===========================================

  // Get user's connected devices
  app.get('/api/devices/connections', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const connections = deviceManager.getUserConnections(user.id);
      res.json(connections);
    } catch (error) {
      console.error('Error fetching device connections:', error);
      res.status(500).json({ message: 'Failed to fetch device connections' });
    }
  });

  // Connect Apple HealthKit/Apple Watch
  app.post('/api/devices/connect/apple', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { permissions } = req.body;
      const connection = await deviceManager.connectAppleHealthKit(user.id, permissions || [
        'heart_rate', 'steps', 'sleep', 'workouts', 'blood_oxygen'
      ]);

      // In real implementation, this would redirect to Apple's OAuth or handle HealthKit authorization
      // For prototype, we'll simulate a successful connection
      setTimeout(() => {
        deviceManager.updateConnectionStatus(connection.id, 'connected');
      }, 2000);

      res.json({ 
        connection,
        authUrl: null, // Would contain Apple's OAuth URL in real implementation
        message: 'Apple HealthKit connection initiated. Please authorize in your Health app.'
      });
    } catch (error) {
      console.error('Error connecting Apple HealthKit:', error);
      res.status(500).json({ message: 'Failed to connect Apple HealthKit' });
    }
  });

  // Connect Oura Ring
  app.post('/api/devices/connect/oura', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const connection = await deviceManager.connectOuraRing(user.id);

      // In real implementation, this would redirect to Oura's OAuth
      setTimeout(() => {
        deviceManager.updateConnectionStatus(connection.id, 'connected');
      }, 2000);

      res.json({ 
        connection,
        authUrl: null, // Would contain Oura's OAuth URL in real implementation
        message: 'Oura Ring connection initiated. Redirecting to Oura authorization...'
      });
    } catch (error) {
      console.error('Error connecting Oura Ring:', error);
      res.status(500).json({ message: 'Failed to connect Oura Ring' });
    }
  });

  // Connect WHOOP
  app.post('/api/devices/connect/whoop', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const connection = await deviceManager.connectWhoop(user.id);

      // In real implementation, this would redirect to WHOOP's OAuth
      setTimeout(() => {
        deviceManager.updateConnectionStatus(connection.id, 'connected');
      }, 2000);

      res.json({ 
        connection,
        authUrl: null, // Would contain WHOOP's OAuth URL in real implementation
        message: 'WHOOP connection initiated. Redirecting to WHOOP authorization...'
      });
    } catch (error) {
      console.error('Error connecting WHOOP:', error);
      res.status(500).json({ message: 'Failed to connect WHOOP' });
    }
  });

  // Get aggregated health metrics from all connected devices
  app.get('/api/devices/metrics', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { timeframe = '7d', metric } = req.query;
      
      // Get user's connected devices
      const connections = deviceManager.getUserConnections(user.id);
      const connectedDevices = connections.filter(conn => conn.status === 'connected');

      // Generate sample metrics for prototype demonstration
      const sampleMetrics = {
        heart_rate: {
          current: 72,
          trend: '+2.5%',
          data: Array.from({length: 7}, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            value: 70 + Math.random() * 10,
            source: connectedDevices.length > 0 ? connectedDevices[0].metadata.deviceName : 'Simulated'
          }))
        },
        sleep: {
          lastNight: '7h 32m',
          quality: 'Good',
          data: Array.from({length: 7}, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            duration: 7 + Math.random() * 2,
            deep: 1.5 + Math.random() * 0.5,
            rem: 1.8 + Math.random() * 0.7,
            light: 4 + Math.random() * 1
          }))
        },
        activity: {
          steps: 8543,
          calories: 2140,
          activeMinutes: 45
        }
      };

      res.json({
        metrics: metric ? { [metric]: sampleMetrics[metric as string] } : sampleMetrics,
        connectedDevices: connectedDevices.length,
        lastSync: new Date()
      });
    } catch (error) {
      console.error('Error fetching device metrics:', error);
      res.status(500).json({ message: 'Failed to fetch device metrics' });
    }
  });

  // Disconnect a device
  app.delete('/api/devices/disconnect/:deviceId', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { deviceId } = req.params;
      deviceManager.updateConnectionStatus(deviceId, 'disconnected');

      res.json({ message: 'Device disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting device:', error);
      res.status(500).json({ message: 'Failed to disconnect device' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}