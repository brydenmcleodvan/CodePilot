import { beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(() => {
  // Cleanup after tests
});