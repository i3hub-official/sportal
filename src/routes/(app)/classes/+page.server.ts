// src/routes/(app)/classes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);

  const [classes, academicYear, staff] = await Promise.all([
    db.class.findMany({
      include: {
        _count:    { select: { students: true } },
        classTeacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    }),
    db.academicYear.findFirst({ where: { isCurrent: true } }),
    db.staffProfile.findMany({
      where:   { user: { role: { in: ['TEACHER', 'SUPER_ADMIN'] } } },
      orderBy: { lastName: 'asc' },
    }),
  ]);

  return { classes, academicYear, staff };
};

export const actions: Actions = {
  create: async (event) => {
    await requireAdmin(event);
    const data  = await event.request.formData();
    const name  = data.get('name')?.toString().trim()  ?? '';
    const level = data.get('level')?.toString()        ?? '';
    const section = data.get('section')?.toString().trim() ?? '';
    const classTeacherId = data.get('classTeacherId')?.toString() ?? '';

    if (!name || !level) return fail(400, { createError: 'Class name and level are required' });

    const year = await db.academicYear.findFirst({ where: { isCurrent: true } });
    if (!year) return fail(400, { createError: 'No current academic year set' });

    const id = name.toLowerCase().replace(/\s+/g, '-');
    const existing = await db.class.findUnique({ where: { id } });
    if (existing) return fail(400, { createError: 'A class with that name already exists' });

    await db.class.create({
      data: {
        id,
        name,
        level:        level as any,
        section:      section || null,
        academicYearId: year.id,
        classTeacherId: classTeacherId || null,
      },
    });

    return { createSuccess: true };
  },

  assignTeacher: async (event) => {
    await requireAdmin(event);
    const data           = await event.request.formData();
    const classId        = data.get('classId')?.toString()        ?? '';
    const classTeacherId = data.get('classTeacherId')?.toString() ?? '';

    await db.class.update({
      where: { id: classId },
      data:  { classTeacherId: classTeacherId || null },
    });

    return { assignSuccess: true };
  },
};
