// src/routes/(app)/staff/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';

// Alternative approach using raw SQL for search
export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);

  const { url } = event;
  const search = url.searchParams.get('search') ?? '';
  const page   = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = 20;
  const skip = (page - 1) * perPage;

  try {
    let staff;
    let total;

    if (search) {
      // Use raw SQL for search
      staff = await db.$queryRaw`
        SELECT 
          sp.*,
          json_build_object(
            'id', u.id,
            'email', u.email,
            'role', u.role,
            'isActive', u."isActive"
          ) as user
        FROM staff_profiles sp
        JOIN users u ON u.id = sp."userId"
        WHERE 
          sp."firstName" ILIKE ${`%${search}%`} OR
          sp."lastName" ILIKE ${`%${search}%`} OR
          sp."staffId" ILIKE ${`%${search}%`} OR
          sp."staffRole"::text ILIKE ${`%${search}%`} OR
          sp.department ILIKE ${`%${search}%`} OR
          sp.phone ILIKE ${`%${search}%`} OR
          u.email ILIKE ${`%${search}%`}
        ORDER BY sp."lastName" ASC
        LIMIT ${perPage}
        OFFSET ${skip}
      `;
      
      const countResult = await db.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM staff_profiles sp
        JOIN users u ON u.id = sp."userId"
        WHERE 
          sp."firstName" ILIKE ${`%${search}%`} OR
          sp."lastName" ILIKE ${`%${search}%`} OR
          sp."staffId" ILIKE ${`%${search}%`} OR
          sp."staffRole"::text ILIKE ${`%${search}%`} OR
          sp.department ILIKE ${`%${search}%`} OR
          sp.phone ILIKE ${`%${search}%`} OR
          u.email ILIKE ${`%${search}%`}
      `;
      total = Number(countResult[0]?.count || 0);
    } else {
      staff = await db.staffProfile.findMany({
        include: { 
          user: { 
            select: { 
              id: true,
              email: true, 
              role: true, 
              isActive: true 
            } 
          } 
        },
        orderBy: { lastName: 'asc' },
        skip,
        take: perPage,
      });
      total = await db.staffProfile.count();
    }

    // Transform staff data
    const transformedStaff = (Array.isArray(staff) ? staff : []).map((s: any) => ({
      id: s.id,
      userId: s.userId,
      firstName: s.firstName,
      lastName: s.lastName,
      employeeId: s.staffId,
      position: s.staffRole,
      department: s.department,
      phone: s.phone,
      gender: s.gender,
      photoUrl: s.photoUrl,
      user: typeof s.user === 'string' ? JSON.parse(s.user) : s.user
    }));

    return {
      staff: transformedStaff,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      search,
    };
  } catch (error) {
    console.error('Error loading staff:', error);
    return {
      staff: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
      search: '',
    };
  }
};

export const actions: Actions = {
  toggleActive: async (event) => {
    await requireAdmin(event);
    const data   = await event.request.formData();
    const userId = data.get('userId')?.toString();

    if (!userId) return fail(400, { error: 'Missing user ID' });

    try {
      const user = await db.user.findUnique({ 
        where: { id: userId } 
      });
      
      if (!user) return fail(404, { error: 'User not found' });

      await db.user.update({
        where: { id: userId },
        data:  { isActive: !user.isActive },
      });

      return { success: true };
    } catch (error) {
      console.error('Error toggling user status:', error);
      return fail(500, { error: 'Failed to update user status' });
    }
  },
};