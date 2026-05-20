// src/routes/api/staff/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/prisma';
import { ok, unauthorized, badRequest, serverError } from '$lib/server/utils/response';

function guard(event: Parameters<RequestHandler>[0]) {
  if (!event.locals.user) return unauthorized();
  const role = event.locals.user.role;
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return unauthorized('Admins only');
  return null;
}

export const GET: RequestHandler = async (event) => {
  const err = guard(event);
  if (err) return err;

  const { url } = event;
  const search  = url.searchParams.get('search') ?? '';
  const page    = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = Number(url.searchParams.get('perPage') ?? 20);

  const where = search
    ? {
        OR: [
          { firstName:  { contains: search, mode: 'insensitive' as const } },
          { lastName:   { contains: search, mode: 'insensitive' as const } },
          { employeeId: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.staffProfile.findMany({
      where,
      include: { user: { select: { email: true, role: true, isActive: true } } },
      orderBy: { lastName: 'asc' },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    db.staffProfile.count({ where }),
  ]);

  return ok({ items, total, page, perPage, totalPages: Math.ceil(total / perPage) });
};
