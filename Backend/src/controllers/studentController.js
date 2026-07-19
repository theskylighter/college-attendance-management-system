const prisma = require('../lib/prisma')

// ── Attendance Summary ────────────────────────────────────
// Returns attendance percentage per subject for logged-in student

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    // Get student's section
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
      include: { section: true }
    })

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found.' })
    }

    // Get all subjects for this student's section
    const sectionSubjects = await prisma.sectionSubject.findMany({
      where: { sectionId: studentProfile.sectionId },
      include: { subject: true }
    })

    // For each subject, count total held sessions and student's present count
    const summary = await Promise.all(
      sectionSubjects.map(async (ss) => {
        const totalSessions = await prisma.lectureSession.count({
          where: {
            sectionSubjectId: ss.id,
            status: 'HELD'
          }
        })

        const presentCount = await prisma.attendanceRecord.count({
          where: {
            lectureSession: { sectionSubjectId: ss.id },
            studentId: req.user.userId,
            status: { in: ['PRESENT', 'LATE'] }
          }
        })

        const percentage = totalSessions === 0
          ? 0
          : Math.round((presentCount / totalSessions) * 100)

        return {
          subjectId: ss.subject.id,
          subjectName: ss.subject.name,
          subjectCode: ss.subject.code,
          totalSessions,
          attended: presentCount,
          percentage,
          safe: percentage >= 75
        }
      })
    )

    res.json(summary)
  } catch (error) { next(error) }
}

// ── Attendance By Subject ─────────────────────────────────
// Returns lecture-by-lecture history for one subject

exports.getAttendanceBySubject = async (req, res, next) => {
  try {
    const subjectId = parseInt(req.params.subjectId)

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    })

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found.' })
    }

    // Find the sectionSubject for this student's section + requested subject
    const sectionSubject = await prisma.sectionSubject.findFirst({
      where: {
        sectionId: studentProfile.sectionId,
        subjectId
      },
      include: { subject: true }
    })

    if (!sectionSubject) {
      return res.status(404).json({ error: 'Subject not found for your section.' })
    }

    // Get all held sessions for this subject
    const sessions = await prisma.lectureSession.findMany({
      where: {
        sectionSubjectId: sectionSubject.id,
        status: 'HELD'
      },
      include: {
        attendanceRecords: {
          where: { studentId: req.user.userId }
        }
      },
      orderBy: { date: 'desc' }
    })

    const history = sessions.map(session => {
      const record = session.attendanceRecords[0] || null
      return {
        sessionId: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: record ? record.status : 'NOT_MARKED',
        attendanceRecordId: record ? record.id : null,
        correctionRaisable: record && record.status === 'ABSENT'
      }
    })

    res.json({
      subject: {
        id: sectionSubject.subject.id,
        name: sectionSubject.subject.name,
        code: sectionSubject.subject.code
      },
      history
    })
  } catch (error) { next(error) }
}

// ── Student Courses ──────────────────────────────────────────
// Returns a list of all subjects/courses the student is enrolled in

exports.getCourses = async (req, res, next) => {
  try {
    // 1. Get the student's profile to find their sectionId
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // 2. Fetch all section subjects for this section, including subject and faculty details
    const sectionSubjects = await prisma.sectionSubject.findMany({
      where: { sectionId: studentProfile.sectionId },
      include: {
        subject: true,
        facultyProfile: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    // 3. Format the response data
    const courses = sectionSubjects.map((ss) => ({
      sectionSubjectId: ss.id,
      subjectId: ss.subject.id,
      subjectName: ss.subject.name,
      subjectCode: ss.subject.code,
      facultyName: ss.facultyProfile?.user?.name || 'Unassigned',
      facultyEmail: ss.facultyProfile?.user?.email || null,
      totalPlannedLectures: ss.subject.totalPlannedLectures
    }));

    res.json(courses);
  } catch (error) {
    next(error);
  }
};
// ── Today's Schedule ─────────────────────────────────────────
// Returns the timetable slots for the logged-in student for the current day

exports.getSchedule = async (req, res, next) => {
  try {
    // 1. Get the student's profile for the sectionId
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // 2. Determine today's day of the week
    // JS getDay() returns 0 (Sunday) to 6 (Saturday). Ensure this matches your DB logic.
    const currentDayOfWeek = new Date().getDay();

    // 3. Query timetable slots for today that match the student's section subjects
    const todaySlots = await prisma.timetableSlot.findMany({
      where: {
        dayOfWeek: currentDayOfWeek,
        sectionSubject: {
          sectionId: studentProfile.sectionId
        }
      },
      include: {
        sectionSubject: {
          include: {
            subject: true,
            facultyProfile: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      // Order classes chronologically by start time
      orderBy: {
        startTime: 'asc'
      }
    });

    // 4. Format the response
    const schedule = todaySlots.map((slot) => ({
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectName: slot.sectionSubject.subject.name,
      subjectCode: slot.sectionSubject.subject.code,
      facultyName: slot.sectionSubject.facultyProfile?.user?.name || 'Unassigned'
    }));

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

// ── Raise Correction ──────────────────────────────────────
// Body: { attendanceRecordId, reason }

exports.raiseCorrection = async (req, res, next) => {
  try {
    const { attendanceRecordId, reason } = req.body

    if (!attendanceRecordId || !reason) {
      return res.status(400).json({ error: 'attendanceRecordId and reason are required.' })
    }

    // Verify the attendance record belongs to this student
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: parseInt(attendanceRecordId) }
    })

    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found.' })
    }

    if (record.studentId !== req.user.userId) {
      return res.status(403).json({ error: 'This record does not belong to you.' })
    }

    if (record.status !== 'ABSENT') {
      return res.status(400).json({ error: 'You can only raise corrections for ABSENT records.' })
    }

    // Check no pending correction already exists for this record
    const existing = await prisma.correctionRequest.findFirst({
      where: {
        attendanceRecordId: parseInt(attendanceRecordId),
        facultyDecision: 'PENDING'
      }
    })

    if (existing) {
      return res.status(409).json({ error: 'A correction request is already pending for this record.' })
    }

    const correction = await prisma.correctionRequest.create({
      data: {
        attendanceRecordId: parseInt(attendanceRecordId),
        studentId: req.user.userId,
        reason,
        requestedAt: new Date()
      }
    })

    res.status(201).json({
      message: 'Correction request submitted.',
      correction
    })
  } catch (error) { next(error) }
}

// ── My Corrections ────────────────────────────────────────

exports.getMyCorrections = async (req, res, next) => {
  try {
    const corrections = await prisma.correctionRequest.findMany({
      where: { studentId: req.user.userId },
      include: {
        attendanceRecord: {
          include: {
            lectureSession: {
              include: {
                sectionSubject: {
                  include: { subject: true, section: true }
                }
              }
            }
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    })

    res.json(corrections)
  } catch (error) { next(error) }
}