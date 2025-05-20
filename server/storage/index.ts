import { IStorage } from './storage-interface';
import { MemStorage } from './mem-storage';

// Export the storage interface
export type { IStorage };

// Create and export the storage instance
// This can be switched between different implementations
export const storage = new MemStorage();