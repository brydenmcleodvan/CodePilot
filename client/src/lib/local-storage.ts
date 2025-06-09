import { ConnectedService } from "./health-api-integration";

// Local storage keys
const LS_CONNECTED_SERVICES = "healthmap_connected_services";

export function useLocalStorage() {
  // Get all connected services from localStorage
  const getConnectedServices = (): ConnectedService[] => {
    try {
      const servicesJson = localStorage.getItem(LS_CONNECTED_SERVICES);
      if (!servicesJson) return [];
      
      const services = JSON.parse(servicesJson);
      
      // Convert string dates to Date objects
      return services.map((service: any) => ({
        ...service,
        connectedAt: new Date(service.connectedAt),
        lastSynced: service.lastSynced ? new Date(service.lastSynced) : null
      }));
    } catch (error) {
      console.error("Error retrieving connected services from localStorage:", error);
      return [];
    }
  };

  // Get a specific connected service by ID
  const getConnectedServiceById = (serviceId: string): ConnectedService | undefined => {
    const services = getConnectedServices();
    return services.find(service => service.id === serviceId);
  };

  // Save a new connected service
  const saveConnectedService = (service: ConnectedService): boolean => {
    try {
      const services = getConnectedServices();
      
      // Check if service with same ID already exists
      const existingIndex = services.findIndex(s => s.id === service.id);
      
      if (existingIndex >= 0) {
        // Replace existing service
        services[existingIndex] = service;
      } else {
        // Add new service
        services.push(service);
      }
      
      // Save to localStorage
      localStorage.setItem(LS_CONNECTED_SERVICES, JSON.stringify(services));
      return true;
    } catch (error) {
      console.error("Error saving connected service to localStorage:", error);
      return false;
    }
  };

  // Update an existing connected service
  const updateConnectedService = (serviceId: string, updates: Partial<ConnectedService>): boolean => {
    try {
      const services = getConnectedServices();
      const index = services.findIndex(service => service.id === serviceId);
      
      if (index < 0) return false;
      
      // Update the service
      services[index] = {
        ...services[index],
        ...updates
      };
      
      // Save to localStorage
      localStorage.setItem(LS_CONNECTED_SERVICES, JSON.stringify(services));
      return true;
    } catch (error) {
      console.error("Error updating connected service in localStorage:", error);
      return false;
    }
  };

  // Remove a connected service
  const removeConnectedService = (serviceId: string): boolean => {
    try {
      const services = getConnectedServices();
      const filteredServices = services.filter(service => service.id !== serviceId);
      
      // Save to localStorage
      localStorage.setItem(LS_CONNECTED_SERVICES, JSON.stringify(filteredServices));
      return true;
    } catch (error) {
      console.error("Error removing connected service from localStorage:", error);
      return false;
    }
  };

  // Clear all connected services
  const clearConnectedServices = (): boolean => {
    try {
      localStorage.removeItem(LS_CONNECTED_SERVICES);
      return true;
    } catch (error) {
      console.error("Error clearing connected services from localStorage:", error);
      return false;
    }
  };

  return {
    getConnectedServices,
    getConnectedServiceById,
    saveConnectedService,
    updateConnectedService,
    removeConnectedService,
    clearConnectedServices
  };
}

// Other local storage utilities

// Save data for offline use
export function saveOfflineData(key: string, data: any): boolean {
  try {
    localStorage.setItem(`healthmap_offline_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving offline data for ${key}:`, error);
    return false;
  }
}

// Retrieve offline data
export function getOfflineData(key: string): any {
  try {
    const data = localStorage.getItem(`healthmap_offline_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving offline data for ${key}:`, error);
    return null;
  }
}

// Check if we have offline data for a specific key
export function hasOfflineData(key: string): boolean {
  return localStorage.getItem(`healthmap_offline_${key}`) !== null;
}

// Remove offline data
export function removeOfflineData(key: string): boolean {
  try {
    localStorage.removeItem(`healthmap_offline_${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing offline data for ${key}:`, error);
    return false;
  }
}

// Get the timestamp when offline data was last updated
export function getOfflineDataTimestamp(key: string): Date | null {
  try {
    const timestampStr = localStorage.getItem(`healthmap_offline_${key}_timestamp`);
    return timestampStr ? new Date(timestampStr) : null;
  } catch (error) {
    console.error(`Error retrieving offline data timestamp for ${key}:`, error);
    return null;
  }
}

// Set the timestamp when offline data was updated
export function setOfflineDataTimestamp(key: string): boolean {
  try {
    localStorage.setItem(`healthmap_offline_${key}_timestamp`, new Date().toISOString());
    return true;
  } catch (error) {
    console.error(`Error setting offline data timestamp for ${key}:`, error);
    return false;
  }
}

// Utility for checking if we should use offline data
// based on the last update timestamp and maxAge in milliseconds
export function shouldUseOfflineData(key: string, maxAge: number = 3600000): boolean {
  const timestamp = getOfflineDataTimestamp(key);
  if (!timestamp) return false;
  
  const age = Date.now() - timestamp.getTime();
  return age <= maxAge && hasOfflineData(key);
}

// Get all offline data keys
export function getOfflineDataKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('healthmap_offline_') && !key.endsWith('_timestamp')) {
      keys.push(key.replace('healthmap_offline_', ''));
    }
  }
  return keys;
}