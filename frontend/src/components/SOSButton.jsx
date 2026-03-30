import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../lib/authStore'
import { Phone, X, AlertTriangle } from 'lucide-react'

export default function SOSButton() {
  const { patient, latestAlert } = useStore()
  const { addSosEvent } = useAuthStore()
  const [pressed, setPressed] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [activated, setActivated] = useState(false)
  const [holding, setHolding] = useState(false)
  const holdTimer = useRef(null)
  const countdownTimer = useRef(null)

  const startHold = () => {
    setHolding(true)
    setCountdown(3)
    holdTimer.current = setTimeout(() => {
      triggerSOS()
    }, 3000)
    // Countdown
    let c = 3
    countdownTimer.current = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) clearInterval(countdownTimer.current)
    }, 1000)
  }

  const cancelHold = () => {
    setHolding(false)
    setCountdown(3)
    clearTimeout(holdTimer.current)
    clearInterval(countdownTimer.current)
  }

  const triggerSOS = () => {
    setHolding(false)
    setActivated(true)
    setPressed(true)

    const event = {
      patientName: patient?.name || 'Unknown',
      patientId: patient?.patientId || patient?.id,
      caregiverPhone: patient?.caregiverPhone,
      caregiverName: patient?.caregiverName,
      location: 'Patient location (GPS not available in demo)',
      lastAlert: latestAlert,
    }
    addSosEvent(event)

    // Also push a caregiver alert so it shows on caregiver dashboard
    useAuthStore.getState().addCaregiverAlert({
      type: 'sos',
      message: `🚨 SOS triggered by ${patient?.name || 'patient'}! Immediate attention required.`,
      patientName: patient?.name || 'Unknown',
      patientId: patient?.patientId || patient?.id,
    })

    // Simulate alarm sound via Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const playBeep = (freq, start, duration) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'square'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      }
      // SOS pattern: 3 short, 3 long, 3 short
      [0, 0.3, 0.6, 1.0, 1.4, 1.8, 2.3, 2.6, 2.9].forEach((t, i) => {
        playBeep(880, t, i >= 3 && i < 6 ? 0.25 : 0.1)
      })
    } catch (e) {
      // Audio not available — silent fallback
    }
  }

  const dismiss = () => {
    setActivated(false)
    setPressed(false)
    setCountdown(3)
  }

  // SOS activated overlay
  if (activated) {
    return (
      <div className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="text-center text-white space-y-6 max-w-sm">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={64} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">SOS ACTIVATED</h1>
            <p className="text-red-100 text-lg mt-2">Emergency alert sent!</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 space-y-2 text-left">
            <p className="font-bold text-white">Alerts sent to:</p>
            {patient?.caregiverName && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium">{patient.caregiverName}</p>
                  <p className="text-red-200 text-sm">{patient.caregiverPhone || 'No phone on file'}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="font-medium">Connected Doctor</p>
                <p className="text-red-200 text-sm">Emergency notification sent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚑</span>
              <div>
                <p className="font-medium">Emergency Services</p>
                <p className="text-red-200 text-sm">Alert logged in system</p>
              </div>
            </div>
          </div>

          {patient?.caregiverPhone && (
            <a href={`tel:${patient.caregiverPhone}`}
              className="w-full bg-white text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg">
              <Phone size={22} /> Call Caregiver Now
            </a>
          )}

          <a href="tel:911"
            className="w-full bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg border-2 border-white/40">
            <Phone size={22} /> Call 911
          </a>

          <button onClick={dismiss}
            className="text-white/60 text-sm flex items-center gap-1 mx-auto">
            <X size={14} /> Dismiss (false alarm)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className={`w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all select-none ${
          holding
            ? 'bg-red-700 scale-110 shadow-red-500/50'
            : 'bg-red-500 hover:bg-red-600 active:scale-95'
        }`}
      >
        <AlertTriangle size={22} className="text-white" />
        <span className="text-white text-xs font-bold mt-0.5">
          {holding ? countdown : 'SOS'}
        </span>
      </button>
      {holding && (
        <div className="absolute -top-8 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
          Hold... {countdown}
        </div>
      )}
    </div>
  )
}
