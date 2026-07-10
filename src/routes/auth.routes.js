const authController = require( "../controllers/authController")
const express = require('express')
const authRouter= express.Router()
const { body } = require('express-validator');

const validateRegister = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters')
];

const validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

authRouter.post('/register', validateRegister, authController.register)
authRouter.post('/login', validateLogin, authController.login)
authRouter.post('/logout', authController.logout)
module.exports = authRouter; 