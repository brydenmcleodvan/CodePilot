export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  // Mock email sending for now
  console.log(`Email sent to ${to}: ${subject}`);
}

export function verificationEmailTemplate(token: string): string {
  return `
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}">Verify Email</a>
  `;
}

export function resetPasswordEmailTemplate(token: string): string {
  return `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}">Reset Password</a>
  `;
}