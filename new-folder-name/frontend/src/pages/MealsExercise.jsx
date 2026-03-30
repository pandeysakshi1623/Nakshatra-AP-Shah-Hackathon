import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { generateMealPlan } from '../lib/mealEngine'
import { generateExercisePlan } from '../lib/exerciseEngine'
import { Utensils, Dumbbell, AlertTriangle, RefreshCw } from 'lucide-react'

function MealCard({ meal, label }) {
  if (!meal) return null
  return (
    <div className="card">
      <p className="text-xs font-bold text-slate-400 uppercase mb-2">{label}</p>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{meal.emoji}</span>
        <div>
          <p className="font-bold text-slate-800 text-base">{meal.name}</p>
          <p className="text-slate-500 text-sm mt-1">{meal.why}</p>
        </div>
      </div>
    </div>
  )
}

function ExerciseCard({ exercise }) {
  return (
    <div className="card flex items-start gap-3">
      <span className="text-2xl">{exercise.icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{exercise.name}</p>
        <div className="flex gap-3 mt-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{exercise.duration}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{exercise.reps}</span>
        </div>
        {exercise.tip && <p className="text-slate-400 text-xs mt-1">💡 {exercise.tip}</p>}
      </div>
    </div>
  )
}

export default function MealsExercise() {
  const { patient, symptomLogs, mealPlan, exercisePlan, setMealPlan, setExercisePlan } = useStore()
  const [tab, setTab] = useState('meals')

  const refresh = () => {
    if (!patient) return
    setMealPlan(generateMealPlan(patient, symptomLogs))
    setExercisePlan(generateExercisePlan(patient, symptomLogs))
  }

  useEffect(() => {
    if (!patient) return
    const today = new Date().toDateString()
    if (!mealPlan || new Date(mealPlan.generatedAt).toDateString() !== today) {
      setMealPlan(generateMealPlan(patient, symptomLogs))
    }
    if (!exercisePlan || new Date(exercisePlan.generatedAt).toDateString() !== today) {
      setExercisePlan(generateExercisePlan(patient, symptomLogs))
    }
  }, [patient])

  if (!patient) return <div className="p-5 text-center text-slate-500 mt-20">No patient data found.</div>

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meals & Exercise</h2>
          <p className="text-slate-500 text-sm mt-1">Personalized for your recovery</p>
        </div>
        <button onClick={refresh} className="text-slate-400 hover:text-primary-600 transition-colors p-2">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1">
        <button
          onClick={() => setTab('meals')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            tab === 'meals' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          <Utensils size={16} /> Meals
        </button>
        <button
          onClick={() => setTab('exercise')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
            tab === 'exercise' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          <Dumbbell size={16} /> Exercise
        </button>
      </div>

      {/* MEALS TAB */}
      {tab === 'meals' && mealPlan && (
        <div className="space-y-4">
          {mealPlan.adaptNote && (
            <div className="card bg-amber-50 border-amber-200">
              <p className="text-amber-700 text-sm font-medium">{mealPlan.adaptNote}</p>
            </div>
          )}

          <MealCard meal={mealPlan.breakfast} label="Breakfast" />
          <MealCard meal={mealPlan.snack}     label="Morning Snack" />
          <MealCard meal={mealPlan.lunch}     label="Lunch" />
          <MealCard meal={mealPlan.dinner}    label="Dinner" />

          {/* Hydration */}
          <div className="card bg-blue-50 border-blue-200">
            <p className="font-semibold text-blue-700 mb-1">💧 Hydration</p>
            <p className="text-blue-600 text-sm">{mealPlan.hydration}</p>
          </div>

          {/* Foods to avoid */}
          <div className="card">
            <p className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Foods to Avoid
            </p>
            <div className="flex flex-wrap gap-2">
              {mealPlan.avoid.map((item, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full">
                  ✗ {item}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {mealPlan.calorieNote && (
            <div className="card bg-slate-50">
              <p className="text-slate-600 text-sm">🍽️ {mealPlan.calorieNote}</p>
            </div>
          )}
          {mealPlan.ageNote && (
            <div className="card bg-purple-50 border-purple-100">
              <p className="text-purple-700 text-sm">👴 {mealPlan.ageNote}</p>
            </div>
          )}
        </div>
      )}

      {/* EXERCISE TAB */}
      {tab === 'exercise' && exercisePlan && (
        <div className="space-y-4">
          {exercisePlan.restWarning && (
            <div className="card bg-amber-50 border-amber-200">
              <p className="text-amber-700 text-sm font-medium">{exercisePlan.restWarning}</p>
            </div>
          )}

          <div className="card bg-primary-50 border-primary-100">
            <p className="font-bold text-primary-700">{exercisePlan.label}</p>
          </div>

          <p className="text-sm font-semibold text-slate-500">TODAY'S EXERCISES</p>
          <div className="space-y-3">
            {exercisePlan.exercises?.map((ex, i) => (
              <ExerciseCard key={i} exercise={ex} />
            ))}
          </div>

          {/* Restrictions */}
          <div className="card">
            <p className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Do NOT Do
            </p>
            <div className="space-y-2">
              {exercisePlan.restrictions?.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <p className="text-slate-600 text-sm">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {exercisePlan.ageNote && (
            <div className="card bg-purple-50 border-purple-100">
              <p className="text-purple-700 text-sm">👴 {exercisePlan.ageNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
