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

// Health Journey Tracking
export const healthJourneyEntries = pgTable("health_journey_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  category: text("category").notNull(), // e.g. "weight", "exercise", "nutrition"
  title: text("title").notNull(),
  description: text("description"),
  metrics: text("metrics"), // JSON string with tracked metrics
  mediaUrl: text("media_url"),
  sentiment: text("sentiment"), // e.g. "positive", "neutral", "negative"
});

// Virtual Health Coaching
export const healthCoachingPlans = pgTable("health_coaching_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  goals: text("goals").array(),
  recommendations: text("recommendations").array(),
  progress: integer("progress").notNull().default(0), // 0-100 completion percentage
  active: boolean("active").notNull().default(true)
});

// Wellness Challenges & Gamification
export const wellnessChallenges = pgTable("wellness_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g. "fitness", "nutrition", "mental-health"
  pointsReward: integer("points_reward").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  requirementType: text("requirement_type").notNull(), // e.g. "steps", "meditation", "nutrition"
  requirementTarget: integer("requirement_target").notNull(),
  image: text("image")
});

export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  joined: timestamp("joined").notNull(),
  currentProgress: integer("current_progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at")
});

// Mental Health Integration
export const mentalHealthAssessments = pgTable("mental_health_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  assessmentType: text("assessment_type").notNull(), // e.g. "mood", "stress", "anxiety", "sleep"
  score: integer("score"),
  notes: text("notes"),
  recommendations: text("recommendations").array()
});

// Health Library
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

// Meal Planning
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  dietaryPreferences: text("dietary_preferences").array(),
  healthGoals: text("health_goals").array(),
  allergies: text("allergies").array(),
  active: boolean("active").notNull().default(true)
});

export const mealPlanEntries = pgTable("meal_plan_entries", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  mealType: text("meal_type").notNull(), // e.g. "breakfast", "lunch", "dinner", "snack"
  name: text("name").notNull(),
  recipe: text("recipe"),
  ingredients: text("ingredients").array(),
  nutritionalInfo: text("nutritional_info"), // JSON string
  preparationTime: integer("preparation_time"), // in minutes
  imageUrl: text("image_url")
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
export const insertHealthJourneyEntrySchema = createInsertSchema(healthJourneyEntries).omit({ id: true });
export const insertHealthCoachingPlanSchema = createInsertSchema(healthCoachingPlans).omit({ id: true });
export const insertWellnessChallengeSchema = createInsertSchema(wellnessChallenges).omit({ id: true });
export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({ id: true });
export const insertMentalHealthAssessmentSchema = createInsertSchema(mentalHealthAssessments).omit({ id: true });
export const insertHealthArticleSchema = createInsertSchema(healthArticles).omit({ id: true });
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true });
export const insertMealPlanEntrySchema = createInsertSchema(mealPlanEntries).omit({ id: true });

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

export type InsertHealthJourneyEntry = z.infer<typeof insertHealthJourneyEntrySchema>;
export type HealthJourneyEntry = typeof healthJourneyEntries.$inferSelect;

export type InsertHealthCoachingPlan = z.infer<typeof insertHealthCoachingPlanSchema>;
export type HealthCoachingPlan = typeof healthCoachingPlans.$inferSelect;

export type InsertWellnessChallenge = z.infer<typeof insertWellnessChallengeSchema>;
export type WellnessChallenge = typeof wellnessChallenges.$inferSelect;

export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;

export type InsertMentalHealthAssessment = z.infer<typeof insertMentalHealthAssessmentSchema>;
export type MentalHealthAssessment = typeof mentalHealthAssessments.$inferSelect;

export type InsertHealthArticle = z.infer<typeof insertHealthArticleSchema>;
export type HealthArticle = typeof healthArticles.$inferSelect;

export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;

export type InsertMealPlanEntry = z.infer<typeof insertMealPlanEntrySchema>;
export type MealPlanEntry = typeof mealPlanEntries.$inferSelect;

export type Login = z.infer<typeof loginSchema>;
