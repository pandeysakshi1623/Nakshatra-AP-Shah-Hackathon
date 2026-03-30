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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/role')} className="text-white/70 flex items-center gap-2 mb-6 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center text-white mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">Patient Portal</h1>
          <p className="text-primary-100 mt-1">RecoverEase</p>
        </div>

        <div className="bg-white rounded-3xl p-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === 'login' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === 'signup' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Name — signup only */}
          {mode === 'signup' && (
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" placeholder="e.g. John Smith"
                value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <input className="input-field" type="email" placeholder="you@email.com"
              value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>

          {/* Password */}
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
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
              {error.includes('Backend') && (
                <p className="text-red-400 text-xs mt-1">
                  Run <code className="bg-red-100 px-1 rounded">cd backend && npm start</code> to enable accounts.
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Account →'
              : 'Log In →'}
          </button>

          {/* Offline fallback */}
          <div className={`rounded-2xl p-4 text-center space-y-2 ${
            error?.includes('Backend')
              ? 'bg-primary-50 border-2 border-primary-200'
              : 'border-t border-slate-100 pt-3'
          }`}>
            <p className="text-slate-500 text-xs">
              {error?.includes('Backend')
                ? '👇 Use this to continue without a backend:'
                : 'No backend? Use quick setup:'}
            </p>
            <button
              onClick={() => { setRole('patient'); navigate('/onboarding') }}
              className={`w-full font-semibold text-sm py-3 rounded-xl transition-colors ${
                error?.includes('Backend')
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              Continue without account →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
