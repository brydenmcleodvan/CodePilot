/**
 * Enhanced API Routes with Rate Limiting and Background Tasks
 */

const express = require('express');
const { rateLimitingService } = require('./rateLimitingService');
const { backgroundTaskQueue } = require('./backgroundTaskQueue');
const { FirebaseSecurityService } = require('./firebase-admin');

const router = express.Router();
const securityService = new FirebaseSecurityService();

// Apply rate limiting middleware
router.use('/api/support-ticket', rateLimitingService.createMiddleware('supportTicket'));
router.use('/api/*', rateLimitingService.createMiddleware('apiCall'));

/**
 * Support ticket submission with enhanced spam protection
 */
router.post('/api/support-ticket', async (req, res) => {
  try {
    const { subject, message, category, userPlan } = req.body;
    const userId = req.user?.id || 'anonymous';
    const ipAddress = req.ip;

    // Enhanced rate limiting for support tickets
    const rateLimitCheck = rateLimitingService.checkSupportTicketLimit(
      userId, 
      ipAddress, 
      { subject, message, category }
    );

    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimitCheck.message,
        type: rateLimitCheck.type || 'rate_limit'
      });
    }

    // Verify user authentication
    const userAuth = await securityService.verifyUserAccess(req, 'user');

    // Create support ticket with security validation
    const ticket = await securityService.createSupportTicket({
      subject,
      message,
      category,
      userPlan,
      userAgent: req.get('User-Agent'),
      ipAddress,
      currentUrl: req.get('Referer')
    }, userAuth);

    res.status(201).json({
      success: true,
      ticketId: ticket.id,
      message: 'Support ticket submitted successfully',
      expectedResponse: ticket.priority === 'high' ? '2-4 hours' : 
                       ticket.priority === 'medium' ? '4-8 hours' : '1-2 business days'
    });

  } catch (error) {
    console.error('Support ticket submission error:', error);
    res.status(500).json({
      error: 'Failed to submit support ticket',
      message: error.message
    });
  }
});

/**
 * Background task creation endpoint
 */
router.post('/api/background-task', async (req, res) => {
  try {
    const { taskType, taskData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Queue background task
    const taskId = await backgroundTaskQueue.addTask(taskType, taskData, userId);

    res.status(202).json({
      success: true,
      taskId,
      message: 'Task queued successfully',
      estimatedCompletion: new Date(Date.now() + 30000) // 30 seconds estimate
    });

  } catch (error) {
    console.error('Background task creation error:', error);
    res.status(400).json({
      error: 'Failed to queue task',
      message: error.message
    });
  }
});

/**
 * Task status endpoint
 */
router.get('/api/background-task/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    const task = backgroundTaskQueue.getTaskStatus(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Return safe task information
    res.json({
      id: task.id,
      type: task.type,
      status: task.status,
      progress: task.progress || 0,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      result: task.result,
      error: task.error
    });

  } catch (error) {
    console.error('Task status error:', error);
    res.status(500).json({
      error: 'Failed to get task status',
      message: error.message
    });
  }
});

/**
 * Feature analytics logging with security
 */
router.post('/api/log-feature-usage', async (req, res) => {
  try {
    const { feature, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user authentication
    const userAuth = await securityService.verifyUserAccess(req, 'user');

    // Log feature usage securely
    await securityService.logFeatureUsage({
      feature,
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        timestamp: new Date().toISOString()
      }
    }, userAuth);

    res.json({ success: true });

  } catch (error) {
    console.error('Feature usage logging error:', error);
    res.status(500).json({
      error: 'Failed to log feature usage',
      message: error.message
    });
  }
});

/**
 * Admin analytics endpoint with role verification
 */
router.get('/api/admin/telemetry', async (req, res) => {
  try {
    // Verify admin access
    const userAuth = await securityService.verifyUserAccess(req, 'admin');
    const { timeframe = '7d' } = req.query;

    // Get aggregated analytics
    const analytics = await securityService.getAggregatedAnalytics(parseInt(timeframe));

    res.json({
      featureUsageOverTime: generateMockTimeSeriesData(timeframe),
      supportTicketsByTopic: {
        technical: 45,
        billing: 23,
        general: 67,
        urgent: 12
      },
      userEngagementMetrics: {
        high: 156,
        medium: 234,
        low: 89
      },
      subscriptionBreakdown: {
        basic: 1247,
        premium: 456,
        pro: 123
      },
      realTimeActivity: generateRealtimeActivity(),
      systemHealth: {
        score: 98,
        uptime: '99.9%',
        responseTime: '245ms'
      }
    });

  } catch (error) {
    console.error('Admin telemetry error:', error);
    res.status(500).json({
      error: 'Failed to get telemetry data',
      message: error.message
    });
  }
});

/**
 * User preferences endpoint
 */
router.get('/api/user/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Return user preferences (would come from database)
    res.json({
      theme: 'system',
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Failed to get preferences',
      message: error.message
    });
  }
});

router.post('/api/user/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const preferences = req.body;
    
    // Save preferences (would save to database)
    console.log('Saving preferences for user:', userAuth.uid, preferences);
    
    res.json({ success: true });

  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({
      error: 'Failed to save preferences',
      message: error.message
    });
  }
});

/**
 * Error logging endpoint for enhanced monitoring
 */
router.post('/api/log-error', async (req, res) => {
  try {
    const errorData = req.body;
    const ipAddress = req.ip;
    
    // Enhanced error data for server processing
    const processedError = {
      ...errorData,
      serverTimestamp: new Date().toISOString(),
      ipAddress,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      severity: calculateErrorSeverity(errorData.message),
      processed: true
    };

    // Store error in database (would use Firebase/database in production)
    console.log('Frontend error logged:', {
      errorId: processedError.errorId,
      severity: processedError.severity,
      userId: processedError.userId,
      url: processedError.url
    });

    // Trigger alerts for critical errors
    if (processedError.severity === 'critical') {
      console.warn('CRITICAL ERROR DETECTED:', processedError.message);
      // Would trigger alert system in production
    }

    res.json({ 
      success: true, 
      errorId: processedError.errorId,
      severity: processedError.severity 
    });

  } catch (error) {
    console.error('Error logging failed:', error);
    res.status(500).json({
      error: 'Failed to log error',
      message: error.message
    });
  }
});

function calculateErrorSeverity(message) {
  if (!message) return 'error';
  
  const criticalKeywords = ['network', 'chunk', 'loading', 'script error'];
  const warningKeywords = ['validation', 'form', 'input'];
  
  const lowerMessage = message.toLowerCase();
  
  if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'critical';
  } else if (warningKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'warning';
  }
  return 'error';
}

/**
 * Health data endpoints with enhanced security
 */
router.get('/api/health-metrics', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { timeframe = '7d' } = req.query;
    
    // Return health metrics (would come from secure database)
    res.json({
      metrics: generateHealthMetrics(timeframe),
      summary: {
        avgHeartRate: 72,
        totalSteps: 8542,
        sleepHours: 7.5,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Health metrics error:', error);
    res.status(500).json({
      error: 'Failed to get health metrics',
      message: error.message
    });
  }
});

// Helper functions for mock data generation
function generateMockTimeSeriesData(timeframe) {
  const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString(),
      healthTracking: Math.floor(Math.random() * 100) + 50,
      symptomChecker: Math.floor(Math.random() * 80) + 30,
      aiInsights: Math.floor(Math.random() * 60) + 20
    });
  }
  
  return data;
}

function generateRealtimeActivity() {
  const activities = [
    'User logged health metrics',
    'Symptom check completed',
    'Medication reminder sent',
    'AI insight generated',
    'Support ticket created',
    'Report exported'
  ];
  
  return Array.from({ length: 15 }, (_, i) => ({
    action: activities[Math.floor(Math.random() * activities.length)],
    timestamp: new Date(Date.now() - i * 30000).toISOString(),
    userRole: ['user', 'premium', 'pro'][Math.floor(Math.random() * 3)]
  }));
}

function generateHealthMetrics(timeframe) {
  // Generate sample health metrics data
  return {
    heartRate: Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 60),
    steps: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000) + 5000),
    sleep: Array.from({ length: 7 }, () => Math.floor(Math.random() * 3) + 6)
  };
}

module.exports = router;