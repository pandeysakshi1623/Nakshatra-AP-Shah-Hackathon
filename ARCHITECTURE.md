# RecoverEase — Architecture & Workflow Diagrams

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          RECOVEREASE SYSTEM                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     FRONTEND  (React + Vite)                     │  │
│  │                      localhost:3000                              │  │
│  │                                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │  │
│  │  │   Patient   │  │  Caregiver  │  │       Doctor         │    │  │
│  │  │   Portal    │  │   Portal    │  │      Dashboard       │    │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘    │  │
│  │         │                │                     │                │  │
│  │  ┌──────▼──────────────────────────────────────▼───────────┐   │  │
│  │  │              State Management (Zustand)                  │   │  │
│  │  │   useStore (patient data)  +  useAuthStore (auth/roles)  │   │  │
│  │  └──────────────────────────┬───────────────────────────────┘   │  │
│  │                             │                                    │  │
│  │  ┌──────────────────────────▼───────────────────────────────┐   │  │
│  │  │                  Logic / AI Engines                       │   │  │
│  │  │  alertEngine · recoveryEngine · mealEngine               │   │  │
│  │  │  exerciseEngine · aiInsightEngine · patientId            │   │  │
│  │  └──────────────────────────┬───────────────────────────────┘   │  │
│  │                             │  api.js (fetch + JWT)             │  │
│  └─────────────────────────────┼──────────────────────────────────┘  │
│                                │  Vite Proxy /api → :4000            │
│  ┌─────────────────────────────▼──────────────────────────────────┐  │
│  │                   BACKEND  (Node.js + Express)                  │  │
│  │                      localhost:4000                             │  │
│  │                                                                 │  │
│  │   POST /api/auth/signup      POST /api/auth/login              │  │
│  │   GET  /api/auth/me                                            │  │
│  │   POST /api/patients         GET /api/patients/search?id=      │  │
│  │   POST /api/symptoms         GET /api/symptoms/:patientId      │  │
│  │                                                                 │  │
│  │   bcryptjs (password hash)   jsonwebtoken (JWT auth)           │  │
│  └─────────────────────────────┬───────────────────────────────────┘  │
│                                │                                       │
│  ┌─────────────────────────────▼───────────────────────────────────┐  │
│  │                  DATABASE  (lowdb / JSON file)                   │  │
│  │                  backend/db/recoverease.json                     │  │
│  │                                                                  │  │
│  │   users[]        patients[]      symptomLogs[]   recoveryPlans[]│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Flow

```
                        ┌─────────────┐
                        │  App Start  │
                        │    /role    │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
       │   PATIENT   │  │  CAREGIVER   │  │    DOCTOR    │
       └──────┬──────┘  └──────┬───────┘  └──────┬───────┘
              │                │                  │
              ▼                ▼                  ▼
       /patient/auth     /caregiver          /doctor/login
       (Login/Signup)   (Dashboard)         (Email+Password)
              │                │                  │
              ▼                ▼                  ▼
       /onboarding      CaregiverLayout      DoctorDashboard
       (Profile Setup)  (Amber header,       (Green header,
              │          read-only view)      patient search)
              ▼
       /home (PatientLayout)
       (Blue header + SOS button)
```

---

## 3. Patient Complete Workflow

```
NEW PATIENT
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Auth  (/patient/auth)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sign Up: Name + Email + Password                   │   │
│  │  → bcrypt hash password                             │   │
│  │  → generate Patient ID (RE-XXXX-YYYY)               │   │
│  │  → store in DB users[]                              │   │
│  │  → return JWT token                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Profile Setup  (/onboarding)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Step 1: Name, Age, Recovery Stage                  │   │
│  │  Step 2: Condition (cardiac/knee/appendectomy/etc)  │   │
│  │  Step 3: Caregiver info + Dietary preference        │   │
│  │  Step 4: View & copy Patient ID                     │   │
│  │  → save to backend DB patients[]                    │   │
│  │  → generate recovery plan (rule-based engine)       │   │
│  │  → save to Zustand + localStorage                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Daily Use  (/home)                                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Log Symptoms │  │  Daily Plan  │  │   Medications    │  │
│  │ /symptoms    │  │  /daily      │  │   /medications   │  │
│  │              │  │              │  │                  │  │
│  │ 8 inputs →   │  │ Timeline:    │  │ Add/track meds   │  │
│  │ alertEngine  │  │ Meds+Meals   │  │ Taken/Missed     │  │
│  │ → 3 levels   │  │ +Exercise    │  │ Miss count alert │  │
│  │ Normal/Warn  │  │ +Rest        │  │                  │  │
│  │ /Critical    │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Meals &      │  │    Notes     │  │  Doctor Updates  │  │
│  │ Exercise     │  │  /notes      │  │  /doctor-reports │  │
│  │ /meals       │  │              │  │                  │  │
│  │              │  │ Free text +  │  │ View prescriptions│ │
│  │ mealEngine   │  │ quick tags   │  │ clinical notes   │  │
│  │ exerciseEngine│ │ pattern      │  │ recommendations  │  │
│  │ (veg/nonveg) │  │ detection    │  │ from doctor      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  EMERGENCY  (SOS Button — always visible, bottom-right)     │
│  Hold 3 seconds → Full-screen red overlay                   │
│  → Web Audio alarm (SOS pattern)                            │
│  → Alert logged in authStore.sosEvents[]                    │
│  → Show: Call Caregiver + Call 911 buttons                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Doctor Workflow

```
DOCTOR
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Login  (/doctor/login)                                     │
│  Demo accounts: sarah@hospital.com / doctor123              │
│  → set authUser in authStore                                │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Doctor Dashboard  (/doctor)                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stats Bar: Total Patients | Critical | Warnings    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Connect New Patient                                │   │
│  │  Enter Patient ID (RE-XXXX-YYYY)                    │   │
│  │  → api.searchPatient(id)                            │   │
│  │  → GET /api/patients/search?patientId=RE-XXXX-YYYY  │   │
│  │  → Backend queries DB (case-insensitive trim)       │   │
│  │  → Returns patient profile                          │   │
│  │  → Doctor clicks "Connect" → stored in             │   │
│  │    authStore.doctorPatients[doctorId][]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Patient Cards (sorted: Critical first)             │   │
│  │  Click → Patient Detail Modal                       │   │
│  │                                                     │   │
│  │  Tabs:                                              │   │
│  │  [Overview] Recovery score, alert level, tasks,    │   │
│  │             meds progress                          │   │
│  │  [Symptoms] Last 10 symptom logs with vitals       │   │
│  │  [Medications] All meds + taken/missed status      │   │
│  │  [Reports] Add + view clinical notes,              │   │
│  │            prescriptions, recommendations,         │   │
│  │            lab reports                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Caregiver Workflow

```
CAREGIVER
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  /caregiver  (CaregiverLayout — amber header, no SOS)       │
│                                                             │
│  Reads from same Zustand store as patient                   │
│  (same device / shared localStorage)                        │
│                                                             │
│  Shows:                                                     │
│  ├── Patient info card (name, age, condition, stage)        │
│  ├── Current alert status (Normal/Warning/Critical)         │
│  ├── Recovery score ring + task completion                  │
│  ├── AI Insights panel (pattern-detected recommendations)   │
│  ├── Medication status (taken/pending/missed count)         │
│  ├── Patient notes feed                                     │
│  ├── Symptom trend chart (pain + temp over 7 days)          │
│  └── Full symptom history (last 10 logs)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Alert System Data Flow

```
Patient logs symptoms
        │
        ▼
  analyzeSymptoms()  ←── alertEngine.js (rule-based)
        │
        ├── CRITICAL rules (5):
        │   temp ≥ 39.5°C  │  pain ≥ 9/10  │  severe breathing
        │   confusion       │  heavy bleeding
        │
        ├── WARNING rules (6):
        │   temp 38.5–39.4  │  pain 7–8/10  │  moderate breathing
        │   extreme fatigue │  significant swelling  │  vomiting
        │
        └── NORMAL: everything else
                │
                ▼
        ┌───────────────────────────────────┐
        │  Alert Level Result               │
        │  { level, message, advice }       │
        └───────┬───────────────────────────┘
                │
        ┌───────┼───────────────┐
        ▼       ▼               ▼
    Normal   Warning         Critical
    ✅ Show  ⚠️ Show +        🚨 Show +
    advice   "Caregiver       "Call doctor"
             notified"        + SOS prompt
                │                  │
                ▼                  ▼
        Caregiver sees      Doctor sees in
        on dashboard        dashboard alerts
```

---

## 7. AI Insight Engine Data Flow

```
generateInsights(patient, symptomLogs, medications, notes)
        │
        ├── Pattern 1: Pain trend increasing?
        │   last3[0] > last3[1] && pain ≥ 5 → ⚠️ "Pain is increasing"
        │
        ├── Pattern 2: Fever in 2+ of last 5 logs?
        │   → 🚨 "Persistent fever detected"
        │
        ├── Pattern 3: Medication missed 2+ times?
        │   → ⚠️ "Medications missed repeatedly"
        │
        ├── Pattern 4: Fatigue in 3+ recent logs?
        │   → ℹ️ "Increase rest"
        │
        ├── Pattern 5: Nausea or hydration notes?
        │   → ℹ️ "Maintain hydration"
        │
        ├── Pattern 6: All recent logs normal + pain stable?
        │   → ✅ "Great recovery progress"
        │
        ├── Pattern 7: Age ≥ 65 + Stage 1?
        │   → ℹ️ "Extra care for your age"
        │
        └── Pattern 8: Breathing difficulty in 2+ logs?
            → ⚠️ "Breathing difficulty recurring"
                    │
                    ▼
            Sort by priority (1=urgent → 5=positive)
            Return top 4 insights
                    │
                    ▼
            Shown on: PatientHome + CaregiverDashboard
```

---

## 8. Meal & Exercise Personalization Flow

```
Patient Profile
  conditionType ──────────────────────────────────────────┐
  recoveryStage ──────────────────────────────────────┐   │
  age ────────────────────────────────────────────┐   │   │
  dietaryPref (veg/nonveg/both) ──────────────┐   │   │   │
  symptomLogs[0] (latest) ────────────────┐   │   │   │   │
                                          │   │   │   │   │
                                          ▼   ▼   ▼   ▼   ▼
                                    ┌─────────────────────────┐
                                    │     mealEngine.js       │
                                    │                         │
                                    │  1. Select condition DB │
                                    │  2. Filter by dietPref  │
                                    │  3. Rotate by day index │
                                    │  4. Use bland if nausea │
                                    │     or fever detected   │
                                    │  5. Add age/stage notes │
                                    └────────────┬────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   exerciseEngine.js     │
                                    │                         │
                                    │  1. Select condition DB │
                                    │  2. Pick stage1/2/3     │
                                    │  3. Add rest warning if │
                                    │     critical symptoms   │
                                    │  4. Add age safety note │
                                    └────────────┬────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   DailyPlan.jsx         │
                                    │   MealsExercise.jsx     │
                                    │   (cached per day)      │
                                    └─────────────────────────┘
```

---

## 9. Frontend File Map

```
frontend/src/
│
├── App.jsx                    ← Route definitions (all 14 routes)
├── main.jsx                   ← React root + BrowserRouter
│
├── pages/
│   ├── RoleSelect.jsx         ← Entry: Patient / Caregiver / Doctor
│   ├── PatientAuth.jsx        ← Patient login + signup (tabs)
│   ├── Onboarding.jsx         ← 4-step patient profile setup
│   ├── PatientHome.jsx        ← Main dashboard (score, insights, actions)
│   ├── RecoveryPlan.jsx       ← Tasks checklist + meds + precautions
│   ├── SymptomLog.jsx         ← 8-input symptom form → alert result
│   ├── DailyPlan.jsx          ← Timeline view (meds+meals+exercise+rest)
│   ├── MealsExercise.jsx      ← Tabbed meals + exercise view
│   ├── Medications.jsx        ← CRUD meds + taken/skip tracking
│   ├── Notes.jsx              ← Free text + quick tags + pattern detect
│   ├── DoctorReports.jsx      ← Patient view of doctor's notes
│   ├── CaregiverDashboard.jsx ← Read-only patient monitoring
│   ├── DoctorLogin.jsx        ← Doctor email/password login
│   └── DoctorDashboard.jsx    ← Doctor portal (search, connect, reports)
│
├── components/
│   ├── PatientLayout.jsx      ← Blue header + bottom nav + SOS button
│   ├── CaregiverLayout.jsx    ← Amber header + logout only
│   ├── Layout.jsx             ← Re-exports PatientLayout (compat)
│   ├── SOSButton.jsx          ← Hold-3s emergency trigger + alarm
│   ├── AlertBadge.jsx         ← Normal/Warning/Critical badge UI
│   └── RecoveryScoreRing.jsx  ← SVG circular score (0–100)
│
├── lib/
│   ├── api.js                 ← fetch wrapper (offline-safe)
│   ├── authStore.js           ← Zustand: roles, JWT, doctor data
│   ├── alertEngine.js         ← Rule-based symptom → alert level
│   ├── recoveryEngine.js      ← Condition → recovery plan generator
│   ├── mealEngine.js          ← Condition+diet+symptoms → meal plan
│   ├── exerciseEngine.js      ← Condition+stage+symptoms → exercises
│   ├── aiInsightEngine.js     ← Pattern detection → 8 insight types
│   └── patientId.js           ← RE-XXXX-YYYY ID generator
│
└── store/
    └── useStore.js            ← Zustand: patient, plan, logs, meds, notes
```

---

## 10. Backend File Map

```
backend/
│
├── server.js                  ← Express app + route mounting
│
├── routes/
│   ├── auth.js                ← POST /signup, POST /login, GET /me
│   ├── patients.js            ← POST /, GET /search, GET /:id
│   └── symptoms.js            ← POST /, GET /:patientId
│
├── logic/
│   └── alertEngine.js         ← Mirror of frontend alert rules (server-side)
│
└── db/
    ├── schema.js              ← lowdb setup (4 collections)
    └── recoverease.json       ← JSON flat-file database
                                  { users[], patients[],
                                    symptomLogs[], recoveryPlans[] }
```

---

## 11. Database Schema

```
users[]
  id          string   "1718000000000"
  name        string   "John Smith"
  email       string   "john@email.com"
  passwordHash string  "$2a$10$..."  (bcrypt)
  role        string   "patient" | "caregiver" | "doctor"
  patientId   string   "RE-AB3C-1X2Y"  (null for non-patients)
  createdAt   ISO date

patients[]
  id          string   "RE-AB3C-1X2Y"
  patientId   string   "RE-AB3C-1X2Y"   ← indexed for doctor search
  name        string
  age         number
  email       string
  conditionType  string  "cardiac-surgery" | "knee-surgery" | ...
  recoveryStage  number  1 | 2 | 3
  caregiverName  string
  caregiverPhone string
  dietaryPref    string  "veg" | "nonveg" | "both"
  joinedAt    ISO date
  updatedAt   ISO date

symptomLogs[]
  id          string
  patientId   string   → FK to patients.patientId
  symptoms    object   { temperature, painLevel, fatigue,
                         breathingDifficulty, nausea,
                         swelling, bleeding, consciousness }
  alert       object   { level, message, advice }
  loggedAt    ISO date

recoveryPlans[]
  (reserved for future backend persistence)
```

---

## 12. Tech Stack Summary

```
┌─────────────────┬──────────────────────────────────────────────┐
│ Layer           │ Technology                                    │
├─────────────────┼──────────────────────────────────────────────┤
│ Frontend UI     │ React 18 + Vite 5                            │
│ Styling         │ TailwindCSS 3 (mobile-first, elderly-friendly)│
│ Routing         │ React Router DOM v6                          │
│ State           │ Zustand + localStorage persistence           │
│ Charts          │ Recharts                                     │
│ Icons           │ Lucide React                                 │
│ Backend         │ Node.js + Express 4                          │
│ Auth            │ bcryptjs (hashing) + jsonwebtoken (JWT)      │
│ Database        │ lowdb (JSON flat-file, zero setup)           │
│ AI / Logic      │ Rule-based engines (no ML, no external API)  │
│ Dev Server      │ Vite proxy → Express (port 3000 → 4000)      │
└─────────────────┴──────────────────────────────────────────────┘
```
