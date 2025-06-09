import {
  users,
  healthStats,
  medications,
  medicationHistory,
  connections,
  forumPosts,
  newsUpdates,
  products,
  symptoms,
  symptomChecks,
  appointments,
  healthDataConnections,
  healthJourneyEntries,
  healthCoachingPlans,
  wellnessChallenges,
  userChallengeProgress,
  mentalHealthAssessments,
  moodEntries,
  healthArticles,
  messages,
  mealPlans,
  mealPlanEntries,
  anonymizedProfiles,
  anonymizedMetrics,
  partnerAds,
  addOnModules,
  userPurchases,
  dataLicenses,
  challengeSponsorships,
  userDevices,
  connectedDevices,
  syncedData,
  userSessions,
  metrics,
  logs,
  type User,
  type InsertUser,
  type UserDevice,
  type InsertUserDevice,
  type UserSession,
  type InsertUserSession,
  type ConnectedDevice,
  type InsertConnectedDevice,
  type HealthStat,
  type InsertHealthStat,
  type SyncedData,
  type InsertSyncedData,
  type Medication,
  type InsertMedication,
  type MedicationHistory,
  type InsertMedicationHistory,
  type Connection,
  type InsertConnection,
  type ForumPost,
  type InsertForumPost,
  type NewsUpdate,
  type InsertNewsUpdate,
  type Product,
  type InsertProduct,
  type Symptom,
  type InsertSymptom,
  type SymptomCheck,
  type InsertSymptomCheck,
  type Appointment,
  type InsertAppointment,
  type HealthDataConnection,
  type InsertHealthDataConnection,
  type HealthJourneyEntry,
  type InsertHealthJourneyEntry,
  type HealthCoachingPlan,
  type InsertHealthCoachingPlan,
  type WellnessChallenge,
  type InsertWellnessChallenge,
  type UserChallengeProgress,
  type InsertUserChallengeProgress,
  type MentalHealthAssessment,
  type InsertMentalHealthAssessment,
  type MoodEntry,
  type InsertMoodEntry,
  type HealthArticle,
  type InsertHealthArticle,
  type Message,
  type InsertMessage,
  type MealPlan,
  type InsertMealPlan,
  type MealPlanEntry,
  type InsertMealPlanEntry,
  type InsertAnonymizedProfile,
  type InsertAnonymizedMetric,
  type AnonymizedProfile,
  type AnonymizedMetric,
  type InsertBlockedUser,
  type BlockedUser,
  type InsertMessageReport,
  type MessageReport,
  type PartnerAd,
  type InsertPartnerAd,
  type AddOnModule,
  type InsertAddOnModule,
  type UserPurchase,
  type InsertUserPurchase,
  type DataLicense,
  type InsertDataLicense,
  type ChallengeSponsorship,
  type InsertChallengeSponsorship,
  type Metric,
  type InsertMetric,
  type Log,
  type InsertLog,
  type InsertRefreshToken,
  type RefreshToken
} from "@shared/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { encrypt, decrypt } from "./utils/encryption";

// Modify the interface with any CRUD methods you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  // User Methods
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUserPreferences(userId: number, preferences: any): Promise<User>;

  // User Devices
  getUserDevices(userId: number): Promise<UserDevice[]>;
  createUserDevice(device: InsertUserDevice): Promise<UserDevice>;
  updateUserDevice(id: number, deviceData: Partial<UserDevice>): Promise<UserDevice | undefined>;

  // Connected Devices
  getConnectedDevices(userId: number): Promise<ConnectedDevice[]>;
  createConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice>;
  updateConnectedDevice(id: number, deviceData: Partial<ConnectedDevice>): Promise<ConnectedDevice | undefined>;

  // User Devices
  getUserDevices(userId: number): Promise<UserDevice[]>;
  createUserDevice(device: InsertUserDevice): Promise<UserDevice>;
  updateUserDevice(id: number, deviceData: Partial<UserDevice>): Promise<UserDevice | undefined>;

  // Connected Devices
  getConnectedDevices(userId: number): Promise<ConnectedDevice[]>;
  createConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice>;
  updateConnectedDevice(id: number, deviceData: Partial<ConnectedDevice>): Promise<ConnectedDevice | undefined>;

  // Health Stats
  getUserHealthStats(userId: number): Promise<HealthStat[]>;
  addHealthStat(stat: InsertHealthStat): Promise<HealthStat>;

  // Synced Data
  getDeviceSyncedData(deviceId: number): Promise<SyncedData[]>;
  addSyncedData(data: InsertSyncedData): Promise<SyncedData>;

  
  // Health metrics
  getHealthMetrics(userId: number): Promise<HealthMetric[]>;
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  addHealthMetric(metricData: Omit<HealthMetric, 'id'>): Promise<HealthMetric>;
  
  // Medications
  getMedications(userId: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  addMedication(medicationData: Omit<Medication, 'id'>): Promise<Medication>;

  // Medication History
  getMedicationHistory(medicationId: number): Promise<MedicationHistory[]>;
  getUserMedicationHistory(userId: number): Promise<MedicationHistory[]>;
  addMedicationHistory(entry: InsertMedicationHistory): Promise<MedicationHistory>;
  getMedicationAdherenceRate(medicationId: number): Promise<number>; // Returns % taken on time

  // Connections
  getUserConnections(userId: number): Promise<{ connection: User, relationship: string, specific: string }[]>;
  addConnection(connection: InsertConnection): Promise<Connection>;
  removeConnection(userId: number, connectionId: number): Promise<boolean>;

  // Messages
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userA: number, userB: number): Promise<Message[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  markMessagesRead(userId: number, otherId: number): Promise<void>;
  blockUser(userId: number, blockedId: number): Promise<void>;
  isBlocked(userId: number, otherId: number): Promise<boolean>;
  reportMessage(report: InsertMessageReport): Promise<MessageReport>;

  // Forum Posts
  getForumPosts(subreddit?: string): Promise<ForumPost[]>;
  getUserForumPosts(userId: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPostVotes(id: number, upvote: boolean): Promise<ForumPost | undefined>;

  // News & Updates
  getNewsUpdates(limit?: number, category?: string): Promise<NewsUpdate[]>;
  createNewsUpdate(update: InsertNewsUpdate): Promise<NewsUpdate>;

  // Products
  getProducts(category?: string, recommendedFor?: string[]): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Symptom Checker
  getSymptoms(bodyArea?: string, severity?: string): Promise<Symptom[]>;
  getSymptomById(id: number): Promise<Symptom | undefined>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;

  
  // Symptoms
  getSymptoms(userId: number): Promise<Symptom[]>;
  getSymptom(id: number): Promise<Symptom | undefined>;
  addSymptom(symptomData: Omit<Symptom, 'id'>): Promise<Symptom>;
  
  // Appointments
interface IStorage {
  // Appointments
  getUserAppointments(userId: number): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;

  // Health Data Connections
  getUserHealthDataConnections(userId: number): Promise<HealthDataConnection[]>;
  getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined>;
  createHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection>;
  updateHealthDataConnection(id: number, connectionData: Partial<HealthDataConnection>): Promise<HealthDataConnection | undefined>;

  // Forum Posts
  getForumPosts(subreddit?: string): Promise<ForumPost[]>;
  getUserForumPosts(userId: number): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  addForumPost(postData: Omit<ForumPost, 'id'>): Promise<ForumPost>;

  // Health Articles & News
  getHealthArticles(category?: string, tags?: string[]): Promise<HealthArticle[]>;
  getHealthArticleById(id: number): Promise<HealthArticle | undefined>;
  createHealthArticle(article: InsertHealthArticle): Promise<HealthArticle>;
// Meal Planning
getUserMealPlans(userId: number): Promise<MealPlan[]>;
getMealPlanById(id: number): Promise<MealPlan | undefined>;
createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
updateMealPlan(id: number, planData: Partial<MealPlan>): Promise<MealPlan | undefined>;

// Meal Plan Entries
getMealPlanEntries(mealPlanId: number): Promise<MealPlanEntry[]>;
getMealPlanEntryById(id: number): Promise<MealPlanEntry | undefined>;
createMealPlanEntry(entry: InsertMealPlanEntry): Promise<MealPlanEntry>;
updateMealPlanEntry(id: number, entryData: Partial<MealPlanEntry>): Promise<MealPlanEntry | undefined>;

// Anonymized Metrics
getOrCreateAnonymizedProfile(userId: number): Promise<AnonymizedProfile>;
addAnonymizedMetric(metric: InsertAnonymizedMetric): Promise<AnonymizedMetric>;

// Partner Ads
getPartnerAds(category?: string, tag?: string): Promise<PartnerAd[]>;
createPartnerAd(ad: InsertPartnerAd): Promise<PartnerAd>;

// Add-on Modules & Purchases
getAddOnModules(): Promise<AddOnModule[]>;
getAddOnModuleById(id: number): Promise<AddOnModule | undefined>;
createAddOnModule(module: InsertAddOnModule): Promise<AddOnModule>;
getUserPurchases(userId: number): Promise<UserPurchase[]>;
createUserPurchase(purchase: InsertUserPurchase): Promise<UserPurchase>;

// Data Licensing
getDataLicenses(userId: number): Promise<DataLicense[]>;
createDataLicense(license: InsertDataLicense): Promise<DataLicense>;

// Refresh Tokens
createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
getRefreshToken(token: string): Promise<RefreshToken | undefined>;
revokeRefreshToken(token: string): Promise<void>;

// Challenge Sponsorships
getChallengeSponsorships(challengeId?: number): Promise<ChallengeSponsorship[]>;
createChallengeSponsorship(sponsorship: InsertChallengeSponsorship): Promise<ChallengeSponsorship>;

// Sessions & Metrics
createSession(userId: number): Promise<UserSession>;
updateSession(id: number): Promise<void>;
getActiveSessionCount(): Promise<number>;
addMetric(metric: InsertMetric): Promise<Metric>;
addLog(log: InsertLog): Promise<Log>;
getActionCounts(): Promise<Record<string, number>>;

// Health News
getHealthNews(): Promise<any[]>;

// Health Goals
createHealthGoal(goalData: InsertHealthGoal): Promise<HealthGoal>;
getHealthGoals(userId: number): Promise<HealthGoal[]>;
getHealthGoal(goalId: number): Promise<HealthGoal | undefined>;
updateHealthGoal(goalId: number, updates: Partial<InsertHealthGoal>): Promise<HealthGoal | undefined>;
deleteHealthGoal(goalId: number): Promise<boolean>;

// Goal Progress
addGoalProgress(progressData: InsertGoalProgress): Promise<GoalProgress>;
getGoalProgress(goalId: number): Promise<GoalProgress[]>;
getGoalProgressForPeriod(goalId: number, startDate: Date, endDate: Date): Promise<GoalProgress[]>;

// Daily Insights
addDailyInsight(insight: { userId: number; date: Date; summary: string }): Promise<void>;
getDailyInsights(userId: number): Promise<{ id: number; userId: number; date: Date; summary: string; createdAt: Date }[]>;

// Security and Permissions
getTokenById(tokenId: string): Promise<any>;
storeTokenMetadata(tokenData: any): Promise<void>;
revokeToken(tokenId: string): Promise<void>;
revokeAllUserTokens(userId: number): Promise<void>;


  getResourceOwnerId(resourceId: number, resourceType: string): Promise<number | null>;
  isUserAssignedToResource(userId: number, resourceId: number, resourceType: string): Promise<boolean>;

  // Healthcare Relationships
  hasHealthcareRelationship(providerId: number, patientId: number): Promise<boolean>;
  getHealthcareRelationships(providerId: number): Promise<any[]>;

  // Family Timeline
  getFamilyMembers(userId: number, familyId?: number): Promise<any[]>;
  getFamilyTimelineEvents(userId: number, familyId?: number, memberId?: number, timeFilter?: string): Promise<any[]>;
}

// Sample data seeding for demo purposes
async seed() {
  const user1 = await this.createUser({
    name: "Demo User",
    email: "demo@example.com",
    password: "c7a628cbbfaa66f78e8ee5c8e9cf88b2e4d7b5a5.af2bdbe1aa9b6ec1e2ade1d11e90b88",
    roles: ["patient"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    age: 35,
    healthGoals: "Stay fit and eat well",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    healthData: JSON.stringify({}),
    isPremium: true,
    preferences: null,
    profileImage: null,
    bio: null
  });

  await this.createNewsUpdate({
    title: "Scheduled Maintenance Tonight",
    content: "The system will be undergoing maintenance at 10 PM UTC.",
    thumbnail: "",
    category: "System",
    timestamp: new Date()
  });

  await this.createProduct({
    name: "Zinc Complex",
    description: "High-absorption zinc supplement with copper to support immune function.",
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    category: "Supplements",
    tags: ["zinc", "immune", "recommended"],
    recommendedFor: ["zinc_deficiency"]
  });
}

    });

    // Seed devices, stats, medications, news, etc.
    const device1 = await this.createUserDevice({
      userId: user1.id,
      deviceUuid: "demo-device",
      deviceType: "web",
      deviceName: "Demo Browser",
      lastSeen: new Date()
    });

    // [REMAINS UNCHANGED] Everything below continues as-is — adding stats, meds, posts, etc.
    // 👇 Keep the long block of `await this.createXYZ()` calls here.

    // (All seeding logic from the srl6kn-codex branch continues...)
  }

  // In-memory storage arrays
  private forumPosts: ForumPost[] = [];
  private healthMetrics: HealthMetric[] = [];
  private medications: Medication[] = [];
  private symptoms: Symptom[] = [];
  private appointments: Appointment[] = [];
  private healthConnections: HealthDataConnection[] = [];
  private healthArticles: HealthArticle[] = [];
  private tokenMetadata: any[] = [];
  private healthcareRelationships: any[] = [];
  private resourceOwnership: { resourceId: number; resourceType: string; ownerId: number }[] = [];
  private resourceAssignments: { resourceId: number; resourceType: string; userId: number }[] = [];
  private familyMembers: any[] = [];
  private familyTimelineEvents: any[] = [];
  private dailyInsights: { id: number; userId: number; date: Date; summary: string; createdAt: Date }[] = [];

async seed() {
  // ... assume user1 and device1 were created earlier

  // Forum posts
  await this.createForumPost({
    userId: 1,
    title: "STUDY: New research links zinc levels to immune function and metabolism",
    content: "A new study published in the Journal of Nutritional Science has found significant correlations between zinc levels and both immune function and metabolic health. Here's what you need to know...",
    subreddit: "Nutrition",
    upvotes: 95,
    downvotes: 2,
    tags: ["Research", "Zinc", "Immunity"],
    timestamp: new Date()
  });

  await this.createForumPost({
    userId: 1,
    title: "My 30-day experience with zinc supplementation [Before & After]",
    content: "I decided to document my experience with zinc supplementation after discovering I had low levels. Here's how it affected my energy, skin health, and immune function over 30 days...",
    subreddit: "Nutrition",
    upvotes: 64,
    downvotes: 1,
    tags: ["Experience", "Zinc", "Supplements"],
    timestamp: new Date()
  });

  // Symptoms
  await this.createSymptom({
    name: "Headache",
    description: "Pain or discomfort in the head, scalp, or neck",
    bodyArea: "head",
    severity: "moderate",
    commonCauses: ["Stress", "Dehydration", "Lack of sleep", "Eye strain"],
    recommendedActions: ["Rest", "Hydrate", "Over-the-counter pain relievers"]
  });

  await this.createSymptom({
    name: "Fatigue",
    description: "Feeling of tiredness, lack of energy, or exhaustion",
    bodyArea: "full_body",
    severity: "moderate",
    commonCauses: ["Poor sleep", "Stress", "Nutrient deficiencies", "Anemia"],
    recommendedActions: ["Rest", "Balanced diet", "Stress management", "Check for deficiencies"]
  });

  await this.createSymptom({
    name: "Chest Pain",
    description: "Discomfort or pain in the chest area",
    bodyArea: "chest",
    severity: "severe",
    commonCauses: ["Heart issues", "Muscle strain", "Anxiety", "Acid reflux"],
    recommendedActions: ["Seek immediate medical attention", "Call emergency services"]
  });

  // Symptom check
  const now = new Date();
  await this.createSymptomCheck({
    userId: 1,
    timestamp: new Date(now.getTime() - 3 * 86400000), // 3 days ago
    reportedSymptoms: ["Headache", "Fatigue"],
    preliminaryAssessment: "Possible dehydration or stress-related symptoms",
    recommendedActions: ["Increase water intake", "Rest", "Over-the-counter pain relievers if needed"],
    severity: "routine",
    notes: "Symptoms appeared after long work session with limited water intake"
  });

  // Appointments
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 30, 0, 0);

  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(11, 15, 0, 0);

  await this.createAppointment({
    userId: 1,
    title: "Annual Physical Checkup",
    description: "Regular annual physical examination with primary care physician",
    startTime: nextWeek,
    endTime: nextWeekEnd,
    location: "Dr. Smith's Clinic, 123 Health St",
    provider: "Dr. James Smith",
    status: "scheduled",
    type: "checkup",
    reminderSent: false
  });

  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  twoWeeksLater.setHours(14, 0, 0, 0);

  const twoWeeksLaterEnd = new Date(twoWeeksLater);
  twoWeeksLaterEnd.setHours(14, 45, 0, 0);

  await this.createAppointment({
    userId: 1,
    title: "Nutritional Consultation",
    description: "Follow-up appointment to discuss zinc deficiency and nutritional plan",
    startTime: twoWeeksLater,
    endTime: twoWeeksLaterEnd,
    location: "Wellness Nutrition Center, 456 Healthy Blvd",
    provider: "Dr. Sarah Johnson, RD",
    status: "scheduled",
    type: "specialist",
    reminderSent: false
  });

  // Health data connection
  await this.createHealthDataConnection({
    userId: 1,
    deviceId: device1.id,
    provider: "apple_health",
    connected: false,
    lastSynced: null,
    accessToken: null,
    refreshToken: null,
    scope: ["activity", "heart_rate", "sleep"],
    expiresAt: null
  });

  // Health journey
  await this.createHealthJourneyEntry({
    userId: 1,
    timestamp: new Date(now.getTime() - 7 * 86400000), // 7 days ago
    category: "nutrition",
    title: "Started Zinc Supplements",
    description: "Started taking zinc supplements to improve my immune function after recent blood tests showed deficiency.",
    metrics: JSON.stringify({ supplement: "Zinc", dosage: "50mg", frequency: "daily" }),
    mediaUrl: null,
    sentiment: "positive"
  });

  await this.createHealthJourneyEntry({
    userId: 1,
    timestamp: new Date(now.getTime() - 2 * 86400000), // 2 days ago
    category: "exercise",
    title: "Increased daily steps goal",
    description: "Increased my daily step goal from 8,000 to 10,000 steps. Feeling more energetic lately.",
    metrics: JSON.stringify({ previous_goal: 8000, new_goal: 10000, current_average: 7500 }),
    mediaUrl: null,
    sentiment: "positive"
  });

  // Health coaching plan
  await this.createHealthCoachingPlan({
    userId: 1,
    title: "Zinc Deficiency Improvement Plan",
    description: "A personalized plan to address your zinc deficiency and boost your immune system",
    createdAt: new Date(now.getTime() - 7 * 86400000),
    updatedAt: new Date(now.getTime() - 7 * 86400000),
    goals: [
      "Increase zinc levels to normal range within 3 months",
      "Reduce frequency of seasonal illness",
      "Improve energy levels"
    ],
    recommendations: [
      "Take zinc supplement daily with food",
      "Increase consumption of zinc-rich foods (oysters, beef, pumpkin seeds)",
      "Monitor for improvements in immune function",
      "Retest zinc levels after 3 months"
    ],
    progress: 25,
    active: true
  });

  // Wellness challenge
  const walkingChallenge = await this.createWellnessChallenge({
    title: "10K Steps Challenge",
    description: "Walk at least 10,000 steps every day for 30 days to boost cardiovascular health and energy levels",
    category: "fitness",
    pointsReward: 500,
    startDate: new Date(now.getTime() - 15 * 86400000),
    endDate: new Date(now.getTime() + 15 * 86400000),
    requirementType: "steps",
    requirementTarget: 10000,
    image: "https://images.unsplash.com/photo-1510021115607-c94b84bcb73a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
  });

  await this.createUserChallengeProgress({
    userId: 1,
    challengeId: walkingChallenge.id,
    joined: new Date(now.getTime() - 10 * 86400000),
    currentProgress: 7500,
    completed: false,
    completedAt: null
  });

  // Mental health assessment
  await this.createMentalHealthAssessment({
    userId: 1,
    timestamp: new Date(now.getTime() - 5 * 86400000),
    assessmentType: "stress",
    score: 7,
    notes: "Feeling moderately stressed due to work deadlines and health concerns",
    recommendations: [
      "Practice mindfulness meditation for 10 minutes daily",
      "Take short breaks during work hours",
      "Prioritize 7-8 hours of sleep",
      "Consider speaking with a mental health professional if stress persists"
    ]
  });

  // Mood entries
  await this.createMoodEntry({
    userId: 1,
    date: new Date(now.getTime() - 4 * 86400000),
    mood: 6,
    energy: 5,
    sleep: 6.5,
    categories: ["work", "health"],
    notes: "Feeling tired after a long day at work. Stress about upcoming health appointment.",
    factors: ["work stress", "health issue"]
  });

  await this.createMoodEntry({
    userId: 1,
    date: new Date(now.getTime() - 3 * 86400000),
    mood: 8,
    energy: 7,
    sleep: 7.5,
    categories: ["personal", "social"],
    notes: "Had a good night's sleep and spent time with friends. Feeling much better.",
    factors: ["good sleep", "social connection", "relaxation"]
  });

  await this.createMoodEntry({
    userId: 1,
    date: new Date(now.getTime() - 86400000),
    mood: 7,
    energy: 8,
    sleep: 8,
    categories: ["personal", "health"],
    notes: "Started morning with exercise and took zinc supplement. Feeling energized.",
    factors: ["exercise", "nutrition"]
  });

  // Health article
  await this.createHealthArticle({
    title: "Understanding Zinc's Role in Immune Function",
    summary: "A comprehensive guide to how zinc affects your immune system and what deficiency means for your health",
    content: "...", // Full article content here
    authorName: "Dr. Emily Chen, PhD",
    publishedAt: new Date(now.getTime() - 30 * 86400000),
    category: "Nutrition",
    tags: ["zinc", "immunity", "nutrition", "micronutrients"],
    imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40",
    sourceName: "Journal of Nutritional Science",
    sourceUrl: "https://example.com/jns/zinc-immune-function",
    readTime: 8
  });

  // Meal plans and entries
  const mealPlan = await this.createMealPlan({ /* same as before */ });
  await this.createMealPlanEntry({ /* breakfast */ });
  await this.createMealPlanEntry({ /* lunch */ });

  // Monetization: Ads, Modules, Purchases
  await this.createPartnerAd({ /* partner ad info */ });
  const coachingModule = await this.createAddOnModule({ /* module info */ });
  await this.createUserPurchase({ userId: 1, moduleId: coachingModule.id, purchasedAt: new Date() });
  await this.createDataLicense({ userId: 1, partner: "Health Research Co", consent: true, createdAt: new Date() });
  await this.createChallengeSponsorship({ challengeId: walkingChallenge.id, sponsor: "FitBrand", url: "...", description: "..." });
}

// User Management

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      emailVerified: false,
      verificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      ...user,
      id,
    } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // User Devices
  async getUserDevices(userId: number): Promise<UserDevice[]> {
    return Array.from(this.userDevices.values()).filter(d => d.userId === userId);
  }

  async createUserDevice(device: InsertUserDevice): Promise<UserDevice> {
    const id = this.userDeviceIdCounter++;
    const newDevice: UserDevice = { ...device, id };
    this.userDevices.set(id, newDevice);
    return newDevice;
  }

  async updateUserDevice(id: number, deviceData: Partial<UserDevice>): Promise<UserDevice | undefined> {
    const device = this.userDevices.get(id);
    if (!device) return undefined;
    const updated = { ...device, ...deviceData };
    this.userDevices.set(id, updated);
    return updated;
  }

  // Connected Devices
  async getConnectedDevices(userId: number): Promise<ConnectedDevice[]> {
    return Array.from(this.connectedDevices.values()).filter(d => d.userId === userId);
  }

  async createConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice> {
    const id = this.connectedDeviceIdCounter++;
    const newDevice: ConnectedDevice = { ...device, id };
    this.connectedDevices.set(id, newDevice);
    return newDevice;
  }

  async updateConnectedDevice(id: number, deviceData: Partial<ConnectedDevice>): Promise<ConnectedDevice | undefined> {
    const device = this.connectedDevices.get(id);
    if (!device) return undefined;
    const updated = { ...device, ...deviceData };
    this.connectedDevices.set(id, updated);
    return updated;
  }

  // Health Stats
  async getUserHealthStats(userId: number): Promise<HealthStat[]> {
    return Array.from(this.healthStats.values()).filter(
      (stat) => stat.userId === userId
    );
  }

  async addHealthStat(stat: InsertHealthStat): Promise<HealthStat> {
    const id = this.healthStatIdCounter++;
    const newStat: HealthStat = { ...stat, id };
    this.healthStats.set(id, newStat);

    // Also store anonymized metric for analytics
    const profile = await this.getOrCreateAnonymizedProfile(stat.userId);
    await this.addAnonymizedMetric({
      profileId: profile.id,
      metric: stat.statType,
      value: parseFloat(stat.value) || 0,
      timestamp: stat.timestamp,
      sourceType: 'direct',
    });

    return newStat;
  }

  // Synced Data
  async getDeviceSyncedData(deviceId: number): Promise<SyncedData[]> {
    return Array.from(this.syncedData.values()).filter(d => d.deviceId === deviceId);
  }

  async addSyncedData(data: InsertSyncedData): Promise<SyncedData> {
    const id = this.syncedDataIdCounter++;
    const newData: SyncedData = { ...data, id };
    this.syncedData.set(id, newData);
    return newData;
  }

  // Medications
  async getUserMedications(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (medication) => medication.userId === userId && medication.active
    );
  }

  }

  // Synced Data
  async getDeviceSyncedData(deviceId: number): Promise<SyncedData[]> {
    return Array.from(this.syncedData.values()).filter(d => d.deviceId === deviceId);
  }

  async addSyncedData(data: InsertSyncedData): Promise<SyncedData> {
    const id = this.syncedDataIdCounter++;
    const newData: SyncedData = { ...data, id };
    this.syncedData.set(id, newData);
    return newData;
  }
  
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const id = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const now = new Date();
    
    const user: User = {
      id,
      createdAt: now,
      updatedAt: now,
      ...userData,
      // Ensure required fields have default values
      name: userData.name ?? null,
      roles: userData.roles ?? ['patient'],
      preferences: userData.preferences ?? {},
      profileImage: userData.profileImage ?? null,
      bio: userData.bio ?? null
    };
    
    this.users.push(user);
    return user;
  }
  
  async getUserMedicationHistory(userId: number): Promise<MedicationHistory[]> {
    return Array.from(this.medicationHistories.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  }

  async addMedicationHistory(entry: InsertMedicationHistory): Promise<MedicationHistory> {
    const id = this.medicationHistoryIdCounter++;
    const newEntry: MedicationHistory = { ...entry, id };
    this.medicationHistories.set(id, newEntry);
    return newEntry;
  }

  async getMedicationAdherenceRate(medicationId: number): Promise<number> {
    const history = await this.getMedicationHistory(medicationId);
    if (history.length === 0) return 0;

    const takenOnTime = history.filter(entry => {
      if (entry.skipped) return false;
      if (!entry.scheduled) return true;

      const scheduledTime = new Date(entry.scheduled).getTime();
      const takenTime = new Date(entry.takenAt).getTime();
      const timeDiff = Math.abs(takenTime - scheduledTime);
      return timeDiff < 2 * 60 * 60 * 1000;
    });

    return (takenOnTime.length / history.length) * 100;
  }

  // Connections
  async getUserConnections(userId: number): Promise<{ connection: User, relationship: string, specific: string }[]> {
    const userConnections = Array.from(this.connections.values()).filter(
      (connection) => connection.userId === userId
    );

    const connectionsWithUsers = [];
    for (const connection of userConnections) {
      const connectedUser = await this.getUser(connection.connectionId);
      if (connectedUser) {
        connectionsWithUsers.push({
          connection: connectedUser,
          relationship: connection.relationshipType || "",
          specific: connection.relationshipSpecific || ""
        });
      }
    }

    return connectionsWithUsers;
  }

  async addConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionIdCounter++;
    const newConnection: Connection = { ...connection, id };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  async removeConnection(userId: number, connectionId: number): Promise<boolean> {
    const connectionsToRemove = Array.from(this.connections.entries()).filter(
      ([_, connection]) =>
        connection.userId === userId && connection.connectionId === connectionId
    );

    for (const [id] of connectionsToRemove) {
      this.connections.delete(id);
    }

    return connectionsToRemove.length > 0;
  }

  // Messages
  async sendMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesBetweenUsers(userA: number, userB: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m =>
        (m.senderId === userA && m.recipientId === userB) ||
        (m.senderId === userB && m.recipientId === userA)
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (m) => m.recipientId === userId && !m.read,
    ).length;
  }

  async markMessagesRead(userId: number, otherId: number): Promise<void> {
    for (const message of this.messages.values()) {
      if (message.recipientId === userId && message.senderId === otherId) {
        message.read = true;
      }
    }
  }

  async blockUser(userId: number, blockedId: number): Promise<void> {
    let set = this.blockedUsers.get(userId);
    if (!set) {
      set = new Set();
      this.blockedUsers.set(userId, set);
    }
    set.add(blockedId);
  }

  async isBlocked(userId: number, otherId: number): Promise<boolean> {
    return this.blockedUsers.get(userId)?.has(otherId) ?? false;
  }

  async reportMessage(report: InsertMessageReport): Promise<MessageReport> {
    const id = this.messageReportIdCounter++;
    const newReport: MessageReport = { ...report, id };
    const arr = this.messageReports.get(report.messageId) || [];
    arr.push(newReport);
    this.messageReports.set(report.messageId, arr);
    return newReport;
  }

  // Forum Posts
  async getForumPosts(subreddit?: string): Promise<ForumPost[]> {
    let posts = Array.from(this.forumPosts.values());

    if (subreddit) {
      posts = posts.filter(post => post.subreddit === subreddit);
    }

    return posts.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getUserForumPosts(userId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.userId === userId
    );
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostIdCounter++;
    const newPost: ForumPost = { ...post, id };
    this.forumPosts.set(id, newPost);
    return newPost;
  }

  async updateForumPostVotes(id: number, upvote: boolean): Promise<ForumPost | undefined> {
    const post = this.forumPosts.get(id);
    if (!post) return undefined;

    const updatedPost = {
      ...post,
      upvotes: upvote ? post.upvotes + 1 : post.upvotes,
      downvotes: !upvote ? post.downvotes + 1 : post.downvotes
    };

    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }

    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      preferences,
      updatedAt: new Date()
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }
  
  // Health metrics
  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return this.healthMetrics.filter(metric => metric.userId === userId);
  }
  
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.find(metric => metric.id === id);
  }
  
  async addHealthMetric(metricData: Omit<HealthMetric, 'id'>): Promise<HealthMetric> {
    const id = this.healthMetrics.length > 0 ? Math.max(...this.healthMetrics.map(m => m.id)) + 1 : 1;
    
    const metric: HealthMetric = {
      id,
      ...metricData,
      // Ensure required fields have default values
      unit: metricData.unit ?? null,
      notes: metricData.notes ?? null,
      source: metricData.source ?? null
    };
    
    this.healthMetrics.push(metric);
    
    // Add to ownership table
    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'health-metric',
      ownerId: metricData.userId
    });
    
    return metric;
  }
  
  // Medications
  async getMedications(userId: number): Promise<Medication[]> {
    return this.medications.filter(med => med.userId === userId);
  }
  
  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.find(med => med.id === id);
  }
  
  async addMedication(medicationData: Omit<Medication, 'id'>): Promise<Medication> {
    const id = this.medications.length > 0 ? Math.max(...this.medications.map(m => m.id)) + 1 : 1;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Health Data Connection Methods
  async getUserHealthDataConnections(userId: number): Promise<HealthDataConnection[]> {
    return Array.from(this.healthDataConnections.values())
      .filter(connection => connection.userId === userId)
      .map(c => ({
        ...c,
        accessToken: c.accessToken ? decrypt(c.accessToken) : null,
        refreshToken: c.refreshToken ? decrypt(c.refreshToken) : null,
      }));
  }

  async getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined> {
    const conn = this.healthDataConnections.get(id);
    if (!conn) return undefined;
    return {
      ...conn,
      accessToken: conn.accessToken ? decrypt(conn.accessToken) : null,
      refreshToken: conn.refreshToken ? decrypt(conn.refreshToken) : null,
    };
  }

  async createHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection> {
    const id = this.healthDataConnectionIdCounter++;
    const newConnection: HealthDataConnection = {
      ...connection,
      id,
      accessToken: connection.accessToken ? encrypt(connection.accessToken) : null,
      refreshToken: connection.refreshToken ? encrypt(connection.refreshToken) : null,
    } as HealthDataConnection;
    this.healthDataConnections.set(id, newConnection);
    return newConnection;
  }

  async updateHealthDataConnection(id: number, connectionData: Partial<HealthDataConnection>): Promise<HealthDataConnection | undefined> {
    const connection = this.healthDataConnections.get(id);
    if (!connection) return undefined;

    const updatedConnection: HealthDataConnection = { ...connection };
    if (connectionData.accessToken !== undefined) {
      updatedConnection.accessToken = connectionData.accessToken ? encrypt(connectionData.accessToken) : null;
    }
    if (connectionData.refreshToken !== undefined) {
      updatedConnection.refreshToken = connectionData.refreshToken ? encrypt(connectionData.refreshToken) : null;
    }
Object.assign(updatedConnection, connectionData, {
  accessToken: updatedConnection.accessToken,
  refreshToken: updatedConnection.refreshToken
});

    this.healthDataConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Health Journey Entries
  async getUserHealthJourneyEntries(userId: number): Promise<HealthJourneyEntry[]> {
    return Array.from(this.healthJourneyEntries.values()).filter(
      (entry) => entry.userId === userId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Medications
  async addMedication(medicationData: Omit<Medication, 'id'>): Promise<Medication> {
    const id = this.medications.length > 0 ? Math.max(...this.medications.map(m => m.id)) + 1 : 1;

    const medication: Medication = {
      id,
      ...medicationData,
      notes: medicationData.notes ?? null,
      dosage: medicationData.dosage ?? null,
      frequency: medicationData.frequency ?? null,
      endDate: medicationData.endDate ?? null,
      prescribedBy: medicationData.prescribedBy ?? null,
      active: medicationData.active ?? null
    };

    this.medications.push(medication);

    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'medication',
      ownerId: medicationData.userId
    });

    return medication;
  }

  // Symptoms
  async getSymptoms(userId: number): Promise<Symptom[]> {
    return this.symptoms.filter(symptom => symptom.userId === userId);
  }

  async getSymptom(id: number): Promise<Symptom | undefined> {
    return this.symptoms.find(symptom => symptom.id === id);
  }

  async addSymptom(symptomData: Omit<Symptom, 'id'>): Promise<Symptom> {
    const id = this.symptoms.length > 0 ? Math.max(...this.symptoms.map(s => s.id)) + 1 : 1;

    const symptom: Symptom = {
      id,
      ...symptomData,
      notes: symptomData.notes ?? null,
      endTime: symptomData.endTime ?? null,
      relatedCondition: symptomData.relatedCondition ?? null,
      bodyLocation: symptomData.bodyLocation ?? null
    };

    this.symptoms.push(symptom);

    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'symptom',
      ownerId: symptomData.userId
    });

    return symptom;
  }

  }
  
  // Appointments
  async getAppointments(userId: number): Promise<Appointment[]> {
    return this.appointments.filter(appointment => appointment.userId === userId);
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.find(appointment => appointment.id === id);
  }
  
  async addAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    const id = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.id)) + 1 : 1;
    
    const appointment: Appointment = {
      id,
      ...appointmentData,
      // Ensure required fields have default values
      type: appointmentData.type ?? null,
      status: appointmentData.status ?? null,
      notes: appointmentData.notes ?? null,
      location: appointmentData.location ?? null,
      duration: appointmentData.duration ?? null,
      reminderTime: appointmentData.reminderTime ?? null
    };
    
    this.appointments.push(appointment);
    
    // Add to ownership table
    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'appointment',
      ownerId: appointmentData.userId
    });
    
    return appointment;
  }
  
  // Health data connections
  async getHealthDataConnections(userId: number): Promise<HealthDataConnection[]> {
    return this.healthConnections.filter(connection => connection.userId === userId);
  }
  
  async getHealthDataConnection(id: number): Promise<HealthDataConnection | undefined> {
    return this.healthConnections.find(connection => connection.id === id);
  }
  
  async addHealthDataConnection(connectionData: Omit<HealthDataConnection, 'id'>): Promise<HealthDataConnection> {
    const id = this.healthConnections.length > 0 ? Math.max(...this.healthConnections.map(c => c.id)) + 1 : 1;
    
    const connection: HealthDataConnection = {
      id,
      ...connectionData,
      // Ensure required fields have default values
      accessToken: connectionData.accessToken ?? null,
      refreshToken: connectionData.refreshToken ?? null,
      active: connectionData.active ?? null,
      expiresAt: connectionData.expiresAt ?? null,
      scope: connectionData.scope ?? null,
      lastSynced: connectionData.lastSynced ?? null,
      settings: connectionData.settings ?? {}
    };
    
    this.healthConnections.push(connection);
    
    // Add to ownership table
    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'health-connection',
      ownerId: connectionData.userId
    });
    
    return connection;
  }
  
  // Forum posts
  async getForumPosts(): Promise<ForumPost[]> {
    return this.forumPosts;
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.find(post => post.id === id);
  }
  
  async addForumPost(postData: Omit<ForumPost, 'id'>): Promise<ForumPost> {
    const id = this.forumPosts.length > 0 ? Math.max(...this.forumPosts.map(p => p.id)) + 1 : 1;
    const now = new Date();
    
    const post: ForumPost = {
      id,
      createdAt: now,
      updatedAt: now,
      ...postData,
      // Ensure required fields have default values
      tags: postData.tags ?? null,
      isPinned: postData.isPinned ?? null,
      isLocked: postData.isLocked ?? null,
      viewCount: postData.viewCount ?? null
    };
    
    this.forumPosts.push(post);
    
    // Add to ownership table
    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'forum-post',
      ownerId: postData.userId
    });
    
    return post;
  }
  
  // Health articles and news
  async getHealthArticles(): Promise<HealthArticle[]> {
    return this.healthArticles;
  }
  
  async getHealthArticle(id: number): Promise<HealthArticle | undefined> {
    return this.healthArticles.find(article => article.id === id);
  }
  
  async getHealthNews(): Promise<any[]> {
    // Sample news data
    return [
      {
        title: "New Study Links Zinc Levels to Immune Function",
        content: "Researchers have discovered a direct correlation between zinc levels and immune system effectiveness...",
        publishDate: new Date("2025-03-15"),
        source: "Medical Journal Weekly",
        author: "Dr. Sarah Johnson",
        url: "https://example.com/health-news/zinc-study"
      },
      {
        title: "Breakthrough in Alzheimer's Treatment Shows Promise",
        content: "A new medication targeting amyloid plaque buildup has shown significant results in early trials...",
        publishDate: new Date("2025-04-02"),
        source: "Health Science Today",
        author: "Dr. Michael Chen",
        url: "https://example.com/health-news/alzheimers-breakthrough"
      },
      {
        title: "FDA Approves New Diabetes Management Device",
        content: "The FDA has approved a revolutionary new continuous glucose monitoring system that doesn't require finger pricks...",
        publishDate: new Date("2025-04-10"),
        source: "Medical Technology Review",
        author: "Lisa Martinez, MPH",
        url: "https://example.com/health-news/diabetes-device"
      }
    ];
  }
  
  // Token management
  async getTokenById(tokenId: string): Promise<any> {
    return this.tokenMetadata.find(token => token.tokenId === tokenId);
  }
  
  async storeTokenMetadata(tokenData: any): Promise<void> {
    const id = this.tokenMetadata.length > 0 ? Math.max(...this.tokenMetadata.map(t => t.id)) + 1 : 1;
    
    this.tokenMetadata.push({
      id,
      ...tokenData,
      isRevoked: tokenData.isRevoked ?? false,
      clientInfo: tokenData.clientInfo ?? {}
    });
  }
  
  async revokeToken(tokenId: string): Promise<void> {
    const tokenIndex = this.tokenMetadata.findIndex(token => token.tokenId === tokenId);
    if (tokenIndex !== -1) {
      this.tokenMetadata[tokenIndex].isRevoked = true;
    }
  }
  
  async revokeAllUserTokens(userId: number): Promise<void> {
    this.tokenMetadata.forEach(token => {
      if (token.userId === userId) {
        token.isRevoked = true;
      }
    });
  }

  // Health Goals Management Implementation
  async createHealthGoal(goalData: InsertHealthGoal): Promise<HealthGoal> {
    const id = this.healthGoals.length > 0 ? Math.max(...this.healthGoals.map(g => g.id)) + 1 : 1;
    const newGoal: HealthGoal = {
      id,
      ...goalData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.healthGoals.push(newGoal);
    return newGoal;
  }

  async getHealthGoals(userId: number): Promise<HealthGoal[]> {
    return this.healthGoals.filter(goal => goal.userId === userId);
  }

  async getHealthGoal(goalId: number): Promise<HealthGoal | undefined> {
    return this.healthGoals.find(goal => goal.id === goalId);
  }

  async updateHealthGoal(goalId: number, updates: Partial<InsertHealthGoal>): Promise<HealthGoal | undefined> {
    const goalIndex = this.healthGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
      this.healthGoals[goalIndex] = {
        ...this.healthGoals[goalIndex],
        ...updates,
        updatedAt: new Date()
      };
      return this.healthGoals[goalIndex];
    }
    return undefined;
  }

  async deleteHealthGoal(goalId: number): Promise<boolean> {
    const goalIndex = this.healthGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex !== -1) {
      this.healthGoals.splice(goalIndex, 1);
      // Also remove associated progress entries
      this.goalProgress = this.goalProgress.filter(progress => progress.goalId !== goalId);
      return true;
    }
    return false;
  }

  // Goal Progress Management Implementation
  async addGoalProgress(progressData: InsertGoalProgress): Promise<GoalProgress> {
    const id = this.goalProgress.length > 0 ? Math.max(...this.goalProgress.map(p => p.id)) + 1 : 1;
    const newProgress: GoalProgress = {
      id,
      ...progressData,
      createdAt: new Date()
    };
    this.goalProgress.push(newProgress);
    return newProgress;
  }

  async getGoalProgress(goalId: number): Promise<GoalProgress[]> {
    return this.goalProgress.filter(progress => progress.goalId === goalId);
  }

  async getGoalProgressForPeriod(goalId: number, startDate: Date, endDate: Date): Promise<GoalProgress[]> {
    return this.goalProgress.filter(progress => 
      progress.goalId === goalId &&
      new Date(progress.date) >= startDate &&
      new Date(progress.date) <= endDate
    );
  }

  private healthGoals: HealthGoal[] = [
    {
      id: 1,
      userId: 1,
      metricType: 'sleep',
      goalType: 'minimum',
      goalValue: 7,
      unit: 'hours',
      timeframe: 'daily',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      startDate: new Date('2025-01-01'),
      endDate: null,
      notes: 'Goal to get at least 7 hours of sleep per night'
    },
    {
      id: 2,
      userId: 1,
      metricType: 'steps',
      goalType: 'target',
      goalValue: 10000,
      unit: 'steps',
      timeframe: 'daily',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      startDate: new Date('2025-01-01'),
      endDate: null,
      notes: 'Daily step goal for better cardiovascular health'
    },
    {
      id: 3,
      userId: 1,
      metricType: 'heart_rate',
      goalType: 'maximum',
      goalValue: 75,
      unit: 'bpm',
      timeframe: 'weekly',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      startDate: new Date('2025-01-01'),
      endDate: null,
      notes: 'Keep average resting heart rate under 75 bpm'
    }
  ];

  private goalProgress: GoalProgress[] = [
    {
      id: 1,
      goalId: 1,
      date: new Date('2025-01-20'),
      value: '7.5',
      achieved: true,
      notes: 'Good sleep quality',
      createdAt: new Date('2025-01-20')
    },
    {
      id: 2,
      goalId: 1,
      date: new Date('2025-01-21'),
      value: '6.8',
      achieved: false,
      notes: 'Stayed up late working',
      createdAt: new Date('2025-01-21')
    },
    {
      id: 3,
      goalId: 2,
      date: new Date('2025-01-20'),
      value: '12500',
      achieved: true,
      notes: 'Went for a long walk',
      createdAt: new Date('2025-01-20')
    },
    {
      id: 4,
      goalId: 2,
      date: new Date('2025-01-21'),
      value: '8750',
      achieved: false,
      notes: 'Mostly sedentary day',
      createdAt: new Date('2025-01-21')
    }
  ];

  async revokeToken(tokenId: string): Promise<void> {
    const token = this.tokenMetadata.find(t => t.id === tokenId);
    if (token) {
      token.isRevoked = true;
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    this.tokenMetadata.forEach(token => {
      if (token.userId === userId) {
        token.isRevoked = true;
      }
    });
  }
  
  // Resource ownership
  async getResourceOwnerId(resourceId: number, resourceType: string): Promise<number | null> {
    const ownership = this.resourceOwnership.find(
      o => o.resourceId === resourceId && o.resourceType === resourceType
    );
    return ownership ? ownership.ownerId : null;
  }
  
  async isUserAssignedToResource(userId: number, resourceId: number, resourceType: string): Promise<boolean> {
    return this.resourceAssignments.some(
      a => a.userId === userId && a.resourceId === resourceId && a.resourceType === resourceType
    );
  }
  
  // Healthcare relationships
  async hasHealthcareRelationship(providerId: number, patientId: number): Promise<boolean> {
    return this.healthcareRelationships.some(
      r => r.providerId === providerId && r.patientId === patientId
    );
  }
  
  async getHealthcareRelationships(providerId: number): Promise<any[]> {
    return this.healthcareRelationships.filter(r => r.providerId === providerId);
  }

  // Family timeline methods
  async getFamilyMembers(userId: number, familyId?: number): Promise<any[]> {
    return this.familyMembers.filter(member => 
      member.userId === userId || member.familyId === familyId
    );
  }

  async getFamilyTimelineEvents(userId: number, familyId?: number, memberId?: number, timeFilter?: string): Promise<any[]> {
    let events = this.familyTimelineEvents.filter(event => 
      event.userId === userId || event.familyId === familyId
    );

    if (memberId) {
      events = events.filter(event => event.memberId === memberId);
    }

    if (timeFilter && timeFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      switch (timeFilter) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      events = events.filter(event => new Date(event.timestamp) >= cutoffDate);
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Daily insight methods
  async addDailyInsight(insight: { userId: number; date: Date; summary: string }): Promise<void> {
    const id = this.dailyInsights.length > 0 ? Math.max(...this.dailyInsights.map(i => i.id)) + 1 : 1;
    this.dailyInsights.push({ id, userId: insight.userId, date: insight.date, summary: insight.summary, createdAt: new Date() });
  }
  async updateMealPlanEntry(id: number, entryData: Partial<MealPlanEntry>): Promise<MealPlanEntry | undefined> {
    const entry = this.mealPlanEntries.get(id);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...entryData };
    this.mealPlanEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async getDailyInsights(userId: number): Promise<{ id: number; userId: number; date: Date; summary: string; createdAt: Date }[]> {
    return this.dailyInsights.filter(i => i.userId === userId);
  }

  // Anonymized Metrics
  async getOrCreateAnonymizedProfile(userId: number): Promise<AnonymizedProfile> {
    const existing = Array.from(this.anonymizedProfiles.values()).find(p => p.userId === userId);
    if (existing) return existing;
    const id = this.anonymizedProfileIdCounter++;
    const anonProfile: AnonymizedProfile = { id, userId, anonId: crypto.randomUUID() };
    this.anonymizedProfiles.set(id, anonProfile);
    return anonProfile;
  }

  async addAnonymizedMetric(metric: InsertAnonymizedMetric): Promise<AnonymizedMetric> {
    const id = this.anonymizedMetricIdCounter++;
    const newMetric: AnonymizedMetric = { ...metric, id };
    this.anonymizedMetrics.set(id, newMetric);
    return newMetric;
  }

  // Partner Ads
  async getPartnerAds(category?: string, tag?: string): Promise<PartnerAd[]> {
    let ads = Array.from(this.partnerAds.values());
    if (category) ads = ads.filter(a => a.category === category);
    if (tag) ads = ads.filter(a => a.tags && a.tags.includes(tag));
    return ads;
  }

  async createPartnerAd(ad: InsertPartnerAd): Promise<PartnerAd> {
    const id = this.partnerAdIdCounter++;
    const newAd: PartnerAd = { ...ad, id };
    this.partnerAds.set(id, newAd);
    return newAd;
  }

  // Add-on Modules & Purchases
  async getAddOnModules(): Promise<AddOnModule[]> {
    return Array.from(this.addOnModules.values());
  }

  async getAddOnModuleById(id: number): Promise<AddOnModule | undefined> {
    return this.addOnModules.get(id);
  }

  async createAddOnModule(module: InsertAddOnModule): Promise<AddOnModule> {
    const id = this.addOnModuleIdCounter++;
    const newModule: AddOnModule = { ...module, id };
    this.addOnModules.set(id, newModule);
    return newModule;
  }

  async getUserPurchases(userId: number): Promise<UserPurchase[]> {
    return Array.from(this.userPurchases.values()).filter(p => p.userId === userId);
  }

  async createUserPurchase(purchase: InsertUserPurchase): Promise<UserPurchase> {
    const id = this.userPurchaseIdCounter++;
    const newPurchase: UserPurchase = { ...purchase, id };
    this.userPurchases.set(id, newPurchase);
    return newPurchase;
  }

  // Data Licensing
  async getDataLicenses(userId: number): Promise<DataLicense[]> {
    return Array.from(this.dataLicenses.values()).filter(dl => dl.userId === userId);
  }

  async createDataLicense(license: InsertDataLicense): Promise<DataLicense> {
    const id = this.dataLicenseIdCounter++;
    const newLicense: DataLicense = { ...license, id };
    this.dataLicenses.set(id, newLicense);
    return newLicense;
  }

  // Refresh Tokens
  async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
    const id = this.refreshTokenIdCounter++;
    const newToken: RefreshToken = { ...token, id };
    this.refreshTokens.set(token.token, newToken);
    return newToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.refreshTokens.get(token);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const existing = this.refreshTokens.get(token);
    if (existing) {
      this.refreshTokens.set(token, { ...existing, revoked: true });
    }
  }

  // Challenge Sponsorships
  async getChallengeSponsorships(challengeId?: number): Promise<ChallengeSponsorship[]> {
    let list = Array.from(this.challengeSponsorships.values());
    if (challengeId) list = list.filter(s => s.challengeId === challengeId);
    return list;
  }

  async createChallengeSponsorship(sponsorship: InsertChallengeSponsorship): Promise<ChallengeSponsorship> {
    const id = this.challengeSponsorshipIdCounter++;
    const newS: ChallengeSponsorship = { ...sponsorship, id };
    this.challengeSponsorships.set(id, newS);
    return newS;
  }

  // Sessions & Metrics
  async createSession(userId: number): Promise<UserSession> {
    const id = this.sessionIdCounter++;
    const now = new Date();
    const session: UserSession = { id, userId, createdAt: now, lastActive: now };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number): Promise<void> {
    const s = this.sessions.get(id);
    if (s) this.sessions.set(id, { ...s, lastActive: new Date() });
  }

  async getActiveSessionCount(): Promise<number> {
    return this.sessions.size;
  }

  async addMetric(metric: InsertMetric): Promise<Metric> {
    const id = this.metricIdCounter++;
    const newMetric: Metric = { ...metric, id };
    this.metrics.set(id, newMetric);
    return newMetric;
  }

  async addLog(log: InsertLog): Promise<Log> {
    const id = this.logIdCounter++;
    const newLog: Log = { ...log, id };
    this.logs.set(id, newLog);
    return newLog;
  }

  async getActionCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const m of this.metrics.values()) {
      counts[m.actionType] = (counts[m.actionType] || 0) + 1;
    }
    return counts;
  }
}

// Export the storage implementation
export const storage = new MemStorage();