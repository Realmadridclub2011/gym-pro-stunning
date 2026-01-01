import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";

interface NutritionSectionProps {
  targetGroup?: "general" | "diabetes" | "seniors" | "children";
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "";

/**
 * ✅ Categories (AR <-> EN)
 * - Buttons shown to user depend on current language
 * - Query normalization ensures server receives what it expects
 */
const CATEGORY_AR_TO_EN: Record<string, string> = {
  "فواكه": "Fruits",
  "خضروات": "Vegetables",
  "بروتينات": "Proteins",
  "حبوب": "Grains",
  "حبوب كاملة": "Whole Grains",
  "منتجات الألبان": "Dairy",
  "دهون صحية": "Healthy Fats",
  "مكسرات": "Nuts",
  "مشروبات": "Drinks",
  "مشروبات بدون سكر": "Sugar-free Drinks",
  "شوربات": "Soups",
  "سناكات صحية": "Healthy Snacks",
};

const CATEGORY_EN_TO_AR: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_AR_TO_EN).map(([ar, en]) => [en, ar])
);

function normalizeCategoryForQuery(selectedCategory: string, language: "ar" | "en") {
  if (!selectedCategory) return undefined;
  // لو المستخدم اختار عربي، رجّع إنجليزي للسيرفر لو محتاج
  if (language === "ar") return CATEGORY_AR_TO_EN[selectedCategory] || selectedCategory;
  // لو المستخدم اختار إنجليزي، ابعته زي ما هو (أو رجّع عربي لو داتابيسك بالعربي)
  return selectedCategory;
}

export function NutritionSection({ targetGroup = "general" }: NutritionSectionProps) {
  const { language, t } = useLanguage();

  // ✅ هنا نخزن قيمة الفلاتر زي ما تظهر للمستخدم (عربي أو إنجليزي)
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("");

  const foods = useQuery(api.nutrition.getAllFoods, {
    category: normalizeCategoryForQuery(selectedCategory, language),
    mealType: selectedMealType || undefined,
    isDiabeticFriendly: targetGroup === "diabetes" ? true : undefined,
    isSeniorFriendly: targetGroup === "seniors" ? true : undefined,
    isChildFriendly: targetGroup === "children" ? true : undefined,
  });

  const nutritionPlans = useQuery(api.nutrition.getNutritionPlans, { targetGroup });
  const userNutritionLog = useQuery(api.nutrition.getUserNutritionLog, {});

  const sectionTitle = useMemo(() => {
    switch (targetGroup) {
      case "diabetes":
        return language === "ar" ? t("diabetes") : t("diabetes");
      case "seniors":
        return language === "ar" ? t("seniors") : t("seniors");
      case "children":
        return language === "ar" ? t("children") : t("children");
      default:
        return t("nutrition");
    }
  }, [targetGroup, language]);

  const sectionIcon = useMemo(() => {
    switch (targetGroup) {
      case "diabetes":
        return "🩺";
      case "seniors":
        return "👴";
      case "children":
        return "👶";
      default:
        return "🥗";
    }
  }, [targetGroup]);

  const sectionColor = useMemo(() => {
    switch (targetGroup) {
      case "diabetes":
        return "from-blue-500 to-blue-600";
      case "seniors":
        return "from-purple-500 to-purple-600";
      case "children":
        return "from-pink-500 to-pink-600";
      default:
        return "from-green-500 to-green-600";
    }
  }, [targetGroup]);

  // ✅ Labels for meal types using DICT
  const MEAL_TYPE_LABELS = useMemo(() => {
    return {
      breakfast: t("breakfast"),
      lunch: t("lunch"),
      dinner: t("dinner"),
      snack: t("snack"),
    } as Record<Exclude<MealType, "">, string>;
  }, [language]);

  // ✅ Categories shown in UI depend on target group and language
  const categories = useMemo(() => {
    const arList = (() => {
      if (targetGroup === "diabetes") {
        return ["خضروات", "بروتينات", "حبوب كاملة", "دهون صحية", "مشروبات بدون سكر"];
      }
      if (targetGroup === "seniors") {
        return ["بروتينات", "منتجات الألبان", "شوربات", "حبوب", "خضروات"];
      }
      if (targetGroup === "children") {
        return ["فواكه", "خضروات", "منتجات الألبان", "سناكات صحية", "حبوب"];
      }
      return ["فواكه", "خضروات", "بروتينات", "حبوب", "منتجات الألبان", "دهون صحية", "مكسرات", "مشروبات"];
    })();

    // لو اللغة إنجليزي: حوّل القائمة لإنجليزي
    if (language === "en") {
      return arList.map((ar) => CATEGORY_AR_TO_EN[ar] || ar);
    }
    return arList;
  }, [targetGroup, language]);

  const sortedFoods = useMemo(() => {
    if (!foods) return foods;

    const scoreFood = (f: any) => {
      const protein = Number(f.proteinPer100g || 0);
      const carbs = Number(f.carbsPer100g || 0);
      const fat = Number(f.fatPer100g || 0);

      const sugar = Number(f.sugar || 0);
      const fiber = Number(f.fiber || 0);

      if (targetGroup === "diabetes") {
        return fiber * 3 + protein * 1.5 - sugar * 4 - carbs * 0.7 - fat * 0.1;
      }

      if (targetGroup === "seniors") {
        return protein * 3 + fiber * 1.5 - carbs * 0.6;
      }

      if (targetGroup === "children") {
        return protein * 2 + fat * 1 - sugar * 3 - carbs * 0.3;
      }

      return protein * 2 + fiber * 2 - sugar * 2 - carbs * 0.2;
    };

    return [...foods].sort((a, b) => scoreFood(b) - scoreFood(a));
  }, [foods, targetGroup]);

  // ✅ header subtitle per group in both languages
  const headerSubtitle = useMemo(() => {
    if (targetGroup === "diabetes") {
      return language === "ar"
        ? "وجبات ونصائح تساعد على استقرار السكر"
        : "Meals and tips to help keep blood sugar stable";
    }
    if (targetGroup === "seniors") {
      return language === "ar"
        ? "وجبات سهلة وصحية تدعم العضلات والعظام"
        : "Easy healthy meals that support muscles and bones";
    }
    if (targetGroup === "children") {
      return language === "ar"
        ? "وجبات ممتعة ومتوازنة للنمو والطاقة"
        : "Fun balanced meals for growth and energy";
    }
    return language === "ar"
      ? "وجبات وخطط تغذية شاملة لحياة صحية"
      : "Meals and nutrition plans for a healthier life";
  }, [targetGroup, language]);

  // ✅ helpers for food fields by language
  const foodName = (food: any) =>
    (language === "ar" ? food.nameAr : food.name) ||
    (language === "ar" ? "بدون اسم" : "Untitled");

  const foodCategoryLabel = (food: any) => {
    // food.categoryAr might exist, but in EN we want category (EN) if possible
    const catEn = food.category || "";
    const catAr = food.categoryAr || (catEn ? CATEGORY_EN_TO_AR[catEn] : "");
    if (language === "ar") return catAr || "فئة";
    return catEn || (catAr ? CATEGORY_AR_TO_EN[catAr] : "") || "Category";
  };

  // ✅ Plan fields
  const planName = (plan: any) =>
    (language === "ar" ? plan.nameAr : plan.name) ||
    (language === "ar" ? "خطة" : "Plan");

  const planDesc = (plan: any) =>
    (language === "ar" ? plan.descriptionAr : plan.description) || "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl">{sectionIcon}</span>
          <h2
            className={`text-4xl font-bold bg-gradient-to-r ${sectionColor} bg-clip-text text-transparent`}
          >
            {language === "ar" ? `قسم ${sectionTitle}` : `${sectionTitle} Section`}
          </h2>
        </div>
        <p className="text-gray-600 text-lg">{headerSubtitle}</p>
      </div>

      {/* Today Log */}
      {userNutritionLog && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              {language === "ar" ? "سجل التغذية اليوم" : "Today's Nutrition Log"}
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {userNutritionLog.totalDailyCalories}{" "}
              {language === "ar" ? t("kcal") : "kcal"}
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      {nutritionPlans && nutritionPlans.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            {language === "ar" ? "خطط مقترحة" : "Suggested Plans"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nutritionPlans.map((plan: any) => (
              <div
                key={plan._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all bg-white"
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {planName(plan)}
                </h4>
                {planDesc(plan) ? (
                  <p className="text-gray-600 text-sm mb-3">{planDesc(plan)}</p>
                ) : null}

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    {plan.totalDailyCalories}{" "}
                    {language === "ar" ? "سعرة/يوم" : "kcal/day"}
                  </span>
                  <button
                    className={`px-4 py-2 bg-gradient-to-r ${sectionColor} text-white rounded-lg hover:shadow-lg transition-all text-sm`}
                    type="button"
                  >
                    {language === "ar" ? "عرض التفاصيل" : "View details"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Type Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          {language === "ar" ? "اختر نوع الوجبة" : "Choose meal type"}
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMealType("")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMealType === ""
                ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            type="button"
          >
            {t("all_meals")}
          </button>

          {(["breakfast", "lunch", "dinner", "snack"] as const).map((mt) => (
            <button
              key={mt}
              onClick={() => setSelectedMealType(mt)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMealType === mt
                  ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
            >
              {MEAL_TYPE_LABELS[mt]}
            </button>
          ))}
        </div>
      </div>

      {/* Categories + Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🥑</span>
          {language === "ar"
            ? `محتوى مناسب لقسم ${sectionTitle}`
            : `Content for ${sectionTitle}`}
        </h3>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === ""
                ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            type="button"
          >
            {t("all_categories")}
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
            >
              {/* لو EN اعرض الإنجليزي، لو AR اعرض العربي */}
              {cat}
            </button>
          ))}
        </div>

        {sortedFoods === undefined ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
          </div>
        ) : sortedFoods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {language === "ar" ? "لا يوجد محتوى الآن" : "No content yet"}
            </h3>
            <p className="text-gray-600">
              {language === "ar"
                ? "غيّر الفلاتر أو أضف بيانات أطعمة"
                : "Change filters or add foods data"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFoods.map((food: any) => (
              <div
                key={food._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all bg-white"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {foodName(food)}
                    </h4>

                    {/* اعرض الاسم الثاني كسطر ثانوي */}
                    {language === "ar" && food.name ? (
                      <p className="text-sm text-gray-500 truncate" dir="ltr">
                        {food.name}
                      </p>
                    ) : null}

                    {language === "en" && food.nameAr ? (
                      <p className="text-sm text-gray-500 truncate" dir="rtl">
                        {food.nameAr}
                      </p>
                    ) : null}
                  </div>

                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs whitespace-nowrap">
                    {foodCategoryLabel(food)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-orange-600">
                      {food.caloriesPer100g}
                    </div>
                    <div className="text-gray-600">{t("calories_per_100g")}</div>
                  </div>

                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-blue-600">
                      {food.proteinPer100g}
                      {language === "ar" ? "جم" : "g"}
                    </div>
                    <div className="text-gray-600">{t("protein")}</div>
                  </div>

                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-green-600">
                      {food.carbsPer100g}
                      {language === "ar" ? "جم" : "g"}
                    </div>
                    <div className="text-gray-600">{t("carbs")}</div>
                  </div>

                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-yellow-600">
                      {food.fatPer100g}
                      {language === "ar" ? "جم" : "g"}
                    </div>
                    <div className="text-gray-600">{t("fat")}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {food.isDiabeticFriendly ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {language === "ar" ? "مناسب للسكري" : "Diabetes-friendly"}
                    </span>
                  ) : null}
                  {food.isSeniorFriendly ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {language === "ar" ? "مناسب لكبار السن" : "Senior-friendly"}
                    </span>
                  ) : null}
                  {food.isChildFriendly ? (
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                      {language === "ar" ? "مناسب للأطفال" : "Child-friendly"}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          {language === "ar" ? "نصائح مناسبة للقسم" : "Section tips"}
        </h3>

        {targetGroup === "general" && (
          <ul className="text-gray-700 text-sm space-y-1">
            {language === "ar" ? (
              <>
                <li>• اجعل البروتين حاضرًا في كل وجبة</li>
                <li>• اختر كارب معقد + ألياف بدل السكر</li>
                <li>• لا تترك فترات طويلة بدون أكل (خصوصًا لو تتمرن)</li>
              </>
            ) : (
              <>
                <li>• Include protein in every meal</li>
                <li>• Prefer complex carbs + fiber over sugar</li>
                <li>• Avoid long gaps without eating (especially if you train)</li>
              </>
            )}
          </ul>
        )}

        {targetGroup === "diabetes" && (
          <ul className="text-blue-700 text-sm space-y-1">
            {language === "ar" ? (
              <>
                <li>• ركّز على الألياف لتبطئ امتصاص السكر</li>
                <li>• تجنب العصائر والمشروبات السكرية</li>
                <li>• قسم الكارب على اليوم بدل “دفعة واحدة”</li>
              </>
            ) : (
              <>
                <li>• Focus on fiber to slow sugar absorption</li>
                <li>• Avoid juices and sugary drinks</li>
                <li>• Spread carbs across the day (not all at once)</li>
              </>
            )}
          </ul>
        )}

        {targetGroup === "seniors" && (
          <ul className="text-purple-700 text-sm space-y-1">
            {language === "ar" ? (
              <>
                <li>• زد البروتين لدعم العضلات</li>
                <li>• اهتم بالسوائل حتى بدون إحساس العطش</li>
                <li>• اختر أطعمة سهلة المضغ والهضم</li>
              </>
            ) : (
              <>
                <li>• Increase protein to support muscles</li>
                <li>• Stay hydrated even without feeling thirsty</li>
                <li>• Choose easy-to-chew, easy-to-digest foods</li>
              </>
            )}
          </ul>
        )}

        {targetGroup === "children" && (
          <ul className="text-pink-700 text-sm space-y-1">
            {language === "ar" ? (
              <>
                <li>• اجعل الطبق “ملون” لزيادة تقبل الخضار</li>
                <li>• قلل السكريات المضافة قدر الإمكان</li>
                <li>• حضّر سناك صحي جاهز بدل الحلويات</li>
              </>
            ) : (
              <>
                <li>• Make the plate colorful to improve veggie acceptance</li>
                <li>• Reduce added sugars as much as possible</li>
                <li>• Prep a healthy snack instead of sweets</li>
              </>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
