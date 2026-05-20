// src/routes/(app)/results/+page.server.ts
import type { PageServerLoad } from './$types';
import { requireTeacher } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';

export const load: PageServerLoad = async (event) => {
  await requireTeacher(event);

  const [classes, terms, subjects] = await Promise.all([
    db.class.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] }),
    db.termRecord.findMany({ orderBy: { startDate: 'desc' } }),
    db.subject.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  const currentTerm = terms.find(t => t.isCurrent) ?? terms[0] ?? null;

  return { classes, terms, subjects, currentTerm };
};
