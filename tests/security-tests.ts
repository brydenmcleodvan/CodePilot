/**
 * Comprehensive Security Test Suite for Healthmap RBAC System
 * 
 * This test suite validates:
 * - JWT authentication flow
 * - Role-based access control (RBAC)
 * - Provider-patient relationships
 * - Cross-user data access prevention
 * - Administrative permissions
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { storage } from '../server/storage';
import { generateAccessToken } from '../server/security/tokens/jwt-handler';

// Mock users for testing
const testUsers = {
  patient1: {
    id: 1,
    username: 'patient1',
    email: 'patient1@test.com',
    name: 'John Patient',
    roles: ['patient'],
    password: 'hashedPassword123'
  },
  patient2: {
    id: 2,
    username: 'patient2', 
    email: 'patient2@test.com',
    name: 'Jane Patient',
    roles: ['patient'],
    password: 'hashedPassword123'
  },
  provider1: {
    id: 3,
    username: 'provider1',
    email: 'provider1@test.com',
    name: 'Dr. Smith',
    roles: ['provider'],
    password: 'hashedPassword123'
  },
  admin1: {
    id: 4,
    username: 'admin1',
    email: 'admin1@test.com',
    name: 'System Admin',
    roles: ['admin'],
    password: 'hashedPassword123'
  }
};

// Test data
const testHealthMetric = {
  type: 'blood_pressure',
  value: '120/80',
  unit: 'mmHg',
  notes: 'Normal reading'
};

const testMedication = {
  name: 'Lisinopril',
  dosage: '10mg',
  frequency: 'Daily',
  prescribedBy: 'Dr. Smith'
};

describe('Healthmap Security System', () => {
  let app: Express;
  let patientToken: string;
  let providerToken: string;
  let adminToken: string;
  let unauthorizedPatientToken: string;

  beforeEach(async () => {
    // Initialize test app and create test users
    const { registerRoutes } = await import('../server/routes');
    const express = await import('express');
    app = express.default();
    app.use(express.json());
    registerRoutes(app);

    // Create test users in storage
    await storage.createUser(testUsers.patient1);
    await storage.createUser(testUsers.patient2);
    await storage.createUser(testUsers.provider1);
    await storage.createUser(testUsers.admin1);

    // Generate tokens for testing
    patientToken = generateAccessToken(testUsers.patient1.id, testUsers.patient1.roles);
    unauthorizedPatientToken = generateAccessToken(testUsers.patient2.id, testUsers.patient2.roles);
    providerToken = generateAccessToken(testUsers.provider1.id, testUsers.provider1.roles);
    adminToken = generateAccessToken(testUsers.admin1.id, testUsers.admin1.roles);

    // Set up provider-patient relationship for testing
    await storage.createHealthcareRelationship({
      providerId: testUsers.provider1.id,
      patientId: testUsers.patient1.id,
      relationshipType: 'primary_care',
      accessLevel: 'full',
      status: 'active'
    });
  });

  afterEach(async () => {
    // Clean up test data
    await storage.clearTestData();
  });

  describe('Authentication Flow', () => {
    it('should require authentication for protected endpoints', async () => {
      const response = await request(app)
        .get('/api/health-metrics')
        .expect(401);

      expect(response.body.message).toContain('authentication required');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/health-metrics')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Invalid token');
    });

    it('should accept valid tokens', async () => {
      const response = await request(app)
        .get('/api/health-metrics')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Patient Data Access Control', () => {
    it('should allow patients to access their own health metrics', async () => {
      // Create health metric for patient1
      await storage.addHealthMetric({
        ...testHealthMetric,
        userId: testUsers.patient1.id,
        timestamp: new Date()
      });

      const response = await request(app)
        .get('/api/health-metrics')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe(testUsers.patient1.id);
    });

    it('should prevent patients from accessing other patients data', async () => {
      // Create health metric for patient1
      await storage.addHealthMetric({
        ...testHealthMetric,
        userId: testUsers.patient1.id,
        timestamp: new Date()
      });

      // Try to access with patient2 token
      const response = await request(app)
        .get('/api/health-metrics')
        .set('Authorization', `Bearer ${unauthorizedPatientToken}`)
        .expect(200);

      // Should return empty array (no access to patient1's data)
      expect(response.body.length).toBe(0);
    });

    it('should allow patients to create their own health metrics', async () => {
      const response = await request(app)
        .post('/api/health-metrics')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(testHealthMetric)
        .expect(201);

      expect(response.body.userId).toBe(testUsers.patient1.id);
      expect(response.body.type).toBe(testHealthMetric.type);
    });
  });

  describe('Provider Access Control', () => {
    it('should allow providers to access their patients data', async () => {
      // Create health metric for patient1
      await storage.addHealthMetric({
        ...testHealthMetric,
        userId: testUsers.patient1.id,
        timestamp: new Date()
      });

      const response = await request(app)
        .get(`/api/patients/${testUsers.patient1.id}/health-metrics`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe(testUsers.patient1.id);
    });

    it('should prevent providers from accessing non-patients data', async () => {
      // Create health metric for patient2 (no relationship with provider1)
      await storage.addHealthMetric({
        ...testHealthMetric,
        userId: testUsers.patient2.id,
        timestamp: new Date()
      });

      const response = await request(app)
        .get(`/api/patients/${testUsers.patient2.id}/health-metrics`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(403);

      expect(response.body.message).toContain('No healthcare relationship');
    });

    it('should allow providers to view their patient list', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(testUsers.patient1.id);
    });

    it('should prevent patients from accessing provider endpoints', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      expect(response.body.message).toContain('Only healthcare providers');
    });
  });

  describe('Administrative Access Control', () => {
    it('should allow admins to access any patient data', async () => {
      // Create health metric for patient1
      await storage.addHealthMetric({
        ...testHealthMetric,
        userId: testUsers.patient1.id,
        timestamp: new Date()
      });

      const response = await request(app)
        .get(`/api/patients/${testUsers.patient1.id}/health-metrics`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
    });

    it('should allow admins to access provider endpoints', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Medication Access Control', () => {
    it('should enforce permissions for medication access', async () => {
      // Create medication for patient1
      await storage.addMedication({
        ...testMedication,
        userId: testUsers.patient1.id,
        startDate: new Date()
      });

      // Patient should access their own medications
      const patientResponse = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(patientResponse.body.length).toBe(1);

      // Other patient should not access them
      const unauthorizedResponse = await request(app)
        .get('/api/medications')
        .set('Authorization', `Bearer ${unauthorizedPatientToken}`)
        .expect(200);

      expect(unauthorizedResponse.body.length).toBe(0);

      // Provider with relationship should access them
      const providerResponse = await request(app)
        .get(`/api/patients/${testUsers.patient1.id}/medications`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(providerResponse.body.length).toBe(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const response = await request(app)
        .get('/api/patients/999999/health-metrics')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(403);

      expect(response.body.message).toContain('No healthcare relationship');
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/health-metrics')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ invalid: 'data' })
        .expect(400);
    });

    it('should handle role escalation attempts', async () => {
      // Test that patients cannot access admin endpoints
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);
    });
  });

  describe('Cross-Resource Access Prevention', () => {
    it('should prevent accessing resources across different data types', async () => {
      // Create symptom for patient1
      await storage.addSymptom({
        name: 'Headache',
        severity: 5,
        userId: testUsers.patient1.id,
        startTime: new Date()
      });

      // Patient2 should not be able to access patient1's symptoms
      const response = await request(app)
        .get('/api/symptoms')
        .set('Authorization', `Bearer ${unauthorizedPatientToken}`)
        .expect(200);

      expect(response.body.length).toBe(0);
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should validate required fields in health metrics', async () => {
      const response = await request(app)
        .post('/api/health-metrics')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ value: '120/80' }) // Missing required fields
        .expect(400);
    });

    it('should ensure user IDs are set correctly', async () => {
      const response = await request(app)
        .post('/api/health-metrics')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          ...testHealthMetric,
          userId: testUsers.patient2.id // Attempting to create for another user
        })
        .expect(201);

      // Should be created for the authenticated user, not the submitted userId
      expect(response.body.userId).toBe(testUsers.patient1.id);
    });
  });
});

// Helper function to run all tests
export const runSecurityTests = async () => {
  console.log('🔒 Running Comprehensive Security Tests...');
  
  // This would be called by a test runner like Jest
  // For now, we'll export the test suite
  
  console.log('✅ Security test suite ready for execution');
  console.log('📋 Test coverage includes:');
  console.log('   - JWT Authentication Flow');
  console.log('   - Patient Data Access Control');
  console.log('   - Provider Access Control');
  console.log('   - Administrative Access Control');
  console.log('   - Medication Access Control');
  console.log('   - Error Handling and Edge Cases');
  console.log('   - Cross-Resource Access Prevention');
  console.log('   - Data Integrity and Validation');
};