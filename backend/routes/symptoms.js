import { Router } from 'express'
import { db } from '../db/schema.js'
import { analyzeSymptoms } from '../logic/alertEngine.js'

const router = Router()

router.post('/', async (req, res) => {
  const { patientId, symptoms } = req.body
  const alert = analyzeSymptoms(symptoms)
  const log = {
    id: Date.now().toString(),
    patientId,
    symptoms,
    alert,
    loggedAt: new Date().toISOString(),
  }
  db.data.symptomLogs.push(log)
  await db.write()
  res.json({ id: log.id, alert })
})

router.get('/:patientId', (req, res) => {
  const logs = db.data.symptomLogs
    .filter((l) => l.patientId === req.params.patientId)
    .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))
    .slice(0, 30)
  res.json(logs)
})

export default router
