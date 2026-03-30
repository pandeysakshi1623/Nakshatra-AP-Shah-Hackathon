import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useAuthStore } from './lib/authStore'
import RoleSelect from './pages/RoleSelect'
import PatientAuth from './pages/PatientAuth'
import Onboarding from './pages/Onboarding'
import PatientHome from './pages/PatientHome'
import RecoveryPlan from './pages/RecoveryPlan'
import SymptomLog from './pages/SymptomLog'
import CaregiverDashboard from './pages/CaregiverDashboard'
import DailyPlan from './pages/DailyPlan'
import MealsExercise from './pages/MealsExercise'
import Medications from './pages/Medications'
import Notes from './pages/Notes'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorLogin from './pages/DoctorLogin'
import DoctorReports from './pages/DoctorReports'
import PatientLayout from './components/PatientLayout'
import CaregiverLayout from './components/CaregiverLayout'
import CaregiverAuth from './pages/CaregiverAuth'

export default function App() {
  const { patient } = useStore()
  const { role, authUser } = useAuthStore()

  return (
    <Routes>
      {/* ── Entry point ─────────────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/role" replace />} />
      <Route path="/role" element={<RoleSelect />} />

      {/* ── Patient auth (login / signup) ───────────────────────────────── */}
      <Route path="/patient/auth" element={<PatientAuth />} />

      {/* ── Patient onboarding (profile setup after auth) ───────────────── */}
      <Route
        path="/onboarding"
        element={role === 'patient' ? <Onboarding /> : <Navigate to="/role" replace />}
      />

      {/* ── Doctor ──────────────────────────────────────────────────────── */}
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route
        path="/doctor"
        element={authUser && role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/doctor/login" replace />}
      />

      {/* ── Patient routes (inside PatientLayout) ───────────────────────── */}
      <Route element={<PatientLayout />}>
        <Route path="/home"          element={patient ? <PatientHome />   : <Navigate to="/patient/auth" replace />} />
        <Route path="/plan"          element={patient ? <RecoveryPlan />  : <Navigate to="/patient/auth" replace />} />
        <Route path="/symptoms"      element={patient ? <SymptomLog />    : <Navigate to="/patient/auth" replace />} />
        <Route path="/daily"         element={patient ? <DailyPlan />     : <Navigate to="/patient/auth" replace />} />
        <Route path="/meals"         element={patient ? <MealsExercise /> : <Navigate to="/patient/auth" replace />} />
        <Route path="/medications"   element={patient ? <Medications />   : <Navigate to="/patient/auth" replace />} />
        <Route path="/notes"         element={patient ? <Notes />         : <Navigate to="/patient/auth" replace />} />
        <Route path="/doctor-reports"element={patient ? <DoctorReports /> : <Navigate to="/patient/auth" replace />} />
      </Route>

      {/* ── Caregiver auth ───────────────────────────────────────────────── */}
      <Route path="/caregiver/auth" element={<CaregiverAuth />} />

      {/* ── Caregiver routes (inside CaregiverLayout) ───────────────────── */}
      <Route element={<CaregiverLayout />}>
        <Route
          path="/caregiver"
          element={
            authUser && role === 'caregiver'
              ? <CaregiverDashboard />
              : <Navigate to="/caregiver/auth" replace />
          }
        />
      </Route>

      {/* ── Catch-all ───────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/role" replace />} />
    </Routes>
  )
}
