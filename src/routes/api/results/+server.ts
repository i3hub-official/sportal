// src/routes/api/results/+server.ts
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import { ok, unauthorized, badRequest, serverError } from '$lib/server/utils/response';


// Initialize Prisma client
const db = new PrismaClient();

function guard(event: Parameters<RequestHandler>[0]) {
  if (!event.locals.user) return unauthorized();
  return null;
}

// ── GET: load results grid for a class + term (+ optional subject) ────────────
export const GET: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  const { url }   = event;
  const classId   = url.searchParams.get('classId')   ?? '';
  const termId    = url.searchParams.get('termId')    ?? '';  // this is termRecordId
  const subjectId = url.searchParams.get('subjectId') ?? '';

  if (!classId || !termId) return badRequest('classId and termId are required');

  // Schema: StudentProfile not Student
  const students = await db.studentProfile.findMany({
    where:   { classId, isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  const subjects = subjectId
    ? await db.subject.findMany({ where: { id: subjectId, isActive: true } })
    : await db.subject.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

  // Schema: termRecordId (not termId), studentProfile relation for classId filter
  const existing = await db.result.findMany({
    where: {
      termRecordId: termId,
      student: { classId },   // relation filter via StudentProfile
    },
  });

  // Schema: studentProfileId (not studentId)
  const resultMap = new Map(
    existing.map(r => [`${r.studentProfileId}-${r.subjectId}`, r])
  );

  const rows = students.flatMap(student =>
    subjects.map(subject => {
      const key    = `${student.id}-${subject.id}`;
      const result = resultMap.get(key);
      return {
        id:          result?.id           ?? null,
        studentId:   student.id,
        studentName: `${student.lastName}, ${student.firstName}`,
        subjectId:   subject.id,
        subjectName: subject.name,
        caScore:     result?.caScore      ?? null,
        examScore:   result?.examScore    ?? null,
        totalScore:  result?.totalScore   ?? null,
        grade:       result?.grade        ?? null,
        remark:      result?.remark       ?? null,
      };
    })
  );

  return ok(rows);
};

// ── POST: save / update a single result cell ──────────────────────────────────
export const POST: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  let body: any;
  try { body = await event.request.json(); }
  catch { return badRequest('Invalid JSON'); }

  // Frontend sends studentId/termId — we map to schema names internally
  const { resultId, studentId, subjectId, classId, termId, caScore, examScore } = body;

  if (!studentId || !subjectId || !classId || !termId)
    return badRequest('studentId, subjectId, classId, termId are required');

  const ca    = typeof caScore   === 'number' ? caScore   : null;
  const exam  = typeof examScore === 'number' ? examScore : null;
  const total = ca !== null && exam !== null ? ca + exam : null;

  // Look up grade scale using StudentProfile.level
  let grade  = null;
  let remark = null;
  if (total !== null) {
    const student = await db.studentProfile.findUnique({ where: { id: studentId } });
    if (student) {
      const scale = await db.gradeScale.findFirst({
        where: {
          level:    student.level,
          minScore: { lte: total },
          maxScore: { gte: total },
        },
      });
      grade  = scale?.grade  ?? null;
      remark = scale?.remark ?? null;
    }
  }

  // Map to correct schema field names
  const payload = {
    studentProfileId: studentId,   // schema field
    subjectId,
    classId,
    termRecordId:     termId,      // schema field
    ...(ca    !== null && { caScore:    ca }),
    ...(exam  !== null && { examScore:  exam }),
    ...(total !== null && { totalScore: total, grade, remark }),
  };

  try {
    const result = resultId
      ? await db.result.update({
          where: { id: resultId },
          data:  payload,
        })
      : await db.result.upsert({
          // @@unique([studentProfileId, subjectId, termRecordId])
          where: {
            studentProfileId_subjectId_termRecordId: {
              studentProfileId: studentId,
              subjectId,
              termRecordId:     termId,
            },
          },
          update: payload,
          create: payload,
        });

    return ok(result);
  } catch (e) {
    console.error('[api/results POST]', e);
    return serverError('Failed to save result');
  }
};