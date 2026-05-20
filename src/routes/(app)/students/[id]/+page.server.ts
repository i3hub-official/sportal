// src/routes/(app)/students/[id]/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireTeacher } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';
import { uploadPhoto, deletePhoto } from '$lib/server/upload';

export const load: PageServerLoad = async (event) => {
  await requireTeacher(event);

  const student = await db.studentProfile.findUnique({
    where:   { id: event.params.id },
    include: { class: true },
  });
  if (!student) throw error(404, 'Student not found');

  const classes = await db.class.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] });
  return { student, classes };
};

export const actions: Actions = {
  update: async (event) => {
    await requireTeacher(event);
    const data        = await event.request.formData();
    const firstName   = data.get('firstName')?.toString().trim()     ?? '';
    const lastName    = data.get('lastName')?.toString().trim()      ?? '';
    const gender      = data.get('gender')?.toString().trim()        ?? '';
    const classId     = data.get('classId')?.toString()              ?? '';
    const religion    = data.get('religion')?.toString().trim()      ?? '';
    const stateOrigin = data.get('stateOfOrigin')?.toString().trim() ?? '';
    const address     = data.get('address')?.toString().trim()       ?? '';
    const photo       = data.get('photo') as File | null;

    if (!firstName || !lastName) return fail(400, { error: 'Name is required' });

    const existing = await db.studentProfile.findUnique({ where: { id: event.params.id } });
    if (!existing) return fail(404, { error: 'Student not found' });

    let photoUrl = existing.photoUrl;
    if (photo && photo.size > 0) {
      const result = await uploadPhoto(photo, 'students');
      if (!result.success) return fail(400, { error: result.error });
      if (existing.photoUrl) await deletePhoto(existing.photoUrl);
      photoUrl = result.url;
    }

    await db.studentProfile.update({
      where: { id: event.params.id },
      data:  {
        firstName,
        lastName,
        gender:       gender ? (gender as any) : undefined,
        classId:      classId      || null,
        religion:     religion     || null,
        stateOfOrigin: stateOrigin || null,
        address:      address      || null,
        photoUrl,
      },
    });

    return { success: true };
  },
};
