import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';
import { text, integer, timestamp, pgTable, boolean, json } from 'drizzle-orm/pg-core';

/**
 * Health metrics table
 */
export const healthMetrics = pgTable('health_metrics', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  metricType: text('metric_type').notNull(),
  value: text('value').notNull(),
  unit: text('unit'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  notes: text('notes'),
  source: text('source')
});

/**
 * Insert schema for health metrics
 */
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true });

/**
 * Medications table
 */
export const medications = pgTable('medications', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  dosage: text('dosage'),
  frequency: text('frequency'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  notes: text('notes'),
  prescribedBy: text('prescribed_by'),
  active: boolean('active').default(true)
});

/**
 * Insert schema for medications
 */
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });

/**
 * Symptoms table
 */
export const symptoms = pgTable('symptoms', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  severity: integer('severity').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  notes: text('notes'),
  relatedCondition: text('related_condition'),
  bodyLocation: text('body_location')
});

/**
 * Insert schema for symptoms
 */
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });

/**
 * Appointments table
 */
export const appointments = pgTable('appointments', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  provider: text('provider').notNull(),
  location: text('location'),
  datetime: timestamp('datetime').notNull(),
  duration: integer('duration'),
  notes: text('notes'),
  reminderTime: timestamp('reminder_time'),
  type: text('type'),
  status: text('status').default('scheduled')
});

/**
 * Insert schema for appointments
 */
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });

/**
 * Health data connections table
 */
export const healthDataConnections = pgTable('health_data_connections', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  provider: text('provider').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  scope: text('scope'),
  lastSynced: timestamp('last_synced'),
  settings: json('settings'),
  active: boolean('active').default(true)
});

/**
 * Insert schema for health data connections
 */
export const insertHealthDataConnectionSchema = createInsertSchema(healthDataConnections).omit({ id: true });

/**
 * Token revocations table
 */
export const tokenRevocations = pgTable('token_revocations', {
  id: integer('id').primaryKey().notNull(),
  tokenId: text('token_id').notNull(),
  userId: integer('user_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at').defaultNow().notNull(),
  reason: text('reason')
});

/**
 * Insert schema for token revocations
 */
export const insertTokenRevocationSchema = createInsertSchema(tokenRevocations).omit({ id: true });

/**
 * Token metadata table
 */
export const tokenMetadata = pgTable('token_metadata', {
  id: integer('id').primaryKey().notNull(),
  tokenId: text('token_id').notNull(),
  userId: integer('user_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  isRevoked: boolean('is_revoked').default(false),
  clientInfo: json('client_info')
});

/**
 * Insert schema for token metadata
 */
export const insertTokenMetadataSchema = createInsertSchema(tokenMetadata).omit({ id: true });

// Type exports
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type Symptom = typeof symptoms.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type HealthDataConnection = typeof healthDataConnections.$inferSelect;
export type InsertHealthDataConnection = z.infer<typeof insertHealthDataConnectionSchema>;

export type TokenRevocation = typeof tokenRevocations.$inferSelect;
export type InsertTokenRevocation = z.infer<typeof insertTokenRevocationSchema>;

export type TokenMetadata = typeof tokenMetadata.$inferSelect;
export type InsertTokenMetadata = z.infer<typeof insertTokenMetadataSchema>;