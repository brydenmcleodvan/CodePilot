import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Sleep Coach API', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/coach/sleep', () => {
    it('should return sleep tips with status 200', async () => {
      const response = await request(app)
        .get('/api/coach/sleep')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(10);
      
      // Verify expected structure of sleep tips
      const firstTip = response.body[0];
      expect(firstTip).toHaveProperty('id');
      expect(firstTip).toHaveProperty('title');
      expect(firstTip).toHaveProperty('description');
      expect(firstTip).toHaveProperty('category');
      expect(firstTip).toHaveProperty('priority');
    });

    it('should return sleep tips with correct content', async () => {
      const response = await request(app)
        .get('/api/coach/sleep')
        .expect(200);

      const sleepTips = response.body;
      
      // Check for specific high-priority tips
      const consistentScheduleTip = sleepTips.find(tip => 
        tip.title.includes('Consistent Sleep Schedule')
      );
      expect(consistentScheduleTip).toBeDefined();
      expect(consistentScheduleTip.priority).toBe('high');

      const bedtimeRoutineTip = sleepTips.find(tip => 
        tip.title.includes('Relaxing Bedtime Routine')
      );
      expect(bedtimeRoutineTip).toBeDefined();
      expect(bedtimeRoutineTip.category).toBe('routine');
    });

    it('should return tips with valid categories', async () => {
      const response = await request(app)
        .get('/api/coach/sleep')
        .expect(200);

      const validCategories = [
        'schedule', 'routine', 'environment', 'digital wellness',
        'nutrition', 'exercise', 'mental health', 'circadian rhythm', 'comfort'
      ];

      response.body.forEach(tip => {
        expect(validCategories).toContain(tip.category);
      });
    });

    it('should return tips with valid priorities', async () => {
      const response = await request(app)
        .get('/api/coach/sleep')
        .expect(200);

      const validPriorities = ['high', 'medium', 'low'];

      response.body.forEach(tip => {
        expect(validPriorities).toContain(tip.priority);
      });
    });
  });
});