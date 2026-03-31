import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import { generateRecoveryPlan } from '../lib/recoveryEngine'
import { CONDITIONS } from '../lib/recoveryEngine'
import { generatePatientId } from '../lib/patientId'
import { api } from '../lib/api'
import { ChevronRight, Heart, Copy, Check } from 'lucide-react'

export default function Onboarding() {
  const navigate = useNavigate()
  const { setPatient, setRecoveryPlan, setRecoveryScore } = useStore()
  const { setRole, authUser } = useAuthStore()
  const [step, setStep] = useState(0)
  const [copied, setCopied] = useState(false)
  // Use patientId from auth signup if available, otherwise generate one
  const [generatedId] = useState(() => authUser?.patientId || generatePatientId())
  const [form, setForm] = useState({
    name: authUser?.name || '',
    age: '', conditionType: 'general', recoveryStage: '1',
    caregiverName: '', caregiverPhone: '', dietaryPref: 'both',
  })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const copyId = () => {
    navigator.clipboard.writeText(generatedId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const finish = async () => {
    const patient = {
      ...form,
      id: generatedId,
      patientId: generatedId,
      email: authUser?.email,
      joinedAt: new Date().toISOString(),
    }
    const plan = generateRecoveryPlan(patient)
    setPatient(patient)
    setRecoveryPlan(plan)
    setRecoveryScore(50)
    setRole('patient')

    // Persist to backend so doctors can find this patient by ID
    try {
      await api.savePatient(patient)
    } catch (e) {
      // Backend offline — data stays in localStorage, that's fine for hackathon
      console.warn('[onboarding] backend save failed, continuing offline:', e.message)
    }

    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Welcome */}
        {step === 0 && (
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">RecoverEase</h1>
            <p className="text-primary-100 text-lg mb-2">Your Smart Recovery Assistant</p>
            <p className="text-primary-200 text-base mb-10">
              We'll help you recover safely after leaving the hospital with a personalized plan, symptom tracking, and caregiver alerts.
            </p>
            <button className="bg-white text-primary-600 font-bold py-4 px-8 rounded-2xl text-xl w-full active:scale-95 transition-all" onClick={() => setStep(1)}>
              Get Started →
            </button>
          </div>
        )}

        {/* Profile */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Profile</h2>
            <p className="text-slate-500 mb-6">Tell us a little about yourself</p>
            <div className="space-y-4">
              <div>
                <label className="label-light">Your Full Name</label>
                <input className="input-field-light" placeholder="e.g. John Smith" value={form.name}
                  onChange={(e) => update('name', e.target.value)} />
              </div>
              <div>
                <label className="label-light">Your Age</label>
                <input className="input-field-light" type="number" placeholder="e.g. 65" value={form.age}
                  onChange={(e) => update('age', e.target.value)} />
              </div>
              <div>
                <label className="label-light">Recovery Stage</label>
                <select className="input-field-light" value={form.recoveryStage}
                  onChange={(e) => update('recoveryStage', e.target.value)}>
                  <option value="1">Stage 1 — Just discharged (0–3 days)</option>
                  <option value="2">Stage 2 — Early recovery (4–14 days)</option>
                  <option value="3">Stage 3 — Getting better (2–6 weeks)</option>
                </select>
              </div>
            </div>
            <button className="btn-primary mt-6" onClick={() => setStep(2)} disabled={!form.name || !form.age}>
              Continue <ChevronRight className="inline" size={20} />
            </button>
          </div>
        )}

        {/* Condition */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Condition</h2>
            <p className="text-slate-500 mb-6">Select what you're recovering from</p>
            <div className="space-y-3">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update('conditionType', c.value)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-lg font-medium transition-all ${
                    form.conditionType === c.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button className="btn-primary mt-6" onClick={() => setStep(3)}>
              Continue <ChevronRight className="inline" size={20} />
            </button>
          </div>
        )}

        {/* Caregiver */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Caregiver Info</h2>
            <p className="text-slate-500 mb-6">Who should be notified if something's wrong? (optional)</p>
            <div className="space-y-4">
              <div>
                <label className="label-light">Caregiver Name</label>
                <input className="input-field-light" placeholder="e.g. Mary Smith" value={form.caregiverName}
                  onChange={(e) => update('caregiverName', e.target.value)} />
              </div>
              <div>
                <label className="label-light">Caregiver Phone</label>
                <input className="input-field-light" type="tel" placeholder="e.g. +1 555 0100" value={form.caregiverPhone}
                  onChange={(e) => update('caregiverPhone', e.target.value)} />
              </div>
              <div>
                <label className="label-light">Dietary Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'veg', label: '🥦 Vegetarian' },
                    { value: 'nonveg', label: '🍗 Non-Veg' },
                    { value: 'both', label: '🍽️ Both' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => update('dietaryPref', opt.value)}
                      className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        form.dietaryPref === opt.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-primary mt-6" onClick={() => setStep(4)}>
              Continue <ChevronRight className="inline" size={20} />
            </button>
            <button className="btn-secondary mt-3" onClick={() => setStep(4)}>
              Skip for now
            </button>
          </div>
        )}

        {/* Patient ID */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Patient ID</h2>
            <p className="text-slate-500 mb-6">Share this ID with your doctor to connect your records.</p>
            <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-5 text-center mb-4">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Your Unique ID</p>
              <p className="text-3xl font-bold text-primary-700 tracking-widest">{generatedId}</p>
            </div>
            <button onClick={copyId}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all mb-4">
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-amber-700 text-sm">⚠️ Save this ID. Your doctor will use it to access your health records.</p>
            </div>
            <button className="btn-primary" onClick={finish}>
              Start My Recovery 🎉
            </button>
          </div>
        )}

        {/* Step dots */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {[1,2,3,4].map((s) => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
