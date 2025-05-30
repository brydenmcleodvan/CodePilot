/**
 * Permission system types and constants
 */

// Resource types in the system
export enum ResourceType {
  USER = 'user',
  HEALTH_METRIC = 'health-metric',
  MEDICATION = 'medication',
  SYMPTOM = 'symptom',
  APPOINTMENT = 'appointment',
  HEALTH_CONNECTION = 'health-connection',
  HEALTH_GOAL = 'health-goal',
  PATIENT = 'patient',
  HEALTH_ARTICLE = 'health-article',
  NEWS = 'news',
  FORUM_POST = 'forum-post'
}

// User roles in the system
export enum Role {
  ADMIN = 'admin',
  PROVIDER = 'provider',
  PATIENT = 'patient',
  RESEARCHER = 'researcher',
  CONTENT_MANAGER = 'content-manager'
}

// Action types for permissions
export type Action = 'create' | 'read' | 'update' | 'delete' | 'share' | 'assign'

// Permission conditions for different roles and resources
export const rolePermissions: Record<Role, Record<ResourceType, Action[]>> = {
  [Role.ADMIN]: {
    [ResourceType.USER]: ['create', 'read', 'update', 'delete'],
    [ResourceType.HEALTH_METRIC]: ['create', 'read', 'update', 'delete'],
    [ResourceType.MEDICATION]: ['create', 'read', 'update', 'delete'],
    [ResourceType.SYMPTOM]: ['create', 'read', 'update', 'delete'],
    [ResourceType.APPOINTMENT]: ['create', 'read', 'update', 'delete'],
    [ResourceType.HEALTH_CONNECTION]: ['create', 'read', 'update', 'delete'],
    [ResourceType.HEALTH_GOAL]: ['create', 'read', 'update', 'delete'],
    [ResourceType.PATIENT]: ['read', 'update', 'assign'],
    [ResourceType.HEALTH_ARTICLE]: ['create', 'read', 'update', 'delete'],
    [ResourceType.NEWS]: ['create', 'read', 'update', 'delete'],
    [ResourceType.FORUM_POST]: ['create', 'read', 'update', 'delete']
  },
  [Role.PROVIDER]: {
    [ResourceType.USER]: ['read'],
    [ResourceType.HEALTH_METRIC]: ['create', 'read', 'update'],
    [ResourceType.MEDICATION]: ['create', 'read', 'update'],
    [ResourceType.SYMPTOM]: ['create', 'read', 'update'],
    [ResourceType.APPOINTMENT]: ['create', 'read', 'update'],
    [ResourceType.HEALTH_CONNECTION]: ['read'],
    [ResourceType.HEALTH_GOAL]: ['create', 'read', 'update'],
    [ResourceType.PATIENT]: ['read', 'update'],
    [ResourceType.HEALTH_ARTICLE]: ['read'],
    [ResourceType.NEWS]: ['read'],
    [ResourceType.FORUM_POST]: ['read', 'create']
  },
  [Role.PATIENT]: {
    [ResourceType.USER]: ['read'],
    [ResourceType.HEALTH_METRIC]: ['create', 'read', 'update', 'delete'],
    [ResourceType.MEDICATION]: ['create', 'read', 'update', 'delete'],
    [ResourceType.SYMPTOM]: ['create', 'read', 'update', 'delete'],
    [ResourceType.APPOINTMENT]: ['create', 'read', 'update', 'delete'],
    [ResourceType.HEALTH_CONNECTION]: ['create', 'read', 'update', 'delete'],
    [ResourceType.HEALTH_GOAL]: ['create', 'read', 'update', 'delete'],
    [ResourceType.PATIENT]: [],
    [ResourceType.HEALTH_ARTICLE]: ['read'],
    [ResourceType.NEWS]: ['read'],
    [ResourceType.FORUM_POST]: ['create', 'read', 'update', 'delete']
  },
  [Role.RESEARCHER]: {
    [ResourceType.USER]: [],
    [ResourceType.HEALTH_METRIC]: ['read'],
    [ResourceType.MEDICATION]: ['read'],
    [ResourceType.SYMPTOM]: ['read'],
    [ResourceType.APPOINTMENT]: [],
    [ResourceType.HEALTH_CONNECTION]: [],
    [ResourceType.HEALTH_GOAL]: ['read'],
    [ResourceType.PATIENT]: ['read'],
    [ResourceType.HEALTH_ARTICLE]: ['read'],
    [ResourceType.NEWS]: ['read'],
    [ResourceType.FORUM_POST]: ['read']
  },
  [Role.CONTENT_MANAGER]: {
    [ResourceType.USER]: [],
    [ResourceType.HEALTH_METRIC]: [],
    [ResourceType.MEDICATION]: [],
    [ResourceType.SYMPTOM]: [],
    [ResourceType.APPOINTMENT]: [],
    [ResourceType.HEALTH_CONNECTION]: [],
    [ResourceType.HEALTH_GOAL]: [],
    [ResourceType.PATIENT]: [],
    [ResourceType.HEALTH_ARTICLE]: ['create', 'read', 'update', 'delete'],
    [ResourceType.NEWS]: ['create', 'read', 'update', 'delete'],
    [ResourceType.FORUM_POST]: ['read', 'update', 'delete']
  }
};

// Special permission checks for resource ownership
export const ownershipPermissions: Record<ResourceType, Action[]> = {
  [ResourceType.USER]: ['read', 'update', 'delete'],
  [ResourceType.HEALTH_METRIC]: ['read', 'update', 'delete', 'share'],
  [ResourceType.MEDICATION]: ['read', 'update', 'delete', 'share'],
  [ResourceType.SYMPTOM]: ['read', 'update', 'delete', 'share'],
  [ResourceType.APPOINTMENT]: ['read', 'update', 'delete', 'share'],
  [ResourceType.HEALTH_CONNECTION]: ['read', 'update', 'delete'],
  [ResourceType.HEALTH_GOAL]: ['read', 'update', 'delete', 'share'],
  [ResourceType.PATIENT]: [],
  [ResourceType.HEALTH_ARTICLE]: [],
  [ResourceType.NEWS]: [],
  [ResourceType.FORUM_POST]: ['read', 'update', 'delete']
};

// Permission checks for healthcare relationships (provider-patient)
export const healthcareRelationshipPermissions: Record<string, Action[]> = {
  'primary_care': ['read', 'update'],
  'specialist': ['read'],
  'nutritionist': ['read'],
  'physical_therapy': ['read'],
  'mental_health': ['read', 'update']
};