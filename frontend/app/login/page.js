'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Stethoscope, User, ArrowRight, Shield, Activity } from 'lucide-react';

const DEMO_USERS = [
  {
    name: 'Dr. Sarah Kapoor',
    email: 'sarah.kapoor@recoverai.com',
    role: 'CAREGIVER',
    description: 'Senior Care Coordinator',
    icon: Stethoscope,
    color: '#14b8a6',
    bgGradient: 'from-teal-500/20 to-teal-600/5',
    borderColor: 'border-teal-500/40',
    badgeColor: 'bg-teal-500/20 text-teal-300',
    badge: 'Caregiver',
  },
  {
    name: 'Rahul Mehta',
    email: 'rahul.mehta@recoverai.com',
    role: 'PATIENT',
    description: 'Post-discharge Recovery · Room 204',
    icon: User,
    color: '#3b82f6',
    bgGradient: 'from-blue-500/20 to-blue-600/5',
    borderColor: 'border-blue-500/40',
    badgeColor: 'bg-blue-500/20 text-blue-300',
    badge: 'Patient',
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@recoverai.com',
    role: 'PATIENT',
    description: 'Post-discharge Recovery · Room 211',
    icon: User,
    color: '#8b5cf6',
    bgGradient: 'from-violet-500/20 to-violet-600/5',
    borderColor: 'border-violet-500/40',
    badgeColor: 'bg-violet-500/20 text-violet-300',
    badge: 'Patient',
  },
  {
    name: 'Arjun Nair',
    email: 'arjun.nair@recoverai.com',
    role: 'PATIENT',
    description: 'Post-discharge Recovery · Room 308',
    icon: User,
    color: '#f59e0b',
    bgGradient: 'from-amber-500/20 to-amber-600/5',
    borderColor: 'border-amber-500/40',
    badgeColor: 'bg-amber-500/20 text-amber-300',
    badge: 'Patient',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (demoUser) => {
    setLoading(demoUser.email);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoUser.email }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Login failed. Is the backend running?');
        setLoading(null);
        return;
      }

      // Store user in sessionStorage for use in other pages
      sessionStorage.setItem('recoverai_user', JSON.stringify(data.user));

      if (data.user.role === 'CAREGIVER') {
        router.push('/dashboard');
      } else {
        router.push('/patient');
      }
    } catch {
      setError('Cannot connect to backend. Make sure the server is running on port 5000.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, #0a0e1a 60%)' }}>

      {/* Logo & Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">RecoverAI</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-400 text-center max-w-sm">
          Select your profile to continue to your personalized care portal.
        </p>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/50">
        <Shield className="w-4 h-4 text-teal-400" />
        <span className="text-xs text-slate-400">Demo Environment — No password required</span>
      </div>

      {/* User Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DEMO_USERS.map((user) => {
          const Icon = user.icon;
          const isLoading = loading === user.email;
          return (
            <button
              key={user.email}
              id={`login-card-${user.email.split('.')[0]}`}
              onClick={() => handleLogin(user)}
              disabled={loading !== null}
              className={`relative group text-left p-5 rounded-2xl border bg-gradient-to-br ${user.bgGradient} ${user.borderColor} 
                         transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              style={{ background: `linear-gradient(135deg, rgba(${hexToRgb(user.color)}, 0.12) 0%, #111827 100%)` }}
            >
              {/* Card border glow on hover */}
              <div className={`absolute inset-0 rounded-2xl border ${user.borderColor} opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `rgba(${hexToRgb(user.color)}, 0.2)`, border: `1px solid rgba(${hexToRgb(user.color)}, 0.3)` }}>
                  {isLoading
                    ? <Activity className="w-5 h-5 animate-pulse" style={{ color: user.color }} />
                    : <Icon className="w-5 h-5" style={{ color: user.color }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white truncate">{user.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 truncate">{user.description}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.badgeColor}`}>
                    {user.badge}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
              </div>
              {isLoading && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse rounded-full w-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div id="login-error" className="mt-6 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-2xl w-full text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Footer */}
      <p className="mt-10 text-xs text-slate-600">
        RecoverAI Prototype · HC-01 · AP Shah Hackathon 2026
      </p>
    </div>
  );
}

// Helper to convert hex to rgb for inline styles
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
}
