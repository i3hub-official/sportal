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

    // Basic validation
    if (!email || !password) {
      return fail(400, { error: 'Email and password are required', email });
    }

    if (!email.includes('@')) {
      return fail(400, { error: 'Invalid email address', email });
    }

    try {
      const { user } = await loginUser(event, { email, password });
      const redirectTo = event.url.searchParams.get('redirectTo') ?? getDashboardByRole(user.role);
      throw redirect(303, redirectTo);
    } catch (err) {
      if (err instanceof Response) throw err; // rethrow redirect
      return fail(401, {
        error: 'Invalid email or password',
        email,
      });
    }
  },
};
