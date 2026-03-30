import { useStore } from '../store/useStore'
import AlertBadge from '../components/AlertBadge'
import RecoveryScoreRing from '../components/RecoveryScoreRing'
import { generateInsights, INSIGHT_CONFIG } from '../lib/aiInsightEngine'
import { useAuthStore } from '../lib/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { User, Phone, Calendar, TrendingUp, Pill, PenLine, ArrowLeft, Bell, BellOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CaregiverDashboard() {
  const navigate = useNavigate()
  const { patient, symptomLogs, latestAlert, recoveryScore, recoveryPlan, medications, notes } = useStore()
  const { caregiverAlerts, markCaregiverAlertRead, clearCaregiverAlerts } = useAuthStore()
  const insights = generateInsights(patient, symptomLogs, medications, notes)

  const unreadAlerts = caregiverAlerts.filter((a) => !a.read)

  if (!patient) {
    return (
      <div className="p-5 text-center mt-20 space-y-4">
        <div className="text-6xl mb-4">👨‍⚕️</div>
        <h2 className="text-xl font-bold text-slate-700">Caregiver Dashboard</h2>
        <p className="text-slate-500">
          No patient data found on this device.
        </p>
        <p className="text-slate-400 text-sm">
          The patient must set up their profile on this device first, or you can view their data by sharing the same device.
        </p>
        <button
          onClick={() => navigate('/role')}
          className="flex items-center gap-2 mx-auto text-amber-600 font-semibold mt-4"
        >
          <ArrowLeft size={16} /> Back to Role Selection
        </button>
      </div>
    )
  }

  // Build chart data from last 7 logs (reversed for chronological order)
  const chartData = [...symptomLogs].reverse().slice(-7).map((log, i) => ({
    day: `Day ${i + 1}`,
    pain: log.symptoms.painLevel,
    temp: parseFloat(log.symptoms.temperature),
  }))

  const completedTasks = recoveryPlan?.tasks?.filter((t) => t.completed).length || 0
  const totalTasks = recoveryPlan?.tasks?.length || 0

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Caregiver Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Remote patient monitoring</p>
      </div>

      {/* ── Caregiver Alerts (missed meds + SOS) ─────────────────────────── */}
      {caregiverAlerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-red-600 flex items-center gap-1">
              <Bell size={14} />
              ALERTS
              {unreadAlerts.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                  {unreadAlerts.length}
                </span>
              )}
            </p>
            <button onClick={clearCaregiverAlerts}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <BellOff size={12} /> Clear all
            </button>
          </div>
          <div className="space-y-2">
            {caregiverAlerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                onClick={() => markCaregiverAlertRead(alert.id)}
                className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                  alert.type === 'sos'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-amber-50 border-amber-200'
                } ${alert.read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${
                    alert.type === 'sos' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {alert.message}
                  </p>
                  {!alert.read && (
                    <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${
                      alert.type === 'sos' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(alert.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient info */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={28} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-slate-800">{patient.name}</p>
            <p className="text-slate-500 text-sm">Age {patient.age} · {recoveryPlan?.conditionLabel}</p>
            <p className="text-slate-500 text-sm">Recovery Stage {patient.recoveryStage}</p>
          </div>
        </div>
        {patient.caregiverName && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-600">
            <Phone size={16} />
            <span className="text-sm">Caregiver: {patient.caregiverName} · {patient.caregiverPhone}</span>
          </div>
        )}
      </div>

      {/* Alert status */}
      {latestAlert ? (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">CURRENT STATUS</p>
          <AlertBadge level={latestAlert.level} message={latestAlert.message} advice={latestAlert.advice} large />
        </div>
      ) : (
        <div className="card text-center text-slate-500">
          <p>No symptoms logged yet.</p>
        </div>
      )}

      {/* Recovery score + task progress */}
      <div className="card flex items-center gap-6">
        <RecoveryScoreRing score={recoveryScore} />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm text-slate-500">Task Completion</p>
            <p className="text-lg font-bold text-slate-700">{completedTasks}/{totalTasks} tasks</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
              <div
                className="bg-primary-500 h-2 rounded-full"
                style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Logs</p>
            <p className="text-lg font-bold text-slate-700">{symptomLogs.length} entries</p>
          </div>
        </div>
      </div>

      {/* AI Insights for caregiver */}
      {insights.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">🤖 AI INSIGHTS</p>
          <div className="space-y-2">
            {insights.map((insight, i) => {
              const cfg = INSIGHT_CONFIG[insight.type]
              return (
                <div key={i} className={`rounded-2xl border-2 p-4 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{insight.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${cfg.text}`}>{insight.title}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{insight.reason}</p>
                      <p className={`text-xs font-medium mt-1 ${cfg.text}`}>→ {insight.action}</p>
                    </div>
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
          <p className="text-sm font-semibold text-slate-500 mb-2">💊 MEDICATION STATUS</p>
          <div className="space-y-2">
            {medications.map((med) => (
              <div key={med.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💊</span>
                  <div>
                    <p className="font-medium text-slate-700">{med.name}</p>
                    <p className="text-slate-400 text-xs">{med.dosage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    med.takenToday ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {med.takenToday ? '✓ Taken' : 'Pending'}
                  </span>
                  {med.missedCount >= 2 && (
                    <p className="text-amber-500 text-xs mt-1">⚠️ Missed {med.missedCount}x</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent notes */}
      {notes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <PenLine size={14} /> PATIENT NOTES
          </p>
          <div className="space-y-2">
            {notes.slice(0, 5).map((note) => (
              <div key={note.id} className="card">
                <p className="text-slate-700 text-sm">{note.text}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend chart */}
      {chartData.length > 1 && (
        <div className="card">
          <p className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" /> Symptom Trends
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="pain" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Pain (0-10)" />
              <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Pain level</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Temperature</span>
          </div>
        </div>
      )}

      {/* Recent symptom logs */}
      {symptomLogs.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">SYMPTOM HISTORY</p>
          <div className="space-y-2">
            {symptomLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(log.loggedAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    log.alert?.level === 'critical' ? 'bg-red-100 text-red-600' :
                    log.alert?.level === 'warning'  ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {log.alert?.level}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-xs">Pain</p>
                    <p className="font-bold text-slate-700">{log.symptoms.painLevel}/10</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-xs">Temp</p>
                    <p className="font-bold text-slate-700">{log.symptoms.temperature}°C</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-xs">Fatigue</p>
                    <p className="font-bold text-slate-700 capitalize">{log.symptoms.fatigue}</p>
                  </div>
                </div>
                {log.alert?.level !== 'normal' && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2">{log.alert?.advice}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
