import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { useStore } from '../store/useStore'
import { api } from '../lib/api'
import { generateRecoveryPlan } from '../lib/recoveryEngine'
import { Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function PatientAuth() {
  const navigate = useNavigate()
  const { signup, loginUser, setRole } = useAuthStore()
  const { patient, setPatient, setRecoveryPlan, setRecoveryScore } = useStore()

  const [mode, setMode] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const update = (f, v) => setForm((s) => ({ ...s, [f]: v }))

  // After a successful login, try to restore the patient profile from DB.
  // Returns true if profile was found and restored, false if onboarding needed.
  const restorePatientProfile = async (user) => {
    // Already have profile in localStorage (same device)
    if (patient) return true

    // Try fetching from backend using patientId from the auth user
    if (user?.patientId) {
      try {
        const profileFromDB = await api.getPatient(user.patientId)
        if (profileFromDB && profileFromDB.name) {
          // Restore profile + generate a recovery plan from it
          const plan = generateRecoveryPlan(profileFromDB)
          setPatient(profileFromDB)
          setRecoveryPlan(plan)
          setRecoveryScore(50)
          return true
        }
      } catch {
        // Patient profile not in DB yet — needs onboarding
      }
    }

    return false
  }

  const handleSubmit = async () => {
    setError('')

    // ── Validation ──────────────────────────────────────────────────────────
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }
    if (mode === 'signup' && !form.name) {
      setError('Name is required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      let result

      if (mode === 'signup') {
        result = await signup(form.name, form.email, form.password, 'patient')
      } else {
        result = await loginUser(form.email, form.password)
      }

      // ── Auth failed ─────────────────────────────────────────────────────
      if (!result.success) {
        setError(result.error)
        return
      }

      // ── Auth succeeded ──────────────────────────────────────────────────
      const loggedInUser = result.user

      if (mode === 'login') {
        // Try to restore existing patient profile from DB
        const hasProfile = await restorePatientProfile(loggedInUser)
        if (hasProfile) {
          navigate('/home')
        } else {
          // First time logging in — profile not set up yet
          setRole('patient')
          navigate('/onboarding')
        }
      } else {
        // Signup always goes to onboarding (new account, no profile yet)
        setRole('patient')
        navigate('/onboarding')
      }
    } catch {
      setError('Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        <button onClick={() => navigate('/role')}
          className="text-white/40 flex items-center gap-2 mb-6 hover:text-white/80 transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', boxShadow: '0 0 30px rgba(14,165,233,0.4)' }}>
            <Heart size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-black gradient-text">Patient Portal</h1>
          <p className="text-white/30 text-sm mt-1">RecoverEase</p>
        </div>

        <div className="rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>

          <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {['login', 'signup'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${mode === m ? 'text-white' : 'text-white/35'}`}
                style={mode === m ? { background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', boxShadow: '0 2px 12px rgba(14,165,233,0.3)' } : {}}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" placeholder="e.g. John Smith"
                value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
          )}

          <div>
            <label className="label">Email Address</label>
            <input className="input-field" type="email" placeholder="you@email.com"
              value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input-field pr-12"
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-red-400 text-sm font-medium">{error}</p>
              {error.includes('Backend') && (
                <p className="text-red-400/60 text-xs mt-1">
                  Run <code className="bg-white/10 px-1 rounded">cd backend &amp;&amp; npm start</code>
                </p>
              )}
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account \u2192' : 'Log In \u2192'}
          </button>

          <div className="pt-2 text-center space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/25 text-xs">No backend? Continue as guest:</p>
            <button onClick={() => { setRole('patient'); navigate('/onboarding') }}
              className="w-full font-semibold text-sm py-2.5 rounded-xl transition-all text-primary-400 hover:text-primary-300 hover:bg-primary-500/10">
              Continue without account \u2192
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

