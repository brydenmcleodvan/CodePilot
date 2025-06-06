import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { MemStorage } from '../../server/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'healthmap-secret-key';

describe('authentication edge cases', () => {
  it('fails verification for expired access token', async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1ms' });
    await new Promise((r) => setTimeout(r, 10));
    try {
      jwt.verify(token, JWT_SECRET);
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.name).toBe('TokenExpiredError');
    }
  });

  it('returns undefined for invalid refresh token', async () => {
    const storage = new MemStorage();
    await storage.createRefreshToken({
      userId: 1,
      token: 'valid',
      expiresAt: new Date(Date.now() + 1000),
      revoked: false,
    });
    const missing = await storage.getRefreshToken('invalid');
    expect(missing).toBeUndefined();
  });

  it('rejects tampered JWT payloads', () => {
    const token = jwt.sign({ id: 1, username: 'user' }, JWT_SECRET);
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    payload.id = 2;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const tampered = parts.join('.');
    expect(() => jwt.verify(tampered, JWT_SECRET)).toThrow();
  });
});
