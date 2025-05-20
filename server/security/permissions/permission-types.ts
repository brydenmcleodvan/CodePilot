/**
 * Defines the available permission types within the system
 * Using a resource-based permission model with granular actions
 */

/**
 * Standard resource actions that can be performed
 */
export enum ResourceAction {
  CREATE = 'create', 
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Special actions
  SHARE = 'share',
  ADMIN = 'admin'
}

/**
 * Resource types available in the system
 */
export enum ResourceType {
  // User data
  USER = 'user',
  PROFILE = 'profile',
  
  // Health data
  HEALTH_DATA = 'health_data',
  MEDICAL_RECORD = 'medical_record',
  APPOINTMENT = 'appointment',
  MEDICATION = 'medication',
  SYMPTOM = 'symptom',
  DIAGNOSIS = 'diagnosis',
  
  // Wellness features
  WELLNESS_CHALLENGE = 'wellness_challenge',
  HEALTH_JOURNEY = 'health_journey',
  MEAL_PLAN = 'meal_plan',
  EXERCISE_PLAN = 'exercise_plan',
  MEDITATION = 'meditation',
  
  // Other resources
  CONTENT = 'content',
  NOTIFICATION = 'notification',
  REPORT = 'report',
  INTEGRATION = 'integration',
  
  // System level
  SYSTEM = 'system',
  ADMIN = 'admin'
}

/**
 * Permission object combining resource type, action, and conditions
 */
export interface Permission {
  resourceType: ResourceType;
  action: ResourceAction;
  conditions?: PermissionCondition[];
}

/**
 * Conditional permissions that limit the scope of access
 */
export interface PermissionCondition {
  type: ConditionType;
  field?: string;
  value?: any;
}

/**
 * Types of conditions that can be applied to permissions
 */
export enum ConditionType {
  // Resource is owned by the user
  OWNERSHIP = 'ownership',
  
  // Resource is shared with the user
  SHARED = 'shared',
  
  // Resource has a specific field value
  FIELD_EQUALS = 'field_equals',
  
  // Resource has a specific field containing a value
  FIELD_CONTAINS = 'field_contains',
  
  // Resource has a related field value
  RELATION_EQUALS = 'relation_equals',
  
  // Time-based condition (e.g., within last 30 days)
  TIME_RANGE = 'time_range'
}

/**
 * Role definitions with associated permissions
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Standard system roles
 */
export const SystemRoles: Record<string, Role> = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      {
        resourceType: ResourceType.SYSTEM,
        action: ResourceAction.ADMIN
      }
    ]
  },
  
  USER: {
    id: 'user',
    name: 'Standard User',
    description: 'Regular user with access to own data',
    permissions: [
      // User permissions
      {
        resourceType: ResourceType.USER,
        action: ResourceAction.READ,
        conditions: [{ type: ConditionType.OWNERSHIP }]
      },
      {
        resourceType: ResourceType.USER,
        action: ResourceAction.UPDATE,
        conditions: [{ type: ConditionType.OWNERSHIP }]
      },
      
      // Health data permissions
      {
        resourceType: ResourceType.HEALTH_DATA,
        action: ResourceAction.CREATE
      },
      {
        resourceType: ResourceType.HEALTH_DATA,
        action: ResourceAction.READ,
        conditions: [{ type: ConditionType.OWNERSHIP }]
      },
      {
        resourceType: ResourceType.HEALTH_DATA,
        action: ResourceAction.UPDATE,
        conditions: [{ type: ConditionType.OWNERSHIP }]
      },
      {
        resourceType: ResourceType.HEALTH_DATA,
        action: ResourceAction.DELETE,
        conditions: [{ type: ConditionType.OWNERSHIP }]
      },
      
      // Access to shared content
      {
        resourceType: ResourceType.CONTENT,
        action: ResourceAction.READ
      }
    ]
  },
  
  GUEST: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited access for unauthenticated users',
    permissions: [
      {
        resourceType: ResourceType.CONTENT,
        action: ResourceAction.READ,
        conditions: [{ 
          type: ConditionType.FIELD_EQUALS,
          field: 'isPublic',
          value: true
        }]
      }
    ]
  }
};

// Adding healthcare provider role separately to avoid circular references
SystemRoles.HEALTHCARE_PROVIDER = {
  id: 'healthcare_provider',
  name: 'Healthcare Provider',
  description: 'Medical professional with additional access to patient data',
  permissions: [
    // Basic permissions similar to user
    {
      resourceType: ResourceType.USER,
      action: ResourceAction.READ,
      conditions: [{ type: ConditionType.OWNERSHIP }]
    },
    {
      resourceType: ResourceType.USER,
      action: ResourceAction.UPDATE,
      conditions: [{ type: ConditionType.OWNERSHIP }]
    },
    {
      resourceType: ResourceType.HEALTH_DATA,
      action: ResourceAction.CREATE
    },
    {
      resourceType: ResourceType.HEALTH_DATA,
      action: ResourceAction.READ,
      conditions: [{ type: ConditionType.OWNERSHIP }]
    },
    {
      resourceType: ResourceType.HEALTH_DATA,
      action: ResourceAction.UPDATE,
      conditions: [{ type: ConditionType.OWNERSHIP }]
    },
    {
      resourceType: ResourceType.HEALTH_DATA,
      action: ResourceAction.DELETE,
      conditions: [{ type: ConditionType.OWNERSHIP }]
    },
    {
      resourceType: ResourceType.CONTENT,
      action: ResourceAction.READ
    },
    
    // Additional provider permissions
    {
      resourceType: ResourceType.MEDICAL_RECORD,
      action: ResourceAction.READ,
      conditions: [{ type: ConditionType.SHARED }]
    },
    {
      resourceType: ResourceType.APPOINTMENT,
      action: ResourceAction.CREATE
    },
    {
      resourceType: ResourceType.APPOINTMENT,
      action: ResourceAction.READ,
      conditions: [{ type: ConditionType.RELATION_EQUALS }]
    }
  ]
};