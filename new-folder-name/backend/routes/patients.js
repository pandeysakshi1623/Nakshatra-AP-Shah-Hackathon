/**
 * Patient routes.
 * POST /api/patients          — save/update full patient profile
 * GET  /api/patients/search   — search by patientId (for doctor connect)
 * GET  /api/patients/:id      — get by internal id OR patientId
 */
import { Router } from 'express'
import { db } from '../db/schema.js'

const router = Router()

// ── POST /api/patients — save or update patient profile ──────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      id, patientId, name, age, conditionType, recoveryStage,
      caregiverName, caregiverPhone, dietaryPref, email,
    } = req.body

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required.' })
    }

    const existingIdx = db.data.patients.findIndex(
      (p) => p.patientId === patientId || p.id === id
    )

    const patient = {
      id: id || Date.now().toString(),
      patientId: patientId.toUpperCase().trim(),
      name,
      age,
      email: email?.toLowerCase().trim(),
      conditionType,
      recoveryStage,
      caregiverName,
      caregiverPhone,
      dietaryPref,
      updatedAt: new Date().toISOString(),
      joinedAt: existingIdx >= 0
        ? db.data.patients[existingIdx].joinedAt
        : new Date().toISOString(),
    }

    if (existingIdx >= 0) {
      db.data.patients[existingIdx] = patient
    } else {
      db.data.patients.push(patient)
    }

    await db.write()
    res.json({ success: true, patient })
  } catch (err) {
    console.error('[patients POST error]', err)
    res.status(500).json({ error: 'Failed to save patient.' })
  }
})

// ── GET /api/patients/search?patientId=RE-XXXX-YYYY ──────────────────────────
// Used by doctor to find a patient by their unique ID
router.get('/search', (req, res) => {
  const rawId = req.query.patientId
  if (!rawId) {
    return res.status(400).json({ error: 'patientId query param is required.' })
  }

  const searchId = rawId.toUpperCase().trim()
  console.log(`[patient search] looking for: "${searchId}"`)
  console.log(`[patient search] total patients in DB: ${db.data.patients.length}`)

  const patient = db.data.patients.find(
    (p) => p.patientId?.toUpperCase().trim() === searchId
  )

  if (!patient) {
    console.log(`[patient search] not found: "${searchId}"`)
    return res.status(404).json({
      error: `No patient found with ID "${searchId}". Make sure the patient has completed setup.`,
    })
  }

  console.log(`[patient search] found: ${patient.name}`)

  // Return safe subset — no sensitive data
  const { email: _, ...safePatient } = patient
  res.json(safePatient)
})

// ── GET /api/patients/:id — get by internal id or patientId ──────────────────
router.get('/:id', (req, res) => {
  const rawId = req.params.id.toUpperCase().trim()
  const patient = db.data.patients.find(
    (p) => p.id === req.params.id ||
           p.patientId?.toUpperCase().trim() === rawId
  )
  if (!patient) return res.status(404).json({ error: 'Patient not found.' })
  const { email: _, ...safePatient } = patient
  res.json(safePatient)
})

export default router
