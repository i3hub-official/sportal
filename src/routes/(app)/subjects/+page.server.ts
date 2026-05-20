// src/routes/(app)/subjects/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);
  const subjects = await db.subject.findMany({ orderBy: { name: 'asc' } });
  return { subjects };
};

export const actions: Actions = {
  create: async (event) => {
    await requireAdmin(event);
    const data = await event.request.formData();
    const name = data.get('name')?.toString().trim() ?? '';
    const code = data.get('code')?.toString().trim().toUpperCase() ?? '';

    if (!name || !code) return fail(400, { error: 'Name and code are required' });

    const existing = await db.subject.findUnique({ where: { code } });
    if (existing) return fail(400, { error: `Code "${code}" is already taken` });

    await db.subject.create({ data: { name, code } });
    return { success: true };
  },

  toggle: async (event) => {
    await requireAdmin(event);
    const data      = await event.request.formData();
    const subjectId = data.get('subjectId')?.toString() ?? '';
    const subject   = await db.subject.findUnique({ where: { id: subjectId } });
    if (!subject) return fail(404, { error: 'Subject not found' });
    await db.subject.update({ where: { id: subjectId }, data: { isActive: !subject.isActive } });
    return { success: true };
  },
};
