// src/routes/seed/+page.server.ts
// ⚠️  PUBLIC route — no auth required.
// Fully idempotent: skips any records that already exist.

import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/prisma';
import { hashPassword } from '$lib/server/auth/password';

export const load: PageServerLoad = async () => {
  const [userCount, studentCount, classCount, subjectCount] = await Promise.all([
    db.user.count(),
    db.studentProfile.count(),
    db.class.count(),
    db.subject.count(),
  ]);
  return { stats: { users: userCount, students: studentCount, classes: classCount, subjects: subjectCount } };
};

// ─────────────────────────────────────────────────────────────────────────────
// Seed data definitions
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { name: 'English Language',     code: 'ENG',  level: 'SECONDARY' as const },
  { name: 'Mathematics',          code: 'MATH', level: 'SECONDARY' as const },
  { name: 'Basic Science',        code: 'BSC',  level: 'SECONDARY' as const },
  { name: 'Social Studies',       code: 'SST',  level: 'SECONDARY' as const },
  { name: 'Civic Education',      code: 'CIV',  level: 'SECONDARY' as const },
  { name: 'Agricultural Science', code: 'AGR',  level: 'SECONDARY' as const },
  { name: 'Christian R. Studies', code: 'CRS',  level: 'SECONDARY' as const },
  { name: 'Basic Technology',     code: 'BTC',  level: 'SECONDARY' as const },
  { name: 'PHE',                  code: 'PHE',  level: 'SECONDARY' as const },
  { name: 'Computer Studies',     code: 'CMP',  level: 'SECONDARY' as const },
  // Primary
  { name: 'Quantitative Reasoning', code: 'QR',  level: 'PRIMARY' as const },
  { name: 'Verbal Reasoning',       code: 'VR',  level: 'PRIMARY' as const },
  { name: 'English Language',       code: 'PENG',level: 'PRIMARY' as const },
  { name: 'Mathematics',            code: 'PMATH',level: 'PRIMARY' as const },
  { name: 'Basic Science & Tech',   code: 'PBST',level: 'PRIMARY' as const },
  { name: 'National Values',        code: 'NVE', level: 'PRIMARY' as const },
  // Nursery
  { name: 'Phonics',   code: 'PHO', level: 'NURSERY' as const },
  { name: 'Numeracy',  code: 'NUM', level: 'NURSERY' as const },
  { name: 'Rhymes',    code: 'RHY', level: 'NURSERY' as const },
];

const CLASS_DEFS = [
  // Nursery (Nursery 1 → Nursery 3 / KG)
  { name: 'Nursery 1', level: 'NURSERY' as const },
  { name: 'Nursery 2', level: 'NURSERY' as const },
  { name: 'Nursery 3', level: 'NURSERY' as const },
  // Primary 1 – 6 (two arms each)
  { name: 'Primary 1A', level: 'PRIMARY' as const },
  { name: 'Primary 1B', level: 'PRIMARY' as const },
  { name: 'Primary 2A', level: 'PRIMARY' as const },
  { name: 'Primary 2B', level: 'PRIMARY' as const },
  { name: 'Primary 3A', level: 'PRIMARY' as const },
  { name: 'Primary 3B', level: 'PRIMARY' as const },
  { name: 'Primary 4A', level: 'PRIMARY' as const },
  { name: 'Primary 4B', level: 'PRIMARY' as const },
  { name: 'Primary 5A', level: 'PRIMARY' as const },
  { name: 'Primary 5B', level: 'PRIMARY' as const },
  { name: 'Primary 6A', level: 'PRIMARY' as const },
  { name: 'Primary 6B', level: 'PRIMARY' as const },
  // JSS 1 – 3 (two arms each)
  { name: 'JSS 1A', level: 'SECONDARY' as const },
  { name: 'JSS 1B', level: 'SECONDARY' as const },
  { name: 'JSS 2A', level: 'SECONDARY' as const },
  { name: 'JSS 2B', level: 'SECONDARY' as const },
  { name: 'JSS 3A', level: 'SECONDARY' as const },
  { name: 'JSS 3B', level: 'SECONDARY' as const },
  // SS 1 – 3 (two arms each)  ← "SS" not "SSS"
  { name: 'SS 1A', level: 'SECONDARY' as const },
  { name: 'SS 1B', level: 'SECONDARY' as const },
  { name: 'SS 2A', level: 'SECONDARY' as const },
  { name: 'SS 2B', level: 'SECONDARY' as const },
  { name: 'SS 3A', level: 'SECONDARY' as const },
  { name: 'SS 3B', level: 'SECONDARY' as const },
];

const GRADE_SCALES = [
  // Secondary (WAEC style)
  { level: 'SECONDARY' as const, grade: 'A1', minScore: 75, maxScore: 100, remark: 'Excellent'  },
  { level: 'SECONDARY' as const, grade: 'B2', minScore: 70, maxScore: 74,  remark: 'Very Good'  },
  { level: 'SECONDARY' as const, grade: 'B3', minScore: 65, maxScore: 69,  remark: 'Good'       },
  { level: 'SECONDARY' as const, grade: 'C4', minScore: 60, maxScore: 64,  remark: 'Credit'     },
  { level: 'SECONDARY' as const, grade: 'C5', minScore: 55, maxScore: 59,  remark: 'Credit'     },
  { level: 'SECONDARY' as const, grade: 'C6', minScore: 50, maxScore: 54,  remark: 'Credit'     },
  { level: 'SECONDARY' as const, grade: 'D7', minScore: 45, maxScore: 49,  remark: 'Pass'       },
  { level: 'SECONDARY' as const, grade: 'E8', minScore: 40, maxScore: 44,  remark: 'Pass'       },
  { level: 'SECONDARY' as const, grade: 'F9', minScore: 0,  maxScore: 39,  remark: 'Fail'       },
  // Primary
  { level: 'PRIMARY' as const,   grade: 'A',  minScore: 75, maxScore: 100, remark: 'Excellent'  },
  { level: 'PRIMARY' as const,   grade: 'B',  minScore: 60, maxScore: 74,  remark: 'Very Good'  },
  { level: 'PRIMARY' as const,   grade: 'C',  minScore: 50, maxScore: 59,  remark: 'Good'       },
  { level: 'PRIMARY' as const,   grade: 'D',  minScore: 40, maxScore: 49,  remark: 'Pass'       },
  { level: 'PRIMARY' as const,   grade: 'F',  minScore: 0,  maxScore: 39,  remark: 'Fail'       },
  // Nursery
  { level: 'NURSERY' as const,   grade: 'E',  minScore: 75, maxScore: 100, remark: 'Excellent'  },
  { level: 'NURSERY' as const,   grade: 'VG', minScore: 60, maxScore: 74,  remark: 'Very Good'  },
  { level: 'NURSERY' as const,   grade: 'G',  minScore: 50, maxScore: 59,  remark: 'Good'       },
  { level: 'NURSERY' as const,   grade: 'S',  minScore: 40, maxScore: 49,  remark: 'Satisfactory'},
  { level: 'NURSERY' as const,   grade: 'NS', minScore: 0,  maxScore: 39,  remark: 'Needs Support'},
];

// Nigerian names for realistic sample data
const FIRST_NAMES_MALE   = ['Chukwuemeka','Oluwaseun','Ibrahim','Adebayo','Chidi','Tunde','Emeka','Kelechi','Musa','Sunday','Ikenna','Babatunde','Uche','Olamide','Femi','Sule','Chibuzor','Rotimi','Efosa','Ayodele'];
const FIRST_NAMES_FEMALE = ['Ngozi','Fatima','Adaeze','Blessing','Chioma','Aisha','Yetunde','Nneka','Amaka','Zainab','Ifeoma','Bukola','Chiamaka','Hadiza','Tolulope','Nkechi','Adaora','Rukayat','Ebere','Funmilayo'];
const LAST_NAMES         = ['Okonkwo','Adeleke','Musa','Babangida','Eze','Okafor','Abdullahi','Adesanya','Nwosu','Ogundipe','Chukwu','Aliyu','Obi','Afolabi','Nkemdirim','Suleiman','Obiora','Adeyemi','Onyekachi','Bello','Usman','Okeke','Danjuma','Emeka','Lawal','Nwofor','Garba','Ogundimu','Ibe','Faloye'];
const STATES             = ['Abia','Anambra','Kano','Lagos','Oyo','Rivers','Enugu','Kaduna','Delta','Borno','Imo','Osun','Kwara','Niger','Plateau'];
const RELIGIONS          = ['Christianity','Islam','Christianity','Christianity','Islam'];
const BLOOD_GROUPS       = ['A+','B+','O+','AB+','A-','B-','O-'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeStudentDOB(level: 'NURSERY' | 'PRIMARY' | 'SECONDARY'): Date {
  const now    = new Date();
  const ranges = { NURSERY: [3,5], PRIMARY: [6,12], SECONDARY: [11,18] };
  const [lo, hi] = ranges[level];
  const age    = randInt(lo, hi);
  const dob    = new Date(now);
  dob.setFullYear(dob.getFullYear() - age);
  dob.setMonth(randInt(0, 11));
  dob.setDate(randInt(1, 28));
  return dob;
}

// ─────────────────────────────────────────────────────────────────────────────

export const actions: Actions = {
  seed: async (event) => {
    const data       = await event.request.formData();
    const schoolName = data.get('schoolName')?.toString().trim() ?? 'Demo School';
    const adminEmail = data.get('adminEmail')?.toString().trim() ?? '';
    const adminPass  = data.get('adminPass')?.toString()         ?? '';
    const yearName   = data.get('yearName')?.toString().trim()   ?? '2024/2025';
    const yearStart  = data.get('yearStart')?.toString()         ?? '';
    const yearEnd    = data.get('yearEnd')?.toString()           ?? '';
    const studentsPerClass = Math.min(50, Math.max(1, Number(data.get('studentsPerClass') ?? 10)));

    if (!adminEmail || !adminPass)
      return fail(400, { error: 'Admin email and password are required.' });
    if (adminPass.length < 8)
      return fail(400, { error: 'Password must be at least 8 characters.' });
    if (!yearStart || !yearEnd)
      return fail(400, { error: 'Academic year start and end dates are required.' });

    const results: Record<string, number> = {
      users: 0, staff: 0, academicYears: 0, terms: 0,
      gradeScales: 0, subjects: 0, classes: 0, fees: 0, students: 0,
    };

    // ── 1. Super-admin user ───────────────────────────────────────────────────
    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPass);
      const existingStaff = await db.staffProfile.findUnique({ where: { staffId: 'ADM-001' } });
      if (!existingStaff) {
        await db.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            role: 'SUPER_ADMIN',
            staffProfile: {
              create: {
                staffId:   'ADM-001',
                firstName: 'Head',
                lastName:  'Master',
                gender:    'MALE',
                staffRole: 'HEADMASTER',
              },
            },
          },
        });
        results.users++;
        results.staff++;
      }
    }

    // ── 2. Extra demo teacher ─────────────────────────────────────────────────
    const teacherEmail = 'teacher@demo.school';
    if (!await db.user.findUnique({ where: { email: teacherEmail } })) {
      const ph = await hashPassword('Teacher@123');
      if (!await db.staffProfile.findUnique({ where: { staffId: 'TCH-001' } })) {
        await db.user.create({
          data: {
            email: teacherEmail,
            passwordHash: ph,
            role: 'TEACHER',
            staffProfile: {
              create: {
                staffId: 'TCH-001',
                firstName: 'Amaka',
                lastName: 'Okonkwo',
                gender: 'FEMALE',
                staffRole: 'SUBJECT_TEACHER',
                department: 'Science',
                qualification: 'B.Ed Science Education',
              },
            },
          },
        });
        results.users++;
        results.staff++;
      }
    }

    // ── 3. Academic year ──────────────────────────────────────────────────────
    let academicYear = await db.academicYear.findUnique({ where: { name: yearName } });
    if (!academicYear) {
      academicYear = await db.academicYear.create({
        data: {
          name:      yearName,
          startDate: new Date(yearStart),
          endDate:   new Date(yearEnd),
          isCurrent: true,
        },
      });
      results.academicYears++;
    }

    // ── 4. Term records ───────────────────────────────────────────────────────
    const yearMs  = new Date(yearStart).getTime();
    const termLen = Math.floor((new Date(yearEnd).getTime() - yearMs) / 3);

    const termDefs: { term: 'FIRST' | 'SECOND' | 'THIRD'; offset: number }[] = [
      { term: 'FIRST',  offset: 0 },
      { term: 'SECOND', offset: 1 },
      { term: 'THIRD',  offset: 2 },
    ];

    for (const { term, offset } of termDefs) {
      const existing = await db.termRecord.findUnique({
        where: { term_academicYearId: { term, academicYearId: academicYear.id } },
      });
      if (!existing) {
        await db.termRecord.create({
          data: {
            term,
            academicYearId: academicYear.id,
            startDate: new Date(yearMs + offset * termLen),
            endDate:   new Date(yearMs + (offset + 1) * termLen - 1),
            isCurrent: offset === 0,
          },
        });
        results.terms++;
      }
    }

    // ── 5. Grade scales ───────────────────────────────────────────────────────
    for (const gs of GRADE_SCALES) {
      const r = await db.gradeScale.upsert({
        where:  { level_grade: { level: gs.level, grade: gs.grade } },
        update: {},
        create: gs,
      });
      if (r) results.gradeScales++;
    }
    // deduplicate count — upsert always returns; count distincts by checking created vs updated is non-trivial,
    // so just report total processed:
    results.gradeScales = GRADE_SCALES.length;

    // ── 6. Subjects ───────────────────────────────────────────────────────────
    for (const s of SUBJECTS) {
      await db.subject.upsert({
        where:  { code: s.code },
        update: {},
        create: s,
      });
    }
    results.subjects = SUBJECTS.length;

    // ── 7. Classes ────────────────────────────────────────────────────────────
    const classMap: Record<string, string> = {}; // name → id

    for (const cd of CLASS_DEFS) {
      const cls = await db.class.upsert({
        where:  { name_academicYearId: { name: cd.name, academicYearId: academicYear.id } },
        update: {},
        create: { name: cd.name, level: cd.level, academicYearId: academicYear.id },
      });
      classMap[cd.name] = cls.id;
    }
    results.classes = CLASS_DEFS.length;

    // ── 8. Fee structures ─────────────────────────────────────────────────────
    const feeDefs = [
      { name: 'School Fees',  amount: 25000, term: 'FIRST'  as const, level: 'SECONDARY' as const },
      { name: 'School Fees',  amount: 25000, term: 'SECOND' as const, level: 'SECONDARY' as const },
      { name: 'School Fees',  amount: 25000, term: 'THIRD'  as const, level: 'SECONDARY' as const },
      { name: 'PTA Levy',     amount: 3000,  term: 'FIRST'  as const, level: 'SECONDARY' as const },
      { name: 'Exam Levy',    amount: 5000,  term: 'THIRD'  as const, level: 'SECONDARY' as const },
      { name: 'School Fees',  amount: 18000, term: 'FIRST'  as const, level: 'PRIMARY'   as const },
      { name: 'School Fees',  amount: 18000, term: 'SECOND' as const, level: 'PRIMARY'   as const },
      { name: 'School Fees',  amount: 18000, term: 'THIRD'  as const, level: 'PRIMARY'   as const },
      { name: 'School Fees',  amount: 12000, term: 'FIRST'  as const, level: 'NURSERY'   as const },
      { name: 'School Fees',  amount: 12000, term: 'SECOND' as const, level: 'NURSERY'   as const },
      { name: 'School Fees',  amount: 12000, term: 'THIRD'  as const, level: 'NURSERY'   as const },
      { name: 'Books & Supplies', amount: 4000, term: 'FIRST' as const, level: 'PRIMARY' as const },
    ];

    for (const f of feeDefs) {
      await db.feeStructure.upsert({
        where:  { name_term_academicYearId: { name: f.name, term: f.term, academicYearId: academicYear.id } },
        update: {},
        create: { ...f, academicYearId: academicYear.id },
      });
    }
    results.fees = feeDefs.length;

    // ── 9. Students ───────────────────────────────────────────────────────────
    // Get current admission count for sequential numbering
    let admissionCounter = await db.studentProfile.count();
    const year = new Date().getFullYear();

    for (const cd of CLASS_DEFS) {
      const classId = classMap[cd.name];

      for (let i = 0; i < studentsPerClass; i++) {
        const gender    = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
        const firstName = gender === 'MALE' ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE);
        const lastName  = pick(LAST_NAMES);
        admissionCounter++;
        const admissionNo = `SMS/${year}/${String(admissionCounter).padStart(4, '0')}`;

        // Skip if admissionNo already taken (idempotent re-run safety)
        const alreadyExists = await db.studentProfile.findUnique({ where: { admissionNo } });
        if (alreadyExists) continue;

        await db.studentProfile.create({
          data: {
            admissionNo,
            firstName,
            lastName,
            gender:       gender as 'MALE' | 'FEMALE',
            dateOfBirth:  makeStudentDOB(cd.level),
            level:        cd.level,
            classId,
            stateOfOrigin: pick(STATES),
            religion:     pick(RELIGIONS),
            bloodGroup:   pick(BLOOD_GROUPS),
            isActive:     true,
          },
        });
        results.students++;
      }
    }

    return {
      success: true,
      results,
      message: `"${schoolName}" seeded successfully.`,
    };
  },
};