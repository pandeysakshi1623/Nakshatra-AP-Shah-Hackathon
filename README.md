# RecoverEase 🏥
### Smart Post-Discharge Recovery Assistant

A hackathon-ready digital health app that helps patients recover safely after leaving the hospital.

---

## Features

1. **Personalized Recovery Plan** — Condition-specific daily tasks, medications, and precautions
2. **Symptom Monitoring + Smart Alerts** — 3-level rule-based alert system (Normal / Warning / Critical)
3. **Caregiver Dashboard** — Remote monitoring with trend charts and full symptom history

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS, Zustand, Recharts |
| Backend   | Node.js, Express                    |
| Database  | SQLite (better-sqlite3)             |
| Logic     | Rule-based alert engine (no ML)     |

---

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (optional — app works fully offline via localStorage)
```bash
cd backend
npm install
npm start
# → http://localhost:4000
```

---

## Project Structure

```
recoverease/
├── frontend/
│   └── src/
│       ├── pages/          # Onboarding, PatientHome, RecoveryPlan, SymptomLog, CaregiverDashboard
│       ├── components/     # Layout, AlertBadge, RecoveryScoreRing
│       ├── lib/            # alertEngine.js, recoveryEngine.js
│       └── store/          # Zustand persistent store
├── backend/
│   ├── routes/             # patients.js, symptoms.js
│   ├── logic/              # alertEngine.js
│   ├── db/                 # SQLite schema
│   └── server.js
└── README.md
```

---

## Alert Logic

| Condition                  | Level    |
|----------------------------|----------|
| Temp ≥ 39.5°C              | 🚨 Critical |
| Pain ≥ 9/10                | 🚨 Critical |
| Severe breathing difficulty| 🚨 Critical |
| Confusion                  | 🚨 Critical |
| Heavy bleeding             | 🚨 Critical |
| Temp 38.5–39.4°C           | ⚠️ Warning  |
| Pain 7–8/10                | ⚠️ Warning  |
| Extreme fatigue            | ⚠️ Warning  |
| Significant swelling       | ⚠️ Warning  |
| Vomiting                   | ⚠️ Warning  |
| All else                   | ✅ Normal   |

---

## Supported Conditions

- Heart / Cardiac Surgery
- Knee / Joint Surgery
- Appendectomy
- Pneumonia / Lung Infection
- General Recovery

---

## Future Improvements

- Push notifications for caregivers (FCM)
- Doctor portal with prescription upload
- Wearable device integration (heart rate, SpO2)
- Multi-language support for elderly users
- Offline PWA mode
- Telemedicine video call integration
