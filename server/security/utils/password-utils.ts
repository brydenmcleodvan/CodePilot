import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Increase cost factor for better security 
// (higher is more secure but slower - adjust based on server capabilities)
const BCRYPT_COST_FACTOR = 12;

/**
 * Hash a password using bcrypt with improved security
 * 
 * @param password The plaintext password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

/**
 * Compare a plaintext password with a hashed password
 * 
 * @param plainPassword The plaintext password to check
 * @param hashedPassword The hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a secure random password
 * 
 * @param length The length of the password to generate
 * @returns A cryptographically secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let password = '';
  
  // Generate a cryptographically secure random password
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Check password strength
 * 
 * @param password The password to check
 * @returns An object with strength metrics and a boolean indicating if the password is strong enough
 */
export function checkPasswordStrength(password: string): { 
  score: number, 
  isStrong: boolean,
  feedback: string[]
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += Math.min(2, Math.floor(password.length / 8));
  }
  
  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  // Common patterns and sequences
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }
  
  if (/^(?:password|123456|qwerty|admin)/i.test(password)) {
    score -= 2;
    feedback.push('Avoid common passwords');
  }
  
  // Normalize score to 0-5 range
  score = Math.max(0, Math.min(5, score));
  
  return {
    score,
    isStrong: score >= 3,
    feedback: feedback.length ? feedback : ['Password strength is good']
  };
}