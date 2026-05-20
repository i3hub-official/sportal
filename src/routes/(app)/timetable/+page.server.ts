// src/routes/(app)/timetable/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireTeacher } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  await requireTeacher(event);
  const { url } = event;
  const classId = url.searchParams.get('class') ?? '';

  const [classes, subjects, staff] = await Promise.all([
    db.class.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] }),
    db.subject.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    db.staffProfile.findMany({ orderBy: { lastName: 'asc' } }),
  ]);

  const slots = classId
    ? await db.timetableSlot.findMany({
        where:   { classId },
        include: { subject: true, teacher: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      })
    : [];

  return { classes, subjects, staff, slots, selectedClassId: classId };
};

export const actions: Actions = {
  addSlot: async (event) => {
    await requireTeacher(event);
    const data      = await event.request.formData();
    const classId   = data.get('classId')?.toString()   ?? '';
    const subjectId = data.get('subjectId')?.toString() ?? '';
    const teacherId = data.get('teacherId')?.toString() ?? '';
    const day       = data.get('dayOfWeek')?.toString() ?? '';
    const start     = data.get('startTime')?.toString() ?? '';
    const end       = data.get('endTime')?.toString()   ?? '';

    if (!classId || !subjectId || !teacherId || !day || !start || !end)
      return fail(400, { error: 'All fields are required' });

    await db.timetableSlot.create({
      data: { classId, subjectId, staffProfileId: teacherId, dayOfWeek: day as any, startTime: start, endTime: end },
    });
    return { success: true };
  },

  deleteSlot: async (event) => {
    await requireTeacher(event);
    const data   = await event.request.formData();
    const slotId = data.get('slotId')?.toString() ?? '';
    await db.timetableSlot.delete({ where: { id: slotId } });
    return { success: true };
  },
};
