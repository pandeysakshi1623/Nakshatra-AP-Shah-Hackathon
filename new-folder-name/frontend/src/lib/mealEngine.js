/**
 * Rule-based meal recommendation engine.
 * Adapts to condition, recovery stage, age, and recent symptoms.
 */

const MEAL_DB = {
  'cardiac-surgery': {
    breakfast: [
      { name: 'Oatmeal with banana slices', why: 'Low sodium, high fiber — supports heart health and gentle digestion.', emoji: '🥣' },
      { name: 'Scrambled egg whites with whole wheat toast', why: 'Lean protein for tissue repair, low in saturated fat.', emoji: '🍳' },
      { name: 'Greek yogurt with berries', why: 'Probiotics aid gut health; antioxidants reduce inflammation.', emoji: '🫐' },
    ],
    lunch: [
      { name: 'Grilled chicken with steamed vegetables', why: 'High protein, low fat — ideal for cardiac recovery.', emoji: '🍗' },
      { name: 'Lentil soup with whole grain bread', why: 'Plant protein and fiber help manage cholesterol.', emoji: '🍲' },
      { name: 'Tuna salad (light mayo) on whole wheat', why: 'Omega-3 fatty acids support heart function.', emoji: '🥗' },
    ],
    dinner: [
      { name: 'Baked salmon with quinoa and broccoli', why: 'Omega-3s and complex carbs for sustained energy and heart repair.', emoji: '🐟' },
      { name: 'Vegetable stir-fry with tofu', why: 'Low sodium, plant-based protein — easy on the heart.', emoji: '🥦' },
      { name: 'Turkey and vegetable soup', why: 'Warm, easy to digest, lean protein for recovery.', emoji: '🍜' },
    ],
    snacks: [
      { name: 'Unsalted almonds (small handful)', why: 'Healthy fats and magnesium support heart rhythm.', emoji: '🥜' },
      { name: 'Apple slices', why: 'Fiber and natural sugars for gentle energy.', emoji: '🍎' },
    ],
    avoid: ['Salty snacks', 'Fried foods', 'Full-fat dairy', 'Processed meats', 'Alcohol'],
    hydration: 'Drink 6–8 glasses of water daily. Limit caffeine.',
  },
  'knee-surgery': {
    breakfast: [
      { name: 'Protein smoothie (banana, milk, peanut butter)', why: 'High protein supports muscle and tissue repair around the knee.', emoji: '🥤' },
      { name: 'Eggs with spinach and whole wheat toast', why: 'Iron and protein for healing; vitamin K in spinach supports bone health.', emoji: '🍳' },
      { name: 'Cottage cheese with pineapple', why: 'Bromelain in pineapple reduces swelling; cottage cheese provides casein protein.', emoji: '🍍' },
    ],
    lunch: [
      { name: 'Chicken and vegetable soup', why: 'Collagen from chicken broth supports joint recovery.', emoji: '🍲' },
      { name: 'Salmon with sweet potato', why: 'Anti-inflammatory omega-3s; vitamin C for collagen synthesis.', emoji: '🐟' },
      { name: 'Bean and vegetable wrap', why: 'Plant protein and fiber; easy to eat while resting.', emoji: '🌯' },
    ],
    dinner: [
      { name: 'Grilled chicken with brown rice and greens', why: 'Complete protein and complex carbs for overnight tissue repair.', emoji: '🍗' },
      { name: 'Lentil curry with rice', why: 'Anti-inflammatory spices (turmeric); plant protein for healing.', emoji: '🍛' },
      { name: 'Baked cod with roasted vegetables', why: 'Lean protein and vitamins for joint tissue recovery.', emoji: '🐠' },
    ],
    snacks: [
      { name: 'Walnuts and dried cherries', why: 'Anti-inflammatory compounds reduce joint swelling.', emoji: '🍒' },
      { name: 'Carrot sticks with hummus', why: 'Vitamin A and plant protein for tissue repair.', emoji: '🥕' },
    ],
    avoid: ['Sugary drinks', 'Processed foods', 'Alcohol', 'Excessive red meat'],
    hydration: 'Drink 8+ glasses of water. Staying hydrated reduces joint stiffness.',
  },
  'appendectomy': {
    breakfast: [
      { name: 'Plain oatmeal with honey', why: 'Gentle on the digestive system; easy to digest post-surgery.', emoji: '🥣' },
      { name: 'Banana and plain toast', why: 'BRAT diet staple — bland, easy to digest, reduces nausea.', emoji: '🍌' },
      { name: 'Soft boiled egg with white toast', why: 'Protein for healing; bland to avoid irritating the gut.', emoji: '🥚' },
    ],
    lunch: [
      { name: 'Chicken broth with soft noodles', why: 'Hydrating, easy to digest, gentle on healing abdomen.', emoji: '🍜' },
      { name: 'Mashed potatoes with steamed chicken', why: 'Soft texture, easy digestion, protein for wound healing.', emoji: '🥔' },
      { name: 'Rice with steamed fish', why: 'Bland, easily digestible, lean protein for recovery.', emoji: '🍚' },
    ],
    dinner: [
      { name: 'Vegetable soup with soft bread', why: 'Warm, easy to digest, vitamins for immune support.', emoji: '🍲' },
      { name: 'Steamed white fish with rice', why: 'Very gentle on the gut; lean protein for incision healing.', emoji: '🐟' },
      { name: 'Scrambled eggs with soft vegetables', why: 'Easy to digest, protein-rich, minimal gut irritation.', emoji: '🍳' },
    ],
    snacks: [
      { name: 'Plain crackers', why: 'Bland, easy to digest, helps settle the stomach.', emoji: '🫙' },
      { name: 'Applesauce', why: 'Gentle on the gut, provides natural sugars for energy.', emoji: '🍎' },
    ],
    avoid: ['Spicy foods', 'High-fiber raw vegetables', 'Carbonated drinks', 'Fried foods', 'Dairy (first week)'],
    hydration: 'Drink 8–10 glasses of water. Avoid carbonated drinks.',
  },
  'pneumonia': {
    breakfast: [
      { name: 'Warm oatmeal with honey and ginger', why: 'Ginger is anti-inflammatory; honey soothes the throat.', emoji: '🥣' },
      { name: 'Warm lemon water with toast', why: 'Vitamin C boosts immune function; warm fluids loosen mucus.', emoji: '🍋' },
      { name: 'Soft boiled eggs with warm broth', why: 'Protein for immune cells; warm broth helps clear airways.', emoji: '🥚' },
    ],
    lunch: [
      { name: 'Chicken soup with vegetables', why: 'Classic recovery food — anti-inflammatory, hydrating, easy to eat.', emoji: '🍲' },
      { name: 'Warm lentil soup', why: 'High protein and iron support immune recovery.', emoji: '🫘' },
      { name: 'Steamed fish with soft rice', why: 'Easy to eat when appetite is low; protein for immune support.', emoji: '🐟' },
    ],
    dinner: [
      { name: 'Warm vegetable broth with soft bread', why: 'Hydrating, easy to eat, vitamins for immune support.', emoji: '🍜' },
      { name: 'Mashed sweet potato with steamed chicken', why: 'Vitamin A supports lung tissue repair.', emoji: '🍠' },
      { name: 'Warm turmeric milk with soft rice', why: 'Turmeric is anti-inflammatory; warm milk soothes airways.', emoji: '🥛' },
    ],
    snacks: [
      { name: 'Warm herbal tea with honey', why: 'Soothes throat, anti-inflammatory, hydrating.', emoji: '🍵' },
      { name: 'Orange or kiwi', why: 'High vitamin C boosts immune response.', emoji: '🍊' },
    ],
    avoid: ['Cold foods and drinks', 'Dairy (increases mucus)', 'Alcohol', 'Smoking'],
    hydration: 'Drink 10+ glasses of warm fluids daily. Warm water, herbal teas, and broths are best.',
  },
  'general': {
    breakfast: [
      { name: 'Oatmeal with fruits and nuts', why: 'Balanced nutrition — fiber, protein, and vitamins for recovery.', emoji: '🥣' },
      { name: 'Eggs with whole wheat toast and avocado', why: 'Healthy fats, protein, and complex carbs for sustained energy.', emoji: '🍳' },
      { name: 'Yogurt parfait with granola and berries', why: 'Probiotics, antioxidants, and protein for immune support.', emoji: '🫐' },
    ],
    lunch: [
      { name: 'Grilled chicken salad with olive oil dressing', why: 'Lean protein and healthy fats support tissue repair.', emoji: '🥗' },
      { name: 'Vegetable and bean soup', why: 'Plant protein, fiber, and vitamins for overall recovery.', emoji: '🍲' },
      { name: 'Whole grain sandwich with turkey and vegetables', why: 'Balanced macronutrients for energy and healing.', emoji: '🥪' },
    ],
    dinner: [
      { name: 'Baked chicken with roasted vegetables and quinoa', why: 'Complete protein and complex carbs for overnight recovery.', emoji: '🍗' },
      { name: 'Fish with steamed broccoli and brown rice', why: 'Omega-3s, vitamins, and fiber for comprehensive healing.', emoji: '🐟' },
      { name: 'Lentil and vegetable curry with rice', why: 'Plant protein, anti-inflammatory spices, and complex carbs.', emoji: '🍛' },
    ],
    snacks: [
      { name: 'Mixed nuts and dried fruit', why: 'Healthy fats, protein, and natural sugars for energy.', emoji: '🥜' },
      { name: 'Fresh fruit', why: 'Vitamins and antioxidants support immune function.', emoji: '🍎' },
    ],
    avoid: ['Processed foods', 'Excessive sugar', 'Alcohol', 'Fried foods'],
    hydration: 'Drink 8 glasses of water daily.',
  },
}

export function generateMealPlan(patient, symptomLogs = []) {
  const key = patient.conditionType || 'general'
  const base = MEAL_DB[key] || MEAL_DB['general']
  const stage = parseInt(patient.recoveryStage) || 1
  const age = parseInt(patient.age) || 50
  const dayIndex = new Date().getDate() % 3
  const dietPref = patient.dietaryPref || 'both'

  const recentLog = symptomLogs[0]
  const hasNausea = recentLog?.symptoms?.nausea !== 'none' && recentLog?.symptoms?.nausea != null
  const hasHighFever = (recentLog?.symptoms?.temperature || 0) >= 38.5

  // Use blander options when symptomatic
  const mealIndex = (hasNausea || hasHighFever) ? 0 : dayIndex

  // Filter meals by dietary preference
  const filterMeals = (meals) => {
    if (dietPref === 'veg') {
      const vegMeals = meals.filter((m) =>
        !m.name.toLowerCase().match(/chicken|fish|meat|tuna|turkey|salmon|cod|beef|pork|shrimp|egg/)
      )
      return vegMeals.length > 0 ? vegMeals : meals
    }
    return meals
  }

  const filteredBreakfast = filterMeals(base.breakfast)
  const filteredLunch     = filterMeals(base.lunch)
  const filteredDinner    = filterMeals(base.dinner)

  const calorieNote =
    stage === 1
      ? 'Eat small, frequent meals (5–6 times/day). Appetite may be low — that\'s normal.'
      : stage === 2
      ? 'Aim for 3 balanced meals + 2 snacks. Gradually increase portions.'
      : 'Resume normal eating. Focus on nutrient-dense foods for full recovery.'

  const ageNote = age >= 65
    ? 'Focus on protein-rich foods to prevent muscle loss during recovery.'
    : null

  const adaptNote = hasNausea
    ? '⚠️ Nausea detected — blander, smaller meals recommended today.'
    : hasHighFever
    ? '⚠️ Fever detected — focus on hydration and easy-to-digest foods.'
    : null

  const dietNote = dietPref === 'veg' ? '🥦 Vegetarian meals selected' :
                   dietPref === 'nonveg' ? '🍗 Non-vegetarian meals selected' : null

  return {
    breakfast: filteredBreakfast[mealIndex % filteredBreakfast.length],
    lunch:     filteredLunch[mealIndex % filteredLunch.length],
    dinner:    filteredDinner[mealIndex % filteredDinner.length],
    snack:     base.snacks[dayIndex % base.snacks.length],
    avoid:     base.avoid,
    hydration: base.hydration,
    calorieNote,
    ageNote,
    adaptNote,
    dietNote,
    generatedAt: new Date().toISOString(),
  }
}
