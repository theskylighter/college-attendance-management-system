const express = require('express')
const router = express.Router()
const { authenticate, authorizeRoles } = require('../middlewares/auth')
const facultyController = require('../controllers/facultyController')

router.use(authenticate)
router.use(authorizeRoles('FACULTY', 'ADMIN'))

// Schedule
router.get('/schedule', facultyController.getSchedule)

// Sessions
router.get('/sessions/:id', facultyController.getSessionStudents)

// Attendance
router.post('/attendance/bulk-mark', facultyController.bulkMarkAttendance)

// Corrections
router.get('/corrections', facultyController.getPendingCorrections)
router.put('/corrections/:id', facultyController.decideCorrection)

module.exports = router