import { JSONFilePreset } from 'lowdb/node'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Database collections:
 *  users        — registered accounts (patients, caregivers, doctors)
 *  patients     — patient profiles (linked to a user by userId)
 *  symptomLogs  — symptom entries per patient
 *  recoveryPlans
 */
const defaultData = {
  users: [],
  patients: [],
  symptomLogs: [],
  recoveryPlans: [],
}

export const db = await JSONFilePreset(join(__dirname, 'recoverease.json'), defaultData)
