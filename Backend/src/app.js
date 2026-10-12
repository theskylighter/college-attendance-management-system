const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

// require all the routes here 
const authRouter = require('./routes/auth.routes')
const adminRouter = require('./routes/admin.routes')
const facultyRouter = require('./routes/faculty.routes')
const studentRouter = require('./routes/student.routes')

const app = express()

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' }
})

// Render's fromService wiring supplies a bare hostname
// (my-app.onrender.com); CORS origins need a scheme, so normalize.
function resolveFrontendOrigin() {
  const raw = (process.env.FRONTEND_URL || '').trim()
  if (!raw) return 'http://localhost:5173'
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
}

app.use(cors({
  origin: resolveFrontendOrigin(),
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)

// use all the routes here
app.use('/api/admin', adminRouter)
app.use('/api/auth', authRouter)
app.use('/api/faculty', facultyRouter)
app.use('/api/student', studentRouter)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler : 4 args
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

module.exports = app