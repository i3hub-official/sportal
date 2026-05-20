// src/routes/api/timetable/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/prisma';
import { ok, unauthorized, badRequest } from '$lib/server/utils/response';

function guard(event: Parameters<RequestHandler>[0]) {
  if (!event.locals.user) return unauthorized();
  return null;
}

export const GET: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  const classId = event.url.searchParams.get('classId') ?? '';
  if (!classId) return badRequest('classId is required');

  const slots = await db.timetableSlot.findMany({
    where:   { classId },
    include: { subject: true, teacher: true },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  return ok(slots);
};
