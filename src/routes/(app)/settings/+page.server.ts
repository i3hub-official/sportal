// src/routes/(app)/settings/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireSuperAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';

export const load: PageServerLoad = async (event) => {
  await requireSuperAdmin(event);

  const [academicYears, terms, feeStructures, currentYear] = await Promise.all([
    db.academicYear.findMany({ orderBy: { name: 'desc' } }),
    db.termRecord.findMany({
      include: { academicYear: { select: { name: true } } },
      orderBy: { startDate: 'desc' },
    }),
    db.feeStructure.findMany({ orderBy: { name: 'asc' } }),
    db.academicYear.findFirst({ where: { isCurrent: true } }),
  ]);

  return { academicYears, terms, feeStructures, currentYear };
};

export const actions: Actions = {
  // ── Create academic year ──────────────────────────────────────────────────
  createYear: async (event) => {
    await requireSuperAdmin(event);
    const data      = await event.request.formData();
    const name      = data.get('name')?.toString().trim()      ?? '';
    const startDate = data.get('startDate')?.toString()        ?? '';
    const endDate   = data.get('endDate')?.toString()          ?? '';

    if (!name || !startDate || !endDate)
      return fail(400, { yearError: 'All fields are required' });

    const existing = await db.academicYear.findUnique({ where: { name } });
    if (existing) return fail(400, { yearError: 'Academic year already exists' });

    await db.academicYear.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent: false },
    });
    return { yearSuccess: true };
  },

  // ── Set current academic year ─────────────────────────────────────────────
  setCurrentYear: async (event) => {
    await requireSuperAdmin(event);
    const data   = await event.request.formData();
    const yearId = data.get('yearId')?.toString() ?? '';

    await db.$transaction([
      db.academicYear.updateMany({ data: { isCurrent: false } }),
      db.academicYear.update({ where: { id: yearId }, data: { isCurrent: true } }),
    ]);
    return { yearSuccess: true };
  },

  // ── Create term ───────────────────────────────────────────────────────────
  createTerm: async (event) => {
    await requireSuperAdmin(event);
    const data           = await event.request.formData();
    const name           = data.get('name')?.toString().trim()  ?? '';
    const academicYearId = data.get('academicYearId')?.toString() ?? '';
    const startDate      = data.get('startDate')?.toString()    ?? '';
    const endDate        = data.get('endDate')?.toString()      ?? '';

    if (!name || !academicYearId || !startDate || !endDate)
      return fail(400, { termError: 'All fields are required' });

    await db.term.create({
      data: {
        name,
        academicYearId,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        isCurrent: false,
      },
    });
    return { termSuccess: true };
  },

  // ── Set current term ──────────────────────────────────────────────────────
  setCurrentTerm: async (event) => {
    await requireSuperAdmin(event);
    const data   = await event.request.formData();
    const termId = data.get('termId')?.toString() ?? '';

    await db.$transaction([
      db.term.updateMany({ data: { isCurrent: false } }),
      db.term.update({ where: { id: termId }, data: { isCurrent: true } }),
    ]);
    return { termSuccess: true };
  },

  // ── Create fee structure ──────────────────────────────────────────────────
  createFee: async (event) => {
    await requireSuperAdmin(event);
    const data        = await event.request.formData();
    const name        = data.get('name')?.toString().trim()        ?? '';
    const amount      = parseFloat(data.get('amount')?.toString()  ?? '0');
    const description = data.get('description')?.toString().trim() ?? '';

    if (!name || !amount) return fail(400, { feeError: 'Name and amount are required' });

    await db.feeStructure.create({ data: { name, amount, description: description || null } });
    return { feeSuccess: true };
  },

  // ── Change own password ───────────────────────────────────────────────────
  changePassword: async (event) => {
    await requireSuperAdmin(event);
    const data        = await event.request.formData();
    const current     = data.get('current')?.toString()  ?? '';
    const newPass     = data.get('new')?.toString()      ?? '';
    const confirm     = data.get('confirm')?.toString()  ?? '';

    if (!current || !newPass || !confirm)
      return fail(400, { pwError: 'All password fields are required' });
    if (newPass.length < 8)
      return fail(400, { pwError: 'New password must be at least 8 characters' });
    if (newPass !== confirm)
      return fail(400, { pwError: 'Passwords do not match' });

    const user = await db.user.findUnique({ where: { id: event.locals.user!.id } });
    if (!user) return fail(404, { pwError: 'User not found' });

    const valid = await verifyPassword(current, user.passwordHash);
    if (!valid) return fail(400, { pwError: 'Current password is incorrect' });

    await db.user.update({
      where: { id: user.id },
      data:  { passwordHash: await hashPassword(newPass) },
    });
    return { pwSuccess: true };
  },
};
