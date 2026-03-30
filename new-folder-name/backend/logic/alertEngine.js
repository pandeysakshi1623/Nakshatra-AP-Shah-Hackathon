// Mirror of frontend alert engine — single source of truth on backend
const CRITICAL_RULES = [
  { check: (s) => s.temperature >= 39.5,              message: 'Very high fever detected (≥39.5°C)',    advice: 'Go to emergency immediately or call your doctor.' },
  { check: (s) => s.painLevel >= 9,                   message: 'Severe pain reported (9-10/10)',         advice: 'Seek emergency care now.' },
  { check: (s) => s.breathingDifficulty === 'severe', message: 'Severe breathing difficulty',            advice: 'Call emergency services immediately.' },
  { check: (s) => s.consciousness === 'confused',     message: 'Confusion or disorientation reported',   advice: 'Seek emergency care immediately.' },
  { check: (s) => s.bleeding === 'heavy',             message: 'Heavy bleeding reported',                advice: 'Apply pressure and go to emergency now.' },
]

const WARNING_RULES = [
  { check: (s) => s.temperature >= 38.5 && s.temperature < 39.5, message: 'Elevated fever (38.5–39.4°C)',    advice: 'Monitor closely. Contact your doctor if it persists.' },
  { check: (s) => s.painLevel >= 7 && s.painLevel < 9,            message: 'High pain level (7-8/10)',        advice: 'Take prescribed pain medication. Notify caregiver.' },
  { check: (s) => s.breathingDifficulty === 'moderate',           message: 'Moderate breathing difficulty',   advice: 'Rest and monitor. Contact doctor if worsening.' },
  { check: (s) => s.fatigue === 'extreme',                        message: 'Extreme fatigue reported',        advice: 'Rest completely. Notify caregiver.' },
  { check: (s) => s.swelling === 'significant',                   message: 'Significant swelling noted',      advice: 'Elevate the affected area. Contact your doctor.' },
  { check: (s) => s.nausea === 'vomiting',                        message: 'Vomiting reported',               advice: 'Stay hydrated. Contact doctor if persistent.' },
]

export function analyzeSymptoms(symptoms) {
  for (const rule of CRITICAL_RULES) {
    if (rule.check(symptoms)) return { level: 'critical', message: rule.message, advice: rule.advice }
  }
  for (const rule of WARNING_RULES) {
    if (rule.check(symptoms)) return { level: 'warning', message: rule.message, advice: rule.advice }
  }
  return { level: 'normal', message: 'All symptoms within normal range', advice: 'Keep following your recovery plan. Great job!' }
}
