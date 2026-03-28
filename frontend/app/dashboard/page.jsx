"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, UserCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // Poll every 5 seconds per requirements
    const interval = setInterval(() => {
      fetchPatients();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Caregiver Dashboard</h1>
        
        {loading ? (
          <div className="text-slate-500 animate-pulse text-lg">Loading patients...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(patient => {
              const isCritical = patient.status === 'CRITICAL';
              return (
                <div 
                  key={patient._id} 
                  className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 p-6 flex flex-col items-center justify-center text-center
                    ${isCritical 
                      ? 'bg-red-600 text-white animate-pulse shadow-red-500/50 scale-[1.02] border-4 border-red-800' 
                      : 'bg-white text-slate-800 border-l-4 border-green-500'}`}
                >
                  {isCritical && (
                    <div className="absolute top-4 right-4">
                      <AlertTriangle size={32} className="text-white drop-shadow-md" />
                    </div>
                  )}

                  <UserCircle2 size={64} className={`mb-4 ${isCritical ? 'text-white' : 'text-slate-300'}`} />
                  
                  <h2 className={`text-2xl font-bold mb-1 ${isCritical ? 'text-white' : 'text-slate-800'}`}>
                    {patient.name}
                  </h2>
                  <p className={`font-mono text-xs opacity-70 mb-4`}>
                    ID: {patient._id}
                  </p>
                  
                  <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm
                    ${isCritical 
                      ? 'bg-red-800/50 text-white border border-red-500' 
                      : 'bg-green-100 text-green-700'}`}
                  >
                    STATUS: {patient.status}
                  </div>
                </div>
              );
            })}
            
            {patients.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl shadow border border-dashed border-slate-300">
                No patients found in the database.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
