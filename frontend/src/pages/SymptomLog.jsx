import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import { analyzeSymptoms } from '../lib/alertEngine'
import { calculateRecoveryScore } from '../lib/recoveryEngine'
import AlertBadge from '../components/AlertBadge'
import VoiceVitalsForm from '../components/VoiceVitalsForm'
import { Thermometer, Activity, Wind, Droplets, Brain, Zap } from 'lucide-react'

const defaultSymptoms = {
  temperature: 37.0,
  painLevel: 0,
  fatigue: 'none',
  breathingDifficulty: 'none',
  nausea: 'none',
  swelling: 'none',
  bleeding: 'none',
  consciousness: 'normal',
}

export default function SymptomLog() {
  const { addSymptomLog, setLatestAlert, setRecoveryScore, symptomLogs, patient } = useStore()
  const { doctorPatients, updatePatientRecord } = useAuthStore()
  const [symptoms, setSymptoms] = useState(defaultSymptoms)
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const update = (field, value) => setSymptoms((s) => ({ ...s, [field]: value }))

  // Accepts an explicit symptoms object — bypasses React's async setState
  const submitWithSymptoms = (overrideSymptoms) => {
    const finalSymptoms = { ...symptoms, ...overrideSymptoms }
    const alert = analyzeSymptoms(finalSymptoms)
    const log = {
      id: Date.now().toString(),
      symptoms: finalSymptoms,
      alert,
      loggedAt: new Date().toISOString(),
    }
    addSymptomLog(log)
    setLatestAlert(alert)
    const newScore = calculateRecoveryScore([log, ...symptomLogs])
    setRecoveryScore(newScore)
    setResult(alert)
    setSubmitted(true)

    // ── Propagate alert to every doctor watching this patient ──────────────
    if (patient) {
      const patId = patient.patientId || patient.id
      Object.keys(doctorPatients).forEach((doctorId) => {
        const records = doctorPatients[doctorId] || []
        const match = records.find((r) => r.patientId === patId)
        if (match) {
          updatePatientRecord(doctorId, patId, {
            latestAlert: alert,
            recoveryScore: newScore,
            // append log to doctor's view (keep last 10)
            symptomLogs: [log, ...(match.symptomLogs || [])].slice(0, 10),
          })
        }
      })
    }
  }

  const handleSubmit = () => submitWithSymptoms({})

  const reset = () => {
    setSymptoms(defaultSymptoms)
    setResult(null)
    setSubmitted(false)
  }

  if (submitted && result) {
    return (
      <div className="p-5 space-y-5">
        <h2 className="text-2xl font-bold text-white">Symptom Result</h2>
        <AlertBadge level={result.level} message={result.message} advice={result.advice} large />

        {result.level === 'critical' && (
          <a href="tel:911" className="btn-primary flex items-center justify-center gap-2 text-center" style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>
            📞 Call Emergency Now
          </a>
        )}
        {result.level === 'warning' && (
          <div className="card-warning">
            <p className="text-amber-300 font-medium">Your caregiver has been notified.</p>
          </div>
        )}

        <button className="btn-secondary" onClick={reset}>Log Again</button>

        {/* History */}
        {symptomLogs.length > 1 && (
          <div>
            <p className="text-sm font-semibold text-white/40 mb-2">PREVIOUS LOGS</p>
            <div className="space-y-2">
              {symptomLogs.slice(1, 6).map((log) => (
                <div key={log.id} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-white/40">Pain: {log.symptoms.painLevel}/10 · {log.symptoms.temperature}°C</p>
                  </div>
                  <span className={`badge ${
                    log.alert?.level === 'critical' ? 'badge-critical' :
                    log.alert?.level === 'warning'  ? 'badge-warning'  :
                    'badge-normal'
                  }`}>
                    {log.alert?.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-5 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Log Symptoms</h2>
        <p className="text-white/50 text-sm mt-1">How are you feeling today?</p>
      </div>

      {/* ── Voice Input ───────────────────────────── */}
      <VoiceVitalsForm
        onSave={(payload) => {
          const p = payload.parsedVoice
          // Build a COMPLETE symptom override from voice — no stale state
          const voiceSymptoms = {}
          if (payload.painLevel != null)          voiceSymptoms.painLevel          = payload.painLevel
          if (p) {
            if (p.nausea    !== 'none')            voiceSymptoms.nausea             = p.nausea
            if (p.fatigue   !== 'none')            voiceSymptoms.fatigue            = p.fatigue
            if (p.breathingDifficulty !== 'none') voiceSymptoms.breathingDifficulty = p.breathingDifficulty
            if (p.bleeding  !== 'none')            voiceSymptoms.bleeding           = p.bleeding
            if (p.swelling  !== 'none')            voiceSymptoms.swelling           = p.swelling
            if (p.consciousness === 'confused')    voiceSymptoms.consciousness      = 'confused'
            if (p.temperature != null)             voiceSymptoms.temperature        = p.temperature
          }
          // submitWithSymptoms merges over current state synchronously
          submitWithSymptoms(voiceSymptoms)
        }}
      />
      <p className="text-center text-white/30 text-xs tracking-wide">— or fill in manually below —</p>

      {/* Temperature */}
      <div className="card">
        <label className="label flex items-center gap-2">
          <Thermometer size={18} className="text-red-400" /> Body Temperature (°C)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range" min="35" max="42" step="0.1"
            value={symptoms.temperature}
            onChange={(e) => update('temperature', parseFloat(e.target.value))}
            className="flex-1 accent-primary-600"
          />
          <span className={`text-2xl font-bold w-16 text-right ${
            symptoms.temperature >= 39.5 ? 'text-red-600' :
            symptoms.temperature >= 38.5 ? 'text-amber-500' : 'text-green-600'
          }`}>
            {symptoms.temperature.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>35°C</span><span>Normal: 36.5–37.5</span><span>42°C</span>
        </div>
      </div>

      {/* Pain level */}
      <div className="card">
        <label className="label flex items-center gap-2">
          <Activity size={18} className="text-orange-400" /> Pain Level
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range" min="0" max="10" step="1"
            value={symptoms.painLevel}
            onChange={(e) => update('painLevel', parseInt(e.target.value))}
            className="flex-1 accent-primary-600"
          />
          <span className={`text-2xl font-bold w-12 text-right ${
            symptoms.painLevel >= 9 ? 'text-red-600' :
            symptoms.painLevel >= 7 ? 'text-amber-500' : 'text-green-600'
          }`}>
            {symptoms.painLevel}/10
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>No pain</span><span>Moderate</span><span>Worst</span>
        </div>
      </div>

      {/* Fatigue */}
      <div className="card">
        <label className="label flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" /> Fatigue Level
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['none', 'mild', 'moderate', 'extreme'].map((v) => (
            <button key={v} onClick={() => update('fatigue', v)}
              className={`py-3 rounded-xl font-medium capitalize transition-all ${
                symptoms.fatigue === v
                  ? 'text-white'
                  : 'text-white/50'
              }`}
              style={symptoms.fatigue === v
                ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: '1.5px solid transparent' }
                : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
              }>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Breathing */}
      <div className="card">
        <label className="label flex items-center gap-2">
          <Wind size={18} className="text-blue-400" /> Breathing Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['none', 'mild', 'moderate', 'severe'].map((v) => (
            <button key={v} onClick={() => update('breathingDifficulty', v)}
              className={`py-3 rounded-xl font-medium capitalize text-sm transition-all ${
                symptoms.breathingDifficulty === v ? 'text-white' : 'text-white/50'
              }`}
              style={symptoms.breathingDifficulty === v
                ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: '1.5px solid transparent' }
                : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
              }>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Nausea */}
      <div className="card">
        <label className="label flex items-center gap-2">
          <Droplets size={18} className="text-teal-400" /> Nausea / Vomiting
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['none', 'nausea', 'vomiting'].map((v) => (
            <button key={v} onClick={() => update('nausea', v)}
              className={`py-3 rounded-xl font-medium capitalize text-sm transition-all ${
                symptoms.nausea === v ? 'text-white' : 'text-white/50'
              }`}
              style={symptoms.nausea === v
                ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: '1.5px solid transparent' }
                : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
              }>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Swelling */}
      <div className="card">
        <label className="label">Swelling at wound/affected area</label>
        <div className="grid grid-cols-3 gap-2">
          {['none', 'mild', 'significant'].map((v) => (
            <button key={v} onClick={() => update('swelling', v)}
              className={`py-3 rounded-xl font-medium capitalize text-sm transition-all ${
                symptoms.swelling === v ? 'text-white' : 'text-white/50'
              }`}
              style={symptoms.swelling === v
                ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: '1.5px solid transparent' }
                : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
              }>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Bleeding */}
      <div className="card">
        <label className="label">Bleeding</label>
        <div className="grid grid-cols-3 gap-2">
          {['none', 'minor', 'heavy'].map((v) => (
            <button key={v} onClick={() => update('bleeding', v)}
              className={`py-3 rounded-xl font-medium capitalize text-sm transition-all ${
                symptoms.bleeding === v ? 'text-white' : 'text-white/50'
              }`}
              style={symptoms.bleeding === v
                ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: '1.5px solid transparent' }
                : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
              }>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Consciousness */}
      <div className="card">
        <label className="label flex items-center gap-2">
          <Brain size={18} className="text-purple-400" /> Mental State
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['normal', 'confused'].map((v) => (
            <button key={v} onClick={() => update('consciousness', v)}
              className={`py-3 rounded-xl font-medium capitalize transition-all ${
                symptoms.consciousness === v ? 'text-white' : 'text-white/50'
              }`}
              style={symptoms.consciousness === v
                ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: '1.5px solid transparent' }
                : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }
              }>
              {v === 'normal' ? '😊 Normal' : '😵 Confused'}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit}>
        Analyze My Symptoms →
      </button>
    </div>
  )
}
