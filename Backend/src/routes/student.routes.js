const express = require('express')
const router = express.Router()
const { authenticate, authorizeRoles } = require('../middlewares/auth')
const studentController = require('../controllers/studentController')

router.use(authenticate)
router.use(authorizeRoles('STUDENT'))

// Attendance
router.get('/attendance', studentController.getAttendanceSummary)
router.get('/attendance/:subjectId', studentController.getAttendanceBySubject)

// Courses & Schedule
router.get('/courses',studentController.getCourses)
router.get('/schedule',studentController.getSchedule)

// Corrections
router.post('/corrections', studentController.raiseCorrection)
router.post('/corrections/:id/escalate', studentController.escalateCorrection)
router.get('/corrections', studentController.getMyCorrections)

module.exports = router