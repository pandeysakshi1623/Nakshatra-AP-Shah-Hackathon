import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { Users, LogOut, Bell, Heart } from 'lucide-react'

export default function CaregiverLayout() {
  const navigate = useNavigate()
  const { logout, authUser, caregiverAlerts } = useAuthStore()
  const unreadCount = (caregiverAlerts || []).filter((a) => !a.read).length

  const handleLogout = () => { logout(); navigate('/role') }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'linear-gradient(180deg,#080c14 0%,#0f1624 100%)' }}>
      <header className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ea580c)' }}>
            <Users size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ background: 'linear-gradient(135deg,#fbbf24,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RecoverEase
            </h1>
            <p className="text-amber-400/50 text-[10px]">
              {authUser?.name ? `${authUser.name} · ` : ''}Caregiver View
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="relative">
              <Bell size={20} className="text-amber-400/70" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
          <button onClick={handleLogout}
            className="text-white/25 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/10">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
