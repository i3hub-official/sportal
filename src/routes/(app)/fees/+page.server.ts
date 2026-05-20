// src/routes/(app)/fees/+page.server.ts
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);

  const { url } = event;
  const search  = url.searchParams.get('search')  ?? '';
  const status  = url.searchParams.get('status')  ?? '';
  const classId = url.searchParams.get('class')   ?? '';
  const page    = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = 25;

  const where: any = {};
  if (status)  where.status  = status;
  if (classId) where.classId = classId;
  if (search)  {
    where.student = {
      OR: [
        { firstName:   { contains: search, mode: 'insensitive' } },
        { lastName:    { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [records, total, classes, structures] = await Promise.all([
    db.feeRecord.findMany({
      where,
      include: {
        student:      { select: { firstName: true, lastName: true, admissionNo: true } },
        feeStructure: { select: { name: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.feeRecord.count({ where }),
    db.class.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] }),
    db.feeStructure.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const summary = await db.feeRecord.aggregate({
    _sum: { amountPaid: true, balance: true },
  });

  return {
    records, total, page, perPage,
    totalPages: Math.ceil(total / perPage),
    search, status, classId, classes, structures,
    totalPaid:    summary._sum.amountPaid ?? 0,
    totalBalance: summary._sum.balance    ?? 0,
  };
};
