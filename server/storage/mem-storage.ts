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
  TokenRevocation, InsertTokenRevocation
} from '@shared/health-schema';

import {
  HealthNews, InsertHealthNews,
  UserEvent, InsertUserEvent,
  UserFeedback, InsertUserFeedback,
  ErrorLog, InsertErrorLog
} from '@shared/schema-analytics';

import { IStorage } from './storage-interface';

/**
 * In-memory storage implementation for development and testing
 */
export class MemStorage implements IStorage {
  private users: User[] = [];
  private posts: ForumPost[] = [];
  private healthNews: HealthNews[] = [];
  private healthArticles: HealthArticle[] = [];
  private userEvents: UserEvent[] = [];
  private userFeedback: UserFeedback[] = [];
  private errorLogs: ErrorLog[] = [];
  
  // Health data
  private healthMetrics: HealthMetric[] = [];
  private medications: Medication[] = [];
  private symptoms: Symptom[] = [];
  private appointments: Appointment[] = [];
  private healthDataConnections: HealthDataConnection[] = [];
  
  // Security
  private tokenMetadata: TokenMetadata[] = [];
  private tokenRevocations: TokenRevocation[] = [];

  constructor() {
    // Initialize with some test data
    this.seedTestData();
  }

  private seedTestData() {
    // Add a test user
    this.users.push({
      id: 1,
      username: 'testuser',
      password: '$2a$10$XVxPMY/8hGhLuMVO/BpYL.PJHFZqhIRIrqcm4KrB1KXbMSGjq3aCi', // 'password123'
      email: 'test@example.com',
      name: 'Test User',
      profilePicture: null,
      healthData: null,
      gender: null,
      birthDate: null,
      preferences: null
    });

    // Add some health news
    this.healthNews.push({
      id: 1,
      title: 'New Study Links Zinc Levels to Immune Function',
      content: 'A recent study has found a significant correlation between zinc levels and immune system function...',
      publishDate: new Date('2024-01-15'),
      author: 'Dr. Jane Smith',
      source: 'Health Journal Today',
      url: 'https://example.com/health-news/1',
      imageUrl: 'https://example.com/images/zinc-study.jpg',
      tags: 'nutrition,immune system,research'
    });
    
    this.healthNews.push({
      id: 2,
      title: 'Mediterranean Diet Shows Promise for Heart Health',
      content: 'Research continues to support the benefits of a Mediterranean diet for cardiovascular health...',
      publishDate: new Date('2024-01-10'),
      author: 'Dr. Michael Chen',
      source: 'Nutrition Science Weekly',
      url: 'https://example.com/health-news/2',
      imageUrl: 'https://example.com/images/mediterranean-diet.jpg',
      tags: 'nutrition,heart health,diet'
    });
  }

  // User management methods
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
    const newId = this.users.length > 0 
      ? Math.max(...this.users.map(u => u.id)) + 1 
      : 1;
    
    const newUser: User = {
      ...user,
      id: newId,
      profilePicture: user.profilePicture || null,
      healthData: user.healthData || null,
      gender: user.gender || null,
      birthDate: user.birthDate || null,
      preferences: user.preferences || null
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      ...updates
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return this.users.length < initialLength;
  }

  // Forum post methods
  async createPost(post: InsertForumPost): Promise<ForumPost> {
    const newId = this.posts.length > 0 
      ? Math.max(...this.posts.map(p => p.id)) + 1 
      : 1;
    
    const newPost: ForumPost = {
      ...post,
      id: newId,
      timestamp: new Date(),
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      tags: post.tags || null
    };
    
    this.posts.push(newPost);
    return newPost;
  }

  async getPosts(): Promise<ForumPost[]> {
    return [...this.posts];
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
    return this.posts.length < initialLength;
  }

  // Health metrics methods
  async getHealthMetrics(userId: number): Promise<HealthMetric[]> {
    return this.healthMetrics.filter(metric => metric.userId === userId);
  }

  async getHealthMetricById(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.find(metric => metric.id === id);
  }

  async addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const newId = this.healthMetrics.length > 0 
      ? Math.max(...this.healthMetrics.map(m => m.id)) + 1 
      : 1;
    
    const newMetric: HealthMetric = {
      ...metric,
      id: newId,
      timestamp: metric.timestamp ? new Date(metric.timestamp) : new Date(),
      unit: metric.unit || null,
      notes: metric.notes || null,
      source: metric.source || null
    };
    
    this.healthMetrics.push(newMetric);
    return newMetric;
  }

  async updateHealthMetric(id: number, updates: Partial<HealthMetric>): Promise<HealthMetric> {
    const metricIndex = this.healthMetrics.findIndex(metric => metric.id === id);
    
    if (metricIndex === -1) {
      throw new Error(`Health metric with ID ${id} not found`);
    }
    
    const updatedMetric = {
      ...this.healthMetrics[metricIndex],
      ...updates
    };
    
    this.healthMetrics[metricIndex] = updatedMetric;
    return updatedMetric;
  }

  async deleteHealthMetric(id: number): Promise<boolean> {
    const initialLength = this.healthMetrics.length;
    this.healthMetrics = this.healthMetrics.filter(metric => metric.id !== id);
    return this.healthMetrics.length < initialLength;
  }

  // Medications methods
  async getMedications(userId: number): Promise<Medication[]> {
    return this.medications.filter(med => med.userId === userId);
  }

  async getMedicationById(id: number): Promise<Medication | undefined> {
    return this.medications.find(med => med.id === id);
  }

  async addMedication(medication: InsertMedication): Promise<Medication> {
    const newId = this.medications.length > 0 
      ? Math.max(...this.medications.map(m => m.id)) + 1 
      : 1;
    
    const newMedication: Medication = {
      ...medication,
      id: newId,
      startDate: medication.startDate ? new Date(medication.startDate) : new Date(),
      endDate: medication.endDate ? new Date(medication.endDate) : null,
      notes: medication.notes || null,
      dosage: medication.dosage || null,
      frequency: medication.frequency || null,
      prescribedBy: medication.prescribedBy || null,
      active: medication.active !== undefined ? medication.active : null
    };
    
    this.medications.push(newMedication);
    return newMedication;
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication> {
    const medIndex = this.medications.findIndex(med => med.id === id);
    
    if (medIndex === -1) {
      throw new Error(`Medication with ID ${id} not found`);
    }
    
    const updatedMedication = {
      ...this.medications[medIndex],
      ...updates
    };
    
    this.medications[medIndex] = updatedMedication;
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const initialLength = this.medications.length;
    this.medications = this.medications.filter(med => med.id !== id);
    return this.medications.length < initialLength;
  }

  // Symptoms methods
  async getSymptoms(userId: number): Promise<Symptom[]> {
    return this.symptoms.filter(symptom => symptom.userId === userId);
  }

  async getSymptomById(id: number): Promise<Symptom | undefined> {
    return this.symptoms.find(symptom => symptom.id === id);
  }

  async addSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const newId = this.symptoms.length > 0 
      ? Math.max(...this.symptoms.map(s => s.id)) + 1 
      : 1;
    
    const newSymptom: Symptom = {
      ...symptom,
      id: newId,
      startTime: symptom.startTime ? new Date(symptom.startTime) : new Date(),
      endTime: symptom.endTime ? new Date(symptom.endTime) : null,
      notes: symptom.notes || null,
      relatedCondition: symptom.relatedCondition || null,
      bodyLocation: symptom.bodyLocation || null
    };
    
    this.symptoms.push(newSymptom);
    return newSymptom;
  }

  async updateSymptom(id: number, updates: Partial<Symptom>): Promise<Symptom> {
    const symptomIndex = this.symptoms.findIndex(symptom => symptom.id === id);
    
    if (symptomIndex === -1) {
      throw new Error(`Symptom with ID ${id} not found`);
    }
    
    const updatedSymptom = {
      ...this.symptoms[symptomIndex],
      ...updates
    };
    
    this.symptoms[symptomIndex] = updatedSymptom;
    return updatedSymptom;
  }

  async deleteSymptom(id: number): Promise<boolean> {
    const initialLength = this.symptoms.length;
    this.symptoms = this.symptoms.filter(symptom => symptom.id !== id);
    return this.symptoms.length < initialLength;
  }

  // Appointments methods
  async getAppointments(userId: number): Promise<Appointment[]> {
    return this.appointments.filter(apt => apt.userId === userId);
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.find(apt => apt.id === id);
  }

  async addAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newId = this.appointments.length > 0 
      ? Math.max(...this.appointments.map(a => a.id)) + 1 
      : 1;
    
    const newAppointment: Appointment = {
      ...appointment,
      id: newId,
      datetime: appointment.datetime ? new Date(appointment.datetime) : new Date(),
      reminderTime: appointment.reminderTime ? new Date(appointment.reminderTime) : null,
      notes: appointment.notes || null,
      type: appointment.type || null,
      status: appointment.status || null,
      location: appointment.location || null,
      duration: appointment.duration || null
    };
    
    this.appointments.push(newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    const aptIndex = this.appointments.findIndex(apt => apt.id === id);
    
    if (aptIndex === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    const updatedAppointment = {
      ...this.appointments[aptIndex],
      ...updates
    };
    
    this.appointments[aptIndex] = updatedAppointment;
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const initialLength = this.appointments.length;
    this.appointments = this.appointments.filter(apt => apt.id !== id);
    return this.appointments.length < initialLength;
  }

  // Health data connections methods
  async getHealthDataConnections(userId: number): Promise<HealthDataConnection[]> {
    return this.healthDataConnections.filter(conn => conn.userId === userId);
  }

  async getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined> {
    return this.healthDataConnections.find(conn => conn.id === id);
  }

  async addHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection> {
    const newId = this.healthDataConnections.length > 0 
      ? Math.max(...this.healthDataConnections.map(c => c.id)) + 1 
      : 1;
    
    const newConnection: HealthDataConnection = {
      ...connection,
      id: newId,
      expiresAt: connection.expiresAt ? new Date(connection.expiresAt) : null,
      lastSynced: connection.lastSynced ? new Date(connection.lastSynced) : null,
      active: connection.active !== undefined ? connection.active : null,
      accessToken: connection.accessToken || null,
      refreshToken: connection.refreshToken || null,
      scope: connection.scope || null,
      settings: connection.settings || null
    };
    
    this.healthDataConnections.push(newConnection);
    return newConnection;
  }

  async updateHealthDataConnection(id: number, updates: Partial<HealthDataConnection>): Promise<HealthDataConnection> {
    const connIndex = this.healthDataConnections.findIndex(conn => conn.id === id);
    
    if (connIndex === -1) {
      throw new Error(`Health data connection with ID ${id} not found`);
    }
    
    const updatedConnection = {
      ...this.healthDataConnections[connIndex],
      ...updates
    };
    
    this.healthDataConnections[connIndex] = updatedConnection;
    return updatedConnection;
  }

  async deleteHealthDataConnection(id: number): Promise<boolean> {
    const initialLength = this.healthDataConnections.length;
    this.healthDataConnections = this.healthDataConnections.filter(conn => conn.id !== id);
    return this.healthDataConnections.length < initialLength;
  }

  // Security - Token storage
  async storeTokenMetadata(metadata: InsertTokenMetadata): Promise<void> {
    const newId = this.tokenMetadata.length > 0 
      ? Math.max(...this.tokenMetadata.map(t => t.id)) + 1 
      : 1;
    
    const newMetadata: TokenMetadata = {
      ...metadata,
      id: newId,
      issuedAt: new Date(),
      expiresAt: metadata.expiresAt ? new Date(metadata.expiresAt) : new Date(Date.now() + 86400000),
      isRevoked: metadata.isRevoked !== undefined ? metadata.isRevoked : null,
      clientInfo: metadata.clientInfo || null
    };
    
    this.tokenMetadata.push(newMetadata);
  }

  async revokeToken(tokenId: string, reason?: string): Promise<boolean> {
    // Find token metadata
    const tokenIndex = this.tokenMetadata.findIndex(t => t.tokenId === tokenId);
    
    if (tokenIndex === -1) {
      return false;
    }
    
    // Mark token as revoked
    this.tokenMetadata[tokenIndex].isRevoked = true;
    
    // Add to revocation list
    const newId = this.tokenRevocations.length > 0 
      ? Math.max(...this.tokenRevocations.map(r => r.id)) + 1 
      : 1;
    
    const revocation: TokenRevocation = {
      id: newId,
      tokenId,
      userId: this.tokenMetadata[tokenIndex].userId,
      expiresAt: this.tokenMetadata[tokenIndex].expiresAt,
      revokedAt: new Date(),
      reason: reason || 'Manual revocation'
    };
    
    this.tokenRevocations.push(revocation);
    
    return true;
  }

  async getTokenById(tokenId: string): Promise<TokenMetadata | undefined> {
    return this.tokenMetadata.find(t => t.tokenId === tokenId);
  }

  async revokeAllUserTokens(userId: number, reason?: string): Promise<number> {
    let count = 0;
    
    // Find all tokens for the user
    const userTokens = this.tokenMetadata.filter(t => t.userId === userId && !t.isRevoked);
    
    // Revoke each token
    for (const token of userTokens) {
      const success = await this.revokeToken(token.tokenId, reason);
      if (success) count++;
    }
    
    return count;
  }

  async deleteExpiredTokens(): Promise<number> {
    const now = new Date();
    let count = 0;
    
    // Remove expired metadata
    const initialMetadataLength = this.tokenMetadata.length;
    this.tokenMetadata = this.tokenMetadata.filter(t => {
      if (t.expiresAt <= now) {
        count++;
        return false;
      }
      return true;
    });
    
    // Remove expired revocations
    const initialRevocationsLength = this.tokenRevocations.length;
    this.tokenRevocations = this.tokenRevocations.filter(r => {
      if (r.expiresAt <= now) {
        count++;
        return false;
      }
      return true;
    });
    
    return count;
  }

  // Analytics methods
  async recordUserEvent(event: InsertUserEvent): Promise<UserEvent> {
    const newId = this.userEvents.length > 0 
      ? Math.max(...this.userEvents.map(e => e.id)) + 1 
      : 1;
    
    const newEvent: UserEvent = {
      ...event,
      id: newId,
      timestamp: new Date()
    };
    
    this.userEvents.push(newEvent);
    return newEvent;
  }

  async recordUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const newId = this.userFeedback.length > 0 
      ? Math.max(...this.userFeedback.map(f => f.id)) + 1 
      : 1;
    
    const newFeedback: UserFeedback = {
      ...feedback,
      id: newId,
      timestamp: new Date()
    };
    
    this.userFeedback.push(newFeedback);
    return newFeedback;
  }

  async recordErrorLog(error: InsertErrorLog): Promise<ErrorLog> {
    const newId = this.errorLogs.length > 0 
      ? Math.max(...this.errorLogs.map(e => e.id)) + 1 
      : 1;
    
    const newErrorLog: ErrorLog = {
      ...error,
      id: newId,
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
    return [...this.errorLogs];
  }

  // News API methods
  async getHealthNews(): Promise<HealthNews[]> {
    return [...this.healthNews];
  }

  async getHealthNewsById(id: number): Promise<HealthNews | undefined> {
    return this.healthNews.find(news => news.id === id);
  }

  async addHealthNews(news: InsertHealthNews): Promise<HealthNews> {
    const newId = this.healthNews.length > 0 
      ? Math.max(...this.healthNews.map(n => n.id)) + 1 
      : 1;
    
    const newNews: HealthNews = {
      ...news,
      id: newId,
      publishDate: news.publishDate || new Date()
    };
    
    this.healthNews.push(newNews);
    return newNews;
  }

  async updateHealthNews(id: number, updates: Partial<HealthNews>): Promise<HealthNews> {
    const newsIndex = this.healthNews.findIndex(news => news.id === id);
    
    if (newsIndex === -1) {
      throw new Error(`Health news with ID ${id} not found`);
    }
    
    const updatedNews = {
      ...this.healthNews[newsIndex],
      ...updates
    };
    
    this.healthNews[newsIndex] = updatedNews;
    return updatedNews;
  }

  async deleteHealthNews(id: number): Promise<boolean> {
    const initialLength = this.healthNews.length;
    this.healthNews = this.healthNews.filter(news => news.id !== id);
    return this.healthNews.length < initialLength;
  }

  // Health Articles methods
  async getHealthArticles(): Promise<HealthArticle[]> {
    return [...this.healthArticles];
  }

  async getHealthArticleById(id: number): Promise<HealthArticle | undefined> {
    return this.healthArticles.find(article => article.id === id);
  }

  async addHealthArticle(article: InsertHealthArticle): Promise<HealthArticle> {
    const newId = this.healthArticles.length > 0 
      ? Math.max(...this.healthArticles.map(a => a.id)) + 1 
      : 1;
    
    const newArticle: HealthArticle = {
      ...article,
      id: newId,
      publishDate: article.publishDate || new Date()
    };
    
    this.healthArticles.push(newArticle);
    return newArticle;
  }

  async updateHealthArticle(id: number, updates: Partial<HealthArticle>): Promise<HealthArticle> {
    const articleIndex = this.healthArticles.findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      throw new Error(`Health article with ID ${id} not found`);
    }
    
    const updatedArticle = {
      ...this.healthArticles[articleIndex],
      ...updates
    };
    
    this.healthArticles[articleIndex] = updatedArticle;
    return updatedArticle;
  }

  async deleteHealthArticle(id: number): Promise<boolean> {
    const initialLength = this.healthArticles.length;
    this.healthArticles = this.healthArticles.filter(article => article.id !== id);
    return this.healthArticles.length < initialLength;
  }
}