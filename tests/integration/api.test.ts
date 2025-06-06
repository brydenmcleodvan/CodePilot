import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../../server/providers/appleHealth', () => ({
  fetchAppleHealthData: vi.fn().mockResolvedValue([
    { statType: 'steps', value: '1000', timestamp: new Date().toISOString() }
  ]),
  refreshAppleHealthToken: vi.fn().mockResolvedValue({ access_token: 'new', expires_in: 3600 }),
  exchangeAppleHealthCode: vi.fn()
}));
vi.mock('../../server/providers/googleFit', () => ({
  fetchGoogleFitData: vi.fn().mockResolvedValue([]),
  refreshGoogleFitToken: vi.fn().mockResolvedValue({ access_token: 'new', expires_in: 3600 }),
  exchangeGoogleFitCode: vi.fn()
}));
vi.mock('../../server/providers/fitbit', () => ({
  fetchFitbitData: vi.fn().mockResolvedValue([]),
  refreshFitbitToken: vi.fn().mockResolvedValue({ access_token: 'new', expires_in: 3600 }),
  exchangeFitbitCode: vi.fn()
}));

import { registerRoutes } from '../../server/routes';

let server: any;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  server = await registerRoutes(app);
});

afterAll(async () => {
  if (server && server.close) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('API integration', () => {
  it('logs in and receives a token', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'johndoe', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('updates health goals via profile endpoint', async () => {
    const login = await request(server)
      .post('/api/auth/login')
      .send({ username: 'johndoe', password: 'password123' });
    const token = login.body.token;

    const res = await request(server)
      .patch('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ healthGoals: 'Run a marathon' });

    expect(res.status).toBe(200);
    expect(res.body.healthGoals).toBe('Run a marathon');
  });

  it('syncs health data connection', async () => {
    const login = await request(server)
      .post('/api/auth/login')
      .send({ username: 'johndoe', password: 'password123' });
    const token = login.body.token;

    const res = await request(server)
      .patch('/api/health-data-connections/1/sync')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.connected).toBe(true);
  });
});
