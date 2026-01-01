// src/components/NutritionSection.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../lib/i18n";

interface NutritionSectionProps {
  targetGroup?: "general" | "diabetes" | "seniors" | "children";
  showHeader?: boolean;
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "";
type CategoryItem = { key: string; ar: string; en: string };

export function NutritionSection({
  targetGroup = "general",
  showHeader = true,
}: NutritionSectionProps) {
  const { t, language, dir } = useLanguage();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("");

  // ✅ Categories as {key,en,ar} (key = English stable identifier)
  const categories: CategoryItem[] = useMemo(() => {
    if (targetGroup === "diabetes") {
      return [
        { key: "Vegetables", ar: "خضروات", en: "Vegetables" },
        { key: "Proteins", ar: "بروتينات", en: "Proteins" },
        { key: "Whole Grains", ar: "حبوب كاملة", en: "Whole Grains" },
        { key: "Healthy Fats", ar: "دهون صحية", en: "Healthy Fats" },
        { key: "Sugar-free Drinks", ar: "مشروبات بدون سكر", en: "Sugar-free Drinks" },
      ];
    }
    if (targetGroup === "seniors") {
      return [
        { key: "Proteins", ar: "بروتينات", en: "Proteins" },
        { key: "Dairy", ar: "منتجات الألبان", en: "Dairy" },
        { key: "Soups", ar: "شوربات", en: "Soups" },
        { key: "Grains", ar: "حبوب", en: "Grains" },
        { key: "Vegetables", ar: "خضروات", en: "Vegetables" },
      ];
    }
    if (targetGroup === "children") {
      return [
        { key: "Fruits", ar: "فواكه", en: "Fruits" },
        { key: "Vegetables", ar: "خضروات", en: "Vegetables" },
        { key: "Dairy", ar: "منتجات الألبان", en: "Dairy" },
        { key: "Healthy Snacks", ar: "سناكات صحية", en: "Healthy Snacks" },
        { key: "Grains", ar: "حبوب", en: "Grains" },
      ];
    }
    return [
      { key: "Fruits", ar: "فواكه", en: "Fruits" },
      { key: "Vegetables", ar: "خضروات", en: "Vegetables" },
      { key: "Proteins", ar: "بروتينات", en: "Proteins" },
      { key: "Grains", ar: "حبوب", en: "Grains" },
      { key: "Dairy", ar: "منتجات الألبان", en: "Dairy" },
      { key: "Healthy Fats", ar: "دهون صحية", en: "Healthy Fats" },
      { key: "Nuts", ar: "مكسرات", en: "Nuts" },
      { key: "Drinks", ar: "مشروبات", en: "Drinks" },
    ];
  }, [targetGroup]);

  // ✅ Fetch foods (send key; Convex now supports category or categoryAr)
  const foods = useQuery(api.nutrition.getAllFoods, {
    category: selectedCategoryKey || undefined,
    mealType: selectedMealType || undefined,
    isDiabeticFriendly: targetGroup === "diabetes" ? true : undefined,
    isSeniorFriendly: targetGroup === "seniors" ? true : undefined,
    isChildFriendly: targetGroup === "children" ? true : undefined,
  });

  const nutritionPlans = useQuery(api.nutrition.getNutritionPlans, { targetGroup });
  const userNutritionLog = useQuery(api.nutrition.getUserNutritionLog, {});

  const sectionTitle = useMemo(() => {
    if (targetGroup === "diabetes") return t("diabetes");
    if (targetGroup === "seniors") return t("seniors");
    if (targetGroup === "children") return t("children");
    return t("nutrition");
  }, [targetGroup, t]);

  const sectionIcon =
    targetGroup === "diabetes" ? "🩺" : targetGroup === "seniors" ? "👴" : targetGroup === "children" ? "👶" : "🥗";

  const sectionColor =
    targetGroup === "diabetes"
      ? "from-blue-500 to-blue-600"
      : targetGroup === "seniors"
      ? "from-purple-500 to-purple-600"
      : targetGroup === "children"
      ? "from-pink-500 to-pink-600"
      : "from-green-500 to-green-600";

  const mealTypeLabel = (m: Exclude<MealType, "">) =>
    m === "breakfast" ? t("breakfast") : m === "lunch" ? t("lunch") : m === "dinner" ? t("dinner") : t("snack");

  const headerSubtitle = useMemo(() => {
    if (targetGroup === "diabetes") {
      return language === "ar" ? "وجبات ونصائح تساعد على استقرار السكر" : "Meals & tips that help stabilize blood sugar";
    }
    if (targetGroup === "seniors") {
      return language === "ar" ? "وجبات سهلة وصحية تدعم العضلات والعظام" : "Easy healthy meals that support muscles & bones";
    }
    if (targetGroup === "children") {
      return language === "ar" ? "وجبات ممتعة ومتوازنة للنمو والطاقة" : "Fun balanced meals for growth & energy";
    }
    return language === "ar" ? "وجبات وخطط تغذية شاملة لحياة صحية" : "Meals and nutrition plans for a healthy lifestyle";
  }, [targetGroup, language]);

  const renderFoodName = (food: any) => {
    // لو EN: استخدم name (انجليزي) وارجع للعربي لو فاضي
    if (language === "en") return food.name || food.nameAr || t("no_arabic_name");
    return food.nameAr || food.name || t("no_arabic_name");
  };

  const renderCategoryBadge = (food: any) => {
    // لو عندك categoryAr في الداتا وعايز تعرضه في AR
    if (language === "ar") return food.categoryAr || food.category || "—";
    return food.category || food.categoryAr || "—";
  };

  return (
    <div className="space-y-8" dir={dir} lang={language}>
      {/* Header */}
      {showHeader && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">{sectionIcon}</span>
            <h2 className={`text-4xl font-bold bg-gradient-to-r ${sectionColor} bg-clip-text text-transparent`}>
              {language === "ar" ? `قسم ${sectionTitle}` : `${sectionTitle} Section`}
            </h2>
          </div>
          <p className="text-gray-600 text-lg">{headerSubtitle}</p>
        </div>
      )}

      {/* Today Log */}
      {userNutritionLog ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              {language === "ar" ? "سجل التغذية اليوم" : "Today Nutrition Log"}
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {userNutritionLog.totalDailyCalories} {t("kcal")}
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            {language === "ar"
              ? "ده إجمالي السعرات المسجلة اليوم."
              : "This is the total calories you logged today."}
          </p>
        </div>
      ) : null}

      {/* Plans */}
      {nutritionPlans && nutritionPlans.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> {t("nutrition_plans")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nutritionPlans.map((plan: any) => (
              <div
                key={plan._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all bg-white"
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {language === "en" ? plan.name || plan.nameAr : plan.nameAr || plan.name}
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  {language === "en" ? plan.description || plan.descriptionAr : plan.descriptionAr || plan.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    {plan.totalDailyCalories} {t("kcal")}
                    {language === "ar" ? "/يوم" : "/day"}
                  </span>

                  <button
                    className={`px-4 py-2 bg-gradient-to-r ${sectionColor} text-white rounded-lg hover:shadow-lg transition-all text-sm`}
                    type="button"
                  >
                    {t("show_details")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Meal Type Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🍽️</span> {t("meal_type")}
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMealType("")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMealType === "" ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            type="button"
          >
            {t("all")}
          </button>

          {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMealType(m)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMealType === m ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
            >
              {mealTypeLabel(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Categories + Foods */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🥑</span> {t("available_foods")}
        </h3>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategoryKey("")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategoryKey === "" ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            type="button"
          >
            {t("all_categories_label")}
          </button>

          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategoryKey(c.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategoryKey === c.key ? `bg-gradient-to-r ${sectionColor} text-white shadow-lg` : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
            >
              {language === "ar" ? c.ar : c.en}
            </button>
          ))}
        </div>

        {foods === undefined ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t("no_foods_found")}</h3>
            <p className="text-gray-600">
              {language === "ar" ? "غيّر الفلاتر أو أضف بيانات أطعمة" : "Change filters or add foods data"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food: any) => (
              <div
                key={food._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all bg-white"
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{renderFoodName(food)}</h4>

                    {/* Sub name */}
                    {language === "ar" ? (
                      food.name ? (
                        <p className="text-sm text-gray-500 truncate" dir="ltr">
                          {food.name}
                        </p>
                      ) : null
                    ) : food.nameAr ? (
                      <p className="text-sm text-gray-500 truncate">{food.nameAr}</p>
                    ) : null}
                  </div>

                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs whitespace-nowrap">
                    {renderCategoryBadge(food)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-orange-600">{food.caloriesPer100g}</div>
                    <div className="text-gray-600">{t("calories_per_100g")}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-blue-600">{food.proteinPer100g}{t("grams")}</div>
                    <div className="text-gray-600">{t("protein")}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-green-600">{food.carbsPer100g}{t("grams")}</div>
                    <div className="text-gray-600">{t("carbs")}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <div className="font-bold text-yellow-600">{food.fatPer100g}{t("grams")}</div>
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
          <span className="text-2xl">💡</span> {language === "ar" ? "نصائح مناسبة للقسم" : "Tips for this section"}
        </h3>

        {targetGroup === "general" && (
          <ul className="text-gray-700 text-sm space-y-1">
            <li>{language === "ar" ? "• اجعل البروتين حاضرًا في كل وجبة" : "• Keep protein in every meal"}</li>
            <li>{language === "ar" ? "• اختر كارب معقد + ألياف بدل السكر" : "• Choose complex carbs + fiber instead of sugar"}</li>
            <li>{language === "ar" ? "• لا تترك فترات طويلة بدون أكل (خصوصًا لو تتمرن)" : "• Avoid long gaps without eating (especially if you train)"}</li>
          </ul>
        )}

        {targetGroup === "diabetes" && (
          <ul className="text-blue-700 text-sm space-y-1">
            <li>{language === "ar" ? "• ركّز على الألياف لتبطئ امتصاص السكر" : "• Focus on fiber to slow sugar absorption"}</li>
            <li>{language === "ar" ? "• تجنب العصائر والمشروبات السكرية" : "• Avoid juices and sugary drinks"}</li>
            <li>{language === "ar" ? "• قسم الكارب على اليوم بدل دفعة واحدة" : "• Spread carbs across the day instead of one big meal"}</li>
          </ul>
        )}

        {targetGroup === "seniors" && (
          <ul className="text-purple-700 text-sm space-y-1">
            <li>{language === "ar" ? "• زد البروتين لدعم العضلات" : "• Increase protein to support muscles"}</li>
            <li>{language === "ar" ? "• اهتم بالسوائل حتى بدون إحساس العطش" : "• Stay hydrated even without feeling thirsty"}</li>
            <li>{language === "ar" ? "• اختر أطعمة سهلة المضغ والهضم" : "• Choose foods that are easy to chew and digest"}</li>
          </ul>
        )}

        {targetGroup === "children" && (
          <ul className="text-pink-700 text-sm space-y-1">
            <li>{language === "ar" ? "• اجعل الطبق ملونًا لزيادة تقبل الخضار" : "• Make the plate colorful to improve veggie acceptance"}</li>
            <li>{language === "ar" ? "• قلل السكريات المضافة قدر الإمكان" : "• Reduce added sugars as much as possible"}</li>
            <li>{language === "ar" ? "• حضّر سناك صحي جاهز بدل الحلويات" : "• Prep healthy snacks instead of sweets"}</li>
          </ul>
        )}
      </div>
    </div>
  );
}
