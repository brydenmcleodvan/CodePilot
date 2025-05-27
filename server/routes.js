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