/**
 * Health API Integration Service
 * Manages connections to external health services and APIs
 * Handles OAuth, data import, and synchronization
 */

import { getItem, setItem, removeItem } from './local-storage';

// Supported health service identifiers
export enum HealthService {
  AppleHealth = 'apple',
  Fitbit = 'fitbit',
  Garmin = 'garmin',
  Whoop = 'whoop',
  Oura = 'oura',
  MyFitnessPal = 'myfitnesspal',
  Strava = 'strava',
  Withings = 'withings',
  Peloton = 'peloton',
  Polar = 'polar'
}

// Types of data that can be imported from services
export enum DataType {
  Activity = 'activity',
  HeartRate = 'heartRate',
  Sleep = 'sleep',
  Weight = 'weight',
  Nutrition = 'nutrition',
  Workout = 'workout',
  StressLevel = 'stressLevel',
  BloodGlucose = 'bloodGlucose',
  BloodPressure = 'bloodPressure',
  BodyTemperature = 'bodyTemperature',
  OxygenSaturation = 'oxygenSaturation'
}

// Connection status for a health service
export interface ConnectionStatus {
  connected: boolean;
  lastSynced?: Date;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId?: string;
  scopes?: string[];
}

// Service configuration for OAuth
interface ServiceConfig {
  name: string;
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
  clientId: string;
  supportedDataTypes: DataType[];
  scopes: string;
  redirectPath: string;
}

// Map of health services to their configurations
// In production, client IDs would be stored in environment variables
const serviceConfigs: Record<HealthService, ServiceConfig> = {
  [HealthService.AppleHealth]: {
    name: 'Apple Health',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    apiBaseUrl: 'https://api.apple.com/healthkit',
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'your-apple-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Sleep, 
      DataType.Weight, 
      DataType.Workout
    ],
    scopes: 'name email',
    redirectPath: '/integrations/callback/apple'
  },
  [HealthService.Fitbit]: {
    name: 'Fitbit',
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    apiBaseUrl: 'https://api.fitbit.com',
    clientId: import.meta.env.VITE_FITBIT_CLIENT_ID || 'your-fitbit-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Sleep, 
      DataType.Weight
    ],
    scopes: 'activity heartrate sleep weight profile',
    redirectPath: '/integrations/callback/fitbit'
  },
  [HealthService.Garmin]: {
    name: 'Garmin',
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/token',
    apiBaseUrl: 'https://apis.garmin.com/wellness-api/rest',
    clientId: import.meta.env.VITE_GARMIN_CLIENT_ID || 'your-garmin-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Sleep, 
      DataType.Weight, 
      DataType.Workout
    ],
    scopes: 'activity heartrate sleep weight workout',
    redirectPath: '/integrations/callback/garmin'
  },
  [HealthService.Whoop]: {
    name: 'Whoop',
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    apiBaseUrl: 'https://api.prod.whoop.com/developer',
    clientId: import.meta.env.VITE_WHOOP_CLIENT_ID || 'your-whoop-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Sleep, 
      DataType.Workout, 
      DataType.StressLevel
    ],
    scopes: 'read:recovery read:cycles read:workout read:sleep read:profile',
    redirectPath: '/integrations/callback/whoop'
  },
  [HealthService.Oura]: {
    name: 'Oura Ring',
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    apiBaseUrl: 'https://api.ouraring.com/v2',
    clientId: import.meta.env.VITE_OURA_CLIENT_ID || 'your-oura-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Sleep, 
      DataType.BodyTemperature
    ],
    scopes: 'daily heartrate session tag personal',
    redirectPath: '/integrations/callback/oura'
  },
  [HealthService.MyFitnessPal]: {
    name: 'MyFitnessPal',
    authUrl: 'https://www.myfitnesspal.com/oauth2/auth',
    tokenUrl: 'https://www.myfitnesspal.com/oauth2/token',
    apiBaseUrl: 'https://api.myfitnesspal.com/v2',
    clientId: import.meta.env.VITE_MFP_CLIENT_ID || 'your-mfp-client-id',
    supportedDataTypes: [
      DataType.Nutrition, 
      DataType.Weight
    ],
    scopes: 'diary measurements',
    redirectPath: '/integrations/callback/myfitnesspal'
  },
  [HealthService.Strava]: {
    name: 'Strava',
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token',
    apiBaseUrl: 'https://www.strava.com/api/v3',
    clientId: import.meta.env.VITE_STRAVA_CLIENT_ID || 'your-strava-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Workout
    ],
    scopes: 'read,activity:read_all',
    redirectPath: '/integrations/callback/strava'
  },
  [HealthService.Withings]: {
    name: 'Withings',
    authUrl: 'https://account.withings.com/oauth2_user/authorize2',
    tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
    apiBaseUrl: 'https://wbsapi.withings.net',
    clientId: import.meta.env.VITE_WITHINGS_CLIENT_ID || 'your-withings-client-id',
    supportedDataTypes: [
      DataType.Weight, 
      DataType.BloodPressure, 
      DataType.HeartRate, 
      DataType.BodyTemperature, 
      DataType.OxygenSaturation
    ],
    scopes: 'user.metrics',
    redirectPath: '/integrations/callback/withings'
  },
  [HealthService.Peloton]: {
    name: 'Peloton',
    authUrl: 'https://api.onepeloton.com/auth/oauth',
    tokenUrl: 'https://api.onepeloton.com/auth/token',
    apiBaseUrl: 'https://api.onepeloton.com',
    clientId: import.meta.env.VITE_PELOTON_CLIENT_ID || 'your-peloton-client-id',
    supportedDataTypes: [
      DataType.Workout, 
      DataType.HeartRate
    ],
    scopes: 'read:workout read:user',
    redirectPath: '/integrations/callback/peloton'
  },
  [HealthService.Polar]: {
    name: 'Polar',
    authUrl: 'https://flow.polar.com/oauth2/authorization',
    tokenUrl: 'https://polarremote.com/v2/oauth2/token',
    apiBaseUrl: 'https://www.polaraccesslink.com/v3',
    clientId: import.meta.env.VITE_POLAR_CLIENT_ID || 'your-polar-client-id',
    supportedDataTypes: [
      DataType.Activity, 
      DataType.HeartRate, 
      DataType.Sleep, 
      DataType.Workout
    ],
    scopes: 'accesslink.read_all',
    redirectPath: '/integrations/callback/polar'
  }
};

/**
 * Checks if a service is connected by retrieving stored connection status
 */
export function isServiceConnected(service: HealthService): boolean {
  const status = getConnectionStatus(service);
  if (!status) return false;
  
  // Check if token is expired
  if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
    return false;
  }
  
  return status.connected;
}

/**
 * Get connection status for a health service
 */
export function getConnectionStatus(service: HealthService): ConnectionStatus | null {
  return getItem<ConnectionStatus>(`connection_${service}`);
}

/**
 * Get list of all connected services
 */
export function getConnectedServices(): HealthService[] {
  return Object.values(HealthService).filter(service => isServiceConnected(service));
}

/**
 * Generates an OAuth authorization URL for a specific health service
 */
export function getAuthorizationUrl(service: HealthService): string {
  const config = serviceConfigs[service];
  if (!config) throw new Error(`Unsupported service: ${service}`);
  
  const redirectUri = `${window.location.origin}${config.redirectPath}`;
  const state = generateRandomState();
  
  // Store state for verification when the OAuth flow returns
  setItem(`oauth_state_${service}`, state);
  
  const queryParams = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes,
    state: state
  });
  
  return `${config.authUrl}?${queryParams.toString()}`;
}

/**
 * Initiate OAuth flow for a health service
 */
export function connectService(service: HealthService): void {
  const authUrl = getAuthorizationUrl(service);
  window.location.href = authUrl;
}

/**
 * Handle OAuth callback
 * This would typically be called from a callback route component
 */
export async function handleOAuthCallback(
  service: HealthService,
  code: string,
  state: string
): Promise<boolean> {
  // In a real implementation, this would make an API call to exchange the code for tokens
  // For this example, we'll simulate a successful auth flow
  
  // Verify state matches what we stored before redirecting to OAuth
  const storedState = getItem<string>(`oauth_state_${service}`, false);
  if (!storedState || storedState !== state) {
    throw new Error('OAuth state mismatch - possible CSRF attack');
  }
  
  // In production, exchange code for access token via server to keep client_secret secure
  // Simulate successful connection
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
  
  const connectionStatus: ConnectionStatus = {
    connected: true,
    lastSynced: now,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: expiresAt,
    userId: 'user123',
    scopes: serviceConfigs[service].scopes.split(' ')
  };
  
  // Store connection status
  setItem(`connection_${service}`, connectionStatus);
  
  // Clean up state
  removeItem(`oauth_state_${service}`);
  
  return true;
}

/**
 * Disconnect a health service
 */
export function disconnectService(service: HealthService): void {
  // In production, this would also revoke the token on the service side
  removeItem(`connection_${service}`);
}

/**
 * Get supported data types for a service
 */
export function getSupportedDataTypes(service: HealthService): DataType[] {
  return serviceConfigs[service]?.supportedDataTypes || [];
}

/**
 * Sync data from a connected health service
 * In a real implementation, this would make API calls to fetch data
 */
export async function syncServiceData(
  service: HealthService,
  dataTypes?: DataType[]
): Promise<{ success: boolean; message?: string }> {
  if (!isServiceConnected(service)) {
    return { success: false, message: 'Service not connected' };
  }
  
  // In a real implementation, this would make API calls to fetch data
  // and store it in our application
  
  // Update last synced timestamp
  const status = getConnectionStatus(service);
  if (status) {
    status.lastSynced = new Date();
    setItem(`connection_${service}`, status);
  }
  
  return { success: true };
}

/**
 * Generates a random state string for CSRF protection
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}