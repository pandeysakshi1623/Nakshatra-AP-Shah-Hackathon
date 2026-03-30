import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import { FileText, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function DoctorReports() {
  const { patient } = useStore()
  const { doctorReports } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const patientId = patient?.patientId || patient?.id
  const reports = doctorReports[patientId] || []

  const copyId = () => {
    navigator.clipboard.writeText(patientId || '').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Doctor Updates</h2>
        <p className="text-slate-500 text-sm mt-1">Reports and notes from your doctor</p>
      </div>

      {/* Patient ID card */}
      <div className="card bg-primary-50 border-primary-200">
        <p className="text-xs font-bold text-primary-500 uppercase mb-1">Your Patient ID</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary-700 tracking-wider">{patientId}</p>
          <button onClick={copyId} className="text-primary-500 hover:text-primary-700 p-1 transition-colors">
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
        </div>
        <p className="text-primary-600 text-xs mt-1">Share this ID with your doctor to connect</p>
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No doctor updates yet</p>
          <p className="text-sm mt-1">Share your Patient ID with your doctor to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-2">
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
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-slate-700">{r.content}</p>
              {r.doctorName && (
                <p className="text-slate-400 text-xs mt-2">— {r.doctorName}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
