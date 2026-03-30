/**
 * Generates a personalized daily recovery plan based on patient profile.
 * Rule-based — no ML needed.
 */

const PLANS = {
  'cardiac-surgery': {
    medicines: [
      { name: 'Blood thinner (as prescribed)', time: 'Morning with food', icon: '💊' },
      { name: 'Beta-blocker (as prescribed)',  time: 'Morning & Evening', icon: '💊' },
      { name: 'Pain reliever if needed',       time: 'As needed (max 3x/day)', icon: '💊' },
    ],
    tasks: [
      { task: 'Short walk (5–10 min)', time: 'Morning', icon: '🚶' },
      { task: 'Deep breathing exercises (10 reps)', time: 'Morning & Evening', icon: '🫁' },
      { task: 'Check pulse and blood pressure', time: 'Morning', icon: '❤️' },
      { task: 'Rest after meals (30 min)', time: 'After each meal', icon: '🛋️' },
      { task: 'Avoid lifting >2 kg', time: 'All day', icon: '⚠️' },
    ],
    precautions: [
      'Avoid strenuous activity for 6 weeks',
      'Keep incision site dry and clean',
      'Watch for chest pain or shortness of breath',
      'No driving for at least 4 weeks',
    ],
  },
  'knee-surgery': {
    medicines: [
      { name: 'Anti-inflammatory (as prescribed)', time: 'Morning & Evening with food', icon: '💊' },
      { name: 'Pain reliever (as prescribed)',     time: 'As needed',                  icon: '💊' },
      { name: 'Blood clot prevention medication',  time: 'As prescribed',              icon: '💊' },
    ],
    tasks: [
      { task: 'Ankle pumps (20 reps each leg)', time: 'Every 2 hours', icon: '🦵' },
      { task: 'Knee straightening exercises',   time: 'Morning & Evening', icon: '🏋️' },
      { task: 'Ice pack on knee (15 min)',       time: '3x daily',         icon: '🧊' },
      { task: 'Elevate leg when resting',        time: 'All day',          icon: '🛋️' },
      { task: 'Walk with support (as tolerated)', time: 'Morning',         icon: '🚶' },
    ],
    precautions: [
      'Do not bend knee beyond 90° in first 2 weeks',
      'Keep wound dry until cleared by doctor',
      'Watch for excessive swelling or redness',
      'Use walker/crutches as instructed',
    ],
  },
  'appendectomy': {
    medicines: [
      { name: 'Antibiotic (as prescribed)', time: 'Morning & Evening', icon: '💊' },
      { name: 'Pain reliever',              time: 'As needed',         icon: '💊' },
    ],
    tasks: [
      { task: 'Short gentle walk (5 min)', time: 'Morning & Evening', icon: '🚶' },
      { task: 'Light stretching',          time: 'Morning',           icon: '🧘' },
      { task: 'Drink 8 glasses of water',  time: 'Throughout day',    icon: '💧' },
      { task: 'Eat soft, light meals',     time: 'All meals',         icon: '🥣' },
    ],
    precautions: [
      'Avoid heavy lifting for 4–6 weeks',
      'Keep incision clean and dry',
      'Watch for fever above 38°C',
      'Avoid strenuous exercise',
    ],
  },
  'pneumonia': {
    medicines: [
      { name: 'Antibiotic (as prescribed)',  time: 'As prescribed (complete full course)', icon: '💊' },
      { name: 'Fever reducer if needed',     time: 'As needed',                           icon: '💊' },
      { name: 'Cough syrup (if prescribed)', time: 'As directed',                         icon: '💊' },
    ],
    tasks: [
      { task: 'Deep breathing exercises (10 reps)', time: 'Every 2 hours', icon: '🫁' },
      { task: 'Drink warm fluids (water, broth)',   time: 'Every hour',    icon: '☕' },
      { task: 'Rest completely',                    time: 'All day',       icon: '🛋️' },
      { task: 'Measure temperature',                time: 'Morning & Evening', icon: '🌡️' },
    ],
    precautions: [
      'Complete the full antibiotic course',
      'Avoid cold air and smoke',
      'Return to hospital if breathing worsens',
      'No strenuous activity until fully recovered',
    ],
  },
  'general': {
    medicines: [
      { name: 'Prescribed medication', time: 'As directed by doctor', icon: '💊' },
      { name: 'Vitamins/supplements',  time: 'Morning with food',     icon: '💊' },
    ],
    tasks: [
      { task: 'Light walk (10 min)',          time: 'Morning',           icon: '🚶' },
      { task: 'Drink 8 glasses of water',     time: 'Throughout day',    icon: '💧' },
      { task: 'Eat nutritious meals',         time: 'All meals',         icon: '🥗' },
      { task: 'Rest 8 hours at night',        time: 'Night',             icon: '😴' },
      { task: 'Track symptoms in the app',    time: 'Evening',           icon: '📋' },
    ],
    precautions: [
      'Follow all doctor instructions',
      'Avoid strenuous activity',
      'Watch for unusual symptoms',
      'Attend all follow-up appointments',
    ],
  },
}

export function generateRecoveryPlan(patient) {
  const key = patient.conditionType || 'general'
  const base = PLANS[key] || PLANS['general']
  const stage = parseInt(patient.recoveryStage) || 1

  // Adjust tasks based on recovery stage
  const stageTasks = base.tasks.map((t) => ({
    ...t,
    completed: false,
    id: Math.random().toString(36).slice(2),
  }))

  // Reduce intensity in early stages
  const stageNote =
    stage === 1
      ? 'Early recovery — take it very easy. Rest is your priority.'
      : stage === 2
      ? 'Mid recovery — gentle activity is encouraged.'
      : 'Late recovery — gradually increase activity as tolerated.'

  return {
    ...base,
    tasks: stageTasks,
    stageNote,
    generatedAt: new Date().toISOString(),
    conditionLabel: getConditionLabel(key),
  }
}

export function calculateRecoveryScore(symptomLogs) {
  if (!symptomLogs.length) return 50
  const recent = symptomLogs.slice(0, 7)
  const scores = recent.map((log) => {
    let score = 100
    if (log.alert?.level === 'critical') score -= 40
    else if (log.alert?.level === 'warning') score -= 20
    score -= (log.symptoms?.painLevel || 0) * 3
    if (log.symptoms?.fatigue === 'extreme') score -= 15
    if (log.symptoms?.fatigue === 'moderate') score -= 8
    return Math.max(0, score)
  })
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

function getConditionLabel(key) {
  const labels = {
    'cardiac-surgery': 'Cardiac Surgery',
    'knee-surgery':    'Knee Surgery',
    'appendectomy':    'Appendectomy',
    'pneumonia':       'Pneumonia',
    'general':         'General Recovery',
  }
  return labels[key] || 'General Recovery'
}

export const CONDITIONS = [
  { value: 'cardiac-surgery', label: 'Heart / Cardiac Surgery' },
  { value: 'knee-surgery',    label: 'Knee / Joint Surgery' },
  { value: 'appendectomy',    label: 'Appendectomy' },
  { value: 'pneumonia',       label: 'Pneumonia / Lung Infection' },
  { value: 'general',         label: 'Other / General Recovery' },
]
