// src/routes/(auth)/login/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { loginUser } from '$lib/server/auth';
import { redirectIfAuthenticated, getDashboardByRole } from '$lib/server/auth/guards';

export const load: PageServerLoad = async (event) => {
  await redirectIfAuthenticated(event);
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const email    = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required', email });
    }

    if (!email.includes('@')) {
      return fail(400, { error: 'Invalid email address', email });
    }

    // ── Attempt login outside try/catch so redirect isn't swallowed ──────────
    let user: Awaited<ReturnType<typeof loginUser>>['user'];

    try {
      const result = await loginUser(event, { email, password });
      user = result.user;
    } catch {
      // Only credential errors land here — redirect is never thrown inside loginUser
      return fail(401, { error: 'Invalid email or password', email });
    }

    // ── Redirect OUTSIDE the try/catch ───────────────────────────────────────
    const redirectTo = event.url.searchParams.get('redirectTo') ?? getDashboardByRole(user.role);
    redirect(303, redirectTo);
  },
};