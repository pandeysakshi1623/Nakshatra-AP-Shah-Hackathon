import 'dotenv/config'
import { JSONFilePreset } from 'lowdb/node'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// DB path from env, default to ./db/recoverease.json
const dbPath = process.env.DB_PATH
  ? resolve(__dirname, '..', process.env.DB_PATH)
  : join(__dirname, 'recoverease.json')

const defaultData = {
  users: [],
  patients: [],
  symptomLogs: [],
  recoveryPlans: [],
}

export const db = await JSONFilePreset(dbPath, defaultData)
