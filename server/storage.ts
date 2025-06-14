import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  refreshTokens,
  userSessions,
  healthStats,
  type User,
  type RefreshToken,
  type InsertUser,
} from "@shared/schema";

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // User operations
  createUser(userData: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Session operations
  createSession(userId: number): Promise<void>;
  
  // Refresh token operations
  createRefreshToken(tokenData: { userId: number; token: string; expiresAt: Date; revoked: boolean }): Promise<void>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  revokeRefreshToken(token: string): Promise<void>;
  
  // Metrics operations
  addMetric(data: { userId: number; actionType: string; timestamp: Date }): Promise<void>;
  getUserHealthStats(userId: number): Promise<any[]>;
}

class MemStorage implements IStorage {
  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async createSession(userId: number): Promise<void> {
    await db.insert(userSessions).values({
      userId,
      createdAt: new Date(),
      lastActive: new Date(),
    });
  }

  async createRefreshToken(tokenData: { userId: number; token: string; expiresAt: Date; revoked: boolean }): Promise<void> {
    await db.insert(refreshTokens).values(tokenData);
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return result[0];
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.token, token));
  }

  async addMetric(data: { userId: number; actionType: string; timestamp: Date }): Promise<void> {
    // For now, just log the metric - we can implement proper storage later
    console.log('Metric logged:', data);
  }

  async getUserHealthStats(userId: number): Promise<any[]> {
    const result = await db.select().from(healthStats).where(eq(healthStats.userId, userId)).orderBy(desc(healthStats.timestamp));
    return result;
  }
}

export const storage = new MemStorage();