'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, AlertTriangle, Send, Zap, Activity,
  ThumbsUp, Minus, ThumbsDown, LogOut, User
} from 'lucide-react';

const SYMPTOM_OPTIONS = ['Headache', 'Nausea', 'Fever', 'Dizziness', 'Chest Pain'];
const MOBILITY_OPTIONS = ['GOOD', 'FAIR', 'POOR'];
const BACKEND_URL = 'http://localhost:5000';

export default function PatientPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [painLevel, setPainLevel] = useState(3);
  const [mobility, setMobility] = useState('GOOD');
  const [symptoms, setSymptoms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  useEffect(() => {
    const stored = sessionStorage.getItem('recoverai_user');
    if (!stored) { router.replace('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'PATIENT') { router.replace('/dashboard'); return; }
    setCurrentUser(user);
  }, [router]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleSymptom = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (isSOS = false) => {
    if (!currentUser) return;
    setSubmitting(true);
    if (isSOS) setSosActive(true);
    try {
      const payload = {
        patientId: currentUser._id,
        painLevel,
        mobility,
        symptoms,
        isSOS,
      };
      const res = await fetch(`${BACKEND_URL}/api/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const statusMsg = data.status === 'CRITICAL'
          ? '🚨 CRITICAL status flagged. Your caregiver has been alerted.'
          : '✅ Vitals logged successfully. Status: STABLE.';
        showToast(data.status === 'CRITICAL' ? 'error' : 'success', statusMsg);
        // Reset form
        setPainLevel(3);
        setMobility('GOOD');
        setSymptoms([]);
        setSosActive(false);
      } else {
        showToast('error', data.message || 'Failed to submit vitals.');
        setSosActive(false);
      }
    } catch {
      showToast('error', 'Cannot reach server. Check your connection.');
      setSosActive(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getPainColor = (level) => {
    if (level <= 3) return '#22c55e';
    if (level <= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getMobilityIcon = (option) => {
    if (option === 'GOOD') return ThumbsUp;
    if (option === 'FAIR') return Minus;
    return ThumbsDown;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, #0a0e1a 60%)' }}>

      {/* Toast notification */}
      {toast && (
        <div id="vitals-toast"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border text-sm font-medium
            transition-all duration-300 ${toast.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <span className="font-bold text-white">RecoverAI</span>
              <p className="text-xs text-slate-500">Patient Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-300">{currentUser.name}</span>
            </div>
            <button id="patient-logout" onClick={() => { sessionStorage.clear(); router.push('/login'); }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Daily Health Check-in</h1>
          <p className="text-slate-400 text-sm">Log how you are feeling today. Your caregiver monitors this in real time.</p>
        </div>

        {/* Vitals Form */}
        <div className="space-y-5">

          {/* Pain Level */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pain Level</label>
              <span className="text-3xl font-black tabular-nums" style={{ color: getPainColor(painLevel) }}>
                {painLevel}
                <span className="text-base font-normal text-slate-500">/10</span>
              </span>
            </div>
            <input
              id="pain-slider"
              type="range" min="1" max="10" step="1"
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>No Pain</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Mobility */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 block">Mobility Status</label>
            <div className="grid grid-cols-3 gap-3">
              {MOBILITY_OPTIONS.map((option) => {
                const Icon = getMobilityIcon(option);
                const isSelected = mobility === option;
                const colors = { GOOD: '#22c55e', FAIR: '#f59e0b', POOR: '#ef4444' };
                return (
                  <button
                    key={option}
                    id={`mobility-${option.toLowerCase()}`}
                    onClick={() => setMobility(option)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 font-medium text-sm
                      ${isSelected
                        ? 'text-white scale-[1.03]'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}
                    style={isSelected ? {
                      backgroundColor: `rgba(${hexToRgb(colors[option])}, 0.15)`,
                      borderColor: `rgba(${hexToRgb(colors[option])}, 0.5)`,
                    } : {}}>
                    <Icon className="w-5 h-5" style={isSelected ? { color: colors[option] } : {}} />
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 block">
              Symptoms <span className="normal-case font-normal text-slate-500">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {SYMPTOM_OPTIONS.map((symptom) => {
                const checked = symptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    id={`symptom-${symptom.toLowerCase().replace(' ', '-')}`}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                      ${checked
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                    {checked && '✓ '}{symptom}
                  </button>
                );
              })}
            </div>
            {symptoms.length === 0 && (
              <p className="text-xs text-slate-600 mt-3">No symptoms selected — feeling well!</p>
            )}
          </div>

          {/* Submit */}
          <button
            id="submit-vitals"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2
                       bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-blue-500/20">
            {submitting && !sosActive ? (
              <><Activity className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-5 h-5" /> Submit Daily Check-in</>
            )}
          </button>

          {/* SOS Button */}
          <div className="pt-2">
            <p className="text-center text-xs text-slate-500 mb-4">Emergency? Alert your caregiver immediately.</p>
            <button
              id="sos-button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="sos-pulse w-full py-6 rounded-2xl font-black text-2xl text-white tracking-widest
                         flex items-center justify-center gap-3
                         bg-gradient-to-r from-red-600 to-red-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-4 focus:ring-red-500/50">
              <Zap className="w-7 h-7 fill-white" />
              SOS — EMERGENCY
              <Zap className="w-7 h-7 fill-white" />
            </button>
            <p className="text-center text-xs text-red-500/60 mt-3">
              Pressing SOS will immediately flag your status as CRITICAL on the caregiver dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
}
