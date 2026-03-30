import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { api } from '../lib/api'
import { Users, ArrowLeft, Eye, EyeOff, Search } from 'lucide-react'

export default function CaregiverAuth() {
  const navigate = useNavigate()
  const { loginUser, setRole, authUser } = useAuthStore()

  const [step, setStep]         = useState('login')   // 'login' | 'connect'
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [patientIdInput, setPatientIdInput] = useState('')
  const [foundPatient, setFoundPatient]     = useState(null)
  const [searchError, setSearchError]       = useState('')
  const [searching, setSearching]           = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const update = (f, v) => setForm((s) => ({ ...s, [f]: v }))

  // ── Step 1: Login ──────────────────────────────────────────────────────────
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
      // Login OK — now ask for patient ID to monitor
      setStep('connect')
    } catch {
      setError('Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Find patient by ID ─────────────────────────────────────────────
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
        setSearchError(`No patient found with ID "${id}". Ask the patient to share their ID from their home screen.`)
      }
    } finally {
      setSearching(false)
    }
  }

  // ── Step 2: Confirm connect → go to dashboard ──────────────────────────────
  const handleConnect = () => {
    if (!foundPatient) return
    // Store the connected patient ID in authStore so dashboard can use it
    useAuthStore.getState().setCaregiverPatientId(foundPatient.patientId)
    setRole('caregiver')
    navigate('/caregiver')
  }

  // ── Offline fallback ───────────────────────────────────────────────────────
  const handleOffline = () => {
    setRole('caregiver')
    navigate('/caregiver')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-amber-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/role')} className="text-white/70 flex items-center gap-2 mb-6 hover:text-white transition-colors">
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

          {/* ── STEP 1: Login ─────────────────────────────────────────────── */}
          {step === 'login' && (
            <>
              <div>
                <p className="text-lg font-bold text-slate-800 mb-1">Caregiver Login</p>
                <p className="text-slate-500 text-sm">Use the same email & password you registered with</p>
              </div>

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
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                  {error.includes('Backend') && (
                    <p className="text-red-400 text-xs mt-1">
                      Run <code className="bg-red-100 px-1 rounded">cd backend && npm start</code>
                    </p>
                  )}
                </div>
              )}

              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95"
                onClick={handleLogin} disabled={loading}>
                {loading ? 'Please wait...' : 'Log In →'}
              </button>

              <div className="border-t border-slate-100 pt-3 text-center space-y-2">
                <p className="text-slate-400 text-xs">Backend offline? Use same-device view:</p>
                <button onClick={handleOffline}
                  className="text-amber-600 font-medium text-sm hover:bg-amber-50 w-full py-2 rounded-xl transition-colors">
                  Continue without login →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Enter Patient ID ───────────────────────────────────── */}
          {step === 'connect' && (
            <>
              <div>
                <p className="text-lg font-bold text-slate-800 mb-1">Enter Patient ID</p>
                <p className="text-slate-500 text-sm">Ask the patient to share their ID from their home screen</p>
              </div>

              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="e.g. RE-AB3C-1X2Y"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={searching}
                  className="bg-amber-500 text-white px-4 rounded-xl font-semibold active:scale-95 transition-all">
                  <Search size={18} />
                </button>
              </div>

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{searchError}</p>
                </div>
              )}

              {foundPatient && (
                <div className="card bg-amber-50 border-amber-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{foundPatient.name}</p>
                      <p className="text-slate-500 text-xs">{foundPatient.patientId} · {foundPatient.conditionType}</p>
                    </div>
                  </div>
                  <button onClick={handleConnect}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all active:scale-95">
                    View Patient Dashboard →
                  </button>
                </div>
              )}

              <button onClick={handleOffline}
                className="w-full text-slate-500 text-sm py-2 hover:bg-slate-50 rounded-xl transition-colors">
                Skip — view same-device patient →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
