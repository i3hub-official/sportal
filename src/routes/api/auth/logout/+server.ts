// src/routes/api/auth/logout/+server.ts
import type { RequestHandler } from './$types';
import { logoutUser } from '$lib/server/auth';
import { ok } from '$lib/server/utils/response';

export const POST: RequestHandler = async (event) => {
  await logoutUser(event);
  return ok({ message: 'Logged out' });
};
