const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const path = require('path')

// require all the routes here 
const authRouter = require('./routes/auth.routes')
const adminRouter = require('./routes/admin.routes')
const facultyRouter = require('./routes/faculty.routes')
const studentRouter = require('./routes/student.routes')

const app = express()

// Render terminates TLS at its proxy and forwards plain HTTP;
// trust it so req.secure/protocol and secure cookies behave correctly.
app.set('trust proxy', 1)

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

// 404 handler for unknown API routes (must sit after /api routers,
// before the SPA fallback so client-side routes still resolve)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Single-origin deployment: serve the Vite build alongside the API.
// distDir resolves to <repo>/Frontend/dist whether the process runs
// from Backend/ (Render rootDir) or the repo root (local).
const distDir = path.resolve(__dirname, '..', '..', 'Frontend', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))

  // SPA fallback for BrowserRouter: any GET that accepts HTML and
  // wasn't handled above serves index.html (client-side routing).
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  console.warn(`[app] SPA build not found at ${distDir} — serving API only`)
}

// Global error handler : 4 args
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

module.exports = app