// src/routes/(auth)/forgot-password/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/server/auth/guards';
import { createPasswordResetToken } from '$lib/server/auth';
import { sendPasswordResetEmail } from '$lib/server/email';
import { PUBLIC_APP_URL } from '$env/static/public';

export const load: PageServerLoad = async (event) => {
  await redirectIfAuthenticated(event);
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const data  = await event.request.formData();
    const email = data.get('email')?.toString().trim() ?? '';

    if (!email || !email.includes('@')) {
      return fail(400, { error: 'Please enter a valid email address', email });
    }

    // Always return success to avoid email enumeration
    try {
      const result = await createPasswordResetToken(email);
      if (result) {
        const resetUrl = `${PUBLIC_APP_URL}/reset-password?token=${result.token}`;
        const name = result.user.email.split('@')[0];
        await sendPasswordResetEmail({ to: result.user.email, name, resetUrl });
      }
    } catch (err) {
      console.error('[forgot-password]', err);
      // Still return success — don't leak info
    }

    return { success: true };
  },
};
