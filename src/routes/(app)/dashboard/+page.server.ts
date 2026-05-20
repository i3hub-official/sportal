// src/routes/(app)/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  const [
    totalStaff,
    totalStudents,
    nurseryCount,
    primaryCount,
    secondaryCount,
    currentTerm,
    recentStudents,
  ] = await Promise.all([
    db.staffProfile.count(),
    db.studentProfile.count({ where: { isActive: true } }),
    db.studentProfile.count({ where: { isActive: true, level: 'NURSERY' } }),
    db.studentProfile.count({ where: { isActive: true, level: 'PRIMARY' } }),
    db.studentProfile.count({ where: { isActive: true, level: 'SECONDARY' } }),
    db.termRecord.findFirst({ where: { isCurrent: true }, include: { academicYear: true } }),
    db.studentProfile.findMany({
      where:   { isActive: true },
      orderBy: { createdAt: 'desc' },
      take:    5,
      include: { class: { select: { name: true } } },
    }),
  ]);

  return {
    stats: { totalStaff, totalStudents, nurseryCount, primaryCount, secondaryCount },
    currentTerm,
    recentStudents,
  };
};
