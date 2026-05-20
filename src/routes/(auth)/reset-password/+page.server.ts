// src/routes/(auth)/reset-password/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validatePasswordResetToken, consumePasswordResetToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get('token') ?? '';
  if (!token) throw redirect(303, '/forgot-password');

  const record = await validatePasswordResetToken(token);
  if (!record) {
    return { invalid: true, token: '' };
  }

  return { invalid: false, token };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data     = await request.formData();
    const token    = data.get('token')?.toString() ?? '';
    const password = data.get('password')?.toString() ?? '';
    const confirm  = data.get('confirm')?.toString() ?? '';

    if (!token) return fail(400, { error: 'Missing reset token' });
    if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters', token });
    if (password !== confirm) return fail(400, { error: 'Passwords do not match', token });

    try {
      await consumePasswordResetToken(token, password);
    } catch {
      return fail(400, { error: 'Reset link is invalid or has expired', token });
    }

    throw redirect(303, '/login?reset=1');
  },
};
