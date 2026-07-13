const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const prisma = require('../lib/prisma')

const JWT_SECRET = process.env.JWT_SECRET

const register = async (req, res, next) => {
  try {
    // 1. Check validation errors from express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' })
    }

    // 2. Check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' })
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // 4. Create user
    const newUser = await prisma.user.create({
      data: { name, email, passwordHash, role },
    })

    return res.status(201).json({
      message: 'User registered successfully.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    })
  } catch (error) {
    next(error) // passes to global error handler in app.js
  }
}

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // 2. Compare password — note: passwordHash not password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // 3. Sign token — include role for middleware
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    return res.status(200).json({
      message: 'Login successful.',
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (error) {
    next(error)
  }
}

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  return res.status(200).json({
    message: 'Logged out successfully.',
  })
}

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    return res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, logout, getMe }