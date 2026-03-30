import { useStore } from '../store/useStore'
import { CheckCircle2, Circle, ShieldAlert } from 'lucide-react'

export default function RecoveryPlan() {
  const { recoveryPlan, setRecoveryPlan, patient } = useStore()

  if (!recoveryPlan) return (
    <div className="p-5 text-center text-slate-500 mt-20">No recovery plan found.</div>
  )

  const toggleTask = (id) => {
    const updated = {
      ...recoveryPlan,
      tasks: recoveryPlan.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }
    setRecoveryPlan(updated)
  }

  const completedCount = recoveryPlan.tasks.filter((t) => t.completed).length

  return (
    <div className="p-5 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Recovery Plan</h2>
        <p className="text-slate-500 text-sm mt-1">{recoveryPlan.conditionLabel} · Stage {patient?.recoveryStage}</p>
      </div>

      {/* Stage note */}
      <div className="card bg-primary-50 border-primary-100">
        <p className="text-primary-700 font-medium">📋 {recoveryPlan.stageNote}</p>
      </div>

      {/* Daily tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-slate-700 text-lg">Today's Tasks</p>
          <span className="text-sm text-slate-500">{completedCount}/{recoveryPlan.tasks.length} done</span>
        </div>
        <div className="space-y-3">
          {recoveryPlan.tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full card flex items-center gap-4 text-left transition-all active:scale-95 ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              {task.completed
                ? <CheckCircle2 size={28} className="text-green-500 shrink-0" />
                : <Circle size={28} className="text-slate-300 shrink-0" />
              }
              <div className="flex-1">
                <p className={`font-medium text-base ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.icon} {task.task}
                </p>
                <p className="text-slate-400 text-sm">{task.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Medicines */}
      <div>
        <p className="font-bold text-slate-700 text-lg mb-3">💊 Medications</p>
        <div className="space-y-3">
          {recoveryPlan.medicines.map((med, i) => (
            <div key={i} className="card flex items-center gap-4">
              <span className="text-3xl">{med.icon}</span>
              <div>
                <p className="font-semibold text-slate-700">{med.name}</p>
                <p className="text-slate-500 text-sm">{med.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Precautions */}
      <div>
        <p className="font-bold text-slate-700 text-lg mb-3 flex items-center gap-2">
          <ShieldAlert size={20} className="text-amber-500" /> Precautions
        </p>
        <div className="space-y-2">
          {recoveryPlan.precautions.map((p, i) => (
            <div key={i} className="card flex items-start gap-3">
              <span className="text-amber-500 font-bold text-lg mt-0.5">!</span>
              <p className="text-slate-700">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
