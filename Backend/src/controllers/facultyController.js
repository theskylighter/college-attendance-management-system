const prisma = require('../lib/prisma')
const { applyAttendanceDelta, markSessionHeld } = require('../lib/attendanceSummary')
const { createCorrectionEvent } = require('../lib/correctionAudit')

// ── Schedule ─────────────────────────────────────────────
// Returns today's lecture sessions for the logged-in faculty

exports.getSchedule = async (req, res, next) => {
  try {
    const facultyProfile = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId }
    })
    if (!facultyProfile) {
      return res.status(404).json({ error: 'Faculty profile not found.' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const sessions = await prisma.lectureSession.findMany({
      where: {
        sectionSubject: { facultyProfileId: facultyProfile.id },
        date: { gte: today, lt: tomorrow }
      },
      include: {
        sectionSubject: {
          include: { section: true, subject: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })

    res.json(sessions)
  } catch (error) { next(error) }
}

// ── Session Students ──────────────────────────────────────
// Returns student list for a session, with their current attendance status

exports.getSessionStudents = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.id)

    const session = await prisma.lectureSession.findUnique({
      where: { id: sessionId },
      include: {
        sectionSubject: {
          include: {
            section: {
              include: {
                studentProfiles: {
                  include: {
                    user: { select: { id: true, name: true, email: true } }
                  }
                }
              }
            },
            subject: true
          }
        },
        attendanceRecords: true
      }
    })

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' })
    }

    // Map students with their attendance status if already marked
    const students = session.sectionSubject.section.studentProfiles.map(profile => {
      const record = session.attendanceRecords.find(
        r => r.studentId === profile.userId
      )
      return {
        userId: profile.userId,
        name: profile.user.name,
        email: profile.user.email,
        rollNumber: profile.rollNumber,
        attendanceStatus: record ? record.status : null,
        attendanceRecordId: record ? record.id : null
      }
    })

    res.json({
      session: {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        subject: session.sectionSubject.subject.name,
        section: session.sectionSubject.section.name
      },
      students
    })
  } catch (error) { next(error) }
}

// ── Bulk Mark Attendance ──────────────────────────────────
// Body: { lectureSessionId, records: [{ studentId, status }] }

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { lectureSessionId, records } = req.body

    if (!lectureSessionId || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'lectureSessionId and records array are required.' })
    }

    // Verify session exists
    const session = await prisma.lectureSession.findUnique({
      where: { id: parseInt(lectureSessionId) },
      include: {
        sectionSubject: true
      }
    })

    if (!session) {
      return res.status(404).json({ error: 'Lecture session not found.' })
    }

    // Verify this faculty owns this session
    const facultyProfile = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId }
    })

    if (!facultyProfile || session.sectionSubject.facultyProfileId !== facultyProfile.id) {
      return res.status(403).json({ error: 'You are not assigned to this session.' })
    }

    // Validate all statuses
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE']
    for (const record of records) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({ error: 'Each record must have studentId and status.' })
      }
      if (!validStatuses.includes(record.status)) {
        return res.status(400).json({ error: `Invalid status: ${record.status}` })
      }
    }

    // Run everything in a single transaction
    // If any insert fails, ALL are rolled back
    const result = await prisma.$transaction(async (tx) => {
      // Mark session as HELD
      await tx.lectureSession.update({
        where: { id: parseInt(lectureSessionId) },
        data: { status: 'HELD', markedById: req.user.userId }
      })

      // Upsert attendance records
      // upsert = insert if not exists, update if exists
      // This allows faculty to re-mark a session without duplicates
      const attendanceRecords = await Promise.all(
        records.map(record =>
          tx.attendanceRecord.upsert({
            where: {
              lectureSessionId_studentId: {
                lectureSessionId: parseInt(lectureSessionId),
                studentId: parseInt(record.studentId)
              }
            },
            update: { status: record.status, markedAt: new Date() },
            create: {
              lectureSessionId: parseInt(lectureSessionId),
              studentId: parseInt(record.studentId),
              status: record.status,
              markedAt: new Date()
            }
          })
        )
      )

      return attendanceRecords
    })

    res.status(201).json({
      message: `Attendance marked for ${result.length} students.`,
      records: result
    })
  } catch (error) { next(error) }
}

// ── Pending Corrections ───────────────────────────────────

exports.getPendingCorrections = async (req, res, next) => {
  try {
    const facultyProfile = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId }
    })

    const corrections = await prisma.correctionRequest.findMany({
      where: {
        facultyDecision: 'PENDING',
        attendanceRecord: {
          lectureSession: {
            sectionSubject: { facultyProfileId: facultyProfile.id }
          }
        }
      },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        student: { select: { name: true, email: true } },
        attendanceRecord: {
          include: {
            lectureSession: {
              include: {
                sectionSubject: { include: { subject: true, section: true } }
              }
            }
          }
        }
      },
      orderBy: { requestedAt: 'asc' }
    })

    res.json(corrections)
  } catch (error) { next(error) }
}

// ── Decide Correction ─────────────────────────────────────
// Body: { decision: 'APPROVED' | 'REJECTED' }

exports.decideCorrection = async (req, res, next) => {
  try {
    const { id } = req.params
    const { decision, reason } = req.body

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be APPROVED or REJECTED.' })
    }

    const correction = await prisma.correctionRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        attendanceRecord: {
          include: {
            lectureSession: { include: { sectionSubject: true } }
          }
        }
      }
    })

    if (!correction) {
      return res.status(404).json({ error: 'Correction request not found.' })
    }

    const facultyProfile = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId }
    })
    if (!facultyProfile || correction.attendanceRecord.lectureSession.sectionSubject.facultyProfileId !== facultyProfile.id) {
      return res.status(403).json({ error: 'You are not assigned to this correction.' })
    }

    if (correction.facultyDecision !== 'PENDING') {
      return res.status(409).json({ error: 'This correction has already been decided.' })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.correctionRequest.update({
        where: { id: parseInt(id) },
        data: {
          facultyDecision: decision,
          facultyDecisionAt: new Date()
        }
      })

      const nextStatus = decision === 'APPROVED' ? 'PRESENT' : correction.attendanceRecord.status
      if (decision === 'APPROVED') {
        await tx.attendanceRecord.update({
          where: { id: correction.attendanceRecordId },
          data: { status: nextStatus }
        })
        await applyAttendanceDelta(tx, {
          studentId: correction.attendanceRecord.studentId,
          sectionSubjectId: correction.attendanceRecord.lectureSession.sectionSubjectId,
          previousStatus: correction.attendanceRecord.status,
          nextStatus
        })
      }

      await createCorrectionEvent(tx, {
        correctionRequestId: correction.id,
        attendanceRecordId: correction.attendanceRecordId,
        actorId: req.user.userId,
        action: decision === 'APPROVED' ? 'FACULTY_APPROVED' : 'FACULTY_REJECTED',
        previousStatus: correction.attendanceRecord.status,
        newStatus: decision === 'APPROVED' ? nextStatus : null,
        reason
      })

      return updated
    })

    res.json({ message: `Correction ${decision.toLowerCase()}.`, correction: result })
  } catch (error) { next(error) }
}
