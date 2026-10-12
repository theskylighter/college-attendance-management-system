const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const prisma = require('../lib/prisma')

const JWT_SECRET = process.env.JWT_SECRET

// Single-origin deployment (Express serves the SPA + /api from one host),
// so the auth cookie can stay SameSite=Strict.
// `secure: true` also works on http://localhost (secure context per spec).
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
}

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

    // 4. Create user and associated role‑specific profile in a single transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Base user creation
      const user = await tx.user.create({
        data: { name, email, passwordHash, role },
      })

      // Role‑specific nested profile creation
      if (role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            rollNumber: req.body.rollNumber,
            sectionId: parseInt(req.body.sectionId),
          },
        })
      } else if (role === 'FACULTY') {
        await tx.facultyProfile.create({
          data: {
            userId: user.id,
            employeeId: req.body.employeeId,
            departmentId: parseInt(req.body.departmentId),
          },
        })
      }
      return user
    })

    // Strip password hash from response
    const { passwordHash: _, ...safeUser } = newUser
    return res.status(201).json({
      message: 'User registered successfully.',
      user: safeUser,
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
    res.cookie('token', token, COOKIE_OPTIONS)

    return res.status(200).json({
      message: 'Login successful.',
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (error) {
    next(error)
  }
}

const logout = (req, res) => {
  // clearCookie must repeat the attributes or the browser keeps the cookie
  res.clearCookie('token', COOKIE_OPTIONS)
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