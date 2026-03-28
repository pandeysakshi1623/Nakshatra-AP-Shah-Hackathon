'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, AlertTriangle, CheckCircle, Activity,
  Clock, LogOut, RefreshCw, Users, Stethoscope,
  Wifi, WifiOff
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';
const POLL_INTERVAL = 5000; // 5 seconds

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connected, setConnected] = useState(true);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/patients`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
        setLastUpdated(new Date());
        setConnected(true);
        setError('');
      } else {
        setError(data.message);
        setConnected(false);
      }
    } catch {
      setError('Cannot reach backend. Retrying...');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('recoverai_user');
    if (!stored) { router.replace('/login'); return; }
    const user = JSON.parse(stored);
    if (user.role !== 'CAREGIVER') { router.replace('/patient'); return; }
    setCurrentUser(user);
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;
    fetchPatients();
    const interval = setInterval(fetchPatients, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [currentUser, fetchPatients]);

  const criticalCount = patients.filter((p) => p.status === 'CRITICAL').length;
  const stableCount = patients.filter((p) => p.status === 'STABLE').length;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.06) 0%, #0a0e1a 60%)' }}>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <span className="font-bold text-white">RecoverAI</span>
              <p className="text-xs text-slate-500">Caregiver Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              ${connected ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? 'Live' : 'Offline'}
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs text-slate-300">{currentUser.name}</span>
            </div>

            <button id="refresh-btn" onClick={fetchPatients} title="Refresh"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button id="dashboard-logout" onClick={() => { sessionStorage.clear(); router.push('/login'); }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title + last updated */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Patient Monitoring</h1>
            <p className="text-slate-400 text-sm">Dashboard auto-refreshes every 5 seconds.</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total</span>
            </div>
            <div className="text-3xl font-black text-white">{patients.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400/70 uppercase tracking-wider">Critical</span>
            </div>
            <div className="text-3xl font-black text-red-400">{criticalCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400/70 uppercase tracking-wider">Stable</span>
            </div>
            <div className="text-3xl font-black text-green-400">{stableCount}</div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No patients found.</p>
            <p className="text-slate-600 text-sm mt-1">Run the seed script to populate demo patients.</p>
          </div>
        ) : (
          /* Patient Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {patients.map((patient) => {
              const isCritical = patient.status === 'CRITICAL';
              const isReview = patient.status === 'REVIEW';

              return (
                <div
                  key={patient._id}
                  id={`patient-card-${patient._id}`}
                  className={`relative p-6 rounded-2xl border transition-all duration-500
                    ${isCritical
                      ? 'critical-pulse bg-gradient-to-br from-red-900/60 to-red-950/80 border-red-500/50'
                      : isReview
                        ? 'bg-gradient-to-br from-amber-900/30 to-slate-900/80 border-amber-500/30'
                        : 'bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-700/50 hover:border-slate-600/50'
                    }`}
                >
                  {/* Status glow overlay for CRITICAL */}
                  {isCritical && (
                    <div className="absolute inset-0 rounded-2xl bg-red-500/5 pointer-events-none" />
                  )}

                  {/* Card header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                        ${isCritical ? 'bg-red-500/20' : 'bg-slate-800'}`}>
                        {isCritical
                          ? <AlertTriangle className="w-5 h-5 text-red-400" />
                          : <CheckCircle className="w-5 h-5 text-green-400" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-white leading-tight">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                    ${isCritical
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : isReview
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-green-500/15 text-green-300 border border-green-500/30'
                    }`}>
                    {isCritical && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
                    {!isCritical && !isReview && <span className="w-2 h-2 rounded-full bg-green-400" />}
                    {patient.status}
                  </div>

                  {/* CRITICAL alert message */}
                  {isCritical && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-xs font-medium
                                    px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Immediate attention required
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    Updated: {new Date(patient.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
