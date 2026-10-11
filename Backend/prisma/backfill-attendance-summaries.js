const prisma = require('../src/lib/prisma')

async function main() {
  const sectionSubjects = await prisma.sectionSubject.findMany({
    select: {
      id: true,
      sectionId: true,
      lectureSessions: {
        where: { status: 'HELD' },
        select: {
          attendanceRecords: {
            select: { studentId: true, status: true }
          }
        }
      }
    }
  })

  let written = 0

  for (const sectionSubject of sectionSubjects) {
    const students = await prisma.studentProfile.findMany({
      where: { sectionId: sectionSubject.sectionId },
      select: { userId: true }
    })
    const attendedByStudent = new Map()

    for (const session of sectionSubject.lectureSessions) {
      for (const record of session.attendanceRecords) {
        if (record.status === 'PRESENT' || record.status === 'LATE') {
          attendedByStudent.set(
            record.studentId,
            (attendedByStudent.get(record.studentId) || 0) + 1
          )
        }
      }
    }

    await prisma.$transaction(
      students.map(({ userId }) => prisma.attendanceSummary.upsert({
        where: {
          studentId_sectionSubjectId: {
            studentId: userId,
            sectionSubjectId: sectionSubject.id
          }
        },
        update: {
          heldSessionCount: sectionSubject.lectureSessions.length,
          attendedSessionCount: attendedByStudent.get(userId) || 0
        },
        create: {
          studentId: userId,
          sectionSubjectId: sectionSubject.id,
          heldSessionCount: sectionSubject.lectureSessions.length,
          attendedSessionCount: attendedByStudent.get(userId) || 0
        }
      }))
    )

    written += students.length
  }

  console.log(`Backfilled ${written} attendance summaries.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
