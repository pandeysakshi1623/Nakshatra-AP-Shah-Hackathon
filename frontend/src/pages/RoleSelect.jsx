import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { Heart, Stethoscope, Users, Sparkles, Shield, Activity } from 'lucide-react'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setRole } = useAuthStore()

  const handleRole = (role) => {
    setRole(role)
    if (role === 'doctor') navigate('/doctor/login')
    else if (role === 'caregiver') navigate('/caregiver/auth')
    else navigate('/patient/auth')
  }

  const roles = [
    {
      role: 'patient',
      icon: Heart,
      label: 'Patient',
      desc: 'Track recovery, log symptoms & manage medications',
      gradient: 'from-rose-500/20 to-pink-600/10',
      border: 'border-rose-500/30',
      glow: 'rgba(244,63,94,0.3)',
      iconBg: 'from-rose-500 to-pink-600',
      badge: '🏥 Recovery Mode',
    },
    {
      role: 'caregiver',
      icon: Users,
      label: 'Caregiver',
      desc: 'Monitor patient status & receive real-time alerts',
      gradient: 'from-amber-500/20 to-orange-600/10',
      border: 'border-amber-500/30',
      glow: 'rgba(245,158,11,0.3)',
      iconBg: 'from-amber-400 to-orange-500',
      badge: '🛡️ Care Guardian',
    },
    {
      role: 'doctor',
      icon: Stethoscope,
      label: 'Doctor',
      desc: 'Manage patients, add reports & prescriptions',
      gradient: 'from-emerald-500/20 to-teal-600/10',
      border: 'border-emerald-500/30',
      glow: 'rgba(16,185,129,0.3)',
      iconBg: 'from-emerald-400 to-teal-500',
      badge: '⚕️ Medical Staff',
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite reverse' }} />
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', boxShadow: '0 0 40px rgba(14,165,233,0.5)' }}>
              <Heart size={36} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles size={18} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-black gradient-text mb-1">RecoverEase</h1>
          <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Smart Recovery Companion</p>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { icon: Activity, label: 'AI-Powered', color: 'text-primary-400' },
              { icon: Shield, label: 'Secure', color: 'text-emerald-400' },
              { icon: Users, label: 'Connected Care', color: 'text-violet-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={13} className={color} />
                <span className="text-white/40 text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role cards */}
        <p className="text-white/30 text-xs font-bold tracking-widest uppercase text-center mb-4">I am a...</p>
        <div className="space-y-3">
          {roles.map(({ role, icon: Icon, label, desc, gradient, border, glow, iconBg, badge }) => (
            <button
              key={role}
              onClick={() => handleRole(role)}
              className={`w-full bg-gradient-to-r ${gradient} border ${border} rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] text-left group`}
              style={{ backdropFilter: 'blur(12px)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${glow}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={26} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-lg font-bold text-white">{label}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/10">{badge}</span>
                </div>
                <p className="text-white/45 text-sm leading-snug">{desc}</p>
              </div>
              <div className="text-white/20 group-hover:text-white/60 transition-colors shrink-0">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="text-white/20 text-center text-xs mt-8">
          Demo: Doctor → sarah@hospital.com / doctor123
        </p>
      </div>
    </div>
  )
}
