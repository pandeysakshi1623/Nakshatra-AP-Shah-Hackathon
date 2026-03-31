import { useStore } from '../store/useStore'
import RecoveryScoreRing from '../components/RecoveryScoreRing'
import { generateInsights, INSIGHT_CONFIG } from '../lib/aiInsightEngine'
import { useAuthStore } from '../lib/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { User, Phone, Calendar, TrendingUp, Pill, PenLine, ArrowLeft, Bell, BellOff, Zap, AlertOctagon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CaregiverDashboard() {
  const navigate = useNavigate()
  const { patient, symptomLogs, latestAlert, recoveryScore, recoveryPlan, medications, notes } = useStore()
  const { caregiverAlerts, markCaregiverAlertRead, clearCaregiverAlerts } = useAuthStore()
  const insights = generateInsights(patient, symptomLogs, medications, notes)
  const unreadAlerts = caregiverAlerts.filter((a) => !a.read)

  if (!patient) {
    return (
      <div className="p-6 text-center mt-20 space-y-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <User size={36} className="text-amber-400/60" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">No Patient Connected</h2>
          <p className="text-white/40 text-sm mt-2 max-w-xs mx-auto">
            No patient data found. The patient must be on the same device, or enter a valid Patient ID.
          </p>
        </div>
        <button onClick={() => navigate('/caregiver/auth')}
          className="flex items-center gap-2 mx-auto text-amber-400 font-semibold text-sm px-4 py-2 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <ArrowLeft size={16} /> Connect a Patient
        </button>
      </div>
    )
  }

  const chartData = [...symptomLogs].reverse().slice(-7).map((log, i) => ({
    day: `D${i + 1}`,
    pain: log.symptoms.painLevel,
    temp: parseFloat(log.symptoms.temperature),
  }))

  const completedTasks = recoveryPlan?.tasks?.filter((t) => t.completed).length || 0
  const totalTasks = recoveryPlan?.tasks?.length || 0

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Caregiver <span style={{ background: 'linear-gradient(135deg,#fbbf24,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span></h2>
        <p className="text-white/35 text-sm mt-0.5">Remote patient monitoring · Live</p>
      </div>

      {/* ── ALERTS ──────────────────────────────────────────────────────────── */}
      {caregiverAlerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon size={16} className="text-red-400" />
              <p className="text-sm font-black text-red-400 tracking-wide uppercase">Alerts</p>
              {unreadAlerts.length > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
                  {unreadAlerts.length} new
                </span>
              )}
            </div>
            <button onClick={clearCaregiverAlerts}
              className="text-xs text-white/25 hover:text-white/60 flex items-center gap-1 transition-colors">
              <BellOff size={12} /> Clear
            </button>
          </div>
          <div className="space-y-2">
            {caregiverAlerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                onClick={() => markCaregiverAlertRead(alert.id)}
                className={`rounded-2xl p-4 cursor-pointer transition-all ${alert.read ? 'opacity-40' : ''}`}
                style={alert.type === 'sos' ? {
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  boxShadow: alert.read ? 'none' : '0 0 20px rgba(239,68,68,0.15)',
                } : {
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  boxShadow: alert.read ? 'none' : '0 0 15px rgba(245,158,11,0.1)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${alert.type === 'sos' ? 'text-red-400' : 'text-amber-400'}`}>
                    {alert.message}
                  </p>
                  {!alert.read && (
                    <span className={`shrink-0 w-2 h-2 rounded-full mt-1 animate-pulse ${alert.type === 'sos' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  )}
                </div>
                <p className="text-xs text-white/30 mt-1">
                  {new Date(alert.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient info */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
          <User size={26} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xl font-black text-white">{patient.name}</p>
          <p className="text-white/40 text-sm">Age {patient.age} · {recoveryPlan?.conditionLabel}</p>
          <p className="text-white/30 text-xs mt-0.5">Recovery Stage {patient.recoveryStage}</p>
        </div>
      </div>

      {/* Score + progress */}
      <div className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}>
        <RecoveryScoreRing score={recoveryScore} />
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/40">Task Progress</span>
              <span className="text-white/60 font-bold">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-white/8 rounded-full h-2">
              <div className="h-2 rounded-full transition-all"
                style={{ width: totalTasks ? `${(completedTasks/totalTasks)*100}%` : '0%', background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
            </div>
          </div>
          <div>
            <p className="text-white/40 text-xs">Symptom Logs</p>
            <p className="text-white font-bold">{symptomLogs.length} entries</p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-yellow-400" />
            <p className="text-xs font-bold text-white/35 uppercase tracking-widest">AI Insights</p>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => {
              const isDanger = insight.type === 'critical'
              const isWarn = insight.type === 'warning'
              return (
                <div key={i}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={isDanger ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }
                    : isWarn ? { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl">{insight.icon}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isDanger ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-primary-400'}`}>{insight.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{insight.reason}</p>
                    <p className={`text-xs font-semibold mt-1 ${isDanger ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-primary-400'}`}>→ {insight.action}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Medication status */}
      {medications.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pill size={14} className="text-violet-400" />
            <p className="text-xs font-bold text-white/35 uppercase tracking-widest">Medication Status</p>
          </div>
          <div className="space-y-2">
            {medications.map((med) => (
              <div key={med.id}
                className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">💊</span>
                  <div>
                    <p className="font-semibold text-white/85 text-sm">{med.name}</p>
                    <p className="text-white/35 text-xs">{med.dosage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    med.takenToday
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-white/30 bg-white/5 border border-white/8'
                  }`}>
                    {med.takenToday ? '✓ Taken' : 'Pending'}
                  </span>
                  {med.missedCount >= 2 && (
                    <p className="text-amber-400 text-[10px] mt-1">⚠️ Missed {med.missedCount}×</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend chart */}
      {chartData.length > 1 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="font-bold text-white/70 mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-primary-400" /> Symptom Trends
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }} />
              <Line type="monotone" dataKey="pain" stroke="#f87171" strokeWidth={2.5} dot={{ fill: '#f87171', r: 4 }} name="Pain (0-10)" />
              <Line type="monotone" dataKey="temp" stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: '#60a5fa', r: 4 }} name="Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3 justify-center text-xs text-white/35">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" /> Pain</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> Temp</span>
          </div>
        </div>
      )}

      {/* Recent symptom logs */}
      {symptomLogs.length > 0 && (
        <div>
          <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-3">Symptom History</p>
          <div className="space-y-2">
            {symptomLogs.slice(0, 8).map((log) => (
              <div key={log.id}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(log.loggedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className={
                    log.alert?.level === 'critical' ? 'badge-critical' :
                    log.alert?.level === 'warning' ? 'badge-warning' : 'badge-normal'
                  }>{log.alert?.level}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {[
                    { label: 'Pain', val: `${log.symptoms.painLevel}/10` },
                    { label: 'Temp', val: `${log.symptoms.temperature}°C` },
                    { label: 'Fatigue', val: log.symptoms.fatigue },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-white/30 text-[10px]">{label}</p>
                      <p className="font-bold text-white/75 text-xs capitalize">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
