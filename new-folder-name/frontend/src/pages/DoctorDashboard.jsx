import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/authStore'
import { useStore } from '../store/useStore'
import { formatPatientId } from '../lib/patientId'
import { api } from '../lib/api'
import { Stethoscope, Search, Plus, LogOut, AlertTriangle, User, ChevronRight, X, Send } from 'lucide-react'

function PatientCard({ record, onSelect, isCritical }) {
  return (
    <button
      onClick={() => onSelect(record)}
      className={`card w-full text-left flex items-start justify-between gap-3 hover:border-green-300 transition-all active:scale-95 ${
        isCritical ? 'border-red-200 bg-red-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          isCritical ? 'bg-red-100' : 'bg-green-100'
        }`}>
          <User size={22} className={isCritical ? 'text-red-600' : 'text-green-600'} />
        </div>
        <div>
          <p className="font-bold text-slate-800">{record.name}</p>
          <p className="text-slate-500 text-xs">{record.patientId} · {record.conditionLabel}</p>
          <p className="text-slate-400 text-xs">Stage {record.recoveryStage} · Age {record.age}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {isCritical && (
          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">🚨 Critical</span>
        )}
        {record.latestAlert?.level === 'warning' && !isCritical && (
          <span className="text-xs bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full">⚠️ Warning</span>
        )}
        {(!record.latestAlert || record.latestAlert?.level === 'normal') && !isCritical && (
          <span className="text-xs bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">✅ Normal</span>
        )}
        <ChevronRight size={16} className="text-slate-300 mt-1" />
      </div>
    </button>
  )
}

function PatientDetailModal({ record, reports, onClose, onAddReport, doctorId }) {
  const [tab, setTab] = useState('overview')
  const [reportForm, setReportForm] = useState({ type: 'note', content: '' })

  const handleAddReport = () => {
    if (!reportForm.content.trim()) return
    onAddReport(record.patientId, {
      type: reportForm.type,
      content: reportForm.content,
      doctorId,
      doctorName: record.doctorName,
    })
    setReportForm({ type: 'note', content: '' })
  }

  const tabs = ['overview', 'symptoms', 'medications', 'reports']

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-800 text-lg">{record.name}</p>
            <p className="text-slate-500 text-xs">{record.patientId} · {record.conditionLabel}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
                tab === t ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="card text-center">
                  <p className="text-xs text-slate-400">Recovery Score</p>
                  <p className={`text-3xl font-bold mt-1 ${
                    (record.recoveryScore || 0) >= 70 ? 'text-green-600' :
                    (record.recoveryScore || 0) >= 40 ? 'text-amber-500' : 'text-red-600'
                  }`}>{record.recoveryScore || 0}</p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-slate-400">Alert Level</p>
                  <p className="text-2xl mt-1">
                    {record.latestAlert?.level === 'critical' ? '🚨' :
                     record.latestAlert?.level === 'warning'  ? '⚠️' : '✅'}
                  </p>
                  <p className="text-xs font-bold capitalize text-slate-600">{record.latestAlert?.level || 'normal'}</p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-slate-400">Tasks Done</p>
                  <p className="text-xl font-bold text-slate-700 mt-1">
                    {record.completedTasks || 0}/{record.totalTasks || 0}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-slate-400">Meds Taken</p>
                  <p className="text-xl font-bold text-slate-700 mt-1">
                    {record.medsTaken || 0}/{record.totalMeds || 0}
                  </p>
                </div>
              </div>
              {record.latestAlert?.level !== 'normal' && record.latestAlert && (
                <div className={`card border-2 ${
                  record.latestAlert.level === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className="font-bold text-sm text-slate-700">{record.latestAlert.message}</p>
                  <p className="text-slate-500 text-xs mt-1">{record.latestAlert.advice}</p>
                </div>
              )}
              {record.stageNote && (
                <div className="card bg-blue-50 border-blue-100">
                  <p className="text-blue-700 text-sm">📋 {record.stageNote}</p>
                </div>
              )}
            </>
          )}

          {/* SYMPTOMS */}
          {tab === 'symptoms' && (
            <>
              {(record.symptomLogs || []).length === 0 ? (
                <p className="text-center text-slate-400 py-8">No symptom logs yet.</p>
              ) : (
                (record.symptomLogs || []).slice(0, 10).map((log, i) => (
                  <div key={i} className="card">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-slate-500">
                        {new Date(log.loggedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        log.alert?.level === 'critical' ? 'bg-red-100 text-red-600' :
                        log.alert?.level === 'warning'  ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>{log.alert?.level}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-slate-400">Pain</p>
                        <p className="font-bold">{log.symptoms?.painLevel}/10</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-slate-400">Temp</p>
                        <p className="font-bold">{log.symptoms?.temperature}°C</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-slate-400">Fatigue</p>
                        <p className="font-bold capitalize">{log.symptoms?.fatigue}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* MEDICATIONS */}
          {tab === 'medications' && (
            <>
              {(record.medications || []).length === 0 ? (
                <p className="text-center text-slate-400 py-8">No medications added.</p>
              ) : (
                (record.medications || []).map((med, i) => (
                  <div key={i} className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💊</span>
                      <div>
                        <p className="font-medium text-slate-700">{med.name}</p>
                        <p className="text-slate-400 text-xs">{med.dosage} · {med.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        med.takenToday ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {med.takenToday ? '✓ Taken' : 'Pending'}
                      </span>
                      {med.missedCount >= 2 && (
                        <p className="text-amber-500 text-xs mt-0.5">⚠️ Missed {med.missedCount}x</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* REPORTS */}
          {tab === 'reports' && (
            <>
              {/* Add report form */}
              <div className="card space-y-3 border-green-200 bg-green-50">
                <p className="font-bold text-green-700 text-sm">Add Note / Report</p>
                <select className="input-field text-sm" value={reportForm.type}
                  onChange={(e) => setReportForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="note">📝 Clinical Note</option>
                  <option value="prescription">💊 Prescription</option>
                  <option value="recommendation">✅ Recommendation</option>
                  <option value="report">📋 Lab Report</option>
                </select>
                <textarea className="input-field text-sm resize-none" rows={3}
                  placeholder="Enter your note, prescription, or recommendation..."
                  value={reportForm.content}
                  onChange={(e) => setReportForm((f) => ({ ...f, content: e.target.value }))} />
                <button onClick={handleAddReport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Send size={16} /> Submit
                </button>
              </div>

              {/* Existing reports */}
              {reports.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-sm">No reports yet.</p>
              ) : (
                reports.map((r) => (
                  <div key={r.id} className="card">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.type === 'prescription'   ? 'bg-purple-100 text-purple-700' :
                        r.type === 'recommendation' ? 'bg-green-100 text-green-700' :
                        r.type === 'report'         ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {r.type === 'prescription' ? '💊 Prescription' :
                         r.type === 'recommendation' ? '✅ Recommendation' :
                         r.type === 'report' ? '📋 Report' : '📝 Note'}
                      </span>
                      <p className="text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-slate-700 text-sm mt-2">{r.content}</p>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { authUser, logout, doctorPatients, addPatientToDoctor, addDoctorReport, getDoctorReports } = useAuthStore()
  const { patient: currentPatient, symptomLogs, medications, recoveryPlan, recoveryScore, notes } = useStore()

  const [searchId, setSearchId] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showSearch, setShowSearch] = useState(false)

  const myPatients = doctorPatients[authUser?.id] || []
  const criticalPatients = myPatients.filter((p) => p.latestAlert?.level === 'critical')

  const handleSearch = async () => {
    setSearchError('')
    setSearchResult(null)
    const id = formatPatientId(searchId)
    if (!id) { setSearchError('Please enter a Patient ID.'); return }

    // 1. Try backend first (works across devices)
    try {
      const found = await api.searchPatient(id)
      setSearchResult({
        patientId: found.patientId,
        name: found.name,
        age: found.age,
        conditionType: found.conditionType,
        conditionLabel: found.conditionType,
        recoveryStage: found.recoveryStage,
        recoveryScore: 50,
        latestAlert: null,
        symptomLogs: [],
        medications: [],
        completedTasks: 0,
        totalTasks: 0,
        medsTaken: 0,
        totalMeds: 0,
        stageNote: null,
      })
      return
    } catch (backendErr) {
      // Backend not running or patient not found there — fall through to localStorage
    }

    // 2. Fallback: check localStorage (same-device demo mode)
    if (currentPatient && (currentPatient.patientId === id || currentPatient.id === id)) {
      setSearchResult({
        patientId: currentPatient.patientId || currentPatient.id,
        name: currentPatient.name,
        age: currentPatient.age,
        conditionType: currentPatient.conditionType,
        conditionLabel: recoveryPlan?.conditionLabel || currentPatient.conditionType,
        recoveryStage: currentPatient.recoveryStage,
        recoveryScore,
        latestAlert: null,
        symptomLogs: symptomLogs.slice(0, 10),
        medications,
        completedTasks: recoveryPlan?.tasks?.filter((t) => t.completed).length || 0,
        totalTasks: recoveryPlan?.tasks?.length || 0,
        medsTaken: medications.filter((m) => m.takenToday).length,
        totalMeds: medications.length,
        stageNote: recoveryPlan?.stageNote,
      })
    } else {
      setSearchError(
        `No patient found with ID "${id}". ` +
        `Make sure the patient has completed their profile setup.`
      )
    }
  }

  const handleConnect = () => {
    if (!searchResult) return
    addPatientToDoctor(authUser.id, { ...searchResult, doctorName: authUser.name })
    setSearchResult(null)
    setSearchId('')
    setShowSearch(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/role')
  }

  if (!authUser) {
    navigate('/doctor/login')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-green-600 text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="font-bold text-lg">{authUser.name}</p>
              <p className="text-green-100 text-xs">{authUser.specialty}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-white/70 hover:text-white p-2">
            <LogOut size={20} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{myPatients.length}</p>
            <p className="text-green-100 text-xs">Patients</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-300">{criticalPatients.length}</p>
            <p className="text-green-100 text-xs">Critical</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{myPatients.filter((p) => p.latestAlert?.level === 'warning').length}</p>
            <p className="text-green-100 text-xs">Warnings</p>
          </div>
        </div>
      </header>

      <div className="p-5 space-y-5 pb-10">
        {/* Add patient button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Connect New Patient
        </button>

        {/* Search panel */}
        {showSearch && (
          <div className="card border-green-200 bg-green-50 space-y-3">
            <p className="font-bold text-green-700">Search by Patient ID</p>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 text-sm"
                placeholder="e.g. RE-ABCD-1X2Y"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}
                className="bg-green-600 text-white px-4 rounded-xl flex items-center gap-1 font-semibold active:scale-95">
                <Search size={16} />
              </button>
            </div>
            {searchError && <p className="text-red-600 text-sm">{searchError}</p>}
            {searchResult && (
              <div className="card bg-white space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{searchResult.name}</p>
                    <p className="text-slate-500 text-xs">{searchResult.patientId} · {searchResult.conditionLabel}</p>
                  </div>
                </div>
                <button onClick={handleConnect}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95">
                  <Plus size={16} /> Connect Patient
                </button>
              </div>
            )}
          </div>
        )}

        {/* Critical patients */}
        {criticalPatients.length > 0 && (
          <div>
            <p className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1">
              <AlertTriangle size={14} /> CRITICAL PATIENTS
            </p>
            <div className="space-y-2">
              {criticalPatients.map((p) => (
                <PatientCard key={p.patientId} record={p} isCritical
                  onSelect={setSelectedPatient} />
              ))}
            </div>
          </div>
        )}

        {/* All patients */}
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">
            {myPatients.length > 0 ? `ALL PATIENTS (${myPatients.length})` : 'NO PATIENTS YET'}
          </p>
          {myPatients.length === 0 ? (
            <div className="card text-center py-10 text-slate-400">
              <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No patients connected yet</p>
              <p className="text-sm mt-1">Use "Connect New Patient" to add patients by their ID</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myPatients.filter((p) => p.latestAlert?.level !== 'critical').map((p) => (
                <PatientCard key={p.patientId} record={p} isCritical={false}
                  onSelect={setSelectedPatient} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient detail modal */}
      {selectedPatient && (
        <PatientDetailModal
          record={selectedPatient}
          reports={getDoctorReports(selectedPatient.patientId)}
          doctorId={authUser.id}
          onClose={() => setSelectedPatient(null)}
          onAddReport={(patientId, report) => {
            addDoctorReport(patientId, { ...report, doctorName: authUser.name })
          }}
        />
      )}
    </div>
  )
}
