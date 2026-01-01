// src/lib/i18n.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/* =========================
   Types
========================= */
export type Lang = "ar" | "en";
export type Dir = "rtl" | "ltr";

type Dict = Record<string, { ar: string; en: string }>;

/* =========================
   Dictionary
========================= */
const DICT: Dict = {
  /* App */
  app_tagline: { ar: "لياقة • تغذية • صحة", en: "Fitness • Nutrition • Health" },

  /* Auth */
  sign_in_title: { ar: "Gym Pro", en: "Gym Pro" },
  sign_in_sub: { ar: "رحلتك نحو اللياقة تبدأ هنا", en: "Your fitness journey starts here" },

  /* ✅ إضافات مهمة (كانت بتعمل fallback عربي في App.tsx) */
  logout: { ar: "خروج", en: "Logout" },
  all: { ar: "الكل", en: "All" },
  all_categories_label: { ar: "جميع الفئات", en: "All categories" },

  /* Navigation */
  dashboard: { ar: "الرئيسية", en: "Home" },
  exercises: { ar: "التمارين", en: "Exercises" },
  nutrition: { ar: "التغذية", en: "Nutrition" },
  calculator: { ar: "الحاسبة", en: "Calculator" },
  calculators: { ar: "حاسبات", en: "Calculators" },
  health: { ar: "الصحة", en: "Health" },
  coaches: { ar: "المدربون", en: "Coaches" },
  admin_panel: { ar: "لوحة الإدارة", en: "Admin Panel" },

  /* Dashboard */
  dashboard_welcome: { ar: "مرحباً", en: "Welcome" },
  in_gympro: { ar: "في Gym Pro", en: "to Gym Pro" },
  dashboard_subtitle: {
    ar: "تطبيقك الشامل للياقة البدنية — تمارين، تغذية، صحة",
    en: "Your all-in-one fitness app — workouts, nutrition & health",
  },

  /* Fitness Level */
  fitness_level: { ar: "مستوى اللياقة", en: "Fitness Level" },
  fitness_beginner: { ar: "مبتدئ", en: "Beginner" },
  fitness_intermediate: { ar: "متوسط", en: "Intermediate" },
  fitness_advanced: { ar: "متقدم", en: "Advanced" },
  fitness_unknown: { ar: "غير محدد", en: "Not set" },

  /* Stats */
  completion: { ar: "نسبة الإنجاز", en: "Completion" },
  workout_days: { ar: "أيام تمرين", en: "Workout Days" },
  burned_calories: { ar: "سعرة محروقة", en: "Burned Calories" },

  /* Sections */
  main_sections: { ar: "الأقسام الرئيسية", en: "Main Sections" },
  schedules: { ar: "الجداول", en: "Schedules" },

  /* BMI & Workout */
  bmi_title: { ar: "مؤشر كتلة الجسم", en: "Body Mass Index" },
  workout_summary: { ar: "ملخص التمرين", en: "Workout Summary" },
  sessions: { ar: "الجلسات", en: "Sessions" },
  hours: { ar: "الساعات", en: "Hours" },
  calories: { ar: "السعرات", en: "Calories" },

  /* Goals */
  your_goals: { ar: "أهدافك الرياضية", en: "Your Fitness Goals" },
  no_goals: { ar: "لم يتم تحديد أهداف بعد.", en: "No goals have been set yet." },

  /* Health */
  health_desc: {
    ar: "اختر الفئة وستظهر نفس بيانات التغذية المخصصة لها.",
    en: "Pick a category to see tailored nutrition data.",
  },
  diabetes: { ar: "مرضى السكري", en: "Diabetes" },
  seniors: { ar: "كبار السن", en: "Seniors" },
  children: { ar: "الأطفال", en: "Children" },

  /* Common Words */
  you: { ar: "بك", en: "" },
  men: { ar: "رجال", en: "Men" },
  women: { ar: "نساء", en: "Women" },
  male: { ar: "ذكر", en: "Male" },
  female: { ar: "أنثى", en: "Female" },
  loading: { ar: "جاري التحميل...", en: "Loading..." },
  no_data: { ar: "لا توجد بيانات", en: "No data" },

  /* Exercise Section */
  exercise_section_title: { ar: "قسم التمارين الرياضية", en: "Exercise Section" },
  exercise_section_desc: {
    ar: "اختر الجنس، ثم اضغط على العضلة لتظهر باللون الأحمر وتعرض التمارين.",
    en: "Select gender, then click on a muscle to highlight it in red and show exercises.",
  },
  difficulty: { ar: "الصعوبة", en: "Difficulty" },
  all_levels: { ar: "كل المستويات", en: "All Levels" },
  beginner: { ar: "مبتدئ", en: "Beginner" },
  intermediate: { ar: "متوسط", en: "Intermediate" },
  advanced: { ar: "متقدم", en: "Advanced" },
  category: { ar: "النوع", en: "Category" },
  all_types: { ar: "كل الأنواع", en: "All Types" },
  strength: { ar: "قوة", en: "Strength" },
  cardio: { ar: "كارديو", en: "Cardio" },
  flexibility: { ar: "مرونة", en: "Flexibility" },
  balance: { ar: "توازن", en: "Balance" },
  front_view: { ar: "الأمامي", en: "Front" },
  back_view: { ar: "الخلفي", en: "Back" },
  selected_muscle: { ar: "العضلة المختارة", en: "Selected Muscle" },
  no_muscle_selected: { ar: "لم يتم اختيار عضلة", en: "No muscle selected" },
  exercises_for: { ar: "تمارين", en: "Exercises for" },
  no_exercises_found: { ar: "لا توجد تمارين", en: "No exercises found" },

  /* Nutrition Section */
  meal_type: { ar: "نوع الوجبة", en: "Meal Type" },
  all_meals: { ar: "كل الوجبات", en: "All Meals" },
  breakfast: { ar: "الإفطار", en: "Breakfast" },
  lunch: { ar: "الغداء", en: "Lunch" },
  dinner: { ar: "العشاء", en: "Dinner" },
  snack: { ar: "سناك", en: "Snack" },
  food_category: { ar: "تصنيف الطعام", en: "Food Category" },
  all_categories: { ar: "كل التصنيفات", en: "All Categories" },
  available_foods: { ar: "الأطعمة المتاحة", en: "Available Foods" },
  no_foods_found: { ar: "لا توجد أطعمة", en: "No foods found" },
  calories_per_100g: { ar: "سعرات/100g", en: "Calories/100g" },
  protein: { ar: "بروتين", en: "Protein" },
  carbs: { ar: "كارب", en: "Carbs" },
  fat: { ar: "دهون", en: "Fat" },
  nutrition_plans: { ar: "الخطط الغذائية", en: "Nutrition Plans" },
  no_plans_found: { ar: "لا توجد خطط", en: "No plans found" },
  daily_calories: { ar: "سعرات يومية", en: "Daily Calories" },
  meals: { ar: "وجبات", en: "Meals" },

  /* Calculator */
  calorie_calculator: { ar: "حاسبة السعرات الحرارية", en: "Calorie Calculator" },
  calculator_desc: {
    ar: "احسب احتياجاتك اليومية من السعرات والماكروز بدقة",
    en: "Calculate your daily calorie and macro needs accurately",
  },
  your_info: { ar: "معلوماتك", en: "Your Information" },
  gender: { ar: "الجنس", en: "Gender" },
  age: { ar: "العمر", en: "Age" },
  years: { ar: "سنة", en: "years" },
  weight: { ar: "الوزن", en: "Weight" },
  kg: { ar: "كجم", en: "kg" },
  height: { ar: "الطول", en: "Height" },
  cm: { ar: "سم", en: "cm" },
  activity_level: { ar: "مستوى النشاط", en: "Activity Level" },
  sedentary: { ar: "قليل الحركة", en: "Sedentary" },
  light_activity: { ar: "نشاط خفيف", en: "Light Activity" },
  moderate_activity: { ar: "نشاط متوسط", en: "Moderate Activity" },
  active: { ar: "نشط", en: "Active" },
  very_active: { ar: "نشط جداً", en: "Very Active" },
  your_goal: { ar: "هدفك", en: "Your Goal" },
  cut: { ar: "تنشيف (فقدان وزن)", en: "Cut (Weight Loss)" },
  maintenance: { ar: "الحفاظ على الوزن", en: "Maintenance" },
  bulk: { ar: "تضخيم (زيادة وزن)", en: "Bulk (Weight Gain)" },
  advanced_settings: { ar: "إعدادات متقدمة", en: "Advanced Settings" },
  protein_per_kg: { ar: "بروتين لكل كجم", en: "Protein per kg" },
  fat_percentage: { ar: "نسبة الدهون", en: "Fat Percentage" },
  meals_per_day: { ar: "عدد الوجبات", en: "Meals per Day" },
  calculate: { ar: "احسب", en: "Calculate" },
  your_results: { ar: "نتائجك", en: "Your Results" },
  daily_calories_needed: { ar: "السعرات اليومية", en: "Daily Calories" },
  kcal: { ar: "سعرة", en: "kcal" },
  grams: { ar: "جرام", en: "g" },
  per_meal: { ar: "لكل وجبة", en: "per meal" },
  bmi: { ar: "مؤشر كتلة الجسم", en: "BMI" },

  /* =========================
     ✅ ExerciseCard keys
  ========================= */
  minutes: { ar: "دقيقة", en: "min" },
  sets: { ar: "مجموعات", en: "sets" },
  required_equipment: { ar: "الأدوات المطلوبة", en: "Required equipment" },
  show_details: { ar: "عرض التفاصيل", en: "Show details" },
  hide_details: { ar: "إخفاء التفاصيل", en: "Hide details" },
  log_workout: { ar: "تسجيل التمرين", en: "Log workout" },
  how_to_perform: { ar: "طريقة الأداء", en: "How to perform" },
  log_workout_title: { ar: "تسجيل جلسة التمرين", en: "Log workout session" },
  duration_minutes: { ar: "المدة (دقائق)", en: "Duration (minutes)" },
  number_of_sets: { ar: "عدد المجموعات", en: "Number of sets" },
  reps_and_weight_each_set: { ar: "التكرارات والوزن لكل مجموعة", en: "Reps & weight per set" },
  set: { ar: "مجموعة", en: "Set" },
  reps: { ar: "تكرارات", en: "Reps" },
  weight_kg: { ar: "الوزن (كجم)", en: "Weight (kg)" },
  notes_optional: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  notes_placeholder: { ar: "اكتب ملاحظاتك هنا...", en: "Write your notes here..." },
  save_workout: { ar: "حفظ", en: "Save" },
  cancel: { ar: "إلغاء", en: "Cancel" },

  video_not_working_preview: {
    ar: "المعاينة لا تعمل هنا، افتح الفيديو من يوتيوب.",
    en: "Preview failed here. Open it on YouTube.",
  },
  watch_video: { ar: "مشاهدة الفيديو", en: "Watch video" },
  opens_youtube_new_tab: { ar: "سيفتح في تبويب جديد", en: "Opens in a new tab" },
  no_video_or_image: { ar: "لا يوجد فيديو أو صورة", en: "No video or image" },

  workout_logged_success: { ar: "تم تسجيل التمرين بنجاح ✅", en: "Workout logged successfully ✅" },
  something_went_wrong: { ar: "حدث خطأ غير متوقع", en: "Something went wrong" },

  /* =========================
     ✅ CalorieCalculator keys
  ========================= */
  calorie_macros_title: { ar: "حاسبة السعرات والماكروز", en: "Calories & Macros Calculator" },
  calorie_macros_subtitle: {
    ar: "اختر هدفك واضبط البروتين/الدهون وعدد الوجبات — والباقي هيطلع تلقائي",
    en: "Pick your goal, set protein/fat and meals — the rest is auto-calculated.",
  },
  daily_needs_smart: { ar: "احتياجاتك اليومية (Smart)", en: "Daily needs (Smart)" },
  age_placeholder: { ar: "العمر بالسنوات", en: "Age in years" },
  weight_placeholder: { ar: "الوزن الحالي", en: "Current weight" },
  height_placeholder: { ar: "الطول الحالي", en: "Current height" },

  goal_cut: { ar: "تنشيف (فقدان وزن)", en: "Cut (Weight loss)" },
  goal_bulk: { ar: "تضخيم (زيادة وزن)", en: "Bulk (Weight gain)" },
  goal_maintenance: { ar: "الحفاظ على الوزن", en: "Maintenance" },
  goal_cut_short: { ar: "تنشيف", en: "Cut" },
  goal_bulk_short: { ar: "تضخيم", en: "Bulk" },
  goal_maintenance_short: { ar: "حفاظ", en: "Maintain" },

  protein_tip: {
    ar: "تنشيف غالبًا 2.0–2.2، حفاظ/تضخيم 1.6–2.0 حسب شدة التمرين.",
    en: "Cut: 2.0–2.2, Maintain/Bulk: 1.6–2.0 depending on training intensity.",
  },
  healthy_fat_percent: { ar: "نسبة الدهون الصحية", en: "Healthy fat percentage" },
  fat_tip: {
    ar: "20% لو عايز كارب أعلى، 30% لو بتفضّل شبع أكثر.",
    en: "20% for higher carbs, 30% for more satiety.",
  },
  meals_split: { ar: "تقسيم على كام وجبة؟", en: "Split into how many meals?" },

  result_for_goal: { ar: "النتيجة حسب الهدف:", en: "Result for your goal:" },
  bmr_label: { ar: "معدل الأيض الأساسي", en: "Basal metabolic rate" },
  target_calories: { ar: "سعرات الهدف", en: "Target calories" },
  day: { ar: "يوم", en: "day" },

  per_meal_split: { ar: "التقسيم لكل وجبة", en: "Per-meal split" },
  rounded_note: { ar: "تقريب للأقرب", en: "Rounded" },

  smart_summary: { ar: "ملخص ذكي", en: "Smart summary" },
  top_calorie_source: { ar: "أعلى مصدر سعرات عندك:", en: "Top calorie source:" },
  smart_tip_cut: {
    ar: "في التنشيف: ثبّت البروتين وخلي أغلب الكارب حول التمرين.",
    en: "Cut: keep protein high and place most carbs around training.",
  },
  smart_tip_bulk: {
    ar: "في التضخيم: زوّد الكارب تدريجيًا وثبّت دهون صحية مناسبة.",
    en: "Bulk: increase carbs gradually and keep healthy fats steady.",
  },
  smart_tip_maintenance: {
    ar: "في الحفاظ: وازن الكارب حسب نشاطك وحافظ على نفس السعرات.",
    en: "Maintain: balance carbs with activity and keep calories steady.",
  },
  macros_formula_note: {
    ar: "البروتين = وزن × (g/kg)، الدهون = نسبة من السعرات، والكارب هو الباقي.",
    en: "Protein = weight × (g/kg), fat = % of calories, carbs = the remainder.",
  },

  meal_calorie_calc: { ar: "حاسبة سعرات الوجبات", en: "Meal calorie calculator" },
  hide_food_list: { ar: "إخفاء قائمة الأطعمة", en: "Hide food list" },
  add_food: { ar: "إضافة طعام", en: "Add food" },
  choose_foods: { ar: "اختر الأطعمة:", en: "Choose foods:" },
  no_arabic_name: { ar: "بدون اسم عربي", en: "No Arabic name" },
  remove: { ar: "حذف", en: "Remove" },
  meal_total: { ar: "إجمالي الوجبة:", en: "Meal total:" },
  add_food_hint: { ar: "أضف أطعمة لحساب السعرات الحرارية", en: "Add foods to calculate calories" },

  smart_tips: { ar: "نصائح جامدة (Smart)", en: "Smart tips" },
  tips_cut_title: { ar: "لو هدفك تنشيف", en: "If your goal is cut" },
  tips_cut_1: { ar: "• خلي البروتين 2.0–2.2 g/kg", en: "• Keep protein 2.0–2.2 g/kg" },
  tips_cut_2: { ar: "• خلي الدهون 20–25%", en: "• Keep fat at 20–25%" },
  tips_cut_3: { ar: "• وزّع الكارب حول التمرين", en: "• Place carbs around workouts" },

  tips_maint_title: { ar: "لو هدفك حفاظ", en: "If your goal is maintain" },
  tips_maint_1: { ar: "• بروتين 1.6–2.0 g/kg", en: "• Protein 1.6–2.0 g/kg" },
  tips_maint_2: { ar: "• الدهون 25% ممتازة", en: "• 25% fat is great" },
  tips_maint_3: { ar: "• الكارب يزيد مع النشاط", en: "• Increase carbs with activity" },

  tips_bulk_title: { ar: "لو هدفك تضخيم", en: "If your goal is bulk" },
  tips_bulk_1: { ar: "• بروتين 1.6–2.0 g/kg", en: "• Protein 1.6–2.0 g/kg" },
  tips_bulk_2: { ar: "• الدهون 25–30% حسب الشهية", en: "• 25–30% fat based on appetite" },
  tips_bulk_3: { ar: "• زوّد الكارب تدريجيًا", en: "• Increase carbs gradually" },

  pro_mode_hint: {
    ar: "*لو عايز Pro Mode أعمل لك زر (يوم تمرين/يوم راحة) يبدّل الكارب تلقائيًا.",
    en: "*Want Pro Mode? Add a toggle (training day/rest day) to auto-adjust carbs.",
  },
};

/* =========================
   Helpers
========================= */
function getDir(lang: Lang): Dir {
  return lang === "ar" ? "rtl" : "ltr";
}

/**
 * ✅ ترجمة آمنة:
 * - لو المفتاح مش موجود: يرجع key
 * - لو اللغة EN لكن en فاضية: يرجع العربي بدل ما يطلع فاضي
 * - لو DICT موجود: يرجع اللغة المطلوبة
 */
function translate(lang: Lang, key: string): string {
  const entry = DICT[key];
  if (!entry) return String(key);

  const val = entry[lang];
  if (val && val.trim().length) return val;

  // fallback لو en فاضية
  const fallback = entry.ar || entry.en;
  return (fallback && fallback.trim().length) ? fallback : String(key);
}

/* =========================
   Context
========================= */
type I18nCtx = {
  language: Lang;
  dir: Dir;
  setLanguage: (l: Lang) => void;
  t: (key: string) => string; // ✅ string لأي key
};

const Ctx = createContext<I18nCtx | null>(null);

/* =========================
   Provider
========================= */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "en" || saved === "ar" ? saved : "ar";
  });

  const dir = useMemo(() => getDir(language), [language]);

  useEffect(() => {
    localStorage.setItem("lang", language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const value = useMemo<I18nCtx>(
    () => ({
      language,
      dir,
      setLanguage,
      t: (key: string) => translate(language, key),
    }),
    [language, dir]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* =========================
   Hook
========================= */
export function useLanguage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within I18nProvider");
  return ctx;
}
