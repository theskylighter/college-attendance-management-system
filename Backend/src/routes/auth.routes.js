const authController = require('../controllers/authController')
const express = require('express')
const { body } = require('express-validator')
const { authenticate } = require('../middlewares/auth')
const { validateRequest } = require('../middlewares/validate')

const authRouter = express.Router()

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['STUDENT', 'FACULTY']).withMessage('Role must be STUDENT or FACULTY'),
  validateRequest,
]

const validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
]

authRouter.post('/register', validateRegister, authController.register)
authRouter.post('/login', validateLogin, authController.login)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', authenticate, authController.getMe)

module.exports = authRouter;