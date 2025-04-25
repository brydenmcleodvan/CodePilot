/**
 * Health Metrics Service
 * Service for managing user health metrics
 */

import { ApiService } from '../core/api-service';
import type { ApiServiceRequestOptions } from '../core/api-service';

// Define health metric types
export enum MetricType {
  STEPS = 'steps',
  HEART_RATE = 'heart_rate',
  SLEEP = 'sleep',
  BLOOD_PRESSURE = 'blood_pressure',
  WEIGHT = 'weight',
  BLOOD_GLUCOSE = 'blood_glucose',
  OXYGEN_SATURATION = 'oxygen_saturation',
  BODY_TEMPERATURE = 'body_temperature',
  MOOD = 'mood',
  WATER_INTAKE = 'water_intake',
  CALORIES = 'calories',
  NUTRITION = 'nutrition',
  ACTIVITY = 'activity',
  STRESS = 'stress'
}

// Base health metric interface
export interface HealthMetric {
  id: string;
  userId: number;
  type: MetricType;
  value: number | string | Record<string, any>;
  unit?: string;
  timestamp: string;
  source?: string;
  tags?: string[];
  notes?: string;
}

// Specific metric type interfaces
export interface StepsMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.STEPS;
  value: number;
  unit: 'steps';
  distance?: number;
  distanceUnit?: 'km' | 'mi';
  duration?: number;
  durationUnit?: 'minutes';
}

export interface HeartRateMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.HEART_RATE;
  value: number;
  unit: 'bpm';
  isResting?: boolean;
  zone?: 'rest' | 'fat_burn' | 'cardio' | 'peak';
}

export interface SleepMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.SLEEP;
  value: {
    duration: number;
    quality: number;
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  unit: 'sleep_record';
  startTime: string;
  endTime: string;
  sleepScores?: {
    overall: number;
    latency?: number;
    disturbances?: number;
    efficiency?: number;
  };
}

export interface BloodPressureMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.BLOOD_PRESSURE;
  value: {
    systolic: number;
    diastolic: number;
  };
  unit: 'mmHg';
  pulseRate?: number;
  position?: 'sitting' | 'standing' | 'lying';
  arm?: 'left' | 'right';
}

export interface BloodGlucoseMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.BLOOD_GLUCOSE;
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  measurementContext?: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random';
  relationToMeal?: {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    minutesSinceMeal?: number;
  };
}

export interface NutritionMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.NUTRITION;
  value: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  unit: 'nutrition_record';
  meal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods?: Array<{
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    nutrients: Record<string, number>;
  }>;
}

export interface MoodMetric extends Omit<HealthMetric, 'type' | 'value' | 'unit'> {
  type: MetricType.MOOD;
  value: number;
  unit: 'scale_1_10';
  emotions?: string[];
  factors?: string[];
  intensity?: number;
}

// Type that can be any specific health metric
export type SpecificHealthMetric = 
  | StepsMetric 
  | HeartRateMetric 
  | SleepMetric 
  | BloodPressureMetric 
  | BloodGlucoseMetric 
  | NutritionMetric 
  | MoodMetric;

// Time range filter
export interface TimeRange {
  startDate: string;
  endDate: string;
}

// Statistics for a metric type
export interface MetricStatistics {
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  stdDev: number;
  trend: number; // Positive or negative change over period
}

// Summary with statistics for a metric type
export interface HealthMetricSummary {
  metricType: MetricType;
  timeRange: TimeRange;
  statistics: MetricStatistics;
  percentiles?: Record<string, number>; // e.g. "90": 120 (90th percentile is 120)
  breakdown?: Record<string, number>; // For categorical breakdowns
  chartData?: Array<{
    date: string;
    value: number;
  }>;
}

// Filter parameters for metrics queries
export interface MetricFilters {
  userId?: number;
  types?: MetricType[];
  startDate?: string;
  endDate?: string;
  sources?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
  sort?: 'timestamp_asc' | 'timestamp_desc' | 'value_asc' | 'value_desc';
}

// Batch import results
export interface BatchImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
  createdMetrics?: HealthMetric[];
}

/**
 * Health Metrics Service Interface
 */
export interface IHealthMetricsService {
  // Core metrics operations
  getMetrics(filters?: MetricFilters): Promise<HealthMetric[]>;
  getMetricById(id: string): Promise<HealthMetric>;
  addMetric<T extends HealthMetric>(metric: Omit<T, 'id'>): Promise<T>;
  updateMetric<T extends HealthMetric>(id: string, updates: Partial<T>): Promise<T>;
  deleteMetric(id: string): Promise<void>;
  
  // Type-specific methods
  getMetricsByType<T extends SpecificHealthMetric>(
    type: MetricType, 
    timeRange?: TimeRange
  ): Promise<T[]>;
  
  // Aggregated data
  getMetricSummary(type: MetricType, timeRange: TimeRange): Promise<HealthMetricSummary>;
  getLatestMetric<T extends SpecificHealthMetric>(type: MetricType): Promise<T | null>;
  getTrends(type: MetricType, timeRange: TimeRange): Promise<{ 
    trend: number;
    changePercent: number;
    isImprovement: boolean;
  }>;
  
  // Bulk operations
  importMetrics<T extends HealthMetric>(metrics: Array<Omit<T, 'id'>>): Promise<BatchImportResult>;
  exportMetrics(filters: MetricFilters, format: 'json' | 'csv'): Promise<Blob>;
}

/**
 * Health Metrics Service Implementation
 */
class HealthMetricsService extends ApiService implements IHealthMetricsService {
  /**
   * Base API endpoint path
   */
  protected basePath = '/api/health/metrics';

  /**
   * Get metrics with optional filtering
   */
  getMetrics(filters: MetricFilters = {}): Promise<HealthMetric[]> {
    return this.get<HealthMetric[]>('/', { params: filters });
  }
  
  /**
   * Get a specific metric by ID
   */
  getMetricById(id: string): Promise<HealthMetric> {
    return this.get<HealthMetric>(`/${id}`);
  }
  
  /**
   * Add a new metric
   */
  addMetric<T extends HealthMetric>(metric: Omit<T, 'id'>): Promise<T> {
    return this.post<T, T>('/', metric);
  }
  
  /**
   * Update an existing metric
   */
  updateMetric<T extends HealthMetric>(id: string, updates: Partial<T>): Promise<T> {
    return this.patch<T, T>(`/${id}`, updates);
  }
  
  /**
   * Delete a metric
   */
  deleteMetric(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
  }
  
  /**
   * Get metrics of a specific type
   */
  getMetricsByType<T extends SpecificHealthMetric>(
    type: MetricType, 
    timeRange?: TimeRange
  ): Promise<T[]> {
    const params: MetricFilters = { types: [type] };
    
    if (timeRange) {
      params.startDate = timeRange.startDate;
      params.endDate = timeRange.endDate;
    }
    
    return this.get<T[]>('/by-type', { params });
  }
  
  /**
   * Get summary statistics for a metric type
   */
  getMetricSummary(type: MetricType, timeRange: TimeRange): Promise<HealthMetricSummary> {
    return this.get<HealthMetricSummary>(`/summary/${type}`, {
      params: {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate
      }
    });
  }
  
  /**
   * Get the most recent metric of a specific type
   */
  async getLatestMetric<T extends SpecificHealthMetric>(type: MetricType): Promise<T | null> {
    const metrics = await this.getMetricsByType<T>(type, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      endDate: new Date().toISOString()
    });
    
    return metrics.length > 0 ? metrics[0] : null;
  }
  
  /**
   * Get trend analysis for a metric type
   */
  getTrends(type: MetricType, timeRange: TimeRange): Promise<{ 
    trend: number;
    changePercent: number;
    isImprovement: boolean;
  }> {
    return this.get<{ 
      trend: number;
      changePercent: number;
      isImprovement: boolean;
    }>(`/trends/${type}`, {
      params: {
        startDate: timeRange.startDate,
        endDate: timeRange.endDate
      }
    });
  }
  
  /**
   * Import multiple metrics at once
   */
  importMetrics<T extends HealthMetric>(metrics: Array<Omit<T, 'id'>>): Promise<BatchImportResult> {
    return this.post<BatchImportResult>('/import', { metrics });
  }
  
  /**
   * Export metrics as a file
   */
  async exportMetrics(filters: MetricFilters, format: 'json' | 'csv'): Promise<Blob> {
    return this.get<Blob>(`/export`, {
      params: {
        ...filters,
        format
      },
      responseType: 'blob',
      skipTransform: true
    });
  }
}

// Export a singleton instance
export const healthMetricsService = new HealthMetricsService();