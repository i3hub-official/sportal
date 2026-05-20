// src/routes/(app)/staff/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);

  const { url } = event;
  const search = url.searchParams.get('search') ?? '';
  const page   = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = 20;

  const where = search
    ? {
        OR: [
          { firstName:  { contains: search, mode: 'insensitive' as const } },
          { lastName:   { contains: search, mode: 'insensitive' as const } },
          { employeeId: { contains: search, mode: 'insensitive' as const } },
          { position:   { contains: search, mode: 'insensitive' as const } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const [staff, total] = await Promise.all([
    db.staff.findMany({
      where,
      include: { user: { select: { email: true, role: true, isActive: true } } },
      orderBy: { lastName: 'asc' },
      skip:  (page - 1) * perPage,
      take:  perPage,
    }),
    db.staff.count({ where }),
  ]);

  return {
    staff,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    search,
  };
};

export const actions: Actions = {
  toggleActive: async (event) => {
    await requireAdmin(event);
    const data   = await event.request.formData();
    const userId = data.get('userId')?.toString();

    if (!userId) return fail(400, { error: 'Missing user ID' });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return fail(404, { error: 'User not found' });

    await db.user.update({
      where: { id: userId },
      data:  { isActive: !user.isActive },
    });

    return { success: true };
  },
};
