/**
 * WebSocket Push Handler for Real-Time Health Monitoring
 * Monitors client health metrics and sends instant alerts to coaches
 */

import { WebSocketServer } from 'ws';
import { riskDetectionEngine } from './risk-detection-engine.js';
import { healthScoreEngine } from './health-score-engine.js';

export class WebSocketPushHandler {
  constructor(server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.coaches = new Map(); // coachId -> WebSocket connection
    this.clients = new Map(); // clientId -> health data
    this.alertThresholds = {
      heartRate: { min: 50, max: 100, critical: 120 },
      steps: { min: 5000, warning: 3000 },
      sleep: { min: 6, warning: 5 },
      weight: { maxChange: 5 } // pounds per week
    };
    
    this.setupWebSocketConnections();
    this.startHealthMonitoring();
  }

  verifyClient(info) {
    // Add authentication verification here
    // For now, allow all connections
    return true;
  }

  setupWebSocketConnections() {
    this.wss.on('connection', (ws, request) => {
      console.log('New WebSocket connection established');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Healthmap real-time monitoring',
        timestamp: new Date().toISOString()
      }));
    });
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'register_coach':
        this.registerCoach(ws, data.coachId);
        break;
      case 'health_update':
        this.processHealthUpdate(data.clientId, data.metrics);
        break;
      case 'subscribe_client':
        this.subscribeToClient(ws, data.clientId);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: `Unknown message type: ${data.type}` 
        }));
    }
  }

  registerCoach(ws, coachId) {
    this.coaches.set(coachId, ws);
    ws.coachId = coachId;
    
    ws.send(JSON.stringify({
      type: 'coach_registered',
      coachId,
      message: 'Successfully registered as coach',
      timestamp: new Date().toISOString()
    }));
    
    console.log(`Coach ${coachId} registered for real-time monitoring`);
  }

  subscribeToClient(ws, clientId) {
    if (!ws.subscribedClients) {
      ws.subscribedClients = new Set();
    }
    ws.subscribedClients.add(clientId);
    
    ws.send(JSON.stringify({
      type: 'client_subscribed',
      clientId,
      message: `Subscribed to client ${clientId} updates`,
      timestamp: new Date().toISOString()
    }));
  }

  processHealthUpdate(clientId, metrics) {
    const previousMetrics = this.clients.get(clientId);
    this.clients.set(clientId, {
      ...metrics,
      timestamp: new Date().toISOString(),
      clientId
    });

    // Analyze for anomalies and risks
    const alerts = this.detectHealthAlerts(clientId, metrics, previousMetrics);
    
    if (alerts.length > 0) {
      this.broadcastHealthAlerts(clientId, alerts);
    }

    // Send real-time update to subscribed coaches
    this.broadcastHealthUpdate(clientId, metrics);
  }

  detectHealthAlerts(clientId, currentMetrics, previousMetrics) {
    const alerts = [];
    const timestamp = new Date().toISOString();

    // Heart Rate Monitoring
    if (currentMetrics.heartRate) {
      const hr = currentMetrics.heartRate;
      
      if (hr > this.alertThresholds.heartRate.critical) {
        alerts.push({
          type: 'critical',
          category: 'cardiovascular',
          title: '🚨 Critical Heart Rate Alert',
          message: `Heart rate ${hr} bpm exceeds critical threshold (${this.alertThresholds.heartRate.critical} bpm)`,
          clientId,
          value: hr,
          unit: 'bpm',
          timestamp,
          recommendedAction: 'Immediate medical attention may be required'
        });
      } else if (hr > this.alertThresholds.heartRate.max || hr < this.alertThresholds.heartRate.min) {
        alerts.push({
          type: 'warning',
          category: 'cardiovascular',
          title: '⚠️ Heart Rate Alert',
          message: `Heart rate ${hr} bpm outside normal range (${this.alertThresholds.heartRate.min}-${this.alertThresholds.heartRate.max} bpm)`,
          clientId,
          value: hr,
          unit: 'bpm',
          timestamp,
          recommendedAction: 'Monitor closely and consider medical consultation'
        });
      }
    }

    // Activity Level Monitoring
    if (currentMetrics.steps) {
      const steps = currentMetrics.steps;
      
      if (steps < this.alertThresholds.steps.warning) {
        alerts.push({
          type: 'warning',
          category: 'activity',
          title: '📱 Low Activity Alert',
          message: `Daily steps (${steps}) below recommended minimum (${this.alertThresholds.steps.warning})`,
          clientId,
          value: steps,
          unit: 'steps',
          timestamp,
          recommendedAction: 'Encourage increased physical activity'
        });
      }
    }

    // Sleep Quality Monitoring
    if (currentMetrics.sleep) {
      const sleepHours = currentMetrics.sleep;
      
      if (sleepHours < this.alertThresholds.sleep.warning) {
        alerts.push({
          type: 'warning',
          category: 'sleep',
          title: '😴 Sleep Quality Alert',
          message: `Sleep duration (${sleepHours}h) below recommended minimum (${this.alertThresholds.sleep.min}h)`,
          clientId,
          value: sleepHours,
          unit: 'hours',
          timestamp,
          recommendedAction: 'Discuss sleep hygiene and habits'
        });
      }
    }

    // Weight Change Monitoring
    if (currentMetrics.weight && previousMetrics?.weight) {
      const weightChange = Math.abs(currentMetrics.weight - previousMetrics.weight);
      
      if (weightChange > this.alertThresholds.weight.maxChange) {
        alerts.push({
          type: 'warning',
          category: 'weight',
          title: '⚖️ Significant Weight Change',
          message: `Weight change of ${weightChange.toFixed(1)} lbs detected`,
          clientId,
          value: weightChange,
          unit: 'lbs',
          timestamp,
          recommendedAction: 'Review nutrition and exercise plan'
        });
      }
    }

    // Use AI risk detection for advanced analysis
    try {
      const riskAlerts = riskDetectionEngine.detectAnomalies(currentMetrics, previousMetrics);
      alerts.push(...riskAlerts.map(risk => ({
        type: risk.severity === 'high' ? 'critical' : 'warning',
        category: 'ai_analysis',
        title: `🤖 AI Health Alert: ${risk.metric}`,
        message: risk.description,
        clientId,
        confidence: risk.confidence,
        timestamp,
        recommendedAction: risk.recommendation
      })));
    } catch (error) {
      console.error('AI risk detection error:', error);
    }

    return alerts;
  }

  broadcastHealthAlerts(clientId, alerts) {
    const alertMessage = {
      type: 'health_alert',
      clientId,
      alerts,
      timestamp: new Date().toISOString()
    };

    // Send to all coaches monitoring this client
    this.coaches.forEach((ws, coachId) => {
      if (ws.readyState === 1 && // WebSocket.OPEN
          (ws.subscribedClients?.has(clientId) || ws.subscribedClients?.has('all'))) {
        ws.send(JSON.stringify(alertMessage));
      }
    });

    // Log critical alerts
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
    if (criticalAlerts.length > 0) {
      console.log(`CRITICAL HEALTH ALERT for client ${clientId}:`, criticalAlerts);
    }
  }

  broadcastHealthUpdate(clientId, metrics) {
    const updateMessage = {
      type: 'health_update',
      clientId,
      metrics,
      timestamp: new Date().toISOString()
    };

    // Send to subscribed coaches
    this.coaches.forEach((ws, coachId) => {
      if (ws.readyState === 1 && // WebSocket.OPEN
          ws.subscribedClients?.has(clientId)) {
        ws.send(JSON.stringify(updateMessage));
      }
    });
  }

  handleDisconnection(ws) {
    if (ws.coachId) {
      this.coaches.delete(ws.coachId);
      console.log(`Coach ${ws.coachId} disconnected from real-time monitoring`);
    }
  }

  startHealthMonitoring() {
    // Periodic health check every 30 seconds
    setInterval(() => {
      this.performPeriodicHealthCheck();
    }, 30000);

    console.log('Real-time health monitoring started');
  }

  performPeriodicHealthCheck() {
    const now = new Date();
    
    this.clients.forEach((clientData, clientId) => {
      const lastUpdate = new Date(clientData.timestamp);
      const timeSinceUpdate = now - lastUpdate;
      
      // Alert if no data received for more than 1 hour
      if (timeSinceUpdate > 3600000) { // 1 hour in milliseconds
        this.broadcastHealthAlerts(clientId, [{
          type: 'warning',
          category: 'connectivity',
          title: '📡 Data Connection Alert',
          message: `No health data received for ${Math.round(timeSinceUpdate / 60000)} minutes`,
          clientId,
          timestamp: now.toISOString(),
          recommendedAction: 'Check device connectivity and data sync'
        }]);
      }
    });

    // Send heartbeat to all connected coaches
    this.coaches.forEach((ws, coachId) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'heartbeat',
          activeClients: this.clients.size,
          timestamp: now.toISOString()
        }));
      }
    });
  }

  // Public methods for manual triggers
  simulateHealthUpdate(clientId, metrics) {
    this.processHealthUpdate(clientId, metrics);
  }

  getActiveClients() {
    return Array.from(this.clients.keys());
  }

  getConnectedCoaches() {
    return Array.from(this.coaches.keys());
  }
}

// Export singleton instance
let pushHandlerInstance = null;

export function initializeWebSocketPushHandler(server) {
  if (!pushHandlerInstance) {
    pushHandlerInstance = new WebSocketPushHandler(server);
  }
  return pushHandlerInstance;
}

export function getWebSocketPushHandler() {
  return pushHandlerInstance;
}