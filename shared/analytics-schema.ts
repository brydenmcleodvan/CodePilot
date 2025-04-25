import { pgTable, serial, text, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Feedback Table
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional - can be anonymous
  helpful: boolean("helpful").notNull(), // Was this helpful? true/false
  comment: text("comment"), // Optional user comment
  source: text("source").notNull(), // Component/page/feature that triggered the feedback
  context: json("context"), // Additional contextual information
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Error Logs Table
export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional - error may occur for non-logged-in user
  message: text("message").notNull(),
  source: text("source"), // Where the error occurred
  stack: text("stack"), // Error stack trace
  context: json("context"), // Additional context information
  url: text("url"), // URL where the error occurred
  userAgent: text("user_agent"), // Browser/device information
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// User Events Table - for general analytics
export const userEvents = pgTable("user_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional - event may be anonymous
  eventCategory: text("event_category").notNull(), // e.g. navigation, interaction
  eventAction: text("event_action").notNull(), // specific action
  eventProperties: json("event_properties"), // Additional properties
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Create Zod schemas for inserting data
export const insertUserFeedbackSchema = createInsertSchema(userFeedback)
  .omit({ id: true })
  .extend({
    // Add additional validation if needed
    comment: z.string().optional(),
    context: z.record(z.any()).optional()
  });

export const insertErrorLogSchema = createInsertSchema(errorLogs)
  .omit({ id: true })
  .extend({
    // Add additional validation if needed
    stack: z.string().optional(),
    context: z.record(z.any()).optional(),
    userAgent: z.string().optional()
  });

export const insertUserEventSchema = createInsertSchema(userEvents)
  .omit({ id: true })
  .extend({
    // Add additional validation if needed
    eventProperties: z.record(z.any()).optional()
  });

// Define types
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;
export type ErrorLog = typeof errorLogs.$inferSelect;

export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;
export type UserEvent = typeof userEvents.$inferSelect;