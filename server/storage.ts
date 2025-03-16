import {
  users,
  healthStats,
  medications,
  medicationHistory,
  connections,
  forumPosts,
  newsUpdates,
  products,
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
  type InsertProduct
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

  constructor() {
    this.users = new Map();
    this.healthStats = new Map();
    this.medications = new Map();
    this.medicationHistories = new Map();
    this.connections = new Map();
    this.forumPosts = new Map();
    this.newsUpdates = new Map();
    this.products = new Map();

    this.userIdCounter = 1;
    this.healthStatIdCounter = 1;
    this.medicationIdCounter = 1;
    this.medicationHistoryIdCounter = 1;
    this.connectionIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.newsUpdateIdCounter = 1;
    this.productIdCounter = 1;

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
      image: "https://images.unsplash.com/photo-1622587034624-6f2ba1af11b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
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
}

export const storage = new MemStorage();
