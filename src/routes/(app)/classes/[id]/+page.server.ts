// src/routes/(app)/classes/[id]/+page.server.ts
import { db } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  
  try {
    const classData = await db.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        classTeacher: true,
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            gender: true
          }
        },
        timetableSlots: {
          include: {
            subject: true,
            teacher: true
          },
          take: 5,
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    });
    
    if (!classData) {
      throw error(404, 'Class not found');
    }
    
    // Get available teachers for the edit form
    const availableTeachers = await db.staffProfile.findMany({
      where: {
        isActive: true,
        staffRole: {
          in: ['HEADMASTER', 'DEPUTY_HEAD', 'CLASS_TEACHER', 'SUBJECT_TEACHER']
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        staffRole: true
      }
    });
    
    return {
      class: {
        ...classData,
        students: classData.students || [],
        timetableSlots: classData.timetableSlots || []
      },
      availableTeachers: availableTeachers || []
    };
  } catch (err) {
    console.error('Error loading class:', err);
    throw error(500, 'Failed to load class data');
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString();
    const level = formData.get('level')?.toString();
    const classTeacherId = formData.get('classTeacherId')?.toString() || null;
    const capacity = parseInt(formData.get('capacity')?.toString() || '40');
    
    if (!name || !level) {
      return fail(400, { error: 'Name and level are required' });
    }
    
    try {
      await db.class.update({
        where: { id },
        data: {
          name,
          level: level as any,
          classTeacherId: classTeacherId === 'null' || classTeacherId === '' ? null : classTeacherId,
          capacity
        }
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error updating class:', err);
      return fail(500, { error: 'Failed to update class' });
    }
  }
};