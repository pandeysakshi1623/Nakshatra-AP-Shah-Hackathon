/**
 * Role-based auth store — persisted to localStorage.
 * Patients and caregivers use real email/password auth via backend.
 * Doctors use demo accounts (simulated for hackathon).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from './api'

// Demo doctor accounts
const DEMO_DOCTORS = [
  { id: 'DR001', name: 'Dr. Sarah Johnson', specialty: 'Cardiology',      email: 'sarah@hospital.com',   password: 'doctor123' },
  { id: 'DR002', name: 'Dr. Michael Chen',  specialty: 'Orthopedics',     email: 'michael@hospital.com', password: 'doctor123' },
  { id: 'DR003', name: 'Dr. Priya Patel',   specialty: 'General Medicine', email: 'priya@hospital.com',   password: 'doctor123' },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── Session ────────────────────────────────────────────────────────────
      role:     null,   // 'patient' | 'caregiver' | 'doctor'
      authUser: null,   // logged-in user profile
      token:    null,   // JWT (patients/caregivers only)

      setRole: (role) => set({ role }),

      // ── Patient / Caregiver signup ─────────────────────────────────────────
      signup: async (name, email, password, role = 'patient') => {
        try {
          const data = await api.signup({ name, email, password, role })
          localStorage.setItem('re-token', data.token)
          set({ role: data.user.role, authUser: data.user, token: data.token })
          return { success: true, user: data.user }
        } catch (err) {
          if (err.message === 'BACKEND_OFFLINE') {
            return { success: false, error: 'Backend server is not running. Use "Continue without account" below.' }
          }
          return { success: false, error: err.message }
        }
      },

      // ── Patient / Caregiver login ──────────────────────────────────────────
      loginUser: async (email, password) => {
        try {
          const data = await api.login({ email, password })
          localStorage.setItem('re-token', data.token)
          set({ role: data.user.role, authUser: data.user, token: data.token })
          return { success: true, user: data.user }
        } catch (err) {
          if (err.message === 'BACKEND_OFFLINE') {
            return { success: false, error: 'Backend server is not running. Use "Continue without account" below.' }
          }
          return { success: false, error: err.message }
        }
      },

      // ── Doctor login (demo — no backend needed) ────────────────────────────
      loginDoctor: (email, password) => {
        const doctor = DEMO_DOCTORS.find(
          (d) => d.email.toLowerCase() === email.toLowerCase() && d.password === password
        )
        if (!doctor) return { success: false, error: 'Invalid email or password.' }
        set({ role: 'doctor', authUser: { ...doctor, password: undefined }, token: null })
        return { success: true, doctor }
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: () => {
        localStorage.removeItem('re-token')
        set({ role: null, authUser: null, token: null })
      },

      // ── Doctor: connected patients ─────────────────────────────────────────
      // { [doctorId]: [ patientRecord, ... ] }
      doctorPatients: {},

      addPatientToDoctor: (doctorId, patientRecord) =>
        set((state) => {
          const existing = state.doctorPatients[doctorId] || []
          if (existing.find((p) => p.patientId === patientRecord.patientId)) return state
          return {
            doctorPatients: {
              ...state.doctorPatients,
              [doctorId]: [...existing, { ...patientRecord, connectedAt: new Date().toISOString() }],
            },
          }
        }),

      updatePatientRecord: (doctorId, patientId, updates) =>
        set((state) => ({
          doctorPatients: {
            ...state.doctorPatients,
            [doctorId]: (state.doctorPatients[doctorId] || []).map((p) =>
              p.patientId === patientId ? { ...p, ...updates } : p
            ),
          },
        })),

      removePatientFromDoctor: (doctorId, patientId) =>
        set((state) => ({
          doctorPatients: {
            ...state.doctorPatients,
            [doctorId]: (state.doctorPatients[doctorId] || []).filter((p) => p.patientId !== patientId),
          },
        })),

      // ── Doctor: reports per patient ────────────────────────────────────────
      // { [patientId]: [ report, ... ] }
      doctorReports: {},

      addDoctorReport: (patientId, report) =>
        set((state) => {
          const existing = state.doctorReports[patientId] || []
          return {
            doctorReports: {
              ...state.doctorReports,
              [patientId]: [
                { ...report, id: Date.now().toString(), createdAt: new Date().toISOString() },
                ...existing,
              ].slice(0, 20),
            },
          }
        }),

      getDoctorReports: (patientId) => get().doctorReports[patientId] || [],

      // ── SOS events ────────────────────────────────────────────────────────
      sosEvents: [],
      addSosEvent: (event) =>
        set((state) => ({
          sosEvents: [
            { ...event, id: Date.now().toString(), triggeredAt: new Date().toISOString() },
            ...state.sosEvents,
          ].slice(0, 10),
        })),

      // ── Caregiver: which patient they are monitoring ───────────────────────
      caregiverPatientId: null,
      setCaregiverPatientId: (id) => set({ caregiverPatientId: id }),

      // ── Caregiver alerts (missed meds + SOS) ──────────────────────────────
      // Array of { id, type: 'missed_med'|'sos', message, patientName, createdAt, read }
      caregiverAlerts: [],
      addCaregiverAlert: (alert) =>
        set((state) => ({
          caregiverAlerts: [
            { ...alert, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false },
            ...state.caregiverAlerts,
          ].slice(0, 30),
        })),
      markCaregiverAlertRead: (id) =>
        set((state) => ({
          caregiverAlerts: state.caregiverAlerts.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        })),
      clearCaregiverAlerts: () => set({ caregiverAlerts: [] }),
    }),
    { name: 'recoverease-auth' }
  )
)

export const DEMO_DOCTORS_LIST = DEMO_DOCTORS.map((d) => ({ ...d, password: undefined }))
