const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')

// ── Departments ─────────────────────────────────────────

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(departments)
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
    const sections = await prisma.section.findMany({
      include: { department: true },
      orderBy: { name: 'asc' }
    })
    res.json(sections)
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
    const subjects = await prisma.subject.findMany({
      include: { department: true },
      orderBy: { name: 'asc' }
    })
    res.json(subjects)
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
    const faculty = await prisma.user.findMany({
      where: { role: 'FACULTY' },
      include: { facultyProfile: { include: { department: true } } },
      orderBy: { name: 'asc' }
    })
    // strip passwordHash
    const safe = faculty.map(({ passwordHash, ...f }) => f)
    res.json(safe)
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
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { studentProfile: { include: { section: true } } },
      orderBy: { name: 'asc' }
    })
    const safe = students.map(({ passwordHash, ...s }) => s)
    res.json(safe)
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
    const sectionSubjects = await prisma.sectionSubject.findMany({
      include: {
        section: true,
        subject: true,
        facultyProfile: { include: { user: { select: { name: true, email: true } } } }
      }
    })
    res.json(sectionSubjects)
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
    const slots = await prisma.timetableSlot.findMany({
      include: {
        sectionSubject: {
          include: {
            section: true,
            subject: true,
            facultyProfile: { include: { user: { select: { name: true } } } }
          }
        }
      },
      orderBy: { dayOfWeek: 'asc' }
    })
    res.json(slots)
  } catch (error) { next(error) }
}

exports.createTimetableSlot = async (req, res, next) => {
  try {
    const { sectionSubjectId, dayOfWeek, startTime, endTime } = req.body
    if (!sectionSubjectId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    // dayOfWeek: 0 = Sunday, 1 = Monday ... 6 = Saturday
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'dayOfWeek must be 0–6.' })
    }
    const slot = await prisma.timetableSlot.create({
      data: {
        sectionSubjectId: parseInt(sectionSubjectId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime
      },
      include: { sectionSubject: { include: { section: true, subject: true } } }
    })
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
          timetableSlotId: slot.id,
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

    // Create all sessions in one transaction
    const result = await prisma.$transaction(
      sessionsToCreate.map(session => prisma.lectureSession.create({ data: session }))
    )

    res.status(201).json({
      message: `${result.length} lecture sessions generated.`,
      sessions: result
    })
  } catch (error) { next(error) }
}