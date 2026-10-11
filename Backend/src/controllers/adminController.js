const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')
const { parsePagination, withPagination } = require('../lib/pagination')
const { validateTimeRange } = require('../lib/time')
const { findTimetableConflicts } = require('../lib/timetableConflicts')
const { applyAttendanceDelta, formatSummary } = require('../lib/attendanceSummary')
const { createCorrectionEvent } = require('../lib/correctionAudit')

// ── Rooms ──────────────────────────────────────────────

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { name: 'asc' } })
    res.json(rooms)
  } catch (error) { next(error) }
}

exports.createRoom = async (req, res, next) => {
  try {
    const { name, building, capacity } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required.' })
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        building: building?.trim() || null,
        capacity: capacity === null || capacity === '' ? null : Number(capacity),
      },
    })
    res.status(201).json(room)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Room name already exists.' })
    }
    next(error)
  }
}

exports.updateRoom = async (req, res, next) => {
  try {
    const { name, building, capacity } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required.' })
    }

    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: name.trim(),
        building: building?.trim() || null,
        capacity: capacity === null || capacity === '' ? null : Number(capacity),
      },
    })
    res.json(room)
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Room not found.' })
    if (error.code === 'P2002') return res.status(409).json({ error: 'Room name already exists.' })
    next(error)
  }
}

exports.deleteRoom = async (req, res, next) => {
  try {
    await prisma.room.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Room deleted.' })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Room not found.' })
    next(error)
  }
}

// ── Departments ─────────────────────────────────────────

exports.getDepartments = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.department.count(),
    ])
    res.json(withPagination(departments, total, page, limit))
  } catch (error) { next(error) }
}

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required.' })
    }
    const department = await prisma.department.create({
      data: { name, code: code.toUpperCase() }
    })
    res.status(201).json(department)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Department code already exists.' })
    }
    next(error)
  }
}

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, code } = req.body
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { name, code }
    })
    res.json(department)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Department not found.' })
    }
    next(error)
  }
}

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.department.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Department deleted.' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Department not found.' })
    }
    next(error)
  }
}

// ── Sections ────────────────────────────────────────────

exports.getSections = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [sections, total] = await Promise.all([
      prisma.section.findMany({
        include: { department: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.section.count(),
    ])
    res.json(withPagination(sections, total, page, limit))
  } catch (error) { next(error) }
}

exports.createSection = async (req, res, next) => {
  try {
    const { name, departmentId, batchYear, programType } = req.body
    if (!name || !departmentId || !batchYear || !programType) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    const section = await prisma.section.create({
      data: {
        name,
        departmentId: parseInt(departmentId),
        batchYear: parseInt(batchYear),
        programType
      }
    })
    res.status(201).json(section)
  } catch (error) { next(error) }
}

exports.updateSection = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, batchYear, programType } = req.body
    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: { name, batchYear, programType }
    })
    res.json(section)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Section not found.' })
    }
    next(error)
  }
}

exports.deleteSection = async (req, res, next) => {
  try {
    await prisma.section.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Section deleted.' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Section not found.' })
    }
    next(error)
  }
}

// ── Subjects ────────────────────────────────────────────

exports.getSubjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        include: { department: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.subject.count(),
    ])
    res.json(withPagination(subjects, total, page, limit))
  } catch (error) { next(error) }
}

exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, departmentId, totalPlannedLectures } = req.body
    if (!name || !code || !departmentId || !totalPlannedLectures) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    const subject = await prisma.subject.create({
      data: {
        name,
        code: code.toUpperCase(),
        departmentId: parseInt(departmentId),
        totalPlannedLectures: parseInt(totalPlannedLectures)
      }
    })
    res.status(201).json(subject)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Subject code already exists.' })
    }
    next(error)
  }
}

exports.updateSubject = async (req, res, next) => {
  try {
    const { name, code, totalPlannedLectures } = req.body
    const subject = await prisma.subject.update({
      where: { id: parseInt(req.params.id) },
      data: { name, code, totalPlannedLectures: parseInt(totalPlannedLectures) }
    })
    res.json(subject)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found.' })
    }
    next(error)
  }
}

exports.deleteSubject = async (req, res, next) => {
  try {
    await prisma.subject.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Subject deleted.' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found.' })
    }
    next(error)
  }
}

// ── Faculty ─────────────────────────────────────────────

exports.getFaculty = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [faculty, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'FACULTY' },
        include: { facultyProfile: { include: { department: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
    ])
    const safe = faculty.map(({ passwordHash, ...f }) => f)
    res.json(withPagination(safe, total, page, limit))
  } catch (error) { next(error) }
}

exports.createFaculty = async (req, res, next) => {
  try {
    const { name, email, password, employeeId, departmentId } = req.body
    if (!name || !email || !password || !employeeId || !departmentId) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name, email, passwordHash,
        role: 'FACULTY',
        facultyProfile: {
          create: {
            employeeId,
            departmentId: parseInt(departmentId)
          }
        }
      },
      include: { facultyProfile: true }
    })
    const { passwordHash: _, ...safe } = user
    res.status(201).json(safe)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email or employee ID already exists.' })
    }
    next(error)
  }
}

// ── Students ─────────────────────────────────────────────

exports.getStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: { studentProfile: { include: { section: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ])
    const safe = students.map(({ passwordHash, ...s }) => s)
    res.json(withPagination(safe, total, page, limit))
  } catch (error) { next(error) }
}

exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, sectionId } = req.body
    if (!name || !email || !password || !rollNumber || !sectionId) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name, email, passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            rollNumber,
            sectionId: parseInt(sectionId)
          }
        }
      },
      include: { studentProfile: true }
    })
    const { passwordHash: _, ...safe } = user
    res.status(201).json(safe)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email or roll number already exists.' })
    }
    next(error)
  }
}

// ── Section Subjects (faculty assignment) ────────────────

exports.getSectionSubjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [sectionSubjects, total] = await Promise.all([
      prisma.sectionSubject.findMany({
        include: {
          section: true,
          subject: true,
          facultyProfile: { include: { user: { select: { name: true, email: true } } } }
        },
        skip,
        take: limit,
      }),
      prisma.sectionSubject.count(),
    ])
    res.json(withPagination(sectionSubjects, total, page, limit))
  } catch (error) { next(error) }
}

exports.assignFacultyToSubject = async (req, res, next) => {
  try {
    const { sectionId, subjectId, facultyProfileId } = req.body
    if (!sectionId || !subjectId || !facultyProfileId) {
      return res.status(400).json({ error: 'sectionId, subjectId and facultyProfileId are required.' })
    }
    const assignment = await prisma.sectionSubject.create({
      data: {
        sectionId: parseInt(sectionId),
        subjectId: parseInt(subjectId),
        facultyProfileId: parseInt(facultyProfileId)
      },
      include: { section: true, subject: true }
    })
    res.status(201).json(assignment)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'This subject is already assigned to this section.' })
    }
    next(error)
  }
}

exports.removeSectionSubject = async (req, res, next) => {
  try {
    await prisma.sectionSubject.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Assignment removed.' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Assignment not found.' })
    }
    next(error)
  }
}
// ── Timetable Slots ──────────────────────────────────────

exports.getTimetableSlots = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10)
    const [slots, total] = await Promise.all([
      prisma.timetableSlot.findMany({
        include: {
          sectionSubject: {
            include: {
              section: true,
              subject: true,
              facultyProfile: { include: { user: { select: { name: true } } } }
            }
          }
        },
        orderBy: { dayOfWeek: 'asc' },
        skip,
        take: limit,
      }),
      prisma.timetableSlot.count(),
    ])
    res.json(withPagination(slots, total, page, limit))
  } catch (error) { next(error) }
}

exports.createTimetableSlot = async (req, res, next) => {
  try {
    const { sectionSubjectId, roomId, dayOfWeek, startTime, endTime } = req.body
    if (!sectionSubjectId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required.' })
    }

    const parsedSectionSubjectId = Number.parseInt(sectionSubjectId, 10)
    const parsedDayOfWeek = Number.parseInt(dayOfWeek, 10)
    const parsedRoomId = roomId === undefined || roomId === null || roomId === ''
      ? null
      : Number.parseInt(roomId, 10)

    if (!Number.isInteger(parsedSectionSubjectId) || parsedSectionSubjectId < 1 ||
      !Number.isInteger(parsedDayOfWeek) || parsedDayOfWeek < 0 || parsedDayOfWeek > 6 ||
      (parsedRoomId !== null && (!Number.isInteger(parsedRoomId) || parsedRoomId < 1))) {
      return res.status(400).json({ error: 'Invalid sectionSubjectId, roomId, or dayOfWeek.' })
    }

    try {
      validateTimeRange(startTime, endTime)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }

    const slot = await prisma.$transaction(async (tx) => {
      const sectionSubject = await tx.sectionSubject.findUnique({
        where: { id: parsedSectionSubjectId },
        select: { id: true }
      })

      if (!sectionSubject) {
        return null
      }

      if (parsedRoomId !== null) {
        const room = await tx.room.findUnique({ where: { id: parsedRoomId }, select: { id: true } })
        if (!room) return undefined
      }

      const conflicts = await findTimetableConflicts(tx, {
        sectionSubjectId: parsedSectionSubjectId,
        roomId: parsedRoomId,
        dayOfWeek: parsedDayOfWeek,
        startTime,
        endTime
      })

      if (conflicts.length > 0) {
        return { conflicts }
      }

      return tx.timetableSlot.create({
        data: {
          sectionSubjectId: parsedSectionSubjectId,
          roomId: parsedRoomId,
          dayOfWeek: parsedDayOfWeek,
          startTime,
          endTime
        },
        include: { sectionSubject: { include: { section: true, subject: true } } }
      })
    })

    if (slot === null) return res.status(404).json({ error: 'Section subject not found.' })
    if (slot === undefined) return res.status(404).json({ error: 'Room not found.' })
    if (slot.conflicts) {
      return res.status(409).json({
        error: 'Timetable slot overlaps an existing section, faculty, or room booking.',
        conflicts: slot.conflicts
      })
    }

    res.status(201).json(slot)
  } catch (error) { next(error) }
}

exports.deleteTimetableSlot = async (req, res, next) => {
  try {
    await prisma.timetableSlot.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Timetable slot deleted.' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Slot not found.' })
    }
    next(error)
  }
}

// ── Generate Lecture Sessions ────────────────────────────
// Takes a date range and creates LectureSession rows
// for every timetable slot that falls on a matching day

exports.generateLectureSessions = async (req, res, next) => {
  try {
    const { startDate, endDate, sectionSubjectId } = req.body
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required.' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      return res.status(400).json({ error: 'startDate must be before endDate.' })
    }

    // Fetch relevant timetable slots
    const whereClause = sectionSubjectId
      ? { sectionSubjectId: parseInt(sectionSubjectId) }
      : {}

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause
    })

    if (slots.length === 0) {
      return res.status(404).json({ error: 'No timetable slots found.' })
    }

    // Walk through every date in the range
    // For each date, check if any slot matches that day of week
    // If yes, create a LectureSession
    const sessionsToCreate = []
    const current = new Date(start)

    while (current <= end) {
      const dayOfWeek = current.getDay() // 0 = Sunday, 1 = Monday...

      const matchingSlots = slots.filter(slot => slot.dayOfWeek === dayOfWeek)

      for (const slot of matchingSlots) {
        sessionsToCreate.push({
          sectionSubjectId: slot.sectionSubjectId,
          roomId: slot.roomId,
          date: new Date(current),
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'SCHEDULED'
        })
      }

      // Move to next day
      current.setDate(current.getDate() + 1)
    }

    if (sessionsToCreate.length === 0) {
      return res.status(400).json({ error: 'No sessions fall within this date range for given slots.' })
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = []
      const existing = []

      for (const session of sessionsToCreate) {
        const duplicate = await tx.lectureSession.findFirst({
          where: {
            sectionSubjectId: session.sectionSubjectId,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime
          }
        })

        if (duplicate) {
          existing.push(duplicate)
          continue
        }

        created.push(await tx.lectureSession.create({ data: session }))
      }

      return { created, existing }
    })

    res.status(201).json({
      message: `${result.created.length} lecture sessions generated.`,
      created: result.created,
      existing: result.existing,
      createdCount: result.created.length,
      existingCount: result.existing.length
    })
  } catch (error) { next(error) }
}
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')

// ── Defaulters List ───────────────────────────────────────
// Query: ?sectionId=1&subjectId=2&threshold=75

// ── Escalated Corrections ─────────────────────────────────────

exports.getEscalatedCorrections = async (req, res, next) => {
  try {
    const corrections = await prisma.correctionRequest.findMany({
      where: {
        adminEscalated: true,
        adminDecision: 'PENDING'
      },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        student: { select: { id: true, name: true, email: true } },
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
      orderBy: { escalatedAt: 'asc' }
    })

    res.json(corrections)
  } catch (error) { next(error) }
}

exports.decideEscalation = async (req, res, next) => {
  try {
    const { id } = req.params
    const { decision } = req.body

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

    if (!correction.adminEscalated) {
      return res.status(409).json({ error: 'This correction was not escalated to admin.' })
    }

    if (correction.adminDecision !== 'PENDING') {
      return res.status(409).json({ error: 'This escalation has already been decided.' })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.correctionRequest.update({
        where: { id: parseInt(id) },
        data: {
          adminDecision: decision,
          adminDecisionAt: new Date()
        }
      })

      if (decision === 'APPROVED') {
        await tx.attendanceRecord.update({
          where: { id: correction.attendanceRecordId },
          data: { status: 'PRESENT' }
        })
        await applyAttendanceDelta(tx, {
          studentId: correction.attendanceRecord.studentId,
          sectionSubjectId: correction.attendanceRecord.lectureSession.sectionSubjectId,
          previousStatus: correction.attendanceRecord.status,
          nextStatus: 'PRESENT'
        })
      }

      await createCorrectionEvent(tx, {
        correctionRequestId: correction.id,
        attendanceRecordId: correction.attendanceRecordId,
        actorId: req.user.userId,
        action: decision === 'APPROVED' ? 'ADMIN_APPROVED' : 'ADMIN_REJECTED',
        previousStatus: correction.attendanceRecord.status,
        newStatus: decision === 'APPROVED' ? 'PRESENT' : null,
        reason: req.body.reason
      })

      return updated
    })

    res.json({ message: `Escalation ${decision.toLowerCase()}.`, correction: result })
  } catch (error) { next(error) }
}

exports.getDefaulters = async (req, res, next) => {
  try {
    const { sectionId, subjectId, threshold = 75 } = req.query

    if (!sectionId) {
      return res.status(400).json({ error: 'sectionId is required.' })
    }

    // Get all sectionSubjects for this section
    const whereClause = {
      sectionId: parseInt(sectionId),
      ...(subjectId && { subjectId: parseInt(subjectId) })
    }

    const sectionSubjects = await prisma.sectionSubject.findMany({
      where: whereClause,
      include: { subject: true }
    })

    if (sectionSubjects.length === 0) {
      return res.status(404).json({ error: 'No subjects found for this section.' })
    }

    // Get all students in this section
    const students = await prisma.studentProfile.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    const summaries = await prisma.attendanceSummary.findMany({
      where: {
        studentId: { in: students.map(student => student.userId) },
        sectionSubjectId: { in: sectionSubjects.map(ss => ss.id) }
      }
    })
    const summaryByKey = new Map(
      summaries.map(summary => [`${summary.studentId}:${summary.sectionSubjectId}`, summary])
    )

    const defaulters = []

    for (const student of students) {
      for (const ss of sectionSubjects) {
        const summary = formatSummary(summaryByKey.get(`${student.userId}:${ss.id}`) || {
          heldSessionCount: 0,
          attendedSessionCount: 0
        })

        if (summary.totalSessions === 0) continue

        if (summary.percentage < parseInt(threshold)) {
          defaulters.push({
            studentId: student.userId,
            name: student.user.name,
            email: student.user.email,
            rollNumber: student.rollNumber,
            subjectId: ss.subject.id,
            subjectName: ss.subject.name,
            subjectCode: ss.subject.code,
            totalSessions: summary.totalSessions,
            attended: summary.attended,
            percentage: summary.percentage
          })
        }
      }
    }

    // Sort by percentage ascending (worst first)
    defaulters.sort((a, b) => a.percentage - b.percentage)

    res.json({
      threshold: parseInt(threshold),
      totalDefaulters: defaulters.length,
      defaulters
    })
  } catch (error) { next(error) }
}

// ── Attendance Summary ────────────────────────────────────
// Query: ?sectionId=1

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { sectionId } = req.query

    if (!sectionId) {
      return res.status(400).json({ error: 'sectionId is required.' })
    }

    const students = await prisma.studentProfile.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    const sectionSubjects = await prisma.sectionSubject.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { subject: true }
    })

    const summaries = await prisma.attendanceSummary.findMany({
      where: {
        studentId: { in: students.map(student => student.userId) },
        sectionSubjectId: { in: sectionSubjects.map(ss => ss.id) }
      }
    })
    const summaryByKey = new Map(
      summaries.map(summary => [`${summary.studentId}:${summary.sectionSubjectId}`, summary])
    )

    const summary = students.map((student) => {
      const subjects = sectionSubjects.map((ss) => ({
        subjectName: ss.subject.name,
        subjectCode: ss.subject.code,
        ...formatSummary(summaryByKey.get(`${student.userId}:${ss.id}`) || {
          heldSessionCount: 0,
          attendedSessionCount: 0
        })
      }))

      return {
        studentId: student.userId,
        name: student.user.name,
        rollNumber: student.rollNumber,
        subjects
      }
    })

    res.json(summary)
  } catch (error) { next(error) }
}

// ── Export Excel ──────────────────────────────────────────
// Query: ?sectionId=1&threshold=75

exports.exportExcel = async (req, res, next) => {
  try {
    const { sectionId, threshold = 75 } = req.query

    if (!sectionId) {
      return res.status(400).json({ error: 'sectionId is required.' })
    }

    // Reuse defaulters logic
    const sectionSubjects = await prisma.sectionSubject.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { subject: true }
    })

    const students = await prisma.studentProfile.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { user: { select: { id: true, name: true, email: true } } }
    })

    const summaries = await prisma.attendanceSummary.findMany({
      where: {
        studentId: { in: students.map(student => student.userId) },
        sectionSubjectId: { in: sectionSubjects.map(ss => ss.id) }
      }
    })
    const summaryByKey = new Map(
      summaries.map(summary => [`${summary.studentId}:${summary.sectionSubjectId}`, summary])
    )

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Attendance Report')

    // Build header row dynamically from subjects
    const subjectHeaders = sectionSubjects.map(ss => ss.subject.code)
    sheet.columns = [
      { header: 'Roll Number', key: 'roll', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      ...subjectHeaders.map(code => ({ header: code, key: code, width: 12 })),
      { header: 'Overall %', key: 'overall', width: 12 }
    ]

    // Style header row
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }

    for (const student of students) {
      const rowData = {
        roll: student.rollNumber,
        name: student.user.name
      }

      let totalPresent = 0
      let totalSessions = 0

      for (const ss of sectionSubjects) {
        const current = formatSummary(summaryByKey.get(`${student.userId}:${ss.id}`) || {
          heldSessionCount: 0,
          attendedSessionCount: 0
        })
        rowData[ss.subject.code] = `${current.percentage}%`
        totalPresent += current.attended
        totalSessions += current.totalSessions
      }

      const overallPct = totalSessions === 0
        ? 0
        : Math.round((totalPresent / totalSessions) * 100)

      rowData.overall = `${overallPct}%`
      const row = sheet.addRow(rowData)

      // Highlight defaulters in red
      if (overallPct < parseInt(threshold)) {
        row.font = { color: { argb: 'FFFF0000' } }
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx')

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) { next(error) }
}

// ── Export PDF ────────────────────────────────────────────
// Query: ?sectionId=1&threshold=75

exports.exportPdf = async (req, res, next) => {
  try {
    const { sectionId, threshold = 75 } = req.query

    if (!sectionId) {
      return res.status(400).json({ error: 'sectionId is required.' })
    }

    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
      include: { department: true }
    })

    const students = await prisma.studentProfile.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { user: { select: { id: true, name: true } } }
    })

    const sectionSubjects = await prisma.sectionSubject.findMany({
      where: { sectionId: parseInt(sectionId) },
      include: { subject: true }
    })

    const summaries = await prisma.attendanceSummary.findMany({
      where: {
        studentId: { in: students.map(student => student.userId) },
        sectionSubjectId: { in: sectionSubjects.map(ss => ss.id) }
      }
    })
    const summaryByKey = new Map(
      summaries.map(summary => [`${summary.studentId}:${summary.sectionSubjectId}`, summary])
    )

    const doc = new PDFDocument({ margin: 40 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf')
    doc.pipe(res)

    // Title
    doc.fontSize(18).font('Helvetica-Bold')
      .text('Attendance Report', { align: 'center' })
    doc.fontSize(12).font('Helvetica')
      .text(`Section: ${section.name} | Department: ${section.department.name}`, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
    doc.moveDown(2)

    // One block per student
    for (const student of students) {
      doc.fontSize(12).font('Helvetica-Bold')
        .text(`${student.rollNumber} — ${student.user.name}`)
      doc.font('Helvetica').fontSize(10)

      let totalPresent = 0
      let totalSessions = 0

      for (const ss of sectionSubjects) {
        const current = formatSummary(summaryByKey.get(`${student.userId}:${ss.id}`) || {
          heldSessionCount: 0,
          attendedSessionCount: 0
        })
        const flag = current.percentage < parseInt(threshold) ? ' ⚠ DEFAULTER' : ''
        doc.text(`  ${ss.subject.code}: ${current.attended}/${current.totalSessions} (${current.percentage}%)${flag}`)
        totalPresent += current.attended
        totalSessions += current.totalSessions
      }

      const overallPct = totalSessions === 0
        ? 0
        : Math.round((totalPresent / totalSessions) * 100)

      doc.font('Helvetica-Bold')
        .text(`  Overall: ${overallPct}%`)
      doc.moveDown(1)
    }

    doc.end()
  } catch (error) { next(error) }
}