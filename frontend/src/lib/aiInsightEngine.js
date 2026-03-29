/**
 * Lightweight AI Insight Engine.
 * Observes patterns across symptom logs, medication adherence, and notes.
 * Returns explainable, actionable recommendations — no black-box logic.
 */

/**
 * Analyzes recent data and returns a list of insights.
 * Each insight has: { type, icon, title, reason, action, priority }
 */
export function generateInsights(patient, symptomLogs = [], medications = [], notes = []) {
  const insights = []
  const stage = parseInt(patient?.recoveryStage) || 1
  const age = parseInt(patient?.age) || 50
  const recent = symptomLogs.slice(0, 5)
  const last3 = symptomLogs.slice(0, 3)

  // ── Pattern 1: Worsening pain trend ──────────────────────────────────────
  if (last3.length >= 2) {
    const pains = last3.map((l) => l.symptoms?.painLevel || 0)
    const increasing = pains[0] > pains[1] && (pains.length < 3 || pains[1] >= pains[2])
    if (increasing && pains[0] >= 5) {
      insights.push({
        type: 'warning',
        icon: '📈',
        title: 'Pain is increasing',
        reason: `Your pain level has risen to ${pains[0]}/10 over the last few logs.`,
        action: 'Contact your doctor if pain continues to worsen. Take prescribed pain medication as directed.',
        priority: 2,
      })
    }
  }

  // ── Pattern 2: Repeated high fever ───────────────────────────────────────
  const feverLogs = recent.filter((l) => (l.symptoms?.temperature || 0) >= 38.5)
  if (feverLogs.length >= 2) {
    insights.push({
      type: 'critical',
      icon: '🌡️',
      title: 'Persistent fever detected',
      reason: `Fever above 38.5°C recorded in ${feverLogs.length} of your last ${recent.length} logs.`,
      action: 'Consult your doctor today. Persistent fever may indicate infection.',
      priority: 1,
    })
  }

  // ── Pattern 3: Missed medications ────────────────────────────────────────
  const missedMeds = medications.filter((m) => m.missedCount >= 2)
  if (missedMeds.length > 0) {
    insights.push({
      type: 'warning',
      icon: '💊',
      title: 'Medications missed repeatedly',
      reason: `You've missed "${missedMeds[0].name}" ${missedMeds[0].missedCount} times recently.`,
      action: 'Set a reminder or ask your caregiver to help you stay on schedule.',
      priority: 2,
    })
  }

  // ── Pattern 4: Extreme fatigue trend ─────────────────────────────────────
  const fatigueLogs = recent.filter((l) => l.symptoms?.fatigue === 'extreme' || l.symptoms?.fatigue === 'moderate')
  if (fatigueLogs.length >= 3) {
    insights.push({
      type: 'info',
      icon: '😴',
      title: 'Increase rest',
      reason: `Moderate to extreme fatigue reported in ${fatigueLogs.length} recent logs.`,
      action: 'Prioritize 8–9 hours of sleep. Reduce activity and rest more during the day.',
      priority: 3,
    })
  }

  // ── Pattern 5: Low hydration note ────────────────────────────────────────
  const hydrationNotes = notes.filter((n) =>
    n.text?.toLowerCase().includes('water') ||
    n.text?.toLowerCase().includes('drink') ||
    n.text?.toLowerCase().includes('thirst')
  )
  if (hydrationNotes.length > 0 || (recent.length > 0 && recent[0]?.symptoms?.nausea !== 'none')) {
    insights.push({
      type: 'info',
      icon: '💧',
      title: 'Maintain hydration',
      reason: 'Adequate hydration is critical for recovery and reduces nausea and fatigue.',
      action: 'Drink at least 8 glasses of water today. Set hourly reminders if needed.',
      priority: 4,
    })
  }

  // ── Pattern 6: Good progress ─────────────────────────────────────────────
  if (recent.length >= 3) {
    const allNormal = last3.every((l) => l.alert?.level === 'normal')
    const painImproving = last3.length >= 2 && (last3[0].symptoms?.painLevel || 0) <= (last3[1].symptoms?.painLevel || 0)
    if (allNormal && painImproving) {
      insights.push({
        type: 'success',
        icon: '🌟',
        title: 'Great recovery progress',
        reason: 'All recent symptom logs are in the normal range and pain is stable or improving.',
        action: 'Keep following your recovery plan. You\'re on track!',
        priority: 5,
      })
    }
  }

  // ── Pattern 7: Elderly-specific ──────────────────────────────────────────
  if (age >= 65 && stage === 1) {
    insights.push({
      type: 'info',
      icon: '👴',
      title: 'Extra care for your age',
      reason: 'Older adults may recover more slowly and are at higher risk of complications.',
      action: 'Ensure someone checks on you daily. Don\'t skip follow-up appointments.',
      priority: 4,
    })
  }

  // ── Pattern 8: Breathing difficulty ──────────────────────────────────────
  const breathingLogs = recent.filter((l) =>
    l.symptoms?.breathingDifficulty === 'moderate' || l.symptoms?.breathingDifficulty === 'severe'
  )
  if (breathingLogs.length >= 2) {
    insights.push({
      type: 'warning',
      icon: '🫁',
      title: 'Breathing difficulty recurring',
      reason: `Breathing difficulty reported in ${breathingLogs.length} recent logs.`,
      action: 'Inform your doctor at your next visit. Seek emergency care if it becomes severe.',
      priority: 2,
    })
  }

  // Sort by priority (1 = most urgent)
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

export const INSIGHT_CONFIG = {
  critical: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  warning:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  info:     { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  success:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
}
