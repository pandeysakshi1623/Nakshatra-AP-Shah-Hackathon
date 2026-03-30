import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import patientsRouter from './routes/patients.js'
import symptomsRouter from './routes/symptoms.js'

const app = express()
const PORT = process.env.PORT || 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json())

app.use('/api/auth',     authRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/symptoms', symptomsRouter)

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', app: 'RecoverEase API v2', port: PORT })
)

app.listen(PORT, () => {
  console.log(`RecoverEase API → http://localhost:${PORT}`)
  console.log(`CORS origin     → ${CORS_ORIGIN}`)
})
