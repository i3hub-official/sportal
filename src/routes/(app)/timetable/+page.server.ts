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
    db.staffProfile.findMany({
      where: { isActive: true },
      orderBy: { lastName: 'asc' },
    }),
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
  // ── Add a slot ───────────────────────────────────────────────────────────────
  addSlot: async (event) => {
    await requireTeacher(event);
    const data      = await event.request.formData();
    const classId   = data.get('classId')?.toString()   ?? '';
    const subjectId = data.get('subjectId')?.toString() ?? '';
    const teacherId = data.get('teacherId')?.toString() ?? '';
    const day       = data.get('dayOfWeek')?.toString() ?? '';
    const start     = data.get('startTime')?.toString() ?? '';
    const end       = data.get('endTime')?.toString()   ?? '';
    const room      = data.get('room')?.toString().trim() ?? '';

    if (!classId || !subjectId || !teacherId || !day || !start || !end)
      return fail(400, { error: 'All fields are required' });

    // Check for time conflict on same class + day
    const conflict = await db.timetableSlot.findFirst({
      where: {
        classId,
        dayOfWeek: day as any,
        OR: [
          { startTime: { gte: start, lt: end } },
          { endTime:   { gt: start, lte: end } },
          { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
        ],
      },
    });

    if (conflict)
      return fail(400, { error: `Time conflict: ${conflict.startTime}–${conflict.endTime} already exists on that day` });

    await db.timetableSlot.create({
      data: {
        classId,
        subjectId,
        staffProfileId: teacherId,
        dayOfWeek:      day as any,
        startTime:      start,
        endTime:        end,
        room:           room || null,
      },
    });

    return { success: true };
  },

  // ── Delete a slot ─────────────────────────────────────────────────────────────
  deleteSlot: async (event) => {
    await requireTeacher(event);
    const data   = await event.request.formData();
    const slotId = data.get('slotId')?.toString() ?? '';
    if (!slotId) return fail(400, { error: 'Missing slot ID' });
    await db.timetableSlot.delete({ where: { id: slotId } });
    return { success: true };
  },

  // ── Move a slot (drag & drop save) ───────────────────────────────────────────
  moveSlot: async (event) => {
    await requireTeacher(event);
    const data      = await event.request.formData();
    const slotId    = data.get('slotId')?.toString()    ?? '';
    const dayOfWeek = data.get('dayOfWeek')?.toString() ?? '';
    const startTime = data.get('startTime')?.toString() ?? '';
    const endTime   = data.get('endTime')?.toString()   ?? '';

    if (!slotId || !dayOfWeek || !startTime || !endTime)
      return fail(400, { error: 'Missing fields' });

    await db.timetableSlot.update({
      where: { id: slotId },
      data:  { dayOfWeek: dayOfWeek as any, startTime, endTime },
    });

    return { success: true };
  },
};