import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  profilePicture: text("profile_picture"),
  healthData: text("health_data"), // Stored as JSON string
});

// Health Stats
export const healthStats = pgTable("health_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  statType: text("stat_type").notNull(), // e.g. "heart_rate", "sleep_quality", "zinc"
  value: text("value").notNull(), // Can be numeric or text
  unit: text("unit"), // e.g. "bpm", "hrs", etc.
  icon: text("icon"), // Icon name from Remix Icons
  colorScheme: text("color_scheme"), // CSS class for color
  timestamp: timestamp("timestamp").notNull(),
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
});

// Medication History
export const medicationHistory = pgTable("medication_history", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull(),
  userId: integer("user_id").notNull(),
  takenAt: timestamp("taken_at").notNull(),
  scheduled: timestamp("scheduled"), // When it was scheduled to be taken
  skipped: boolean("skipped").notNull().default(false), // Whether it was skipped
  note: text("note"), // Any notes about this dose
});

// Connections (Family & Friends)
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  connectionId: integer("connection_id").notNull(), // The user they're connected with
  relationshipType: text("relationship_type"), // e.g. "family", "friend"
  relationshipSpecific: text("relationship_specific"), // e.g. "sister", "brother", "father"
});

// Forum Posts
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subreddit: text("subreddit").notNull(), // e.g. "Nutrition", "Fitness"
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  tags: text("tags").array(),
  timestamp: timestamp("timestamp").notNull(),
});

// News & Updates
export const newsUpdates = pgTable("news_updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  thumbnail: text("thumbnail"),
  category: text("category").notNull(), // e.g. "Nutrition", "Mental Health", "Fitness"
  timestamp: timestamp("timestamp").notNull(),
});

// Product Recommendations
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  image: text("image"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  recommendedFor: text("recommended_for").array(), // e.g. ["zinc_deficiency"]
});

// Symptom Checker
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  bodyArea: text("body_area").notNull(),  // e.g. "head", "chest", "abdomen"
  severity: text("severity").notNull(),   // e.g. "mild", "moderate", "severe"
  commonCauses: text("common_causes").array(),
  recommendedActions: text("recommended_actions").array(),
});

// Symptom Check Records
export const symptomChecks = pgTable("symptom_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  reportedSymptoms: text("reported_symptoms").array(),
  preliminaryAssessment: text("preliminary_assessment"),
  recommendedActions: text("recommended_actions").array(),
  severity: text("severity"), // e.g. "routine", "urgent", "emergency"
  notes: text("notes"),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  provider: text("provider"),
  status: text("status").notNull(), // e.g. "scheduled", "completed", "cancelled"
  type: text("type").notNull(), // e.g. "checkup", "follow-up", "specialist"
  reminderSent: boolean("reminder_sent").default(false),
});

// Health Data Connections
export const healthDataConnections = pgTable("health_data_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // e.g. "apple_health", "google_fit", "fitbit"
  connected: boolean("connected").notNull().default(false),
  lastSynced: timestamp("last_synced"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  scope: text("scope").array(),
  expiresAt: timestamp("expires_at"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertHealthStatSchema = createInsertSchema(healthStats).omit({ id: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertMedicationHistorySchema = createInsertSchema(medicationHistory).omit({ id: true });
export const insertConnectionSchema = createInsertSchema(connections).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true });
export const insertNewsUpdateSchema = createInsertSchema(newsUpdates).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });
export const insertSymptomCheckSchema = createInsertSchema(symptomChecks).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertHealthDataConnectionSchema = createInsertSchema(healthDataConnections).omit({ id: true });

// Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHealthStat = z.infer<typeof insertHealthStatSchema>;
export type HealthStat = typeof healthStats.$inferSelect;

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

export type InsertMedicationHistory = z.infer<typeof insertMedicationHistorySchema>;
export type MedicationHistory = typeof medicationHistory.$inferSelect;

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

export type InsertNewsUpdate = z.infer<typeof insertNewsUpdateSchema>;
export type NewsUpdate = typeof newsUpdates.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;

export type InsertSymptomCheck = z.infer<typeof insertSymptomCheckSchema>;
export type SymptomCheck = typeof symptomChecks.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertHealthDataConnection = z.infer<typeof insertHealthDataConnectionSchema>;
export type HealthDataConnection = typeof healthDataConnections.$inferSelect;

export type Login = z.infer<typeof loginSchema>;
