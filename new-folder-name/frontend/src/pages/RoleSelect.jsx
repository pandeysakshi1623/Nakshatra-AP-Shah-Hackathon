import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { useStore } from '../store/useStore'
import { Heart, Stethoscope, Users } from 'lucide-react'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setRole } = useAuthStore()
  const { patient } = useStore()

  const handleRole = (role) => {
    setRole(role)
    if (role === 'doctor') {
      navigate('/doctor/login')
    } else if (role === 'caregiver') {
      navigate('/caregiver')
    } else {
      // Patient: go to auth page (login/signup), then home or onboarding
      navigate('/patient/auth')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-10">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold">RecoverEase</h1>
          <p className="text-primary-100 mt-2 text-lg">Smart Recovery Companion</p>
        </div>

        <div className="space-y-4">
          <p className="text-white/70 text-center text-sm font-medium uppercase tracking-wider mb-2">I am a...</p>

          <button
            onClick={() => handleRole('patient')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-all shadow-lg"
          >
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
              <Heart size={28} className="text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-slate-800">Patient</p>
              <p className="text-slate-500 text-sm">Track my recovery, symptoms & medications</p>
            </div>
          </button>

          <button
            onClick={() => handleRole('caregiver')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-all shadow-lg"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
              <Users size={28} className="text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-slate-800">Caregiver</p>
              <p className="text-slate-500 text-sm">Monitor patient status & receive alerts</p>
            </div>
          </button>

          <button
            onClick={() => handleRole('doctor')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-all shadow-lg"
          >
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
              <Stethoscope size={28} className="text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-slate-800">Doctor</p>
              <p className="text-slate-500 text-sm">Manage patients, add reports & prescriptions</p>
            </div>
          </button>
        </div>

        <p className="text-white/40 text-center text-xs mt-8">
          Demo: Doctor login → email: sarah@hospital.com · password: doctor123
        </p>
      </div>
    </div>
  )
}
