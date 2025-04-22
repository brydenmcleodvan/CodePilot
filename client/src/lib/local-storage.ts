/**
 * Local Storage Service
 * Manages data persistence using localStorage and IndexedDB
 * for offline access of health data within the application
 */

// Constants
const STORAGE_PREFIX = 'healthfolio_';
const STORAGE_VERSION = '1.0';
const DB_NAME = 'healthfolioDB';
const DB_VERSION = 1;

// Storage state
let indexedDBEnabled = false;
let db: IDBDatabase | null = null;

// Initialize IndexedDB if available in browser
export function initIndexedDB(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB is not supported in this browser');
      resolve(false);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB access denied');
      resolve(false);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      indexedDBEnabled = true;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for health data
      if (!db.objectStoreNames.contains('healthMetrics')) {
        db.createObjectStore('healthMetrics', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('nutrition')) {
        db.createObjectStore('nutrition', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('medications')) {
        db.createObjectStore('medications', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Check if the browser supports local storage
 */
export function isLocalStorageAvailable(): boolean {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if offline mode is enabled
 */
export function isOfflineModeEnabled(): boolean {
  return localStorage.getItem(`${STORAGE_PREFIX}offlineMode`) === 'enabled';
}

/**
 * Enable or disable offline mode
 */
export function setOfflineMode(enable: boolean): void {
  localStorage.setItem(`${STORAGE_PREFIX}offlineMode`, enable ? 'enabled' : 'disabled');
}

/**
 * Get value from local storage with proper prefix and optional parsing
 */
export function getItem<T>(key: string, parse: boolean = true): T | null {
  const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!value) return null;
  
  return parse ? JSON.parse(value) as T : value as unknown as T;
}

/**
 * Set value in local storage with proper prefix
 */
export function setItem(key: string, value: any): void {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, stringValue);
}

/**
 * Remove item from local storage
 */
export function removeItem(key: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}

/**
 * Clear all app-related data from local storage
 */
export function clearStorage(): void {
  // Only clear keys with our prefix
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Calculate approximate local storage usage in bytes
 */
export function getStorageUsage(): { used: number, total: number } {
  let totalBytes = 0;
  let usedBytes = 0;
  
  // Conservative estimate of localStorage max capacity (5MB is common)
  // Browser limitations vary, but 5MB is a reasonable default
  totalBytes = 5 * 1024 * 1024;
  
  // Calculate used bytes from our app's keys only
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      usedBytes += (key.length + (localStorage.getItem(key)?.length || 0)) * 2; // UTF-16 chars = 2 bytes
    }
  });
  
  return { used: usedBytes, total: totalBytes };
}

// IndexedDB Operations

/**
 * Store data in IndexedDB
 */
export async function storeInDB<T>(storeName: string, data: T): Promise<boolean> {
  return new Promise((resolve) => {
    if (!db || !indexedDBEnabled) {
      resolve(false);
      return;
    }
    
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (err) {
      console.error('Error storing data in IndexedDB:', err);
      resolve(false);
    }
  });
}

/**
 * Get data from IndexedDB by ID
 */
export async function getFromDB<T>(storeName: string, id: string | number): Promise<T | null> {
  return new Promise((resolve) => {
    if (!db || !indexedDBEnabled) {
      resolve(null);
      return;
    }
    
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        resolve(null);
      };
    } catch (err) {
      console.error('Error getting data from IndexedDB:', err);
      resolve(null);
    }
  });
}

/**
 * Get all data from a specific store
 */
export async function getAllFromDB<T>(storeName: string): Promise<T[]> {
  return new Promise((resolve) => {
    if (!db || !indexedDBEnabled) {
      resolve([]);
      return;
    }
    
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        resolve([]);
      };
    } catch (err) {
      console.error('Error getting all data from IndexedDB:', err);
      resolve([]);
    }
  });
}

/**
 * Remove data from IndexedDB
 */
export async function removeFromDB(storeName: string, id: string | number): Promise<boolean> {
  return new Promise((resolve) => {
    if (!db || !indexedDBEnabled) {
      resolve(false);
      return;
    }
    
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (err) {
      console.error('Error removing data from IndexedDB:', err);
      resolve(false);
    }
  });
}

/**
 * Clear all data from a specific store
 */
export async function clearStoreDB(storeName: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!db || !indexedDBEnabled) {
      resolve(false);
      return;
    }
    
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (err) {
      console.error('Error clearing store in IndexedDB:', err);
      resolve(false);
    }
  });
}

/**
 * Clear entire IndexedDB
 */
export async function clearDB(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!db || !indexedDBEnabled) {
      resolve(false);
      return;
    }
    
    // Get list of all object stores
    const storeNames = Array.from(db.objectStoreNames);
    
    // Clear each store
    Promise.all(storeNames.map(storeName => clearStoreDB(storeName)))
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

// Initialize IndexedDB when this module is imported
if (typeof window !== 'undefined') {
  initIndexedDB().catch(console.error);
}