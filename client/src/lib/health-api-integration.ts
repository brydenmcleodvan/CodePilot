import { apiRequest } from "./queryClient";
import { useLocalStorage } from "./local-storage";

// Define the health services we can connect to
export enum HealthService {
  APPLE = "apple",
  FITBIT = "fitbit",
  GARMIN = "garmin",
  WHOOP = "whoop",
  OURA = "oura",
  MYFITNESSPAL = "myfitnesspal"
}

// Configuration for each service
export const healthServiceConfig = {
  [HealthService.APPLE]: {
    name: "Apple Health",
    icon: "ri-apple-fill",
    description: "Connect to Apple Health to sync your activity, sleep, and vitals data.",
    color: "bg-gray-100 dark:bg-gray-700 text-black dark:text-white",
    authUrl: "https://appleid.apple.com/auth/authorize",
    scopes: ["activity", "sleep", "vitals"],
    requiresIos: true
  },
  [HealthService.FITBIT]: {
    name: "Fitbit",
    icon: "ri-heart-pulse-line",
    description: "Connect to Fitbit to sync your activity, sleep, and heart rate data.",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400",
    authUrl: "https://www.fitbit.com/oauth2/authorize",
    scopes: ["activity", "heartrate", "sleep", "weight", "nutrition"]
  },
  [HealthService.GARMIN]: {
    name: "Garmin",
    icon: "ri-run-line",
    description: "Connect to Garmin Connect to sync your activities, sleep, and metrics.",
    color: "bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400",
    authUrl: "https://connect.garmin.com/oauthConfirm",
    scopes: ["activity", "sleep", "heartrate"]
  },
  [HealthService.WHOOP]: {
    name: "Whoop",
    icon: "ri-heart-fill",
    description: "Connect to Whoop to sync your recovery, strain, and sleep data.",
    color: "bg-black/10 dark:bg-white/5 text-gray-800 dark:text-gray-200",
    authUrl: "https://api.prod.whoop.com/oauth/oauth2/auth",
    scopes: ["read:recovery", "read:sleep", "read:workout"]
  },
  [HealthService.OURA]: {
    name: "Oura Ring",
    icon: "ri-fingerprint-line",
    description: "Connect to Oura to sync your sleep, activity, and readiness data.",
    color: "bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400",
    authUrl: "https://cloud.ouraring.com/oauth/authorize",
    scopes: ["daily", "personal", "heartrate", "session"]
  },
  [HealthService.MYFITNESSPAL]: {
    name: "MyFitnessPal",
    icon: "ri-restaurant-line",
    description: "Connect to MyFitnessPal to sync your nutrition and calorie data.",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400",
    authUrl: "https://api.myfitnesspal.com/oauth2/authorize",
    scopes: ["diary", "measurements"]
  }
};

// Interface for connected service
export interface ConnectedService {
  id: string;
  service: HealthService;
  connectedAt: Date;
  lastSynced: Date | null;
  dataPoints: number;
  status: "active" | "expired" | "error";
  autoSync: boolean;
}

// Start OAuth flow for a service
export async function connectHealthService(service: HealthService): Promise<void> {
  try {
    // Get the configuration for the service
    const config = healthServiceConfig[service];

    // Check if this is Apple Health (which needs special handling on iOS)
    if (service === HealthService.APPLE && config.requiresIos) {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (!isIos) {
        throw new Error("Apple Health connection is only available on iOS devices");
      }
      
      // On iOS, we would use the Health app directly
      // But for our implementation, we'll simulate the connection
      
      // Save a mock connection in local storage
      const { saveConnectedService } = useLocalStorage();
      
      const mockConnection: ConnectedService = {
        id: `apple-${Date.now()}`,
        service: HealthService.APPLE,
        connectedAt: new Date(),
        lastSynced: new Date(),
        dataPoints: 0,
        status: "active",
        autoSync: true
      };
      
      saveConnectedService(mockConnection);
      
      return;
    }

    // For other services, we'll use the standard OAuth flow
    // Generate a random state value for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store the state in localStorage to verify when we return
    localStorage.setItem(`oauth_state_${service}`, state);
    
    // Build the authorization URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append("client_id", import.meta.env.VITE_OAUTH_CLIENT_ID || "mock-client-id");
    authUrl.searchParams.append("redirect_uri", `${window.location.origin}/integrations/callback/${service}`);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("scope", config.scopes.join(" "));
    
    // Redirect to the auth URL
    window.location.href = authUrl.toString();
  } catch (error) {
    console.error(`Error connecting to ${service}:`, error);
    throw error;
  }
}

// Handle the OAuth callback
export async function handleOAuthCallback(
  service: HealthService,
  code: string,
  state: string
): Promise<boolean> {
  try {
    // Verify the state parameter to prevent CSRF attacks
    const savedState = localStorage.getItem(`oauth_state_${service}`);
    if (!savedState || savedState !== state) {
      throw new Error("Invalid state parameter");
    }
    
    // Clear the state from localStorage
    localStorage.removeItem(`oauth_state_${service}`);
    
    // In a real implementation, we would exchange the code for an access token
    // by calling our backend API
    /*
    const response = await apiRequest("POST", "/api/integrations/oauth-callback", {
      service,
      code
    });
    
    if (!response.ok) {
      throw new Error("Failed to exchange authorization code for access token");
    }
    
    const data = await response.json();
    */
    
    // For our implementation, we'll simulate a successful connection
    const { saveConnectedService } = useLocalStorage();
    
    const mockConnection: ConnectedService = {
      id: `${service}-${Date.now()}`,
      service,
      connectedAt: new Date(),
      lastSynced: new Date(),
      dataPoints: 0,
      status: "active",
      autoSync: true
    };
    
    saveConnectedService(mockConnection);
    
    return true;
  } catch (error) {
    console.error(`Error handling OAuth callback for ${service}:`, error);
    throw error;
  }
}

// Get all connected services
export function getConnectedServices(): ConnectedService[] {
  const { getConnectedServices } = useLocalStorage();
  return getConnectedServices();
}

// Update a connected service
export function updateConnectedService(
  serviceId: string,
  updates: Partial<ConnectedService>
): boolean {
  const { updateConnectedService } = useLocalStorage();
  return updateConnectedService(serviceId, updates);
}

// Disconnect a service
export function disconnectHealthService(serviceId: string): boolean {
  const { removeConnectedService } = useLocalStorage();
  return removeConnectedService(serviceId);
}

// Sync data for a particular service
export async function syncHealthService(serviceId: string): Promise<boolean> {
  const { getConnectedServiceById, updateConnectedService } = useLocalStorage();
  
  try {
    const service = getConnectedServiceById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }
    
    // In a real implementation, we would call our backend API to sync data
    /*
    const response = await apiRequest("POST", `/api/integrations/${service.service}/sync`, {
      serviceId
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync data for ${service.service}`);
    }
    
    const data = await response.json();
    */
    
    // For our implementation, we'll simulate a successful sync
    // Updated service with new sync time and random data points
    const updatedService: Partial<ConnectedService> = {
      lastSynced: new Date(),
      dataPoints: service.dataPoints + Math.floor(Math.random() * 1000)
    };
    
    // Update the service in localStorage
    updateConnectedService(serviceId, updatedService);
    
    return true;
  } catch (error) {
    console.error(`Error syncing health service:`, error);
    return false;
  }
}