import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generatePatientId } from '../lib/patientId'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Patient profile ───────────────────────────────────────────────────
      patient: null,
      setPatient: (patient) => set({ patient }),

      // ── Recovery plan ─────────────────────────────────────────────────────
      recoveryPlan: null,
      setRecoveryPlan: (plan) => set({ recoveryPlan: plan }),

      // ── Symptom logs ──────────────────────────────────────────────────────
      symptomLogs: [],
      addSymptomLog: (log) =>
        set((state) => ({
          symptomLogs: [log, ...state.symptomLogs].slice(0, 30),
        })),

      // ── Alert ─────────────────────────────────────────────────────────────
      latestAlert: null,
      setLatestAlert: (alert) => set({ latestAlert: alert }),

      // ── Recovery score ────────────────────────────────────────────────────
      recoveryScore: 0,
      setRecoveryScore: (score) => set({ recoveryScore: score }),

      // ── Medications (smart reminders) ─────────────────────────────────────
      medications: [],
      addMedication: (med) =>
        set((state) => ({
          medications: [...state.medications, { ...med, id: Date.now().toString(), missedCount: 0, takenToday: false }],
        })),
      updateMedication: (id, updates) =>
        set((state) => ({
          medications: state.medications.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        })),
      markMedicationTaken: (id) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, takenToday: true, lastTaken: new Date().toISOString(), missedCount: 0 } : m
          ),
        })),
      markMedicationMissed: (id) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, takenToday: false, missedCount: (m.missedCount || 0) + 1 } : m
          ),
        })),
      resetDailyMedications: () =>
        set((state) => ({
          medications: state.medications.map((m) => ({ ...m, takenToday: false })),
        })),

      // ── Notes / micro-tracking ────────────────────────────────────────────
      notes: [],
      addNote: (text) =>
        set((state) => ({
          notes: [
            { id: Date.now().toString(), text, createdAt: new Date().toISOString() },
            ...state.notes,
          ].slice(0, 50),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      // ── Meal plan (cached daily) ──────────────────────────────────────────
      mealPlan: null,
      setMealPlan: (plan) => set({ mealPlan: plan }),

      // ── Exercise plan (cached) ────────────────────────────────────────────
      exercisePlan: null,
      setExercisePlan: (plan) => set({ exercisePlan: plan }),

      // ── Reset ─────────────────────────────────────────────────────────────
      reset: () =>
        set({
          patient: null,
          recoveryPlan: null,
          symptomLogs: [],
          latestAlert: null,
          recoveryScore: 0,
          medications: [],
          notes: [],
          mealPlan: null,
          exercisePlan: null,
        }),

      // ── Doctor reports visible to patient ─────────────────────────────────
      doctorReportsForPatient: [],
      setDoctorReportsForPatient: (reports) => set({ doctorReportsForPatient: reports }),
    }),
    { name: 'recoverease-storage' }
  )
)
