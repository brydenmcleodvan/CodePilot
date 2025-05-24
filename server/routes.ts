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

  // ===========================================
  // HEALTH AI CHAT ENDPOINT
  // ===========================================

  app.post('/api/health-ai/chat', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { message, healthContext, conversationHistory } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: 'OpenAI API key not configured. Please contact support to enable AI features.' 
        });
      }

      // Build context from user's health data
      const contextPrompt = `
You are a helpful health AI assistant analyzing personalized health data. Respond with empathy, accuracy, and actionable insights.

USER'S CURRENT HEALTH DATA:
- Heart Rate: Average ${healthContext.heartRate.avg} bpm, Recent ${healthContext.heartRate.recent} bpm (${healthContext.heartRate.trend})
- Sleep: Average ${healthContext.sleep.avgHours} hours, Quality: ${healthContext.sleep.quality}
- Activity: Average ${healthContext.activity.avgSteps.toLocaleString()} steps, Weekly active days: ${healthContext.activity.weeklyActive}
- Heart Rate Variability: Average ${healthContext.hrv.avg}ms, Status: ${healthContext.hrv.status}
- Blood Glucose: Average ${healthContext.glucose.avg} mg/dL, Recent ${healthContext.glucose.recent} mg/dL
- Connected Devices: ${healthContext.connectedDevices.join(', ')}

GUIDELINES:
- Provide personalized insights based on their specific data
- Be encouraging and supportive
- Suggest actionable improvements
- Explain health concepts simply
- Never provide medical diagnosis or replace professional medical advice
- Focus on general wellness and lifestyle improvements
- Reference their specific metrics when relevant

USER QUESTION: ${message}
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: 'system', content: contextPrompt },
            ...conversationHistory.slice(-4).map((msg: any) => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Generate follow-up suggestions based on the conversation
      const suggestions = generateFollowUpSuggestions(message, healthContext);

      res.json({
        response: aiResponse,
        suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
      });

    } catch (error) {
      console.error('Health AI chat error:', error);
      res.status(500).json({ 
        message: 'Failed to get AI response. Please try again or contact support if the issue persists.' 
      });
    }
  });

  // ===========================================
  // FAMILY TIMELINE ENDPOINTS
  // ===========================================

  // Get family members
  app.get('/api/family/members/:familyId?', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { familyId } = req.params;
      
      // Get family members (including user themselves)
      const familyMembers = await storage.getFamilyMembers(user.id, familyId ? parseInt(familyId) : undefined);
      
      res.json(familyMembers);
    } catch (error) {
      console.error('Error fetching family members:', error);
      res.status(500).json({ message: 'Failed to fetch family members' });
    }
  });

  // Get family timeline events
  app.get('/api/family/timeline/:familyId?', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { familyId } = req.params;
      const { selectedMember, timeFilter } = req.query;
      
      // Get timeline events from multiple sources
      const timelineEvents = await storage.getFamilyTimelineEvents(
        user.id, 
        familyId ? parseInt(familyId) : undefined,
        selectedMember ? parseInt(selectedMember as string) : undefined,
        timeFilter as string
      );
      
      res.json(timelineEvents);
    } catch (error) {
      console.error('Error fetching family timeline:', error);
      res.status(500).json({ message: 'Failed to fetch family timeline' });
    }
  });

  // ===========================================
  // METRICS ENGINE ENDPOINT
  // ===========================================

  app.get('/api/metrics/analysis', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { timeframe = '30d' } = req.query;
      
      // Get user's health metrics from storage
      const healthMetrics = await storage.getHealthMetrics(user.id);
      
      // Convert to metrics engine format
      const metricsData = healthMetrics.map(metric => ({
        type: metric.type as any,
        value: typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value,
        timestamp: new Date(metric.timestamp),
        source: metric.source || 'Manual Entry',
        quality: 'high' as const
      }));

      // Import metrics engine
      const { metricsEngine } = await import('./metrics-engine');
      
      // Analyze metrics
      const analysis = metricsEngine.analyzeUserMetrics(
        metricsData, 
        user.id, 
        timeframe as '7d' | '30d' | '90d'
      );
      
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing metrics:', error);
      res.status(500).json({ message: 'Failed to analyze health metrics' });
    }
  });

  // Helper function to generate contextual follow-up suggestions
  function generateFollowUpSuggestions(userMessage: string, healthContext: any): string[] {
    const message = userMessage.toLowerCase();
    const suggestions: string[] = [];

    // Sleep-related suggestions
    if (message.includes('sleep') || message.includes('tired') || message.includes('rest')) {
      if (healthContext.sleep.avgHours < 7) {
        suggestions.push("Want to set a sleep goal to reach 7-8 hours nightly?");
      }
      suggestions.push("Should we create a bedtime routine for better sleep quality?");
      suggestions.push("Would you like tips for improving sleep hygiene?");
    }

    // Heart rate and fitness suggestions
    if (message.includes('heart') || message.includes('fitness') || message.includes('exercise')) {
      if (healthContext.activity.avgSteps < 8000) {
        suggestions.push("Want to set a daily step goal to boost your activity?");
      }
      suggestions.push("Should we create a cardio plan to improve heart health?");
      suggestions.push("Would you like breathing exercises for heart rate variability?");
    }

    // Activity and movement suggestions
    if (message.includes('activity') || message.includes('steps') || message.includes('exercise')) {
      suggestions.push("Want to set up activity reminders throughout your day?");
      suggestions.push("Should we plan a weekly workout schedule?");
      suggestions.push("Would you like to track progress with activity challenges?");
    }

    // General wellness suggestions
    if (message.includes('stress') || message.includes('recovery') || message.includes('wellness')) {
      suggestions.push("Want to explore meditation techniques for better recovery?");
      suggestions.push("Should we set up stress tracking and management?");
      suggestions.push("Would you like personalized wellness recommendations?");
    }

    // Nutrition and glucose suggestions
    if (message.includes('glucose') || message.includes('blood sugar') || message.includes('nutrition')) {
      suggestions.push("Want to track how meals affect your glucose levels?");
      suggestions.push("Should we create meal timing recommendations?");
      suggestions.push("Would you like nutrition tips for stable blood sugar?");
    }

    // Default suggestions if no specific topic detected
    if (suggestions.length === 0) {
      suggestions.push("Want to set personalized health goals based on your data?");
      suggestions.push("Should we create a weekly wellness check-in reminder?");
      suggestions.push("Would you like tips to optimize your current health metrics?");
    }

    return suggestions;
  }

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}