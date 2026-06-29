// src/lib/server/email/index.ts
import nodemailer from 'nodemailer';
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} from '$env/static/private';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT ?? 587),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// ── Base send ──────────────────────────────────────────────────────────────────
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return transporter.sendMail({
    from: SMTP_FROM ?? `"LSAI Portal" <${SMTP_USER}>`,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ''),
  });
}

// ── Password Reset ─────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  return sendEmail({
    to,
    subject: 'Reset Your Password — LSAI Portal',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="color: #475569; margin-bottom: 24px;">Hi ${name},</p>
        <p style="color: #475569; margin-bottom: 24px;">
          We received a request to reset your password for the LSAI Portal.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 0.85rem;">
          If you didn't request this, you can safely ignore this email.<br>
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 0.8rem;">LSAI Portal</p>
      </div>
    `,
  });
}

// ── Welcome Email ──────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  name,
  role,
  loginUrl,
  tempPassword,
}: {
  to: string;
  name: string;
  role: string;
  loginUrl: string;
  tempPassword?: string;
}) {
  return sendEmail({
    to,
    subject: 'Welcome to LSAI Portal',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #1e293b;">Welcome to LSAI Portal 🎉</h2>
        <p style="color: #475569;">Hi ${name},</p>
        <p style="color: #475569;">
          Your account has been created on the School Management System as <strong>${role}</strong>.
        </p>
        ${
          tempPassword
            ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px; color: #64748b; font-size: 0.875rem;">Your temporary password:</p>
                <p style="margin: 0; font-family: monospace; font-size: 1.1rem; color: #1e293b; font-weight: 600;">${tempPassword}</p>
               </div>
               <p style="color: #ef4444; font-size: 0.875rem;">⚠️ Please change your password immediately after first login.</p>`
            : ''
        }
        <a href="${loginUrl}"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Login to Portal
        </a>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 0.8rem;">LSAI Portal</p>
      </div>
    `,
  });
}
