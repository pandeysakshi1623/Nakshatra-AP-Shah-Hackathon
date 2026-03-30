import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { Users, LogOut, Bell } from 'lucide-react'

export default function CaregiverLayout() {
  const navigate  = useNavigate()
  const { logout, authUser, caregiverAlerts } = useAuthStore()

  const unreadCount = (caregiverAlerts || []).filter((a) => !a.read).length

  const handleLogout = () => {
    logout()
    navigate('/role')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
      {/* Caregiver-specific header */}
      <header className="bg-amber-500 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold">RecoverEase</h1>
            <p className="text-amber-100 text-xs">
              {authUser?.name ? `${authUser.name} · ` : ''}Caregiver View
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alert badge */}
          {unreadCount > 0 && (
            <div className="relative">
              <Bell size={20} className="text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white transition-colors p-2"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Page content — no bottom nav, no SOS */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

