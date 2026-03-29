/**
 * Rule-based exercise recommendation engine.
 * Safety-first: adapts to condition, stage, age, and symptoms.
 */

const EXERCISE_DB = {
  'cardiac-surgery': {
    stage1: {
      label: 'Very Light Activity Only',
      exercises: [
        { name: 'Slow walking in room', duration: '5 min', reps: '2x daily', icon: '🚶', tip: 'Hold onto furniture if needed.' },
        { name: 'Deep breathing', duration: '5 min', reps: '3x daily', icon: '🫁', tip: 'Breathe in slowly for 4 counts, out for 4.' },
        { name: 'Ankle circles (seated)', duration: '2 min', reps: 'Every 2 hours', icon: '🦶', tip: 'Prevents blood clots while resting.' },
      ],
      restrictions: [
        'No lifting anything heavier than a phone',
        'No stairs without assistance',
        'Stop immediately if chest pain occurs',
        'No driving',
      ],
    },
    stage2: {
      label: 'Gentle Movement',
      exercises: [
        { name: 'Short outdoor walk', duration: '10–15 min', reps: '1x daily', icon: '🚶', tip: 'Flat surface only. Rest if tired.' },
        { name: 'Deep breathing exercises', duration: '10 min', reps: '2x daily', icon: '🫁', tip: 'Use a pillow against chest for support.' },
        { name: 'Seated arm raises', duration: '5 min', reps: '10 reps x 2 sets', icon: '💪', tip: 'Raise arms only to shoulder height.' },
        { name: 'Gentle neck stretches', duration: '3 min', reps: '2x daily', icon: '🧘', tip: 'Slow, controlled movements only.' },
      ],
      restrictions: [
        'No lifting >2 kg',
        'No pushing or pulling heavy objects',
        'Avoid activities that strain the chest',
        'No swimming or contact sports',
      ],
    },
    stage3: {
      label: 'Progressive Activity',
      exercises: [
        { name: 'Brisk walking', duration: '20–30 min', reps: '1x daily', icon: '🚶', tip: 'Gradually increase pace over weeks.' },
        { name: 'Light stretching routine', duration: '10 min', reps: '2x daily', icon: '🧘', tip: 'Full body gentle stretches.' },
        { name: 'Stationary cycling (low resistance)', duration: '15 min', reps: '1x daily', icon: '🚴', tip: 'Only if cleared by doctor.' },
        { name: 'Light resistance band exercises', duration: '10 min', reps: '3x weekly', icon: '💪', tip: 'Very light resistance only.' },
      ],
      restrictions: [
        'No heavy weightlifting for 6 weeks',
        'No contact sports',
        'Consult doctor before increasing intensity',
      ],
    },
  },

  'knee-surgery': {
    stage1: {
      label: 'Bed & Chair Exercises',
      exercises: [
        { name: 'Ankle pumps', duration: '2 min', reps: '20 reps every 2 hours', icon: '🦶', tip: 'Flex and point foot to prevent clots.' },
        { name: 'Quad sets (tighten thigh muscle)', duration: '5 min', reps: '10 reps x 3 sets', icon: '🦵', tip: 'Lie flat, tighten thigh, hold 5 sec.' },
        { name: 'Straight leg raises', duration: '5 min', reps: '10 reps x 2 sets', icon: '🦵', tip: 'Keep knee straight, raise 12 inches.' },
        { name: 'Ice pack application', duration: '15 min', reps: '3x daily', icon: '🧊', tip: 'Always wrap ice in cloth, never direct.' },
      ],
      restrictions: [
        'No bending knee beyond 90°',
        'No weight-bearing without support',
        'No twisting or pivoting on the knee',
        'Keep leg elevated when resting',
      ],
    },
    stage2: {
      label: 'Supported Walking & Stretching',
      exercises: [
        { name: 'Walking with support (walker/crutches)', duration: '10 min', reps: '2x daily', icon: '🚶', tip: 'Flat surfaces only. Increase gradually.' },
        { name: 'Heel slides', duration: '5 min', reps: '15 reps x 2 sets', icon: '🦵', tip: 'Slide heel toward buttocks slowly.' },
        { name: 'Knee bends (0–90°)', duration: '5 min', reps: '10 reps x 2 sets', icon: '🦵', tip: 'Only bend to comfortable range.' },
        { name: 'Standing calf raises (with support)', duration: '3 min', reps: '15 reps x 2 sets', icon: '🦶', tip: 'Hold chair for balance.' },
      ],
      restrictions: [
        'No running or jumping',
        'No kneeling on operated knee',
        'No high-impact activities',
        'Avoid stairs without handrail',
      ],
    },
    stage3: {
      label: 'Strengthening & Balance',
      exercises: [
        { name: 'Walking without support', duration: '20 min', reps: '1x daily', icon: '🚶', tip: 'Gradually increase distance.' },
        { name: 'Mini squats (0–45°)', duration: '5 min', reps: '15 reps x 3 sets', icon: '🏋️', tip: 'Never go below 45° bend.' },
        { name: 'Step-ups (low step)', duration: '5 min', reps: '10 reps x 2 sets', icon: '🪜', tip: 'Lead with operated leg going up.' },
        { name: 'Balance exercises (single leg)', duration: '3 min', reps: '30 sec x 3 sets', icon: '🧘', tip: 'Near a wall for safety.' },
      ],
      restrictions: [
        'No running until cleared by physiotherapist',
        'No contact sports',
        'No deep squats',
      ],
    },
  },

  'appendectomy': {
    stage1: {
      label: 'Rest with Gentle Movement',
      exercises: [
        { name: 'Short slow walk (indoors)', duration: '5 min', reps: '2x daily', icon: '🚶', tip: 'Helps prevent gas and blood clots.' },
        { name: 'Deep breathing', duration: '5 min', reps: '3x daily', icon: '🫁', tip: 'Supports lung function post-surgery.' },
        { name: 'Gentle shoulder rolls', duration: '2 min', reps: '5 reps each direction', icon: '🧘', tip: 'Relieves tension from bed rest.' },
      ],
      restrictions: [
        'No lifting anything over 2 kg',
        'No abdominal exercises (sit-ups, crunches)',
        'No straining or pushing',
        'Avoid activities that stretch the abdomen',
      ],
    },
    stage2: {
      label: 'Light Activity',
      exercises: [
        { name: 'Walking outdoors (flat surface)', duration: '10–15 min', reps: '1x daily', icon: '🚶', tip: 'Increase by 5 min each day as tolerated.' },
        { name: 'Gentle stretching (arms and legs)', duration: '5 min', reps: '2x daily', icon: '🧘', tip: 'Avoid any stretch that pulls the abdomen.' },
        { name: 'Diaphragmatic breathing', duration: '5 min', reps: '3x daily', icon: '🫁', tip: 'Breathe into belly, not chest.' },
      ],
      restrictions: [
        'No lifting >5 kg',
        'No core exercises',
        'No sports or vigorous activity',
        'Avoid bending at the waist forcefully',
      ],
    },
    stage3: {
      label: 'Gradual Return to Normal',
      exercises: [
        { name: 'Brisk walking', duration: '20–30 min', reps: '1x daily', icon: '🚶', tip: 'Build up pace gradually.' },
        { name: 'Light yoga (no inversions)', duration: '15 min', reps: '3x weekly', icon: '🧘', tip: 'Avoid poses that compress the abdomen.' },
        { name: 'Swimming (after wound healed)', duration: '20 min', reps: '3x weekly', icon: '🏊', tip: 'Only after doctor clearance.' },
      ],
      restrictions: [
        'No heavy lifting for 6 weeks',
        'No contact sports',
        'Consult doctor before resuming gym',
      ],
    },
  },

  'pneumonia': {
    stage1: {
      label: 'Rest is Priority',
      exercises: [
        { name: 'Deep breathing exercises', duration: '5 min', reps: 'Every 2 hours', icon: '🫁', tip: 'Helps clear mucus from lungs.' },
        { name: 'Pursed lip breathing', duration: '3 min', reps: '4x daily', icon: '💨', tip: 'Breathe in through nose, out slowly through pursed lips.' },
        { name: 'Gentle seated arm raises', duration: '3 min', reps: '5 reps x 2 sets', icon: '💪', tip: 'Improves lung expansion.' },
      ],
      restrictions: [
        'No outdoor activity in cold air',
        'No strenuous exercise',
        'Rest as much as possible',
        'Avoid smoke and pollutants',
      ],
    },
    stage2: {
      label: 'Gentle Movement',
      exercises: [
        { name: 'Short indoor walk', duration: '5–10 min', reps: '2x daily', icon: '🚶', tip: 'Stop if breathing becomes difficult.' },
        { name: 'Breathing exercises', duration: '10 min', reps: '3x daily', icon: '🫁', tip: 'Focus on full, deep breaths.' },
        { name: 'Gentle stretching', duration: '5 min', reps: '2x daily', icon: '🧘', tip: 'Light full-body stretches to prevent stiffness.' },
      ],
      restrictions: [
        'No outdoor exercise in cold or polluted air',
        'No vigorous activity',
        'Stop if coughing worsens',
      ],
    },
    stage3: {
      label: 'Gradual Return to Activity',
      exercises: [
        { name: 'Walking outdoors (warm weather)', duration: '15–20 min', reps: '1x daily', icon: '🚶', tip: 'Wear a mask in dusty environments.' },
        { name: 'Light yoga or tai chi', duration: '15 min', reps: '3x weekly', icon: '🧘', tip: 'Focus on breathing and gentle movement.' },
        { name: 'Breathing exercises', duration: '10 min', reps: '2x daily', icon: '🫁', tip: 'Continue even when feeling better.' },
      ],
      restrictions: [
        'No swimming until fully recovered',
        'No high-intensity exercise',
        'Avoid cold, dry air',
      ],
    },
  },

  'general': {
    stage1: {
      label: 'Rest & Gentle Movement',
      exercises: [
        { name: 'Short slow walk', duration: '5–10 min', reps: '2x daily', icon: '🚶', tip: 'Even a short walk helps circulation.' },
        { name: 'Deep breathing', duration: '5 min', reps: '3x daily', icon: '🫁', tip: 'Helps oxygenate the body.' },
        { name: 'Gentle stretching', duration: '5 min', reps: '2x daily', icon: '🧘', tip: 'Prevents stiffness from bed rest.' },
      ],
      restrictions: ['No strenuous activity', 'Listen to your body', 'Rest when tired'],
    },
    stage2: {
      label: 'Light Activity',
      exercises: [
        { name: 'Walking (increasing distance)', duration: '15 min', reps: '1x daily', icon: '🚶', tip: 'Add 5 minutes each day.' },
        { name: 'Light stretching routine', duration: '10 min', reps: '2x daily', icon: '🧘', tip: 'Full body gentle stretches.' },
        { name: 'Breathing exercises', duration: '5 min', reps: '2x daily', icon: '🫁', tip: 'Supports lung and cardiovascular health.' },
      ],
      restrictions: ['No heavy lifting', 'No contact sports', 'Avoid overexertion'],
    },
    stage3: {
      label: 'Gradual Return to Normal',
      exercises: [
        { name: 'Brisk walking or light jogging', duration: '20–30 min', reps: '1x daily', icon: '🏃', tip: 'Build up intensity gradually.' },
        { name: 'Light strength training', duration: '15 min', reps: '3x weekly', icon: '💪', tip: 'Start with bodyweight exercises.' },
        { name: 'Yoga or stretching', duration: '15 min', reps: '3x weekly', icon: '🧘', tip: 'Improves flexibility and reduces stress.' },
      ],
      restrictions: ['Consult doctor before high-intensity exercise', 'No contact sports yet'],
    },
  },
}

export function generateExercisePlan(patient, symptomLogs = []) {
  const key = patient.conditionType || 'general'
  const stage = parseInt(patient.recoveryStage) || 1
  const age = parseInt(patient.age) || 50
  const stageKey = `stage${stage}`

  const conditionPlan = EXERCISE_DB[key] || EXERCISE_DB['general']
  const plan = conditionPlan[stageKey] || conditionPlan['stage1']

  // Check if symptoms suggest rest
  const recentLog = symptomLogs[0]
  const shouldRest =
    recentLog?.alert?.level === 'critical' ||
    recentLog?.symptoms?.fatigue === 'extreme' ||
    (recentLog?.symptoms?.temperature || 0) >= 38.5

  const ageNote = age >= 65
    ? 'Take extra care — move slowly and always have support nearby.'
    : age >= 55
    ? 'Warm up for 5 minutes before any exercise.'
    : null

  const restWarning = shouldRest
    ? '⚠️ Based on your recent symptoms, prioritize rest today. Skip exercises if you feel unwell.'
    : null

  return {
    ...plan,
    ageNote,
    restWarning,
    generatedAt: new Date().toISOString(),
  }
}
