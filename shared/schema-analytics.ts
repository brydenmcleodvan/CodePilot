import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, text, serial, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';

/**
 * Health news table
 */
export const healthNews = pgTable('health_news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publishDate: timestamp('publish_date').notNull(),
  tags: text('tags').array(),
  source: text('source'),
  author: text('author'),
  url: text('url'),
  imageUrl: text('image_url')
});

/**
 * User events table for analytics
 */
export const userEvents = pgTable('user_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  eventType: text('event_type').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  eventData: json('event_data'),
  sessionId: text('session_id'),
  deviceInfo: json('device_info')
});

/**
 * User feedback table
 */
export const userFeedback = pgTable('user_feedback', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  feedbackType: text('feedback_type').notNull(),
  rating: integer('rating').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  comments: text('comments'),
  featureId: text('feature_id'),
  resolvedStatus: text('resolved_status').default('pending')
});

/**
 * Error logs table
 */
export const errorLogs = pgTable('error_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  errorType: text('error_type').notNull(),
  errorMessage: text('error_message').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  stackTrace: text('stack_trace'),
  contextData: json('context_data'),
  severity: text('severity').default('error'),
  resolved: boolean('resolved').default(false)
});

// Insert schemas
export const insertHealthNewsSchema = createInsertSchema(healthNews).omit({ id: true });
export const insertUserEventSchema = createInsertSchema(userEvents).omit({ id: true });
export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({ id: true });
export const insertErrorLogSchema = createInsertSchema(errorLogs).omit({ id: true });

// Types
export type HealthNews = typeof healthNews.$inferSelect;
export type InsertHealthNews = z.infer<typeof insertHealthNewsSchema>;

export type UserEvent = typeof userEvents.$inferSelect;
export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;