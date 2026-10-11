const { rangesOverlap } = require('./time')

async function findTimetableConflicts(tx, candidate) {
  const sectionSubject = await tx.sectionSubject.findUnique({
    where: { id: candidate.sectionSubjectId },
    select: {
      sectionId: true,
      facultyProfileId: true
    }
  })

  if (!sectionSubject) return null

  const slots = await tx.timetableSlot.findMany({
    where: {
      dayOfWeek: candidate.dayOfWeek,
      ...(candidate.excludeId ? { id: { not: candidate.excludeId } } : {}),
      OR: [
        { startTime: { lt: candidate.endTime } },
        { endTime: { gt: candidate.startTime } }
      ]
    },
    include: {
      sectionSubject: {
        select: { sectionId: true, facultyProfileId: true }
      }
    }
  })

  return slots.filter((slot) => {
    if (!rangesOverlap(candidate.startTime, candidate.endTime, slot.startTime, slot.endTime)) {
      return false
    }

    return slot.sectionSubject.sectionId === sectionSubject.sectionId ||
      slot.sectionSubject.facultyProfileId === sectionSubject.facultyProfileId ||
      (candidate.roomId !== null && candidate.roomId !== undefined && slot.roomId === candidate.roomId)
  }).map((slot) => {
    const types = []
    if (slot.sectionSubject.sectionId === sectionSubject.sectionId) types.push('SECTION')
    if (slot.sectionSubject.facultyProfileId === sectionSubject.facultyProfileId) types.push('FACULTY')
    if (candidate.roomId !== null && candidate.roomId !== undefined && slot.roomId === candidate.roomId) {
      types.push('ROOM')
    }

    return {
      id: slot.id,
      types,
      sectionSubjectId: slot.sectionSubjectId,
      roomId: slot.roomId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime
    }
  })
}

module.exports = { findTimetableConflicts }
