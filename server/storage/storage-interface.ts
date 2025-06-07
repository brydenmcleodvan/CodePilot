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
 * Storage interface for all data operations
 * This ensures consistency between different storage implementations
 */
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getUserRoles(userId: number): Promise<string[]>;
  
  // Forum posts
  createPost(post: InsertForumPost): Promise<ForumPost>;
  getPosts(): Promise<ForumPost[]>;
  getPostById(id: number): Promise<ForumPost | undefined>;
  getPostsByUserId(userId: number): Promise<ForumPost[]>;
  deletePost(id: number): Promise<boolean>;
  
  // Health data
  getHealthMetrics(userId: number): Promise<HealthMetric[]>;
  getHealthMetricById(id: number): Promise<HealthMetric | undefined>;
  addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  updateHealthMetric(id: number, metric: Partial<HealthMetric>): Promise<HealthMetric>;
  deleteHealthMetric(id: number): Promise<boolean>;
  
  // Medications
  getMedications(userId: number): Promise<Medication[]>;
  getMedicationById(id: number): Promise<Medication | undefined>;
  addMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<Medication>): Promise<Medication>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Symptoms
  getSymptoms(userId: number): Promise<Symptom[]>;
  getSymptomById(id: number): Promise<Symptom | undefined>;
  addSymptom(symptom: InsertSymptom): Promise<Symptom>;
  updateSymptom(id: number, symptom: Partial<Symptom>): Promise<Symptom>;
  deleteSymptom(id: number): Promise<boolean>;
  
  // Appointments
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  addAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Health data connections
  getHealthDataConnections(userId: number): Promise<HealthDataConnection[]>;
  getHealthDataConnectionById(id: number): Promise<HealthDataConnection | undefined>;
  addHealthDataConnection(connection: InsertHealthDataConnection): Promise<HealthDataConnection>;
  updateHealthDataConnection(id: number, connection: Partial<HealthDataConnection>): Promise<HealthDataConnection>;
  deleteHealthDataConnection(id: number): Promise<boolean>;
  
  // Security - Token Management
  storeTokenMetadata(metadata: InsertTokenMetadata): Promise<TokenMetadata>;
  revokeToken(tokenId: string, reason?: string): Promise<boolean>;
  getTokenById(tokenId: string): Promise<TokenMetadata | undefined>;
  revokeAllUserTokens(userId: number, reason?: string): Promise<number>;
  deleteExpiredTokens(): Promise<number>;
  
  // Security - RBAC Support
  getResourceOwnerId(resourceId: number, resourceType: string): Promise<number | null>;
  isUserAssignedToResource(userId: number, resourceId: number, resourceType: string): Promise<boolean>;
  hasHealthcareRelationship(providerId: number, patientId: number): Promise<boolean>;
  getUserRelationships(userId: number): Promise<UserRelationship[]>;
  createUserRelationship(relationship: InsertUserRelationship): Promise<UserRelationship>;
  createHealthcareRelationship(relationship: InsertHealthcareRelationship): Promise<HealthcareRelationship>;
  getHealthcareRelationships(providerId: number): Promise<HealthcareRelationship[]>;
  
  // Analytics
  recordUserEvent(event: InsertUserEvent): Promise<UserEvent>;
  recordUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  recordErrorLog(error: InsertErrorLog): Promise<ErrorLog>;
  getUserEvents(userId: number): Promise<UserEvent[]>;
  getUserFeedback(userId: number): Promise<UserFeedback[]>;
  getErrorLogs(): Promise<ErrorLog[]>;
  
  // News API
  getHealthNews(): Promise<HealthNews[]>;
  getHealthNewsById(id: number): Promise<HealthNews | undefined>;
  addHealthNews(news: InsertHealthNews): Promise<HealthNews>;
  updateHealthNews(id: number, news: Partial<HealthNews>): Promise<HealthNews>;
  deleteHealthNews(id: number): Promise<boolean>;
  
  // Health Articles
  getHealthArticles(): Promise<HealthArticle[]>;
  getHealthArticleById(id: number): Promise<HealthArticle | undefined>;
  addHealthArticle(article: InsertHealthArticle): Promise<HealthArticle>;
  updateHealthArticle(id: number, article: Partial<HealthArticle>): Promise<HealthArticle>;
  deleteHealthArticle(id: number): Promise<boolean>;
  
  // Health Goals
  getHealthGoals(userId: number): Promise<any[]>;
  addHealthGoal(goal: any): Promise<any>;
  getGoalProgress(userId: number, goalId: string, days?: number): Promise<any[]>;
  addGoalProgress(progress: any): Promise<any>;
  getGoalStreak(userId: number, goalId: string): Promise<number>;
  
  // Connected Services
  getConnectedServices(userId: number): Promise<any[]>;
  updateConnectedService(serviceData: any): Promise<any>;

  // Combined timeline
  getUserTimeline(userId: number): Promise<any[]>;
}