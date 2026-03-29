import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, ClipboardList, Activity, Users } from 'lucide-react'
import { useStore } from '../store/useStore'

const navItems = [
  { to: '/home',     icon: Home,          label: 'Home' },
  { to: '/plan',     icon: ClipboardList, label: 'My Plan' },
  { to: '/symptoms', icon: Activity,      label: 'Symptoms' },
  { to: '/caregiver',icon: Users,         label: 'Caregiver' },
]

export default function Layout() {
  const { latestAlert } = useStore()

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
      {/* Top bar */}
      <header className="bg-primary-600 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">RecoverEase</h1>
          <p className="text-primary-100 text-xs">Smart Recovery Assistant</p>
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

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex">
        {navItems.map(({ to, icon: Icon, label }) => (
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
      </nav>
    </div>
  )
}
