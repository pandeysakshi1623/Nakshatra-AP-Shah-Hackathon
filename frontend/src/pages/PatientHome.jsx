import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import RecoveryScoreRing from '../components/RecoveryScoreRing'
import AlertBadge from '../components/AlertBadge'
import { ClipboardList, Activity, Bell, LogOut } from 'lucide-react'

export default function PatientHome() {
  const navigate = useNavigate()
  const { patient, recoveryPlan, symptomLogs, latestAlert, recoveryScore, reset } = useStore()

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const completedTasks = recoveryPlan?.tasks?.filter((t) => t.completed).length || 0
  const totalTasks = recoveryPlan?.tasks?.length || 0

  return (
    <div className="p-5 space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{today}</p>
          <h2 className="text-2xl font-bold text-slate-800">Hi, {patient?.name?.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">{recoveryPlan?.conditionLabel} · Stage {patient?.recoveryStage}</p>
        </div>
        <button onClick={reset} className="text-slate-400 hover:text-red-400 transition-colors p-2">
          <LogOut size={20} />
        </button>
      </div>

      {/* Recovery score */}
      <div className="card flex items-center gap-6">
        <RecoveryScoreRing score={recoveryScore} />
        <div className="flex-1">
          <p className="font-semibold text-slate-700 text-lg">
            {recoveryScore >= 70 ? 'Recovering Well' : recoveryScore >= 40 ? 'Needs Attention' : 'Seek Help'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {recoveryScore >= 70
              ? 'Keep up the great work!'
              : recoveryScore >= 40
              ? 'Monitor your symptoms closely.'
              : 'Please contact your doctor.'}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Today's tasks</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Latest alert */}
      {latestAlert && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">LATEST STATUS</p>
          <AlertBadge level={latestAlert.level} message={latestAlert.message} advice={latestAlert.advice} />
        </div>
      )}

      {/* Stage note */}
      {recoveryPlan?.stageNote && (
        <div className="card bg-primary-50 border-primary-100">
          <p className="text-primary-700 font-medium text-sm">📋 {recoveryPlan.stageNote}</p>
        </div>
      )}

      {/* Quick actions */}
      <p className="text-sm font-semibold text-slate-500">QUICK ACTIONS</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/symptoms')}
          className="card flex flex-col items-center gap-2 py-6 hover:border-primary-300 transition-colors active:scale-95">
          <Activity size={32} className="text-primary-600" />
          <span className="font-semibold text-slate-700">Log Symptoms</span>
        </button>
        <button onClick={() => navigate('/plan')}
          className="card flex flex-col items-center gap-2 py-6 hover:border-primary-300 transition-colors active:scale-95">
          <ClipboardList size={32} className="text-primary-600" />
          <span className="font-semibold text-slate-700">My Plan</span>
        </button>
      </div>

      {/* Recent logs */}
      {symptomLogs.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">RECENT LOGS</p>
          <div className="space-y-2">
            {symptomLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 text-sm">
                    {new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-slate-500 text-xs">Pain: {log.symptoms.painLevel}/10 · Temp: {log.symptoms.temperature}°C</p>
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

      {/* Medication reminder */}
      {recoveryPlan?.medicines?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">💊 MEDICATION REMINDERS</p>
          <div className="space-y-2">
            {recoveryPlan.medicines.map((med, i) => (
              <div key={i} className="card flex items-center gap-3">
                <span className="text-2xl">{med.icon}</span>
                <div>
                  <p className="font-medium text-slate-700">{med.name}</p>
                  <p className="text-slate-500 text-sm">{med.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
