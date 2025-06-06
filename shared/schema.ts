import { pgTable, serial, text, timestamp, integer, boolean, json, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferSelectModel } from 'drizzle-orm';

<<<<<<< HEAD
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
=======
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

// Synced device health metrics
export const syncedData = pgTable("synced_data", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => userDevices.id),
  metricType: text("metric_type").notNull(),
  value: text("value").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  source: text("source").notNull(), // e.g. "fitbit", "apple_health"
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
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
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

<<<<<<< HEAD
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

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true });
=======
// Health Data Connections
export const healthDataConnections = pgTable("health_data_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceId: integer("device_id").references(() => userDevices.id),
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

// Mood Tracker
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  mood: real("mood").notNull(), // 1-10 scale
  energy: real("energy").notNull(), // 1-10 scale
  sleep: real("sleep").notNull(), // hours
  categories: text("categories").array(),
  notes: text("notes"),
  factors: text("factors").array()
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

// Direct Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  timestamp: timestamp("timestamp").notNull()
});

// Blocked Users
export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  blockedUserId: integer("blocked_user_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Message Reports
export const messageReports = pgTable("message_reports", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  reporterId: integer("reporter_id").notNull(),
  reason: text("reason"),
  reportedAt: timestamp("reported_at").notNull(),
});

// Refresh tokens for rotating auth
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
});

// Anonymized User Profiles
export const anonymizedProfiles = pgTable("anonymized_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  anonId: text("anon_id").notNull().unique()
});

// Anonymized Health Metrics
export const anonymizedMetrics = pgTable("anonymized_metrics", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  metric: text("metric").notNull(),
  value: real("value").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  sourceType: text("source_type").notNull()
});

// Targeted Partner Ads
export const partnerAds = pgTable("partner_ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  partner: text("partner").notNull(),
  url: text("url").notNull(),
  category: text("category"),
  tags: text("tags").array(),
});

// Add-on Modules available for purchase
export const addOnModules = pgTable("add_on_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  featureKey: text("feature_key"),
});

// Records of user purchases of modules
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  purchasedAt: timestamp("purchased_at").notNull(),
});

// Data licensing consent records
export const dataLicenses = pgTable("data_licenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  partner: text("partner").notNull(),
  consent: boolean("consent").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
});

// Sponsors for wellness challenges
export const challengeSponsorships = pgTable("challenge_sponsorships", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  sponsor: text("sponsor").notNull(),
  url: text("url"),
  description: text("description"),
});

// Metrics for user actions
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  actionType: text("action_type").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// Application logs
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  level: text("level").notNull(),
  message: text("message").notNull(),
  stack: text("stack"),
  timestamp: timestamp("timestamp").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  verificationToken: true,
  passwordResetToken: true,
  passwordResetExpires: true,
});
export const insertUserDeviceSchema = createInsertSchema(userDevices).omit({ id: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true });
export const insertConnectedDeviceSchema = createInsertSchema(connectedDevices).omit({ id: true });
export const insertHealthStatSchema = createInsertSchema(healthStats).omit({ id: true });
export const insertSyncedDataSchema = createInsertSchema(syncedData).omit({ id: true });
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertHealthDataConnectionSchema = createInsertSchema(healthDataConnections).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true });
export const insertHealthArticleSchema = createInsertSchema(healthArticles).omit({ id: true });
<<<<<<< HEAD
export const insertTokenMetadataSchema = createInsertSchema(tokenMetadata).omit({ id: true });
export const insertHealthcareRelationshipSchema = createInsertSchema(healthcareRelationships).omit({ id: true });
=======
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true });
export const insertMealPlanEntrySchema = createInsertSchema(mealPlanEntries).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertBlockedUserSchema = createInsertSchema(blockedUsers).omit({ id: true });
export const insertMessageReportSchema = createInsertSchema(messageReports).omit({ id: true });
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({ id: true });
export const insertAnonymizedProfileSchema = createInsertSchema(anonymizedProfiles).omit({ id: true });
export const insertAnonymizedMetricSchema = createInsertSchema(anonymizedMetrics).omit({ id: true });
export const insertPartnerAdSchema = createInsertSchema(partnerAds).omit({ id: true });
export const insertAddOnModuleSchema = createInsertSchema(addOnModules).omit({ id: true });
export const insertUserPurchaseSchema = createInsertSchema(userPurchases).omit({ id: true });
export const insertDataLicenseSchema = createInsertSchema(dataLicenses).omit({ id: true });
export const insertChallengeSponsorshipSchema = createInsertSchema(challengeSponsorships).omit({ id: true });
export const insertMetricSchema = createInsertSchema(metrics).omit({ id: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true });
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)

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

// Export insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
<<<<<<< HEAD
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
=======
export type User = typeof users.$inferSelect;

export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertConnectedDevice = z.infer<typeof insertConnectedDeviceSchema>;
export type ConnectedDevice = typeof connectedDevices.$inferSelect;

export type InsertHealthStat = z.infer<typeof insertHealthStatSchema>;
export type HealthStat = typeof healthStats.$inferSelect;
export type InsertSyncedData = z.infer<typeof insertSyncedDataSchema>;
export type SyncedData = typeof syncedData.$inferSelect;

>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertHealthDataConnection = z.infer<typeof insertHealthDataConnectionSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertHealthArticle = z.infer<typeof insertHealthArticleSchema>;
export type InsertTokenMetadata = z.infer<typeof insertTokenMetadataSchema>;
export type InsertHealthcareRelationship = z.infer<typeof insertHealthcareRelationshipSchema>;

// Health goals schemas and types
export const insertHealthGoalSchema = createInsertSchema(healthGoals).omit({ id: true });
export const insertGoalProgressSchema = createInsertSchema(goalProgress).omit({ id: true });

<<<<<<< HEAD
export type HealthGoal = InferSelectModel<typeof healthGoals>;
export type GoalProgress = InferSelectModel<typeof goalProgress>;
export type InsertHealthGoal = z.infer<typeof insertHealthGoalSchema>;
export type InsertGoalProgress = z.infer<typeof insertGoalProgressSchema>;
=======
export type InsertMealPlanEntry = z.infer<typeof insertMealPlanEntrySchema>;
export type MealPlanEntry = typeof mealPlanEntries.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type BlockedUser = typeof blockedUsers.$inferSelect;
export type InsertMessageReport = z.infer<typeof insertMessageReportSchema>;
export type MessageReport = typeof messageReports.$inferSelect;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export type InsertAnonymizedProfile = z.infer<typeof insertAnonymizedProfileSchema>;
export type AnonymizedProfile = typeof anonymizedProfiles.$inferSelect;

export type InsertAnonymizedMetric = z.infer<typeof insertAnonymizedMetricSchema>;
export type AnonymizedMetric = typeof anonymizedMetrics.$inferSelect;

export type InsertPartnerAd = z.infer<typeof insertPartnerAdSchema>;
export type PartnerAd = typeof partnerAds.$inferSelect;

export type InsertAddOnModule = z.infer<typeof insertAddOnModuleSchema>;
export type AddOnModule = typeof addOnModules.$inferSelect;

export type InsertUserPurchase = z.infer<typeof insertUserPurchaseSchema>;
export type UserPurchase = typeof userPurchases.$inferSelect;

export type InsertDataLicense = z.infer<typeof insertDataLicenseSchema>;
export type DataLicense = typeof dataLicenses.$inferSelect;

export type InsertChallengeSponsorship = z.infer<typeof insertChallengeSponsorshipSchema>;
export type ChallengeSponsorship = typeof challengeSponsorships.$inferSelect;

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;

export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;

export type Login = z.infer<typeof loginSchema>;
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
