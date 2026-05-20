// src/routes/(app)/results/[studentId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { requireTeacher } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  await requireTeacher(event);

  const student = await db.studentProfile.findUnique({
    where:   { id: event.params.studentId },
    include: { class: true },
  });
  if (!student) throw error(404, 'Student not found');

  const terms = await db.termRecord.findMany({ orderBy: { startDate: 'desc' } });
  const termId = event.url.searchParams.get('term') ?? terms.find(t => t.isCurrent)?.id ?? terms[0]?.id;

  const results = termId
    ? await db.result.findMany({
        where:   { studentProfileId: student.id, termId },
        include: { subject: true },
        orderBy: { subject: { name: 'asc' } },
      })
    : [];

  const totalScore  = results.reduce((s, r) => s + (r.totalScore ?? 0), 0);
  const avgScore    = results.length ? (totalScore / results.length).toFixed(1) : null;

  return { student, terms, results, selectedTermId: termId, avgScore };
};
