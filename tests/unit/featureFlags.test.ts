import { describe, it, expect } from 'vitest';
import { hasFeature } from '../../shared/featureFlags';
import type { User } from '../../shared/schema';

const baseUser: Omit<User, 'id'> = {
  username: 'test',
  password: 'x',
  email: 'a@b.c',
  name: 'Test',
  profilePicture: null as any,
  healthData: null as any,
  isPremium: false,
  emailVerified: true,
  verificationToken: null,
  passwordResetToken: null,
  passwordResetExpires: null,
};

describe('hasFeature', () => {
  it('allows premium user', () => {
    const user: User = { id: 1, ...baseUser, isPremium: true };
    expect(hasFeature(user, 'advancedTrendAnalysis')).toBe(true);
  });

  it('denies standard user', () => {
    const user: User = { id: 2, ...baseUser, isPremium: false };
    expect(hasFeature(user, 'exportCsv')).toBe(false);
  });
});
