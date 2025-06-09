/**
 * Local-First Storage Implementation
 * 
 * This service implements the "local-first" approach to data storage,
 * keeping sensitive health data on the client device by default and
 * only syncing to the server when explicitly opted in.
 * 
 * Benefits:
 * - Privacy: Sensitive health data stays on the user's device
 * - Offline support: App works without internet connection
 * - Performance: No network latency for data access
 * - Reduced server load: Only sync essential data
 */

import { getPrivacyPreferences } from "@/components/privacy/privacy-settings";
import { apiRequest } from "@/lib/queryClient";

// Define version for schema migrations
const STORAGE_VERSION = "1.0";
const VERSION_KEY = "healthmap_storage_version";

// Storage namespace prefixes
const HEALTH_DATA_PREFIX = "healthmap_health_";
const USER_PREFS_PREFIX = "healthmap_prefs_";
const TRACKING_PREFIX = "healthmap_track_";
const CACHED_PREFIX = "healthmap_cache_";

// Define types of data
export enum StorageType {
  HEALTH_DATA = "health", // Sensitive health metrics, medications, etc.
  USER_PREFERENCES = "preferences", // User settings, UI preferences
  TRACKING_DATA = "tracking", // Tracking and usage data
  CACHED_DATA = "cached", // Cached server responses
}

/**
 * Generate a storage key with the appropriate prefix based on data type
 */
const getStorageKey = (type: StorageType, key: string): string => {
  switch (type) {
    case StorageType.HEALTH_DATA:
      return `${HEALTH_DATA_PREFIX}${key}`;
    case StorageType.USER_PREFERENCES:
      return `${USER_PREFS_PREFIX}${key}`;
    case StorageType.TRACKING_DATA:
      return `${TRACKING_PREFIX}${key}`;
    case StorageType.CACHED_DATA:
      return `${CACHED_PREFIX}${key}`;
  }
};

/**
 * Check if a data type should be stored only locally based on user preferences
 */
const shouldStoreLocalOnly = (type: StorageType): boolean => {
  const { preferLocalStorage } = getPrivacyPreferences();
  
  // Always respect user preference for health data
  if (type === StorageType.HEALTH_DATA) {
    return preferLocalStorage;
  }
  
  // For other data types, use different rules
  return false;
};

/**
 * Save data to local storage
 */
export const saveLocal = <T>(type: StorageType, key: string, data: T): void => {
  try {
    const storageKey = getStorageKey(type, key);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to local storage: ${key}`, error);
    // Handle localStorage errors (e.g., quota exceeded)
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Could implement storage cleanup here
    }
  }
};

/**
 * Load data from local storage
 */
export const loadLocal = <T>(type: StorageType, key: string, defaultValue: T): T => {
  try {
    const storageKey = getStorageKey(type, key);
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData === null) {
      return defaultValue;
    }
    
    return JSON.parse(storedData) as T;
  } catch (error) {
    console.error(`Error loading from local storage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Remove data from local storage
 */
export const removeLocal = (type: StorageType, key: string): void => {
  try {
    const storageKey = getStorageKey(type, key);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error removing from local storage: ${key}`, error);
  }
};

/**
 * Save data using local-first approach
 * 
 * Saves to local storage first, then to server if appropriate
 */
export const saveData = async <T>(
  type: StorageType,
  key: string,
  data: T,
  syncEndpoint?: string
): Promise<boolean> => {
  // Always save locally first
  saveLocal(type, key, data);
  
  // If local-only storage is enabled for this data type, or no endpoint provided, stop here
  if (shouldStoreLocalOnly(type) || !syncEndpoint) {
    return true;
  }
  
  // Otherwise, also save to server
  try {
    const response = await apiRequest("POST", syncEndpoint, { key, data });
    return response.ok;
  } catch (error) {
    console.error(`Error syncing data to server: ${key}`, error);
    return false;
  }
};

/**
 * Load data using local-first approach
 * 
 * Checks local storage first, then fetches from server if needed or if refresh is true
 */
export const loadData = async <T>(
  type: StorageType,
  key: string,
  defaultValue: T,
  fetchEndpoint?: string,
  refresh = false
): Promise<T> => {
  // Always check local storage first
  const localData = loadLocal(type, key, defaultValue);
  
  // If refresh is false and we have local data, or if no endpoint is provided, return local data
  if ((!refresh && localData !== defaultValue) || !fetchEndpoint) {
    return localData;
  }
  
  // If local-only storage is enabled for this data type, don't fetch from server
  if (shouldStoreLocalOnly(type)) {
    return localData;
  }
  
  // Otherwise, try to fetch from server
  try {
    const response = await apiRequest("GET", `${fetchEndpoint}?key=${encodeURIComponent(key)}`);
    if (response.ok) {
      const serverData = await response.json();
      // Update local storage with server data
      saveLocal(type, key, serverData);
      return serverData;
    }
  } catch (error) {
    console.error(`Error fetching data from server: ${key}`, error);
  }
  
  // Fall back to local data if server fetch fails
  return localData;
};

/**
 * Initialize storage subsystem
 * 
 * Checks for version changes and handles migrations if needed
 */
export const initStorage = (): void => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    // If no version or different version, perform migration
    if (storedVersion !== STORAGE_VERSION) {
      // Could implement migration logic here for schema changes
      
      // Update version
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch (error) {
    console.error("Error initializing local storage:", error);
  }
};

/**
 * Clear all application data from local storage
 * 
 * Use this when a user logs out or wants to clear their data
 */
export const clearAllData = (): void => {
  try {
    // Find all keys that start with our prefixes
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith(HEALTH_DATA_PREFIX) ||
        key.startsWith(USER_PREFS_PREFIX) ||
        key.startsWith(TRACKING_PREFIX) ||
        key.startsWith(CACHED_PREFIX)
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} items from local storage`);
  } catch (error) {
    console.error("Error clearing local storage:", error);
  }
};