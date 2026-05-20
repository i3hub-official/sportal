// src/routes/(app)/staff/[id]/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';
import { uploadPhoto, deletePhoto } from '$lib/server/upload';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);

  const staff = await db.staffProfile.findUnique({
    where:   { id: event.params.id },
    include: { user: { select: { id: true, email: true, role: true, isActive: true, createdAt: true } } },
  });

  if (!staff) throw error(404, 'Staff member not found');

  return { staff };
};

export const actions: Actions = {
  update: async (event) => {
    await requireAdmin(event);

    const data       = await event.request.formData();
    const firstName  = data.get('firstName')?.toString().trim() ?? '';
    const lastName   = data.get('lastName')?.toString().trim() ?? '';
    const position   = data.get('position')?.toString().trim() ?? '';
    const department = data.get('department')?.toString().trim() ?? '';
    const phone      = data.get('phone')?.toString().trim() ?? '';
    const gender     = data.get('gender')?.toString().trim() ?? '';
    const photo      = data.get('photo') as File | null;

    if (!firstName || !lastName) {
      return fail(400, { error: 'First and last name are required' });
    }

    const existing = await db.staffProfile.findUnique({ where: { id: event.params.id } });
    if (!existing) return fail(404, { error: 'Staff not found' });

    let photoUrl = existing.photoUrl;
    if (photo && photo.size > 0) {
      const result = await uploadPhoto(photo, 'staff');
      if (!result.success) return fail(400, { error: result.error });
      if (existing.photoUrl) await deletePhoto(existing.photoUrl);
      photoUrl = result.url;
    }

    await db.staffProfile.update({
      where: { id: event.params.id },
      data: { firstName, lastName, position: position || null, department: department || null, phone: phone || null, gender: gender || null, photoUrl },
    });

    return { success: true };
  },
};
