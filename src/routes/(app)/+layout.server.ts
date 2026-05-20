// src/routes/(app)/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';

export const load: LayoutServerLoad = async (event) => {
  const user = await requireAuth(event);

  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id:    true,
      email: true,
      role:  true,
      staffProfile: {
        select: {
          id:        true,
          firstName: true,
          lastName:  true,
          staffRole: true,
          photoUrl:  true,
          staffId:   true,
        },
      },
      studentProfile: {
        select: {
          id:          true,
          firstName:   true,
          lastName:    true,
          admissionNo: true,
          photoUrl:    true,
        },
      },
    },
  });

  return { user: profile };
};