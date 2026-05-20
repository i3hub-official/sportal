// src/routes/api/fees/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/prisma';
import { ok, unauthorized, badRequest, created, serverError } from '$lib/server/utils/response';

function guardAdmin(event: Parameters<RequestHandler>[0]) {
  const role = event.locals.user?.role;
  if (!role || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) return unauthorized('Admins only');
  return null;
}

// ── GET: list fee records ────────────────────────────────────────────────────
export const GET: RequestHandler = async (event) => {
  const err = guardAdmin(event);
  if (err) return err;

  const { url }  = event;
  const studentId = url.searchParams.get('studentId') ?? '';
  const status    = url.searchParams.get('status')    ?? '';

  const where: any = {};
  if (studentId) where.studentId = studentId;
  if (status)    where.status    = status;

  const records = await db.feeRecord.findMany({
    where,
    include: {
      student:      { select: { firstName: true, lastName: true, admissionNo: true } },
      feeStructure: { select: { name: true, amount: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return ok(records);
};

// ── POST: record a payment ────────────────────────────────────────────────────
export const POST: RequestHandler = async (event) => {
  const err = guardAdmin(event);
  if (err) return err;

  let body: any;
  try { body = await event.request.json(); }
  catch { return badRequest('Invalid JSON'); }

  const { studentId, feeStructureId, classId, amountPaid, paymentMethod, note } = body;

  if (!studentId || !feeStructureId || !classId || typeof amountPaid !== 'number')
    return badRequest('studentId, feeStructureId, classId, amountPaid are required');

  const feeStructure = await db.feeStructure.findUnique({ where: { id: feeStructureId } });
  if (!feeStructure) return badRequest('Fee structure not found');

  const balance = Math.max(0, feeStructure.amount - amountPaid);
  const status  = amountPaid <= 0
    ? 'PENDING'
    : amountPaid >= feeStructure.amount
    ? 'PAID'
    : 'PARTIAL';

  // Generate receipt number
  const count     = await db.feeRecord.count();
  const receiptNo = `RCP/${new Date().getFullYear()}/${String(count + 1).padStart(5, '0')}`;

  try {
    const record = await db.feeRecord.create({
      data: {
        studentProfileId: studentId,
        feeStructureId,
        classId,
        amountPaid,
        balance,
        status:        status as any,
        paymentMethod: paymentMethod ?? null,
        note:          note          ?? null,
        receiptNo,
        paidAt:        amountPaid > 0 ? new Date() : null,
      },
    });
    return created(record);
  } catch (e) {
    console.error('[api/fees POST]', e);
    return serverError('Failed to record payment');
  }
};
