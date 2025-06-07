import { pgTable, serial, text, timestamp, integer, boolean, json, pgEnum, index } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferSelectModel } from 'drizzle-orm';

// Role enum for permission management
export const roleEnum = pgEnum('role', ['admin', 'provider', 'patient', 'researcher', 'content_manager']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  roles: text('roles').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  preferences: json('preferences'),
  profileImage: text('profile_image'),
  bio: text('bio')
});

// Health metrics table
export const healthMetrics = pgTable(
  'health_metrics',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    metricType: text('metric_type').notNull(),
    value: text('value').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    unit: text('unit'),
    source: text('source'),
    notes: text('notes')
  },
  (table) => ({
    userTimestampIdx: index('health_metrics_user_timestamp_idx').on(
      table.userId,
      table.timestamp
    ),
    userMetricTimestampIdx: index('health_metrics_user_metric_ts_idx').on(
      table.userId,
      table.metricType,
      table.timestamp
    )
  })
);

// Medications table
export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  dosage: text('dosage'),
  frequency: text('frequency'),
  prescribedBy: text('prescribed_by'),
  notes: text('notes'),
  active: boolean('active')
});

// Symptoms table
export const symptoms = pgTable('symptoms', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  severity: integer('severity').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  relatedCondition: text('related_condition'),
  bodyLocation: text('body_location'),
  notes: text('notes')
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  provider: text('provider').notNull(),
  datetime: timestamp('datetime').notNull(),
  type: text('type'),
  status: text('status'),
  location: text('location'),
  duration: integer('duration'),
  reminderTime: timestamp('reminder_time'),
  notes: text('notes')
});

// Health data connections (wearables, third-party health platforms, etc.)
export const healthDataConnections = pgTable('health_data_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  active: boolean('active'),
  expiresAt: timestamp('expires_at'),
  scope: text('scope'),
  lastSynced: timestamp('last_synced'),
  settings: json('settings')
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
export const healthArticles = pgTable('health_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publishDate: timestamp('publish_date').notNull(),
  author: text('author'),
  source: text('source'),
  url: text('url'),
  imageUrl: text('image_url'),
  tags: text('tags').array()
});

// Token metadata for authentication
export const tokenMetadata = pgTable('token_metadata', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenId: text('token_id').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').notNull(),
  isRevoked: boolean('is_revoked'),
  clientInfo: json('client_info')
});

// Healthcare relationships (provider-patient)
export const healthcareRelationships = pgTable('healthcare_relationships', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull().references(() => users.id),
  patientId: integer('patient_id').notNull().references(() => users.id),
  relationshipType: text('relationship_type').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: text('status'),
  accessLevel: text('access_level'),
  notes: text('notes'),
  metadata: json('metadata')
});

// Resource ownership tracking
export const resourceOwnership = pgTable('resource_ownership', {
  id: serial('id').primaryKey(),
  resourceId: integer('resource_id').notNull(),
  resourceType: text('resource_type').notNull(),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Resource assignments (for shared resources)
export const resourceAssignments = pgTable('resource_assignments', {
  id: serial('id').primaryKey(),
  resourceId: integer('resource_id').notNull(),
  resourceType: text('resource_type').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  assignedBy: integer('assigned_by').notNull().references(() => users.id),
  permissions: text('permissions').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at')
});

// Daily health insights generated by nightly engine
export const dailyInsights = pgTable('daily_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: timestamp('date').notNull(),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertHealthDataConnectionSchema = createInsertSchema(healthDataConnections).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true });
export const insertHealthArticleSchema = createInsertSchema(healthArticles).omit({ id: true });
export const insertTokenMetadataSchema = createInsertSchema(tokenMetadata).omit({ id: true });
export const insertHealthcareRelationshipSchema = createInsertSchema(healthcareRelationships).omit({ id: true });
export const insertDailyInsightSchema = createInsertSchema(dailyInsights).omit({ id: true });

// Export types
export type User = InferSelectModel<typeof users>;
export type HealthMetric = InferSelectModel<typeof healthMetrics>;
export type Medication = InferSelectModel<typeof medications>;
export type Symptom = InferSelectModel<typeof symptoms>;
export type Appointment = InferSelectModel<typeof appointments>;
export type HealthDataConnection = InferSelectModel<typeof healthDataConnections>;
export type ForumPost = InferSelectModel<typeof forumPosts>;
export type HealthArticle = InferSelectModel<typeof healthArticles>;
export type TokenMetadata = InferSelectModel<typeof tokenMetadata>;
export type HealthcareRelationship = InferSelectModel<typeof healthcareRelationships>;
export type ResourceOwnership = InferSelectModel<typeof resourceOwnership>;
export type ResourceAssignment = InferSelectModel<typeof resourceAssignments>;
export type DailyInsight = InferSelectModel<typeof dailyInsights>;

// Health goals table
export const healthGoals = pgTable('health_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  metricType: text('metric_type').notNull(),
  goalType: text('goal_type').notNull(), // 'target', 'minimum', 'maximum', 'range'
  goalValue: json('goal_value').notNull(), // number or {min, max} object
  unit: text('unit').notNull(),
  timeframe: text('timeframe').notNull(), // 'daily', 'weekly', 'monthly'
  status: text('status').notNull(), // 'active', 'completed', 'paused', 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  notes: text('notes')
});

// Goal progress tracking table
export const goalProgress = pgTable('goal_progress', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id').notNull().references(() => healthGoals.id),
  date: timestamp('date').notNull(),
  value: text('value').notNull(),
  achieved: boolean('achieved').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertHealthDataConnection = z.infer<typeof insertHealthDataConnectionSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertHealthArticle = z.infer<typeof insertHealthArticleSchema>;
export type InsertTokenMetadata = z.infer<typeof insertTokenMetadataSchema>;
export type InsertHealthcareRelationship = z.infer<typeof insertHealthcareRelationshipSchema>;
export type InsertDailyInsight = z.infer<typeof insertDailyInsightSchema>;

// Health goals schemas and types
export const insertHealthGoalSchema = createInsertSchema(healthGoals).omit({ id: true });
export const insertGoalProgressSchema = createInsertSchema(goalProgress).omit({ id: true });

export type HealthGoal = InferSelectModel<typeof healthGoals>;
export type GoalProgress = InferSelectModel<typeof goalProgress>;
export type InsertHealthGoal = z.infer<typeof insertHealthGoalSchema>;
export type InsertGoalProgress = z.infer<typeof insertGoalProgressSchema>;