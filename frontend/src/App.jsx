import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Onboarding from './pages/Onboarding'
import PatientHome from './pages/PatientHome'
import RecoveryPlan from './pages/RecoveryPlan'
import SymptomLog from './pages/SymptomLog'
import CaregiverDashboard from './pages/CaregiverDashboard'
import Layout from './components/Layout'

export default function App() {
  const { patient } = useStore()

  return (
    <Routes>
      <Route path="/" element={patient ? <Navigate to="/home" /> : <Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/home" element={patient ? <PatientHome /> : <Navigate to="/" />} />
        <Route path="/plan" element={patient ? <RecoveryPlan /> : <Navigate to="/" />} />
        <Route path="/symptoms" element={patient ? <SymptomLog /> : <Navigate to="/" />} />
        <Route path="/caregiver" element={<CaregiverDashboard />} />
      </Route>
    </Routes>
  )
}
