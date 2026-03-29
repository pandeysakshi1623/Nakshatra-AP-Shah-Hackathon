import { Router } from 'express'
import { db } from '../db/schema.js'

const router = Router()

router.post('/', async (req, res) => {
  const { id, name, age, conditionType, recoveryStage, caregiverName, caregiverPhone } = req.body
  const existing = db.data.patients.findIndex((p) => p.id === id)
  const patient = { id, name, age, conditionType, recoveryStage, caregiverName, caregiverPhone, joinedAt: new Date().toISOString() }

  if (existing >= 0) db.data.patients[existing] = patient
  else db.data.patients.push(patient)

  await db.write()
  res.json({ success: true, patient })
})

router.get('/:id', (req, res) => {
  const patient = db.data.patients.find((p) => p.id === req.params.id)
  if (!patient) return res.status(404).json({ error: 'Not found' })
  res.json(patient)
})

export default router
