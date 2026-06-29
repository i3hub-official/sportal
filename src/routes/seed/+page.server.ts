// src/routes/seed/+page.server.ts
// ⚠️  PUBLIC route — no auth required.
// Fully idempotent: skips records that already exist.
// Seeds: users, staff, academic year, terms, grade scales, subjects,
//        classes, fee structures, students, results (CA+exam+grade+position),
//        attendance (every school day per term), fee records.

import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/prisma';
import { hashPassword } from '$lib/server/auth/password';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, dp = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp));
}
/** Clamp a value between lo and hi */
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** All weekdays (Mon–Fri) between two dates inclusive */
function schoolDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const fin = new Date(end);
  fin.setHours(0, 0, 0, 0);
  while (cur <= fin) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/**
 * Derive grade + remark from total score for a given school level.
 * Uses WAEC-style for Secondary, letter grades for Primary/Nursery.
 */
function computeGrade(
  score: number,
  level: 'NURSERY' | 'PRIMARY' | 'SECONDARY',
): { grade: string; remark: string } {
  if (level === 'SECONDARY') {
    if (score >= 75) return { grade: 'A1', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B2', remark: 'Very Good' };
    if (score >= 65) return { grade: 'B3', remark: 'Good' };
    if (score >= 60) return { grade: 'C4', remark: 'Credit' };
    if (score >= 55) return { grade: 'C5', remark: 'Credit' };
    if (score >= 50) return { grade: 'C6', remark: 'Credit' };
    if (score >= 45) return { grade: 'D7', remark: 'Pass' };
    if (score >= 40) return { grade: 'E8', remark: 'Pass' };
    return { grade: 'F9', remark: 'Fail' };
  }
  if (level === 'PRIMARY') {
    if (score >= 75) return { grade: 'A', remark: 'Excellent' };
    if (score >= 60) return { grade: 'B', remark: 'Very Good' };
    if (score >= 50) return { grade: 'C', remark: 'Good' };
    if (score >= 40) return { grade: 'D', remark: 'Pass' };
    return { grade: 'F', remark: 'Fail' };
  }
  // NURSERY
  if (score >= 75) return { grade: 'E',  remark: 'Excellent' };
  if (score >= 60) return { grade: 'VG', remark: 'Very Good' };
  if (score >= 50) return { grade: 'G',  remark: 'Good' };
  if (score >= 40) return { grade: 'S',  remark: 'Satisfactory' };
  return { grade: 'NS', remark: 'Needs Support' };
}

/**
 * Generate a realistic score for a student.
 * "ability" (0–1) biases the student's general performance.
 * Subject difficulty shifts scores slightly.
 */
function genScore(
  ability: number,           // 0 (weak) – 1 (strong)
  maxMark: number,           // e.g. 40 for CA, 60 for exam
  difficulty: number = 0.5,  // 0 (easy) – 1 (hard)
): number {
  // Base percentage driven by ability, softened by difficulty
  const basePct = clamp(ability - difficulty * 0.15 + randFloat(-0.1, 0.1), 0.1, 1);
  return clamp(Math.round(basePct * maxMark * 10) / 10, 0, maxMark);
}

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const FIRST_NAMES_MALE = [
  'Chukwuemeka','Oluwaseun','Ibrahim','Adebayo','Chidi','Tunde','Emeka','Kelechi',
  'Musa','Sunday','Ikenna','Babatunde','Uche','Olamide','Femi','Sule','Chibuzor',
  'Rotimi','Efosa','Ayodele','Gbenga','Obinna','Taiwo','Abdulrahman','Nnamdi',
  'Chiamaka','Temitope','Segun','Ifeanyi','Kingsley',
] as const;

const FIRST_NAMES_FEMALE = [
  'Ngozi','Fatima','Adaeze','Blessing','Chioma','Aisha','Yetunde','Nneka','Amaka',
  'Zainab','Ifeoma','Bukola','Chiamaka','Hadiza','Tolulope','Nkechi','Adaora',
  'Rukayat','Ebere','Funmilayo','Mariam','Oluwakemi','Uchenna','Halima','Josephine',
  'Chinelo','Yewande','Abimbola','Onyinye','Rasheedat',
] as const;

const LAST_NAMES = [
  'Okonkwo','Adeleke','Musa','Babangida','Eze','Okafor','Abdullahi','Adesanya',
  'Nwosu','Ogundipe','Chukwu','Aliyu','Obi','Afolabi','Nkemdirim','Suleiman',
  'Obiora','Adeyemi','Onyekachi','Bello','Usman','Okeke','Danjuma','Lawal',
  'Nwofor','Garba','Ogundimu','Ibe','Faloye','Haruna','Yakubu','Adekunle',
  'Olawale','Nzechukwu','Opara','Tijani','Abubakar','Aminu','Egwuatu','Duru',
] as const;

const STATES = [
  'Abia','Anambra','Kano','Lagos','Oyo','Rivers','Enugu','Kaduna','Delta',
  'Borno','Imo','Osun','Kwara','Niger','Plateau','Bauchi','Sokoto','Kogi',
  'Cross River','Akwa Ibom',
] as const;

const RELIGIONS   = ['Christianity','Christianity','Islam','Christianity','Islam'] as const;
const BLOOD_GROUPS = ['A+','B+','O+','AB+','A-','B-','O-'] as const;
const PAY_METHODS  = ['Cash','Bank Transfer','POS'] as const;

// Subjects — each entry now carries a difficulty factor
const SUBJECTS_SEC = [
  { name: 'English Language',      code: 'ENG',  level: 'SECONDARY' as const, difficulty: 0.45 },
  { name: 'Mathematics',           code: 'MATH', level: 'SECONDARY' as const, difficulty: 0.60 },
  { name: 'Basic Science',         code: 'BSC',  level: 'SECONDARY' as const, difficulty: 0.55 },
  { name: 'Social Studies',        code: 'SST',  level: 'SECONDARY' as const, difficulty: 0.40 },
  { name: 'Civic Education',       code: 'CIV',  level: 'SECONDARY' as const, difficulty: 0.35 },
  { name: 'Agricultural Science',  code: 'AGR',  level: 'SECONDARY' as const, difficulty: 0.45 },
  { name: 'Christian R. Studies',  code: 'CRS',  level: 'SECONDARY' as const, difficulty: 0.35 },
  { name: 'Basic Technology',      code: 'BTC',  level: 'SECONDARY' as const, difficulty: 0.50 },
  { name: 'PHE',                   code: 'PHE',  level: 'SECONDARY' as const, difficulty: 0.30 },
  { name: 'Computer Studies',      code: 'CMP',  level: 'SECONDARY' as const, difficulty: 0.50 },
];

const SUBJECTS_PRI = [
  { name: 'English Language',      code: 'PENG',  level: 'PRIMARY' as const, difficulty: 0.40 },
  { name: 'Mathematics',           code: 'PMATH', level: 'PRIMARY' as const, difficulty: 0.55 },
  { name: 'Basic Science & Tech',  code: 'PBST',  level: 'PRIMARY' as const, difficulty: 0.45 },
  { name: 'Social Studies',        code: 'PSST',  level: 'PRIMARY' as const, difficulty: 0.35 },
  { name: 'National Values',       code: 'NVE',   level: 'PRIMARY' as const, difficulty: 0.30 },
  { name: 'Quantitative Reasoning',code: 'QR',    level: 'PRIMARY' as const, difficulty: 0.60 },
  { name: 'Verbal Reasoning',      code: 'VR',    level: 'PRIMARY' as const, difficulty: 0.50 },
];

const SUBJECTS_NUR = [
  { name: 'Phonics',   code: 'PHO', level: 'NURSERY' as const, difficulty: 0.30 },
  { name: 'Numeracy',  code: 'NUM', level: 'NURSERY' as const, difficulty: 0.35 },
  { name: 'Rhymes & Arts', code: 'RHY', level: 'NURSERY' as const, difficulty: 0.25 },
];

const ALL_SUBJECTS = [...SUBJECTS_SEC, ...SUBJECTS_PRI, ...SUBJECTS_NUR];

const CLASS_DEFS = [
  // Nursery
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
  // SS 1 – 3 (two arms each)
  { name: 'SS 1A', level: 'SECONDARY' as const },
  { name: 'SS 1B', level: 'SECONDARY' as const },
  { name: 'SS 2A', level: 'SECONDARY' as const },
  { name: 'SS 2B', level: 'SECONDARY' as const },
  { name: 'SS 3A', level: 'SECONDARY' as const },
  { name: 'SS 3B', level: 'SECONDARY' as const },
] as const;

const GRADE_SCALES = [
  { level: 'SECONDARY' as const, grade: 'A1', minScore: 75, maxScore: 100, remark: 'Excellent'     },
  { level: 'SECONDARY' as const, grade: 'B2', minScore: 70, maxScore: 74,  remark: 'Very Good'     },
  { level: 'SECONDARY' as const, grade: 'B3', minScore: 65, maxScore: 69,  remark: 'Good'          },
  { level: 'SECONDARY' as const, grade: 'C4', minScore: 60, maxScore: 64,  remark: 'Credit'        },
  { level: 'SECONDARY' as const, grade: 'C5', minScore: 55, maxScore: 59,  remark: 'Credit'        },
  { level: 'SECONDARY' as const, grade: 'C6', minScore: 50, maxScore: 54,  remark: 'Credit'        },
  { level: 'SECONDARY' as const, grade: 'D7', minScore: 45, maxScore: 49,  remark: 'Pass'          },
  { level: 'SECONDARY' as const, grade: 'E8', minScore: 40, maxScore: 44,  remark: 'Pass'          },
  { level: 'SECONDARY' as const, grade: 'F9', minScore: 0,  maxScore: 39,  remark: 'Fail'          },
  { level: 'PRIMARY'   as const, grade: 'A',  minScore: 75, maxScore: 100, remark: 'Excellent'     },
  { level: 'PRIMARY'   as const, grade: 'B',  minScore: 60, maxScore: 74,  remark: 'Very Good'     },
  { level: 'PRIMARY'   as const, grade: 'C',  minScore: 50, maxScore: 59,  remark: 'Good'          },
  { level: 'PRIMARY'   as const, grade: 'D',  minScore: 40, maxScore: 49,  remark: 'Pass'          },
  { level: 'PRIMARY'   as const, grade: 'F',  minScore: 0,  maxScore: 39,  remark: 'Fail'          },
  { level: 'NURSERY'   as const, grade: 'E',  minScore: 75, maxScore: 100, remark: 'Excellent'     },
  { level: 'NURSERY'   as const, grade: 'VG', minScore: 60, maxScore: 74,  remark: 'Very Good'     },
  { level: 'NURSERY'   as const, grade: 'G',  minScore: 50, maxScore: 59,  remark: 'Good'          },
  { level: 'NURSERY'   as const, grade: 'S',  minScore: 40, maxScore: 49,  remark: 'Satisfactory'  },
  { level: 'NURSERY'   as const, grade: 'NS', minScore: 0,  maxScore: 39,  remark: 'Needs Support' },
];

function makeStudentDOB(level: 'NURSERY' | 'PRIMARY' | 'SECONDARY'): Date {
  const ranges: Record<string, [number, number]> = {
    NURSERY:   [3, 5],
    PRIMARY:   [6, 12],
    SECONDARY: [11, 18],
  };
  const [lo, hi] = ranges[level];
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - randInt(lo, hi));
  dob.setMonth(randInt(0, 11));
  dob.setDate(randInt(1, 28));
  return dob;
}

// ─────────────────────────────────────────────────────────────────────────────
// Load
// ─────────────────────────────────────────────────────────────────────────────

// Module-level counter so receipt numbers are guaranteed unique within a seed run
let receiptCounter = 0;

export const load: PageServerLoad = async () => {
  const [userCount, studentCount, classCount, subjectCount, resultCount, attendanceCount] =
    await Promise.all([
      db.user.count(),
      db.studentProfile.count(),
      db.class.count(),
      db.subject.count(),
      db.result.count(),
      db.attendance.count(),
    ]);
  return {
    stats: {
      users: userCount,
      students: studentCount,
      classes: classCount,
      subjects: subjectCount,
      results: resultCount,
      attendance: attendanceCount,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Action
// ─────────────────────────────────────────────────────────────────────────────

export const actions = {
  seed: async (event: any) => {
    const data             = await event.request.formData();
    const schoolName       = data.get('schoolName')?.toString().trim()       ?? 'Demo School';
    const adminEmail       = data.get('adminEmail')?.toString().trim()       ?? '';
    const adminPass        = data.get('adminPass')?.toString()               ?? '';
    const yearName         = data.get('yearName')?.toString().trim()         ?? '2024/2025';
    const yearStart        = data.get('yearStart')?.toString()               ?? '';
    const yearEnd          = data.get('yearEnd')?.toString()                 ?? '';
    const studentsPerClass = clamp(Number(data.get('studentsPerClass') ?? 15), 1, 50);

    // Seed the receipt counter from existing records so re-runs never collide
    const lastReceipt = await db.feeRecord.findFirst({
      where:   { receiptNo: { not: null } },
      orderBy: { createdAt: 'desc' },
      select:  { receiptNo: true },
    });
    if (lastReceipt?.receiptNo) {
      const parts = lastReceipt.receiptNo.split('-');
      const last  = parseInt(parts[parts.length - 1] ?? '0', 10);
      if (!isNaN(last)) receiptCounter = last;
    }

    if (!adminEmail || !adminPass)
      return fail(400, { error: 'Admin email and password are required.' });
    if (adminPass.length < 8)
      return fail(400, { error: 'Password must be at least 8 characters.' });
    if (!yearStart || !yearEnd)
      return fail(400, { error: 'Academic year start and end dates are required.' });

    const counts = {
      users: 0, staff: 0, academicYears: 0, terms: 0, gradeScales: 0,
      subjects: 0, classes: 0, feeStructures: 0, scratchCards: 0, students: 0,
      results: 0, attendanceRecords: 0, feeRecords: 0,
    };

    // ── 1. Super-admin ────────────────────────────────────────────────────────
    if (!await db.user.findUnique({ where: { email: adminEmail } })) {
      const ph = await hashPassword(adminPass);
      if (!await db.staffProfile.findUnique({ where: { staffId: 'ADM-001' } })) {
        await db.user.create({
          data: {
            email: adminEmail, passwordHash: ph, role: 'SUPER_ADMIN',
            staffProfile: {
              create: {
                staffId: 'ADM-001', firstName: 'Head', lastName: 'Master',
                gender: 'MALE', staffRole: 'HEADMASTER',
              },
            },
          },
        });
        counts.users++; counts.staff++;
      }
    }

    // ── 2. Demo teachers ──────────────────────────────────────────────────────
    const demoTeachers = [
      { email: 'teacher1@demo.school', staffId: 'TCH-001', firstName: 'Amaka',    lastName: 'Okonkwo',  gender: 'FEMALE' as const, dept: 'Science',      qual: 'B.Ed Science Education'    },
      { email: 'teacher2@demo.school', staffId: 'TCH-002', firstName: 'Emeka',    lastName: 'Eze',      gender: 'MALE'   as const, dept: 'Mathematics',  qual: 'B.Sc Mathematics'           },
      { email: 'teacher3@demo.school', staffId: 'TCH-003', firstName: 'Fatima',   lastName: 'Aliyu',    gender: 'FEMALE' as const, dept: 'Languages',    qual: 'B.A English'                },
      { email: 'teacher4@demo.school', staffId: 'TCH-004', firstName: 'Babatunde',lastName: 'Adeleke',  gender: 'MALE'   as const, dept: 'Social Sci',   qual: 'B.Ed Social Studies'        },
      { email: 'bursar@demo.school',   staffId: 'BUR-001', firstName: 'Ngozi',    lastName: 'Okafor',   gender: 'FEMALE' as const, dept: 'Administration',qual: 'B.Sc Accounting'           },
    ];

    const staffIds: string[] = []; // collect staffProfile ids for markedBy
    for (const t of demoTeachers) {
      if (!await db.user.findUnique({ where: { email: t.email } })) {
        if (!await db.staffProfile.findUnique({ where: { staffId: t.staffId } })) {
          const isTeacher = !t.staffId.startsWith('BUR');
          const created = await db.user.create({
            data: {
              email: t.email,
              passwordHash: await hashPassword('Teacher@123'),
              role: isTeacher ? 'TEACHER' : 'ADMIN',
              staffProfile: {
                create: {
                  staffId: t.staffId, firstName: t.firstName, lastName: t.lastName,
                  gender: t.gender, staffRole: isTeacher ? 'SUBJECT_TEACHER' : 'BURSAR',
                  department: t.dept, qualification: t.qual,
                },
              },
            },
            include: { staffProfile: true },
          });
          if (created.staffProfile) staffIds.push(created.staffProfile.id);
          counts.users++; counts.staff++;
        }
      } else {
        const sp = await db.staffProfile.findUnique({ where: { staffId: t.staffId } });
        if (sp) staffIds.push(sp.id);
      }
    }

    // Fallback: grab any existing staff
    if (staffIds.length === 0) {
      const anyStaff = await db.staffProfile.findMany({ take: 3 });
      staffIds.push(...anyStaff.map(s => s.id));
    }

    // ── 3. Academic year ──────────────────────────────────────────────────────
    let academicYear = await db.academicYear.findUnique({ where: { name: yearName } });
    if (!academicYear) {
      academicYear = await db.academicYear.create({
        data: { name: yearName, startDate: new Date(yearStart), endDate: new Date(yearEnd), isCurrent: true },
      });
      counts.academicYears++;
    }

    // ── 4. Term records ───────────────────────────────────────────────────────
    const yearStartMs = new Date(yearStart).getTime();
    const yearEndMs   = new Date(yearEnd).getTime();
    const termLen     = Math.floor((yearEndMs - yearStartMs) / 3);

    // Nigerian school calendar approximation
    // Term 1: Sep–Dec  Term 2: Jan–Apr  Term 3: Apr–Jul
    const termDates: Array<{ term: 'FIRST'|'SECOND'|'THIRD'; start: Date; end: Date; isCurrent: boolean }> = [
      { term: 'FIRST',  start: new Date(yearStartMs),              end: new Date(yearStartMs + termLen - 1),              isCurrent: true  },
      { term: 'SECOND', start: new Date(yearStartMs + termLen),    end: new Date(yearStartMs + 2 * termLen - 1),          isCurrent: false },
      { term: 'THIRD',  start: new Date(yearStartMs + 2 * termLen),end: new Date(yearEndMs),                              isCurrent: false },
    ];

    const termRecords: Array<{ id: string; term: string; startDate: Date; endDate: Date }> = [];
    for (const td of termDates) {
      let tr = await db.termRecord.findUnique({
        where: { term_academicYearId: { term: td.term, academicYearId: academicYear.id } },
      });
      if (!tr) {
        tr = await db.termRecord.create({
          data: { term: td.term, academicYearId: academicYear.id, startDate: td.start, endDate: td.end, isCurrent: td.isCurrent },
        });
        counts.terms++;
      }
      termRecords.push({ id: tr.id, term: td.term, startDate: tr.startDate, endDate: tr.endDate });
    }

    // ── 5. Grade scales ───────────────────────────────────────────────────────
    for (const gs of GRADE_SCALES) {
      await db.gradeScale.upsert({
        where:  { level_grade: { level: gs.level, grade: gs.grade } },
        update: {},
        create: gs,
      });
    }
    counts.gradeScales = GRADE_SCALES.length;

    // ── 6. Subjects ───────────────────────────────────────────────────────────
    const subjectMap: Record<string, { id: string; difficulty: number; level: string }> = {};
    for (const s of ALL_SUBJECTS) {
      const sub = await db.subject.upsert({
        where:  { code: s.code },
        update: {},
        create: { name: s.name, code: s.code, level: s.level },
      });
      subjectMap[s.code] = { id: sub.id, difficulty: s.difficulty, level: s.level };
    }
    counts.subjects = ALL_SUBJECTS.length;

    // ── 7. Classes ────────────────────────────────────────────────────────────
    const classMap: Record<string, { id: string; level: string }> = {};
    for (const cd of CLASS_DEFS) {
      const cls = await db.class.upsert({
        where:  { name_academicYearId: { name: cd.name, academicYearId: academicYear.id } },
        update: {},
        create: { name: cd.name, level: cd.level, academicYearId: academicYear.id },
      });
      classMap[cd.name] = { id: cls.id, level: cd.level };
    }
    counts.classes = CLASS_DEFS.length;

    // ── 8. Fee structures ─────────────────────────────────────────────────────
    const feeDefs = [
      // Secondary
      { name: 'School Fees',      amount: 25000, term: 'FIRST'  as const, level: 'SECONDARY' as const },
      { name: 'School Fees',      amount: 25000, term: 'SECOND' as const, level: 'SECONDARY' as const },
      { name: 'School Fees',      amount: 25000, term: 'THIRD'  as const, level: 'SECONDARY' as const },
      { name: 'PTA Levy',         amount: 3000,  term: 'FIRST'  as const, level: 'SECONDARY' as const },
      { name: 'Exam Levy',        amount: 5000,  term: 'THIRD'  as const, level: 'SECONDARY' as const },
      { name: 'ICT Levy',         amount: 2000,  term: 'SECOND' as const, level: 'SECONDARY' as const },
      // Primary
      { name: 'School Fees',      amount: 18000, term: 'FIRST'  as const, level: 'PRIMARY'   as const },
      { name: 'School Fees',      amount: 18000, term: 'SECOND' as const, level: 'PRIMARY'   as const },
      { name: 'School Fees',      amount: 18000, term: 'THIRD'  as const, level: 'PRIMARY'   as const },
      { name: 'PTA Levy',         amount: 2000,  term: 'FIRST'  as const, level: 'PRIMARY'   as const },
      { name: 'Books & Supplies', amount: 4500,  term: 'FIRST'  as const, level: 'PRIMARY'   as const },
      // Nursery
      { name: 'School Fees',      amount: 12000, term: 'FIRST'  as const, level: 'NURSERY'   as const },
      { name: 'School Fees',      amount: 12000, term: 'SECOND' as const, level: 'NURSERY'   as const },
      { name: 'School Fees',      amount: 12000, term: 'THIRD'  as const, level: 'NURSERY'   as const },
      { name: 'Books & Supplies', amount: 3000,  term: 'FIRST'  as const, level: 'NURSERY'   as const },
    ];

    const feeStructureMap: Record<string, string> = {}; // `${name}|${term}|${level}` → id
    for (const f of feeDefs) {
      const fs = await db.feeStructure.upsert({
        where:  { name_term_academicYearId: { name: f.name, term: f.term, academicYearId: academicYear.id } },
        update: {},
        create: { ...f, academicYearId: academicYear.id },
      });
      feeStructureMap[`${f.name}|${f.term}|${f.level}`] = fs.id;
    }
    counts.feeStructures = feeDefs.length;

    // calYear needed by scratch cards AND admission numbers — declare once here
    const calYear = new Date().getFullYear();

    // ── 9. Scratch cards ──────────────────────────────────────────────────────
    // Wrapped in try/catch: if the ScratchCard model hasn't been migrated yet,
    // seeding skips this section with a console warning instead of crashing.
    try {
      const scModel = (db as any).scratchCard;
      if (!scModel) throw new Error('model_missing');

      const demoCard = await scModel.findUnique({ where: { serial: 'SC-DEMO-000001' } });
      if (!demoCard) {
        await scModel.create({
          data: {
            serial:         'SC-DEMO-000001',
            pin:            '123456789012',
            status:         'UNUSED',
            usesAllowed:    999,
            academicYearId: academicYear.id,
            expiresAt:      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5),
          },
        });
        counts.scratchCards++;
      }

      const existingCardCount = await scModel.count();
      const cardsToCreate = 200;
      for (let c = 1; c <= cardsToCreate; c++) {
        const serial = `SC-${calYear}-${String(existingCardCount + c).padStart(6, '0')}`;
        const exists = await scModel.findUnique({ where: { serial } });
        if (exists) continue;

        let pin: string;
        let pinTaken = true;
        do {
          pin = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
          const clash = await scModel.findUnique({ where: { pin } });
          pinTaken = !!clash;
        } while (pinTaken);

        await scModel.create({
          data: {
            serial,
            pin,
            status:         'UNUSED',
            usesAllowed:    1,
            academicYearId: academicYear.id,
            expiresAt:      new Date(new Date(yearEnd).getTime() + 90 * 24 * 60 * 60 * 1000),
          },
        });
        counts.scratchCards++;
      }
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg !== 'model_missing' && !msg.includes('does not exist') && !msg.includes('table') && !msg.includes('relation')) throw e;
      console.warn('[seed] ScratchCard table not found — run: npx prisma migrate dev after adding schema-additions.prisma');
    }

    // ── 10. Students + results + attendance + fee records ─────────────────────
    let admissionCounter = await db.studentProfile.count();

    // Which subjects belong to which level
    const subjectsByLevel: Record<string, Array<{ id: string; difficulty: number; code: string }>> = {
      NURSERY:   Object.entries(subjectMap).filter(([,v]) => v.level === 'NURSERY')  .map(([code, v]) => ({ ...v, code })),
      PRIMARY:   Object.entries(subjectMap).filter(([,v]) => v.level === 'PRIMARY')  .map(([code, v]) => ({ ...v, code })),
      SECONDARY: Object.entries(subjectMap).filter(([,v]) => v.level === 'SECONDARY').map(([code, v]) => ({ ...v, code })),
    };

    for (const cd of CLASS_DEFS) {
      const { id: classId, level } = classMap[cd.name];
      const classSubjects = subjectsByLevel[level] ?? [];

      // Collect newly created student ids for position computation later
      const newStudentIds: string[] = [];

      // ── 9a. Create students ────────────────────────────────────────────────
      for (let i = 0; i < studentsPerClass; i++) {
        const gender    = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
        const firstName = gender === 'MALE' ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE);
        const lastName  = pick(LAST_NAMES);
        admissionCounter++;
        const admissionNo = `LSAI/${calYear}/${String(admissionCounter).padStart(4, '0')}`;

        const existing = await db.studentProfile.findUnique({ where: { admissionNo } });
        if (existing) { newStudentIds.push(existing.id); continue; }

        const student = await db.studentProfile.create({
          data: {
            admissionNo,
            firstName, lastName,
            gender:        gender as 'MALE' | 'FEMALE',
            dateOfBirth:   makeStudentDOB(level as any),
            level:         level as any,
            classId,
            stateOfOrigin: pick(STATES),
            religion:      pick(RELIGIONS),
            bloodGroup:    pick(BLOOD_GROUPS),
            isActive:      true,
          },
        });
        newStudentIds.push(student.id);
        counts.students++;
      }

      if (newStudentIds.length === 0) continue;

      // Assign each student a fixed "ability" score (0.2 – 1.0) — consistent across subjects & terms
      const studentAbility: Record<string, number> = {};
      for (const sid of newStudentIds) {
        studentAbility[sid] = clamp(randFloat(0.2, 1.0), 0.2, 1.0);
      }

      // ── 9b. Results — per term, per subject ───────────────────────────────
      for (const tr of termRecords) {
        // Per-subject score accumulator for position ranking
        // subjectId → array of { studentId, total }
        const subjectTotals: Record<string, Array<{ studentId: string; total: number }>> = {};

        for (const subj of classSubjects) {
          subjectTotals[subj.id] = [];
          for (const sid of newStudentIds) {
            const existing = await db.result.findUnique({
              where: { studentProfileId_subjectId_termRecordId: { studentProfileId: sid, subjectId: subj.id, termRecordId: tr.id } },
            });
            if (existing) {
              subjectTotals[subj.id].push({ studentId: sid, total: existing.totalScore ?? 0 });
              continue;
            }

            const ability   = studentAbility[sid];
            // CA: 40 marks, Exam: 60 marks
            const caScore   = genScore(ability, 40, subj.difficulty);
            const examScore = genScore(ability, 60, subj.difficulty);
            const total     = parseFloat((caScore + examScore).toFixed(1));
            const { grade, remark } = computeGrade(total, level as any);

            await db.result.create({
              data: {
                studentProfileId: sid,
                subjectId: subj.id,
                classId,
                termRecordId: tr.id,
                caScore, examScore, totalScore: total,
                grade, remark,
                isPublished: true,
              },
            });
            subjectTotals[subj.id].push({ studentId: sid, total });
            counts.results++;
          }

          // ── Compute positions for this subject in this class/term ─────────
          const sorted = [...subjectTotals[subj.id]].sort((a, b) => b.total - a.total);
          for (let pos = 0; pos < sorted.length; pos++) {
            const sameScore = sorted.filter(x => x.total === sorted[pos].total);
            const position  = pos + 1; // simple rank (ties share same pos)
            await db.result.updateMany({
              where: {
                studentProfileId: sorted[pos].studentId,
                subjectId: subj.id,
                termRecordId: tr.id,
                classId,
              },
              data: { position },
            });
          }
        }
      }

      // ── 9c. Attendance — every school day across all terms ─────────────────
      for (const tr of termRecords) {
        const days = schoolDays(new Date(tr.startDate), new Date(tr.endDate));
        const markerId = pick(staffIds);

        for (const day of days) {
          for (const sid of newStudentIds) {
            const existing = await db.attendance.findUnique({
              where: { studentProfileId_date: { studentProfileId: sid, date: day } },
            });
            if (existing) continue;

            // Realistic attendance: ~88% present, 5% absent, 4% late, 3% excused
            const roll = Math.random();
            let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
            if (roll < 0.88)       status = 'PRESENT';
            else if (roll < 0.93)  status = 'ABSENT';
            else if (roll < 0.97)  status = 'LATE';
            else                   status = 'EXCUSED';

            await db.attendance.create({
              data: {
                studentProfileId: sid,
                classId,
                termRecordId: tr.id,
                date: day,
                status,
                markedById: markerId,
                note: status === 'EXCUSED' ? 'Medical/family excuse' :
                      status === 'ABSENT'  ? null : null,
              },
            });
            counts.attendanceRecords++;
          }
        }
      }

      // ── 9d. Fee records — per student, per fee structure matching their level
      const matchingFees = feeDefs.filter(f => f.level === level);
      for (const sid of newStudentIds) {
        for (const f of matchingFees) {
          const fsId = feeStructureMap[`${f.name}|${f.term}|${f.level}`];
          if (!fsId) continue;

          const existing = await db.feeRecord.findUnique({
            where: { studentProfileId_feeStructureId: { studentProfileId: sid, feeStructureId: fsId } },
          });
          if (existing) continue;

          // 55% fully paid, 25% partial, 20% pending/overdue
          const roll = Math.random();
          let amountPaid: number;
          let status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
          let paidAt: Date | null = null;
          let receiptNo: string | null = null;
          let paymentMethod: string | null = null;

          if (roll < 0.55) {
            amountPaid    = f.amount;
            status        = 'PAID';
            paidAt        = new Date(yearStartMs + randInt(0, termLen * 0.8));
            receiptNo     = `RCP-${calYear}-${String(++receiptCounter).padStart(6, '0')}`;
            paymentMethod = pick(PAY_METHODS);
          } else if (roll < 0.80) {
            amountPaid    = Math.round(f.amount * randFloat(0.3, 0.8));
            status        = 'PARTIAL';
            paidAt        = new Date(yearStartMs + randInt(0, termLen * 0.9));
            paymentMethod = pick(PAY_METHODS);
          } else if (roll < 0.92) {
            amountPaid = 0;
            status     = 'PENDING';
          } else {
            amountPaid = 0;
            status     = 'OVERDUE';
          }

          await db.feeRecord.create({
            data: {
              studentProfileId: sid,
              classId,
              feeStructureId: fsId,
              amountPaid,
              balance:       f.amount - amountPaid,
              status,
              paidAt,
              receiptNo,
              paymentMethod,
            },
          });
          counts.feeRecords++;
        }
      }
    } // end CLASS_DEFS loop

    return {
      success: true,
      counts,
      message: `"${schoolName}" seeded successfully.`,
      adminEmail,
      adminPass,
    };
  },
};