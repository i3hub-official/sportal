// src/lib/server/auth/session.ts
import { db } from '$lib/server/prisma';
import type { User, Session } from '@prisma/client';
const SESSION_DURATION_DAYS = 30;
export const SESSION_COOKIE_NAME = 'sms_session';

// ── Create ────────────────────────────────────────────────────────────────────
export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<Session> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  return db.session.create({
    data: {
      userId,
      expiresAt,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: meta?.userAgent ?? null,
    },
  });
}

// ── Validate ──────────────────────────────────────────────────────────────────
export async function validateSession(
  token: string
): Promise<{ user: User; session: Session; id: string; userId: string; expiresAt: Date } | null> {
  const session = await db.session.findUnique({
    where:   { token },
    include: { user: true },
  });

  if (!session)              return null;
  if (!session.user.isActive) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  // Sliding expiry: renew if less than 15 days remain
  const daysLeft = (session.expiresAt.getTime() - Date.now()) / 86_400_000;
  if (daysLeft < 15) {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + SESSION_DURATION_DAYS);
    await db.session.update({
      where: { id: session.id },
      data:  { expiresAt: newExpiry },
    });
  }

  return {
    user:      session.user,
    session,
    id:        session.id,
    userId:    session.userId,
    expiresAt: session.expiresAt,
  };
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteSession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } });
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

// ── Cookie options ────────────────────────────────────────────────────────────
export function getSessionCookieOptions(expiresAt: Date) {
  return {
    path:     '/',
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    expires:  expiresAt,
  };
}
