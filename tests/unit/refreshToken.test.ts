import { describe, it, expect } from 'vitest';
import { MemStorage } from '../../server/storage';

describe('refresh token flow', () => {
  it('creates and revokes tokens', async () => {
    const store = new MemStorage();
    const token = await store.createRefreshToken({
      userId: 1,
      token: 'abc',
      expiresAt: new Date(Date.now() + 1000),
      revoked: false,
    });
    const fetched = await store.getRefreshToken('abc');
    expect(fetched?.id).toBe(token.id);
    await store.revokeRefreshToken('abc');
    const revoked = await store.getRefreshToken('abc');
    expect(revoked?.revoked).toBe(true);
  });
});
