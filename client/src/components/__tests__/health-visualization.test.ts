import { describe, it, expect } from 'vitest';
import { transformHealthData } from '../../lib/transformHealthData';

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe('transformHealthData', () => {
  it('returns empty array when no stats provided', () => {
    expect(transformHealthData([])).toEqual([]);
  });

  it('groups stats by date and parses values', () => {
    const day1 = isoDaysAgo(1);
    const day2 = isoDaysAgo(2);
    const stats = [
      { timestamp: day1, statType: 'heart_rate', value: '80' },
      { timestamp: day1, statType: 'steps', value: '1000' },
      { timestamp: day2, statType: 'sleep', value: '7.5' }
    ];

    const result = transformHealthData(stats);
    const date1 = day1.split('T')[0];
    const date2 = day2.split('T')[0];
    const entry1 = result.find(d => d.date === date1);
    const entry2 = result.find(d => d.date === date2);

    expect(entry1).toMatchObject({ heartRate: 80, steps: 1000 });
    expect(entry2).toMatchObject({ sleepHours: 7.5 });
    expect(result.length).toBe(7);
  });

  it('handles undefined input', () => {
    expect(transformHealthData(undefined as any)).toEqual([]);
  });

  it('ignores unknown stat types', () => {
    const day = isoDaysAgo(1);
    const stats = [
      { timestamp: day, statType: 'unknown', value: '50' },
      { timestamp: day, statType: 'steps', value: '500' }
    ];

    const result = transformHealthData(stats);
    const entry = result.find(d => d.date === day.split('T')[0]);
    expect(entry).toMatchObject({ steps: 500 });
    expect((entry as any).unknown).toBeUndefined();
  });

  it('skips stats with invalid timestamps or values', () => {
    const validDay = isoDaysAgo(1);
    const stats = [
      { timestamp: 'bad-date', statType: 'heart_rate', value: '80' },
      { timestamp: validDay, statType: 'heart_rate', value: 'abc' },
      { timestamp: validDay, statType: 'heart_rate', value: '70' }
    ];

    const result = transformHealthData(stats);
    const entry = result.find(d => d.date === validDay.split('T')[0]);
    expect(entry).toMatchObject({ heartRate: 70 });
  });
});
