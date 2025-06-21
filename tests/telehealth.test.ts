import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { registerRoutes } from '../server/routes';

describe('Telehealth API', () => {
  let app: express.Application;
  let server: any;
  let authToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = await registerRoutes(app);

    // Create a test JWT token
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

  describe('GET /api/telehealth/sessions', () => {
    it('should return telehealth sessions with status 200 when authenticated', async () => {
      const response = await request(app)
        .get('/api/telehealth/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const firstSession = response.body[0];
      expect(firstSession).toHaveProperty('id');
      expect(firstSession).toHaveProperty('doctorName');
      expect(firstSession).toHaveProperty('specialty');
      expect(firstSession).toHaveProperty('rating');
      expect(firstSession).toHaveProperty('experience');
      expect(firstSession).toHaveProperty('availability');
      expect(firstSession).toHaveProperty('consultationFee');
      expect(firstSession).toHaveProperty('languages');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/telehealth/sessions')
        .expect(401);
    });

    it('should return 403 with invalid token', async () => {
      await request(app)
        .get('/api/telehealth/sessions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should return sessions with correct doctor information', async () => {
      const response = await request(app)
        .get('/api/telehealth/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const sessions = response.body;
      
      // Check for specific doctors
      const drJohnson = sessions.find(session => 
        session.doctorName === 'Dr. Sarah Johnson'
      );
      expect(drJohnson).toBeDefined();
      expect(drJohnson.specialty).toBe('Family Medicine');
      expect(drJohnson.rating).toBeGreaterThan(4.5);

      // Verify all sessions have required availability slots
      sessions.forEach(session => {
        expect(session.availability).toBeInstanceOf(Array);
        expect(session.availability.length).toBeGreaterThan(0);
      });
    });
  });

  describe('POST /api/telehealth/book', () => {
    it('should book a session with valid data', async () => {
      const bookingData = {
        sessionId: 'session-1',
        appointmentTime: 'Today 2:00 PM'
      };

      const response = await request(app)
        .post('/api/telehealth/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Appointment booked successfully');
      expect(response.body).toHaveProperty('booking');
      
      const booking = response.body.booking;
      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('userId');
      expect(booking).toHaveProperty('sessionId', 'session-1');
      expect(booking).toHaveProperty('appointmentTime', 'Today 2:00 PM');
      expect(booking).toHaveProperty('status', 'confirmed');
      expect(booking).toHaveProperty('meetingLink');
    });

    it('should return 400 when missing sessionId', async () => {
      const bookingData = {
        appointmentTime: 'Today 2:00 PM'
      };

      const response = await request(app)
        .post('/api/telehealth/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Session ID and appointment time are required');
    });

    it('should return 400 when missing appointmentTime', async () => {
      const bookingData = {
        sessionId: 'session-1'
      };

      const response = await request(app)
        .post('/api/telehealth/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Session ID and appointment time are required');
    });

    it('should return 401 when not authenticated', async () => {
      const bookingData = {
        sessionId: 'session-1',
        appointmentTime: 'Today 2:00 PM'
      };

      await request(app)
        .post('/api/telehealth/book')
        .send(bookingData)
        .expect(401);
    });

    it('should generate unique booking IDs and meeting links', async () => {
      const bookingData = {
        sessionId: 'session-2',
        appointmentTime: 'Tomorrow 10:00 AM'
      };

      const response1 = await request(app)
        .post('/api/telehealth/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(200);

      const response2 = await request(app)
        .post('/api/telehealth/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...bookingData, sessionId: 'session-3' })
        .expect(200);

      expect(response1.body.booking.id).not.toBe(response2.body.booking.id);
      expect(response1.body.booking.meetingLink).not.toBe(response2.body.booking.meetingLink);
    });
  });
});