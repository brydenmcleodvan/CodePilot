import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, text, integer, timestamp, json } from 'drizzle-orm/pg-core';

// User Event Tracking
export const userEvents = pgTable('user_events', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  eventType: text('event_type').notNull(),
  eventData: json('event_data'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  deviceInfo: text('device_info'),
  ipAddress: text('ip_address'),
  sessionId: text('session_id')
});

export const insertUserEventSchema = createInsertSchema(userEvents).omit({ id: true });

// User Feedback
export const userFeedback = pgTable('user_feedback', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  feedbackType: text('feedback_type').notNull(),
  feedbackText: text('feedback_text').notNull(),
  rating: integer('rating'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  pageUrl: text('page_url'),
  deviceInfo: text('device_info'),
  resolved: integer('resolved').default(0)
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({ id: true });

// Error Logging
export const errorLogs = pgTable('error_logs', {
  id: integer('id').primaryKey().notNull(),
  errorType: text('error_type').notNull(),
  errorMessage: text('error_message').notNull(),
  stackTrace: text('stack_trace'),
  userId: integer('user_id'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  browserInfo: text('browser_info'),
  pageUrl: text('page_url'),
  componentName: text('component_name'),
  resolved: integer('resolved').default(0)
});

export const insertErrorLogSchema = createInsertSchema(errorLogs).omit({ id: true });

// Health News
export const healthNews = pgTable('health_news', {
  id: integer('id').primaryKey().notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  publishDate: timestamp('publish_date').notNull(),
  author: text('author'),
  source: text('source'),
  url: text('url'),
  imageUrl: text('image_url'),
  tags: text('tags')
});

export const insertHealthNewsSchema = createInsertSchema(healthNews).omit({ id: true });

// Types
export type UserEvent = typeof userEvents.$inferSelect;
export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;

export type HealthNews = typeof healthNews.$inferSelect;
export type InsertHealthNews = z.infer<typeof insertHealthNewsSchema>;