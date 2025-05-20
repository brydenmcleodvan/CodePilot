import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { User } from '@shared/schema';
import { generateTokens } from './security/auth/auth-middleware';
import connectPg from 'connect-pg-simple';
import { pool } from './db';

// Define the user object type for Passport
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      name: string | null;
      roles: string[];
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure session storage
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({ 
    pool,
    createTableIfMissing: true
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'healthmap-dev-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid username or password' });
        } else {
          // Return user with only the fields needed for authentication
          return done(null, {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name || null,
            roles: user.roles || []
          });
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      // Return only the necessary user information for authentication
      if (user) {
        done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name || null,
          roles: user.roles || []
        });
      } else {
        done(new Error('User not found'), null);
      }
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes
  app.post('/api/register', async (req, res, next) => {
    try {
      const { username, email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Create user with hashed password
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        name,
        roles: ['patient']
      });

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateTokens(user);

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Log in using Passport
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user info and access token
        return res.status(201).json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            roles: user.roles
          },
          accessToken
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }
      
      // Log in the user
      req.login(user, async (err) => {
        if (err) {
          return next(err);
        }
        
        // Generate JWT tokens
        const { accessToken, refreshToken } = await generateTokens(user);

        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Return user info and access token
        return res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            roles: user.roles
          },
          accessToken
        });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res, next) => {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    
    // If a refresh token exists, revoke it
    if (refreshToken) {
      try {
        // Revoke the token - this code assumes you've properly implemented token revocation
        const decoded = require('jsonwebtoken').verify(
          refreshToken, 
          process.env.JWT_SECRET || 'healthmap-dev-secret'
        );
        
        storage.revokeToken(decoded.tokenId);
      } catch (error) {
        // Just log the error but continue with logout
        console.error('Error revoking token during logout:', error);
      }
    }
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    // Logout user session
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = req.user!;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      roles: user.roles
    });
  });

  // Token refresh route
  app.post('/api/token/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }
    
    try {
      // Verify token - this is handled by our handleTokenRefresh middleware
      const decoded = require('jsonwebtoken').verify(
        refreshToken, 
        process.env.JWT_SECRET || 'healthmap-dev-secret'
      );
      
      // Get user
      storage.getUser(decoded.userId).then(user => {
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        // Generate new tokens
        generateTokens(user).then(({ accessToken, refreshToken: newRefreshToken }) => {
          // Set new refresh token cookie
          res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
          
          // Return new access token
          res.json({
            accessToken,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name,
              roles: user.roles
            }
          });
        });
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  });
}