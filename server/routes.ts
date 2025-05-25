import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { setupAuth } from './auth';
import { authenticateJwt } from './security/auth/auth-middleware';
import { checkPermission } from './security/permissions/permission-checker';
import { ResourceType } from './security/permissions/permission-types';
import { deviceManager } from './integrations/device-manager';
import { streakEngine } from './streak-engine';
import { recommendationEngine } from './recommendation-engine';
import { aiHealthCoach } from './ai-health-coach';

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
        type: metric.metricType as any,
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

  // Get detailed metric data for graph views
  app.get('/api/metrics/detailed', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { type, timeframe = '7d' } = req.query;
      
      if (!type) {
        return res.status(400).json({ message: 'Metric type is required' });
      }

      // Get user's health metrics from storage filtered by type
      const healthMetrics = await storage.getHealthMetrics(user.id);
      const filteredMetrics = healthMetrics.filter(metric => 
        metric.metricType === type
      );

      // Filter by timeframe
      const now = new Date();
      let cutoffDate = new Date();
      switch (timeframe) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }

      const timeFilteredMetrics = filteredMetrics.filter(metric => 
        new Date(metric.timestamp) >= cutoffDate
      );

      // Format for frontend
      const detailedData = timeFilteredMetrics.map(metric => ({
        date: metric.timestamp.toISOString(),
        value: typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value,
        quality: 'good' as const // This could be determined by various factors
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json(detailedData);
    } catch (error) {
      console.error('Error fetching detailed metrics:', error);
      res.status(500).json({ message: 'Failed to fetch detailed metrics' });
    }
  });

  // ===========================================
  // HEALTH GOALS API ENDPOINTS
  // ===========================================

  // Get all health goals for user with intelligent evaluation
  app.get('/api/health-goals', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goals = await storage.getHealthGoals(user.id);
      const healthMetrics = await storage.getHealthMetrics(user.id);
      const allProgressHistory = await Promise.all(
        goals.map(goal => storage.getGoalProgress(goal.id))
      );
      const progressHistory = allProgressHistory.flat();

      // Import and use the goal engine
      const { goalEngine } = await import('./goal-engine');
      
      // Evaluate all goals using the intelligent engine
      const evaluations = goalEngine.evaluateUserGoals(goals, healthMetrics, progressHistory);
      
      // Transform evaluations back to expected format
      const goalsWithProgress = goals.map(goal => {
        const evaluation = evaluations[goal.id.toString()];
        
        if (!evaluation) {
          // Fallback for goals without evaluation
          return {
            ...goal,
            progress: { current: 0, target: 0, percentage: 0 },
            status: 'on_track' as const,
            daysCompleted: 0,
            totalDays: 1,
            streak: 0
          };
        }

        return {
          ...goal,
          progress: {
            current: evaluation.progress,
            target: evaluation.target,
            percentage: evaluation.percentage
          },
          status: evaluation.status,
          daysCompleted: evaluation.daysCompleted,
          totalDays: evaluation.totalDays,
          streak: evaluation.streak,
          recommendation: evaluation.recommendation,
          nextMilestone: evaluation.nextMilestone,
          riskFactors: evaluation.riskFactors
        };
      });
      
      res.json(goalsWithProgress);
    } catch (error) {
      console.error('Error fetching health goals:', error);
      res.status(500).json({ message: 'Failed to fetch health goals' });
    }
  });

  // Create new health goal
  app.post('/api/health-goals', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goalData = {
        ...req.body,
        userId: user.id,
        status: 'active',
        startDate: new Date()
      };

      const newGoal = await storage.createHealthGoal(goalData);
      res.status(201).json(newGoal);
    } catch (error) {
      console.error('Error creating health goal:', error);
      res.status(500).json({ message: 'Failed to create health goal' });
    }
  });

  // Update health goal
  app.put('/api/health-goals/:goalId', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId } = req.params;
      const goal = await storage.getHealthGoal(parseInt(goalId));
      
      if (!goal || goal.userId !== user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      const updatedGoal = await storage.updateHealthGoal(parseInt(goalId), req.body);
      res.json(updatedGoal);
    } catch (error) {
      console.error('Error updating health goal:', error);
      res.status(500).json({ message: 'Failed to update health goal' });
    }
  });

  // Delete health goal
  app.delete('/api/health-goals/:goalId', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId } = req.params;
      const goal = await storage.getHealthGoal(parseInt(goalId));
      
      if (!goal || goal.userId !== user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      const deleted = await storage.deleteHealthGoal(parseInt(goalId));
      
      if (deleted) {
        res.json({ message: 'Goal deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete goal' });
      }
    } catch (error) {
      console.error('Error deleting health goal:', error);
      res.status(500).json({ message: 'Failed to delete health goal' });
    }
  });

  // Add goal progress entry
  app.post('/api/health-goals/:goalId/progress', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId } = req.params;
      const goal = await storage.getHealthGoal(parseInt(goalId));
      
      if (!goal || goal.userId !== user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      const { value, achieved, notes } = req.body;
      
      const progressData = {
        goalId: parseInt(goalId),
        date: new Date(),
        value: value.toString(),
        achieved: achieved || false,
        notes: notes || null
      };

      const newProgress = await storage.addGoalProgress(progressData);
      res.status(201).json(newProgress);
    } catch (error) {
      console.error('Error adding goal progress:', error);
      res.status(500).json({ message: 'Failed to add goal progress' });
    }
  });

  // Get goal progress history
  app.get('/api/health-goals/:goalId/progress', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId } = req.params;
      const goal = await storage.getHealthGoal(parseInt(goalId));
      
      if (!goal || goal.userId !== user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      const progress = await storage.getGoalProgress(parseInt(goalId));
      res.json(progress);
    } catch (error) {
      console.error('Error fetching goal progress:', error);
      res.status(500).json({ message: 'Failed to fetch goal progress' });
    }
  });

  // Get goal evaluation summary with intelligent insights
  app.get('/api/health-goals/evaluation', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goals = await storage.getHealthGoals(user.id);
      const healthMetrics = await storage.getHealthMetrics(user.id);
      const allProgressHistory = await Promise.all(
        goals.map(goal => storage.getGoalProgress(goal.id))
      );
      const progressHistory = allProgressHistory.flat();

      // Import and use the goal engine for detailed evaluation
      const { goalEngine } = await import('./goal-engine');
      
      const evaluations = goalEngine.evaluateUserGoals(goals, healthMetrics, progressHistory);
      const prioritizedGoals = goalEngine.prioritizeGoalsForIntervention(evaluations);

      // Create summary response
      const summary = {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: Object.values(evaluations).filter(e => e.status === 'completed').length,
        atRiskGoals: Object.values(evaluations).filter(e => e.status === 'at_risk').length,
        prioritizedInterventions: prioritizedGoals.slice(0, 3).map(goalId => {
          const evaluation = evaluations[goalId];
          const goal = goals.find(g => g.id.toString() === goalId);
          return {
            goalId: parseInt(goalId),
            metricType: evaluation.metricType,
            status: evaluation.status,
            recommendation: evaluation.recommendation,
            riskFactors: evaluation.riskFactors,
            goalDescription: goal ? `${goal.metricType} - ${goal.goalValue} ${goal.unit}` : 'Unknown goal'
          };
        }),
        evaluations
      };

      res.json(summary);
    } catch (error) {
      console.error('Error evaluating health goals:', error);
      res.status(500).json({ message: 'Failed to evaluate health goals' });
    }
  });

  // Daily goal check endpoint (for automated systems)
  app.post('/api/health-goals/daily-check', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goals = await storage.getHealthGoals(user.id);
      const healthMetrics = await storage.getHealthMetrics(user.id);
      
      // Focus on today's metrics only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysMetrics = healthMetrics.filter(metric =>
        new Date(metric.timestamp) >= today && new Date(metric.timestamp) < tomorrow
      );

      const results = [];

      for (const goal of goals.filter(g => g.status === 'active')) {
        const goalMetrics = todaysMetrics.filter(m => m.metricType === goal.metricType);
        
        if (goalMetrics.length > 0) {
          const latestValue = parseFloat(goalMetrics[goalMetrics.length - 1].value);
          const targetValue = typeof goal.goalValue === 'object' ? 
            (goal.goalValue as any).target || (goal.goalValue as any).min || (goal.goalValue as any).max :
            goal.goalValue as number;

          let achieved = false;
          let progress = 0;

          switch (goal.goalType) {
            case 'minimum':
              achieved = latestValue >= targetValue;
              progress = (latestValue / targetValue) * 100;
              break;
            case 'maximum':
              achieved = latestValue <= targetValue;
              progress = latestValue <= targetValue ? 100 : (targetValue / latestValue) * 100;
              break;
            case 'target':
              const tolerance = targetValue * 0.1; // 10% tolerance
              achieved = Math.abs(latestValue - targetValue) <= tolerance;
              progress = achieved ? 100 : (latestValue / targetValue) * 100;
              break;
          }

          // Auto-log progress for today
          const progressData = {
            goalId: goal.id,
            date: new Date(),
            value: latestValue.toString(),
            achieved,
            notes: `Auto-logged from ${goalMetrics[goalMetrics.length - 1].source || 'device'} data`
          };

          // Check if progress already exists for today
          const existingProgress = await storage.getGoalProgressForPeriod(goal.id, today, tomorrow);
          
          if (existingProgress.length === 0) {
            await storage.addGoalProgress(progressData);
          }

          results.push({
            goalId: goal.id,
            metricType: goal.metricType,
            currentValue: latestValue,
            targetValue,
            achieved,
            progress: Math.min(progress, 100),
            autoLogged: existingProgress.length === 0
          });
        }
      }

      res.json({
        date: today.toISOString().split('T')[0],
        processedGoals: results.length,
        achievements: results.filter(r => r.achieved).length,
        results
      });
    } catch (error) {
      console.error('Error running daily goal check:', error);
      res.status(500).json({ message: 'Failed to run daily goal check' });
    }
  });

  // Helper function to calculate streak
  function calculateStreak(progressEntries: any[]): number {
    if (progressEntries.length === 0) return 0;
    
    const sortedEntries = progressEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    for (const entry of sortedEntries) {
      if (entry.achieved) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // AI Goal Recommendations endpoint
  app.post('/api/health-goals/recommend', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { question, requestedMetrics } = req.body;
      
      // Import the recommendation engine
      const { goalRecommendationEngine } = await import('./goal-recommendations');

      // Get user profile data
      const healthMetrics = await storage.getHealthMetrics(user.id);
      
      // Build user profile from available data
      const userProfile = {
        age: 30, // Default - could be enhanced with user profile data
        gender: 'other' as const,
        activityLevel: 'moderately_active' as const,
        currentMetrics: {}
      };

      // Add current metric averages if available
      if (healthMetrics.length > 0) {
        const recentMetrics = healthMetrics.filter(m => 
          new Date(m.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );
        
        const metricAverages: { [key: string]: number } = {};
        const metricCounts: { [key: string]: number } = {};
        
        recentMetrics.forEach(metric => {
          const value = parseFloat(metric.value);
          if (!isNaN(value)) {
            metricAverages[metric.metricType] = (metricAverages[metric.metricType] || 0) + value;
            metricCounts[metric.metricType] = (metricCounts[metric.metricType] || 0) + 1;
          }
        });
        
        Object.keys(metricAverages).forEach(metricType => {
          metricAverages[metricType] = metricAverages[metricType] / metricCounts[metricType];
        });
        
        userProfile.currentMetrics = metricAverages;
      }

      let recommendations, aiResponse;

      if (question) {
        // Get AI-powered contextual recommendations
        const result = await goalRecommendationEngine.getAIRecommendations(question, userProfile);
        recommendations = result.recommendations;
        aiResponse = result.aiResponse;
      } else {
        // Get general recommendations
        recommendations = goalRecommendationEngine.generateRecommendations(userProfile, requestedMetrics);
        aiResponse = `I've created ${recommendations.length} personalized health goal recommendations based on your profile and current activity levels.`;
      }

      res.json({
        recommendations,
        aiResponse,
        userProfile: {
          metricsAnalyzed: Object.keys(userProfile.currentMetrics).length,
          timeframeDays: 30
        }
      });
    } catch (error) {
      console.error('Error generating goal recommendations:', error);
      res.status(500).json({ message: 'Failed to generate recommendations' });
    }
  });

  // Get streak analytics for a specific goal
  app.get('/api/health-goals/:goalId/streak', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId } = req.params;
      const goal = await storage.getHealthGoal(parseInt(goalId));
      
      if (!goal || goal.userId !== user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      // Get progress data for streak calculation
      const progressData = await storage.getGoalProgress(parseInt(goalId));
      
      // Convert progress data to format expected by streak engine
      const metricData = progressData.map(progress => ({
        date: progress.date.toISOString().split('T')[0],
        value: parseFloat(progress.value),
        source: 'manual'
      }));

      // Define goal structure for streak engine
      const streakGoal = {
        type: goal.goalType as 'min' | 'max' | 'target' | 'range',
        target: typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue)),
        unit: goal.unit
      };

      // Calculate streak analytics
      const streakResult = streakEngine.calculateStreak(metricData, streakGoal);
      const insights = streakEngine.getStreakInsights(streakResult, goal.metricType);
      const prediction = streakEngine.getStreakPrediction(streakResult.streakHistory);

      res.json({
        goalId: parseInt(goalId),
        goalType: goal.metricType,
        streak: streakResult,
        insights,
        prediction
      });
    } catch (error) {
      console.error('Error calculating streak:', error);
      res.status(500).json({ message: 'Failed to calculate streak' });
    }
  });

  // Get streak summary for all user goals
  app.get('/api/health-goals/streak-summary', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goals = await storage.getHealthGoals(user.id);
      const streakSummaries = [];

      for (const goal of goals) {
        const progressData = await storage.getGoalProgress(goal.id);
        
        const metricData = progressData.map(progress => ({
          date: progress.date.toISOString().split('T')[0],
          value: parseFloat(progress.value),
          source: 'manual'
        }));

        const streakGoal = {
          type: goal.goalType as 'min' | 'max' | 'target' | 'range',
          target: typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue)),
          unit: goal.unit
        };

        const streakResult = streakEngine.calculateStreak(metricData, streakGoal);
        const insights = streakEngine.getStreakInsights(streakResult, goal.metricType);

        streakSummaries.push({
          goalId: goal.id,
          goalType: goal.metricType,
          currentStreak: streakResult.currentStreak,
          longestStreak: streakResult.longestStreak,
          achievementRate: streakResult.achievementRate,
          level: insights.level,
          nextMilestone: insights.nextMilestone
        });
      }

      // Calculate overall streak statistics
      const totalActiveStreaks = streakSummaries.filter(s => s.currentStreak > 0).length;
      const averageStreak = streakSummaries.length > 0 
        ? streakSummaries.reduce((sum, s) => sum + s.currentStreak, 0) / streakSummaries.length 
        : 0;
      const longestOverallStreak = Math.max(...streakSummaries.map(s => s.longestStreak), 0);

      res.json({
        goals: streakSummaries,
        summary: {
          totalGoals: goals.length,
          activeStreaks: totalActiveStreaks,
          averageCurrentStreak: Math.round(averageStreak * 10) / 10,
          longestOverallStreak
        }
      });
    } catch (error) {
      console.error('Error fetching streak summary:', error);
      res.status(500).json({ message: 'Failed to fetch streak summary' });
    }
  });

  // Get personalized health recommendations for a specific goal
  app.get('/api/health-goals/:goalId/recommendations', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId } = req.params;
      const goal = await storage.getHealthGoal(parseInt(goalId));
      
      if (!goal || goal.userId !== user.id) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      // Get progress data and health metrics for analysis
      const progressData = await storage.getGoalProgress(parseInt(goalId));
      const healthMetrics = await storage.getHealthMetrics(user.id);
      
      // Convert progress data to format expected by recommendation engine
      const metricData = progressData.map(progress => ({
        date: progress.date.toISOString().split('T')[0],
        value: parseFloat(progress.value),
        achieved: progress.achieved,
        source: 'manual'
      }));

      // Build context for recommendations
      const context = {
        userId: user.id,
        userProfile: {
          age: (user as any).age,
          activityLevel: (user as any).activityLevel,
          healthConditions: (user as any).healthConditions || []
        },
        recentMetrics: {
          [goal.metricType]: metricData
        },
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]
      };

      // Generate personalized recommendations
      const recommendations = recommendationEngine.generateRecommendations(metricData, {
        id: goal.id,
        metricType: goal.metricType,
        goalType: goal.goalType as 'min' | 'max' | 'target' | 'range',
        target: typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue)),
        unit: goal.unit,
        timeframe: goal.timeframe
      }, context);

      res.json({
        goalId: parseInt(goalId),
        goalType: goal.metricType,
        recommendations,
        generatedAt: new Date().toISOString(),
        dataPoints: metricData.length
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ message: 'Failed to generate recommendations' });
    }
  });

  // AI Health Coach - Ask questions about health goals
  app.post('/api/ai-health-coach/ask', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: 'Question is required' });
      }

      // Get user's health data
      const goals = await storage.getHealthGoals(user.id);
      const healthMetrics = await storage.getHealthMetrics(user.id);

      // Build health data for AI coach
      const healthData = {
        userId: user.id,
        goals: await Promise.all(goals.map(async (goal) => {
          const progressData = await storage.getGoalProgress(goal.id);
          const recentProgress = progressData.slice(-7).map(p => ({
            date: p.date.toISOString().split('T')[0],
            value: parseFloat(p.value),
            achieved: p.achieved
          }));
          
          const currentAverage = recentProgress.length > 0 
            ? recentProgress.reduce((sum, p) => sum + p.value, 0) / recentProgress.length
            : 0;

          return {
            metricType: goal.metricType,
            target: typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue)),
            unit: goal.unit,
            timeframe: goal.timeframe,
            currentAverage,
            recentProgress
          };
        })),
        weeklyStats: {
          totalDays: 7,
          successfulDays: goals.reduce((sum, goal) => {
            // Calculate successful days for this goal
            return sum + Math.floor(Math.random() * 5) + 2; // Placeholder calculation
          }, 0) / goals.length || 0,
          currentStreak: Math.floor(Math.random() * 10) + 1 // Placeholder
        },
        userProfile: {
          age: (user as any).age,
          activityLevel: (user as any).activityLevel || 'moderately_active'
        }
      };

      // Get AI coaching response
      const coachingResponse = await aiHealthCoach.getCoachingResponse(question, healthData);

      res.json({
        question,
        response: coachingResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting AI coach response:', error);
      res.status(500).json({ message: 'Failed to get coaching response' });
    }
  });

  // AI Health Coach - Get weekly summary
  app.get('/api/ai-health-coach/weekly-summary', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Get user's health data
      const goals = await storage.getHealthGoals(user.id);
      
      // Build health data for weekly summary
      const healthData = {
        userId: user.id,
        goals: await Promise.all(goals.map(async (goal) => {
          const progressData = await storage.getGoalProgress(goal.id);
          const recentProgress = progressData.slice(-7).map(p => ({
            date: p.date.toISOString().split('T')[0],
            value: parseFloat(p.value),
            achieved: p.achieved
          }));
          
          const currentAverage = recentProgress.length > 0 
            ? recentProgress.reduce((sum, p) => sum + p.value, 0) / recentProgress.length
            : 0;

          return {
            metricType: goal.metricType,
            target: typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue)),
            unit: goal.unit,
            timeframe: goal.timeframe,
            currentAverage,
            recentProgress
          };
        })),
        weeklyStats: {
          totalDays: 7,
          successfulDays: Math.floor(Math.random() * 5) + 2, // Placeholder
          currentStreak: Math.floor(Math.random() * 10) + 1 // Placeholder
        },
        userProfile: {
          age: (user as any).age,
          activityLevel: (user as any).activityLevel || 'moderately_active'
        }
      };

      // Get weekly summary from AI coach
      const weeklySummary = await aiHealthCoach.getWeeklySummary(healthData);

      res.json({
        summary: weeklySummary,
        weekRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      res.status(500).json({ message: 'Failed to generate weekly summary' });
    }
  });

  // Community Challenges - Get active challenges
  app.get('/api/challenges', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { communityChallengeEngine } = await import('./community-challenge-engine');
      const challenges = await communityChallengeEngine.getActiveChallenges(user.id);

      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      res.status(500).json({ message: 'Failed to fetch challenges' });
    }
  });

  // Join a challenge
  app.post('/api/challenges/:id/join', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const { teamId } = req.body;

      const { communityChallengeEngine } = await import('./community-challenge-engine');
      const success = await communityChallengeEngine.joinChallenge(id, user.id, teamId);

      if (success) {
        res.json({ message: 'Successfully joined challenge' });
      } else {
        res.status(400).json({ message: 'Failed to join challenge' });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({ message: 'Failed to join challenge' });
    }
  });

  // Leave a challenge
  app.post('/api/challenges/:id/leave', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      const { communityChallengeEngine } = await import('./community-challenge-engine');
      const success = await communityChallengeEngine.leaveChallenge(id, user.id);

      if (success) {
        res.json({ message: 'Successfully left challenge' });
      } else {
        res.status(400).json({ message: 'Failed to leave challenge' });
      }
    } catch (error) {
      console.error('Error leaving challenge:', error);
      res.status(500).json({ message: 'Failed to leave challenge' });
    }
  });

  // Get challenge leaderboard
  app.get('/api/leaderboard/:challengeId?/:type?', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { challengeId, type } = req.params;
      const { communityChallengeEngine } = await import('./community-challenge-engine');

      if (type === 'teams') {
        const teamLeaderboard = await communityChallengeEngine.getTeamLeaderboard(challengeId || 'default');
        res.json(teamLeaderboard);
      } else {
        const individualLeaderboard = await communityChallengeEngine.getChallengeLeaderboard(challengeId || 'default');
        res.json(individualLeaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  // Habit Loops & Micro Goals - Get habit loops for user
  app.get('/api/habit-loops', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { habitLoopEngine } = await import('./habit-loop-engine');
      const habitLoops = await habitLoopEngine.getHabitLoops(user.id);

      res.json(habitLoops);
    } catch (error) {
      console.error('Error fetching habit loops:', error);
      res.status(500).json({ message: 'Failed to fetch habit loops' });
    }
  });

  // Get AI habit recommendations
  app.get('/api/habit-recommendations', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { habitLoopEngine } = await import('./habit-loop-engine');
      const recommendations = await habitLoopEngine.generateHabitRecommendations(user.id);

      res.json(recommendations);
    } catch (error) {
      console.error('Error generating habit recommendations:', error);
      res.status(500).json({ message: 'Failed to generate habit recommendations' });
    }
  });

  // Create micro goals
  app.post('/api/micro-goals', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { goalId, difficulty = 'easy' } = req.body;
      
      const { habitLoopEngine } = await import('./habit-loop-engine');
      const microGoals = await habitLoopEngine.createMicroGoals(goalId, difficulty);

      // In a real implementation, you would save these to the database
      res.json(microGoals);
    } catch (error) {
      console.error('Error creating micro goals:', error);
      res.status(500).json({ message: 'Failed to create micro goals' });
    }
  });

  // Dynamic Notifications & Nudges - Get user notifications
  app.get('/api/notifications', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { notificationEngine } = await import('./notification-engine');
      
      // Check for new notifications
      const newNotifications = await notificationEngine.checkAndGenerateNotifications(user.id);
      
      // Get existing pending notifications
      const pendingNotifications = await notificationEngine.getPendingNotifications(user.id);
      
      // Combine and return all notifications
      const allNotifications = [...newNotifications, ...pendingNotifications];
      
      res.json(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', authenticateJwt, async (req, res) => {
    try {
      const { id } = req.params;
      const { notificationEngine } = await import('./notification-engine');
      
      await notificationEngine.markAsRead(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  // Dismiss notification
  app.post('/api/notifications/:id/dismiss', authenticateJwt, async (req, res) => {
    try {
      const { id } = req.params;
      const { notificationEngine } = await import('./notification-engine');
      
      await notificationEngine.dismissNotification(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error dismissing notification:', error);
      res.status(500).json({ message: 'Failed to dismiss notification' });
    }
  });

  // Health Summary Engine - Get weekly summary
  app.get('/api/health-summary/weekly', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { healthSummaryEngine } = await import('./health-summary-engine');
      const summary = await healthSummaryEngine.generateWeeklySummary(user.id);

      res.json(summary);
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      res.status(500).json({ message: 'Failed to generate weekly summary' });
    }
  });

  // Health Summary Engine - Get daily summary
  app.get('/api/health-summary/daily', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { healthSummaryEngine } = await import('./health-summary-engine');
      const summary = await healthSummaryEngine.generateDailySummary(user.id);

      res.json(summary);
    } catch (error) {
      console.error('Error generating daily summary:', error);
      res.status(500).json({ message: 'Failed to generate daily summary' });
    }
  });

  // Get consistency dashboard data with streaks and tips
  app.get('/api/consistency-dashboard', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goals = await storage.getHealthGoals(user.id);
      const healthMetrics = await storage.getHealthMetrics(user.id);

      // Calculate streaks for each goal
      const streaks = await Promise.all(goals.map(async (goal) => {
        const progressData = await storage.getGoalProgress(goal.id);
        
        // Calculate current streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        // Sort progress by date descending to calculate current streak
        const sortedProgress = progressData.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        for (const progress of sortedProgress) {
          if (progress.achieved) {
            if (currentStreak === 0 || 
                (sortedProgress[currentStreak - 1] && 
                 progress.date.getTime() === sortedProgress[currentStreak - 1].date.getTime() - 24 * 60 * 60 * 1000)) {
              currentStreak++;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        // Calculate longest streak and weekly success rate
        const last7Days = progressData.filter(p => {
          const daysDiff = (new Date().getTime() - p.date.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });

        const weeklySuccessRate = last7Days.length > 0 
          ? Math.round((last7Days.filter(p => p.achieved).length / last7Days.length) * 100)
          : 0;

        // Calculate longest streak in history
        let tempStreakCount = 0;
        for (const progress of progressData.sort((a, b) => a.date.getTime() - b.date.getTime())) {
          if (progress.achieved) {
            tempStreakCount++;
            longestStreak = Math.max(longestStreak, tempStreakCount);
          } else {
            tempStreakCount = 0;
          }
        }

        return {
          goalId: goal.id,
          goalType: goal.metricType,
          currentStreak,
          longestStreak,
          weeklySuccessRate
        };
      }));

      // Generate personalized tips based on goal performance
      const tips = [];
      
      for (const streak of streaks) {
        if (streak.currentStreak === 0 && streak.weeklySuccessRate < 50) {
          tips.push({
            id: `tip-${streak.goalId}-consistency`,
            title: `Improve your ${streak.goalType} consistency`,
            message: `You've missed your ${streak.goalType} goal recently. Try setting a specific time each day for this activity to build a routine.`,
            category: streak.goalType as any,
            priority: 'high' as const,
            actionable: true,
            suggestedAction: `Set ${streak.goalType} reminder`,
            relatedMetric: streak.goalType
          });
        } else if (streak.currentStreak >= 7 && streak.currentStreak < 14) {
          tips.push({
            id: `tip-${streak.goalId}-momentum`,
            title: `Great ${streak.goalType} momentum!`,
            message: `You're building an excellent ${streak.goalType} habit with ${streak.currentStreak} days in a row. Keep it up to reach 2 weeks!`,
            category: streak.goalType as any,
            priority: 'medium' as const,
            actionable: true,
            suggestedAction: 'View progress details',
            relatedMetric: streak.goalType
          });
        }
      }

      // Add general tips based on overall performance
      const averageSuccessRate = streaks.length > 0 
        ? streaks.reduce((sum, s) => sum + s.weeklySuccessRate, 0) / streaks.length 
        : 0;

      if (averageSuccessRate < 60) {
        tips.push({
          id: 'tip-general-consistency',
          title: 'Focus on building habits gradually',
          message: 'Start with just one goal and focus on consistency rather than perfection. Once that becomes routine, add another goal.',
          category: 'general',
          priority: 'high' as const,
          actionable: true,
          suggestedAction: 'Prioritize one goal',
          relatedMetric: 'Overall consistency'
        });
      }

      // Calculate weekly stats
      const totalGoals = goals.length;
      const achievedDays = streaks.reduce((sum, s) => sum + Math.min(s.currentStreak, 7), 0);
      const consistencyScore = Math.round(averageSuccessRate);
      
      // Calculate improvement (placeholder - would need historical data)
      const improvement = Math.floor(Math.random() * 21) - 10; // -10 to +10

      const weeklyStats = {
        totalGoals,
        achievedDays,
        consistencyScore,
        improvement
      };

      res.json({
        streaks,
        tips: tips.slice(0, 5), // Limit to 5 most relevant tips
        weeklyStats
      });
    } catch (error) {
      console.error('Error fetching consistency data:', error);
      res.status(500).json({ message: 'Failed to fetch consistency data' });
    }
  });

  // Get comprehensive health recommendations across all goals
  app.get('/api/health-recommendations', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const goals = await storage.getHealthGoals(user.id);
      const healthMetrics = await storage.getHealthMetrics(user.id);
      const allRecommendations = [];

      // Build comprehensive user profile
      const userProfile = {
        age: (user as any).age,
        activityLevel: (user as any).activityLevel,
        healthConditions: (user as any).healthConditions || []
      };

      // Generate recommendations for each goal
      for (const goal of goals) {
        const progressData = await storage.getGoalProgress(goal.id);
        
        const metricData = progressData.map(progress => ({
          date: progress.date.toISOString().split('T')[0],
          value: parseFloat(progress.value),
          achieved: progress.achieved,
          source: 'manual'
        }));

        if (metricData.length > 0) {
          const context = {
            userId: user.id,
            userProfile,
            recentMetrics: { [goal.metricType]: metricData },
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
            dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]
          };

          const recommendations = recommendationEngine.generateRecommendations(metricData, {
            id: goal.id,
            metricType: goal.metricType,
            goalType: goal.goalType as 'min' | 'max' | 'target' | 'range',
            target: typeof goal.goalValue === 'number' ? goal.goalValue : parseFloat(String(goal.goalValue)),
            unit: goal.unit,
            timeframe: goal.timeframe
          }, context);

          allRecommendations.push(...recommendations.map(rec => ({
            ...rec,
            goalId: goal.id,
            goalType: goal.metricType
          })));
        }
      }

      // Sort all recommendations by priority and confidence
      const sortedRecommendations = allRecommendations
        .sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return (priorityWeight[b.priority] - priorityWeight[a.priority]) || (b.confidenceLevel - a.confidenceLevel);
        })
        .slice(0, 10); // Return top 10 recommendations

      // Calculate summary stats
      const summary = {
        totalRecommendations: sortedRecommendations.length,
        highPriority: sortedRecommendations.filter(r => r.priority === 'high').length,
        categories: [...new Set(sortedRecommendations.map(r => r.category))],
        averageConfidence: sortedRecommendations.length > 0 
          ? Math.round(sortedRecommendations.reduce((sum, r) => sum + r.confidenceLevel, 0) / sortedRecommendations.length)
          : 0
      };

      res.json({
        recommendations: sortedRecommendations,
        summary,
        generatedAt: new Date().toISOString(),
        goalsAnalyzed: goals.length
      });
    } catch (error) {
      console.error('Error generating health recommendations:', error);
      res.status(500).json({ message: 'Failed to generate health recommendations' });
    }
  });

  // Quick goal creation from AI recommendations
  app.post('/api/health-goals/create-from-recommendation', authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { metricType, goalType, recommendedValue, unit, timeframe, reasoning } = req.body;

      // Create goal from AI recommendation
      const goalData = {
        userId: user.id,
        metricType,
        goalType,
        goalValue: recommendedValue,
        unit,
        timeframe,
        startDate: new Date(),
        status: 'active',
        notes: `AI-recommended goal: ${reasoning}`
      };

      const newGoal = await storage.createHealthGoal(goalData);
      
      res.status(201).json({
        goal: newGoal,
        message: 'Goal created successfully from AI recommendation'
      });
    } catch (error) {
      console.error('Error creating goal from recommendation:', error);
      res.status(500).json({ message: 'Failed to create goal from recommendation' });
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