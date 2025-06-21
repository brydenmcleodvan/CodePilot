import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { registerRoutes } from '../server/routes';

describe('User Goals API', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);

    authToken = jwt.sign(
      { id: 1, username: 'testuser' },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/user/goals', () => {
    it('should return user goals with status 200 when authenticated', async () => {
      const response = await request(app)
        .get('/api/user/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const firstGoal = response.body[0];
      expect(firstGoal).toHaveProperty('id');
      expect(firstGoal).toHaveProperty('userId');
      expect(firstGoal).toHaveProperty('goalType');
      expect(firstGoal).toHaveProperty('target');
      expect(firstGoal).toHaveProperty('current');
      expect(firstGoal).toHaveProperty('unit');
      expect(firstGoal).toHaveProperty('progress');
    });

    it('should return goals with correct goal types', async () => {
      const response = await request(app)
        .get('/api/user/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const goals = response.body;
      const goalTypes = goals.map(goal => goal.goalType);
      
      expect(goalTypes).toContain('steps');
      expect(goalTypes).toContain('water');
      expect(goalTypes).toContain('sleep');
      expect(goalTypes).toContain('exercise');
    });

    it('should return goals with valid progress calculations', async () => {
      const response = await request(app)
        .get('/api/user/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.forEach(goal => {
        expect(goal.progress).toBeGreaterThanOrEqual(0);
        expect(goal.progress).toBeLessThanOrEqual(100);
        expect(goal.current).toBeGreaterThanOrEqual(0);
        expect(goal.target).toBeGreaterThan(0);
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/user/goals')
        .expect(401);
    });
  });

  describe('POST /api/user/goals/update', () => {
    it('should update goal progress successfully', async () => {
      const updateData = {
        goalType: 'steps',
        progress: 85
      };

      const response = await request(app)
        .post('/api/user/goals/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Goal progress updated successfully');
      expect(response.body).toHaveProperty('goal');
      expect(response.body.goal).toHaveProperty('goalType', 'steps');
      expect(response.body.goal).toHaveProperty('progress', 85);
    });

    it('should return 400 when missing goalType', async () => {
      const updateData = {
        progress: 85
      };

      const response = await request(app)
        .post('/api/user/goals/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Goal type and progress are required');
    });

    it('should return 400 when missing progress', async () => {
      const updateData = {
        goalType: 'steps'
      };

      const response = await request(app)
        .post('/api/user/goals/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Goal type and progress are required');
    });

    it('should handle different goal types', async () => {
      const goalTypes = ['steps', 'water', 'sleep', 'exercise'];
      
      for (const goalType of goalTypes) {
        const updateData = {
          goalType,
          progress: Math.floor(Math.random() * 100)
        };

        const response = await request(app)
          .post('/api/user/goals/update')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.goal.goalType).toBe(goalType);
      }
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        goalType: 'steps',
        progress: 85
      };

      await request(app)
        .post('/api/user/goals/update')
        .send(updateData)
        .expect(401);
    });
  });
});