// src/lib/server/auth/guards.ts
import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Role } from '@prisma/client';
import { getCurrentUser } from './index';

export async function requireAuth(event: RequestEvent) {
  const user = await getCurrentUser(event);
  if (!user) {
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
  }
  return user;
}

export async function requireRole(event: RequestEvent, roles: Role[]) {
  const user = await requireAuth(event);
  if (!roles.includes(user.role as Role)) {
    throw error(403, 'You do not have permission to access this page');
  }
  return user;
}

export const requireSuperAdmin = (e: RequestEvent) => requireRole(e, ['SUPER_ADMIN']);
export const requireAdmin      = (e: RequestEvent) => requireRole(e, ['SUPER_ADMIN', 'ADMIN']);
export const requireTeacher    = (e: RequestEvent) => requireRole(e, ['SUPER_ADMIN', 'ADMIN', 'TEACHER']);

export async function redirectIfAuthenticated(event: RequestEvent, to = '/dashboard') {
  const user = await getCurrentUser(event);
  if (user) throw redirect(303, to);
}

export function getDashboardByRole(role: string): string {
  return '/dashboard';
}
