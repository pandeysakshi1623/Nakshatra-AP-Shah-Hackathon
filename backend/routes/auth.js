/**
 * Auth routes — signup & login for all roles.
 * POST /api/auth/signup
 * POST /api/auth/login
 */
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/schema.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'recoverease-hackathon-secret'
const SALT_ROUNDS = 10

// ── Helpers ──────────────────────────────────────────────────────────────────

function generatePatientId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const ts = Date.now().toString(36).slice(-4).toUpperCase()
  return `RE-${rand}-${ts}`
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }
    if (!['patient', 'caregiver', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' })
    }

    // Check duplicate email
    const existing = db.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // Generate unique patient ID (only for patients)
    const patientId = role === 'patient' ? generatePatientId() : null

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      patientId,       // null for non-patients
      createdAt: new Date().toISOString(),
    }

    db.data.users.push(user)
    await db.write()

    const token = signToken(user)

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = user
    res.status(201).json({ success: true, token, user: safeUser })
  } catch (err) {
    console.error('[signup error]', err)
    res.status(500).json({ error: 'Signup failed. Please try again.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = db.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    )

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email.' })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }

    const token = signToken(user)
    const { passwordHash: _, ...safeUser } = user

    res.json({ success: true, token, user: safeUser })
  } catch (err) {
    console.error('[login error]', err)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// ── GET /api/auth/me (verify token) ──────────────────────────────────────────
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' })
    }
    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.data.users.find((u) => u.id === decoded.id)
    if (!user) return res.status(404).json({ error: 'User not found.' })
    const { passwordHash: _, ...safeUser } = user
    res.json(safeUser)
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
})

export default router
