import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { api } from '../lib/api'
import { Users, ArrowLeft, Eye, EyeOff, Search } from 'lucide-react'

export default function CaregiverAuth() {
  const navigate = useNavigate()
  const { loginUser, signup, setRole } = useAuthStore()

  // step: 'login' | 'signup' | 'connect'
  const [step, setStep]     = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  // Patient search
  const [patientIdInput, setPatientIdInput] = useState('')
  const [foundPatient, setFoundPatient]     = useState(null)
  const [searchError, setSearchError]       = useState('')
  const [searching, setSearching]           = useState(false)

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const update = (f, v) => setForm((s) => ({ ...s, [f]: v }))

  // ── Step 1a: Login ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError('')
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      const result = await loginUser(form.email, form.password)
      if (!result.success) {
        setError(result.error)
        return
      }
      // Force role to caregiver — backend might return 'patient'
      setRole('caregiver')
      setStep('connect')
    } catch {
      setError('Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 1b: Signup ────────────────────────────────────────────────────────
  const handleSignup = async () => {
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.')
      return
    }
    setLoading(true)
    try {
      const result = await signup(form.name, form.email, form.password, 'caregiver')
      if (!result.success) {
        setError(result.error)
        return
      }
      setRole('caregiver')
      setStep('connect')
    } catch {
      setError('Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Search patient by ID ───────────────────────────────────────────
  const handleSearch = async () => {
    setSearchError('')
    setFoundPatient(null)
    const id = patientIdInput.toUpperCase().trim()
    if (!id) { setSearchError('Please enter a Patient ID.'); return }

    setSearching(true)
    try {
      const patient = await api.searchPatient(id)
      setFoundPatient(patient)
    } catch (err) {
      if (err.message === 'BACKEND_OFFLINE') {
        setSearchError('Backend is offline. Ask the patient to share their device.')
      } else {
        setSearchError(`No patient found with ID "${id}". Ask the patient for their ID from their home screen.`)
      }
    } finally {
      setSearching(false)
    }
  }

  // ── Step 2: Confirm → go to dashboard ─────────────────────────────────────
  const handleConnect = () => {
    if (!foundPatient) return
    useAuthStore.getState().setCaregiverPatientId(foundPatient.patientId)
    setRole('caregiver')
    navigate('/caregiver')
  }

  // ── Offline fallback: set dummy authUser so guard passes ──────────────────
  const handleOffline = () => {
    // Directly mutate state so the App.jsx guard (authUser && role==='caregiver') passes
    useAuthStore.setState({
      role: 'caregiver',
      authUser: { id: 'offline', name: 'Caregiver (Offline)', email: '' },
    })
    navigate('/caregiver')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-amber-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/role')}
          className="text-white/70 flex items-center gap-2 mb-6 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center text-white mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">Caregiver Portal</h1>
          <p className="text-amber-100 mt-1">RecoverEase</p>
        </div>

        <div className="bg-white rounded-3xl p-6 space-y-4">

          {/* ── STEP 1: Login / Signup tabs ─────────────────────────────────── */}
          {(step === 'login' || step === 'signup') && (
            <>
              {/* Tab switcher */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => { setStep('login'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    step === 'login'
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setStep('signup'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    step === 'signup'
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  {step === 'login'
                    ? 'Use the same email & password you registered with'
                    : 'Create a new caregiver account'}
                </p>
              </div>

              {/* Name — signup only */}
              {step === 'signup' && (
                <div>
                  <label className="label-light">Full Name</label>
                  <input
                    className="input-field-light"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="label-light">Email Address</label>
                <input
                  className="input-field-light"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>

              <div>
                <label className="label-light">Password</label>
                <div className="relative">
                  <input
                    className="input-field-light pr-12"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (step === 'login' ? handleLogin() : handleSignup())
                    }
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                  {error.includes('Backend') && (
                    <p className="text-red-400 text-xs mt-1">
                      Run <code className="bg-red-100 px-1 rounded">cd backend &amp;&amp; npm start</code>
                    </p>
                  )}
                </div>
              )}

              <button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95"
                onClick={step === 'login' ? handleLogin : handleSignup}
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : step === 'login'
                  ? 'Log In \u2192'
                  : 'Create Account \u2192'}
              </button>

              <div className="border-t border-slate-100 pt-3 text-center space-y-2">
                <p className="text-slate-400 text-xs">Backend offline? Use same-device view:</p>
                <button
                  onClick={handleOffline}
                  className="text-amber-600 font-medium text-sm hover:bg-amber-50 w-full py-2 rounded-xl transition-colors"
                >
                  Continue without login \u2192
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Enter Patient ID ─────────────────────────────────────── */}
          {step === 'connect' && (
            <>
              <div>
                <p className="text-lg font-bold text-slate-800 mb-1">Connect to Patient</p>
                <p className="text-slate-500 text-sm">
                  Enter the Patient ID shown on the patient's home screen
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  className="input-field-light flex-1"
                  placeholder="e.g. RE-AB3C-1X2Y"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="bg-amber-500 text-white px-4 rounded-xl font-semibold active:scale-95 transition-all"
                >
                  <Search size={18} />
                </button>
              </div>

              {searching && (
                <p className="text-slate-400 text-sm text-center animate-pulse">
                  Searching...
                </p>
              )}

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{searchError}</p>
                </div>
              )}

              {foundPatient && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{foundPatient.name}</p>
                      <p className="text-slate-500 text-xs">
                        {foundPatient.patientId} &middot; {foundPatient.conditionType}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all active:scale-95"
                  >
                    View Patient Dashboard \u2192
                  </button>
                </div>
              )}

              <button
                onClick={handleOffline}
                className="w-full text-slate-500 text-sm py-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Skip \u2014 view same-device patient \u2192
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
