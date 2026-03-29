import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import RecoveryScoreRing from '../components/RecoveryScoreRing'
import AlertBadge from '../components/AlertBadge'
import { generateInsights, INSIGHT_CONFIG } from '../lib/aiInsightEngine'
import { Activity, ClipboardList, CalendarDays, Utensils, Pill, PenLine, LogOut, ChevronRight, FileText, Copy, Check } from 'lucide-react'
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

  const handleLogout = () => {
    reset()
    logout()
    navigate('/role')
  }

  const quickActions = [
    { to: '/symptoms',     icon: Activity,     label: 'Log Symptoms',    color: 'text-red-500',    bg: 'bg-red-50' },
    { to: '/daily',        icon: CalendarDays, label: 'Daily Plan',      color: 'text-blue-500',   bg: 'bg-blue-50' },
    { to: '/meals',        icon: Utensils,     label: 'Meals',           color: 'text-green-500',  bg: 'bg-green-50' },
    { to: '/medications',  icon: Pill,         label: 'Medications',     color: 'text-purple-500', bg: 'bg-purple-50' },
    { to: '/plan',         icon: ClipboardList,label: 'My Plan',         color: 'text-primary-600',bg: 'bg-primary-50' },
    { to: '/doctor-reports',icon: FileText,    label: 'Doctor Updates',  color: 'text-teal-600',   bg: 'bg-teal-50' },
  ]

  return (
    <div className="p-5 space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{today}</p>
          <h2 className="text-2xl font-bold text-slate-800">Hi, {patient?.name?.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">{recoveryPlan?.conditionLabel} · Stage {patient?.recoveryStage}</p>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors p-2">
          <LogOut size={20} />
        </button>
      </div>

      {/* Patient ID banner */}
      {(patient?.patientId || patient?.id) && (
        <button onClick={copyId} className="card bg-primary-50 border-primary-200 w-full flex items-center justify-between active:scale-95 transition-all">
          <div>
            <p className="text-xs text-primary-500 font-bold uppercase">Your Patient ID</p>
            <p className="text-primary-700 font-bold font-mono tracking-wider">{patient?.patientId || patient?.id}</p>
            <p className="text-primary-400 text-xs">Share with your doctor to connect</p>
          </div>
          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-primary-400" />}
        </button>
      )}

      {/* Recovery score + stats */}
      <div className="card flex items-center gap-5">
        <RecoveryScoreRing score={recoveryScore} />
        <div className="flex-1 space-y-2">
          <p className="font-semibold text-slate-700 text-lg">
            {recoveryScore >= 70 ? 'Recovering Well 🌟' : recoveryScore >= 40 ? 'Needs Attention' : 'Seek Help'}
          </p>
          {/* Tasks progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Tasks</span><span>{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }} />
            </div>
          </div>
          {/* Meds progress */}
          {totalMeds > 0 && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Meds</span><span>{takenMeds}/{totalMeds}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full transition-all"
                  style={{ width: `${(takenMeds / totalMeds) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latest alert */}
      {latestAlert && (
        <AlertBadge level={latestAlert.level} message={latestAlert.message} advice={latestAlert.advice} />
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">🤖 AI INSIGHTS</p>
          <div className="space-y-2">
            {insights.map((insight, i) => {
              const cfg = INSIGHT_CONFIG[insight.type]
              return (
                <div key={i} className={`rounded-2xl border-2 p-4 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div className="flex-1">
                      <p className={`font-bold ${cfg.text}`}>{insight.title}</p>
                      <p className="text-slate-600 text-sm mt-0.5">{insight.reason}</p>
                      <p className={`text-sm font-medium mt-2 ${cfg.text}`}>→ {insight.action}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions grid */}
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-2">QUICK ACTIONS</p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card flex flex-col items-center gap-2 py-4 hover:border-primary-200 transition-all active:scale-95"
            >
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <span className="font-medium text-slate-700 text-xs text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stage note */}
      {recoveryPlan?.stageNote && (
        <div className="card bg-primary-50 border-primary-100">
          <p className="text-primary-700 font-medium text-sm">📋 {recoveryPlan.stageNote}</p>
        </div>
      )}

      {/* Recent logs */}
      {symptomLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-500">RECENT LOGS</p>
            <button onClick={() => navigate('/symptoms')} className="text-xs text-primary-600 font-medium flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {symptomLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 text-sm">
                    {new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-slate-500 text-xs">Pain: {log.symptoms.painLevel}/10 · {log.symptoms.temperature}°C</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  log.alert?.level === 'critical' ? 'bg-red-100 text-red-600' :
                  log.alert?.level === 'warning'  ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {log.alert?.level || 'normal'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOS hint */}
      <div className="card bg-red-50 border-red-200 flex items-center gap-3">
        <span className="text-2xl">🆘</span>
        <div>
          <p className="font-semibold text-red-700 text-sm">Emergency SOS</p>
          <p className="text-red-500 text-xs">Hold the red button (bottom-right) for 3 seconds to trigger SOS</p>
        </div>
      </div>

      {/* Medication quick status */}
      {totalMeds > 0 && (
        <button onClick={() => navigate('/medications')} className="card w-full flex items-center justify-between hover:border-primary-200 transition-colors active:scale-95">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💊</span>
            <div className="text-left">
              <p className="font-semibold text-slate-700">Medications</p>
              <p className="text-slate-500 text-sm">{takenMeds}/{totalMeds} taken today</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      )}
    </div>
  )
}
