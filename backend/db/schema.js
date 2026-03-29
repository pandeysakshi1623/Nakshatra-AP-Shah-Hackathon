import { JSONFilePreset } from 'lowdb/node'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const defaultData = { patients: [], symptomLogs: [], recoveryPlans: [] }
export const db = await JSONFilePreset(join(__dirname, 'recoverease.json'), defaultData)
