// src/routes/(app)/staff/new/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { hashPassword } from '$lib/server/auth/password';
import { sendWelcomeEmail } from '$lib/server/email';
import { uploadPhoto } from '$lib/server/upload';
import { PUBLIC_APP_URL } from '$env/static/public';
import type { Gender, StaffRole } from '@prisma/client';

export const load: PageServerLoad = async (event) => {
  await requireAdmin(event);
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    await requireAdmin(event);

    const data = await event.request.formData();

    const email       = data.get('email')?.toString().trim()      ?? '';
    const firstName   = data.get('firstName')?.toString().trim()  ?? '';
    const lastName    = data.get('lastName')?.toString().trim()   ?? '';
    const middleName  = data.get('middleName')?.toString().trim() ?? '';
    const staffId     = data.get('staffId')?.toString().trim()    ?? '';
    const staffRole   = data.get('staffRole')?.toString()         ?? 'SUBJECT_TEACHER';
    const role        = data.get('role')?.toString()              ?? 'TEACHER';
    const phone       = data.get('phone')?.toString().trim()      ?? '';
    const gender      = data.get('gender')?.toString().trim()     ?? '';
    const qualification = data.get('qualification')?.toString().trim() ?? '';
    const address     = data.get('address')?.toString().trim()    ?? '';
    const photo       = data.get('photo') as File | null;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!email || !firstName || !lastName || !staffId || !gender || !staffRole) {
      return fail(400, {
        error: 'Email, name, staff ID, gender and staff role are required',
        values: Object.fromEntries(data),
      });
    }

    // Validate gender is a valid enum value
    const validGenders: Gender[] = ['MALE', 'FEMALE'];
    if (!validGenders.includes(gender as Gender)) {
      return fail(400, { error: 'Invalid gender value', values: Object.fromEntries(data) });
    }

    // Validate staffRole is a valid enum value
    const validStaffRoles: StaffRole[] = [
      'HEADMASTER', 'DEPUTY_HEAD', 'CLASS_TEACHER', 'SUBJECT_TEACHER',
      'BURSAR', 'SECRETARY', 'LIBRARIAN', 'COUNSELOR', 'SUPPORT_STAFF',
    ];
    if (!validStaffRoles.includes(staffRole as StaffRole)) {
      return fail(400, { error: 'Invalid staff role', values: Object.fromEntries(data) });
    }

    // ── Check for duplicates ──────────────────────────────────────────────────
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return fail(400, { error: 'Email is already in use', values: Object.fromEntries(data) });
    }

    const existingStaffId = await db.staffProfile.findUnique({ where: { staffId } });
    if (existingStaffId) {
      return fail(400, { error: 'Staff ID is already taken', values: Object.fromEntries(data) });
    }

    // ── Photo upload ──────────────────────────────────────────────────────────
    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      const result = await uploadPhoto(photo, 'staff');
      if (!result.success) {
        return fail(400, { error: result.error, values: Object.fromEntries(data) });
      }
      photoUrl = result.url;
    }

    // ── Generate temp password ────────────────────────────────────────────────
    const tempPassword = `Sms@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const passwordHash = await hashPassword(tempPassword);

    // ── Create user + staffProfile in one transaction ─────────────────────────
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role: role as any,
        staffProfile: {
          create: {
            firstName,
            lastName,
            middleName:    middleName    || null,
            staffId,                              // schema field (not employeeId)
            staffRole:     staffRole as StaffRole,// required enum field
            gender:        gender as Gender,      // enum: MALE | FEMALE
            phone:         phone         || null,
            address:       address       || null,
            qualification: qualification || null,
            photoUrl,
          },
        },
      },
      include: { staffProfile: true },
    });

    // ── Send welcome email (non-blocking) ─────────────────────────────────────
    sendWelcomeEmail({
      to:           email,
      name:         `${firstName} ${lastName}`,
      role:         role.replace('_', ' '),
      loginUrl:     `${PUBLIC_APP_URL}/login`,
      tempPassword,
    }).catch(console.error);

    throw redirect(303, `/staff/${user.staffProfile!.id}`);
  },
};