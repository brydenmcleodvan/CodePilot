import { IStorage } from './storage-interface';
import { 
  User, InsertUser, 
  ForumPost, InsertForumPost,
  HealthArticle, InsertHealthArticle
} from '@shared/schema';

import {
  HealthMetric, InsertHealthMetric,
  Medication, InsertMedication,
  Symptom, InsertSymptom, 
  Appointment, InsertAppointment,
  HealthDataConnection, InsertHealthDataConnection,
  TokenMetadata, InsertTokenMetadata,
  UserRelationship, InsertUserRelationship,
  HealthcareRelationship, InsertHealthcareRelationship,
  UserRole, InsertUserRole,
  ResourceOwnership, InsertResourceOwnership,
  ResourceAssignment, InsertResourceAssignment
} from '@shared/health-schema';

import {
  HealthNews, InsertHealthNews,
  UserEvent, InsertUserEvent,
  UserFeedback, InsertUserFeedback,
  ErrorLog, InsertErrorLog
} from '@shared/schema-analytics';

/**
 * In-memory storage implementation
 */
export class MemStorage implements IStorage {
  private users: User[] = [];
  private posts: ForumPost[] = [];
  private healthMetrics: HealthMetric[] = [];
  private medications: Medication[] = [];
  private symptoms: Symptom[] = [];
  private appointments: Appointment[] = [];
  private healthDataConnections: HealthDataConnection[] = [];
  private tokenMetadata: TokenMetadata[] = [];
  private userRelationships: UserRelationship[] = [];
  private healthcareRelationships: HealthcareRelationship[] = [];
  private userRoles: UserRole[] = [];
  private resourceOwnership: ResourceOwnership[] = [];
  private resourceAssignments: ResourceAssignment[] = [];
  private healthNews: HealthNews[] = [];
  private userEvents: UserEvent[] = [];
  private userFeedback: UserFeedback[] = [];
  private errorLogs: ErrorLog[] = [];
  private healthArticles: HealthArticle[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some sample data
    this.healthNews = [
      {
        id: 1,
        title: "New Study Links Zinc Levels to Immune Function",
        content: "A recent study published in the Journal of Nutritional Science has found a strong correlation between zinc levels and immune system response in adults over 50.",
        publishDate: new Date("2025-05-01"),
        tags: ["nutrition", "immune system", "research"],
        source: "Journal of Nutritional Science",
        author: "Dr. Emily Chen",
        url: "https://example.com/zinc-study",
        imageUrl: "https://example.com/images/zinc-study.jpg"
      },
      {
        id: 2,
        title: "Mediterranean Diet Shows Promise for Heart Health",
        content: "A longitudinal study following 5,000 participants over 10 years confirms that the Mediterranean diet significantly reduces risk of cardiovascular disease.",
        publishDate: new Date("2025-04-25"),
        tags: ["diet", "heart health", "research"],
        source: "American Heart Association",
        author: "Dr. Marco Rossi",
        url: "https://example.com/mediterranean-diet",
        imageUrl: "https://example.com/images/mediterranean-diet.jpg"
      }
    ];
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = { ...existingUser, ...user, updatedAt: new Date() };
    this.users = this.users.map(u => u.id === id ? updatedUser : u);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return initialLength !== this.users.length;
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const user = await this.getUser(userId);
    return user?.roles || [];
  }

  // Forum posts
  async createPost(post: InsertForumPost): Promise<ForumPost> {
    const newPost: ForumPost = {
      ...post,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.posts.push(newPost);
    return newPost;
  }

  async getPosts(): Promise<ForumPost[]> {
    return this.posts;
  }

  async getPostById(id: number): Promise<ForumPost | undefined> {
    return this.posts.find(post => post.id === id);
  }

  async getPostsByUserId(userId: number): Promise<ForumPost[]> {
    return this.posts.filter(post => post.userId === userId);
  }

  async deletePost(id: number): Promise<boolean> {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter(post => post.id !== id);
    return initialLength !== this.posts.length;
  }

  // Health metrics
  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return this.healthMetrics.filter(metric => metric.userId === userId);
  }

  async getHealthMetricById(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.find(metric => metric.id === id);
  }

  async addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const newMetric: HealthMetric = {
      ...metric,
      id: this.nextId++,
      timestamp: new Date()
    };
    this.healthMetrics.push(newMetric);
    return newMetric;
  }

  async updateHealthMetric(id: number, metric: Partial<HealthMetric>): Promise<HealthMetric> {
    const existingMetric = await this.getHealthMetricById(id);
    if (!existingMetric) {
      throw new Error('Health metric not found');
    }

    const updatedMetric = { ...existingMetric, ...metric };
    this.healthMetrics = this.healthMetrics.map(m => m.id === id ? updatedMetric : m);
    return updatedMetric;
  }

  async deleteHealthMetric(id: number): Promise<boolean> {
    const initialLength = this.healthMetrics.length;
    this.healthMetrics = this.healthMetrics.filter(metric => metric.id !== id);
    return initialLength !== this.healthMetrics.length;
  }

  // Medications
  async getMedications(userId: number): Promise<Medication[]> {
    return this.medications.filter(medication => medication.userId === userId);
  }

  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.find(medication => medication.id === id);
  }

  async addMedication(medication: InsertMedication): Promise<Medication> {
    const newMedication: Medication = {
      ...medication,
      id: this.nextId++
    };
    this.medications.push(newMedication);
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<Medication>): Promise<Medication> {
    const existingMedication = await this.getMedicationById(id);
    if (!existingMedication) {
      throw new Error('Medication not found');
    }

    const updatedMedication = { ...existingMedication, ...medication };
    this.medications = this.medications.map(m => m.id === id ? updatedMedication : m);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const initialLength = this.medications.length;
    this.medications = this.medications.filter(medication => medication.id !== id);
    return initialLength !== this.medications.length;
  }

  // Symptoms
  async getSymptoms(userId: number): Promise<Symptom[]> {
    return this.symptoms.filter(symptom => symptom.userId === userId);
  }

  async getSymptomById(id: number): Promise<Symptom | undefined> {
    return this.symptoms.find(symptom => symptom.id === id);
  }

  async addSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const newSymptom: Symptom = {
      ...symptom,
      id: this.nextId++
    };
    this.symptoms.push(newSymptom);
    return newSymptom;
  }

  async updateSymptom(id: number, symptom: Partial<Symptom>): Promise<Symptom> {
    const existingSymptom = await this.getSymptomById(id);
    if (!existingSymptom) {
      throw new Error('Symptom not found');
    }

    const updatedSymptom = { ...existingSymptom, ...symptom };
    this.symptoms = this.symptoms.map(s => s.id === id ? updatedSymptom : s);
    return updatedSymptom;
  }

  async deleteSymptom(id: number): Promise<boolean> {
    const initialLength = this.symptoms.length;
    this.symptoms = this.symptoms.filter(symptom => symptom.id !== id);
    return initialLength !== this.symptoms.length;
  }

  // Appointments
  async getAppointments(userId: number): Promise<Appointment[]> {
    return this.appointments.filter(appointment => appointment.userId === userId);
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.find(appointment => appointment.id === id);
  }

  async addAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: this.nextId++
    };
    this.appointments.push(newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    const existingAppointment = await this.getAppointmentById(id);
    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    const updatedAppointment = { ...existingAppointment, ...appointment };
    this.appointments = this.appointments.map(a => a.id === id ? updatedAppointment : a);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const initialLength = this.appointments.length;
    this.appointments = this.appointments.filter(appointment => appointment.id !== id);
    return initialLength !== this.appointments.length;
  }

  // Health data connections
  async getHealthDataConnections(userId: number): Promise<HealthDataConnection[]> {
    return this.healthDataConnections.filter(connection => connection.userId === userId);
  }

  async getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined> {
    return this.healthDataConnections.find(connection => connection.id === id);
  }

  async addHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection> {
    const newConnection: HealthDataConnection = {
      ...connection,
      id: this.nextId++
    };
    this.healthDataConnections.push(newConnection);
    return newConnection;
  }

  async updateHealthDataConnection(id: number, connection: Partial<HealthDataConnection>): Promise<HealthDataConnection> {
    const existingConnection = await this.getHealthDataConnectionById(id);
    if (!existingConnection) {
      throw new Error('Health data connection not found');
    }

    const updatedConnection = { ...existingConnection, ...connection };
    this.healthDataConnections = this.healthDataConnections.map(c => c.id === id ? updatedConnection : c);
    return updatedConnection;
  }

  async deleteHealthDataConnection(id: number): Promise<boolean> {
    const initialLength = this.healthDataConnections.length;
    this.healthDataConnections = this.healthDataConnections.filter(connection => connection.id !== id);
    return initialLength !== this.healthDataConnections.length;
  }

  // Token Management
  async storeTokenMetadata(metadata: InsertTokenMetadata): Promise<TokenMetadata> {
    const newTokenMetadata: TokenMetadata = {
      ...metadata,
      id: this.nextId++,
      issuedAt: new Date()
    };
    this.tokenMetadata.push(newTokenMetadata);
    return newTokenMetadata;
  }

  async revokeToken(tokenId: string, reason?: string): Promise<boolean> {
    const token = await this.getTokenById(tokenId);
    if (!token) {
      return false;
    }
    
    // Update the token status to revoked
    const updatedToken = { ...token, isRevoked: true };
    this.tokenMetadata = this.tokenMetadata.map(t => t.tokenId === tokenId ? updatedToken : t);
    return true;
  }

  async getTokenById(tokenId: string): Promise<TokenMetadata | undefined> {
    return this.tokenMetadata.find(token => token.tokenId === tokenId);
  }

  async revokeAllUserTokens(userId: number, reason?: string): Promise<number> {
    const userTokens = this.tokenMetadata.filter(token => token.userId === userId);
    
    // Mark all tokens as revoked
    for (const token of userTokens) {
      token.isRevoked = true;
    }
    
    return userTokens.length;
  }

  async deleteExpiredTokens(): Promise<number> {
    const now = new Date();
    const initialLength = this.tokenMetadata.length;
    
    this.tokenMetadata = this.tokenMetadata.filter(token => 
      token.expiresAt > now || token.isRevoked
    );
    
    return initialLength - this.tokenMetadata.length;
  }

  // RBAC Support
  async getResourceOwnerId(resourceId: number, resourceType: string): Promise<number | null> {
    const ownership = this.resourceOwnership.find(
      o => o.resourceId === resourceId && o.resourceType === resourceType
    );
    return ownership ? ownership.ownerId : null;
  }

  async isUserAssignedToResource(userId: number, resourceId: number, resourceType: string): Promise<boolean> {
    return this.resourceAssignments.some(
      a => a.assignedUserId === userId && 
           a.resourceId === resourceId && 
           a.resourceType === resourceType &&
           a.isActive
    );
  }

  async hasHealthcareRelationship(providerId: number, patientId: number): Promise<boolean> {
    return this.healthcareRelationships.some(
      r => r.providerId === providerId && 
           r.patientId === patientId && 
           r.status === 'active'
    );
  }

  async getUserRelationships(userId: number): Promise<UserRelationship[]> {
    return this.userRelationships.filter(
      r => (r.userId === userId || r.relatedUserId === userId) && 
           r.status === 'active'
    );
  }

  async createUserRelationship(relationship: InsertUserRelationship): Promise<UserRelationship> {
    const newRelationship: UserRelationship = {
      ...relationship,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userRelationships.push(newRelationship);
    return newRelationship;
  }

  async createHealthcareRelationship(relationship: InsertHealthcareRelationship): Promise<HealthcareRelationship> {
    const newRelationship: HealthcareRelationship = {
      ...relationship,
      id: this.nextId++,
      startDate: new Date()
    };
    this.healthcareRelationships.push(newRelationship);
    return newRelationship;
  }

  async getHealthcareRelationships(providerId: number): Promise<HealthcareRelationship[]> {
    return this.healthcareRelationships.filter(
      r => r.providerId === providerId && r.status === 'active'
    );
  }

  // Analytics
  async recordUserEvent(event: InsertUserEvent): Promise<UserEvent> {
    const newEvent: UserEvent = {
      ...event,
      id: this.nextId++,
      timestamp: new Date()
    };
    this.userEvents.push(newEvent);
    return newEvent;
  }

  async recordUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: this.nextId++,
      timestamp: new Date()
    };
    this.userFeedback.push(newFeedback);
    return newFeedback;
  }

  async recordErrorLog(error: InsertErrorLog): Promise<ErrorLog> {
    const newErrorLog: ErrorLog = {
      ...error,
      id: this.nextId++,
      timestamp: new Date()
    };
    this.errorLogs.push(newErrorLog);
    return newErrorLog;
  }

  async getUserEvents(userId: number): Promise<UserEvent[]> {
    return this.userEvents.filter(event => event.userId === userId);
  }

  async getUserFeedback(userId: number): Promise<UserFeedback[]> {
    return this.userFeedback.filter(feedback => feedback.userId === userId);
  }

  async getErrorLogs(): Promise<ErrorLog[]> {
    return this.errorLogs;
  }

  // Health News
  async getHealthNews(): Promise<HealthNews[]> {
    return this.healthNews;
  }

  async getHealthNewsById(id: number): Promise<HealthNews | undefined> {
    return this.healthNews.find(news => news.id === id);
  }

  async addHealthNews(news: InsertHealthNews): Promise<HealthNews> {
    const newNews: HealthNews = {
      ...news,
      id: this.nextId++
    };
    this.healthNews.push(newNews);
    return newNews;
  }

  async updateHealthNews(id: number, news: Partial<HealthNews>): Promise<HealthNews> {
    const existingNews = await this.getHealthNewsById(id);
    if (!existingNews) {
      throw new Error('Health news not found');
    }

    const updatedNews = { ...existingNews, ...news };
    this.healthNews = this.healthNews.map(n => n.id === id ? updatedNews : n);
    return updatedNews;
  }

  async deleteHealthNews(id: number): Promise<boolean> {
    const initialLength = this.healthNews.length;
    this.healthNews = this.healthNews.filter(news => news.id !== id);
    return initialLength !== this.healthNews.length;
  }

  // Health Articles
  async getHealthArticles(): Promise<HealthArticle[]> {
    return this.healthArticles;
  }

  async getHealthArticleById(id: number): Promise<HealthArticle | undefined> {
    return this.healthArticles.find(article => article.id === id);
  }

  async addHealthArticle(article: InsertHealthArticle): Promise<HealthArticle> {
    const newArticle: HealthArticle = {
      ...article,
      id: this.nextId++
    };
    this.healthArticles.push(newArticle);
    return newArticle;
  }

  async updateHealthArticle(id: number, article: Partial<HealthArticle>): Promise<HealthArticle> {
    const existingArticle = await this.getHealthArticleById(id);
    if (!existingArticle) {
      throw new Error('Health article not found');
    }

    const updatedArticle = { ...existingArticle, ...article };
    this.healthArticles = this.healthArticles.map(a => a.id === id ? updatedArticle : a);
    return updatedArticle;
  }

  async deleteHealthArticle(id: number): Promise<boolean> {
    const initialLength = this.healthArticles.length;
    this.healthArticles = this.healthArticles.filter(article => article.id !== id);
    return initialLength !== this.healthArticles.length;
  }
}