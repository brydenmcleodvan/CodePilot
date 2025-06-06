import { MemStorage } from './storage';

/**
 * Create a new in-memory storage instance populated with default demo data.
 */
export const initializeData = (): MemStorage => {
  return new MemStorage();
};
