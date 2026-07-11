const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// require all the routes here 
const authRouter = require('./routes/auth.routes')
const adminRouter = require('./routes/admin.routes')
const facultyRouter = require('./routes/faculty.routes')
const studentRouter = require('./routes/student.routes')

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

module.exports = app