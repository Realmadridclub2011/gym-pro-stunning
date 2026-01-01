import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Beef,
  Wheat,
  Droplets,
  Flame,
  Target,
  Split,
  Gauge,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

type Gender = "male" | "female";
type Goal = "cut" | "maintenance" | "bulk";

type FatPercent = 0.2 | 0.25 | 0.3;
type ProteinPerKg = 1.6 | 2.0 | 2.2;
type MealsPerDay = 3 | 4 | 5;

function round(n: number) {
  return Math.round(n);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmt(n: number) {
  return Number.isFinite(n) ? round(n) : 0;
}

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function goalAccent(goal: Goal) {
  if (goal === "cut") return "from-red-500 to-pink-600";
  if (goal === "bulk") return "from-orange-500 to-yellow-600";
  return "from-green-500 to-emerald-600";
}

function goalBorder(goal: Goal) {
  if (goal === "cut") return "border-red-200";
  if (goal === "bulk") return "border-orange-200";
  return "border-green-200";
}

/**
 * Smart macros:
 * - Protein grams = weight * proteinPerKg
 * - Fat calories = calories * fatPercent
 * - Carbs calories = remaining
 */
function calculateMacros({
  calories,
  weightKg,
  proteinPerKg,
  fatPercent,
}: {
  calories: number;
  weightKg: number;
  proteinPerKg: ProteinPerKg;
  fatPercent: FatPercent;
}) {
  const proteinG = weightKg * proteinPerKg;
  const proteinCals = proteinG * 4;

  const fatCals = calories * fatPercent;
  const fatG = fatCals / 9;

  const remainingCals = calories - (proteinCals + fatCals);
  const carbsG = remainingCals / 4;

  return {
    calories: round(clamp(calories, 0, 999999)),
    proteinG: round(clamp(proteinG, 0, 9999)),
    carbsG: round(clamp(carbsG, 0, 9999)),
    fatG: round(clamp(fatG, 0, 9999)),

    proteinCals: round(clamp(proteinCals, 0, 999999)),
    carbsCals: round(clamp(carbsG * 4, 0, 999999)),
    fatCals: round(clamp(fatCals, 0, 999999)),
  };
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl px-3 py-3 border-2 transition-all text-sm font-semibold",
        active
          ? "bg-gray-900 text-white border-transparent shadow-md"
          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export function CalorieCalculator() {
  const { t, language, dir } = useLanguage();

  const textAlign = dir === "rtl" ? "text-right" : "text-left";
  const textStart = dir === "rtl" ? "text-start" : "text-start"; // Tailwind text-start respects dir in modern browsers

  const [calculatorData, setCalculatorData] = useState({
    age: "",
    gender: "male" as Gender,
    weight: "",
    height: "",
    activityLevel: "moderate" as ActivityLevel,
  });

  // ✅ Smart controls
  const [goal, setGoal] = useState<Goal>("maintenance");
  const [fatPercent, setFatPercent] = useState<FatPercent>(0.25);
  const [proteinPerKg, setProteinPerKg] = useState<ProteinPerKg>(1.6);
  const [mealsPerDay, setMealsPerDay] = useState<MealsPerDay>(4);

  const [selectedFoods, setSelectedFoods] = useState<
    Array<{ foodId: string; quantity: number }>
  >([]);
  const [showFoodSelector, setShowFoodSelector] = useState(false);

  const calorieNeeds = useQuery(
    api.nutrition.calculateDailyCalorieNeeds,
    calculatorData.age && calculatorData.weight && calculatorData.height
      ? {
          age: parseInt(calculatorData.age),
          gender: calculatorData.gender,
          weight: parseFloat(calculatorData.weight),
          height: parseFloat(calculatorData.height),
          activityLevel: calculatorData.activityLevel,
        }
      : "skip"
  );

  const foods = useQuery(api.nutrition.getAllFoods, {});
  const foodCalories = useQuery(
    api.nutrition.calculateCalories,
    selectedFoods.length > 0
      ? {
          foods: selectedFoods.map((f) => ({
            foodId: f.foodId as any,
            quantity: f.quantity,
          })),
        }
      : "skip"
  );

  const activityLevels: Record<ActivityLevel, string> = {
    sedentary: t("sedentary"),
    light: t("light_activity"),
    moderate: t("moderate_activity"),
    active: t("active"),
    very_active: t("very_active"),
  };

  const weightKg = useMemo(() => {
    const w = parseFloat(calculatorData.weight || "");
    return Number.isFinite(w) ? w : 0;
  }, [calculatorData.weight]);

  const targetCalories = useMemo(() => {
    if (!calorieNeeds) return null;
    const maintenance = round(calorieNeeds.maintenanceCalories);
    const cut = round(calorieNeeds.maintenanceCalories - 500);
    const bulk = round(calorieNeeds.maintenanceCalories + 500);
    return goal === "cut" ? cut : goal === "bulk" ? bulk : maintenance;
  }, [calorieNeeds, goal]);

  const macros = useMemo(() => {
    if (!targetCalories || !weightKg) return null;
    return calculateMacros({
      calories: targetCalories,
      weightKg,
      proteinPerKg,
      fatPercent,
    });
  }, [targetCalories, weightKg, proteinPerKg, fatPercent]);

  const perMeal = useMemo(() => {
    if (!macros) return null;
    const m = mealsPerDay;
    return {
      calories: fmt(macros.calories / m),
      proteinG: fmt(macros.proteinG / m),
      carbsG: fmt(macros.carbsG / m),
      fatG: fmt(macros.fatG / m),
    };
  }, [macros, mealsPerDay]);

  const smartSummary = useMemo(() => {
    if (!macros) return null;

    const items = [
      { label: t("protein"), cals: macros.proteinCals },
      { label: t("carbs"), cals: macros.carbsCals },
      { label: t("fat"), cals: macros.fatCals },
    ].sort((a, b) => b.cals - a.cals);

    const top = items[0];

    const tip =
      goal === "cut" ? t("tip_cut") : goal === "bulk" ? t("tip_bulk") : t("tip_maint");

    return { top, tip };
  }, [macros, goal, t]);

  const goalLabel = (g: Goal) => (g === "cut" ? t("cut") : g === "bulk" ? t("bulk") : t("maintenance"));
  const goalShort = (g: Goal) =>
    g === "cut" ? t("goal_short_cut") : g === "bulk" ? t("goal_short_bulk") : t("goal_short_maintenance");

  const addFood = (foodId: string) => {
    setSelectedFoods((prev) => {
      if (prev.some((x) => x.foodId === foodId)) return prev; // ✅ منع التكرار
      return [...prev, { foodId, quantity: 100 }];
    });
  };

  const updateFoodQuantity = (index: number, quantity: number) => {
    setSelectedFoods((prev) =>
      prev.map((food, i) => (i === index ? { ...food, quantity } : food))
    );
  };

  const removeFood = (index: number) => {
    setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const getFoodName = (food: any) => {
    if (language === "ar") return food.nameAr || t("no_ar_name");
    return food.name || t("no_en_name");
  };

  return (
    <div className="space-y-8">
      {/* File Path */}
      <div className={cn("text-xs text-gray-400", textStart)}>
        src/components/CalorieCalculator.tsx
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">🧮</span>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("macros_title")}
          </h2>
        </div>
        <p className="text-gray-600 text-lg">{t("macros_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Calculator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg">
          <h3 className={cn("text-xl font-bold text-gray-800 mb-6 flex items-center gap-2", textAlign)}>
            <span className="text-2xl">⚡</span>
            {t("daily_needs_smart")}
          </h3>

          <div className="space-y-4">
            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  {t("age")}
                </label>
                <input
                  type="number"
                  value={calculatorData.age}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({ ...prev, age: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder={t("age_placeholder")}
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  {t("gender")}
                </label>
                <select
                  value={calculatorData.gender}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({
                      ...prev,
                      gender: e.target.value as Gender,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </div>
            </div>

            {/* Weight + Height */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  {t("weight")} ({t("kg")})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calculatorData.weight}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder={t("weight_placeholder")}
                  min="1"
                  max="500"
                />
              </div>

              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  {t("height")} ({t("cm")})
                </label>
                <input
                  type="number"
                  value={calculatorData.height}
                  onChange={(e) =>
                    setCalculatorData((prev) => ({ ...prev, height: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder={t("height_placeholder")}
                  min="50"
                  max="250"
                />
              </div>
            </div>

            {/* Activity */}
            <div>
              <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                {t("activity_level")}
              </label>
              <select
                value={calculatorData.activityLevel}
                onChange={(e) =>
                  setCalculatorData((prev) => ({
                    ...prev,
                    activityLevel: e.target.value as ActivityLevel,
                  }))
                }
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                {Object.entries(activityLevels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Smart Controls */}
            <div className="mt-2 space-y-4">
              {/* Goal */}
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  {t("your_goal")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["cut", "maintenance", "bulk"] as Goal[]).map((g) => {
                    const active = goal === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={cn(
                          "rounded-2xl px-3 py-3 border-2 transition-all text-sm font-semibold",
                          active
                            ? `bg-gradient-to-r ${goalAccent(g)} text-white border-transparent shadow-md`
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        )}
                        type="button"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Target className="w-4 h-4" />
                          {goalShort(g)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Protein per KG */}
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  <span className="inline-flex items-center gap-2">
                    <Beef className="w-4 h-4" />
                    {t("protein_per_kg")}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([1.6, 2.0, 2.2] as ProteinPerKg[]).map((p) => (
                    <PillButton
                      key={p}
                      active={proteinPerKg === p}
                      onClick={() => setProteinPerKg(p)}
                    >
                      {p} g/kg
                    </PillButton>
                  ))}
                </div>
                <div className={cn("mt-2 text-xs text-gray-500", textAlign)}>{t("protein_hint")}</div>
              </div>

              {/* Fat percent */}
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  <span className="inline-flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    {t("fat_percentage")}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([0.2, 0.25, 0.3] as FatPercent[]).map((f) => (
                    <PillButton
                      key={f}
                      active={fatPercent === f}
                      onClick={() => setFatPercent(f)}
                    >
                      {round(f * 100)}%
                    </PillButton>
                  ))}
                </div>
                <div className={cn("mt-2 text-xs text-gray-500", textAlign)}>{t("fat_hint")}</div>
              </div>

              {/* Meals per day */}
              <div>
                <label className={cn("block text-sm font-medium text-gray-700 mb-2", textAlign)}>
                  <span className="inline-flex items-center gap-2">
                    <Split className="w-4 h-4" />
                    {t("split_title")}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([3, 4, 5] as MealsPerDay[]).map((m) => (
                    <PillButton
                      key={m}
                      active={mealsPerDay === m}
                      onClick={() => setMealsPerDay(m)}
                    >
                      {m} {t("meals")}
                    </PillButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            {calorieNeeds && targetCalories && macros && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{t("result_by_goal")}</h4>
                  <span
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border bg-white text-gray-700",
                      goalBorder(goal)
                    )}
                  >
                    {goalLabel(goal)}
                  </span>
                </div>

                {/* BMR + Target Calories */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className={cn("flex-1", textAlign)}>
                        <div className="text-xs text-gray-500">BMR</div>
                        <div className="text-lg font-bold text-gray-900">{calorieNeeds.bmr}</div>
                        <div className="text-xs text-gray-500">{t("metabolism_basic")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className={cn("flex-1", textAlign)}>
                        <div className="text-xs text-gray-500">{t("target_calories")}</div>
                        <div className="text-lg font-bold text-gray-900">{targetCalories}</div>
                        <div className="text-xs text-gray-500">{t("per_day")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Beef className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className={cn("flex-1", textAlign)}>
                        <div className="text-xs text-gray-500">{t("protein")}</div>
                        <div className="text-lg font-bold text-gray-900">{macros.proteinG}g</div>
                        <div className="text-xs text-gray-500">≈ {macros.proteinCals} {t("kcal")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Wheat className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className={cn("flex-1", textAlign)}>
                        <div className="text-xs text-gray-500">{t("carbs")}</div>
                        <div className="text-lg font-bold text-gray-900">{macros.carbsG}g</div>
                        <div className="text-xs text-gray-500">≈ {macros.carbsCals} {t("kcal")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className={cn("flex-1", textAlign)}>
                        <div className="text-xs text-gray-500">{t("fat")}</div>
                        <div className="text-lg font-bold text-gray-900">{macros.fatG}g</div>
                        <div className="text-xs text-gray-500">≈ {macros.fatCals} {t("kcal")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {perMeal && (
                  <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("font-semibold text-gray-800 flex items-center gap-2", textAlign)}>
                        <Gauge className="w-4 h-4" />
                        {t("per_meal")} ({mealsPerDay})
                      </div>
                      <span className="text-xs text-gray-500">~</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className={cn("flex-1", textAlign)}>
                            <div className="text-xs text-gray-500">{t("daily_calories_needed")}</div>
                            <div className="text-lg font-bold text-gray-900">{perMeal.calories}</div>
                            <div className="text-xs text-gray-500">{t("kcal")}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Beef className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className={cn("flex-1", textAlign)}>
                            <div className="text-xs text-gray-500">{t("protein")}</div>
                            <div className="text-lg font-bold text-gray-900">{perMeal.proteinG}g</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Wheat className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className={cn("flex-1", textAlign)}>
                            <div className="text-xs text-gray-500">{t("carbs")}</div>
                            <div className="text-lg font-bold text-gray-900">{perMeal.carbsG}g</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className={cn("flex-1", textAlign)}>
                            <div className="text-xs text-gray-500">{t("fat")}</div>
                            <div className="text-lg font-bold text-gray-900">{perMeal.fatG}g</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {smartSummary && (
                  <div className="mt-4 p-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-white to-blue-50">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className={cn("flex-1", textAlign)}>
                        <div className="font-semibold text-gray-900">{t("smart_summary")}</div>
                        <div className="text-sm text-gray-700 mt-1">
                          {t("top_cal_source")}{" "}
                          <span className="font-bold">{smartSummary.top.label}</span>.
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{smartSummary.tip}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500 text-center">{t("formula_note")}</div>
              </div>
            )}
          </div>
        </div>

        {/* Food Calorie Calculator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200 shadow-lg">
          <h3 className={cn("text-xl font-bold text-gray-800 mb-6 flex items-center gap-2", textAlign)}>
            <span className="text-2xl">🍽️</span>
            {t("food_calculator_title")}
          </h3>

          <button
            onClick={() => setShowFoodSelector(!showFoodSelector)}
            className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
            type="button"
          >
            {showFoodSelector ? t("hide_foods") : t("add_food")}
          </button>

          {showFoodSelector && foods && (
            <div className="mb-6 max-h-64 overflow-y-auto border border-gray-200 rounded-2xl">
              <div className={cn("p-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700", textAlign)}>
                {t("choose_foods")}
              </div>

              {foods.map((food: any) => (
                <button
                  key={food._id}
                  onClick={() => addFood(food._id)}
                  className={cn(
                    "w-full px-3 py-2 hover:bg-gray-50 border-b border-gray-100 transition-all",
                    textAlign
                  )}
                  type="button"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className={cn(textAlign)}>
                      <div className="text-sm text-gray-800 font-medium">{getFoodName(food)}</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? (food.name ? food.name : null) : (food.nameAr ? food.nameAr : null)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {food.caloriesPer100g} {t("kcal")}/100g
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {selectedFoods.map((selectedFood, index) => {
              const food = foods?.find((f: any) => f._id === selectedFood.foodId);
              if (!food) return null;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className={cn("flex-1", textAlign)}>
                    <div className="font-medium text-gray-800">{getFoodName(food)}</div>
                    <div className="text-xs text-gray-500">
                      {language === "ar" ? (food.name ? food.name : null) : (food.nameAr ? food.nameAr : null)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round((food.caloriesPer100g * selectedFood.quantity) / 100)}{" "}
                      {t("kcal")}
                    </div>
                  </div>

                  <input
                    type="number"
                    value={selectedFood.quantity}
                    onChange={(e) => updateFoodQuantity(index, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                    min="0"
                    step="10"
                  />

                  <span className="text-sm text-gray-600">g</span>

                  <button
                    onClick={() => removeFood(index)}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {foodCalories && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
              <h4 className={cn("font-semibold text-gray-800 mb-3", textAlign)}>{t("total_meal")}</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm">
                  <div className={cn("text-xs text-gray-500 mb-1", textAlign)}>{t("calories")}</div>
                  <div className={cn("text-xl font-bold text-gray-900", textAlign)}>
                    {foodCalories.totalCalories}
                  </div>
                  <div className={cn("text-xs text-gray-500", textAlign)}>{t("kcal")}</div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm">
                  <div className={cn("text-xs text-gray-500 mb-1", textAlign)}>{t("protein")}</div>
                  <div className={cn("text-xl font-bold text-gray-900", textAlign)}>
                    {foodCalories.totalProtein}g
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm">
                  <div className={cn("text-xs text-gray-500 mb-1", textAlign)}>{t("carbs")}</div>
                  <div className={cn("text-xl font-bold text-gray-900", textAlign)}>
                    {foodCalories.totalCarbs}g
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
                  <div className={cn("text-xs text-gray-500 mb-1", textAlign)}>{t("fat")}</div>
                  <div className={cn("text-xl font-bold text-gray-900", textAlign)}>
                    {foodCalories.totalFat}g
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedFoods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🍽️</div>
              <p>{t("no_foods_selected")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg">
        <h3 className={cn("text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", textAlign)}>
          <span className="text-2xl">💡</span>
          {t("tips_title")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("flex items-center gap-2 font-semibold text-gray-800 mb-2", textAlign)}>
              <Sparkles className="w-4 h-4" />
              {t("tips_cut_title")}
            </div>
            <ul className={cn("text-sm text-gray-700 space-y-1", textAlign)}>
              <li>• {t("tips_cut_1")}</li>
              <li>• {t("tips_cut_2")}</li>
              <li>• {t("tips_cut_3")}</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("flex items-center gap-2 font-semibold text-gray-800 mb-2", textAlign)}>
              <Flame className="w-4 h-4" />
              {t("tips_maint_title")}
            </div>
            <ul className={cn("text-sm text-gray-700 space-y-1", textAlign)}>
              <li>• {t("tips_maint_1")}</li>
              <li>• {t("tips_maint_2")}</li>
              <li>• {t("tips_maint_3")}</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={cn("flex items-center gap-2 font-semibold text-gray-800 mb-2", textAlign)}>
              <Gauge className="w-4 h-4" />
              {t("tips_bulk_title")}
            </div>
            <ul className={cn("text-sm text-gray-700 space-y-1", textAlign)}>
              <li>• {t("tips_bulk_1")}</li>
              <li>• {t("tips_bulk_2")}</li>
              <li>• {t("tips_bulk_3")}</li>
            </ul>
          </div>
        </div>

        <div className={cn("mt-4 text-xs text-gray-500", textAlign)}>
          {t("pro_mode_note")}
        </div>
      </div>
    </div>
  );
}
