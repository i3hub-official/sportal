// src/routes/api/students/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/prisma';
import { ok, unauthorized, badRequest, serverError } from '$lib/server/utils/response';

function guard(event: Parameters<RequestHandler>[0]) {
  if (!event.locals.user) return unauthorized();
  return null;
}

export const GET: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  const { url } = event;
  const search  = url.searchParams.get('search')  ?? '';
  const level   = url.searchParams.get('level')   ?? '';
  const classId = url.searchParams.get('classId') ?? '';
  const page    = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = Number(url.searchParams.get('perPage') ?? 25);

  const where: any = { isActive: true };
  if (level)   where.level   = level;
  if (classId) where.classId = classId;
  if (search) {
    where.OR = [
      { firstName:   { contains: search, mode: 'insensitive' } },
      { lastName:    { contains: search, mode: 'insensitive' } },
      { admissionNo: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    db.studentProfile.findMany({
      where,
      include: { class: { select: { id: true, name: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    db.studentProfile.count({ where }),
  ]);

  return ok({ items, total, page, perPage, totalPages: Math.ceil(total / perPage) });
};
