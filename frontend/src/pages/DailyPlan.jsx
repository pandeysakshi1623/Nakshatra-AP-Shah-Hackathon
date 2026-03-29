import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { generateMealPlan } from '../lib/mealEngine'
import { generateExercisePlan } from '../lib/exerciseEngine'
import { Sun, Coffee, Utensils, Moon, Dumbbell, Pill, BedDouble, Droplets } from 'lucide-react'

const TIME_BLOCKS = [
  { time: '7:00 AM',  label: 'Wake Up & Morning Meds', icon: Sun,      color: 'bg-yellow-50 border-yellow-200', iconColor: 'text-yellow-500' },
  { time: '8:00 AM',  label: 'Breakfast',               icon: Coffee,   color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-500' },
  { time: '9:00 AM',  label: 'Morning Exercise',         icon: Dumbbell, color: 'bg-blue-50 border-blue-200',    iconColor: 'text-blue-500' },
  { time: '10:00 AM', label: 'Rest',                     icon: BedDouble,color: 'bg-slate-50 border-slate-200',  iconColor: 'text-slate-400' },
  { time: '1:00 PM',  label: 'Lunch',                    icon: Utensils, color: 'bg-green-50 border-green-200',  iconColor: 'text-green-500' },
  { time: '2:00 PM',  label: 'Afternoon Meds & Rest',    icon: Pill,     color: 'bg-purple-50 border-purple-200',iconColor: 'text-purple-500' },
  { time: '4:00 PM',  label: 'Light Activity / Walk',    icon: Dumbbell, color: 'bg-blue-50 border-blue-200',    iconColor: 'text-blue-500' },
  { time: '7:00 PM',  label: 'Dinner',                   icon: Utensils, color: 'bg-green-50 border-green-200',  iconColor: 'text-green-500' },
  { time: '9:00 PM',  label: 'Evening Meds & Wind Down', icon: Moon,     color: 'bg-indigo-50 border-indigo-200',iconColor: 'text-indigo-500' },
]

export default function DailyPlan() {
  const { patient, symptomLogs, medications, mealPlan, exercisePlan, setMealPlan, setExercisePlan } = useStore()

  useEffect(() => {
    if (!patient) return
    // Regenerate if stale (different day)
    const today = new Date().toDateString()
    if (!mealPlan || new Date(mealPlan.generatedAt).toDateString() !== today) {
      setMealPlan(generateMealPlan(patient, symptomLogs))
    }
    if (!exercisePlan || new Date(exercisePlan.generatedAt).toDateString() !== today) {
      setExercisePlan(generateExercisePlan(patient, symptomLogs))
    }
  }, [patient])

  if (!patient) return <div className="p-5 text-center text-slate-500 mt-20">No patient data found.</div>

  const todayMeds = medications.filter((m) => m.active !== false)
  const morningMeds = todayMeds.filter((m) => m.time === 'morning' || m.time === 'both')
  const eveningMeds = todayMeds.filter((m) => m.time === 'evening' || m.time === 'both')
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Daily Plan</h2>
        <p className="text-slate-500 text-sm mt-1">{today}</p>
      </div>

      {/* Adaptation note */}
      {(mealPlan?.adaptNote || exercisePlan?.restWarning) && (
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-amber-700 text-sm font-medium">
            {mealPlan?.adaptNote || exercisePlan?.restWarning}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {TIME_BLOCKS.map((block, i) => {
          const Icon = block.icon
          let detail = null

          if (block.label === 'Breakfast' && mealPlan?.breakfast) {
            detail = `${mealPlan.breakfast.emoji} ${mealPlan.breakfast.name}`
          } else if (block.label === 'Lunch' && mealPlan?.lunch) {
            detail = `${mealPlan.lunch.emoji} ${mealPlan.lunch.name}`
          } else if (block.label === 'Dinner' && mealPlan?.dinner) {
            detail = `${mealPlan.dinner.emoji} ${mealPlan.dinner.name}`
          } else if (block.label.includes('Morning Exercise') && exercisePlan?.exercises?.[0]) {
            detail = `${exercisePlan.exercises[0].icon} ${exercisePlan.exercises[0].name} · ${exercisePlan.exercises[0].duration}`
          } else if (block.label.includes('Light Activity') && exercisePlan?.exercises?.[1]) {
            detail = `${exercisePlan.exercises[1]?.icon || '🚶'} ${exercisePlan.exercises[1]?.name || 'Gentle walk'}`
          } else if (block.label.includes('Morning Meds') && morningMeds.length > 0) {
            detail = morningMeds.map((m) => `💊 ${m.name}`).join(' · ')
          } else if (block.label.includes('Evening Meds') && eveningMeds.length > 0) {
            detail = eveningMeds.map((m) => `💊 ${m.name}`).join(' · ')
          } else if (block.label === 'Rest' || block.label.includes('Wind Down')) {
            detail = '😴 Rest and relax'
          } else if (block.label.includes('Afternoon Meds')) {
            detail = todayMeds.length > 0 ? '💊 Check medication schedule' : '😴 Rest period'
          }

          return (
            <div key={i} className={`card border-2 ${block.color} flex items-start gap-4`}>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm`}>
                  <Icon size={18} className={block.iconColor} />
                </div>
                {i < TIME_BLOCKS.length - 1 && (
                  <div className="w-0.5 h-4 bg-slate-200 mt-1" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-700">{block.label}</p>
                  <span className="text-xs text-slate-400 font-medium">{block.time}</span>
                </div>
                {detail && <p className="text-sm text-slate-500 mt-0.5">{detail}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hydration reminder */}
      <div className="card bg-blue-50 border-blue-200 flex items-center gap-3">
        <Droplets size={24} className="text-blue-500 shrink-0" />
        <div>
          <p className="font-semibold text-blue-700">Hydration Goal</p>
          <p className="text-blue-600 text-sm">{mealPlan?.hydration || 'Drink 8 glasses of water today.'}</p>
        </div>
      </div>

      {/* Stage note */}
      {mealPlan?.calorieNote && (
        <div className="card bg-slate-50">
          <p className="text-slate-600 text-sm">🍽️ {mealPlan.calorieNote}</p>
        </div>
      )}

      {/* Age note */}
      {(mealPlan?.ageNote || exercisePlan?.ageNote) && (
        <div className="card bg-purple-50 border-purple-100">
          <p className="text-purple-700 text-sm">👴 {mealPlan?.ageNote || exercisePlan?.ageNote}</p>
        </div>
      )}
    </div>
  )
}
