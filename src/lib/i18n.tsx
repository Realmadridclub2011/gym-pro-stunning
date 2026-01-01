import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  app_tagline: {
    ar: "لياقة • تغذية • صحة",
    en: "Fitness • Nutrition • Health",
  },

  /* Auth */
  sign_in_title: {
    ar: "Gym Pro",
    en: "Gym Pro",
  },
  sign_in_sub: {
    ar: "رحلتك نحو اللياقة تبدأ هنا",
    en: "Your fitness journey starts here",
  },

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
  no_goals: {
    ar: "لم يتم تحديد أهداف بعد.",
    en: "No goals have been set yet.",
  },

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
     ✅ Added for ExerciseCard
  ========================= */
  video_not_working_preview: {
    ar: "الفيديو لا يعمل داخل المعاينة",
    en: "Video preview is not available here",
  },
  watch_video: { ar: "مشاهدة الفيديو", en: "Watch video" },
  opens_youtube_new_tab: {
    ar: "(سيفتح يوتيوب في تبويب جديد)",
    en: "(Opens YouTube in a new tab)",
  },
  no_video_or_image: { ar: "لا يوجد فيديو/صورة", en: "No video/image available" },

  minutes: { ar: "دقيقة", en: "min" },
  sets: { ar: "مجموعة", en: "sets" },

  required_equipment: { ar: "المعدات المطلوبة:", en: "Required equipment:" },

  show_details: { ar: "عرض التفاصيل", en: "Show details" },
  hide_details: { ar: "إخفاء التفاصيل", en: "Hide details" },

  log_workout: { ar: "تسجيل التمرين", en: "Log workout" },
  log_workout_title: { ar: "تسجيل التمرين:", en: "Log workout:" },

  duration_minutes: { ar: "المدة (دقيقة)", en: "Duration (min)" },
  number_of_sets: { ar: "عدد المجموعات", en: "Number of sets" },
  reps_and_weight_each_set: {
    ar: "التكرارات والأوزان لكل مجموعة:",
    en: "Reps & weight per set:",
  },
  set: { ar: "مجموعة", en: "Set" },
  reps: { ar: "التكرارات", en: "Reps" },
  weight_kg: { ar: "الوزن (كجم)", en: "Weight (kg)" },

  notes_optional: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  notes_placeholder: {
    ar: "أي ملاحظات حول التمرين...",
    en: "Any notes about the workout...",
  },

  save_workout: { ar: "حفظ التمرين", en: "Save workout" },
  cancel: { ar: "إلغاء", en: "Cancel" },

  how_to_perform: { ar: "طريقة الأداء:", en: "How to perform:" },

  workout_logged_success: {
    ar: "تم تسجيل التمرين بنجاح!",
    en: "Workout logged successfully!",
  },
  something_went_wrong: { ar: "حدث خطأ ما", en: "Something went wrong" },
};

/* =========================
   Helpers
========================= */
function getDir(lang: Lang): Dir {
  return lang === "ar" ? "rtl" : "ltr";
}

/* =========================
   Context
========================= */
type I18nCtx = {
  language: Lang;
  dir: Dir;
  setLanguage: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
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
      t: (key) => DICT[key]?.[language] ?? String(key),
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
  if (!ctx) {
    throw new Error("useLanguage must be used within I18nProvider");
  }
  return ctx;
}
