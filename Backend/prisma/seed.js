const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'demo123'
const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10)

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function createDemoUser(name, email, role) {
  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash: PASSWORD_HASH,
      role,
    },
  })
}

function createAttendancePlan({ studentKey, absentSessions = [], lateSessions = [] }) {
  return {
    studentKey,
    absentSessions: new Set(absentSessions),
    lateSessions: new Set(lateSessions),
  }
}

async function seedSessionSeries({
  sectionSubject,
  facultyUserId,
  sessionCount,
  startOffset,
  attendancePlans,
}) {
  const sessions = []
  const attendanceRecords = new Map()

  for (let sessionIndex = 0; sessionIndex < sessionCount; sessionIndex += 1) {
    const lectureSession = await prisma.lectureSession.create({
      data: {
        sectionSubjectId: sectionSubject.id,
        date: daysAgo(startOffset + sessionIndex),
        startTime: sessionIndex % 2 === 0 ? '09:00' : '10:15',
        endTime: sessionIndex % 2 === 0 ? '10:00' : '11:15',
        status: 'HELD',
        markedById: facultyUserId,
      },
    })

    sessions.push(lectureSession)

    for (const plan of attendancePlans) {
      let status = 'PRESENT'
      if (plan.absentSessions.has(sessionIndex)) {
        status = 'ABSENT'
      } else if (plan.lateSessions.has(sessionIndex)) {
        status = 'LATE'
      }

      const attendanceRecord = await prisma.attendanceRecord.create({
        data: {
          lectureSessionId: lectureSession.id,
          studentId: plan.studentId,
          status,
          markedAt: daysAgo(startOffset + sessionIndex),
        },
      })

      attendanceRecords.set(`${plan.studentId}:${lectureSession.id}`, attendanceRecord)
    }
  }

  return { sessions, attendanceRecords }
}

async function main() {
  await prisma.correctionRequest.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.lectureSession.deleteMany()
  await prisma.timetableSlot.deleteMany()
  await prisma.sectionSubject.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.facultyProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.section.deleteMany()
  await prisma.department.deleteMany()
  await prisma.room.deleteMany()

  const currentDay = new Date().getDay()
  const currentDaySlot = currentDay

  const departments = {
    CSE: await prisma.department.create({
      data: { name: 'Computer Science and Engineering', code: 'CSE' },
    }),
    ECE: await prisma.department.create({
      data: { name: 'Electronics and Communication Engineering', code: 'ECE' },
    }),
  }

  const rooms = {
    lab101: await prisma.room.create({ data: { name: 'LAB-101', building: 'Science Block', capacity: 60 } }),
    lab204: await prisma.room.create({ data: { name: 'LAB-204', building: 'Science Block', capacity: 48 } }),
    room301: await prisma.room.create({ data: { name: 'Room-301', building: 'Main Building', capacity: 80 } }),
    room402: await prisma.room.create({ data: { name: 'Room-402', building: 'Main Building', capacity: 90 } }),
    room505: await prisma.room.create({ data: { name: 'Room-505', building: 'IT Tower', capacity: 70 } }),
  }

  const sections = {
    cseA: await prisma.section.create({
      data: { name: 'A', departmentId: departments.CSE.id, batchYear: 2026, programType: 'UG' },
    }),
    cseB: await prisma.section.create({
      data: { name: 'B', departmentId: departments.CSE.id, batchYear: 2026, programType: 'UG' },
    }),
    eceA: await prisma.section.create({
      data: { name: 'A', departmentId: departments.ECE.id, batchYear: 2025, programType: 'UG' },
    }),
  }

  const subjects = {
    cse: {
      dbms: await prisma.subject.create({
        data: { name: 'Database Management Systems', code: 'CSE301', departmentId: departments.CSE.id, totalPlannedLectures: 48 },
      }),
      os: await prisma.subject.create({
        data: { name: 'Operating Systems', code: 'CSE302', departmentId: departments.CSE.id, totalPlannedLectures: 44 },
      }),
      cn: await prisma.subject.create({
        data: { name: 'Computer Networks', code: 'CSE303', departmentId: departments.CSE.id, totalPlannedLectures: 42 },
      }),
      se: await prisma.subject.create({
        data: { name: 'Software Engineering', code: 'CSE304', departmentId: departments.CSE.id, totalPlannedLectures: 40 },
      }),
    },
    ece: {
      em: await prisma.subject.create({
        data: { name: 'Electromagnetic Theory', code: 'ECE201', departmentId: departments.ECE.id, totalPlannedLectures: 40 },
      }),
      dsp: await prisma.subject.create({
        data: { name: 'Digital Signal Processing', code: 'ECE202', departmentId: departments.ECE.id, totalPlannedLectures: 42 },
      }),
    },
  }

  const users = {
    admin: await createDemoUser('System Admin', 'admin@college.edu', 'ADMIN'),
    facultyPriya: await createDemoUser('Dr. Priya Sharma', 'priya.sharma@college.edu', 'FACULTY'),
    facultyArun: await createDemoUser('Prof. Arun Mehta', 'arun.mehta@college.edu', 'FACULTY'),
    facultyNisha: await createDemoUser('Prof. Nisha Iyer', 'nisha.iyer@college.edu', 'FACULTY'),
    studentAarav: await createDemoUser('Aarav Singh', 'aarav.singh@college.edu', 'STUDENT'),
    studentMeera: await createDemoUser('Meera Iyer', 'meera.iyer@college.edu', 'STUDENT'),
    studentKabir: await createDemoUser('Kabir Khan', 'kabir.khan@college.edu', 'STUDENT'),
    studentAnanya: await createDemoUser('Ananya Rao', 'ananya.rao@college.edu', 'STUDENT'),
    studentRohan: await createDemoUser('Rohan Patel', 'rohan.patel@college.edu', 'STUDENT'),
    studentIsha: await createDemoUser('Isha Nair', 'isha.nair@college.edu', 'STUDENT'),
  }

  const facultyProfiles = {
    priya: await prisma.facultyProfile.create({
      data: { userId: users.facultyPriya.id, employeeId: 'EMP-CSE-101', departmentId: departments.CSE.id },
    }),
    arun: await prisma.facultyProfile.create({
      data: { userId: users.facultyArun.id, employeeId: 'EMP-CSE-102', departmentId: departments.CSE.id },
    }),
    nisha: await prisma.facultyProfile.create({
      data: { userId: users.facultyNisha.id, employeeId: 'EMP-ECE-201', departmentId: departments.ECE.id },
    }),
  }

  await prisma.studentProfile.createMany({
    data: [
      { userId: users.studentAarav.id, rollNumber: 'CSE26A001', sectionId: sections.cseA.id },
      { userId: users.studentMeera.id, rollNumber: 'CSE26A002', sectionId: sections.cseA.id },
      { userId: users.studentKabir.id, rollNumber: 'CSE26A003', sectionId: sections.cseA.id },
      { userId: users.studentAnanya.id, rollNumber: 'CSE26B001', sectionId: sections.cseB.id },
      { userId: users.studentRohan.id, rollNumber: 'ECE25A001', sectionId: sections.eceA.id },
      { userId: users.studentIsha.id, rollNumber: 'ECE25A002', sectionId: sections.eceA.id },
    ],
  })

  const sectionSubjects = {
    cseA: {
      dbms: await prisma.sectionSubject.create({
        data: { sectionId: sections.cseA.id, subjectId: subjects.cse.dbms.id, facultyProfileId: facultyProfiles.priya.id },
      }),
      os: await prisma.sectionSubject.create({
        data: { sectionId: sections.cseA.id, subjectId: subjects.cse.os.id, facultyProfileId: facultyProfiles.arun.id },
      }),
      cn: await prisma.sectionSubject.create({
        data: { sectionId: sections.cseA.id, subjectId: subjects.cse.cn.id, facultyProfileId: facultyProfiles.priya.id },
      }),
    },
    cseB: {
      dbms: await prisma.sectionSubject.create({
        data: { sectionId: sections.cseB.id, subjectId: subjects.cse.dbms.id, facultyProfileId: facultyProfiles.arun.id },
      }),
      se: await prisma.sectionSubject.create({
        data: { sectionId: sections.cseB.id, subjectId: subjects.cse.se.id, facultyProfileId: facultyProfiles.priya.id },
      }),
    },
    eceA: {
      em: await prisma.sectionSubject.create({
        data: { sectionId: sections.eceA.id, subjectId: subjects.ece.em.id, facultyProfileId: facultyProfiles.nisha.id },
      }),
      dsp: await prisma.sectionSubject.create({
        data: { sectionId: sections.eceA.id, subjectId: subjects.ece.dsp.id, facultyProfileId: facultyProfiles.nisha.id },
      }),
    },
  }

  await prisma.timetableSlot.createMany({
    data: [
      { sectionSubjectId: sectionSubjects.cseA.dbms.id, roomId: rooms.room301.id, dayOfWeek: currentDaySlot, startTime: '09:00', endTime: '10:00' },
      { sectionSubjectId: sectionSubjects.cseA.os.id, roomId: rooms.room402.id, dayOfWeek: currentDaySlot, startTime: '10:15', endTime: '11:15' },
      { sectionSubjectId: sectionSubjects.cseA.cn.id, roomId: rooms.lab101.id, dayOfWeek: 2, startTime: '13:00', endTime: '14:00' },
      { sectionSubjectId: sectionSubjects.cseB.dbms.id, roomId: rooms.room505.id, dayOfWeek: currentDaySlot, startTime: '11:30', endTime: '12:30' },
      { sectionSubjectId: sectionSubjects.cseB.se.id, roomId: rooms.lab204.id, dayOfWeek: 3, startTime: '14:00', endTime: '15:00' },
      { sectionSubjectId: sectionSubjects.eceA.em.id, roomId: rooms.room301.id, dayOfWeek: currentDaySlot, startTime: '09:00', endTime: '10:00' },
      { sectionSubjectId: sectionSubjects.eceA.dsp.id, roomId: rooms.room402.id, dayOfWeek: 4, startTime: '10:15', endTime: '11:15' },
    ],
  })

  const cseAPlans = [
    createAttendancePlan({ studentKey: 'aarav', absentSessions: [1], lateSessions: [4] }),
    createAttendancePlan({ studentKey: 'meera', absentSessions: [2], lateSessions: [] }),
    createAttendancePlan({ studentKey: 'kabir', absentSessions: [0, 3], lateSessions: [5] }),
  ]
  const cseBPlans = [
    createAttendancePlan({ studentKey: 'ananya', absentSessions: [4], lateSessions: [1] }),
  ]
  const eceAPlans = [
    createAttendancePlan({ studentKey: 'rohan', absentSessions: [1, 3], lateSessions: [] }),
    createAttendancePlan({ studentKey: 'isha', absentSessions: [], lateSessions: [2] }),
  ]

  const cseA = await seedSessionSeries({
    sectionSubject: sectionSubjects.cseA.dbms,
    facultyUserId: users.facultyPriya.id,
    sessionCount: 6,
    startOffset: 2,
    attendancePlans: cseAPlans.map((plan) => ({
      studentId: {
        aarav: users.studentAarav.id,
        meera: users.studentMeera.id,
        kabir: users.studentKabir.id,
      }[plan.studentKey],
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const cseAos = await seedSessionSeries({
    sectionSubject: sectionSubjects.cseA.os,
    facultyUserId: users.facultyArun.id,
    sessionCount: 6,
    startOffset: 10,
    attendancePlans: cseAPlans.map((plan) => ({
      studentId: {
        aarav: users.studentAarav.id,
        meera: users.studentMeera.id,
        kabir: users.studentKabir.id,
      }[plan.studentKey],
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const cseAcn = await seedSessionSeries({
    sectionSubject: sectionSubjects.cseA.cn,
    facultyUserId: users.facultyPriya.id,
    sessionCount: 6,
    startOffset: 18,
    attendancePlans: cseAPlans.map((plan) => ({
      studentId: {
        aarav: users.studentAarav.id,
        meera: users.studentMeera.id,
        kabir: users.studentKabir.id,
      }[plan.studentKey],
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const cseB = await seedSessionSeries({
    sectionSubject: sectionSubjects.cseB.dbms,
    facultyUserId: users.facultyArun.id,
    sessionCount: 6,
    startOffset: 4,
    attendancePlans: cseBPlans.map((plan) => ({
      studentId: users.studentAnanya.id,
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const cseBse = await seedSessionSeries({
    sectionSubject: sectionSubjects.cseB.se,
    facultyUserId: users.facultyPriya.id,
    sessionCount: 6,
    startOffset: 14,
    attendancePlans: cseBPlans.map((plan) => ({
      studentId: users.studentAnanya.id,
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const eceAem = await seedSessionSeries({
    sectionSubject: sectionSubjects.eceA.em,
    facultyUserId: users.facultyNisha.id,
    sessionCount: 6,
    startOffset: 6,
    attendancePlans: eceAPlans.map((plan) => ({
      studentId: {
        rohan: users.studentRohan.id,
        isha: users.studentIsha.id,
      }[plan.studentKey],
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const eceAdsp = await seedSessionSeries({
    sectionSubject: sectionSubjects.eceA.dsp,
    facultyUserId: users.facultyNisha.id,
    sessionCount: 6,
    startOffset: 22,
    attendancePlans: eceAPlans.map((plan) => ({
      studentId: {
        rohan: users.studentRohan.id,
        isha: users.studentIsha.id,
      }[plan.studentKey],
      absentSessions: plan.absentSessions,
      lateSessions: plan.lateSessions,
    })),
  })

  const aaravAbsentRecord = cseA.attendanceRecords.get(`${users.studentAarav.id}:${cseA.sessions[1].id}`)
  const meeraAbsentRecord = cseAos.attendanceRecords.get(`${users.studentMeera.id}:${cseAos.sessions[2].id}`)
  const kabirAbsentRecord = cseAcn.attendanceRecords.get(`${users.studentKabir.id}:${cseAcn.sessions[0].id}`)

  await prisma.correctionRequest.createMany({
    data: [
      {
        attendanceRecordId: aaravAbsentRecord.id,
        studentId: users.studentAarav.id,
        reason: 'The marked class overlapped with a verified internal exam slot.',
        requestedAt: daysAgo(1),
        facultyDecision: 'PENDING',
        adminEscalated: false,
      },
      {
        attendanceRecordId: meeraAbsentRecord.id,
        studentId: users.studentMeera.id,
        reason: 'Medical appointment was pre-approved by the department office.',
        requestedAt: daysAgo(4),
        facultyDecision: 'APPROVED',
        facultyDecisionAt: daysAgo(3),
        adminEscalated: false,
      },
      {
        attendanceRecordId: kabirAbsentRecord.id,
        studentId: users.studentKabir.id,
        reason: 'Transport disruption delayed arrival to campus beyond the grace period.',
        requestedAt: daysAgo(5),
        facultyDecision: 'REJECTED',
        facultyDecisionAt: daysAgo(4),
        adminEscalated: true,
        adminDecision: 'PENDING',
      },
    ],
  })

  console.log('Demo seed completed successfully.')
  console.log('Created 2 departments, 3 sections, 6 subjects, 10 users, timetable slots, lecture sessions, attendance records, and correction requests.')
  console.log(`Demo password for every seeded account: ${DEMO_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
