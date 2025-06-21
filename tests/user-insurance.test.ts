import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { registerRoutes } from '../server/routes';

describe('User Insurance API', () => {
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

  describe('GET /api/user/insurance', () => {
    it('should return user insurance details with status 200 when authenticated', async () => {
      const response = await request(app)
        .get('/api/user/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('planName');
      expect(response.body).toHaveProperty('memberId');
      expect(response.body).toHaveProperty('groupNumber');
      expect(response.body).toHaveProperty('effectiveDate');
      expect(response.body).toHaveProperty('deductible');
      expect(response.body).toHaveProperty('copay');
      expect(response.body).toHaveProperty('outOfPocketMax');
      expect(response.body).toHaveProperty('coverageDetails');
      expect(response.body).toHaveProperty('status');
    });

    it('should return insurance with correct provider information', async () => {
      const response = await request(app)
        .get('/api/user/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const insurance = response.body;
      
      expect(insurance.provider).toBe('Blue Cross Blue Shield');
      expect(insurance.planName).toBe('Premium Health Plan');
      expect(insurance.status).toBe('active');
      expect(typeof insurance.memberId).toBe('string');
      expect(typeof insurance.groupNumber).toBe('string');
    });

    it('should return comprehensive coverage details', async () => {
      const response = await request(app)
        .get('/api/user/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const coverageDetails = response.body.coverageDetails;
      
      expect(coverageDetails).toHaveProperty('preventiveCare');
      expect(coverageDetails).toHaveProperty('primaryCare');
      expect(coverageDetails).toHaveProperty('specialist');
      expect(coverageDetails).toHaveProperty('urgentCare');
      expect(coverageDetails).toHaveProperty('emergency');
      expect(coverageDetails).toHaveProperty('prescription');

      expect(coverageDetails.preventiveCare).toBe('100% covered');
      expect(coverageDetails.primaryCare).toContain('copay');
      expect(coverageDetails.specialist).toContain('copay');
    });

    it('should return valid financial information', async () => {
      const response = await request(app)
        .get('/api/user/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const insurance = response.body;
      
      expect(insurance.deductible).toMatch(/^\$/);
      expect(insurance.copay).toMatch(/^\$/);
      expect(insurance.outOfPocketMax).toMatch(/^\$/);
      
      // Extract numeric values and verify they're reasonable
      const deductibleAmount = parseInt(insurance.deductible.replace(/[$,]/g, ''));
      const copayAmount = parseInt(insurance.copay.replace(/[$,]/g, ''));
      const outOfPocketAmount = parseInt(insurance.outOfPocketMax.replace(/[$,]/g, ''));
      
      expect(deductibleAmount).toBeGreaterThan(0);
      expect(copayAmount).toBeGreaterThan(0);
      expect(outOfPocketAmount).toBeGreaterThan(deductibleAmount);
    });

    it('should return valid effective date', async () => {
      const response = await request(app)
        .get('/api/user/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const insurance = response.body;
      
      expect(insurance.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      const effectiveDate = new Date(insurance.effectiveDate);
      expect(effectiveDate).toBeInstanceOf(Date);
      expect(effectiveDate.getTime()).not.toBeNaN();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/user/insurance')
        .expect(401);
    });

    it('should return 403 with invalid token', async () => {
      await request(app)
        .get('/api/user/insurance')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should include all required prescription coverage tiers', async () => {
      const response = await request(app)
        .get('/api/user/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const prescriptionCoverage = response.body.coverageDetails.prescription;
      
      expect(prescriptionCoverage).toContain('Generic');
      expect(prescriptionCoverage).toContain('Brand');
      expect(prescriptionCoverage).toMatch(/\$\d+/); // Should contain dollar amounts
    });
  });
});