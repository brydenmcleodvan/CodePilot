import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { registerRoutes } from '../server/routes';

describe('Forum API', () => {
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

  describe('POST /api/forum/upvote', () => {
    it('should upvote a forum post successfully', async () => {
      const upvoteData = {
        postId: 1
      };

      const response = await request(app)
        .post('/api/forum/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send(upvoteData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post upvoted successfully');
      expect(response.body).toHaveProperty('post');
      expect(response.body.post).toHaveProperty('id', 1);
      expect(response.body.post).toHaveProperty('upvotes');
      expect(typeof response.body.post.upvotes).toBe('number');
    });

    it('should return 400 when postId is missing', async () => {
      const response = await request(app)
        .post('/api/forum/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Post ID is required');
    });

    it('should return 404 for non-existent post', async () => {
      const upvoteData = {
        postId: 99999
      };

      const response = await request(app)
        .post('/api/forum/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send(upvoteData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Post not found');
    });

    it('should return 401 when not authenticated', async () => {
      const upvoteData = {
        postId: 1
      };

      await request(app)
        .post('/api/forum/upvote')
        .send(upvoteData)
        .expect(401);
    });

    it('should increment upvote count correctly', async () => {
      // First, get the current upvote count
      const initialResponse = await request(app)
        .get('/api/forum')
        .expect(200);

      const post = initialResponse.body.find(p => p.id === 1);
      const initialUpvotes = post ? post.upvotes || 0 : 0;

      // Upvote the post
      const upvoteResponse = await request(app)
        .post('/api/forum/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ postId: 1 })
        .expect(200);

      expect(upvoteResponse.body.post.upvotes).toBe(initialUpvotes + 1);
    });
  });

  describe('POST /api/forum/save', () => {
    it('should save a forum post successfully', async () => {
      const saveData = {
        postId: 1
      };

      const response = await request(app)
        .post('/api/forum/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saveData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post saved successfully');
      expect(response.body).toHaveProperty('saved', true);
    });

    it('should return 400 when postId is missing', async () => {
      const response = await request(app)
        .post('/api/forum/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Post ID is required');
    });

    it('should return 401 when not authenticated', async () => {
      const saveData = {
        postId: 1
      };

      await request(app)
        .post('/api/forum/save')
        .send(saveData)
        .expect(401);
    });
  });

  describe('GET /api/forum', () => {
    it('should return forum posts with status 200', async () => {
      const response = await request(app)
        .get('/api/forum')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        const firstPost = response.body[0];
        expect(firstPost).toHaveProperty('id');
        expect(firstPost).toHaveProperty('title');
        expect(firstPost).toHaveProperty('content');
        expect(firstPost).toHaveProperty('userId');
        expect(firstPost).toHaveProperty('timestamp');
        expect(firstPost).toHaveProperty('subreddit');
      }
    });

    it('should return posts with valid structure', async () => {
      const response = await request(app)
        .get('/api/forum')
        .expect(200);

      response.body.forEach(post => {
        expect(typeof post.id).toBe('number');
        expect(typeof post.title).toBe('string');
        expect(typeof post.content).toBe('string');
        expect(typeof post.userId).toBe('number');
        expect(post.timestamp).toBeDefined();
        expect(typeof post.subreddit).toBe('string');
      });
    });
  });
});