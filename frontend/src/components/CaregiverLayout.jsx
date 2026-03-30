import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { Users, LogOut } from 'lucide-react'

export default function CaregiverLayout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

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
            <p className="text-amber-100 text-xs">Caregiver View</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-white/70 hover:text-white transition-colors p-2"
          aria-label="Switch role"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Page content — no bottom nav, no SOS */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
