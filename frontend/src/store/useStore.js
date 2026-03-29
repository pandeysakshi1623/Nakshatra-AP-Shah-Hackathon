import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Patient profile
      patient: null,
      setPatient: (patient) => set({ patient }),

      // Recovery plan
      recoveryPlan: null,
      setRecoveryPlan: (plan) => set({ recoveryPlan: plan }),

      // Symptom logs
      symptomLogs: [],
      addSymptomLog: (log) =>
        set((state) => ({
          symptomLogs: [log, ...state.symptomLogs].slice(0, 30), // keep last 30
        })),

      // Latest alert level
      latestAlert: null,
      setLatestAlert: (alert) => set({ latestAlert: alert }),

      // Recovery score (0-100)
      recoveryScore: 0,
      setRecoveryScore: (score) => set({ recoveryScore: score }),

      // Reset
      reset: () => set({ patient: null, recoveryPlan: null, symptomLogs: [], latestAlert: null, recoveryScore: 0 }),
    }),
    { name: 'recoverease-storage' }
  )
)
