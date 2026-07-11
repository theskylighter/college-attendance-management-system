const express = require('express')
const router = express.Router()
const { authenticate, authorizeRoles } = require('../middleware/auth')
const studentController = require('../controllers/studentController')

router.use(authenticate)
router.use(authorizeRoles('STUDENT'))

// Attendance
router.get('/attendance', studentController.getAttendanceSummary)
router.get('/attendance/:subjectId', studentController.getAttendanceBySubject)

// Corrections
router.post('/corrections', studentController.raiseCorrection)
router.get('/corrections', studentController.getMyCorrections)

module.exports = router