const express = require('express')
const router = express.Router()
const { authenticate, authorizeRoles } = require('../middleware/auth')
const adminController = require('../controllers/adminController')

// All admin routes require authentication + ADMIN or SUPER_ADMIN role
router.use(authenticate)
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN'))

// Departments
router.get('/departments', adminController.getDepartments)
router.post('/departments', adminController.createDepartment)
router.put('/departments/:id', adminController.updateDepartment)
router.delete('/departments/:id', adminController.deleteDepartment)

// Sections
router.get('/sections', adminController.getSections)
router.post('/sections', adminController.createSection)
router.put('/sections/:id', adminController.updateSection)
router.delete('/sections/:id', adminController.deleteSection)

// Subjects
router.get('/subjects', adminController.getSubjects)
router.post('/subjects', adminController.createSubject)
router.put('/subjects/:id', adminController.updateSubject)
router.delete('/subjects/:id', adminController.deleteSubject)

// Faculty accounts
router.get('/faculty', adminController.getFaculty)
router.post('/faculty', adminController.createFaculty)

// Student accounts
router.get('/students', adminController.getStudents)
router.post('/students', adminController.createStudent)

// Assign faculty to teach a subject to a section
router.get('/section-subjects', adminController.getSectionSubjects)
router.post('/section-subjects', adminController.assignFacultyToSubject)
router.delete('/section-subjects/:id', adminController.removeSectionSubject)

// Timetable
router.get('/timetable/slots', adminController.getTimetableSlots)
router.post('/timetable/slots', adminController.createTimetableSlot)
router.delete('/timetable/slots/:id', adminController.deleteTimetableSlot)
router.post('/timetable/generate-sessions', adminController.generateLectureSessions)

// Reports
router.get('/reports/defaulters', adminController.getDefaulters)
router.get('/reports/summary', adminController.getAttendanceSummary)
router.get('/reports/export/excel', adminController.exportExcel)
router.get('/reports/export/pdf', adminController.exportPdf)

module.exports = router