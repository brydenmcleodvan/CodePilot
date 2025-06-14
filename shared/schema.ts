import { pgTable, serial, text, timestamp, integer, boolean, json, pgEnum, real } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferSelectModel } from 'drizzle-orm';

// Role enum for permission management
export const roleEnum = pgEnum('role', ['admin', 'provider', 'patient', 'researcher', 'content_manager']);

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age"),
  healthGoals: text("health_goals"),
  profilePicture: text("profile_picture"),
  healthData: text("health_data"), // Stored as JSON string
  isPremium: boolean("is_premium").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  roles: text('roles').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  preferences: json('preferences'),
  profileImage: text('profile_image'),
  bio: text('bio')
});

// Registered user devices
export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceUuid: text("device_uuid").notNull().unique(),
  deviceType: text("device_type").notNull(),
  deviceName: text("device_name"),
  lastSeen: timestamp("last_seen"),
});

// User sessions
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull(),
  lastActive: timestamp("last_active").notNull(),
});

// Connected wearable or external devices
export const connectedDevices = pgTable("connected_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceType: text("device_type").notNull(),
  lastSynced: timestamp("last_synced"),
  status: text("status"),
});

// Health Stats
export const healthStats = pgTable("health_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceId: integer("device_id").references(() => userDevices.id),
  statType: text("stat_type").notNull(), // e.g. "heart_rate", "sleep_quality", "zinc"
  value: text("value").notNull(), // Can be numeric or text
  unit: text("unit"), // e.g. "bpm", "hrs", etc.
  icon: text("icon"), // Icon name from Remix Icons
  colorScheme: text("color_scheme"), // CSS class for color
  timestamp: timestamp("timestamp").notNull(),
});

// Health metrics table
export const healthMetrics = pgTable('health_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  metricType: text('metric_type').notNull(),
  value: text('value').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  unit: text('unit'),
  source: text('source'),
  notes: text('notes')
});

// Medications
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  schedule: text("schedule").notNull(), // e.g. "Every morning", "Twice daily"
  nextDose: timestamp("next_dose"), // Next scheduled dose
  lastTaken: timestamp("last_taken"), // Last time medication was taken
  instructions: text("instructions"),
  active: boolean("active").notNull().default(true),
  interactionCategory: text("interaction_category"), // Category for interaction checking
  sideEffects: text("side_effects"), // Possible side effects
  totalTaken: integer("total_taken").default(0), // Count of how many doses have been taken
  sharedWith: text("shared_with").array(), // Array of userIds this medication is shared with
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  frequency: text('frequency'),
  prescribedBy: text('prescribed_by'),
  notes: text('notes')
});

// Refresh tokens for rotating auth
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
});

// Forum posts
export const forumPosts = pgTable('forum_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  tags: text('tags').array(),
  isPinned: boolean('is_pinned'),
  isLocked: boolean('is_locked'),
  viewCount: integer('view_count')
});

// Health articles
export const healthArticles = pgTable("health_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  authorName: text("author_name"),
  publishedAt: timestamp("published_at").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  readTime: integer("read_time") // in minutes
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserDeviceSchema = createInsertSchema(userDevices).omit({ id: true });
export const insertConnectedDeviceSchema = createInsertSchema(connectedDevices).omit({ id: true });

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type InsertHealthStat = typeof healthStats.$inferInsert;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type ConnectedDevice = typeof connectedDevices.$inferSelect;
export type InsertConnectedDevice = z.infer<typeof insertConnectedDeviceSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type HealthArticle = typeof healthArticles.$inferSelect;