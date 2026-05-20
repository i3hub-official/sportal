// src/routes/(app)/students/new/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { uploadPhoto } from '$lib/server/upload';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);
  const classes = await db.class.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] });
  return { classes };
};

export const actions: Actions = {
  default: async (event) => {
    await requireAdmin(event);

    const data        = await event.request.formData();
    const firstName   = data.get('firstName')?.toString().trim()  ?? '';
    const lastName    = data.get('lastName')?.toString().trim()   ?? '';
    const gender      = data.get('gender')?.toString().trim()     ?? '';
    const dateOfBirth = data.get('dateOfBirth')?.toString()       ?? '';
    const level       = data.get('level')?.toString()             ?? '';
    const classId     = data.get('classId')?.toString()           ?? '';
    const religion    = data.get('religion')?.toString().trim()   ?? '';
    const stateOrigin = data.get('stateOfOrigin')?.toString().trim() ?? '';
    const address     = data.get('address')?.toString().trim()    ?? '';
    const photo       = data.get('photo') as File | null;

    if (!firstName || !lastName || !gender || !dateOfBirth || !level) {
      return fail(400, { error: 'Name, gender, date of birth and level are required', values: Object.fromEntries(data) });
    }

    // Generate admission number
    const year  = new Date().getFullYear();
    const count = await db.studentProfile.count();
    const admissionNo = `SMS/${year}/${String(count + 1).padStart(4, '0')}`;

    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      const result = await uploadPhoto(photo, 'students');
      if (!result.success) return fail(400, { error: result.error, values: Object.fromEntries(data) });
      photoUrl = result.url;
    }

    const student = await db.studentProfile.create({
      data: {
        firstName,
        lastName,
        gender:       gender ? (gender as any) : undefined,
        dateOfBirth:  new Date(dateOfBirth),
        level:        level as any,
        classId:      classId || null,
        admissionNo,
        religion:     religion     || null,
        stateOfOrigin: stateOrigin || null,
        address:      address      || null,
        photoUrl,
      },
    });

    throw redirect(303, `/students/${student.id}`);
  },
};
