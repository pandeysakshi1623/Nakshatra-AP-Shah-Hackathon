import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import RecoveryScoreRing from '../components/RecoveryScoreRing'
import AlertBadge from '../components/AlertBadge'
import { generateInsights, INSIGHT_CONFIG } from '../lib/aiInsightEngine'
import { Activity, ClipboardList, CalendarDays, Utensils, Pill, PenLine, LogOut, ChevronRight, FileText, Copy, Check, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'

export default function PatientHome() {
  const navigate = useNavigate()
  const { patient, recoveryPlan, symptomLogs, latestAlert, recoveryScore, medications, notes, reset } = useStore()
  const { logout } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const completedTasks = recoveryPlan?.tasks?.filter((t) => t.completed).length || 0
  const totalTasks = recoveryPlan?.tasks?.length || 0
  const takenMeds = medications.filter((m) => m.takenToday).length
  const totalMeds = medications.length
  const insights = generateInsights(patient, symptomLogs, medications, notes)

  const copyId = () => {
    const id = patient?.patientId || patient?.id
    navigator.clipboard.writeText(id || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => { reset(); logout(); navigate('/role') }

  const quickActions = [
    { to: '/symptoms',      icon: Activity,      label: 'Log\nSymptoms',   grad: 'from-rose-500 to-pink-600',     glow: 'rgba(244,63,94,0.35)' },
    { to: '/medications',   icon: Pill,          label: 'Medications',     grad: 'from-violet-500 to-purple-600',  glow: 'rgba(139,92,246,0.35)' },
    { to: '/daily',         icon: CalendarDays,  label: 'Daily\nPlan',     grad: 'from-blue-500 to-indigo-600',    glow: 'rgba(59,130,246,0.35)' },
    { to: '/meals',         icon: Utensils,      label: 'Meals &\nExercise',grad: 'from-emerald-500 to-teal-600',  glow: 'rgba(16,185,129,0.35)' },
    { to: '/plan',          icon: ClipboardList, label: 'My\nPlan',        grad: 'from-primary-500 to-cyan-600',   glow: 'rgba(14,165,233,0.35)' },
    { to: '/doctor-reports',icon: FileText,      label: 'Doctor\nUpdates', grad: 'from-amber-500 to-orange-600',   glow: 'rgba(245,158,11,0.35)' },
  ]

  const scoreStatus = recoveryScore >= 70 ? { label: 'Recovering Well', color: 'text-emerald-400', dot: 'bg-emerald-400' }
    : recoveryScore >= 40 ? { label: 'Needs Attention', color: 'text-amber-400', dot: 'bg-amber-400' }
    : { label: 'Seek Medical Help', color: 'text-red-400', dot: 'bg-red-400' }

  return (
    <div className="p-5 space-y-5 pb-2">
      {/* Hero greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/35 text-xs font-medium">{today}</p>
          <h2 className="text-2xl font-black text-white mt-0.5">
            Hi, <span className="gradient-text">{patient?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-white/40 text-sm mt-0.5">{recoveryPlan?.conditionLabel} · Stage {patient?.recoveryStage}</p>
        </div>
        <button onClick={handleLogout} className="text-white/20 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/10">
          <LogOut size={18} />
        </button>
      </div>

      {/* Patient ID banner */}
      {(patient?.patientId || patient?.id) && (
        <button onClick={copyId}
          className="w-full flex items-center justify-between rounded-2xl px-5 py-3.5 active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.08))', border: '1px solid rgba(14,165,233,0.25)' }}>
          <div>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Your Patient ID</p>
            <p className="text-white font-bold font-mono tracking-wider text-sm mt-0.5">{patient?.patientId || patient?.id}</p>
            <p className="text-white/30 text-[10px] mt-0.5">Tap to copy · Share with caregiver</p>
          </div>
          {copied
            ? <Check size={16} className="text-emerald-400" />
            : <Copy size={16} className="text-white/30" />}
        </button>
      )}

      {/* Recovery score + stats */}
      <div className="card-glow">
        <div className="flex items-center gap-5">
          <RecoveryScoreRing score={recoveryScore} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full animate-pulse ${scoreStatus.dot}`} />
                <p className={`font-bold text-sm ${scoreStatus.color}`}>{scoreStatus.label}</p>
              </div>
            </div>
            {/* Tasks bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">Tasks</span>
                <span className="text-white/60 font-medium">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="w-full bg-white/8 rounded-full h-2">
                <div className="h-2 rounded-full transition-all"
                  style={{ width: totalTasks ? `${(completedTasks/totalTasks)*100}%` : '0%', background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
              </div>
            </div>
            {/* Meds bar */}
            {totalMeds > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">Meds</span>
                  <span className="text-white/60 font-medium">{takenMeds}/{totalMeds}</span>
                </div>
                <div className="w-full bg-white/8 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${totalMeds > 0 ? (takenMeds/totalMeds)*100 : 0}%`, background: 'linear-gradient(90deg,#8b5cf6,#ec4899)' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest alert */}
      {latestAlert && (
        <AlertBadge level={latestAlert.level} message={latestAlert.message} advice={latestAlert.advice} />
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-yellow-400" />
            <p className="text-xs font-bold text-white/40 tracking-widest uppercase">AI Insights</p>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => {
              const cfg = INSIGHT_CONFIG[insight.type]
              const isDanger = insight.type === 'critical'
              const isWarn = insight.type === 'warning'
              return (
                <div key={i} className={`rounded-2xl p-4 flex items-start gap-3 ${isDanger ? 'card-danger' : isWarn ? 'card-warning' : 'card'}`}>
                  <span className="text-xl">{insight.icon}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isDanger ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-primary-400'}`}>{insight.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{insight.reason}</p>
                    <p className={`text-xs font-semibold mt-1.5 ${isDanger ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-primary-400'}`}>→ {insight.action}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-primary-400" />
          <p className="text-xs font-bold text-white/40 tracking-widest uppercase">Quick Actions</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ to, icon: Icon, label, grad, glow }) => (
            <button key={to} onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2.5 py-4 rounded-2xl transition-all active:scale-95 group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${glow}`; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="font-semibold text-white/60 text-[10px] text-center leading-tight whitespace-pre-line group-hover:text-white/90 transition-colors">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stage note */}
      {recoveryPlan?.stageNote && (
        <div className="card" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
          <p className="text-primary-300 text-sm font-medium">📋 {recoveryPlan.stageNote}</p>
        </div>
      )}

      {/* Medication quick strip */}
      {totalMeds > 0 && (
        <button onClick={() => navigate('/medications')}
          className="w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
              <Pill size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-sm">Medications</p>
              <p className="text-white/40 text-xs">{takenMeds}/{totalMeds} taken today</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/25" />
        </button>
      )}

      {/* Recent logs */}
      {symptomLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-white/40 tracking-widest uppercase">Recent Logs</p>
            <button onClick={() => navigate('/symptoms')} className="text-xs text-primary-400 font-semibold flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {symptomLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white/80 text-sm">
                    {new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-white/35 text-xs">Pain: {log.symptoms.painLevel}/10 · {log.symptoms.temperature}°C</p>
                </div>
                <span className={
                  log.alert?.level === 'critical' ? 'badge-critical' :
                  log.alert?.level === 'warning' ? 'badge-warning' : 'badge-normal'
                }>
                  {log.alert?.level || 'normal'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOS hint */}
      <div className="card-danger flex items-center gap-3">
        <span className="text-2xl">🆘</span>
        <div>
          <p className="font-bold text-red-400 text-sm">Emergency SOS</p>
          <p className="text-red-400/60 text-xs">Hold the red button (bottom-right) 3 seconds</p>
        </div>
      </div>
    </div>
  )
}
