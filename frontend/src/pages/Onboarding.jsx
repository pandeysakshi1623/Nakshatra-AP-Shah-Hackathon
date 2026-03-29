import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { generateRecoveryPlan } from '../lib/recoveryEngine'
import { CONDITIONS } from '../lib/recoveryEngine'
import { ChevronRight, Heart } from 'lucide-react'

const STEPS = ['welcome', 'profile', 'condition', 'caregiver']

export default function Onboarding() {
  const navigate = useNavigate()
  const { setPatient, setRecoveryPlan, setRecoveryScore } = useStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', age: '', conditionType: 'general', recoveryStage: '1',
    caregiverName: '', caregiverPhone: '',
  })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const finish = () => {
    const patient = { ...form, id: Date.now().toString(), joinedAt: new Date().toISOString() }
    const plan = generateRecoveryPlan(patient)
    setPatient(patient)
    setRecoveryPlan(plan)
    setRecoveryScore(50)
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
                <label className="label">Your Full Name</label>
                <input className="input-field" placeholder="e.g. John Smith" value={form.name}
                  onChange={(e) => update('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Your Age</label>
                <input className="input-field" type="number" placeholder="e.g. 65" value={form.age}
                  onChange={(e) => update('age', e.target.value)} />
              </div>
              <div>
                <label className="label">Recovery Stage</label>
                <select className="input-field" value={form.recoveryStage}
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
                <label className="label">Caregiver Name</label>
                <input className="input-field" placeholder="e.g. Mary Smith" value={form.caregiverName}
                  onChange={(e) => update('caregiverName', e.target.value)} />
              </div>
              <div>
                <label className="label">Caregiver Phone</label>
                <input className="input-field" type="tel" placeholder="e.g. +1 555 0100" value={form.caregiverPhone}
                  onChange={(e) => update('caregiverPhone', e.target.value)} />
              </div>
            </div>
            <button className="btn-primary mt-6" onClick={finish}>
              Start My Recovery 🎉
            </button>
            <button className="btn-secondary mt-3" onClick={finish}>
              Skip for now
            </button>
          </div>
        )}

        {/* Step dots */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {[1,2,3].map((s) => (
              <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
