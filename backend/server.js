import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import patientsRouter from './routes/patients.js'
import symptomsRouter from './routes/symptoms.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api/auth',     authRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/symptoms', symptomsRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'RecoverEase API v2' }))

app.listen(PORT, () => {
  console.log(`RecoverEase API running on http://localhost:${PORT}`)
})
