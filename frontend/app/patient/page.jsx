"use client";

import { useState } from 'react';
import { AlertCircle, Activity } from 'lucide-react';

export default function PatientVitalsForm() {
  const [painLevel, setPainLevel] = useState(1);
  const [mobility, setMobility] = useState('GOOD');
  const [symptoms, setSymptoms] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');

  // We will assume a hardcoded patient ID for this prototype (seeded in DB)
  // Replace this with an actual ObjectId from your DB once seeded.
  const [patientId, setPatientId] = useState('');

  const handleSymptomChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSymptoms(prev => [...prev, value]);
    } else {
      setSymptoms(prev => prev.filter(s => s !== value));
    }
  };

  const submitVitals = async (isSOS = false) => {
    if (!patientId) {
       setStatusMsg('Error: Please enter a Patient ID (from seeds).');
       return;
    }
    
    try {
      const payload = {
        patientId,
        painLevel: parseInt(painLevel),
        mobility,
        symptoms,
        isSOS
      };

      const res = await fetch('http://localhost:5000/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatusMsg(isSOS ? 'SOS Sent! Help is on the way.' : 'Vitals logged successfully.');
      } else {
        setStatusMsg('Error logging vitals.');
      }
    } catch (error) {
      console.error(error);
      setStatusMsg('Network error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-blue-500" /> Daily Check-In
        </h1>
        
        {/* Temp Patient ID input for prototype */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">Patient ID</label>
          <input 
            type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter MongoDB User ID"
            className="w-full text-sm p-2 bg-slate-100 border-none rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-slate-700 flex justify-between">
            <span>Pain Level (1-10)</span>
            <span className="text-blue-600 font-bold">{painLevel}</span>
          </label>
          <input 
            type="range" 
            min="1" max="10" 
            value={painLevel} 
            onChange={(e) => setPainLevel(e.target.value)}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Mild</span>
            <span>Unbearable</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-slate-700">Mobility Status</label>
          <select 
            value={mobility} 
            onChange={(e) => setMobility(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="GOOD">Good (Independent)</option>
            <option value="FAIR">Fair (Needs Some Help)</option>
            <option value="POOR">Poor (Bedridden)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-semibold text-slate-700">Symptoms</label>
          <div className="grid grid-cols-2 gap-3">
            {['Headache', 'Nausea', 'Fever'].map(s => (
              <label key={s} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input 
                  type="checkbox" 
                  value={s} 
                  onChange={handleSymptomChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-700">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={() => submitVitals(false)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors shadow-md"
        >
          Submit Daily Vitals
        </button>

        {statusMsg && (
          <div className={`p-3 rounded text-center font-medium ${statusMsg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {statusMsg}
          </div>
        )}

        <hr className="my-6 border-slate-200" />

        <button 
          onClick={() => submitVitals(true)}
          className="w-full py-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-colors shadow-xl"
        >
          <AlertCircle size={32} />
          SOS EMERGENCY
        </button>
      </div>
    </div>
  );
}
