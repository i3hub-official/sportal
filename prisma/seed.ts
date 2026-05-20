import dotenv from 'dotenv';
dotenv.config();

import {
  PrismaClient,
  Term,
  SchoolLevel,
  Gender,
  AttendanceStatus,
  FeeStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { hash } from '@node-rs/argon2';

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db      = new PrismaClient({ adapter });

// ─── deterministic pseudo-random (reproducible every run) ─────────────────────
let _s = 42;
function rand(): number { _s = (_s * 1664525 + 1013904223) & 0xffffffff; return (_s >>> 0) / 0xffffffff; }
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function randInt(lo: number, hi: number) { return lo + Math.floor(rand() * (hi - lo + 1)); }
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

// ─── grade helper ──────────────────────────────────────────────────────────────
function gradeFor(total: number, level: SchoolLevel): { grade: string; remark: string } {
  if (level === SchoolLevel.SECONDARY) {
    if (total >= 75) return { grade: 'A1', remark: 'Excellent' };
    if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
    if (total >= 65) return { grade: 'B3', remark: 'Good' };
    if (total >= 60) return { grade: 'C4', remark: 'Credit' };
    if (total >= 55) return { grade: 'C5', remark: 'Credit' };
    if (total >= 50) return { grade: 'C6', remark: 'Credit' };
    if (total >= 45) return { grade: 'D7', remark: 'Pass' };
    if (total >= 40) return { grade: 'E8', remark: 'Pass' };
    return { grade: 'F9', remark: 'Fail' };
  }
  if (level === SchoolLevel.PRIMARY) {
    if (total >= 75) return { grade: 'A', remark: 'Excellent' };
    if (total >= 60) return { grade: 'B', remark: 'Good' };
    if (total >= 50) return { grade: 'C', remark: 'Average' };
    if (total >= 40) return { grade: 'D', remark: 'Below Average' };
    return { grade: 'F', remark: 'Fail' };
  }
  if (total >= 75) return { grade: 'E',  remark: 'Excellent' };
  if (total >= 60) return { grade: 'VG', remark: 'Very Good' };
  if (total >= 50) return { grade: 'G',  remark: 'Good' };
  return { grade: 'F', remark: 'Fair' };
}

// ─── name banks ───────────────────────────────────────────────────────────────
const maleFirst = [
  'Chukwuemeka','Oluwaseun','Adebayo','Tochukwu','Ifeanyi','Emeka','Babatunde',
  'Chinedu','Oluwafemi','Damilola','Chisom','Uchenna','Gbenga','Abiodun','Nnamdi',
  'Obiora','Seun','Kayode','Uche','Chukwudi','Tobechukwu','Ikenna','Kunle','Dare',
  'Ebuka','Onyekachi','Somtochukwu','Femi','Rotimi','Biodun',
];
const femaleFirst = [
  'Adaeze','Ngozi','Chidinma','Oluwakemi','Funmilayo','Amaka','Nneka','Ifeoma',
  'Blessing','Chiamaka','Chioma','Sade','Toyin','Yetunde','Ebere','Oluwatobi',
  'Chinwe','Jumoke','Aisha','Hafsat','Zainab','Mariam','Fatimah','Kemi','Bimpe',
  'Titilayo','Onyinye','Adaora','Nkechi','Uloma',
];
const lastNames = [
  'Okonkwo','Adeyemi','Nwosu','Balogun','Eze','Okafor','Adesanya','Chukwu',
  'Olawale','Nwachukwu','Adeleke','Igwe','Obi','Fashola','Amaechi','Nnaji',
  'Dada','Okeke','Afolabi','Ihejirika','Uzor','Lawal','Salami','Musa','Garba',
  'Suleiman','Ibrahim','Abdullahi','Yakubu','Haruna',
];
const states = [
  'Abia','Anambra','Enugu','Imo','Ebonyi','Lagos','Ogun','Oyo','Osun','Ekiti',
  'Kano','Kaduna','Katsina','Zamfara','Sokoto','Rivers','Bayelsa','Delta','Edo','Cross River',
];

const subjectCodesByLevel: Record<SchoolLevel, string[]> = {
  [SchoolLevel.NURSERY]:   ['HWR', 'VRE', 'QRE', 'NUM', 'LET'],
  [SchoolLevel.PRIMARY]:   ['BSC', 'SST', 'CIV', 'AGR', 'CCA'],
  [SchoolLevel.SECONDARY]: ['MTH', 'ENG', 'PHY', 'CHE', 'BIO', 'ECO', 'GOV', 'LIT', 'GEO', 'COM'],
};

const attendanceDates = [
  new Date('2025-09-15'),
  new Date('2025-09-16'),
  new Date('2025-09-17'),
  new Date('2025-09-18'),
  new Date('2025-09-19'),
];

const studentsPerLevel: Record<SchoolLevel, number> = {
  [SchoolLevel.NURSERY]:   4,
  [SchoolLevel.PRIMARY]:   5,
  [SchoolLevel.SECONDARY]: 6,
};

// ─── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding database...\n');

  // Academic Year
  const academicYear = await db.academicYear.upsert({
    where:  { name: '2025/2026' },
    update: {},
    create: { name: '2025/2026', startDate: new Date('2025-09-01'), endDate: new Date('2026-07-31'), isCurrent: true },
  });
  console.log('OK academic year:', academicYear.name);

  // Terms
  const termsData = [
    { term: Term.FIRST,  startDate: new Date('2025-09-01'), endDate: new Date('2025-12-15'), isCurrent: true  },
    { term: Term.SECOND, startDate: new Date('2026-01-12'), endDate: new Date('2026-04-04'), isCurrent: false },
    { term: Term.THIRD,  startDate: new Date('2026-04-27'), endDate: new Date('2026-07-25'), isCurrent: false },
  ];
  for (const t of termsData) {
    await db.termRecord.upsert({
      where:  { term_academicYearId: { term: t.term, academicYearId: academicYear.id } },
      update: {},
      create: { ...t, academicYearId: academicYear.id },
    });
  }
  const firstTerm = await db.termRecord.findUniqueOrThrow({
    where: { term_academicYearId: { term: Term.FIRST, academicYearId: academicYear.id } },
  });
  console.log('OK terms');

  // Grade scales
  const gradeRows = [
    { level: SchoolLevel.SECONDARY, grade: 'A1', minScore: 75, maxScore: 100, remark: 'Excellent'     },
    { level: SchoolLevel.SECONDARY, grade: 'B2', minScore: 70, maxScore: 74,  remark: 'Very Good'     },
    { level: SchoolLevel.SECONDARY, grade: 'B3', minScore: 65, maxScore: 69,  remark: 'Good'          },
    { level: SchoolLevel.SECONDARY, grade: 'C4', minScore: 60, maxScore: 64,  remark: 'Credit'        },
    { level: SchoolLevel.SECONDARY, grade: 'C5', minScore: 55, maxScore: 59,  remark: 'Credit'        },
    { level: SchoolLevel.SECONDARY, grade: 'C6', minScore: 50, maxScore: 54,  remark: 'Credit'        },
    { level: SchoolLevel.SECONDARY, grade: 'D7', minScore: 45, maxScore: 49,  remark: 'Pass'          },
    { level: SchoolLevel.SECONDARY, grade: 'E8', minScore: 40, maxScore: 44,  remark: 'Pass'          },
    { level: SchoolLevel.SECONDARY, grade: 'F9', minScore: 0,  maxScore: 39,  remark: 'Fail'          },
    { level: SchoolLevel.PRIMARY,   grade: 'A',  minScore: 75, maxScore: 100, remark: 'Excellent'     },
    { level: SchoolLevel.PRIMARY,   grade: 'B',  minScore: 60, maxScore: 74,  remark: 'Good'          },
    { level: SchoolLevel.PRIMARY,   grade: 'C',  minScore: 50, maxScore: 59,  remark: 'Average'       },
    { level: SchoolLevel.PRIMARY,   grade: 'D',  minScore: 40, maxScore: 49,  remark: 'Below Average' },
    { level: SchoolLevel.PRIMARY,   grade: 'F',  minScore: 0,  maxScore: 39,  remark: 'Fail'          },
    { level: SchoolLevel.NURSERY,   grade: 'E',  minScore: 75, maxScore: 100, remark: 'Excellent'     },
    { level: SchoolLevel.NURSERY,   grade: 'VG', minScore: 60, maxScore: 74,  remark: 'Very Good'     },
    { level: SchoolLevel.NURSERY,   grade: 'G',  minScore: 50, maxScore: 59,  remark: 'Good'          },
    { level: SchoolLevel.NURSERY,   grade: 'F',  minScore: 0,  maxScore: 49,  remark: 'Fair'          },
  ];
  for (const g of gradeRows) {
    await db.gradeScale.upsert({ where: { level_grade: { level: g.level, grade: g.grade } }, update: {}, create: g });
  }
  console.log('OK grade scales');

  // Subjects
  const subjectDefs = [
    { name: 'Mathematics',              code: 'MTH', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'English Language',         code: 'ENG', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Computer Studies',         code: 'COM', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'French',                   code: 'FRN', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Cultural & Creative Arts', code: 'CCA', level: SchoolLevel.PRIMARY,   isActive: true },
    { name: 'Physical & Health Edu.',   code: 'PHE', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Basic Science',            code: 'BSC', level: SchoolLevel.PRIMARY,   isActive: true },
    { name: 'Social Studies',           code: 'SST', level: SchoolLevel.PRIMARY,   isActive: true },
    { name: 'Civic Education',          code: 'CIV', level: SchoolLevel.PRIMARY,   isActive: true },
    { name: 'Agricultural Science',     code: 'AGR', level: SchoolLevel.PRIMARY,   isActive: true },
    { name: 'Physics',                  code: 'PHY', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Chemistry',                code: 'CHE', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Biology',                  code: 'BIO', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Further Mathematics',      code: 'FMT', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Economics',                code: 'ECO', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Government',               code: 'GOV', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Literature in English',    code: 'LIT', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Geography',                code: 'GEO', level: SchoolLevel.SECONDARY, isActive: true },
    { name: 'Handwriting',              code: 'HWR', level: SchoolLevel.NURSERY,   isActive: true },
    { name: 'Verbal Reasoning',         code: 'VRE', level: SchoolLevel.NURSERY,   isActive: true },
    { name: 'Quantitative Reasoning',   code: 'QRE', level: SchoolLevel.NURSERY,   isActive: true },
    { name: 'Number Work',              code: 'NUM', level: SchoolLevel.NURSERY,   isActive: true },
    { name: 'Letter Work',              code: 'LET', level: SchoolLevel.NURSERY,   isActive: true },
  ];
  for (const s of subjectDefs) {
    await db.subject.upsert({ where: { code: s.code }, update: {}, create: s });
  }
  const allSubjects = await db.subject.findMany();
  const subjectMap  = new Map(allSubjects.map(s => [s.code, s]));
  console.log('OK', subjectDefs.length, 'subjects');

  // Staff
  const superAdminUser = await db.user.upsert({
    where:  { email: 'admin@school.edu.ng' },
    update: {},
    create: { email: 'admin@school.edu.ng', passwordHash: await hash('Admin@1234'), role: 'SUPER_ADMIN', isActive: true },
  });
  await db.staffProfile.upsert({
    where:  { staffId: 'ADM001' },
    update: {},
    create: { userId: superAdminUser.id, staffId: 'ADM001', firstName: 'Super', lastName: 'Administrator', gender: 'MALE', staffRole: 'HEADMASTER', isActive: true },
  });

  const bursarUser = await db.user.upsert({
    where:  { email: 'bursar@school.edu.ng' },
    update: {},
    create: { email: 'bursar@school.edu.ng', passwordHash: await hash('Bursar@1234'), role: 'ADMIN', isActive: true },
  });
  await db.staffProfile.upsert({
    where:  { staffId: 'BUR001' },
    update: {},
    create: { userId: bursarUser.id, staffId: 'BUR001', firstName: 'Amaka', lastName: 'Eze', gender: 'FEMALE', staffRole: 'BURSAR', isActive: true },
  });

  const teacherUser = await db.user.upsert({
    where:  { email: 'teacher@school.edu.ng' },
    update: {},
    create: { email: 'teacher@school.edu.ng', passwordHash: await hash('Teacher@1234'), role: 'TEACHER', isActive: true },
  });
  const teacherProfile = await db.staffProfile.upsert({
    where:  { staffId: 'TCH001' },
    update: {},
    create: { userId: teacherUser.id, staffId: 'TCH001', firstName: 'Adaeze', lastName: 'Okonkwo', gender: 'FEMALE', staffRole: 'SUBJECT_TEACHER', isActive: true },
  });
  console.log('OK staff');

  // Classes
  const classData = [
    { name: 'Nursery 1',  level: SchoolLevel.NURSERY    },
    { name: 'Nursery 2',  level: SchoolLevel.NURSERY    },
    { name: 'KG 1',       level: SchoolLevel.NURSERY    },
    { name: 'KG 2',       level: SchoolLevel.NURSERY    },
    { name: 'Primary 1A', level: SchoolLevel.PRIMARY    },
    { name: 'Primary 1B', level: SchoolLevel.PRIMARY    },
    { name: 'Primary 2A', level: SchoolLevel.PRIMARY    },
    { name: 'Primary 3A', level: SchoolLevel.PRIMARY    },
    { name: 'Primary 4A', level: SchoolLevel.PRIMARY    },
    { name: 'Primary 5A', level: SchoolLevel.PRIMARY    },
    { name: 'Primary 6A', level: SchoolLevel.PRIMARY    },
    { name: 'JSS 1A',     level: SchoolLevel.SECONDARY  },
    { name: 'JSS 1B',     level: SchoolLevel.SECONDARY  },
    { name: 'JSS 2A',     level: SchoolLevel.SECONDARY  },
    { name: 'JSS 3A',     level: SchoolLevel.SECONDARY  },
    { name: 'SS 1A',      level: SchoolLevel.SECONDARY  },
    { name: 'SS 2A',      level: SchoolLevel.SECONDARY  },
    { name: 'SS 3A',      level: SchoolLevel.SECONDARY  },
  ];
  const createdClasses: { id: string; name: string; level: string }[] = [];
  for (const c of classData) {
    const rec = await db.class.upsert({
      where:  { name_academicYearId: { name: c.name, academicYearId: academicYear.id } },
      update: {},
      create: { ...c, academicYearId: academicYear.id, capacity: 40 },
    });
    createdClasses.push(rec);
  }
  await db.class.update({ where: { id: createdClasses[0].id }, data: { classTeacherId: teacherProfile.id } });
  for (const code of ['MTH', 'ENG']) {
    const sub = subjectMap.get(code);
    if (sub) {
      await db.staffSubject.upsert({
        where:  { staffProfileId_subjectId: { staffProfileId: teacherProfile.id, subjectId: sub.id } },
        update: {},
        create: { staffProfileId: teacherProfile.id, subjectId: sub.id },
      });
    }
  }
  console.log('OK', classData.length, 'classes');

  // Fee Structures
  const feeStructureDefs = [
    { name: 'Nursery School Fees',   amount: 35000, level: SchoolLevel.NURSERY,   term: Term.FIRST },
    { name: 'Primary School Fees',   amount: 40000, level: SchoolLevel.PRIMARY,   term: Term.FIRST },
    { name: 'Secondary School Fees', amount: 55000, level: SchoolLevel.SECONDARY, term: Term.FIRST },
    { name: 'PTA Levy',              amount:  5000, level: SchoolLevel.PRIMARY,   term: Term.FIRST },
    { name: 'Development Levy',      amount:  3000, level: SchoolLevel.SECONDARY, term: Term.FIRST },
    { name: 'Exam Fee',              amount:  3500, level: SchoolLevel.SECONDARY, term: Term.FIRST },
  ];
  for (const f of feeStructureDefs) {
    await db.feeStructure.upsert({
      where:  { name_term_academicYearId: { name: f.name, term: f.term, academicYearId: academicYear.id } },
      update: {},
      create: { ...f, academicYearId: academicYear.id, dueDate: new Date('2025-12-31') },
    });
  }
  const allFees   = await db.feeStructure.findMany({ where: { academicYearId: academicYear.id } });
  const feeByLevel = new Map<string, typeof allFees>();
  for (const fs of allFees) {
    if (!feeByLevel.has(fs.level)) feeByLevel.set(fs.level, []);
    feeByLevel.get(fs.level)!.push(fs);
  }
  console.log('OK', feeStructureDefs.length, 'fee structures\n');

  // ── Students, Results, Attendance, Fee Records ─────────────────────────────
  let admissionCounter = 1;
  let receiptCounter   = 1;
  let totalStudents    = 0;

  for (const cls of createdClasses) {
    const count         = studentsPerLevel[cls.level as SchoolLevel];
    const codes         = subjectCodesByLevel[cls.level as SchoolLevel];
    const classSubjects = codes.map(c => subjectMap.get(c)).filter(Boolean) as typeof allSubjects;

    // subjectId -> [{studentId, total}] for position ranking
    const subjectTotals = new Map<string, { studentId: string; total: number }[]>();
    for (const sub of classSubjects) subjectTotals.set(sub.id, []);

    for (let i = 0; i < count; i++) {
      const gender    = rand() > 0.5 ? Gender.MALE : Gender.FEMALE;
      const firstName = gender === Gender.MALE ? pick(maleFirst) : pick(femaleFirst);
      const lastName  = pick(lastNames);
     const yearDigits = '25';
const classCode  = cls.name
  .replace(/\s+/g, '')           // remove spaces
  .replace(/Nursery/i,  'N')
  .replace(/Primary/i,  'P')
  .replace(/Kindergarten|KG/i, 'K')
  .replace(/JSS/i,  'J')
  .replace(/SS/i,   'S')
  .toUpperCase();                // e.g. N1, P3A, K2, J1A, S3A

const admNo = `SMS${yearDigits}${classCode}${String(admissionCounter).padStart(3, '0')}`;
admissionCounter++;

      const ageRanges: Record<SchoolLevel, [number, number]> = {
        [SchoolLevel.NURSERY]:   [3,  6 ],
        [SchoolLevel.PRIMARY]:   [6,  13],
        [SchoolLevel.SECONDARY]: [11, 18],
      };
      const [lo, hi] = ageRanges[cls.level as SchoolLevel];
      const dob = new Date(2025 - randInt(lo, hi), randInt(0, 11), randInt(1, 28));

      const student = await db.studentProfile.upsert({
        where:  { admissionNo: admNo },
        update: {},
        create: {
          admissionNo: admNo,
          firstName,
          lastName,
          gender,
          dateOfBirth:   dob,
          level:         cls.level as SchoolLevel,
          classId:       cls.id,
          stateOfOrigin: pick(states),
          religion:      pick(['Christianity','Christianity','Christianity','Islam']),
          bloodGroup:    pick(['O+','A+','B+','AB+','O-','A-']),
          isActive:      true,
        },
      });
      totalStudents++;

      // Parent
      const parentGender = rand() > 0.45 ? Gender.MALE : Gender.FEMALE;
      const parentFirst  = parentGender === Gender.MALE ? pick(maleFirst) : pick(femaleFirst);
      const relationship = parentGender === Gender.MALE ? 'Father' : 'Mother';
      const phone        = `080${String(admissionCounter * 7919 + 10000000).padStart(8,'0').slice(0,8)}`;

      let parent = await db.parentProfile.findFirst({ where: { phone } });
      if (!parent) {
        parent = await db.parentProfile.create({
          data: { firstName: parentFirst, lastName, phone, relationship },
        });
      }
      await db.parentStudent.upsert({
        where:  { parentProfileId_studentProfileId: { parentProfileId: parent.id, studentProfileId: student.id } },
        update: {},
        create: { parentProfileId: parent.id, studentProfileId: student.id },
      });

      // Results
      const ability = randInt(38, 96); // student's baseline score level
      for (const sub of classSubjects) {
        const caScore   = clamp(Math.round(ability * 0.4 + randInt(-8,  8)),  0, 40);
        const examScore = clamp(Math.round(ability * 0.6 + randInt(-10, 10)), 0, 60);
        const total     = caScore + examScore;
        const { grade, remark } = gradeFor(total, cls.level as SchoolLevel);

        await db.result.upsert({
          where: {
            studentProfileId_subjectId_termRecordId: {
              studentProfileId: student.id,
              subjectId:        sub.id,
              termRecordId:     firstTerm.id,
            },
          },
          update: {},
          create: {
            studentProfileId: student.id,
            subjectId:        sub.id,
            classId:          cls.id,
            termRecordId:     firstTerm.id,
            caScore,
            examScore,
            totalScore:  total,
            grade,
            remark,
            isPublished: true,
          },
        });
        subjectTotals.get(sub.id)!.push({ studentId: student.id, total });
      }

      // Attendance (Mon–Fri of first week)
      for (const date of attendanceDates) {
        const r = rand();
        const status =
          r < 0.82 ? AttendanceStatus.PRESENT  :
          r < 0.90 ? AttendanceStatus.LATE      :
          r < 0.96 ? AttendanceStatus.ABSENT    :
                     AttendanceStatus.EXCUSED;

        await db.attendance.upsert({
          where:  { studentProfileId_date: { studentProfileId: student.id, date } },
          update: {},
          create: {
            studentProfileId: student.id,
            classId:          cls.id,
            termRecordId:     firstTerm.id,
            date,
            status,
            markedById: teacherProfile.id,
          },
        });
      }

      // Fee records
      const levelFees = feeByLevel.get(cls.level) ?? [];
      for (const fs of levelFees) {
        const exists = await db.feeRecord.findFirst({
          where: { studentProfileId: student.id, feeStructureId: fs.id },
        });
        if (exists) continue;

        const r = rand();
        let amountPaid: number;
        let status: FeeStatus;
        let paidAt:        Date | null   = null;
        let paymentMethod: string | null = null;
        let receiptNo:     string | null = null;

        if (r < 0.55) {
          amountPaid    = fs.amount;
          status        = FeeStatus.PAID;
          paidAt        = new Date('2025-09-30');
          paymentMethod = pick(['Cash','Transfer','POS']);
          receiptNo     = `RCP/${String(receiptCounter++).padStart(5,'0')}`;
        } else if (r < 0.78) {
          amountPaid = Math.round(fs.amount * (0.3 + rand() * 0.5));
          status     = FeeStatus.PARTIAL;
        } else if (r < 0.90) {
          amountPaid = 0;
          status     = FeeStatus.OVERDUE;
        } else {
          amountPaid = 0;
          status     = FeeStatus.PENDING;
        }

       await db.feeRecord.upsert({
  where: {
    studentProfileId_feeStructureId: {
      studentProfileId: student.id,
      feeStructureId:   fs.id,
    },
  },
  update: {},
  create: {
    studentProfileId: student.id,
    classId:          cls.id,
    feeStructureId:   fs.id,
    amountPaid,
    balance:          fs.amount - amountPaid,
    status,
    paidAt,
    paymentMethod,
    receiptNo,
  },
});
      }
    } // end per-student loop

    // Compute subject positions for this class
    for (const sub of classSubjects) {
      const ranked = [...(subjectTotals.get(sub.id) ?? [])].sort((a, b) => b.total - a.total);
      for (let pos = 0; pos < ranked.length; pos++) {
        await db.result.updateMany({
          where: { studentProfileId: ranked[pos].studentId, subjectId: sub.id, termRecordId: firstTerm.id },
          data:  { position: pos + 1 },
        });
      }
    }

    console.log(`  ${cls.name} (${cls.level}): ${count} students / ${classSubjects.length} subjects / ${count * attendanceDates.length} attendance`);
  }

  // Final counts
  const [sc, rc, ac, fc, pc] = await Promise.all([
    db.studentProfile.count(),
    db.result.count(),
    db.attendance.count(),
    db.feeRecord.count(),
    db.parentProfile.count(),
  ]);

  console.log('\n============================');
  console.log('Seed complete!');
  console.log('============================');
  console.log(`Students:        ${sc}`);
  console.log(`${totalStudents} students were created in total`);
  console.log(`Parents:         ${pc}`);
  console.log(`Results:         ${rc}`);
  console.log(`Attendance rows: ${ac}`);
  console.log(`Fee records:     ${fc}`);
  console.log('============================');
  console.log('Credentials:');
  console.log('  admin@school.edu.ng   /  Admin@1234');
  console.log('  bursar@school.edu.ng  /  Bursar@1234');
  console.log('  teacher@school.edu.ng /  Teacher@1234');
  console.log('  (change all passwords on first login)');
  console.log('============================');
  console.log('Note: This is deterministic seed data, so you will get the same students, results, etc. every time you run this seed script.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); await pool.end(); });