import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, DEMO_DOCTORS_LIST } from '../lib/authStore'
import { Stethoscope, ArrowLeft } from 'lucide-react'

export default function DoctorLogin() {
  const navigate = useNavigate()
  const { loginDoctor } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleLogin = () => {
    setError('')
    const result = loginDoctor(form.email, form.password)
    if (result.success) {
      navigate('/doctor')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/role')} className="text-white/70 flex items-center gap-2 mb-6 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <Stethoscope size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Doctor Login</h2>
              <p className="text-slate-500 text-sm">Access your patient dashboard</p>
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <input className="input-field" type="email" placeholder="doctor@hospital.com"
              value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button className="btn-primary bg-green-600 hover:bg-green-700" onClick={handleLogin}>
            Login as Doctor
          </button>

          {/* Demo credentials */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Demo Accounts</p>
            {DEMO_DOCTORS_LIST.map((d) => (
              <button key={d.id} onClick={() => setForm({ email: d.email, password: 'doctor123' })}
                className="w-full text-left text-sm text-slate-600 hover:text-primary-600 transition-colors py-1">
                {d.name} — {d.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
