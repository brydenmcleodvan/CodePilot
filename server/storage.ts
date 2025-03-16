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
  mealPlans,
  mealPlanEntries,
  type User,
  type InsertUser,
  type HealthStat,
  type InsertHealthStat,
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
  type MealPlan,
  type InsertMealPlan,
  type MealPlanEntry,
  type InsertMealPlanEntry
} from "@shared/schema";
import bcrypt from "bcryptjs";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Health Stats
  getUserHealthStats(userId: number): Promise<HealthStat[]>;
  addHealthStat(stat: InsertHealthStat): Promise<HealthStat>;
  
  // Medications
  getUserMedications(userId: number): Promise<Medication[]>;
  addMedication(medication: InsertMedication): Promise<Medication>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  markMedicationTaken(userId: number, medicationId: number): Promise<Medication | undefined>;
  updateMedication(id: number, medicationData: Partial<Medication>): Promise<Medication | undefined>;
  
  // Medication History
  getMedicationHistory(medicationId: number): Promise<MedicationHistory[]>;
  getUserMedicationHistory(userId: number): Promise<MedicationHistory[]>;
  addMedicationHistory(entry: InsertMedicationHistory): Promise<MedicationHistory>;
  getMedicationAdherenceRate(medicationId: number): Promise<number>; // Returns percentage of medication taken on time

  // Connections
  getUserConnections(userId: number): Promise<{ connection: User, relationship: string, specific: string }[]>;
  addConnection(connection: InsertConnection): Promise<Connection>;
  removeConnection(userId: number, connectionId: number): Promise<boolean>;

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
  
  // Symptom Checks
  getUserSymptomChecks(userId: number): Promise<SymptomCheck[]>;
  getSymptomCheckById(id: number): Promise<SymptomCheck | undefined>;
  createSymptomCheck(check: InsertSymptomCheck): Promise<SymptomCheck>;
  
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
  
  // Health Journey Tracking
  getUserHealthJourneyEntries(userId: number): Promise<HealthJourneyEntry[]>;
  getHealthJourneyEntryById(id: number): Promise<HealthJourneyEntry | undefined>;
  createHealthJourneyEntry(entry: InsertHealthJourneyEntry): Promise<HealthJourneyEntry>;
  updateHealthJourneyEntry(id: number, entryData: Partial<HealthJourneyEntry>): Promise<HealthJourneyEntry | undefined>;
  
  // Health Coaching
  getUserHealthCoachingPlans(userId: number): Promise<HealthCoachingPlan[]>;
  getHealthCoachingPlanById(id: number): Promise<HealthCoachingPlan | undefined>;
  createHealthCoachingPlan(plan: InsertHealthCoachingPlan): Promise<HealthCoachingPlan>;
  updateHealthCoachingPlan(id: number, planData: Partial<HealthCoachingPlan>): Promise<HealthCoachingPlan | undefined>;
  
  // Wellness Challenges & Gamification
  getWellnessChallenges(category?: string): Promise<WellnessChallenge[]>;
  getWellnessChallengeById(id: number): Promise<WellnessChallenge | undefined>;
  createWellnessChallenge(challenge: InsertWellnessChallenge): Promise<WellnessChallenge>;
  
  // User Challenge Progress
  getUserChallengeProgresses(userId: number): Promise<(UserChallengeProgress & { challenge: WellnessChallenge })[]>;
  getUserChallengeProgressById(id: number): Promise<UserChallengeProgress | undefined>;
  createUserChallengeProgress(progress: InsertUserChallengeProgress): Promise<UserChallengeProgress>;
  updateUserChallengeProgress(id: number, progressData: Partial<UserChallengeProgress>): Promise<UserChallengeProgress | undefined>;
  
  // Mental Health Integration
  getUserMentalHealthAssessments(userId: number): Promise<MentalHealthAssessment[]>;
  getMentalHealthAssessmentById(id: number): Promise<MentalHealthAssessment | undefined>;
  createMentalHealthAssessment(assessment: InsertMentalHealthAssessment): Promise<MentalHealthAssessment>;
  
  // Mood Tracking
  getUserMoodEntries(userId: number): Promise<MoodEntry[]>;
  getMoodEntryById(id: number): Promise<MoodEntry | undefined>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  updateMoodEntry(id: number, entryData: Partial<MoodEntry>): Promise<MoodEntry | undefined>;
  deleteMoodEntry(id: number): Promise<boolean>;
  
  // Health Library
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthStats: Map<number, HealthStat>;
  private medications: Map<number, Medication>;
  private medicationHistories: Map<number, MedicationHistory>;
  private connections: Map<number, Connection>;
  private forumPosts: Map<number, ForumPost>;
  private newsUpdates: Map<number, NewsUpdate>;
  private products: Map<number, Product>;
  private symptoms: Map<number, Symptom>;
  private symptomChecks: Map<number, SymptomCheck>;
  private appointments: Map<number, Appointment>;
  private healthDataConnections: Map<number, HealthDataConnection>;
  private healthJourneyEntries: Map<number, HealthJourneyEntry>;
  private healthCoachingPlans: Map<number, HealthCoachingPlan>;
  private wellnessChallenges: Map<number, WellnessChallenge>;
  private userChallengeProgresses: Map<number, UserChallengeProgress>;
  private mentalHealthAssessments: Map<number, MentalHealthAssessment>;
  private moodEntries: Map<number, MoodEntry>;
  private healthArticles: Map<number, HealthArticle>;
  private mealPlans: Map<number, MealPlan>;
  private mealPlanEntries: Map<number, MealPlanEntry>;

  private userIdCounter: number;
  private healthStatIdCounter: number;
  private medicationIdCounter: number;
  private medicationHistoryIdCounter: number;
  private connectionIdCounter: number;
  private forumPostIdCounter: number;
  private newsUpdateIdCounter: number;
  private productIdCounter: number;
  private symptomIdCounter: number;
  private symptomCheckIdCounter: number;
  private appointmentIdCounter: number;
  private healthDataConnectionIdCounter: number;
  private healthJourneyEntryIdCounter: number;
  private healthCoachingPlanIdCounter: number;
  private wellnessChallengeIdCounter: number;
  private userChallengeProgressIdCounter: number;
  private mentalHealthAssessmentIdCounter: number;
  private moodEntryIdCounter: number;
  private healthArticleIdCounter: number;
  private mealPlanIdCounter: number;
  private mealPlanEntryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.healthStats = new Map();
    this.medications = new Map();
    this.medicationHistories = new Map();
    this.connections = new Map();
    this.forumPosts = new Map();
    this.newsUpdates = new Map();
    this.products = new Map();
    this.symptoms = new Map();
    this.symptomChecks = new Map();
    this.appointments = new Map();
    this.healthDataConnections = new Map();
    this.healthJourneyEntries = new Map();
    this.healthCoachingPlans = new Map();
    this.wellnessChallenges = new Map();
    this.userChallengeProgresses = new Map();
    this.mentalHealthAssessments = new Map();
    this.moodEntries = new Map();
    this.healthArticles = new Map();
    this.mealPlans = new Map();
    this.mealPlanEntries = new Map();

    this.userIdCounter = 1;
    this.healthStatIdCounter = 1;
    this.medicationIdCounter = 1;
    this.medicationHistoryIdCounter = 1;
    this.connectionIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.newsUpdateIdCounter = 1;
    this.productIdCounter = 1;
    this.symptomIdCounter = 1;
    this.symptomCheckIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.healthDataConnectionIdCounter = 1;
    this.healthJourneyEntryIdCounter = 1;
    this.healthCoachingPlanIdCounter = 1;
    this.wellnessChallengeIdCounter = 1;
    this.userChallengeProgressIdCounter = 1;
    this.mentalHealthAssessmentIdCounter = 1;
    this.moodEntryIdCounter = 1;
    this.healthArticleIdCounter = 1;
    this.mealPlanIdCounter = 1;
    this.mealPlanEntryIdCounter = 1;

    // Add some initial data
    this.initializeData();
  }

  private async initializeData() {
    // Create some initial users
    const user1 = await this.createUser({
      username: "johndoe",
      password: await bcrypt.hash("password123", 10),
      email: "john.doe@example.com",
      name: "John Doe",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      healthData: JSON.stringify({})
    });

    // Add health stats
    await this.addHealthStat({
      userId: 1,
      statType: "heart_rate",
      value: "72",
      unit: "bpm",
      icon: "ri-heart-pulse-line",
      colorScheme: "primary",
      timestamp: new Date()
    });

    await this.addHealthStat({
      userId: 1,
      statType: "sleep_quality",
      value: "7.8",
      unit: "hrs",
      icon: "ri-zzz-line",
      colorScheme: "warning",
      timestamp: new Date()
    });

    await this.addHealthStat({
      userId: 1,
      statType: "nutrient_status",
      value: "Zinc Deficient",
      icon: "ri-capsule-line",
      colorScheme: "accent",
      timestamp: new Date()
    });
    
    // Add sample medications
    const now = new Date();
    const tomorrowMorning = new Date(now);
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(8, 0, 0, 0);
    
    const eveningTime = new Date(now);
    eveningTime.setHours(20, 0, 0, 0);
    if (eveningTime < now) {
      eveningTime.setDate(eveningTime.getDate() + 1);
    }
    
    await this.addMedication({
      userId: 1,
      name: "Zinc Supplement",
      dosage: "50mg",
      schedule: "Every morning",
      nextDose: tomorrowMorning,
      lastTaken: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
      instructions: "Take with food",
      active: true
    });
    
    await this.addMedication({
      userId: 1,
      name: "Vitamin D3",
      dosage: "2000 IU",
      schedule: "Daily",
      nextDose: tomorrowMorning,
      lastTaken: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
      instructions: "Take with breakfast",
      active: true
    });
    
    await this.addMedication({
      userId: 1,
      name: "Magnesium Glycinate",
      dosage: "200mg",
      schedule: "Every evening",
      nextDose: eveningTime,
      lastTaken: null,
      instructions: "Take 1 hour before bedtime",
      active: true
    });

    // Add news updates
    await this.createNewsUpdate({
      title: "New Study Links Zinc Levels to Immune Function",
      content: "Recent research shows strong correlation between zinc levels and overall immune system performance in adults.",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Nutrition",
      timestamp: new Date()
    });

    await this.createNewsUpdate({
      title: "The Connection Between Sleep and Mental Wellbeing",
      content: "Experts highlight how quality sleep directly impacts mental health and cognitive function.",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Mental Health",
      timestamp: new Date()
    });

    await this.createNewsUpdate({
      title: "How Genetics Influence Exercise Results",
      content: "New research reveals how genetic factors may explain varying results from identical exercise routines.",
      thumbnail: "https://images.unsplash.com/photo-1579126038374-6064e9370f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      category: "Fitness",
      timestamp: new Date()
    });

    // Add products
    await this.createProduct({
      name: "Zinc Complex",
      description: "High-absorption zinc supplement with copper to support immune function.",
      price: "$24.99",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Supplements",
      tags: ["zinc", "immune", "recommended"],
      recommendedFor: ["zinc_deficiency"]
    });

    await this.createProduct({
      name: "Complete Multivitamin",
      description: "All-in-one vitamin formula with extra zinc for comprehensive support.",
      price: "$32.99",
      image: "https://images.unsplash.com/photo-1565071559227-20ab25b7685e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Supplements",
      tags: ["multivitamin", "zinc", "recommended"],
      recommendedFor: ["zinc_deficiency", "general_health"]
    });

    await this.createProduct({
      name: "Immune Defense",
      description: "Comprehensive immune support with zinc, vitamin C, and elderberry.",
      price: "$29.99",
      image: "https://images.unsplash.com/photo-1584362917137-56406a73241c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Supplements",
      tags: ["immune", "zinc", "vitamin c", "popular"],
      recommendedFor: ["immune_support", "zinc_deficiency"]
    });

    await this.createProduct({
      name: "Zinc-Rich Foods Guide",
      description: "Comprehensive guide to incorporating zinc-rich foods into your diet.",
      price: "$12.99",
      image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      category: "Books",
      tags: ["zinc", "food guide", "nutrition"],
      recommendedFor: ["zinc_deficiency", "nutrition_education"]
    });

    // Add forum posts
    await this.createForumPost({
      userId: 1,
      title: "Best food sources for zinc that aren't seafood or red meat?",
      content: "I recently found out I'm zinc deficient but I don't eat seafood or red meat. Looking for plant-based options that can help increase my zinc levels. Any advice appreciated!",
      subreddit: "Nutrition",
      upvotes: 128,
      downvotes: 5,
      tags: ["Zinc", "Plant-based", "Deficiency"],
      timestamp: new Date()
    });

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
    
    // Add sample symptoms
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
    
    // Add sample symptom check for the user
    await this.createSymptomCheck({
      userId: 1,
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      reportedSymptoms: ["Headache", "Fatigue"],
      preliminaryAssessment: "Possible dehydration or stress-related symptoms",
      recommendedActions: ["Increase water intake", "Rest", "Over-the-counter pain relievers if needed"],
      severity: "routine",
      notes: "Symptoms appeared after long work session with limited water intake"
    });
    
    // Add sample appointments
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
    
    // Add health data connection
    await this.createHealthDataConnection({
      userId: 1,
      provider: "apple_health",
      connected: false,
      lastSynced: null,
      accessToken: null,
      refreshToken: null,
      scope: ["activity", "heart_rate", "sleep"],
      expiresAt: null
    });
    
    // Add health journey entries
    await this.createHealthJourneyEntry({
      userId: 1,
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      category: "nutrition",
      title: "Started Zinc Supplements",
      description: "Started taking zinc supplements to improve my immune function after recent blood tests showed deficiency.",
      metrics: JSON.stringify({
        "supplement": "Zinc",
        "dosage": "50mg",
        "frequency": "daily"
      }),
      mediaUrl: null,
      sentiment: "positive"
    });

    await this.createHealthJourneyEntry({
      userId: 1,
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      category: "exercise",
      title: "Increased daily steps goal",
      description: "Increased my daily step goal from 8,000 to 10,000 steps. Feeling more energetic lately.",
      metrics: JSON.stringify({
        "previous_goal": 8000,
        "new_goal": 10000,
        "current_average": 7500
      }),
      mediaUrl: null,
      sentiment: "positive"
    });
    
    // Add a health coaching plan
    await this.createHealthCoachingPlan({
      userId: 1,
      title: "Zinc Deficiency Improvement Plan",
      description: "A personalized plan to address your zinc deficiency and boost your immune system",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
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
    
    // Add wellness challenges
    const walkingChallenge = await this.createWellnessChallenge({
      title: "10K Steps Challenge",
      description: "Walk at least 10,000 steps every day for 30 days to boost cardiovascular health and energy levels",
      category: "fitness",
      pointsReward: 500,
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // Started 15 days ago
      endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // Ends in 15 days
      requirementType: "steps",
      requirementTarget: 10000,
      image: "https://images.unsplash.com/photo-1510021115607-c94b84bcb73a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    });
    
    // Add user's progress in challenge
    await this.createUserChallengeProgress({
      userId: 1,
      challengeId: walkingChallenge.id,
      joined: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Joined 10 days ago
      currentProgress: 7500, // Average 7500 steps so far
      completed: false,
      completedAt: null
    });
    
    // Add mental health assessment
    await this.createMentalHealthAssessment({
      userId: 1,
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      assessmentType: "stress",
      score: 7, // Scale of 1-10
      notes: "Feeling moderately stressed due to work deadlines and health concerns",
      recommendations: [
        "Practice mindfulness meditation for 10 minutes daily",
        "Take short breaks during work hours",
        "Prioritize 7-8 hours of sleep",
        "Consider speaking with a mental health professional if stress persists"
      ]
    });
    
    // Add mood entries
    await this.createMoodEntry({
      userId: 1,
      date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      mood: 6,
      energy: 5,
      sleep: 6.5,
      categories: ["work", "health"],
      notes: "Feeling tired after a long day at work. Stress about upcoming health appointment.",
      factors: ["work stress", "health issue"]
    });
    
    await this.createMoodEntry({
      userId: 1,
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      mood: 8,
      energy: 7,
      sleep: 7.5,
      categories: ["personal", "social"],
      notes: "Had a good night's sleep and spent time with friends. Feeling much better.",
      factors: ["good sleep", "social connection", "relaxation"]
    });
    
    await this.createMoodEntry({
      userId: 1,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      mood: 7,
      energy: 8,
      sleep: 8,
      categories: ["personal", "health"],
      notes: "Started morning with exercise and took zinc supplement. Feeling energized.",
      factors: ["exercise", "nutrition"]
    });
    
    // Add health articles
    await this.createHealthArticle({
      title: "Understanding Zinc's Role in Immune Function",
      summary: "A comprehensive guide to how zinc affects your immune system and what deficiency means for your health",
      content: "Zinc is an essential micronutrient that plays a vital role in immune function, protein synthesis, wound healing, DNA synthesis, and cell division. Although the body does not naturally produce zinc, this essential nutrient is readily available in many food sources and supplements.\n\nResearch has consistently shown that zinc is critical for normal development and function of cells mediating innate immunity, neutrophils, and natural killer cells. It also affects the development of acquired immunity, particularly T-lymphocyte function.\n\nZinc deficiency, even mild to moderate, can impair immune function, making the body more susceptible to infections. Studies have found that zinc supplementation can reduce the duration and severity of common colds and other respiratory infections.\n\nGood dietary sources of zinc include oysters, red meat, poultry, beans, nuts, and fortified cereals. For those with deficiencies, supplements may be necessary, but should be taken under medical supervision as excessive zinc can interfere with the absorption of other essential minerals.\n\nIf you're experiencing symptoms such as frequent infections, slow wound healing, loss of taste or smell, or unexplained fatigue, consider having your zinc levels tested.",
      authorName: "Dr. Emily Chen, PhD",
      publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      category: "Nutrition",
      tags: ["zinc", "immunity", "nutrition", "micronutrients"],
      imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      sourceName: "Journal of Nutritional Science",
      sourceUrl: "https://example.com/jns/zinc-immune-function",
      readTime: 8 // minutes
    });
    
    // Add meal plan
    const mealPlan = await this.createMealPlan({
      userId: 1,
      title: "Zinc-Rich Diet Plan",
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      dietaryPreferences: ["balanced", "omnivore"],
      healthGoals: ["increase zinc intake", "boost immunity"],
      allergies: ["shellfish"],
      active: true
    });
    
    // Add meal plan entries
    await this.createMealPlanEntry({
      mealPlanId: mealPlan.id,
      dayOfWeek: 1, // Monday
      mealType: "breakfast",
      name: "Pumpkin Seed Oatmeal",
      recipe: "Combine 1/2 cup rolled oats with 1 cup milk, cook for 5 minutes. Top with 2 tbsp pumpkin seeds, 1 tbsp honey, and cinnamon.",
      ingredients: ["rolled oats", "milk", "pumpkin seeds", "honey", "cinnamon"],
      nutritionalInfo: JSON.stringify({
        "calories": 380,
        "protein": 15,
        "carbs": 48,
        "fat": 16,
        "zinc": "3.5mg (32% DV)"
      }),
      preparationTime: 10,
      imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    });
    
    await this.createMealPlanEntry({
      mealPlanId: mealPlan.id,
      dayOfWeek: 1, // Monday
      mealType: "lunch",
      name: "Beef and Spinach Salad",
      recipe: "Grill 4oz lean beef steak. Slice and serve over 2 cups spinach, 1/4 cup chickpeas, cherry tomatoes, and cucumber with balsamic vinaigrette.",
      ingredients: ["lean beef", "spinach", "chickpeas", "cherry tomatoes", "cucumber", "balsamic vinaigrette"],
      nutritionalInfo: JSON.stringify({
        "calories": 420,
        "protein": 35,
        "carbs": 22,
        "fat": 23,
        "zinc": "6.2mg (56% DV)"
      }),
      preparationTime: 20,
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
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
    return newStat;
  }
  
  // Medications
  async getUserMedications(userId: number): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(
      (medication) => medication.userId === userId && medication.active
    );
  }
  
  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }
  
  async addMedication(medication: InsertMedication): Promise<Medication> {
    const id = this.medicationIdCounter++;
    const newMedication: Medication = { ...medication, id };
    this.medications.set(id, newMedication);
    return newMedication;
  }
  
  async updateMedication(id: number, medicationData: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;
    
    const updatedMedication = { ...medication, ...medicationData };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async markMedicationTaken(userId: number, medicationId: number): Promise<Medication | undefined> {
    const medication = this.medications.get(medicationId);
    if (!medication || medication.userId !== userId) return undefined;
    
    const now = new Date();
    // Calculate next dose time based on schedule
    let nextDose: Date | null = null;
    
    if (medication.schedule.includes('daily')) {
      nextDose = new Date(now);
      nextDose.setDate(nextDose.getDate() + 1);
    } else if (medication.schedule.includes('twice daily')) {
      nextDose = new Date(now);
      nextDose.setHours(nextDose.getHours() + 12);
    } else if (medication.schedule.includes('weekly')) {
      nextDose = new Date(now);
      nextDose.setDate(nextDose.getDate() + 7);
    } else {
      // Default to next day if schedule is not recognized
      nextDose = new Date(now);
      nextDose.setDate(nextDose.getDate() + 1);
    }
    
    // Calculate if it was taken on time
    const onTime = medication.nextDose ? 
      Math.abs(now.getTime() - medication.nextDose.getTime()) < 2 * 60 * 60 * 1000 : // Within 2 hours
      true;
    
    // Add to medication history
    this.addMedicationHistory({
      medicationId,
      userId,
      takenAt: now,
      scheduled: medication.nextDose || null,
      skipped: false,
      note: onTime ? "Taken on time" : "Taken late"
    });
    
    // Update medication total taken counter
    const totalTaken = (medication.totalTaken || 0) + 1;
    
    const updatedMedication: Medication = {
      ...medication,
      lastTaken: now,
      nextDose,
      totalTaken
    };
    
    this.medications.set(medicationId, updatedMedication);
    return updatedMedication;
  }
  
  // Medication History Methods
  async getMedicationHistory(medicationId: number): Promise<MedicationHistory[]> {
    return Array.from(this.medicationHistories.values())
      .filter(history => history.medicationId === medicationId)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
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
    
    // Count entries that were taken on time (not skipped and taken within 2 hours of scheduled time)
    const takenOnTime = history.filter(entry => {
      if (entry.skipped) return false;
      if (!entry.scheduled) return true; // If no scheduled time, count as on time
      
      const scheduledTime = new Date(entry.scheduled).getTime();
      const takenTime = new Date(entry.takenAt).getTime();
      const timeDiff = Math.abs(takenTime - scheduledTime);
      
      // Consider "on time" if within 2 hours of scheduled time
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

  // Forum Posts
  async getForumPosts(subreddit?: string): Promise<ForumPost[]> {
    let posts = Array.from(this.forumPosts.values());
    
    if (subreddit) {
      posts = posts.filter(post => post.subreddit === subreddit);
    }
    
    // Sort by newest first
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

  // News & Updates
  async getNewsUpdates(limit?: number, category?: string): Promise<NewsUpdate[]> {
    let updates = Array.from(this.newsUpdates.values());
    
    if (category) {
      updates = updates.filter(update => update.category === category);
    }
    
    // Sort by newest first
    updates = updates.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (limit && limit > 0) {
      updates = updates.slice(0, limit);
    }
    
    return updates;
  }

  async createNewsUpdate(update: InsertNewsUpdate): Promise<NewsUpdate> {
    const id = this.newsUpdateIdCounter++;
    const newUpdate: NewsUpdate = { ...update, id };
    this.newsUpdates.set(id, newUpdate);
    return newUpdate;
  }

  // Products
  async getProducts(category?: string, recommendedFor?: string[]): Promise<Product[]> {
    let productList = Array.from(this.products.values());
    
    if (category) {
      productList = productList.filter(product => product.category === category);
    }
    
    if (recommendedFor && recommendedFor.length > 0) {
      productList = productList.filter(product => 
        product.recommendedFor && 
        recommendedFor.some(tag => product.recommendedFor.includes(tag))
      );
    }
    
    return productList;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Symptom Checker Methods
  async getSymptoms(bodyArea?: string, severity?: string): Promise<Symptom[]> {
    let symptoms = Array.from(this.symptoms.values());
    
    if (bodyArea) {
      symptoms = symptoms.filter(symptom => symptom.bodyArea === bodyArea);
    }
    
    if (severity) {
      symptoms = symptoms.filter(symptom => symptom.severity === severity);
    }
    
    return symptoms;
  }
  
  async getSymptomById(id: number): Promise<Symptom | undefined> {
    return this.symptoms.get(id);
  }
  
  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const id = this.symptomIdCounter++;
    const newSymptom: Symptom = { ...symptom, id };
    this.symptoms.set(id, newSymptom);
    return newSymptom;
  }
  
  // Symptom Checks Methods
  async getUserSymptomChecks(userId: number): Promise<SymptomCheck[]> {
    return Array.from(this.symptomChecks.values())
      .filter(check => check.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getSymptomCheckById(id: number): Promise<SymptomCheck | undefined> {
    return this.symptomChecks.get(id);
  }
  
  async createSymptomCheck(check: InsertSymptomCheck): Promise<SymptomCheck> {
    const id = this.symptomCheckIdCounter++;
    const newCheck: SymptomCheck = { ...check, id };
    this.symptomChecks.set(id, newCheck);
    return newCheck;
  }
  
  // Appointment Methods
  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
  
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Health Data Connection Methods
  async getUserHealthDataConnections(userId: number): Promise<HealthDataConnection[]> {
    return Array.from(this.healthDataConnections.values())
      .filter(connection => connection.userId === userId);
  }
  
  async getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined> {
    return this.healthDataConnections.get(id);
  }
  
  async createHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection> {
    const id = this.healthDataConnectionIdCounter++;
    const newConnection: HealthDataConnection = { ...connection, id };
    this.healthDataConnections.set(id, newConnection);
    return newConnection;
  }
  
  async updateHealthDataConnection(id: number, connectionData: Partial<HealthDataConnection>): Promise<HealthDataConnection | undefined> {
    const connection = this.healthDataConnections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...connectionData };
    this.healthDataConnections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  // Health Journey Entries
  async getUserHealthJourneyEntries(userId: number): Promise<HealthJourneyEntry[]> {
    return Array.from(this.healthJourneyEntries.values()).filter(
      (entry) => entry.userId === userId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getHealthJourneyEntryById(id: number): Promise<HealthJourneyEntry | undefined> {
    return this.healthJourneyEntries.get(id);
  }
  
  async createHealthJourneyEntry(entry: InsertHealthJourneyEntry): Promise<HealthJourneyEntry> {
    const id = this.healthJourneyEntryIdCounter++;
    const newEntry: HealthJourneyEntry = { ...entry, id };
    this.healthJourneyEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateHealthJourneyEntry(id: number, entryData: Partial<HealthJourneyEntry>): Promise<HealthJourneyEntry | undefined> {
    const entry = this.healthJourneyEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryData };
    this.healthJourneyEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  // Health Coaching Plans
  async getUserHealthCoachingPlans(userId: number): Promise<HealthCoachingPlan[]> {
    return Array.from(this.healthCoachingPlans.values()).filter(
      (plan) => plan.userId === userId
    ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async getHealthCoachingPlanById(id: number): Promise<HealthCoachingPlan | undefined> {
    return this.healthCoachingPlans.get(id);
  }
  
  async createHealthCoachingPlan(plan: InsertHealthCoachingPlan): Promise<HealthCoachingPlan> {
    const id = this.healthCoachingPlanIdCounter++;
    const newPlan: HealthCoachingPlan = { ...plan, id };
    this.healthCoachingPlans.set(id, newPlan);
    return newPlan;
  }
  
  async updateHealthCoachingPlan(id: number, planData: Partial<HealthCoachingPlan>): Promise<HealthCoachingPlan | undefined> {
    const plan = this.healthCoachingPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...planData, updatedAt: new Date() };
    this.healthCoachingPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // Wellness Challenges
  async getWellnessChallenges(category?: string): Promise<WellnessChallenge[]> {
    let challenges = Array.from(this.wellnessChallenges.values());
    
    // Filter by category if provided
    if (category) {
      challenges = challenges.filter(challenge => challenge.category === category);
    }
    
    // Sort by start date (newest first)
    return challenges.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }
  
  async getWellnessChallengeById(id: number): Promise<WellnessChallenge | undefined> {
    return this.wellnessChallenges.get(id);
  }
  
  async createWellnessChallenge(challenge: InsertWellnessChallenge): Promise<WellnessChallenge> {
    const id = this.wellnessChallengeIdCounter++;
    const newChallenge: WellnessChallenge = { ...challenge, id };
    this.wellnessChallenges.set(id, newChallenge);
    return newChallenge;
  }
  
  // User Challenge Progress
  async getUserChallengeProgresses(userId: number): Promise<(UserChallengeProgress & { challenge: WellnessChallenge })[]> {
    const progresses = Array.from(this.userChallengeProgresses.values())
      .filter(progress => progress.userId === userId);
    
    // Join with challenge data
    return progresses.map(progress => {
      const challenge = this.wellnessChallenges.get(progress.challengeId);
      if (!challenge) {
        throw new Error(`Challenge not found: ${progress.challengeId}`);
      }
      return { ...progress, challenge };
    });
  }
  
  async getUserChallengeProgressById(id: number): Promise<UserChallengeProgress | undefined> {
    return this.userChallengeProgresses.get(id);
  }
  
  async createUserChallengeProgress(progress: InsertUserChallengeProgress): Promise<UserChallengeProgress> {
    const id = this.userChallengeProgressIdCounter++;
    const newProgress: UserChallengeProgress = { ...progress, id };
    this.userChallengeProgresses.set(id, newProgress);
    return newProgress;
  }
  
  async updateUserChallengeProgress(id: number, progressData: Partial<UserChallengeProgress>): Promise<UserChallengeProgress | undefined> {
    const progress = this.userChallengeProgresses.get(id);
    if (!progress) return undefined;
    
    // Check if challenge is completed
    let updatedProgress = { ...progress, ...progressData };
    
    // If currentProgress meets or exceeds the challenge target, mark as completed
    if (progressData.currentProgress !== undefined) {
      const challenge = this.wellnessChallenges.get(progress.challengeId);
      if (challenge && progressData.currentProgress >= challenge.requirementTarget && !progress.completed) {
        updatedProgress = { 
          ...updatedProgress, 
          completed: true,
          completedAt: new Date()
        };
      }
    }
    
    this.userChallengeProgresses.set(id, updatedProgress);
    return updatedProgress;
  }
  
  // Mental Health Integration
  async getUserMentalHealthAssessments(userId: number): Promise<MentalHealthAssessment[]> {
    return Array.from(this.mentalHealthAssessments.values())
      .filter(assessment => assessment.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getMentalHealthAssessmentById(id: number): Promise<MentalHealthAssessment | undefined> {
    return this.mentalHealthAssessments.get(id);
  }
  
  async createMentalHealthAssessment(assessment: InsertMentalHealthAssessment): Promise<MentalHealthAssessment> {
    const id = this.mentalHealthAssessmentIdCounter++;
    const newAssessment: MentalHealthAssessment = { ...assessment, id };
    this.mentalHealthAssessments.set(id, newAssessment);
    return newAssessment;
  }

  // Mood Entry methods
  async getUserMoodEntries(userId: number): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values()).filter(entry => entry.userId === userId);
  }

  async getMoodEntryById(id: number): Promise<MoodEntry | undefined> {
    return this.moodEntries.get(id);
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.moodEntryIdCounter++;
    const newEntry: MoodEntry = { ...entry, id };
    this.moodEntries.set(id, newEntry);
    return newEntry;
  }

  async updateMoodEntry(id: number, entryData: Partial<MoodEntry>): Promise<MoodEntry | undefined> {
    const entry = this.moodEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry: MoodEntry = { ...entry, ...entryData };
    this.moodEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteMoodEntry(id: number): Promise<boolean> {
    return this.moodEntries.delete(id);
  }
  
  // Health Library
  async getHealthArticles(category?: string, tags?: string[]): Promise<HealthArticle[]> {
    let articles = Array.from(this.healthArticles.values());
    
    // Filter by category if provided
    if (category) {
      articles = articles.filter(article => article.category === category);
    }
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      articles = articles.filter(article => 
        article.tags && tags.some(tag => article.tags?.includes(tag))
      );
    }
    
    // Sort by published date (newest first)
    return articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }
  
  async getHealthArticleById(id: number): Promise<HealthArticle | undefined> {
    return this.healthArticles.get(id);
  }
  
  async createHealthArticle(article: InsertHealthArticle): Promise<HealthArticle> {
    const id = this.healthArticleIdCounter++;
    const newArticle: HealthArticle = { ...article, id };
    this.healthArticles.set(id, newArticle);
    return newArticle;
  }
  
  // Meal Planning
  async getUserMealPlans(userId: number): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values())
      .filter(plan => plan.userId === userId && plan.active)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getMealPlanById(id: number): Promise<MealPlan | undefined> {
    return this.mealPlans.get(id);
  }
  
  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    const id = this.mealPlanIdCounter++;
    const newPlan: MealPlan = { ...plan, id };
    this.mealPlans.set(id, newPlan);
    return newPlan;
  }
  
  async updateMealPlan(id: number, planData: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const plan = this.mealPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...planData };
    this.mealPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // Meal Plan Entries
  async getMealPlanEntries(mealPlanId: number): Promise<MealPlanEntry[]> {
    return Array.from(this.mealPlanEntries.values())
      .filter(entry => entry.mealPlanId === mealPlanId)
      .sort((a, b) => {
        // Sort by day of week, then by meal type
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        
        // Custom order for meal types
        const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        const aOrder = mealOrder[a.mealType as keyof typeof mealOrder] || 999;
        const bOrder = mealOrder[b.mealType as keyof typeof mealOrder] || 999;
        return aOrder - bOrder;
      });
  }
  
  async getMealPlanEntryById(id: number): Promise<MealPlanEntry | undefined> {
    return this.mealPlanEntries.get(id);
  }
  
  async createMealPlanEntry(entry: InsertMealPlanEntry): Promise<MealPlanEntry> {
    const id = this.mealPlanEntryIdCounter++;
    const newEntry: MealPlanEntry = { ...entry, id };
    this.mealPlanEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateMealPlanEntry(id: number, entryData: Partial<MealPlanEntry>): Promise<MealPlanEntry | undefined> {
    const entry = this.mealPlanEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryData };
    this.mealPlanEntries.set(id, updatedEntry);
    return updatedEntry;
  }
}

export const storage = new MemStorage();
