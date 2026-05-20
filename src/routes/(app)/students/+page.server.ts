// src/routes/(app)/students/+page.server.ts
import type { PageServerLoad } from './$types';
import { requireTeacher } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';

export const load: PageServerLoad = async (event) => {
  await requireTeacher(event);

  const { url } = event;
  const search  = url.searchParams.get('search') ?? '';
  const level   = url.searchParams.get('level')  ?? '';
  const classId = url.searchParams.get('class')  ?? '';
  const page    = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = 25;

  const where: any = { isActive: true };
  if (level)   where.level   = level;
  if (classId) where.classId = classId;
  if (search)  {
    where.OR = [
      { firstName:   { contains: search, mode: 'insensitive' } },
      { lastName:    { contains: search, mode: 'insensitive' } },
      { admissionNo: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [students, total, classes] = await Promise.all([
    db.studentProfile.findMany({
      where,
      include: { class: { select: { id: true, name: true, level: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip:  (page - 1) * perPage,
      take:  perPage,
    }),
    db.studentProfile.count({ where }),
    db.class.findMany({ orderBy: [{ level: 'asc' }, { name: 'asc' }] }),
  ]);

  return { students, total, page, perPage, totalPages: Math.ceil(total / perPage), search, level, classId, classes };
};
