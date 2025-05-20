import { 
  BASE_PERMISSIONS, 
  Permission, 
  PermissionContext, 
  ResourceType, 
  Action, 
  Role, 
  ConditionType 
} from './permission-types';
import { storage } from '../../storage';

/**
 * PermissionChecker class
 * 
 * Responsible for checking if a user has permission to perform
 * an action on a resource based on the defined RBAC rules.
 */
export class PermissionChecker {
  private permissions: Permission[] = BASE_PERMISSIONS;

  /**
   * Check if a user has permission to perform an action on a resource
   * 
   * @param userId The ID of the user making the request
   * @param resource The resource being accessed
   * @param action The action being performed
   * @param context Additional context for conditional permissions
   * @returns Boolean indicating if the user has permission
   */
  async hasPermission(
    userId: number,
    resource: ResourceType,
    action: Action,
    context: Partial<PermissionContext> = {}
  ): Promise<boolean> {
    // Get user with roles
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }

    // Get user roles
    const userRoles = (user.roles?.map(role => role as Role) || [Role.PATIENT]); // Default to PATIENT if no roles
    
    // Admin role has all permissions
    if (userRoles.includes(Role.ADMIN)) {
      return true;
    }

    // Build full context
    const fullContext: PermissionContext = {
      userId,
      userRoles,
      resourceId: context.resourceId,
      resourceOwnerId: context.resourceOwnerId,
      relationshipIds: context.relationshipIds || [],
      customData: context.customData || {}
    };

    // Check permissions
    for (const role of userRoles) {
      // Find matching permission
      const matchingPermissions = this.permissions.filter(
        p => p.role === role && p.resource === resource && p.action === action
      );

      // If no matching permissions, continue to next role
      if (matchingPermissions.length === 0) {
        continue;
      }

      // Check each matching permission
      for (const permission of matchingPermissions) {
        // If no condition, permission is granted
        if (!permission.condition) {
          return true;
        }

        // Check condition
        const hasPermission = await this.checkCondition(permission, fullContext);
        if (hasPermission) {
          return true;
        }
      }
    }

    // Special case: If user has MANAGE permission on the resource, they can perform any action
    for (const role of userRoles) {
      const managePermission = this.permissions.find(
        p => p.role === role && p.resource === resource && p.action === Action.MANAGE
      );

      if (managePermission) {
        if (!managePermission.condition) {
          return true;
        }

        const hasPermission = await this.checkCondition(managePermission, fullContext);
        if (hasPermission) {
          return true;
        }
      }
    }

    // Special case: Admin resource MANAGE permission means all permissions
    for (const role of userRoles) {
      const adminPermission = this.permissions.find(
        p => p.role === role && p.resource === ResourceType.ADMIN && p.action === Action.MANAGE
      );

      if (adminPermission) {
        if (!adminPermission.condition) {
          return true;
        }

        const hasPermission = await this.checkCondition(adminPermission, fullContext);
        if (hasPermission) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check a permission condition against the context
   * 
   * @param permission The permission to check
   * @param context The context of the request
   * @returns Boolean indicating if the condition is satisfied
   */
  private async checkCondition(permission: Permission, context: PermissionContext): Promise<boolean> {
    if (!permission.condition) {
      return true;
    }

    switch (permission.condition.type) {
      case ConditionType.OWNER:
        return this.checkOwnership(context);
        
      case ConditionType.ASSIGNED:
        return this.checkAssignment(permission, context);
        
      case ConditionType.RELATIONSHIP:
        return this.checkRelationship(permission, context);
        
      case ConditionType.TIMEFRAME:
        return this.checkTimeframe(permission, context);
        
      case ConditionType.CUSTOM:
        return this.checkCustomCondition(permission, context);
        
      default:
        return false;
    }
  }

  /**
   * Check if the user is the owner of the resource
   */
  private async checkOwnership(context: PermissionContext): Promise<boolean> {
    if (!context.resourceId) {
      return true; // If no specific resource is being accessed, allow
    }

    if (!context.resourceOwnerId) {
      // Try to get owner ID from storage
      try {
        const resourceOwnerId = await storage.getResourceOwnerId(
          context.resourceId,
          context.customData?.resourceType as string
        );
        
        if (resourceOwnerId === null || resourceOwnerId === undefined) {
          return false;
        }
        
        return resourceOwnerId === context.userId;
      } catch (error) {
        console.error('Error checking resource ownership', error);
        return false;
      }
    }

    return context.resourceOwnerId === context.userId;
  }

  /**
   * Check if the user is assigned to the resource
   */
  private async checkAssignment(permission: Permission, context: PermissionContext): Promise<boolean> {
    if (!context.resourceId) {
      return true; // If no specific resource is being accessed, allow
    }

    try {
      const isAssigned = await storage.isUserAssignedToResource(
        context.userId,
        context.resourceId,
        context.customData?.resourceType as string
      );
      
      return isAssigned;
    } catch (error) {
      console.error('Error checking resource assignment', error);
      return false;
    }
  }

  /**
   * Check if the user has a relationship with the resource owner
   */
  private async checkRelationship(permission: Permission, context: PermissionContext): Promise<boolean> {
    if (!context.resourceOwnerId) {
      // Try to get owner ID from storage
      try {
        const resourceOwnerId = await storage.getResourceOwnerId(
          context.resourceId!,
          context.customData?.resourceType as string
        );
        
        if (resourceOwnerId === null || resourceOwnerId === undefined) {
          return false;
        }
        
        return this.checkUserRelationship(context.userId, resourceOwnerId);
      } catch (error) {
        console.error('Error checking relationship', error);
        return false;
      }
    }

    return this.checkUserRelationship(context.userId, context.resourceOwnerId);
  }

  /**
   * Check if user has a relationship with another user
   */
  private async checkUserRelationship(userId: number, targetUserId: number): Promise<boolean> {
    // If it's the same user, the relationship is trivially established
    if (userId === targetUserId) {
      return true;
    }

    try {
      // Check if there is a healthcare relationship
      const hasRelationship = await storage.hasHealthcareRelationship(userId, targetUserId);
      return hasRelationship;
    } catch (error) {
      console.error('Error checking healthcare relationship', error);
      return false;
    }
  }

  /**
   * Check if the request is within the allowed timeframe
   */
  private checkTimeframe(permission: Permission, context: PermissionContext): boolean {
    const params = permission.condition?.params;
    if (!params) {
      return false;
    }

    const now = new Date();
    
    if (params.startDate && new Date(params.startDate) > now) {
      return false;
    }
    
    if (params.endDate && new Date(params.endDate) < now) {
      return false;
    }
    
    return true;
  }

  /**
   * Check a custom condition
   */
  private async checkCustomCondition(permission: Permission, context: PermissionContext): Promise<boolean> {
    const customFunction = permission.condition?.params?.customFunction;
    
    if (!customFunction || typeof customFunction !== 'function') {
      return false;
    }
    
    try {
      return await customFunction(context);
    } catch (error) {
      console.error('Error in custom permission check', error);
      return false;
    }
  }

  /**
   * Create a permission middleware for Express
   * 
   * @param resource The resource being accessed
   * @param action The action being performed
   * @param getContext Optional function to get additional context from the request
   * @returns Express middleware function
   */
  createMiddleware(
    resource: ResourceType,
    action: Action,
    getContext?: (req: any) => Promise<Partial<PermissionContext>> | Partial<PermissionContext>
  ) {
    return async (req: any, res: any, next: any) => {
      try {
        // If user is not authenticated, deny access
        if (!req.user || !req.user.id) {
          return res.status(401).json({ message: 'Authentication required' });
        }

        // Get additional context if provided
        let additionalContext: Partial<PermissionContext> = {};
        if (getContext) {
          additionalContext = await getContext(req);
        }

        // Check permission
        const hasPermission = await this.hasPermission(
          req.user.id,
          resource,
          action,
          additionalContext
        );

        if (hasPermission) {
          return next();
        } else {
          return res.status(403).json({ message: 'Access denied' });
        }
      } catch (error) {
        console.error('Permission middleware error:', error);
        return res.status(500).json({ message: 'Server error' });
      }
    };
  }
}

// Create and export a singleton instance
export const permissionChecker = new PermissionChecker();