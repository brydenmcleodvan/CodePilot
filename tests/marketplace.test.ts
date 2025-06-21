import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Marketplace API', () => {
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

  describe('GET /api/market', () => {
    it('should return marketplace products with status 200', async () => {
      const response = await request(app)
        .get('/api/market')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBeGreaterThan(0);
      
      const firstProduct = response.body.products[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('price');
    });

    it('should return products with correct structure', async () => {
      const response = await request(app)
        .get('/api/market')
        .expect(200);

      const products = response.body.products;
      
      products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(typeof product.id).toBe('number');
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('string');
        expect(product.price).toMatch(/^\$/); // Price should start with $
      });
    });

    it('should include specific health products', async () => {
      const response = await request(app)
        .get('/api/market')
        .expect(200);

      const products = response.body.products;
      const productNames = products.map(p => p.name);
      
      expect(productNames).toContain('Zinc Supplement');
      expect(productNames).toContain('Sleep Tracker Band');
    });

    it('should include discount information', async () => {
      const response = await request(app)
        .get('/api/market')
        .expect(200);

      const products = response.body.products;
      
      products.forEach(product => {
        if (product.discount) {
          expect(typeof product.discount).toBe('string');
          expect(product.discount).toMatch(/%$/); // Discount should end with %
        }
      });
    });
  });
});