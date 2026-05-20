// src/routes/api/attendance/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/prisma';
import { ok, unauthorized, badRequest, serverError } from '$lib/server/utils/response';

function guard(event: Parameters<RequestHandler>[0]) {
  if (!event.locals.user) return unauthorized();
  return null;
}

// ── GET: load attendance for a class on a date ────────────────────────────────
export const GET: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  const { url } = event;
  const classId = url.searchParams.get('classId') ?? '';
  const date    = url.searchParams.get('date')    ?? '';

  if (!classId || !date) return badRequest('classId and date are required');

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Schema uses StudentProfile not Student
  const students = await db.studentProfile.findMany({
    where:   { classId, isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  // Schema field is studentProfileId
  const existing = await db.attendance.findMany({
    where: { classId, date: targetDate },
  });

  // Map by studentProfileId
  const recordMap = new Map(existing.map(a => [a.studentProfileId, a]));

  const records = students.map(s => ({
    studentId:    s.id,
    studentName:  `${s.lastName}, ${s.firstName}`,
    status:       recordMap.get(s.id)?.status ?? 'PRESENT',
    note:         recordMap.get(s.id)?.note   ?? '',
    attendanceId: recordMap.get(s.id)?.id     ?? null,
  }));

  return ok(records);
};

// ── POST: bulk save attendance for a class ────────────────────────────────────
export const POST: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  let body: any;
  try { body = await event.request.json(); }
  catch { return badRequest('Invalid JSON'); }

  const { classId, date, termRecordId, records } = body;
  if (!classId || !date || !termRecordId || !Array.isArray(records))
    return badRequest('classId, date, termRecordId, and records[] are required');

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Get staff profile for markedBy
  const staff = await db.staffProfile.findFirst({
    where: { userId: event.locals.user!.id },
  });

  try {
    await db.$transaction(
      records.map((r: any) =>
        db.attendance.upsert({
          // @@unique([studentProfileId, date])
          where: {
            studentProfileId_date: {
              studentProfileId: r.studentId,
              date:             targetDate,
            },
          },
          update: {
            status:    r.status,
            note:      r.note      ?? null,
            markedById: staff?.id  ?? null,
          },
          create: {
            studentProfileId: r.studentId,   // correct field name from schema
            classId,
            termRecordId,                    // required by schema
            date:      targetDate,
            status:    r.status,
            note:      r.note     ?? null,
            markedById: staff?.id ?? null,
          },
        })
      )
    );

    return ok({ saved: records.length });
  } catch (e) {
    console.error('[api/attendance POST]', e);
    return serverError('Failed to save attendance');
  }
};