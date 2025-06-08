import { and, asc, eq, gte } from 'drizzle-orm';
import { db } from '../db';
import { healthMetrics } from '@shared/schema';

/**
 * Fetch recent metrics for a user and metric type.
 * Limits the result set and selects only needed columns for performance.
 */
export async function getRecentMetrics(
  userId: number,
  metricType: string,
  startTime: Date
) {
  return db
    .select({
      value: healthMetrics.value,
      timestamp: healthMetrics.timestamp,
    })
    .from(healthMetrics)
    .where(
      and(
        eq(healthMetrics.userId, userId),
        eq(healthMetrics.metricType, metricType),
        gte(healthMetrics.timestamp, startTime)
      )
    )
    .orderBy(asc(healthMetrics.timestamp))
    .limit(500);
}
