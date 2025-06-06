import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../../server/providers/appleHealth', () => ({
  fetchAppleHealthData: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
  refreshAppleHealthToken: vi.fn(),
  exchangeAppleHealthCode: vi.fn()
}));
vi.mock('../../server/providers/googleFit', () => ({
  fetchGoogleFitData: vi.fn().mockRejectedValue(new Error('500 Provider error')),
  refreshGoogleFitToken: vi.fn(),
  exchangeGoogleFitCode: vi.fn()
}));
vi.mock('../../server/providers/fitbit', () => ({
  fetchFitbitData: vi.fn().mockRejectedValue(new Error('500 Provider error')),
  refreshFitbitToken: vi.fn(),
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

describe('API failure handling', () => {
  it('rejects sync when not authenticated', async () => {
    const res = await request(server)
      .patch('/api/health-data-connections/1/sync');
    expect(res.status).toBe(401);
  });

  it('returns server error when provider fetch fails', async () => {
    const login = await request(server)
      .post('/api/auth/login')
      .send({ username: 'johndoe', password: 'password123' });
    const token = login.body.token;

    const res = await request(server)
      .patch('/api/health-data-connections/1/sync')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});
