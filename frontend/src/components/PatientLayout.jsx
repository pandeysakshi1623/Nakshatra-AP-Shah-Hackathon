import { Outlet, NavLink } from 'react-router-dom'
import { Home, ClipboardList, Activity, Users, MoreHorizontal, Heart } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import SOSButton from './SOSButton'

const primaryNav = [
  { to: '/home',     icon: Home,          label: 'Home' },
  { to: '/plan',     icon: ClipboardList, label: 'Plan' },
  { to: '/symptoms', icon: Activity,      label: 'Symptoms' },
  { to: '/caregiver',icon: Users,         label: 'Caregiver' },
]

const moreNav = [
  { to: '/daily',         label: '📅 Daily Schedule' },
  { to: '/meals',         label: '🥗 Meals & Exercise' },
  { to: '/medications',   label: '💊 Medications' },
  { to: '/notes',         label: '📝 Notes' },
  { to: '/doctor-reports',label: '🩺 Doctor Updates' },
]

export default function PatientLayout() {
  const { latestAlert, patient } = useStore()
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'linear-gradient(180deg, #080c14 0%, #0f1624 100%)' }}>
      {/* Top bar */}
      <header className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            <Heart size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text">RecoverEase</h1>
            {patient?.patientId && (
              <p className="text-white/30 text-[10px] font-mono">{patient.patientId}</p>
            )}
          </div>
        </div>
        {latestAlert && (
          <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            latestAlert.level === 'critical'
              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
              : latestAlert.level === 'warning'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              latestAlert.level === 'critical' ? 'bg-red-400 animate-pulse' :
              latestAlert.level === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            {latestAlert.level === 'critical' ? 'Critical' :
             latestAlert.level === 'warning' ? 'Warning' : 'Normal'}
          </div>
        )}
      </header>

      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md rounded-t-3xl shadow-2xl p-5 space-y-1"
            style={{ background: 'rgba(15,22,36,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4" />
            <p className="text-xs font-bold text-white/25 px-2 mb-3 tracking-widest uppercase">More Features</p>
            {moreNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* SOS button */}
      <SOSButton />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex z-30"
        style={{ background: 'rgba(8,12,20,0.92)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        {primaryNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3.5 text-[10px] font-semibold transition-all ${
                isActive ? 'text-primary-400' : 'text-white/25 hover:text-white/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${isActive ? 'bg-primary-500/15' : ''}`}>
                  <Icon size={20} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex-1 flex flex-col items-center py-3.5 text-[10px] font-semibold transition-all ${
            showMore ? 'text-primary-400' : 'text-white/25 hover:text-white/60'
          }`}
        >
          <div className={`p-1.5 rounded-xl mb-0.5 transition-all ${showMore ? 'bg-primary-500/15' : ''}`}>
            <MoreHorizontal size={20} />
          </div>
          <span>More</span>
        </button>
      </nav>
    </div>
  )
}
