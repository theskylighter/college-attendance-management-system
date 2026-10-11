const ATTENDED_STATUSES = new Set(['PRESENT', 'LATE'])

function attendanceDelta(previousStatus, nextStatus) {
  const wasAttended = ATTENDED_STATUSES.has(previousStatus)
  const isAttended = ATTENDED_STATUSES.has(nextStatus)
  return Number(isAttended) - Number(wasAttended)
}

async function applyAttendanceDelta(tx, { studentId, sectionSubjectId, previousStatus, nextStatus }) {
  const attendedDelta = attendanceDelta(previousStatus, nextStatus)
  if (attendedDelta === 0) return

  await tx.attendanceSummary.upsert({
    where: {
      studentId_sectionSubjectId: { studentId, sectionSubjectId }
    },
    update: { attendedSessionCount: { increment: attendedDelta } },
    create: {
      studentId,
      sectionSubjectId,
      attendedSessionCount: Math.max(attendedDelta, 0)
    }
  })
}

async function markSessionHeld(tx, sectionSubjectId) {
  const sectionSubject = await tx.sectionSubject.findUnique({
    where: { id: sectionSubjectId },
    select: { sectionId: true }
  })

  if (!sectionSubject) return 0

  const students = await tx.studentProfile.findMany({
    where: { sectionId: sectionSubject.sectionId },
    select: { userId: true }
  })

  await Promise.all(students.map(({ userId }) => tx.attendanceSummary.upsert({
    where: {
      studentId_sectionSubjectId: { studentId: userId, sectionSubjectId }
    },
    update: { heldSessionCount: { increment: 1 } },
    create: {
      studentId: userId,
      sectionSubjectId,
      heldSessionCount: 1
    }
  })))

  return students.length
}

function formatSummary(summary) {
  const totalSessions = summary.heldSessionCount
  const attended = summary.attendedSessionCount
  const percentage = totalSessions === 0 ? 0 : Math.round((attended / totalSessions) * 100)

  return {
    totalSessions,
    attended,
    percentage,
    safe: percentage >= 75
  }
}

module.exports = {
  applyAttendanceDelta,
  markSessionHeld,
  formatSummary
}
