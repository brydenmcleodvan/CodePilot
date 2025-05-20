import { 
  Permission, 
  ResourceType, 
  ResourceAction, 
  ConditionType,
  SystemRoles
} from './permission-types';

/**
 * Interface for a user with role information
 */
export interface UserWithRoles {
  id: number;
  username: string;
  roles: string[];
  [key: string]: any;
}

/**
 * Checks if a user has permission to perform an action on a resource
 * 
 * @param user The user attempting the action
 * @param resourceType The type of resource being accessed
 * @param action The action being performed
 * @param resource Optional resource object for condition checking
 * @returns True if the user has permission, false otherwise
 */
export function hasPermission(
  user: UserWithRoles,
  resourceType: ResourceType,
  action: ResourceAction,
  resource?: any
): boolean {
  // System admin has all permissions
  if (user.roles.includes(SystemRoles.ADMIN.id)) {
    return true;
  }
  
  // Get all permissions from the user's roles
  const userPermissions: Permission[] = user.roles.flatMap(roleId => {
    const role = Object.values(SystemRoles).find(r => r.id === roleId);
    return role ? role.permissions : [];
  });
  
  // Check if the user has a matching permission
  for (const permission of userPermissions) {
    // Check if resource type and action match
    if (permission.resourceType === resourceType && permission.action === action) {
      // If no conditions, permission is granted
      if (!permission.conditions || permission.conditions.length === 0) {
        return true;
      }
      
      // Check all conditions
      if (resource && checkConditions(permission.conditions, user, resource)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Checks if all conditions are met for a permission
 * 
 * @param conditions List of conditions to check
 * @param user The user attempting the action
 * @param resource The resource being accessed
 * @returns True if all conditions are met, false otherwise
 */
function checkConditions(conditions: Permission['conditions'], user: UserWithRoles, resource: any): boolean {
  if (!conditions) return true;
  
  // All conditions must be satisfied
  return conditions.every(condition => {
    switch (condition.type) {
      case ConditionType.OWNERSHIP:
        // Check if the user is the owner of the resource
        return resource.userId === user.id || resource.ownerId === user.id;
        
      case ConditionType.SHARED:
        // Check if the resource is shared with the user
        if (resource.sharedWith && Array.isArray(resource.sharedWith)) {
          return resource.sharedWith.includes(user.id);
        }
        return false;
        
      case ConditionType.FIELD_EQUALS:
        // Check if a field has a specific value
        if (condition.field && condition.value !== undefined) {
          return resource[condition.field] === condition.value;
        }
        return false;
        
      case ConditionType.FIELD_CONTAINS:
        // Check if a field contains a specific value
        if (condition.field && condition.value !== undefined && resource[condition.field]) {
          if (Array.isArray(resource[condition.field])) {
            return resource[condition.field].includes(condition.value);
          } else if (typeof resource[condition.field] === 'string') {
            return resource[condition.field].includes(String(condition.value));
          }
        }
        return false;
        
      case ConditionType.RELATION_EQUALS:
        // More complex relation check (simplified for now)
        return true;
        
      case ConditionType.TIME_RANGE:
        // Time-based condition checking
        return true;
        
      default:
        return false;
    }
  });
}

/**
 * Express middleware to check permissions for a specific resource and action
 * 
 * @param resourceType The type of resource being accessed
 * @param action The action being performed
 * @param getResource Optional function to retrieve the resource
 * @returns Express middleware function
 */
export function requirePermission(
  resourceType: ResourceType,
  action: ResourceAction,
  getResource?: (req: any) => Promise<any> | any
) {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Add default roles if not present
    const userWithRoles: UserWithRoles = {
      ...req.user,
      roles: req.user.roles || ['user']
    };
    
    let resource = null;
    
    // Get the resource if a getter function is provided
    if (getResource) {
      try {
        resource = await Promise.resolve(getResource(req));
        
        if (!resource) {
          return res.status(404).json({
            message: 'Resource not found',
            code: 'RESOURCE_NOT_FOUND'
          });
        }
      } catch (error) {
        console.error('Error retrieving resource for permission check:', error);
        return res.status(500).json({
          message: 'Error retrieving resource',
          code: 'RESOURCE_RETRIEVAL_ERROR'
        });
      }
    }
    
    // Check if the user has permission
    if (hasPermission(userWithRoles, resourceType, action, resource)) {
      next();
    } else {
      res.status(403).json({
        message: 'You do not have permission to perform this action',
        code: 'PERMISSION_DENIED',
        requiredPermission: { resourceType, action }
      });
    }
  };
}