/**
 * Type exports
 * Re-export all types for easy imports
 */

export * from './auth';
export * from './api';

// Global application state
export interface AppState {
  darkMode: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  initialized: boolean;
}

// Notification type
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionPath?: string;
  actionText?: string;
}