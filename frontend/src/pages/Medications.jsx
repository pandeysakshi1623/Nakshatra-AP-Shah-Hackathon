import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import { Plus, Trash2, CheckCircle2, XCircle, Bell, Clock } from 'lucide-react'

const TIME_OPTIONS = [
  { value: 'morning', label: '🌅 Morning' },
  { value: 'afternoon', label: '☀️ Afternoon' },
  { value: 'evening', label: '🌙 Evening' },
  { value: 'both', label: '🌅🌙 Morning & Evening' },
  { value: 'as-needed', label: '⏰ As Needed' },
]

export default function Medications() {
  const { medications, addMedication, deleteMedication, markMedicationTaken, markMedicationMissed, patient } = useStore()
  const { addCaregiverAlert } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', time: 'morning', notes: '' })

  const update = (f, v) => setForm((s) => ({ ...s, [f]: v }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    addMedication(form)
    setForm({ name: '', dosage: '', time: 'morning', notes: '' })
    setShowForm(false)
  }

  const handleMissed = (med) => {
    markMedicationMissed(med.id)
    // Notify caregiver when a med is skipped
    addCaregiverAlert({
      type: 'missed_med',
      message: `💊 ${patient?.name || 'Patient'} skipped "${med.name}" (${med.dosage || med.time}).`,
      patientName: patient?.name || 'Unknown',
      patientId: patient?.patientId || patient?.id,
    })
  }

  const takenCount = medications.filter((m) => m.takenToday).length
  const totalCount = medications.length

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Medications</h2>
          <p className="text-white/50 text-sm mt-1">Track your daily medicines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary !w-auto !py-2 !px-4 !text-sm flex items-center gap-2"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-white/80">Today's Progress</span>
            <span className="text-white/50">{takenCount}/{totalCount} taken</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: totalCount ? `${(takenCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          {takenCount === totalCount && totalCount > 0 && (
            <p className="text-green-400 text-sm font-medium mt-2">✅ All medications taken today!</p>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card space-y-4" style={{ border: '1.5px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.06)' }}>
          <p className="font-bold gradient-text">Add Medication</p>
          <div>
            <label className="label">Medicine Name</label>
            <input className="input-field" placeholder="e.g. Amoxicillin" value={form.name}
              onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Dosage</label>
            <input className="input-field" placeholder="e.g. 500mg, 1 tablet" value={form.dosage}
              onChange={(e) => update('dosage', e.target.value)} />
          </div>
          <div>
            <label className="label">When to take</label>
            <select className="input-field" value={form.time} onChange={(e) => update('time', e.target.value)}>
              {TIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input-field" placeholder="e.g. Take with food" value={form.notes}
              onChange={(e) => update('notes', e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleAdd}>Save Medication</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Medication list */}
      {medications.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No medications added yet</p>
          <p className="text-sm mt-1">Tap "Add" to add your first medication</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className={`card transition-all ${
              med.takenToday
                ? 'border-green-500/30'
                : ''
            }`} style={med.takenToday ? { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' } : {}}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💊</span>
                    <div>
                      <p className={`font-bold text-lg ${med.takenToday ? 'text-green-400' : 'text-white'}`}>
                        {med.name}
                      </p>
                      {med.dosage && <p className="text-white/50 text-sm">{med.dosage}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={14} className="text-white/30" />
                    <span className="text-sm text-white/50">
                      {TIME_OPTIONS.find((o) => o.value === med.time)?.label || med.time}
                    </span>
                    {med.notes && (
                      <span className="text-xs text-white/40 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        {med.notes}
                      </span>
                    )}
                  </div>
                  {med.missedCount >= 2 && (
                    <p className="text-amber-400 text-xs mt-1 font-medium">
                      ⚠️ Missed {med.missedCount} times recently
                    </p>
                  )}
                  {med.lastTaken && (
                    <p className="text-white/30 text-xs mt-1">
                      Last taken: {new Date(med.lastTaken).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <button onClick={() => deleteMedication(med.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Action buttons */}
              {!med.takenToday ? (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => markMedicationTaken(med.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all active:scale-95"
                  >
                    <CheckCircle2 size={18} /> Taken
                  </button>
                  <button
                    onClick={() => handleMissed(med)}
                    className="flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all active:scale-95 text-white/60 hover:text-white/80"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <XCircle size={18} /> Skip
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle2 size={18} />
                  <span>Taken today</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
