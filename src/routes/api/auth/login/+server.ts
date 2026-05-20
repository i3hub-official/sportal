// src/routes/api/auth/login/+server.ts
import type { RequestHandler } from './$types';
import { loginUser } from '$lib/server/auth';
import { ok, badRequest, unauthorized } from '$lib/server/utils/response';

export const POST: RequestHandler = async (event) => {
  let body: { email?: string; password?: string };

  try {
    body = await event.request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const { email, password } = body;
  if (!email || !password) return badRequest('Email and password are required');

  try {
    const { user } = await loginUser(event, { email, password });
    const { passwordHash: _, ...safeUser } = user;
    return ok({ user: safeUser });
  } catch {
    return unauthorized('Invalid email or password');
  }
};
