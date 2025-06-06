import { describe, it, expect } from 'vitest';
import { initializeData } from '../../server/initializeData';
import { MemStorage } from '../../server/storage';

describe('initializeData', () => {
  it('returns an initialized MemStorage instance', () => {
    const storage = initializeData();
    expect(storage).toBeInstanceOf(MemStorage);
  });
});
