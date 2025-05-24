/**
 * Device Integration Manager for Healthmap
 * Handles connections and data normalization for multiple health devices
 */

export interface DeviceConnection {
  id: string;
  userId: number;
  deviceType: 'apple_watch' | 'oura_ring' | 'whoop' | 'dexcom' | 'qardio';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: Date | null;
  permissions: string[];
  metadata: Record<string, any>;
}

export interface HealthMetric {
  id: string;
  userId: number;
  deviceId: string;
  metricType: 'heart_rate' | 'hrv' | 'sleep' | 'activity' | 'temperature' | 'blood_oxygen' | 'blood_pressure' | 'blood_glucose' | 'ecg' | 'respiratory_rate' | 'vo2_max' | 'recovery_score';
  value: number | string;
  unit: string;
  timestamp: Date;
  source: string;
  quality: 'high' | 'medium' | 'low';
  metadata: Record<string, any>;
}

export class DeviceIntegrationManager {
  private connections: Map<string, DeviceConnection> = new Map();

  // Apple HealthKit Integration Framework
  async connectAppleHealthKit(userId: number, permissions: string[]): Promise<DeviceConnection> {
    const connection: DeviceConnection = {
      id: `apple_${userId}_${Date.now()}`,
      userId,
      deviceType: 'apple_watch',
      status: 'pending',
      lastSync: null,
      permissions,
      metadata: {
        deviceName: 'Apple Watch',
        version: 'watchOS 10.0',
        capabilities: ['heart_rate', 'ecg', 'blood_oxygen', 'fall_detection', 'afib_history']
      }
    };

    this.connections.set(connection.id, connection);
    return connection;
  }

  // Oura Ring Integration Framework
  async connectOuraRing(userId: number): Promise<DeviceConnection> {
    const connection: DeviceConnection = {
      id: `oura_${userId}_${Date.now()}`,
      userId,
      deviceType: 'oura_ring',
      status: 'pending',
      lastSync: null,
      permissions: ['sleep', 'readiness', 'activity', 'heart_rate'],
      metadata: {
        deviceName: 'Oura Ring Gen 3',
        capabilities: ['sleep_stages', 'hrv', 'temperature', 'readiness_score']
      }
    };

    this.connections.set(connection.id, connection);
    return connection;
  }

  // WHOOP Integration Framework
  async connectWhoop(userId: number): Promise<DeviceConnection> {
    const connection: DeviceConnection = {
      id: `whoop_${userId}_${Date.now()}`,
      userId,
      deviceType: 'whoop',
      status: 'pending',
      lastSync: null,
      permissions: ['recovery', 'strain', 'sleep', 'heart_rate'],
      metadata: {
        deviceName: 'WHOOP 4.0',
        capabilities: ['strain_score', 'recovery_score', 'sleep_performance', 'hrv']
      }
    };

    this.connections.set(connection.id, connection);
    return connection;
  }

  // Get all connections for a user
  getUserConnections(userId: number): DeviceConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.userId === userId);
  }

  // Update connection status
  updateConnectionStatus(connectionId: string, status: DeviceConnection['status']): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = status;
      if (status === 'connected') {
        connection.lastSync = new Date();
      }
    }
  }
}

export const deviceManager = new DeviceIntegrationManager();