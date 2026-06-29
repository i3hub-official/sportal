// src/routes/api/results/check/+server.ts
// Public API — no auth required.
// POST { admissionNo, pin, termId? }
// Returns student's result for the given term (or current term if omitted).

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const db = new PrismaClient();

// ── Rate-limiting (simple in-memory, replace with Redis in production) ────────
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS  = 15 * 60 * 1000; // 15 minutes
const MAX_TRIES  = 10;

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_TRIES;
}

// ── Grade point helpers ───────────────────────────────────────────────────────
function gradePoints(grade: string | null): number {
  const map: Record<string, number> = {
    A1: 5, B2: 4, B3: 3, C4: 3, C5: 2, C6: 2, D7: 1, E8: 1, F9: 0,
    A: 5, B: 4, C: 3, D: 1, F: 0,
    E: 5, VG: 4, G: 3, S: 2, NS: 0,
  };
  return map[grade ?? ''] ?? 0;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  
   try {
  const ip = getClientAddress();

  if (isRateLimited(ip)) {
    return json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: { admissionNo?: string; pin?: string; termId?: string };
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const admissionNo = body.admissionNo?.toString().trim().toUpperCase();
  const pin         = body.pin?.toString().trim();
  const termId      = body.termId?.toString().trim();

  // ── Validate input ──────────────────────────────────────────────────────────
  if (!admissionNo || !pin) {
    return json({ success: false, error: 'Admission number and PIN are required.' }, { status: 400 });
  }

  // ── Find student ────────────────────────────────────────────────────────────
  const student = await db.studentProfile.findUnique({
    where:   { admissionNo },
    include: { class: { select: { name: true, level: true } } },
  });

  if (!student || !student.isActive) {
    return json({ success: false, error: 'No student found with that admission number.' }, { status: 404 });
  }

  // ── Validate scratch card ───────────────────────────────────────────────────
  const card = await db.scratchCard.findUnique({ where: { pin } });

  if (!card) {
    return json({ success: false, error: 'Invalid PIN. Please check the card and try again.' }, { status: 403 });
  }

  if (card.status === 'DEACTIVATED') {
    return json({ success: false, error: 'This card has been deactivated.' }, { status: 403 });
  }

  if (card.status === 'EXPIRED' || (card.expiresAt && card.expiresAt < new Date())) {
    await db.scratchCard.update({ where: { id: card.id }, data: { status: 'EXPIRED' } });
    return json({ success: false, error: 'This scratch card has expired.' }, { status: 403 });
  }

  if (card.usesCount >= card.usesAllowed) {
    return json({ success: false, error: 'This PIN has already been used the maximum number of times.' }, { status: 403 });
  }

  // ── Resolve term ────────────────────────────────────────────────────────────
  let termRecord = termId
    ? await db.termRecord.findUnique({ where: { id: termId }, include: { academicYear: true } })
    : await db.termRecord.findFirst({ where: { isCurrent: true }, include: { academicYear: true } });

  if (!termRecord) {
    termRecord = await db.termRecord.findFirst({
      orderBy: { startDate: 'desc' },
      include:  { academicYear: true },
    });
  }

  if (!termRecord) {
    return json({ success: false, error: 'No term records found. Contact the school.' }, { status: 500 });
  }

  // ── Fetch results ───────────────────────────────────────────────────────────
  const results = await db.result.findMany({
    where: {
      studentProfileId: student.id,
      termRecordId:     termRecord.id,
      isPublished:      true,
    },
    include: { subject: { select: { name: true, code: true } } },
    orderBy: { subject: { name: 'asc' } },
  });

  // ── Compute summary ─────────────────────────────────────────────────────────
  const totalScore     = results.reduce((s, r) => s + (r.totalScore ?? 0), 0);
  const average        = results.length ? parseFloat((totalScore / results.length).toFixed(1)) : 0;
  const overallGrade   = results.length
    ? results.reduce((best, r) => gradePoints(r.grade) > gradePoints(best) ? r.grade ?? best : best, results[0].grade ?? 'F9')
    : null;

  // Count passes (totalScore >= 50 for secondary/primary; >= 40 for nursery)
  const passThreshold  = student.level === 'NURSERY' ? 40 : 50;
  const passed         = results.filter(r => (r.totalScore ?? 0) >= passThreshold).length;
  const failed         = results.length - passed;

  // ── Record usage & update card ──────────────────────────────────────────────
  const newCount = card.usesCount + 1;
  const newStatus = newCount >= card.usesAllowed ? 'USED' : card.status;

  await db.$transaction([
    db.scratchCard.update({
      where: { id: card.id },
      data:  { usesCount: newCount, status: newStatus as any, updatedAt: new Date() },
    }),
    db.scratchCardUsage.create({
      data: {
        scratchCardId:  card.id,
        admissionNo:    student.admissionNo,
        termRecordId:   termRecord.id,
        academicYearId: (termRecord as any).academicYear?.id ?? null,
        ipAddress:      ip,
      },
    }),
  ]);

  // ── Fetch all terms for the term-switcher dropdown ──────────────────────────
  const allTerms = await db.termRecord.findMany({
    orderBy: { startDate: 'asc' },
    include: { academicYear: { select: { name: true } } },
  });

  const termLabel: Record<string, string> = { FIRST: 'First Term', SECOND: 'Second Term', THIRD: 'Third Term' };

  return json({
    success: true,
    student: {
      admissionNo:  student.admissionNo,
      name:         `${student.firstName} ${student.lastName}`,
      gender:       student.gender,
      class:        student.class?.name ?? '—',
      level:        student.level,
    },
    term: {
      id:          termRecord.id,
      label:       termLabel[termRecord.term] ?? termRecord.term,
      academicYear:(termRecord as any).academicYear?.name ?? '',
      isCurrent:   termRecord.isCurrent,
    },
    summary: {
      totalSubjects: results.length,
      totalScore:    parseFloat(totalScore.toFixed(1)),
      average,
      passed,
      failed,
      overallGrade,
    },
    results: results.map(r => ({
      subject:    r.subject.name,
      code:       r.subject.code,
      caScore:    r.caScore,
      examScore:  r.examScore,
      total:      r.totalScore,
      grade:      r.grade,
      remark:     r.remark,
      position:   r.position,
    })),
    allTerms: allTerms.map(t => ({
      id:          t.id,
      label:       `${termLabel[t.term] ?? t.term} — ${(t as any).academicYear?.name ?? ''}`,
      isCurrent:   t.isCurrent,
    })),
    card: {
      usesRemaining: card.usesAllowed - newCount,
    },
  });
   } finally {
    // Optional: disconnect if you want to manage connections
   await db.$disconnect();
  }
};