/**
 * Enhanced API Routes with Rate Limiting and Background Tasks
 */

const express = require('express');
const { rateLimitingService } = require('./rateLimitingService');
const { backgroundTaskQueue } = require('./backgroundTaskQueue');
const { FirebaseSecurityService } = require('./firebase-admin');
const { customAlertsEngine } = require('./customAlertsEngine');
const { insightCorrelationEngine } = require('./insightCorrelationEngine');
const { aiWeeklyRecapEngine } = require('./aiWeeklyRecapEngine');
const { smartCoachingMarketplace } = require('./smartCoachingMarketplace');
const { familyCaregiverSharing } = require('./familyCaregiverSharing');
const { medicalClaimIntegration } = require('./medicalClaimIntegration');
const { federatedHealthIntelligence } = require('./federatedHealthIntelligence');
const { voiceGestureInterface } = require('./voiceGestureInterface');
const { digitalTwinSimulation } = require('./digitalTwinSimulation');
const { proactiveAlertSystem } = require('./proactiveAlertSystem');
const { geneticHealthEngine } = require('./geneticHealthEngine');
const { healthPlanningToolkit } = require('./healthPlanningToolkit');
const { behavioralPsychologyLayer } = require('./behavioralPsychologyLayer');
const { medicalProviderMode } = require('./medicalProviderMode');
const { outcomesReportingEngine } = require('./outcomesReportingEngine');

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

/**
 * Custom Alerts API Endpoints
 */
router.get('/api/custom-alerts', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const alerts = customAlertsEngine.getUserAlerts(userAuth.uid);
    
    res.json(alerts);
  } catch (error) {
    console.error('Get custom alerts error:', error);
    res.status(500).json({
      error: 'Failed to get custom alerts',
      message: error.message
    });
  }
});

router.post('/api/custom-alerts', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const alertData = req.body;
    
    const alert = await customAlertsEngine.createAlert(userAuth.uid, alertData);
    
    res.status(201).json({
      success: true,
      alert,
      message: 'Custom alert created successfully'
    });
  } catch (error) {
    console.error('Create custom alert error:', error);
    res.status(400).json({
      error: 'Failed to create custom alert',
      message: error.message
    });
  }
});

router.put('/api/custom-alerts/:alertId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { alertId } = req.params;
    const alertData = req.body;
    
    const alert = await customAlertsEngine.updateAlert(alertId, userAuth.uid, alertData);
    
    res.json({
      success: true,
      alert,
      message: 'Alert updated successfully'
    });
  } catch (error) {
    console.error('Update custom alert error:', error);
    res.status(400).json({
      error: 'Failed to update custom alert',
      message: error.message
    });
  }
});

router.delete('/api/custom-alerts/:alertId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { alertId } = req.params;
    
    await customAlertsEngine.deleteAlert(alertId, userAuth.uid);
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete custom alert error:', error);
    res.status(400).json({
      error: 'Failed to delete custom alert',
      message: error.message
    });
  }
});

router.patch('/api/custom-alerts/:alertId/toggle', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { alertId } = req.params;
    const { isActive } = req.body;
    
    const alert = await customAlertsEngine.toggleAlert(alertId, userAuth.uid, isActive);
    
    res.json({
      success: true,
      alert,
      message: `Alert ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle custom alert error:', error);
    res.status(400).json({
      error: 'Failed to toggle custom alert',
      message: error.message
    });
  }
});

/**
 * Health Insights & Correlation API Endpoints
 */
router.get('/api/health-insights/correlations', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { timeframe = '30' } = req.query;
    
    const insights = await insightCorrelationEngine.analyzeUserCorrelations(
      userAuth.uid, 
      parseInt(timeframe)
    );
    
    res.json(insights);
  } catch (error) {
    console.error('Health insights correlation error:', error);
    res.status(500).json({
      error: 'Failed to analyze health correlations',
      message: error.message
    });
  }
});

router.get('/api/health-insights/visualization', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { metric1, metric2, timeframe = '30' } = req.query;
    
    if (!metric1 || !metric2) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both metric1 and metric2 are required'
      });
    }
    
    const visualization = insightCorrelationEngine.getCorrelationVisualization(
      userAuth.uid,
      metric1,
      metric2,
      parseInt(timeframe)
    );
    
    res.json(visualization);
  } catch (error) {
    console.error('Visualization data error:', error);
    res.status(500).json({
      error: 'Failed to get visualization data',
      message: error.message
    });
  }
});

router.get('/api/health-insights/cached', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const cachedInsights = insightCorrelationEngine.getCachedInsights(userAuth.uid);
    
    if (!cachedInsights) {
      return res.status(404).json({
        error: 'No cached insights found',
        message: 'Run correlation analysis to generate insights'
      });
    }
    
    res.json({
      success: true,
      insights: cachedInsights,
      cached: true
    });
  } catch (error) {
    console.error('Cached insights error:', error);
    res.status(500).json({
      error: 'Failed to get cached insights',
      message: error.message
    });
  }
});

/**
 * AI Weekly Recap API Endpoints
 */
router.get('/api/weekly-recap', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { week = '0' } = req.query;
    
    const weekOffset = parseInt(week);
    if (isNaN(weekOffset) || weekOffset < 0 || weekOffset > 8) {
      return res.status(400).json({
        error: 'Invalid week parameter',
        message: 'Week must be between 0 and 8'
      });
    }
    
    // Check for cached recap first
    const cachedRecap = aiWeeklyRecapEngine.getCachedRecap(userAuth.uid, weekOffset);
    if (cachedRecap) {
      return res.json({
        success: true,
        recap: cachedRecap,
        cached: true
      });
    }
    
    // Generate new recap
    const recapResult = await aiWeeklyRecapEngine.generateWeeklyRecap(userAuth.uid, weekOffset);
    
    res.json(recapResult);
  } catch (error) {
    console.error('Weekly recap generation error:', error);
    res.status(500).json({
      error: 'Failed to generate weekly recap',
      message: error.message
    });
  }
});

router.post('/api/weekly-recap/regenerate', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { week = '0' } = req.body;
    
    const weekOffset = parseInt(week);
    
    // Force regeneration by clearing cache and generating new recap
    const recapResult = await aiWeeklyRecapEngine.generateWeeklyRecap(userAuth.uid, weekOffset);
    
    res.json({
      ...recapResult,
      regenerated: true
    });
  } catch (error) {
    console.error('Weekly recap regeneration error:', error);
    res.status(500).json({
      error: 'Failed to regenerate weekly recap',
      message: error.message
    });
  }
});

/**
 * Smart Coaching Marketplace API Endpoints
 */
router.get('/api/coaching/matches', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { specialty, priceRange } = req.query;
    
    const preferences = {
      specialty,
      priceRange,
      budget: priceRange === 'budget' ? 75 : priceRange === 'standard' ? 100 : 150
    };
    
    const matches = await smartCoachingMarketplace.findMatchingCoaches(userAuth.uid, preferences);
    
    res.json(matches);
  } catch (error) {
    console.error('Coach matching error:', error);
    res.status(500).json({
      error: 'Failed to find matching coaches',
      message: error.message
    });
  }
});

router.post('/api/coaching/book-session', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.coachId || !sessionData.scheduledTime) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'coachId and scheduledTime are required'
      });
    }
    
    const bookingResult = await smartCoachingMarketplace.bookCoachingSession(
      userAuth.uid,
      sessionData.coachId,
      sessionData
    );
    
    res.json(bookingResult);
  } catch (error) {
    console.error('Session booking error:', error);
    res.status(500).json({
      error: 'Failed to book session',
      message: error.message
    });
  }
});

router.get('/api/coaching/my-sessions', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Get user's coaching sessions
    const sessions = Array.from(smartCoachingMarketplace.coachingSessions.values())
      .filter(session => session.userId === userAuth.uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      sessions,
      totalSessions: sessions.length
    });
  } catch (error) {
    console.error('Sessions retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: error.message
    });
  }
});

router.post('/api/coaching/message', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { sessionId, message, messageType } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'sessionId and message are required'
      });
    }
    
    const messageResult = await smartCoachingMarketplace.sendCoachingMessage(
      sessionId,
      userAuth.uid,
      message,
      messageType
    );
    
    res.json(messageResult);
  } catch (error) {
    console.error('Message sending error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
});

router.get('/api/coaching/anonymized-data/:sessionId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { sessionId } = req.params;
    
    // This endpoint is for coaches to access anonymized user data
    const dataResult = await smartCoachingMarketplace.getAnonymizedUserData(
      userAuth.uid,
      userAuth.uid, // In production, this would be the coach's ID
      sessionId
    );
    
    res.json(dataResult);
  } catch (error) {
    console.error('Data access error:', error);
    res.status(500).json({
      error: 'Failed to get anonymized data',
      message: error.message
    });
  }
});

// Coach-specific endpoints
router.post('/api/coaching/coach/register', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const coachData = {
      ...req.body,
      userId: userAuth.uid
    };
    
    const registrationResult = await smartCoachingMarketplace.registerCoach(coachData);
    
    res.json(registrationResult);
  } catch (error) {
    console.error('Coach registration error:', error);
    res.status(500).json({
      error: 'Failed to register coach',
      message: error.message
    });
  }
});

router.get('/api/coaching/coach/analytics', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { timeframe = '30d' } = req.query;
    
    // Find coach by user ID
    const coach = Array.from(smartCoachingMarketplace.coaches.values())
      .find(c => c.userId === userAuth.uid);
    
    if (!coach) {
      return res.status(404).json({
        error: 'Coach profile not found',
        message: 'You are not registered as a coach'
      });
    }
    
    const analytics = await smartCoachingMarketplace.getCoachAnalytics(coach.id, timeframe);
    
    res.json(analytics);
  } catch (error) {
    console.error('Coach analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error.message
    });
  }
});

/**
 * Family & Caregiver Sharing API Endpoints
 */
router.post('/api/family-sharing/invite', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const inviteData = req.body;
    
    // Validate required fields
    if (!inviteData.email || !inviteData.name || !inviteData.relationship) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'email, name, and relationship are required'
      });
    }

    if (!inviteData.sharedCategories || inviteData.sharedCategories.length === 0) {
      return res.status(400).json({
        error: 'No data categories selected',
        message: 'At least one data category must be shared'
      });
    }
    
    const invitationResult = await familyCaregiverSharing.createSharingInvitation(
      userAuth.uid,
      inviteData
    );
    
    res.json(invitationResult);
  } catch (error) {
    console.error('Family sharing invitation error:', error);
    res.status(500).json({
      error: 'Failed to send invitation',
      message: error.message
    });
  }
});

router.post('/api/family-sharing/accept/:invitationId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { invitationId } = req.params;
    
    const acceptanceResult = await familyCaregiverSharing.acceptSharingInvitation(
      invitationId,
      userAuth.uid
    );
    
    res.json(acceptanceResult);
  } catch (error) {
    console.error('Invitation acceptance error:', error);
    res.status(500).json({
      error: 'Failed to accept invitation',
      message: error.message
    });
  }
});

router.get('/api/family-sharing/connections', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { role = 'all' } = req.query;
    
    const connectionsResult = await familyCaregiverSharing.getUserSharingConnections(
      userAuth.uid,
      role
    );
    
    res.json(connectionsResult);
  } catch (error) {
    console.error('Connections retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get sharing connections',
      message: error.message
    });
  }
});

router.get('/api/family-sharing/shared-data/:connectionId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { connectionId } = req.params;
    const { category, limit, startDate, endDate } = req.query;
    
    if (!category) {
      return res.status(400).json({
        error: 'Missing data category',
        message: 'category parameter is required'
      });
    }
    
    const filters = {
      limit: limit ? parseInt(limit) : 50,
      startDate,
      endDate
    };
    
    const sharedDataResult = await familyCaregiverSharing.getSharedData(
      connectionId,
      userAuth.uid,
      category,
      filters
    );
    
    res.json(sharedDataResult);
  } catch (error) {
    console.error('Shared data access error:', error);
    res.status(500).json({
      error: 'Failed to get shared data',
      message: error.message
    });
  }
});

router.put('/api/family-sharing/permissions/:connectionId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { connectionId } = req.params;
    const updates = req.body;
    
    const updateResult = await familyCaregiverSharing.updateSharingPermissions(
      connectionId,
      userAuth.uid,
      updates
    );
    
    res.json(updateResult);
  } catch (error) {
    console.error('Permission update error:', error);
    res.status(500).json({
      error: 'Failed to update permissions',
      message: error.message
    });
  }
});

router.delete('/api/family-sharing/connections/:connectionId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { connectionId } = req.params;
    const { reason } = req.body;
    
    const revokeResult = await familyCaregiverSharing.revokeSharingAccess(
      connectionId,
      userAuth.uid,
      reason
    );
    
    res.json(revokeResult);
  } catch (error) {
    console.error('Access revocation error:', error);
    res.status(500).json({
      error: 'Failed to revoke access',
      message: error.message
    });
  }
});

router.post('/api/family-sharing/notes/:connectionId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { connectionId } = req.params;
    const noteData = req.body;
    
    if (!noteData.title || !noteData.content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'title and content are required'
      });
    }
    
    const noteResult = await familyCaregiverSharing.addCaregiverNote(
      connectionId,
      userAuth.uid,
      noteData
    );
    
    res.json(noteResult);
  } catch (error) {
    console.error('Note addition error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: error.message
    });
  }
});

router.get('/api/family-sharing/access-logs/:connectionId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { connectionId } = req.params;
    const { limit = '50' } = req.query;
    
    const logsResult = await familyCaregiverSharing.getAccessLogs(
      connectionId,
      userAuth.uid,
      parseInt(limit)
    );
    
    res.json(logsResult);
  } catch (error) {
    console.error('Access logs error:', error);
    res.status(500).json({
      error: 'Failed to get access logs',
      message: error.message
    });
  }
});

router.get('/api/family-sharing/emergency-contacts', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const emergencyContactsResult = await familyCaregiverSharing.getEmergencyContacts(userAuth.uid);
    
    res.json(emergencyContactsResult);
  } catch (error) {
    console.error('Emergency contacts error:', error);
    res.status(500).json({
      error: 'Failed to get emergency contacts',
      message: error.message
    });
  }
});

/**
 * Medical Claim Integration API Endpoints
 */
router.post('/api/medical-claims/generate', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const exportRequest = req.body;
    
    // Validate required fields
    if (!exportRequest.claimType || !exportRequest.format) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'claimType and format are required'
      });
    }

    if (!exportRequest.includeCategories || exportRequest.includeCategories.length === 0) {
      return res.status(400).json({
        error: 'No data categories selected',
        message: 'At least one data category must be included'
      });
    }
    
    const claimExport = await medicalClaimIntegration.generateClaimExport(
      userAuth.uid,
      exportRequest
    );
    
    res.json(claimExport);
  } catch (error) {
    console.error('Medical claim generation error:', error);
    res.status(500).json({
      error: 'Failed to generate claim export',
      message: error.message
    });
  }
});

router.get('/api/medical-claims/exports', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Get user's export history
    const exports = Array.from(medicalClaimIntegration.exportHistory.values())
      .filter(exp => exp.userId === userAuth.uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      exports,
      totalExports: exports.length
    });
  } catch (error) {
    console.error('Export history error:', error);
    res.status(500).json({
      error: 'Failed to get export history',
      message: error.message
    });
  }
});

router.get('/api/medical-claims/export/:exportId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { exportId } = req.params;
    
    const exportRecord = medicalClaimIntegration.exportHistory.get(exportId);
    
    if (!exportRecord) {
      return res.status(404).json({
        error: 'Export not found',
        message: 'The requested export does not exist'
      });
    }

    if (exportRecord.userId !== userAuth.uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this export'
      });
    }
    
    res.json({
      success: true,
      export: exportRecord
    });
  } catch (error) {
    console.error('Export retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get export',
      message: error.message
    });
  }
});

router.get('/api/medical-claims/download/:exportId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { exportId } = req.params;
    
    const exportRecord = medicalClaimIntegration.exportHistory.get(exportId);
    
    if (!exportRecord || exportRecord.userId !== userAuth.uid) {
      return res.status(404).json({
        error: 'Export not found',
        message: 'The requested export does not exist or you do not have access'
      });
    }

    if (exportRecord.expiresAt < new Date()) {
      return res.status(410).json({
        error: 'Export expired',
        message: 'This export has expired and is no longer available for download'
      });
    }

    // In production, this would serve the actual file
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="claim-export-${exportId}.json"`
    });
    
    res.json({
      exportId,
      format: exportRecord.format,
      claimType: exportRecord.claimType,
      generatedAt: exportRecord.createdAt,
      data: "/* Actual claim data would be here */"
    });
  } catch (error) {
    console.error('Export download error:', error);
    res.status(500).json({
      error: 'Failed to download export',
      message: error.message
    });
  }
});

router.post('/api/medical-claims/submit/:exportId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { exportId } = req.params;
    const { providerId, submissionOptions } = req.body;
    
    if (!providerId) {
      return res.status(400).json({
        error: 'Missing provider ID',
        message: 'Insurance provider ID is required for submission'
      });
    }
    
    const submissionResult = await medicalClaimIntegration.submitClaimToInsurance(
      exportId,
      providerId,
      submissionOptions
    );
    
    res.json(submissionResult);
  } catch (error) {
    console.error('Claim submission error:', error);
    res.status(500).json({
      error: 'Failed to submit claim',
      message: error.message
    });
  }
});

router.get('/api/medical-claims/insurance-providers', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { region } = req.query;
    
    // Get available insurance providers
    const providers = Array.from(medicalClaimIntegration.insuranceProviders.entries())
      .map(([id, provider]) => ({
        id,
        ...provider
      }));
    
    // Filter by region if specified
    const filteredProviders = region ? 
      providers.filter(p => p.regions?.includes(region)) : 
      providers;
    
    res.json({
      success: true,
      providers: filteredProviders,
      totalProviders: filteredProviders.length
    });
  } catch (error) {
    console.error('Providers retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get insurance providers',
      message: error.message
    });
  }
});

router.get('/api/medical-claims/formats', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    res.json({
      success: true,
      codingSystems: medicalClaimIntegration.codingSystems,
      insuranceFormats: medicalClaimIntegration.insuranceFormats,
      claimTypes: medicalClaimIntegration.claimTypes
    });
  } catch (error) {
    console.error('Formats retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get supported formats',
      message: error.message
    });
  }
});

router.get('/api/medical-claims/reimbursement-estimate', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { claimType, dateRange, categories } = req.query;
    
    if (!claimType) {
      return res.status(400).json({
        error: 'Missing claim type',
        message: 'claimType parameter is required'
      });
    }
    
    // Get health data for estimation
    const healthData = await medicalClaimIntegration.getHealthDataForClaims(
      userAuth.uid,
      dateRange ? JSON.parse(dateRange) : null,
      categories ? categories.split(',') : null
    );
    
    // Map to codes and calculate estimate
    const codedData = await medicalClaimIntegration.mapHealthDataToCodes(healthData, claimType);
    const estimate = medicalClaimIntegration.calculateReimbursementEstimate(codedData, claimType);
    
    res.json({
      success: true,
      estimate,
      dataPoints: healthData.length,
      eligibleItems: codedData.filter(item => item.eligibleForReimbursement).length
    });
  } catch (error) {
    console.error('Reimbursement estimation error:', error);
    res.status(500).json({
      error: 'Failed to estimate reimbursement',
      message: error.message
    });
  }
});

/**
 * Federated Health Intelligence API Endpoints
 */
router.get('/api/federated-health/participation', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Check if user is participating in federated learning
    const participationStatus = {
      participating: false, // In production, check actual participation status
      privacyLevel: 'high',
      categories: [],
      stats: {
        contributions: 0,
        impactScore: 0
      }
    };
    
    res.json(participationStatus);
  } catch (error) {
    console.error('Participation status error:', error);
    res.status(500).json({
      error: 'Failed to get participation status',
      message: error.message
    });
  }
});

router.post('/api/federated-health/enable', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const participationOptions = req.body;
    
    // Validate required fields
    if (!participationOptions.categories || participationOptions.categories.length === 0) {
      return res.status(400).json({
        error: 'No categories selected',
        message: 'At least one data category must be selected for participation'
      });
    }
    
    const participationResult = await federatedHealthIntelligence.enableFederatedParticipation(
      userAuth.uid,
      participationOptions
    );
    
    res.json(participationResult);
  } catch (error) {
    console.error('Federated participation error:', error);
    res.status(500).json({
      error: 'Failed to enable federated participation',
      message: error.message
    });
  }
});

router.get('/api/federated-health/discoveries', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { category, timeframe = '30d' } = req.query;
    
    const discoveriesResult = await federatedHealthIntelligence.generateBreakthroughDiscoveries(category);
    
    res.json(discoveriesResult);
  } catch (error) {
    console.error('Discoveries retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get health discoveries',
      message: error.message
    });
  }
});

router.get('/api/federated-health/global-trends', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const queryParams = req.query;
    
    if (!queryParams.category) {
      return res.status(400).json({
        error: 'Missing category',
        message: 'category parameter is required'
      });
    }
    
    const trendsResult = await federatedHealthIntelligence.discoverGlobalTrends(queryParams);
    
    res.json(trendsResult);
  } catch (error) {
    console.error('Global trends error:', error);
    res.status(500).json({
      error: 'Failed to discover global trends',
      message: error.message
    });
  }
});

router.post('/api/federated-health/contribute', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { healthData, contributionType } = req.body;
    
    if (!healthData || !contributionType) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'healthData and contributionType are required'
      });
    }
    
    const contributionResult = await federatedHealthIntelligence.contributeToFederatedLearning(
      userAuth.uid,
      healthData,
      contributionType
    );
    
    res.json(contributionResult);
  } catch (error) {
    console.error('Federated contribution error:', error);
    res.status(500).json({
      error: 'Failed to contribute to federated learning',
      message: error.message
    });
  }
});

router.get('/api/federated-health/research-access/:partnerId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'admin'); // Admin only
    const { partnerId } = req.params;
    const researchRequest = req.query;
    
    const researchResult = await federatedHealthIntelligence.provideResearchAccess(
      partnerId,
      researchRequest
    );
    
    res.json(researchResult);
  } catch (error) {
    console.error('Research access error:', error);
    res.status(500).json({
      error: 'Failed to provide research access',
      message: error.message
    });
  }
});

router.get('/api/federated-health/privacy-guarantees', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const privacyGuarantees = federatedHealthIntelligence.getPrivacyGuarantees();
    
    res.json({
      success: true,
      privacy_guarantees: privacyGuarantees,
      compliance_standards: ['GDPR', 'HIPAA', 'PIPEDA'],
      technical_measures: [
        'Differential Privacy',
        'Federated Learning',
        'Secure Multi-party Computation',
        'K-Anonymity'
      ]
    });
  } catch (error) {
    console.error('Privacy guarantees error:', error);
    res.status(500).json({
      error: 'Failed to get privacy guarantees',
      message: error.message
    });
  }
});

/**
 * Real-World Outcomes Reporting API Endpoints
 */
router.get('/api/outcomes/personal', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { timeframe = 90 } = req.query;
    
    const report = await outcomesReportingEngine.generateUserOutcomesReport(
      userAuth.uid, 
      parseInt(timeframe)
    );
    
    res.json(report);
  } catch (error) {
    console.error('Personal outcomes report error:', error);
    res.status(500).json({
      error: 'Failed to generate personal outcomes report',
      message: error.message
    });
  }
});

router.get('/api/outcomes/population', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { timeframe = 90 } = req.query;
    
    const report = await outcomesReportingEngine.generatePopulationOutcomesReport(
      parseInt(timeframe),
      true // anonymized
    );
    
    res.json(report);
  } catch (error) {
    console.error('Population outcomes report error:', error);
    res.status(500).json({
      error: 'Failed to generate population outcomes report',
      message: error.message
    });
  }
});

router.post('/api/outcomes/track', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { category, metric, value, timestamp } = req.body;
    
    if (!category || !metric || value === undefined) {
      return res.status(400).json({
        error: 'Missing required outcome data',
        message: 'category, metric, and value are required'
      });
    }
    
    const result = await outcomesReportingEngine.trackUserOutcome(
      userAuth.uid,
      category,
      metric,
      value,
      timestamp || new Date().toISOString()
    );
    
    res.json(result);
  } catch (error) {
    console.error('Outcome tracking error:', error);
    res.status(500).json({
      error: 'Failed to track outcome',
      message: error.message
    });
  }
});

router.post('/api/outcomes/conversion', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { event_type, outcome_correlations } = req.body;
    
    if (!event_type) {
      return res.status(400).json({
        error: 'Missing conversion event type',
        message: 'event_type is required'
      });
    }
    
    const result = await outcomesReportingEngine.trackConversionEvent(
      userAuth.uid,
      event_type,
      outcome_correlations || {}
    );
    
    res.json(result);
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({
      error: 'Failed to track conversion',
      message: error.message
    });
  }
});

router.post('/api/outcomes/share', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { improvements, achievements, timeframe } = req.body;
    
    // Process sharing anonymously
    const shareData = {
      user_id: userAuth.uid,
      shared_at: new Date().toISOString(),
      improvements: improvements || {},
      achievements: achievements || [],
      timeframe: timeframe || 90,
      consent_given: true
    };
    
    // In production, store anonymized data for community insights
    
    res.json({
      success: true,
      message: 'Health progress shared successfully',
      community_impact: 'Your story will inspire others on their health journey'
    });
  } catch (error) {
    console.error('Outcomes sharing error:', error);
    res.status(500).json({
      error: 'Failed to share outcomes',
      message: error.message
    });
  }
});

router.get('/api/outcomes/marketing-data', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'admin');
    const { timeframe = 90, include_conversion_data = false } = req.query;
    
    const report = await outcomesReportingEngine.generatePopulationOutcomesReport(
      parseInt(timeframe),
      true
    );
    
    // Generate marketing-focused summary
    const marketingData = {
      headline_stats: {
        total_users_improved: report.population_report.total_users_analyzed,
        top_improvement_category: this.getTopImprovementCategory(report.population_report.category_outcomes),
        average_improvement: this.calculateOverallAverageImprovement(report.population_report.category_outcomes),
        timeframe_days: parseInt(timeframe)
      },
      credible_claims: this.generateCredibleClaims(report.population_report.category_outcomes),
      conversion_insights: include_conversion_data ? report.population_report.conversion_insights : null,
      anonymized_success_stories: report.population_report.success_stories
    };
    
    res.json({
      success: true,
      marketing_data: marketingData,
      report_generated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Marketing data error:', error);
    res.status(500).json({
      error: 'Failed to generate marketing data',
      message: error.message
    });
  }
});

// Helper methods for marketing data
router.getTopImprovementCategory = function(categoryOutcomes) {
  let topCategory = null;
  let topImprovement = 0;
  
  for (const [category, data] of Object.entries(categoryOutcomes)) {
    if (data.average_improvement > topImprovement) {
      topImprovement = data.average_improvement;
      topCategory = {
        category: data.category_name,
        improvement: data.average_improvement
      };
    }
  }
  
  return topCategory;
};

router.calculateOverallAverageImprovement = function(categoryOutcomes) {
  const improvements = Object.values(categoryOutcomes).map(data => data.average_improvement);
  return improvements.length > 0 
    ? Math.round(improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length)
    : 0;
};

router.generateCredibleClaims = function(categoryOutcomes) {
  const claims = [];
  
  for (const [category, data] of Object.entries(categoryOutcomes)) {
    if (data.average_improvement >= 5 && data.users_analyzed >= 100) {
      claims.push({
        category: data.category_name,
        claim: `Users improved ${data.category_name.toLowerCase()} by an average of ${data.average_improvement}% in 90 days`,
        supporting_data: {
          users_analyzed: data.users_analyzed,
          improvement_rate: data.improvement_rate,
          clinical_relevance: data.clinical_relevance
        }
      });
    }
  }
  
  return claims;
};

/**
 * Accessibility & Internationalization API Endpoints
 */
router.post('/api/accessibility/voice-command', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { command, language } = req.body;
    
    if (!command) {
      return res.status(400).json({
        error: 'Missing voice command',
        message: 'command is required'
      });
    }
    
    // Process voice command based on language
    const result = await this.processVoiceCommand(command, language, userAuth.uid);
    
    res.json(result);
  } catch (error) {
    console.error('Voice command processing error:', error);
    res.status(500).json({
      error: 'Failed to process voice command',
      message: error.message
    });
  }
});

router.put('/api/accessibility/settings', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const settings = req.body;
    
    // Store accessibility settings for user
    // In production, save to user preferences database
    
    res.json({
      success: true,
      settings,
      message: 'Accessibility settings updated successfully'
    });
  } catch (error) {
    console.error('Accessibility settings error:', error);
    res.status(500).json({
      error: 'Failed to update accessibility settings',
      message: error.message
    });
  }
});

router.get('/api/i18n/region-data', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { region } = req.query;
    
    if (!region) {
      return res.status(400).json({
        error: 'Missing region parameter',
        message: 'region is required'
      });
    }
    
    // Get region-specific health data
    const regionData = await this.getRegionHealthData(region);
    
    res.json({
      success: true,
      region,
      data: regionData
    });
  } catch (error) {
    console.error('Region data error:', error);
    res.status(500).json({
      error: 'Failed to get region data',
      message: error.message
    });
  }
});

router.put('/api/i18n/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { language, region, timezone } = req.body;
    
    // Store user's i18n preferences
    // In production, save to user profile database
    
    res.json({
      success: true,
      preferences: {
        language,
        region,
        timezone,
        updated_at: new Date().toISOString()
      },
      message: 'Language and region preferences updated successfully'
    });
  } catch (error) {
    console.error('I18n preferences error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

// Helper methods for accessibility and i18n
router.processVoiceCommand = async function(command, language, userId) {
  const lowerCommand = command.toLowerCase();
  
  // Define voice command patterns by language
  const commandPatterns = {
    en: {
      pain: /log.*pain.*(\d+)/i,
      mood: /log.*mood.*(happy|sad|anxious|calm|stressed|excited)/i,
      medication: /log.*medication|took.*medicine/i,
      weight: /log.*weight.*(\d+)/i,
      sleep: /log.*sleep.*(\d+)/i
    },
    es: {
      pain: /registrar.*dolor.*(\d+)/i,
      mood: /registrar.*ánimo.*(feliz|triste|ansioso|tranquilo|estresado|emocionado)/i,
      medication: /registrar.*medicamento|tomé.*medicina/i,
      weight: /registrar.*peso.*(\d+)/i,
      sleep: /registrar.*sueño.*(\d+)/i
    }
  };
  
  const patterns = commandPatterns[language] || commandPatterns.en;
  
  // Process different types of commands
  if (patterns.pain.test(lowerCommand)) {
    const match = lowerCommand.match(patterns.pain);
    const level = match ? parseInt(match[1]) : null;
    
    return {
      success: true,
      action: 'pain_logged',
      message: language === 'es' ? 
        `Dolor registrado: nivel ${level}/10` : 
        `Pain logged: level ${level}/10`,
      data: { type: 'pain', level, timestamp: new Date().toISOString() }
    };
  }
  
  if (patterns.mood.test(lowerCommand)) {
    const match = lowerCommand.match(patterns.mood);
    const mood = match ? match[1] : 'neutral';
    
    return {
      success: true,
      action: 'mood_logged',
      message: language === 'es' ? 
        `Estado de ánimo registrado: ${mood}` : 
        `Mood logged: ${mood}`,
      data: { type: 'mood', value: mood, timestamp: new Date().toISOString() }
    };
  }
  
  if (patterns.medication.test(lowerCommand)) {
    return {
      success: true,
      action: 'medication_logged',
      message: language === 'es' ? 
        'Medicamento registrado exitosamente' : 
        'Medication logged successfully',
      data: { type: 'medication', timestamp: new Date().toISOString() }
    };
  }
  
  if (patterns.weight.test(lowerCommand)) {
    const match = lowerCommand.match(patterns.weight);
    const weight = match ? parseInt(match[1]) : null;
    
    return {
      success: true,
      action: 'weight_logged',
      message: language === 'es' ? 
        `Peso registrado: ${weight} kg` : 
        `Weight logged: ${weight} lbs`,
      data: { type: 'weight', value: weight, timestamp: new Date().toISOString() }
    };
  }
  
  if (patterns.sleep.test(lowerCommand)) {
    const match = lowerCommand.match(patterns.sleep);
    const hours = match ? parseInt(match[1]) : null;
    
    return {
      success: true,
      action: 'sleep_logged',
      message: language === 'es' ? 
        `Sueño registrado: ${hours} horas` : 
        `Sleep logged: ${hours} hours`,
      data: { type: 'sleep', hours, timestamp: new Date().toISOString() }
    };
  }
  
  // Default response for unrecognized commands
  return {
    success: false,
    message: language === 'es' ? 
      'Comando no reconocido. Intente de nuevo.' : 
      'Command not recognized. Please try again.',
    suggestions: language === 'es' ? [
      'Registrar dolor de cabeza nivel 5',
      'Registrar estado de ánimo feliz',
      'Registrar tomé medicamento'
    ] : [
      'Log headache pain level 5',
      'Log mood feeling happy',
      'Log took medication'
    ]
  };
};

router.getRegionHealthData = async function(region) {
  // In production, fetch from healthcare databases and regional health APIs
  const regionData = {
    north_america: {
      climate_recommendations: {
        seasonal_health_tips: [
          'Increase Vitamin D intake during winter months',
          'Stay hydrated during hot summer days',
          'Monitor air quality during wildfire season',
          'Be aware of seasonal affective disorder in northern regions'
        ],
        exercise_timing: 'Best exercise times: Early morning (6-8 AM) or evening (6-8 PM)',
        common_health_concerns: ['allergies', 'heat_exhaustion', 'winter_depression']
      },
      cultural_practices: [
        'Incorporate walking meetings into work culture',
        'Practice mindful eating during busy schedules',
        'Balance screen time with outdoor activities'
      ],
      healthcare_resources: [
        'Telemedicine widely available',
        '211 helpline for health resources',
        'Urgent care centers for non-emergency needs'
      ]
    },
    europe: {
      climate_recommendations: {
        seasonal_health_tips: [
          'Combat seasonal depression with light therapy',
          'Enjoy outdoor activities during mild summers',
          'Maintain activity levels during rainy seasons',
          'Take advantage of cycling infrastructure'
        ],
        exercise_timing: 'Optimal exercise: Morning walks and evening cycling',
        common_health_concerns: ['seasonal_depression', 'air_pollution', 'work_stress']
      },
      cultural_practices: [
        'Embrace walking and cycling culture',
        'Practice work-life balance traditions',
        'Enjoy social dining experiences'
      ],
      healthcare_resources: [
        'Universal healthcare systems',
        'Pharmacy consultation services',
        'Community health centers'
      ]
    },
    asia_pacific: {
      climate_recommendations: {
        seasonal_health_tips: [
          'Protect against intense UV radiation',
          'Manage humidity and heat stress',
          'Stay hydrated in tropical climates',
          'Prepare for monsoon season health challenges'
        ],
        exercise_timing: 'Exercise early morning or late evening to avoid heat',
        common_health_concerns: ['heat_stress', 'air_pollution', 'tropical_diseases']
      },
      cultural_practices: [
        'Traditional martial arts and tai chi',
        'Herbal medicine integration',
        'Community-based wellness practices'
      ],
      healthcare_resources: [
        'Traditional and modern medicine integration',
        'Community health workers',
        'Digital health platforms'
      ]
    }
  };
  
  return regionData[region] || regionData.north_america;
};

/**
 * Medical Provider Mode API Endpoints
 */
router.get('/api/provider/dashboard', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'provider');
    
    const dashboard = await medicalProviderMode.getProviderDashboard(userAuth.uid);
    
    res.json(dashboard);
  } catch (error) {
    console.error('Provider dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get provider dashboard',
      message: error.message
    });
  }
});

router.post('/api/provider/register', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const providerData = req.body;
    
    if (!providerData.license_number || !providerData.specialty) {
      return res.status(400).json({
        error: 'Missing required provider information',
        message: 'license_number and specialty are required'
      });
    }
    
    const registrationResult = await medicalProviderMode.registerProvider({
      ...providerData,
      user_id: userAuth.uid
    });
    
    res.json(registrationResult);
  } catch (error) {
    console.error('Provider registration error:', error);
    res.status(500).json({
      error: 'Failed to register provider',
      message: error.message
    });
  }
});

router.get('/api/provider/patient/:patientId/analysis', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'provider');
    const { patientId } = req.params;
    const { timeframe = 30 } = req.query;
    
    const analysis = await medicalProviderMode.generatePatientTrendAnalysis(
      userAuth.uid,
      patientId,
      parseInt(timeframe)
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Patient analysis error:', error);
    res.status(500).json({
      error: 'Failed to generate patient analysis',
      message: error.message
    });
  }
});

router.post('/api/provider/generate-report', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'provider');
    const { patient_id, report_type = 'comprehensive' } = req.body;
    
    if (!patient_id) {
      return res.status(400).json({
        error: 'Missing patient ID',
        message: 'patient_id is required'
      });
    }
    
    const reportResult = await medicalProviderMode.generateDoctorSummaryPDF(
      userAuth.uid,
      patient_id,
      report_type
    );
    
    res.json(reportResult);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

router.post('/api/provider/care-plan', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'provider');
    const { patient_id, plan_template } = req.body;
    
    if (!patient_id || !plan_template) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'patient_id and plan_template are required'
      });
    }
    
    const carePlan = await medicalProviderMode.createCustomCarePlan(
      userAuth.uid,
      patient_id,
      plan_template
    );
    
    res.json(carePlan);
  } catch (error) {
    console.error('Care plan creation error:', error);
    res.status(500).json({
      error: 'Failed to create care plan',
      message: error.message
    });
  }
});

router.get('/api/provider/patients', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'provider');
    
    const provider = medicalProviderMode.providerAccounts.get(userAuth.uid);
    if (!provider) {
      return res.status(404).json({
        error: 'Provider not found',
        message: 'Provider account not registered'
      });
    }
    
    // Get patient list with basic info and recent metrics
    const patients = provider.patients.map(patientId => ({
      id: patientId,
      name: `Patient ${patientId.slice(-4)}`, // Anonymized for demo
      age: 45,
      last_sync: '2 hours ago',
      risk_level: 'medium',
      alerts: 1,
      recent_metrics: {
        blood_pressure: '125/82',
        heart_rate: 72,
        weight: 165
      }
    }));
    
    res.json({
      success: true,
      patients,
      total: patients.length
    });
  } catch (error) {
    console.error('Patient list error:', error);
    res.status(500).json({
      error: 'Failed to get patient list',
      message: error.message
    });
  }
});

/**
 * Behavioral Psychology Layer API Endpoints
 */
router.get('/api/behavior/insights', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Get user's behavioral patterns and generate insights
    const behaviorData = {
      completion_times: await this.getUserCompletionTimes(userAuth.uid),
      activity_patterns: await this.getUserActivityPatterns(userAuth.uid),
      success_contexts: await this.getUserSuccessContexts(userAuth.uid)
    };
    
    const insights = await behavioralPsychologyLayer.analyzeUserBehavior(
      userAuth.uid, 
      behaviorData
    );
    
    // Generate contextual nudge for current time
    const currentContext = {
      time: new Date().getHours(),
      day_of_week: new Date().getDay(),
      recent_activity: behaviorData.activity_patterns?.recent || {}
    };
    
    const contextualNudge = await behavioralPsychologyLayer.generateContextualNudge(
      userAuth.uid,
      currentContext
    );
    
    res.json({
      success: true,
      ...insights,
      suggested_nudge: contextualNudge.nudge,
      patterns: insights.analysis?.habit_patterns || [],
      micro_commitments: insights.analysis?.micro_commitment_opportunities || []
    });
  } catch (error) {
    console.error('Behavioral insights error:', error);
    res.status(500).json({
      error: 'Failed to get behavioral insights',
      message: error.message
    });
  }
});

router.get('/api/behavior/streaks', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const userStreaks = behavioralPsychologyLayer.habitStreaks.get(userAuth.uid) || {};
    
    // Format streaks for frontend
    const habits = Object.entries(userStreaks).map(([habitType, streakData]) => ({
      id: habitType,
      type: habitType,
      name: habitType.replace('_', ' '),
      current_streak: streakData.current_streak,
      longest_streak: streakData.longest_streak,
      total_completions: streakData.total_completions,
      completed_today: this.isCompletedToday(streakData.last_completion),
      risk_level: this.assessCurrentRisk(streakData),
      recovery_plan: streakData.recovery_attempts > 0 ? {
        support_message: this.getRecoveryMessage(habitType, streakData.recovery_attempts)
      } : null
    }));
    
    res.json({
      success: true,
      habits,
      total_habits: habits.length,
      active_streaks: habits.filter(h => h.current_streak > 0).length
    });
  } catch (error) {
    console.error('Habit streaks error:', error);
    res.status(500).json({
      error: 'Failed to get habit streaks',
      message: error.message
    });
  }
});

router.post('/api/behavior/habit-update', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { habit_type, completed } = req.body;
    
    if (!habit_type || typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid habit update data',
        message: 'habit_type and completed (boolean) are required'
      });
    }
    
    const streakResult = await behavioralPsychologyLayer.updateHabitStreak(
      userAuth.uid,
      habit_type,
      completed
    );
    
    res.json(streakResult);
  } catch (error) {
    console.error('Habit update error:', error);
    res.status(500).json({
      error: 'Failed to update habit',
      message: error.message
    });
  }
});

router.post('/api/behavior/micro-commitment', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { habit_type, current_commitment } = req.body;
    
    if (!habit_type) {
      return res.status(400).json({
        error: 'Missing habit type',
        message: 'habit_type is required'
      });
    }
    
    const microCommitment = await behavioralPsychologyLayer.createMicroCommitment(
      userAuth.uid,
      habit_type,
      current_commitment
    );
    
    res.json(microCommitment);
  } catch (error) {
    console.error('Micro-commitment creation error:', error);
    res.status(500).json({
      error: 'Failed to create micro-commitment',
      message: error.message
    });
  }
});

router.get('/api/behavior/nudge', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const context = {
      time: new Date().getHours(),
      day_of_week: new Date().getDay(),
      stress_level: parseFloat(req.query.stress_level) || 5,
      steps_today: parseInt(req.query.steps_today) || 0,
      energy_level: parseFloat(req.query.energy_level) || 5
    };
    
    const nudge = await behavioralPsychologyLayer.generateContextualNudge(
      userAuth.uid,
      context
    );
    
    res.json(nudge);
  } catch (error) {
    console.error('Contextual nudge error:', error);
    res.status(500).json({
      error: 'Failed to generate nudge',
      message: error.message
    });
  }
});

router.put('/api/behavior/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const preferences = req.body;
    
    // Store user's behavioral preferences
    const userBehavior = behavioralPsychologyLayer.behaviorPatterns.get(userAuth.uid) || {};
    userBehavior.preferences = {
      ...userBehavior.preferences || {},
      ...preferences,
      updated_at: new Date().toISOString()
    };
    
    behavioralPsychologyLayer.behaviorPatterns.set(userAuth.uid, userBehavior);
    
    res.json({
      success: true,
      preferences: userBehavior.preferences,
      message: 'Behavioral preferences updated successfully'
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

// Helper methods for the router
router.getUserCompletionTimes = async function(userId) {
  // Return user's historical completion patterns
  return {
    exercise: [7, 7.5, 6.5, 8, 7.3], // Hour of day completions
    meditation: [21, 21.5, 22, 20.5, 21.2],
    meal_logging: [12, 13, 18.5, 19, 12.3]
  };
};

router.getUserActivityPatterns = async function(userId) {
  return {
    recent: {
      avg_sleep_hours: 7.2,
      avg_steps: 8500,
      stress_level: 4
    },
    weekly: {
      high_energy_days: [1, 2, 3], // Monday, Tuesday, Wednesday
      low_energy_days: [5, 0] // Friday, Sunday
    }
  };
};

router.getUserSuccessContexts = async function(userId) {
  return {
    'morning_routine': 0.92,
    'post_meal': 0.78,
    'weekend': 0.85,
    'well_rested': 0.94
  };
};

router.isCompletedToday = function(lastCompletion) {
  if (!lastCompletion) return false;
  const today = new Date().toISOString().split('T')[0];
  return lastCompletion === today;
};

router.assessCurrentRisk = function(streakData) {
  const daysSinceCompletion = this.calculateDaysSince(streakData.last_completion);
  if (daysSinceCompletion <= 1) return 0;
  if (daysSinceCompletion === 2) return 1;
  return 2;
};

router.calculateDaysSince = function(dateString) {
  if (!dateString) return 999;
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

router.getRecoveryMessage = function(habitType, attempts) {
  const messages = {
    'exercise': 'Even 5 minutes of movement counts. Start small and build back up.',
    'meditation': 'One conscious breath is meditation. Begin there.',
    'water_intake': 'Fill your water bottle now. Small steps matter.',
    'default': 'Progress isn\'t perfect. What\'s the smallest step you can take today?'
  };
  return messages[habitType] || messages['default'];
};

/**
 * Health Planning Toolkit API Endpoints
 */
router.get('/api/health-plan/current', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const planData = await healthPlanningToolkit.getUserPlan(userAuth.uid);
    
    if (!planData) {
      return res.json({
        success: true,
        has_active_plan: false,
        message: 'No active health plan found'
      });
    }
    
    res.json({
      success: true,
      has_active_plan: true,
      ...planData
    });
  } catch (error) {
    console.error('Health plan retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get health plan',
      message: error.message
    });
  }
});

router.post('/api/health-plan/create', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { plan_type, customizations = {} } = req.body;
    
    if (!plan_type) {
      return res.status(400).json({
        error: 'Missing plan type',
        message: 'plan_type is required'
      });
    }
    
    const planResult = await healthPlanningToolkit.createHealthPlan(
      userAuth.uid,
      plan_type,
      customizations
    );
    
    res.json(planResult);
  } catch (error) {
    console.error('Health plan creation error:', error);
    res.status(500).json({
      error: 'Failed to create health plan',
      message: error.message
    });
  }
});

router.post('/api/health-plan/progress', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const progressData = req.body;
    
    if (!progressData || Object.keys(progressData).length === 0) {
      return res.status(400).json({
        error: 'Missing progress data',
        message: 'Progress data is required'
      });
    }
    
    const progressResult = await healthPlanningToolkit.updatePlanProgress(
      userAuth.uid,
      progressData
    );
    
    res.json(progressResult);
  } catch (error) {
    console.error('Plan progress update error:', error);
    res.status(500).json({
      error: 'Failed to update plan progress',
      message: error.message
    });
  }
});

router.get('/api/health-plan/templates', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const templates = Object.entries(healthPlanningToolkit.planTemplates).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      duration_days: template.duration_days,
      difficulty: template.difficulty,
      phases: Object.keys(template.phases)
    }));
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Plan templates error:', error);
    res.status(500).json({
      error: 'Failed to get plan templates',
      message: error.message
    });
  }
});

router.delete('/api/health-plan/current', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Remove user's current plan
    healthPlanningToolkit.userPlans.delete(userAuth.uid);
    healthPlanningToolkit.progressTracking.delete(userAuth.uid);
    
    res.json({
      success: true,
      message: 'Health plan cancelled successfully'
    });
  } catch (error) {
    console.error('Plan cancellation error:', error);
    res.status(500).json({
      error: 'Failed to cancel health plan',
      message: error.message
    });
  }
});

router.get('/api/health-plan/achievements', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const achievements = healthPlanningToolkit.achievements.get(userAuth.uid) || [];
    
    res.json({
      success: true,
      achievements,
      total_achievements: achievements.length
    });
  } catch (error) {
    console.error('Achievements retrieval error:', error);
    res.status(500).json({
      error: 'Failed to get achievements',
      message: error.message
    });
  }
});

/**
 * Genetic Health Insight Engine API Endpoints
 */
router.get('/api/genetic/insights', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const insights = await geneticHealthEngine.getUserGeneticInsights(userAuth.uid);
    
    if (!insights) {
      return res.json({
        success: true,
        has_genetic_data: false,
        message: 'No genetic data uploaded yet'
      });
    }
    
    res.json({
      success: true,
      has_genetic_data: true,
      insights,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Genetic insights error:', error);
    res.status(500).json({
      error: 'Failed to get genetic insights',
      message: error.message
    });
  }
});

router.post('/api/genetic/upload', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const geneticData = req.body;
    
    if (!geneticData || !geneticData.variants) {
      return res.status(400).json({
        error: 'Missing genetic data',
        message: 'Genetic variants data is required'
      });
    }
    
    const analysisResult = await geneticHealthEngine.processGeneticData(
      userAuth.uid,
      geneticData
    );
    
    res.json(analysisResult);
  } catch (error) {
    console.error('Genetic data upload error:', error);
    res.status(500).json({
      error: 'Failed to process genetic data',
      message: error.message
    });
  }
});

router.get('/api/genetic/traits', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const insights = await geneticHealthEngine.getUserGeneticInsights(userAuth.uid);
    
    if (!insights) {
      return res.status(404).json({
        error: 'No genetic data found',
        message: 'Upload genetic data first to see trait predictions'
      });
    }
    
    res.json({
      success: true,
      traits: insights.trait_predictions,
      total_traits: insights.trait_predictions.length
    });
  } catch (error) {
    console.error('Genetic traits error:', error);
    res.status(500).json({
      error: 'Failed to get genetic traits',
      message: error.message
    });
  }
});

router.get('/api/genetic/ancestry', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const insights = await geneticHealthEngine.getUserGeneticInsights(userAuth.uid);
    
    if (!insights) {
      return res.status(404).json({
        error: 'No genetic data found',
        message: 'Upload genetic data first to see ancestry insights'
      });
    }
    
    res.json({
      success: true,
      ancestry: insights.ancestry_insights,
      health_predispositions: insights.health_predispositions
    });
  } catch (error) {
    console.error('Genetic ancestry error:', error);
    res.status(500).json({
      error: 'Failed to get ancestry insights',
      message: error.message
    });
  }
});

router.get('/api/genetic/nutrition', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const insights = await geneticHealthEngine.getUserGeneticInsights(userAuth.uid);
    
    if (!insights) {
      return res.status(404).json({
        error: 'No genetic data found',
        message: 'Upload genetic data first to see nutritional recommendations'
      });
    }
    
    res.json({
      success: true,
      recommendations: insights.nutritional_recommendations,
      lifestyle_optimizations: insights.lifestyle_optimizations
    });
  } catch (error) {
    console.error('Genetic nutrition error:', error);
    res.status(500).json({
      error: 'Failed to get nutritional insights',
      message: error.message
    });
  }
});

router.delete('/api/genetic/data', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Remove user's genetic data
    geneticHealthEngine.userGeneticProfiles.delete(userAuth.uid);
    geneticHealthEngine.traitPredictions.delete(userAuth.uid);
    geneticHealthEngine.ancestryData.delete(userAuth.uid);
    
    res.json({
      success: true,
      message: 'Genetic data deleted successfully'
    });
  } catch (error) {
    console.error('Genetic data deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete genetic data',
      message: error.message
    });
  }
});

/**
 * Proactive Alert & Risk System API Endpoints
 */
router.get('/api/alerts/current', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Get current active alerts for user
    const alertHistory = proactiveAlertSystem.alertHistory.get(userAuth.uid) || [];
    const currentAlerts = alertHistory
      .filter(alert => !alert.dismissed && alert.timestamp > Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      .slice(-5); // Most recent 5 alerts
    
    res.json({
      success: true,
      alerts: currentAlerts,
      total_active: currentAlerts.length
    });
  } catch (error) {
    console.error('Current alerts error:', error);
    res.status(500).json({
      error: 'Failed to get current alerts',
      message: error.message
    });
  }
});

router.get('/api/alerts/risk-scores', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Get current risk scores for user
    const riskScores = proactiveAlertSystem.riskScores.get(userAuth.uid) || {};
    
    res.json({
      success: true,
      risk_scores: riskScores,
      last_updated: riskScores.last_updated || new Date().toISOString()
    });
  } catch (error) {
    console.error('Risk scores error:', error);
    res.status(500).json({
      error: 'Failed to get risk scores',
      message: error.message
    });
  }
});

router.get('/api/alerts/history', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { limit = 20, offset = 0 } = req.query;
    
    const alertHistory = proactiveAlertSystem.alertHistory.get(userAuth.uid) || [];
    const paginatedHistory = alertHistory
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      history: paginatedHistory,
      total: alertHistory.length
    });
  } catch (error) {
    console.error('Alert history error:', error);
    res.status(500).json({
      error: 'Failed to get alert history',
      message: error.message
    });
  }
});

router.post('/api/alerts/:alertId/dismiss', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { alertId } = req.params;
    
    const alertHistory = proactiveAlertSystem.alertHistory.get(userAuth.uid) || [];
    const alertIndex = alertHistory.findIndex(alert => alert.id === alertId);
    
    if (alertIndex !== -1) {
      alertHistory[alertIndex].dismissed = true;
      alertHistory[alertIndex].dismissed_at = new Date().toISOString();
      proactiveAlertSystem.alertHistory.set(userAuth.uid, alertHistory);
    }
    
    res.json({
      success: true,
      message: 'Alert dismissed successfully'
    });
  } catch (error) {
    console.error('Alert dismissal error:', error);
    res.status(500).json({
      error: 'Failed to dismiss alert',
      message: error.message
    });
  }
});

router.post('/api/alerts/process-health-data', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const healthData = req.body;
    
    if (!healthData || Object.keys(healthData).length === 0) {
      return res.status(400).json({
        error: 'Missing health data',
        message: 'Health data is required for alert processing'
      });
    }
    
    const alertResult = await proactiveAlertSystem.processHealthData(
      userAuth.uid,
      healthData
    );
    
    res.json(alertResult);
  } catch (error) {
    console.error('Health data processing error:', error);
    res.status(500).json({
      error: 'Failed to process health data',
      message: error.message
    });
  }
});

router.get('/api/alerts/risk-profile', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const riskProfile = await proactiveAlertSystem.getUserRiskProfile(userAuth.uid);
    
    res.json({
      success: true,
      risk_profile: riskProfile
    });
  } catch (error) {
    console.error('Risk profile error:', error);
    res.status(500).json({
      error: 'Failed to get risk profile',
      message: error.message
    });
  }
});

router.put('/api/alerts/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const preferences = req.body;
    
    // Update user alert preferences
    const riskProfile = await proactiveAlertSystem.getUserRiskProfile(userAuth.uid);
    riskProfile.alert_preferences = { ...riskProfile.alert_preferences, ...preferences };
    
    proactiveAlertSystem.userRiskProfiles.set(userAuth.uid, riskProfile);
    
    res.json({
      success: true,
      preferences: riskProfile.alert_preferences,
      message: 'Alert preferences updated successfully'
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

/**
 * Digital Twin Simulation API Endpoints
 */
router.get('/api/digital-twin/status', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Check if user has a digital twin
    const hasTwin = digitalTwinSimulation.userModels.has(userAuth.uid);
    
    if (hasTwin) {
      const twinData = digitalTwinSimulation.userModels.get(userAuth.uid);
      res.json({
        success: true,
        hasTwin: true,
        accuracy: twinData.dataQuality.accuracy,
        lastUpdated: twinData.lastUpdated,
        dataPoints: twinData.baselineMetrics ? Object.keys(twinData.baselineMetrics).length : 0
      });
    } else {
      res.json({
        success: true,
        hasTwin: false,
        message: 'Digital twin not created yet'
      });
    }
  } catch (error) {
    console.error('Digital twin status error:', error);
    res.status(500).json({
      error: 'Failed to get digital twin status',
      message: error.message
    });
  }
});

router.post('/api/digital-twin/create', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const twinResult = await digitalTwinSimulation.createDigitalTwin(userAuth.uid);
    
    res.json(twinResult);
  } catch (error) {
    console.error('Digital twin creation error:', error);
    res.status(500).json({
      error: 'Failed to create digital twin',
      message: error.message
    });
  }
});

router.post('/api/digital-twin/simulate', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const simulationRequest = req.body;
    
    if (!simulationRequest.scenario_type) {
      return res.status(400).json({
        error: 'Missing simulation parameters',
        message: 'scenario_type is required'
      });
    }
    
    const simulationResult = await digitalTwinSimulation.runSimulation(
      userAuth.uid,
      simulationRequest
    );
    
    res.json(simulationResult);
  } catch (error) {
    console.error('Simulation execution error:', error);
    res.status(500).json({
      error: 'Failed to run simulation',
      message: error.message
    });
  }
});

router.get('/api/digital-twin/simulations', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    const userSimulations = digitalTwinSimulation.simulationHistory.get(userAuth.uid) || [];
    
    res.json({
      success: true,
      simulations: userSimulations.slice(-10) // Return last 10 simulations
    });
  } catch (error) {
    console.error('Simulation history error:', error);
    res.status(500).json({
      error: 'Failed to get simulation history',
      message: error.message
    });
  }
});

router.delete('/api/digital-twin/simulation/:simulationId', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { simulationId } = req.params;
    
    const userSimulations = digitalTwinSimulation.simulationHistory.get(userAuth.uid) || [];
    const filteredSimulations = userSimulations.filter(sim => sim.id !== simulationId);
    
    digitalTwinSimulation.simulationHistory.set(userAuth.uid, filteredSimulations);
    
    res.json({
      success: true,
      message: 'Simulation deleted successfully'
    });
  } catch (error) {
    console.error('Simulation deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete simulation',
      message: error.message
    });
  }
});

/**
 * Voice & Gesture Interface API Endpoints
 */
router.get('/api/voice-gesture/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    
    // Get user's voice and gesture preferences
    const preferences = {
      voice_enabled: true,
      gestures_enabled: true,
      accessibility_mode: false,
      preferred_voice_personality: 'friendly',
      response_length: 'concise'
    };
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Voice preferences error:', error);
    res.status(500).json({
      error: 'Failed to get voice preferences',
      message: error.message
    });
  }
});

router.post('/api/voice-gesture/process-voice', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const { text_input, input_type = 'text' } = req.body;
    
    if (!text_input) {
      return res.status(400).json({
        error: 'Missing voice input',
        message: 'text_input is required'
      });
    }
    
    const voiceResult = await voiceGestureInterface.processVoiceInput(
      userAuth.uid,
      text_input,
      input_type
    );
    
    res.json(voiceResult);
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      error: 'Failed to process voice input',
      message: error.message
    });
  }
});

router.post('/api/voice-gesture/process-gesture', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const gestureData = req.body;
    
    if (!gestureData.gesture_type) {
      return res.status(400).json({
        error: 'Missing gesture data',
        message: 'gesture_type is required'
      });
    }
    
    const gestureResult = await voiceGestureInterface.processGestureInput(
      userAuth.uid,
      gestureData
    );
    
    res.json(gestureResult);
  } catch (error) {
    console.error('Gesture processing error:', error);
    res.status(500).json({
      error: 'Failed to process gesture input',
      message: error.message
    });
  }
});

router.put('/api/voice-gesture/preferences', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const preferences = req.body;
    
    // Update user preferences for voice and gesture interface
    // In production, this would save to database
    
    res.json({
      success: true,
      preferences,
      message: 'Voice and gesture preferences updated successfully'
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

/**
 * Health data processing endpoint for alerts
 */
router.post('/api/health-data/process-alerts', async (req, res) => {
  try {
    const userAuth = await securityService.verifyUserAccess(req, 'user');
    const healthData = req.body;
    
    // Process health data through alerts engine
    const triggeredAlerts = await customAlertsEngine.processHealthData(userAuth.uid, healthData);
    
    res.json({
      success: true,
      triggeredAlerts: triggeredAlerts.length,
      alerts: triggeredAlerts.map(alert => ({
        id: alert.id,
        name: alert.name,
        message: `Alert triggered: ${alert.name}`
      }))
    });
  } catch (error) {
    console.error('Process health alerts error:', error);
    res.status(500).json({
      error: 'Failed to process health alerts',
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