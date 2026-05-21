// src/routes/(app)/attendance/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/server/auth/guards';
import { db } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const user = await requireAuth(event);
  
  const [classes, terms] = await Promise.all([
    db.class.findMany({ 
      orderBy: [{ level: 'asc' }, { name: 'asc' }] 
    }),
    db.termRecord.findMany({ 
      orderBy: { startDate: 'desc' } 
    }),
  ]);

  const currentTerm = terms.find(t => t.isCurrent) ?? terms[0] ?? null;
  
  return { 
    classes, 
    terms, 
    currentTerm,
    userRole: user.role,
    isHeadmaster: user.role === 'SUPER_ADMIN'
  };
};

export const actions: Actions = {
  saveAttendance: async (event) => {
    const user = await requireAuth(event);
    const data = await event.request.json();
    const { classId, date, records } = data;
    
    if (!classId || !date || !records) {
      return fail(400, { error: 'Missing required fields' });
    }
    
    // Parse the date
    const attendanceDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user is Headmaster (SUPER_ADMIN)
    const isHeadmaster = user.role === 'SUPER_ADMIN';
    const isTeacher = user.role === 'TEACHER';
    
    // Teachers can only modify today's attendance
    if (isTeacher) {
      const isToday = attendanceDate.toDateString() === today.toDateString();
      if (!isToday) {
        return fail(403, { 
          error: 'Teachers can only modify attendance for the current day' 
        });
      }
    }
    
    // Get current term
    const currentTerm = await db.termRecord.findFirst({
      where: { isCurrent: true }
    });
    
    if (!currentTerm) {
      return fail(400, { error: 'No active term found' });
    }
    
    // Get the class to verify it exists
    const classExists = await db.class.findUnique({
      where: { id: classId }
    });
    
    if (!classExists) {
      return fail(404, { error: 'Class not found' });
    }
    
    // Process each attendance record
    for (const record of records) {
      const { studentId, status, note } = record;
      
      // Check if attendance already exists for this student and date
      const existingAttendance = await db.attendance.findFirst({
        where: {
          studentProfileId: studentId,
          date: attendanceDate
        }
      });
      
      if (existingAttendance) {
        // Update existing attendance
        await db.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            note: note || null,
            markedById: user.staffProfile?.id
          }
        });
      } else {
        // Create new attendance
        await db.attendance.create({
          data: {
            studentProfileId: studentId,
            classId,
            termRecordId: currentTerm.id,
            date: attendanceDate,
            status,
            note: note || null,
            markedById: user.staffProfile?.id
          }
        });
      }
    }
    
    return { success: true };
  },
  
  getAttendance: async (event) => {
    const user = await requireAuth(event);
    const url = new URL(event.request.url);
    const classId = url.searchParams.get('classId');
    const date = url.searchParams.get('date');
    
    if (!classId || !date) {
      return fail(400, { error: 'Missing required fields' });
    }
    
    const attendanceDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isHeadmaster = user.role === 'SUPER_ADMIN';
    const isTeacher = user.role === 'TEACHER';
    
    // Get students in the class
    const students = await db.studentProfile.findMany({
      where: { classId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNo: true
      },
      orderBy: { lastName: 'asc' }
    });
    
    // Get existing attendance records for this date
    const attendances = await db.attendance.findMany({
      where: {
        classId,
        date: attendanceDate
      },
      select: {
        id: true,
        studentProfileId: true,
        status: true,
        note: true,
        markedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        createdAt: true
      }
    });
    
    // Create a map of attendance by studentId
    const attendanceMap = new Map();
    attendances.forEach(att => {
      attendanceMap.set(att.studentProfileId, att);
    });
    
    // Combine students with their attendance records
    const records = students.map(student => {
      const attendance = attendanceMap.get(student.id);
      const canEdit = isHeadmaster || attendanceDate.toDateString() === today.toDateString();
      
      return {
        id: attendance?.id || null,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        status: attendance?.status || 'PRESENT',
        note: attendance?.note || null,
        markedBy: attendance?.markedBy ? 
          `${attendance.markedBy.firstName} ${attendance.markedBy.lastName}` : null,
        markedAt: attendance?.createdAt || null,
        canEdit // Flag to indicate if this record can be edited
      };
    });
    
    return new Response(JSON.stringify({ 
      data: records,
      canEditAny: isHeadmaster || attendanceDate.toDateString() === today.toDateString(),
      isHeadmaster,
      isToday: attendanceDate.toDateString() === today.toDateString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};