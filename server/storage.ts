import { 
  User, 
  HealthMetric, 
  Medication, 
  Symptom, 
  Appointment, 
  HealthDataConnection, 
  HealthArticle,
  ForumPost
} from '@shared/schema';

// Define the storage interface for authentication and data operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: Omit<User, 'id'>): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Health metrics
  getHealthMetrics(userId: number): Promise<HealthMetric[]>;
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  addHealthMetric(metricData: Omit<HealthMetric, 'id'>): Promise<HealthMetric>;
  
  // Medications
  getMedications(userId: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  addMedication(medicationData: Omit<Medication, 'id'>): Promise<Medication>;
  
  // Symptoms
  getSymptoms(userId: number): Promise<Symptom[]>;
  getSymptom(id: number): Promise<Symptom | undefined>;
  addSymptom(symptomData: Omit<Symptom, 'id'>): Promise<Symptom>;
  
  // Appointments
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  addAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment>;
  
  // Health data connections
  getHealthDataConnections(userId: number): Promise<HealthDataConnection[]>;
  getHealthDataConnection(id: number): Promise<HealthDataConnection | undefined>;
  addHealthDataConnection(connectionData: Omit<HealthDataConnection, 'id'>): Promise<HealthDataConnection>;
  
  // Forum posts
  getForumPosts(): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  addForumPost(postData: Omit<ForumPost, 'id'>): Promise<ForumPost>;
  
  // Health articles and news
  getHealthArticles(): Promise<HealthArticle[]>;
  getHealthArticle(id: number): Promise<HealthArticle | undefined>;
  getHealthNews(): Promise<any[]>; // Simplified news structure
  
  // Security and permissions
  
  // Token management
  getTokenById(tokenId: string): Promise<any>;
  storeTokenMetadata(tokenData: any): Promise<void>;
  revokeToken(tokenId: string): Promise<void>;
  revokeAllUserTokens(userId: number): Promise<void>;
  
  // Resource ownership
  getResourceOwnerId(resourceId: number, resourceType: string): Promise<number | null>;
  isUserAssignedToResource(userId: number, resourceId: number, resourceType: string): Promise<boolean>;
  
  // Healthcare relationships
  hasHealthcareRelationship(providerId: number, patientId: number): Promise<boolean>;
  getHealthcareRelationships(providerId: number): Promise<any[]>;
}

// In-memory implementation
class MemStorage implements IStorage {
  private users: User[] = [];
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
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
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
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
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
    
    const medication: Medication = {
      id,
      ...medicationData,
      // Ensure required fields have default values
      notes: medicationData.notes ?? null,
      dosage: medicationData.dosage ?? null,
      frequency: medicationData.frequency ?? null,
      endDate: medicationData.endDate ?? null,
      prescribedBy: medicationData.prescribedBy ?? null,
      active: medicationData.active ?? null
    };
    
    this.medications.push(medication);
    
    // Add to ownership table
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
      // Ensure required fields have default values
      notes: symptomData.notes ?? null,
      endTime: symptomData.endTime ?? null,
      relatedCondition: symptomData.relatedCondition ?? null,
      bodyLocation: symptomData.bodyLocation ?? null
    };
    
    this.symptoms.push(symptom);
    
    // Add to ownership table
    this.resourceOwnership.push({
      resourceId: id,
      resourceType: 'symptom',
      ownerId: symptomData.userId
    });
    
    return symptom;
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
}

// Export the storage implementation
export const storage = new MemStorage();