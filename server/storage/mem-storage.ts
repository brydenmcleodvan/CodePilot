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

import { Role } from '../security/permissions/permission-types';

/**
 * In-memory storage implementation
 * This is useful for development and testing
 */
export class MemStorage implements IStorage {
  private users: User[] = [];
  private forumPosts: ForumPost[] = [];
  private healthMetrics: HealthMetric[] = [];
  private medications: Medication[] = [];
  private symptoms: Symptom[] = [];
  private appointments: Appointment[] = [];
  private healthDataConnections: HealthDataConnection[] = [];
  private userEvents: UserEvent[] = [];
  private userFeedback: UserFeedback[] = [];
  private errorLogs: ErrorLog[] = [];
  private healthNews: HealthNews[] = [];
  private healthArticles: HealthArticle[] = [];
  private tokenMetadataStore: TokenMetadata[] = [];
  private userRelationships: UserRelationship[] = [];
  private healthcareRelationships: HealthcareRelationship[] = [];
  private userRoles: UserRole[] = [];
  private resourceOwnerships: ResourceOwnership[] = [];
  private resourceAssignments: ResourceAssignment[] = [];

  constructor() {
    // Initialize with some sample data if needed
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample users
    this.users.push({
      id: 1,
      username: 'patient1',
      password: '$2a$10$eACCYoNOHmIMcGJq8Nnqne7U49dxuGQW9Fh3NexRRbHMZIxRDJ/Pm', // 'password'
      email: 'patient1@example.com',
      name: 'John Patient',
      profilePicture: null,
      healthData: null,
      gender: 'male',
      birthDate: new Date('1985-05-15'),
      preferences: null,
      roles: [Role.PATIENT]
    });

    this.users.push({
      id: 2,
      username: 'doctor1',
      password: '$2a$10$eACCYoNOHmIMcGJq8Nnqne7U49dxuGQW9Fh3NexRRbHMZIxRDJ/Pm', // 'password'
      email: 'doctor1@example.com',
      name: 'Dr. Jane Smith',
      profilePicture: null,
      healthData: null,
      gender: 'female',
      birthDate: new Date('1975-08-20'),
      preferences: null,
      roles: [Role.DOCTOR]
    });

    this.users.push({
      id: 3,
      username: 'admin',
      password: '$2a$10$eACCYoNOHmIMcGJq8Nnqne7U49dxuGQW9Fh3NexRRbHMZIxRDJ/Pm', // 'password'
      email: 'admin@example.com',
      name: 'Admin User',
      profilePicture: null,
      healthData: null,
      gender: null,
      birthDate: null,
      preferences: null,
      roles: [Role.ADMIN]
    });

    // Add sample healthcare relationships
    this.healthcareRelationships.push({
      id: 1,
      providerId: 2, // doctor1
      patientId: 1, // patient1
      relationshipType: 'primary_care',
      startDate: new Date('2022-01-01'),
      endDate: null,
      status: 'active',
      accessLevel: 'full',
      notes: null,
      metadata: null
    });

    // Add sample health metrics
    this.healthMetrics.push({
      id: 1,
      userId: 1,
      metricType: 'heart_rate',
      value: '75',
      unit: 'bpm',
      timestamp: new Date('2023-01-15T08:30:00'),
      notes: 'Morning reading',
      source: 'manual'
    });

    // Add sample forum posts
    this.forumPosts.push({
      id: 1,
      userId: 1,
      title: 'Question about heart health',
      content: 'I recently started exercising more and noticed my resting heart rate is lower. Is this normal?',
      timestamp: new Date('2023-01-20T14:25:00'),
      upvotes: 5,
      downvotes: 0,
      subreddit: 'Heart Health',
      tags: ['exercise', 'heart_rate']
    });

    // Add sample health news
    this.healthNews.push({
      id: 1,
      title: 'New Study Links Zinc Levels to Immune Function',
      content: 'Researchers have found a significant correlation between zinc levels and immune system effectiveness...',
      publishDate: new Date('2023-02-10'),
      tags: ['nutrition', 'immune_system', 'research'],
      source: 'Health Science Journal',
      author: 'Dr. Maria Rodriguez',
      url: 'https://example.com/health-news/zinc-study',
      imageUrl: 'https://example.com/images/zinc-study.jpg'
    });

    // Add sample health articles
    this.healthArticles.push({
      id: 1,
      title: 'Understanding Heart Rate Variability',
      content: 'Heart rate variability (HRV) is a measure of the variation in time between consecutive heartbeats...',
      summary: 'Learn about heart rate variability and why it matters for your overall health.',
      authorName: 'Dr. James Wilson',
      publishedAt: new Date('2023-01-05'),
      category: 'Cardiovascular Health',
      tags: ['heart_health', 'hrv', 'fitness'],
      imageUrl: 'https://example.com/images/hrv-article.jpg',
      sourceName: 'Healthmap Blog',
      sourceUrl: 'https://healthmap.io/blog/heart-rate-variability',
      readTime: 8
    });
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
    const newId = this.users.length > 0 
      ? Math.max(...this.users.map(u => u.id)) + 1 
      : 1;
    
    // Default to PATIENT role if none provided
    const roles = user.roles || [Role.PATIENT];

    const newUser: User = {
      id: newId,
      username: user.username,
      password: user.password,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture || null,
      healthData: user.healthData || null,
      gender: user.gender || null,
      birthDate: user.birthDate || null,
      preferences: user.preferences || null,
      roles
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, userUpdates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      ...userUpdates
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    
    this.users.splice(userIndex, 1);
    return true;
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }
    return user.roles || [];
  }

  // Forum posts
  async createPost(post: InsertForumPost): Promise<ForumPost> {
    const newId = this.forumPosts.length > 0 
      ? Math.max(...this.forumPosts.map(p => p.id)) + 1 
      : 1;
    
    const newPost: ForumPost = {
      id: newId,
      userId: post.userId,
      title: post.title,
      content: post.content,
      subreddit: post.subreddit,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      tags: post.tags || [],
      timestamp: post.timestamp || new Date()
    };
    
    this.forumPosts.push(newPost);
    return newPost;
  }

  async getPosts(): Promise<ForumPost[]> {
    return this.forumPosts;
  }

  async getPostById(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.find(post => post.id === id);
  }

  async getPostsByUserId(userId: number): Promise<ForumPost[]> {
    return this.forumPosts.filter(post => post.userId === userId);
  }

  async deletePost(id: number): Promise<boolean> {
    const postIndex = this.forumPosts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return false;
    }
    
    this.forumPosts.splice(postIndex, 1);
    return true;
  }

  // Health data
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
      id: newId,
      userId: metric.userId,
      metricType: metric.metricType,
      value: metric.value,
      unit: metric.unit || null,
      timestamp: metric.timestamp || new Date(),
      notes: metric.notes || null,
      source: metric.source || null
    };
    
    this.healthMetrics.push(newMetric);
    
    // Record ownership
    this.resourceOwnerships.push({
      id: this.resourceOwnerships.length + 1,
      resourceId: newId,
      resourceType: 'health_metric',
      ownerId: metric.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return newMetric;
  }

  async updateHealthMetric(id: number, metricUpdates: Partial<HealthMetric>): Promise<HealthMetric> {
    const metricIndex = this.healthMetrics.findIndex(metric => metric.id === id);
    if (metricIndex === -1) {
      throw new Error(`Health metric with id ${id} not found`);
    }
    
    const updatedMetric = {
      ...this.healthMetrics[metricIndex],
      ...metricUpdates
    };
    
    this.healthMetrics[metricIndex] = updatedMetric;
    return updatedMetric;
  }

  async deleteHealthMetric(id: number): Promise<boolean> {
    const metricIndex = this.healthMetrics.findIndex(metric => metric.id === id);
    if (metricIndex === -1) {
      return false;
    }
    
    this.healthMetrics.splice(metricIndex, 1);
    
    // Remove ownership
    const ownershipIndex = this.resourceOwnerships.findIndex(
      o => o.resourceId === id && o.resourceType === 'health_metric'
    );
    
    if (ownershipIndex !== -1) {
      this.resourceOwnerships.splice(ownershipIndex, 1);
    }
    
    return true;
  }

  // Medications
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
      id: newId,
      userId: medication.userId,
      name: medication.name,
      dosage: medication.dosage || null,
      frequency: medication.frequency || null,
      startDate: medication.startDate,
      endDate: medication.endDate || null,
      notes: medication.notes || null,
      prescribedBy: medication.prescribedBy || null,
      active: medication.active !== undefined ? medication.active : true
    };
    
    this.medications.push(newMedication);
    
    // Record ownership
    this.resourceOwnerships.push({
      id: this.resourceOwnerships.length + 1,
      resourceId: newId,
      resourceType: 'medication',
      ownerId: medication.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return newMedication;
  }

  async updateMedication(id: number, medicationUpdates: Partial<Medication>): Promise<Medication> {
    const medicationIndex = this.medications.findIndex(med => med.id === id);
    if (medicationIndex === -1) {
      throw new Error(`Medication with id ${id} not found`);
    }
    
    const updatedMedication = {
      ...this.medications[medicationIndex],
      ...medicationUpdates
    };
    
    this.medications[medicationIndex] = updatedMedication;
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<boolean> {
    const medicationIndex = this.medications.findIndex(med => med.id === id);
    if (medicationIndex === -1) {
      return false;
    }
    
    this.medications.splice(medicationIndex, 1);
    
    // Remove ownership
    const ownershipIndex = this.resourceOwnerships.findIndex(
      o => o.resourceId === id && o.resourceType === 'medication'
    );
    
    if (ownershipIndex !== -1) {
      this.resourceOwnerships.splice(ownershipIndex, 1);
    }
    
    return true;
  }

  // Symptoms
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
      id: newId,
      userId: symptom.userId,
      name: symptom.name,
      severity: symptom.severity,
      startTime: symptom.startTime,
      endTime: symptom.endTime || null,
      notes: symptom.notes || null,
      relatedCondition: symptom.relatedCondition || null,
      bodyLocation: symptom.bodyLocation || null
    };
    
    this.symptoms.push(newSymptom);
    
    // Record ownership
    this.resourceOwnerships.push({
      id: this.resourceOwnerships.length + 1,
      resourceId: newId,
      resourceType: 'symptom',
      ownerId: symptom.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return newSymptom;
  }

  async updateSymptom(id: number, symptomUpdates: Partial<Symptom>): Promise<Symptom> {
    const symptomIndex = this.symptoms.findIndex(symptom => symptom.id === id);
    if (symptomIndex === -1) {
      throw new Error(`Symptom with id ${id} not found`);
    }
    
    const updatedSymptom = {
      ...this.symptoms[symptomIndex],
      ...symptomUpdates
    };
    
    this.symptoms[symptomIndex] = updatedSymptom;
    return updatedSymptom;
  }

  async deleteSymptom(id: number): Promise<boolean> {
    const symptomIndex = this.symptoms.findIndex(symptom => symptom.id === id);
    if (symptomIndex === -1) {
      return false;
    }
    
    this.symptoms.splice(symptomIndex, 1);
    
    // Remove ownership
    const ownershipIndex = this.resourceOwnerships.findIndex(
      o => o.resourceId === id && o.resourceType === 'symptom'
    );
    
    if (ownershipIndex !== -1) {
      this.resourceOwnerships.splice(ownershipIndex, 1);
    }
    
    return true;
  }

  // Appointments
  async getAppointments(userId: number): Promise<Appointment[]> {
    return this.appointments.filter(appointment => appointment.userId === userId);
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.find(appointment => appointment.id === id);
  }

  async addAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newId = this.appointments.length > 0 
      ? Math.max(...this.appointments.map(a => a.id)) + 1 
      : 1;
    
    const newAppointment: Appointment = {
      id: newId,
      userId: appointment.userId,
      title: appointment.title,
      provider: appointment.provider,
      location: appointment.location || null,
      datetime: appointment.datetime,
      duration: appointment.duration || null,
      notes: appointment.notes || null,
      reminderTime: appointment.reminderTime || null,
      type: appointment.type || null,
      status: appointment.status || 'scheduled'
    };
    
    this.appointments.push(newAppointment);
    
    // Record ownership
    this.resourceOwnerships.push({
      id: this.resourceOwnerships.length + 1,
      resourceId: newId,
      resourceType: 'appointment',
      ownerId: appointment.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentUpdates: Partial<Appointment>): Promise<Appointment> {
    const appointmentIndex = this.appointments.findIndex(appointment => appointment.id === id);
    if (appointmentIndex === -1) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updatedAppointment = {
      ...this.appointments[appointmentIndex],
      ...appointmentUpdates
    };
    
    this.appointments[appointmentIndex] = updatedAppointment;
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const appointmentIndex = this.appointments.findIndex(appointment => appointment.id === id);
    if (appointmentIndex === -1) {
      return false;
    }
    
    this.appointments.splice(appointmentIndex, 1);
    
    // Remove ownership
    const ownershipIndex = this.resourceOwnerships.findIndex(
      o => o.resourceId === id && o.resourceType === 'appointment'
    );
    
    if (ownershipIndex !== -1) {
      this.resourceOwnerships.splice(ownershipIndex, 1);
    }
    
    return true;
  }

  // Health data connections
  async getHealthDataConnections(userId: number): Promise<HealthDataConnection[]> {
    return this.healthDataConnections.filter(connection => connection.userId === userId);
  }

  async getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined> {
    return this.healthDataConnections.find(connection => connection.id === id);
  }

  async addHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection> {
    const newId = this.healthDataConnections.length > 0 
      ? Math.max(...this.healthDataConnections.map(c => c.id)) + 1 
      : 1;
    
    const newConnection: HealthDataConnection = {
      id: newId,
      userId: connection.userId,
      provider: connection.provider,
      accessToken: connection.accessToken || null,
      refreshToken: connection.refreshToken || null,
      expiresAt: connection.expiresAt || null,
      scope: connection.scope || null,
      lastSynced: connection.lastSynced || null,
      settings: connection.settings || null,
      active: connection.active !== undefined ? connection.active : true
    };
    
    this.healthDataConnections.push(newConnection);
    return newConnection;
  }

  async updateHealthDataConnection(id: number, connectionUpdates: Partial<HealthDataConnection>): Promise<HealthDataConnection> {
    const connectionIndex = this.healthDataConnections.findIndex(connection => connection.id === id);
    if (connectionIndex === -1) {
      throw new Error(`Health data connection with id ${id} not found`);
    }
    
    const updatedConnection = {
      ...this.healthDataConnections[connectionIndex],
      ...connectionUpdates
    };
    
    this.healthDataConnections[connectionIndex] = updatedConnection;
    return updatedConnection;
  }

  async deleteHealthDataConnection(id: number): Promise<boolean> {
    const connectionIndex = this.healthDataConnections.findIndex(connection => connection.id === id);
    if (connectionIndex === -1) {
      return false;
    }
    
    this.healthDataConnections.splice(connectionIndex, 1);
    return true;
  }

  // Security - Token Management
  async storeTokenMetadata(metadata: InsertTokenMetadata): Promise<TokenMetadata> {
    const newId = this.tokenMetadataStore.length > 0 
      ? Math.max(...this.tokenMetadataStore.map(t => t.id)) + 1 
      : 1;
    
    const newMetadata: TokenMetadata = {
      id: newId,
      tokenId: metadata.tokenId,
      userId: metadata.userId,
      issuedAt: metadata.issuedAt || new Date(),
      expiresAt: metadata.expiresAt,
      isRevoked: metadata.isRevoked !== undefined ? metadata.isRevoked : false,
      clientInfo: metadata.clientInfo || null
    };
    
    this.tokenMetadataStore.push(newMetadata);
    return newMetadata;
  }

  async getTokenById(tokenId: string): Promise<TokenMetadata | undefined> {
    return this.tokenMetadataStore.find(token => token.tokenId === tokenId);
  }

  async revokeToken(tokenId: string, reason?: string): Promise<boolean> {
    const tokenIndex = this.tokenMetadataStore.findIndex(token => token.tokenId === tokenId);
    if (tokenIndex === -1) {
      return false;
    }
    
    this.tokenMetadataStore[tokenIndex] = {
      ...this.tokenMetadataStore[tokenIndex],
      isRevoked: true
    };
    
    return true;
  }

  async revokeAllUserTokens(userId: number, reason?: string): Promise<number> {
    let count = 0;
    
    this.tokenMetadataStore = this.tokenMetadataStore.map(token => {
      if (token.userId === userId && !token.isRevoked) {
        count++;
        return {
          ...token,
          isRevoked: true
        };
      }
      return token;
    });
    
    return count;
  }

  async deleteExpiredTokens(): Promise<number> {
    const now = new Date();
    const initialCount = this.tokenMetadataStore.length;
    
    this.tokenMetadataStore = this.tokenMetadataStore.filter(token => {
      // Keep tokens that haven't expired yet
      return token.expiresAt > now;
    });
    
    return initialCount - this.tokenMetadataStore.length;
  }

  // Security - RBAC Support
  async getResourceOwnerId(resourceId: number, resourceType: string): Promise<number | null> {
    const ownership = this.resourceOwnerships.find(
      o => o.resourceId === resourceId && o.resourceType === resourceType
    );
    
    return ownership ? ownership.ownerId : null;
  }

  async isUserAssignedToResource(userId: number, resourceId: number, resourceType: string): Promise<boolean> {
    const assignment = this.resourceAssignments.find(
      a => a.assignedUserId === userId && 
           a.resourceId === resourceId && 
           a.resourceType === resourceType && 
           a.isActive
    );
    
    return !!assignment;
  }

  async hasHealthcareRelationship(providerId: number, patientId: number): Promise<boolean> {
    const relationship = this.healthcareRelationships.find(
      r => r.providerId === providerId && 
           r.patientId === patientId && 
           r.status === 'active'
    );
    
    return !!relationship;
  }

  async getUserRelationships(userId: number): Promise<UserRelationship[]> {
    return this.userRelationships.filter(r => r.userId === userId);
  }

  async createUserRelationship(relationship: InsertUserRelationship): Promise<UserRelationship> {
    const newId = this.userRelationships.length > 0 
      ? Math.max(...this.userRelationships.map(r => r.id)) + 1 
      : 1;
    
    const newRelationship: UserRelationship = {
      id: newId,
      userId: relationship.userId,
      relatedUserId: relationship.relatedUserId,
      relationshipType: relationship.relationshipType,
      status: relationship.status || 'active',
      createdAt: relationship.createdAt || new Date(),
      updatedAt: relationship.updatedAt || new Date(),
      metadata: relationship.metadata || null
    };
    
    this.userRelationships.push(newRelationship);
    return newRelationship;
  }

  async createHealthcareRelationship(relationship: InsertHealthcareRelationship): Promise<HealthcareRelationship> {
    const newId = this.healthcareRelationships.length > 0 
      ? Math.max(...this.healthcareRelationships.map(r => r.id)) + 1 
      : 1;
    
    const newRelationship: HealthcareRelationship = {
      id: newId,
      providerId: relationship.providerId,
      patientId: relationship.patientId,
      relationshipType: relationship.relationshipType,
      startDate: relationship.startDate || new Date(),
      endDate: relationship.endDate || null,
      status: relationship.status || 'active',
      accessLevel: relationship.accessLevel || 'standard',
      notes: relationship.notes || null,
      metadata: relationship.metadata || null
    };
    
    this.healthcareRelationships.push(newRelationship);
    return newRelationship;
  }

  async getHealthcareRelationships(providerId: number): Promise<HealthcareRelationship[]> {
    return this.healthcareRelationships.filter(r => r.providerId === providerId);
  }

  // Analytics
  async recordUserEvent(event: InsertUserEvent): Promise<UserEvent> {
    const newId = this.userEvents.length > 0 
      ? Math.max(...this.userEvents.map(e => e.id)) + 1 
      : 1;
    
    const newEvent: UserEvent = {
      id: newId,
      userId: event.userId,
      eventType: event.eventType,
      timestamp: event.timestamp || new Date(),
      eventData: event.eventData || null,
      sessionId: event.sessionId || null,
      deviceInfo: event.deviceInfo || null
    };
    
    this.userEvents.push(newEvent);
    return newEvent;
  }

  async recordUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const newId = this.userFeedback.length > 0 
      ? Math.max(...this.userFeedback.map(f => f.id)) + 1 
      : 1;
    
    const newFeedback: UserFeedback = {
      id: newId,
      userId: feedback.userId,
      feedbackType: feedback.feedbackType,
      rating: feedback.rating,
      timestamp: feedback.timestamp || new Date(),
      comments: feedback.comments || null,
      featureId: feedback.featureId || null,
      resolvedStatus: feedback.resolvedStatus || 'pending'
    };
    
    this.userFeedback.push(newFeedback);
    return newFeedback;
  }

  async recordErrorLog(error: InsertErrorLog): Promise<ErrorLog> {
    const newId = this.errorLogs.length > 0 
      ? Math.max(...this.errorLogs.map(e => e.id)) + 1 
      : 1;
    
    const newError: ErrorLog = {
      id: newId,
      userId: error.userId,
      errorType: error.errorType,
      errorMessage: error.errorMessage,
      timestamp: error.timestamp || new Date(),
      stackTrace: error.stackTrace || null,
      contextData: error.contextData || null,
      severity: error.severity || 'error',
      resolved: error.resolved !== undefined ? error.resolved : false
    };
    
    this.errorLogs.push(newError);
    return newError;
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

  // News API
  async getHealthNews(): Promise<HealthNews[]> {
    return this.healthNews;
  }

  async getHealthNewsById(id: number): Promise<HealthNews | undefined> {
    return this.healthNews.find(news => news.id === id);
  }

  async addHealthNews(news: InsertHealthNews): Promise<HealthNews> {
    const newId = this.healthNews.length > 0 
      ? Math.max(...this.healthNews.map(n => n.id)) + 1 
      : 1;
    
    const newNews: HealthNews = {
      id: newId,
      title: news.title,
      content: news.content,
      publishDate: news.publishDate || new Date(),
      tags: news.tags || null,
      source: news.source || null,
      author: news.author || null,
      url: news.url || null,
      imageUrl: news.imageUrl || null
    };
    
    this.healthNews.push(newNews);
    return newNews;
  }

  async updateHealthNews(id: number, updates: Partial<HealthNews>): Promise<HealthNews> {
    const newsIndex = this.healthNews.findIndex(news => news.id === id);
    
    if (newsIndex === -1) {
      throw new Error(`Health news with id ${id} not found`);
    }
    
    const updatedNews = {
      ...this.healthNews[newsIndex],
      ...updates
    };
    
    this.healthNews[newsIndex] = updatedNews;
    return updatedNews;
  }

  async deleteHealthNews(id: number): Promise<boolean> {
    const newsIndex = this.healthNews.findIndex(news => news.id === id);
    
    if (newsIndex === -1) {
      return false;
    }
    
    this.healthNews.splice(newsIndex, 1);
    return true;
  }

  // Health Articles
  async getHealthArticles(): Promise<HealthArticle[]> {
    return this.healthArticles;
  }

  async getHealthArticleById(id: number): Promise<HealthArticle | undefined> {
    return this.healthArticles.find(article => article.id === id);
  }

  async addHealthArticle(article: InsertHealthArticle): Promise<HealthArticle> {
    const newId = this.healthArticles.length > 0 
      ? Math.max(...this.healthArticles.map(a => a.id)) + 1 
      : 1;
    
    const newArticle: HealthArticle = {
      id: newId,
      title: article.title,
      content: article.content,
      summary: article.summary,
      authorName: article.authorName || null,
      publishedAt: article.publishedAt || new Date(),
      category: article.category,
      tags: article.tags || [],
      imageUrl: article.imageUrl || null,
      sourceName: article.sourceName || null,
      sourceUrl: article.sourceUrl || null,
      readTime: article.readTime || null
    };
    
    this.healthArticles.push(newArticle);
    return newArticle;
  }

  async updateHealthArticle(id: number, updates: Partial<HealthArticle>): Promise<HealthArticle> {
    const articleIndex = this.healthArticles.findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      throw new Error(`Health article with id ${id} not found`);
    }
    
    const updatedArticle = {
      ...this.healthArticles[articleIndex],
      ...updates
    };
    
    this.healthArticles[articleIndex] = updatedArticle;
    return updatedArticle;
  }

  async deleteHealthArticle(id: number): Promise<boolean> {
    const articleIndex = this.healthArticles.findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      return false;
    }
    
    this.healthArticles.splice(articleIndex, 1);
    return true;
  }
}