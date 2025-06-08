/**
 * Progressive Web App Service
 * Manages PWA features, offline support, and service worker registration
 */

class PWAService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineData = new Map();
    this.syncQueue = [];
    
    this.initializeOfflineSupport();
    this.registerNetworkListeners();
  }

  /**
   * Initialize offline support and data caching
   */
  initializeOfflineSupport() {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
    
    // Initialize offline data storage
    this.loadOfflineData();
  }

  /**
   * Register service worker for PWA capabilities
   */
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            this.showUpdateAvailable();
          }
        });
      });
    } catch (error) {
      console.log('Service Worker registration not available in this environment');
      // Use localStorage-based offline support instead
      this.useLocalStorageFallback();
    }
  }

  /**
   * Fallback offline support using localStorage
   */
  useLocalStorageFallback() {
    console.log('Using localStorage fallback for offline support');
    
    // Intercept fetch requests when offline
    if (!this.isOnline) {
      window.addEventListener('beforeunload', () => {
        this.saveOfflineData();
      });
    }
  }

  /**
   * Register network status listeners
   */
  registerNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkStatusChange(false);
    });
  }

  /**
   * Handle network status changes
   */
  onNetworkStatusChange(isOnline) {
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    
    if (isOnline) {
      this.syncOfflineData();
      this.showOnlineNotification();
    } else {
      this.showOfflineNotification();
    }
  }

  /**
   * Cache health data for offline access
   */
  cacheHealthData(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: new Date().toISOString(),
        offline: !this.isOnline
      };
      
      this.offlineData.set(key, cacheData);
      localStorage.setItem(`healthmap_cache_${key}`, JSON.stringify(cacheData));
      
      console.log(`Cached health data: ${key}`);
    } catch (error) {
      console.warn('Failed to cache health data:', error);
    }
  }

  /**
   * Get cached health data
   */
  getCachedHealthData(key) {
    try {
      // Check in-memory cache first
      if (this.offlineData.has(key)) {
        return this.offlineData.get(key);
      }
      
      // Check localStorage
      const cached = localStorage.getItem(`healthmap_cache_${key}`);
      if (cached) {
        const parsedData = JSON.parse(cached);
        this.offlineData.set(key, parsedData);
        return parsedData;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get cached health data:', error);
      return null;
    }
  }

  /**
   * Queue data for sync when online
   */
  queueForSync(action, data) {
    const syncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.syncQueue.push(syncItem);
    this.saveSyncQueue();
    
    console.log('Queued for sync:', action);
  }

  /**
   * Sync offline data when back online
   */
  async syncOfflineData() {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    console.log(`Syncing ${this.syncQueue.length} offline items...`);
    
    const failedItems = [];
    
    for (const item of this.syncQueue) {
      try {
        await this.syncSingleItem(item);
        console.log('Synced item:', item.action);
      } catch (error) {
        console.error('Failed to sync item:', error);
        failedItems.push(item);
      }
    }
    
    // Update sync queue with failed items
    this.syncQueue = failedItems;
    this.saveSyncQueue();
    
    if (failedItems.length === 0) {
      this.showSyncCompleteNotification();
    }
  }

  /**
   * Sync a single item
   */
  async syncSingleItem(item) {
    const { action, data } = item;
    
    // Map actions to API endpoints
    const endpointMap = {
      'log_symptom': '/api/symptoms',
      'log_medication': '/api/medications/log',
      'update_health_metrics': '/api/health-metrics',
      'save_journal_entry': '/api/journal-entries',
      'track_feature_usage': '/api/log-feature-usage'
    };
    
    const endpoint = endpointMap[action];
    if (!endpoint) {
      throw new Error(`Unknown sync action: ${action}`);
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Save offline data to localStorage
   */
  saveOfflineData() {
    try {
      const dataToSave = Array.from(this.offlineData.entries());
      localStorage.setItem('healthmap_offline_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save offline data:', error);
    }
  }

  /**
   * Load offline data from localStorage
   */
  loadOfflineData() {
    try {
      const saved = localStorage.getItem('healthmap_offline_data');
      if (saved) {
        const dataArray = JSON.parse(saved);
        this.offlineData = new Map(dataArray);
      }
      
      // Load sync queue
      const syncQueue = localStorage.getItem('healthmap_sync_queue');
      if (syncQueue) {
        this.syncQueue = JSON.parse(syncQueue);
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error);
    }
  }

  /**
   * Save sync queue to localStorage
   */
  saveSyncQueue() {
    try {
      localStorage.setItem('healthmap_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  /**
   * Show notifications for different states
   */
  showOfflineNotification() {
    this.showNotification('You are offline', 'Data will be synced when connection is restored', 'warning');
  }

  showOnlineNotification() {
    this.showNotification('Back online', 'Syncing your data...', 'success');
  }

  showSyncCompleteNotification() {
    this.showNotification('Sync complete', 'All your offline data has been saved', 'success');
  }

  showUpdateAvailable() {
    this.showNotification('Update available', 'Refresh to get the latest features', 'info');
  }

  /**
   * Generic notification handler
   */
  showNotification(title, message, type = 'info') {
    // This would integrate with your notification system
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    
    // You could use a toast library or custom notification component here
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }

  /**
   * Check if app can be installed as PWA
   */
  canInstallPWA() {
    return 'standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches;
  }

  /**
   * Get offline capabilities status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      cachedDataCount: this.offlineData.size,
      syncQueueLength: this.syncQueue.length,
      canInstall: this.canInstallPWA()
    };
  }
}

// Export singleton instance
export const pwaService = new PWAService();