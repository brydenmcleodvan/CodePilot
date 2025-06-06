import { describe, it, expect } from 'vitest';
import { transformHealthData } from '../../client/src/lib/transformHealthData';

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe('transformHealthData', () => {
  it('returns empty array for no stats', () => {
    expect(transformHealthData([])).toEqual([]);
  });

  it('groups stats by date and parses numeric values', () => {
    const day = isoDaysAgo(1);
    const stats = [
      { timestamp: day, statType: 'steps', value: '100' },
      { timestamp: day, statType: 'heart_rate', value: '70' }
    ];
    const result = transformHealthData(stats);
    const entry = result.find(d => d.date === day.split('T')[0]);
    expect(entry).toMatchObject({ steps: 100, heartRate: 70 });
  });

  it('handles undefined input', () => {
    expect(transformHealthData(undefined as any)).toEqual([]);
  });

  it('ignores records with bad timestamps', () => {
    const stats = [
      { timestamp: 'invalid', statType: 'steps', value: '50' },
      { timestamp: isoDaysAgo(0), statType: 'steps', value: '25' }
    ];
    const result = transformHealthData(stats);
    expect(result.some(r => r.steps === 25)).toBe(true);
  });

  it('skips unknown stat types', () => {
    const stats = [
      { timestamp: isoDaysAgo(0), statType: 'unknown', value: '10' },
      { timestamp: isoDaysAgo(0), statType: 'steps', value: '5' }
    ];
    const result = transformHealthData(stats);
    const today = isoDaysAgo(0).split('T')[0];
    const entry = result.find(r => r.date === today);
    expect(entry?.steps).toBe(5);
  });
});
