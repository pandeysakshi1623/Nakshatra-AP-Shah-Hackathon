import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Trash2, CheckCircle2, XCircle, Bell, Clock } from 'lucide-react'

const TIME_OPTIONS = [
  { value: 'morning', label: '🌅 Morning' },
  { value: 'afternoon', label: '☀️ Afternoon' },
  { value: 'evening', label: '🌙 Evening' },
  { value: 'both', label: '🌅🌙 Morning & Evening' },
  { value: 'as-needed', label: '⏰ As Needed' },
]

export default function Medications() {
  const { medications, addMedication, deleteMedication, markMedicationTaken, markMedicationMissed } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', time: 'morning', notes: '' })

  const update = (f, v) => setForm((s) => ({ ...s, [f]: v }))

  const handleAdd = () => {
    if (!form.name.trim()) return
    addMedication(form)
    setForm({ name: '', dosage: '', time: 'morning', notes: '' })
    setShowForm(false)
  }

  const takenCount = medications.filter((m) => m.takenToday).length
  const totalCount = medications.length

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Medications</h2>
          <p className="text-slate-500 text-sm mt-1">Track your daily medicines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white rounded-2xl px-4 py-2 flex items-center gap-2 font-semibold text-sm active:scale-95 transition-all"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Today's Progress</span>
            <span className="text-slate-500">{takenCount}/{totalCount} taken</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: totalCount ? `${(takenCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          {takenCount === totalCount && totalCount > 0 && (
            <p className="text-green-600 text-sm font-medium mt-2">✅ All medications taken today!</p>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card border-2 border-primary-200 bg-primary-50 space-y-4">
          <p className="font-bold text-primary-700">Add Medication</p>
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
        <div className="text-center py-12 text-slate-400">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No medications added yet</p>
          <p className="text-sm mt-1">Tap "Add" to add your first medication</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className={`card border-2 transition-all ${
              med.takenToday ? 'border-green-200 bg-green-50' : 'border-slate-100'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💊</span>
                    <div>
                      <p className={`font-bold text-lg ${med.takenToday ? 'text-green-700' : 'text-slate-800'}`}>
                        {med.name}
                      </p>
                      {med.dosage && <p className="text-slate-500 text-sm">{med.dosage}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {TIME_OPTIONS.find((o) => o.value === med.time)?.label || med.time}
                    </span>
                    {med.notes && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {med.notes}
                      </span>
                    )}
                  </div>
                  {med.missedCount >= 2 && (
                    <p className="text-amber-600 text-xs mt-1 font-medium">
                      ⚠️ Missed {med.missedCount} times recently
                    </p>
                  )}
                  {med.lastTaken && (
                    <p className="text-slate-400 text-xs mt-1">
                      Last taken: {new Date(med.lastTaken).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <button onClick={() => deleteMedication(med.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
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
                    onClick={() => markMedicationMissed(med.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl transition-all active:scale-95"
                  >
                    <XCircle size={18} /> Skip
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-green-600 font-medium">
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
