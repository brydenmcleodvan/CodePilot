import { User } from "@shared/schema";
import { 
  Action, 
  ResourceType, 
  Role, 
  rolePermissions, 
  ownershipPermissions,
  healthcareRelationshipPermissions 
} from "./permission-types";
import { storage } from "../../storage";

/**
 * Check if a user has permission to perform an action on a resource
 * This is the main entry point for permission checking
 * 
 * @param user The user attempting the action
 * @param action The action being performed (create, read, update, delete, share, assign)
 * @param resourceType The type of resource being accessed
 * @param resourceId Optional resource ID if checking for a specific resource
 * @returns True if the user has permission, false otherwise
 */
export async function checkPermission(
  user: User,
  action: Action,
  resourceType: ResourceType,
  resourceId?: number
): Promise<boolean> {
  // User not provided
  if (!user) {
    return false;
  }

  // Get user roles
  const userRoles = (user.roles?.map(role => role as Role) || [Role.PATIENT]); // Default to PATIENT if no roles
  
  // Admin role has all permissions
  if (userRoles.includes(Role.ADMIN)) {
    return true;
  }

  // Check if the user has role-based permission for the action
  const hasRolePermission = userRoles.some(role => {
    const rolePerms = rolePermissions[role][resourceType];
    return rolePerms?.includes(action);
  });

  // If user has role permission, allow the action
  if (hasRolePermission) {
    return true;
  }

  // If no specific resource ID is provided, we've already checked role permissions
  if (!resourceId) {
    return false;
  }

  // Check ownership-based permissions
  const ownershipPerms = ownershipPermissions[resourceType];
  if (ownershipPerms?.includes(action)) {
    const isOwner = await checkResourceOwnership(user.id, resourceId, resourceType);
    if (isOwner) {
      return true;
    }
  }

  // Check if the user is assigned to the resource
  const isAssigned = await checkResourceAssignment(user.id, resourceId, resourceType, action);
  if (isAssigned) {
    return true;
  }

  // Check if this is a healthcare provider-patient relationship
  if (resourceType === ResourceType.PATIENT || 
      resourceType === ResourceType.HEALTH_METRIC || 
      resourceType === ResourceType.MEDICATION || 
      resourceType === ResourceType.SYMPTOM || 
      resourceType === ResourceType.APPOINTMENT) {
    
    const patientId = await getPatientIdForResource(resourceId, resourceType);
    if (patientId && userRoles.includes(Role.PROVIDER)) {
      return await checkHealthcareRelationship(user.id, patientId, action);
    }
  }

  // No permission granted
  return false;
}

/**
 * Check if a user is the owner of a resource
 */
async function checkResourceOwnership(
  userId: number, 
  resourceId: number, 
  resourceType: ResourceType
): Promise<boolean> {
  // Some resources are owned by the user directly
  if (resourceType === ResourceType.USER) {
    return userId === resourceId;
  }

  // For other resources, check the resource ownership table
  const ownerId = await storage.getResourceOwnerId(resourceId, resourceType);
  return ownerId === userId;
}

/**
 * Check if a user is assigned to a resource
 */
async function checkResourceAssignment(
  userId: number, 
  resourceId: number, 
  resourceType: ResourceType,
  action: Action
): Promise<boolean> {
  // Check if the user is assigned to the resource
  const isAssigned = await storage.isUserAssignedToResource(userId, resourceId, resourceType);
  return isAssigned;
}

/**
 * Get the patient ID associated with a health resource
 */
async function getPatientIdForResource(
  resourceId: number, 
  resourceType: ResourceType
): Promise<number | null> {
  if (resourceType === ResourceType.PATIENT) {
    return resourceId;
  }

  // For health resources, get the owner (patient)
  return await storage.getResourceOwnerId(resourceId, resourceType);
}

/**
 * Check if a healthcare provider has permission to access patient data
 */
async function checkHealthcareRelationship(
  providerId: number, 
  patientId: number,
  action: Action
): Promise<boolean> {
  // Check if the provider has a healthcare relationship with the patient
  const hasRelationship = await storage.hasHealthcareRelationship(providerId, patientId);
  if (!hasRelationship) {
    return false;
  }

  // Get the relationship details to check specific permissions
  const relationships = await storage.getHealthcareRelationships(providerId);
  const patientRelationship = relationships.find(r => r.patientId === patientId);
  
  if (!patientRelationship) {
    return false;
  }

  // Check if the relationship type grants permission for this action
  const relationshipType = patientRelationship.relationshipType;
  const permittedActions = healthcareRelationshipPermissions[relationshipType] || [];
  return permittedActions.includes(action);
}