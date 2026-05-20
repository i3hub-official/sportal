// src/routes/(auth)/logout/+server.ts
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { logoutUser } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
  await logoutUser(event);
  throw redirect(303, '/login');
};

// Also support GET for simple logout links
export const GET: RequestHandler = async (event) => {
  await logoutUser(event);
  throw redirect(303, '/login');
};
