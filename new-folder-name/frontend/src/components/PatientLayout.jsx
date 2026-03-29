import { Outlet, NavLink } from 'react-router-dom'
import { Home, ClipboardList, Activity, Users, MoreHorizontal } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
      {/* Top bar */}
      <header className="bg-primary-600 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">RecoverEase</h1>
          {patient?.patientId && (
            <p className="text-primary-200 text-xs font-mono">{patient.patientId}</p>
          )}
        </div>
        {latestAlert && (
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
            latestAlert.level === 'critical' ? 'bg-red-500' :
            latestAlert.level === 'warning'  ? 'bg-amber-400 text-amber-900' :
            'bg-green-400 text-green-900'
          }`}>
            {latestAlert.level === 'critical' ? '🚨 Critical' :
             latestAlert.level === 'warning'  ? '⚠️ Warning' : '✅ Normal'}
          </div>
        )}
      </header>

      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-bold text-slate-400 px-2 mb-3">MORE FEATURES</p>
            {moreNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
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

      {/* SOS button — patient only */}
      <SOSButton />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex z-30">
        {primaryNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-slate-400'
              }`
            }
          >
            <Icon size={22} />
            <span className="mt-1">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
            showMore ? 'text-primary-600' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal size={22} />
          <span className="mt-1">More</span>
        </button>
      </nav>
    </div>
  )
}
