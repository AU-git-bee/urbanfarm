import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import authRoutes from './routes/auth.js'
import plantsRoutes from './routes/plants.js'
import employeesRoutes from './routes/employees.js'
import schedulesRoutes from './routes/schedules.js'
import feedbackRoutes from './routes/feedback.js'
import aiRoutes from './routes/ai.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/plants', plantsRoutes)
app.use('/api/employees', employeesRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/ai', aiRoutes)

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`🌱 UrbanFarm server running on port ${PORT}`)
})
