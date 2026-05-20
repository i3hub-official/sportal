// src/lib/server/auth/index.ts
import { db } from '$lib/server/prisma';
import { hashPassword, verifyPassword } from './password';
import {
  createSession,
  validateSession,
  deleteSession,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions
} from './session';
import type { RequestEvent } from '@sveltejs/kit';
import type { Role } from '@prisma/client';

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerUser({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: Role;
}) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const passwordHash = await hashPassword(password);
  return db.user.create({ data: { email, passwordHash, role } });
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function loginUser(
  event: RequestEvent,
  { email, password }: { email: string; password: string }
) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const session = await createSession(user.id, {
    ipAddress: event.getClientAddress(),
    userAgent: event.request.headers.get('user-agent') ?? undefined,
  });

  event.cookies.set(
    SESSION_COOKIE_NAME,
    session.token,
    getSessionCookieOptions(session.expiresAt)
  );

  return { user, session };
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logoutUser(event: RequestEvent) {
  const token = event.cookies.get(SESSION_COOKIE_NAME);
  if (token) {
    await deleteSession(token);
    event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  }
}

// ── Get session (used in hooks) ───────────────────────────────────────────────
export async function getSession(event: RequestEvent) {
  const token = event.cookies.get(SESSION_COOKIE_NAME);
  if (!token) return null;
  return validateSession(token);
}

// ── Get current user ──────────────────────────────────────────────────────────
export async function getCurrentUser(event: RequestEvent) {
  const token = event.cookies.get(SESSION_COOKIE_NAME);
  if (!token) return null;

  const result = await validateSession(token);
  if (!result) {
    event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return null;
  }

  return result.user;
}

// ── Get user with profile ─────────────────────────────────────────────────────
export async function getCurrentUserWithProfile(event: RequestEvent) {
  const user = await getCurrentUser(event);
  if (!user) return null;

  return db.user.findUnique({
  where: { id: user.id },
  include: { staffProfile: true, studentProfile: true },
  });
}

// ── Password Reset Token ──────────────────────────────────────────────────────
export async function createPasswordResetToken(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null; // don't reveal if email exists

  const token     = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.passwordResetToken.upsert({
    where:  { userId: user.id },
    update: { token, expiresAt },
    create: { userId: user.id, token, expiresAt },
  });

  return { token, user };
}

export async function validatePasswordResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({
    where:   { token },
    include: { user: true },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await db.passwordResetToken.delete({ where: { token } });
    return null;
  }

  return record;
}

export async function consumePasswordResetToken(token: string, newPassword: string) {
  const record = await validatePasswordResetToken(token);
  if (!record) throw new Error('Invalid or expired reset token');

  const passwordHash = await hashPassword(newPassword);

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data:  { passwordHash },
    }),
    db.passwordResetToken.delete({ where: { token } }),
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  return record.user;
}

// ── Clean expired sessions ────────────────────────────────────────────────────
export async function cleanExpiredSessions() {
  const deleted = await db.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  if (deleted.count > 0) {
    console.log(`[auth] Cleaned ${deleted.count} expired sessions`);
  }
}
