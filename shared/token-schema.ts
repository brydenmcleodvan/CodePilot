import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Token revocation table
export const tokenRevocation = pgTable("token_revocation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenId: text("token_id").notNull().unique(),
  tokenType: text("token_type").notNull(), // "access" or "refresh"
  revokedAt: timestamp("revoked_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // Store expiration for cleanup
  revokedBy: text("revoked_by"), // Optional, for audit purposes
  revokedReason: text("revoked_reason"), // Optional, for audit purposes
});

// User session table
export const userSession = pgTable("user_session", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  refreshTokenId: text("refresh_token_id").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  lastUsed: timestamp("last_used").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isValid: boolean("is_valid").notNull().default(true),
  deviceInfo: text("device_info"), // Stored as JSON string
});

// Insert schemas
export const insertTokenRevocationSchema = createInsertSchema(tokenRevocation).omit({ id: true });
export const insertUserSessionSchema = createInsertSchema(userSession).omit({ id: true });

// Types
export type InsertTokenRevocation = z.infer<typeof insertTokenRevocationSchema>;
export type TokenRevocation = typeof tokenRevocation.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSession.$inferSelect;