/**
 * Permission types definition for Role-Based Access Control (RBAC)
 * 
 * This module defines the core types and constants for the permission system.
 */

/**
 * Resource types that can be protected
 */
export enum ResourceType {
  // User resources
  USER = 'user',
  USER_PROFILE = 'user_profile',
  
  // Health data
  HEALTH_METRIC = 'health_metric',
  MEDICATION = 'medication',
  SYMPTOM = 'symptom',
  APPOINTMENT = 'appointment',
  
  // Content
  FORUM_POST = 'forum_post',
  HEALTH_ARTICLE = 'health_article',
  HEALTH_NEWS = 'health_news',
  
  // System
  SYSTEM = 'system',
  ADMIN = 'admin'
}

/**
 * Actions that can be performed on resources
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  MANAGE = 'manage'
}

/**
 * User roles within the system
 */
export enum Role {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
  CONTENT_MANAGER = 'content_manager',
  SYSTEM = 'system'
}

/**
 * Permission definition structure
 */
export interface Permission {
  role: Role;
  resource: ResourceType;
  action: Action;
  condition?: PermissionCondition;
}

/**
 * Condition types for conditional permissions
 */
export enum ConditionType {
  OWNER = 'owner',
  ASSIGNED = 'assigned',
  TIMEFRAME = 'timeframe',
  RELATIONSHIP = 'relationship',
  CUSTOM = 'custom'
}

/**
 * Permission condition structure
 */
export interface PermissionCondition {
  type: ConditionType;
  params?: Record<string, any>;
}

/**
 * Context for permission checks
 */
export interface PermissionContext {
  userId: number;
  userRoles: Role[];
  resourceId?: number;
  resourceOwnerId?: number;
  relationshipIds?: number[];
  customData?: Record<string, any>;
}

/**
 * Base permission definition sets
 * These define what different roles can do
 */
export const BASE_PERMISSIONS: Permission[] = [
  // Patient permissions
  {
    role: Role.PATIENT,
    resource: ResourceType.USER_PROFILE,
    action: Action.READ,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.USER_PROFILE,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.CREATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.READ,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.DELETE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.LIST,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.MEDICATION,
    action: Action.CREATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.MEDICATION,
    action: Action.READ,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.MEDICATION,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.MEDICATION,
    action: Action.DELETE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.MEDICATION,
    action: Action.LIST,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.SYMPTOM,
    action: Action.CREATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.SYMPTOM,
    action: Action.READ,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.SYMPTOM,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.SYMPTOM,
    action: Action.DELETE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.SYMPTOM,
    action: Action.LIST,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.APPOINTMENT,
    action: Action.CREATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.APPOINTMENT,
    action: Action.READ,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.APPOINTMENT,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.APPOINTMENT,
    action: Action.DELETE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.APPOINTMENT,
    action: Action.LIST,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.FORUM_POST,
    action: Action.CREATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.FORUM_POST,
    action: Action.READ
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.FORUM_POST,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.FORUM_POST,
    action: Action.DELETE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.FORUM_POST,
    action: Action.LIST
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.READ
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.LIST
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.READ
  },
  {
    role: Role.PATIENT,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.LIST
  },

  // Doctor permissions
  {
    role: Role.DOCTOR,
    resource: ResourceType.USER_PROFILE,
    action: Action.READ
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.READ,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.LIST,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.MEDICATION,
    action: Action.CREATE
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.MEDICATION,
    action: Action.READ,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.MEDICATION,
    action: Action.UPDATE,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.MEDICATION,
    action: Action.LIST,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.SYMPTOM,
    action: Action.READ,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.SYMPTOM,
    action: Action.LIST,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.APPOINTMENT,
    action: Action.CREATE
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.APPOINTMENT,
    action: Action.READ,
    condition: { type: ConditionType.ASSIGNED }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.APPOINTMENT,
    action: Action.UPDATE,
    condition: { type: ConditionType.ASSIGNED }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.APPOINTMENT,
    action: Action.LIST,
    condition: { type: ConditionType.ASSIGNED }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.FORUM_POST,
    action: Action.CREATE
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.FORUM_POST,
    action: Action.READ
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.FORUM_POST,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.FORUM_POST,
    action: Action.LIST
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.CREATE
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.READ
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.UPDATE,
    condition: { type: ConditionType.OWNER }
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.LIST
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.READ
  },
  {
    role: Role.DOCTOR,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.LIST
  },

  // Nurse permissions
  {
    role: Role.NURSE,
    resource: ResourceType.USER_PROFILE,
    action: Action.READ
  },
  {
    role: Role.NURSE,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.READ,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.HEALTH_METRIC,
    action: Action.LIST,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.MEDICATION,
    action: Action.READ,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.MEDICATION,
    action: Action.LIST,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.SYMPTOM,
    action: Action.READ,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.SYMPTOM,
    action: Action.LIST,
    condition: { type: ConditionType.RELATIONSHIP }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.APPOINTMENT,
    action: Action.READ,
    condition: { type: ConditionType.ASSIGNED }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.APPOINTMENT,
    action: Action.LIST,
    condition: { type: ConditionType.ASSIGNED }
  },
  {
    role: Role.NURSE,
    resource: ResourceType.FORUM_POST,
    action: Action.READ
  },
  {
    role: Role.NURSE,
    resource: ResourceType.FORUM_POST,
    action: Action.LIST
  },
  {
    role: Role.NURSE,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.READ
  },
  {
    role: Role.NURSE,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.LIST
  },
  {
    role: Role.NURSE,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.READ
  },
  {
    role: Role.NURSE,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.LIST
  },

  // Content Manager permissions
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.FORUM_POST,
    action: Action.READ
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.FORUM_POST,
    action: Action.UPDATE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.FORUM_POST,
    action: Action.DELETE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.FORUM_POST,
    action: Action.LIST
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.CREATE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.READ
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.UPDATE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.DELETE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_ARTICLE,
    action: Action.LIST
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.CREATE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.READ
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.UPDATE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.DELETE
  },
  {
    role: Role.CONTENT_MANAGER,
    resource: ResourceType.HEALTH_NEWS,
    action: Action.LIST
  },

  // Admin permissions - has access to everything
  {
    role: Role.ADMIN,
    resource: ResourceType.ADMIN,
    action: Action.MANAGE
  },

  // System permissions
  {
    role: Role.SYSTEM,
    resource: ResourceType.SYSTEM,
    action: Action.MANAGE
  }
];