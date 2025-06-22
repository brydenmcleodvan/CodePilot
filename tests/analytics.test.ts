import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';
import fs from 'fs';
import path from 'path';

describe('Analytics API', () => {
  let app: express.Application;
  let server: any;
  const logFilePath = path.join(process.cwd(), 'logs', 'usage.log');

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);

    // Clear existing log file for clean test
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /api/analytics', () => {
    it('should log analytics events successfully', async () => {
      const eventData = {
        event: 'telehealth_session_booked'
      };

      const response = await request(app)
        .post('/api/analytics')
        .send(eventData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event logged successfully');
    });

    it('should create log file and directory if they dont exist', async () => {
      const eventData = {
        event: 'forum_post_viewed'
      };

      await request(app)
        .post('/api/analytics')
        .send(eventData)
        .expect(200);

      // Verify log file was created
      expect(fs.existsSync(logFilePath)).toBe(true);
    });

    it('should append events to log file with timestamps', async () => {
      const events = [
        'goal_completed',
        'insurance_tab_opened',
        'marketplace_product_viewed'
      ];

      for (const event of events) {
        await request(app)
          .post('/api/analytics')
          .send({ event })
          .expect(200);
      }

      // Read log file and verify events were logged
      const logContent = fs.readFileSync(logFilePath, 'utf8');
      
      for (const event of events) {
        expect(logContent).toContain(`Event: ${event}`);
      }

      // Verify timestamp format
      const lines = logContent.split('\n').filter(line => line.trim());
      expect(lines.length).toBeGreaterThan(0);
      
      lines.forEach(line => {
        if (line.trim()) {
          expect(line).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - Event: .+$/);
        }
      });
    });

    it('should return 400 when event is missing', async () => {
      const response = await request(app)
        .post('/api/analytics')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Event is required');
    });

    it('should handle complex event names', async () => {
      const complexEvents = [
        'user_goal_progress_updated',
        'telehealth_session_completed_successfully',
        'ai_coach_nutrition_advice_viewed',
        'forum_post_saved_to_favorites'
      ];

      for (const event of complexEvents) {
        const response = await request(app)
          .post('/api/analytics')
          .send({ event })
          .expect(200);

        expect(response.body.message).toBe('Event logged successfully');
      }
    });

    it('should log events with metadata', async () => {
      const eventData = {
        event: 'product_purchased',
        metadata: {
          productId: 123,
          price: 29.99,
          category: 'supplements'
        }
      };

      await request(app)
        .post('/api/analytics')
        .send(eventData)
        .expect(200);

      // Verify event was logged (metadata is handled in frontend)
      const logContent = fs.readFileSync(logFilePath, 'utf8');
      expect(logContent).toContain('Event: product_purchased');
    });
  });
});