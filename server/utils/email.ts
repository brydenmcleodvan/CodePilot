import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.example.com';
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER || 'user@example.com';
const pass = process.env.SMTP_PASS || 'password';
const from = process.env.EMAIL_FROM || 'noreply@example.com';

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: { user, pass }
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  await transporter.sendMail({ from, to, subject, html });
}

export function verificationEmailTemplate(token: string) {
  return `<p>Verify your email by clicking the link below:</p>
  <p><a href="${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}">Verify Email</a></p>`;
}

export function resetPasswordEmailTemplate(token: string) {
  return `<p>Reset your password by clicking the link below:</p>
  <p><a href="${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${token}">Reset Password</a></p>`;
}
