// convex/nutrition.ts
import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* =========================
   Shared Validators
========================= */

const TargetGroup = v.union(
  v.literal("general"),
  v.literal("diabetes"),
  v.literal("seniors"),
  v.literal("children")
);

const MealType = v.union(
  v.literal("breakfast"),
  v.literal("lunch"),
  v.literal("dinner"),
  v.literal("snack")
);

/* =========================
   Helpers
========================= */

async function assertAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile?.isAdmin) throw new ConvexError("ليس لديك صلاحية الإدارة");
}

/* =========================
   FOODS
========================= */

export const getAllFoods = query({
  args: {
    // ✅ ملاحظة: الـ UI عندك بيرسل عربية (مثل "خضروات") فبنفلتر على categoryAr
    category: v.optional(v.string()),
    mealType: v.optional(MealType),

    isDiabeticFriendly: v.optional(v.boolean()),
    isSeniorFriendly: v.optional(v.boolean()),
    isChildFriendly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let foods: any[] = [];

    // ✅ استخدم أفضل index حسب الفلاتر (على categoryAr)
    if (args.category && args.mealType) {
      foods = await ctx.db
        .query("foods")
        .withIndex("by_categoryAr_mealType", (q: any) =>
          q.eq("categoryAr", args.category!).eq("mealType", args.mealType!)
        )
        .collect();
    } else if (args.category) {
      foods = await ctx.db
        .query("foods")
        .withIndex("by_categoryAr", (q: any) => q.eq("categoryAr", args.category!))
        .collect();
    } else if (args.mealType) {
      foods = await ctx.db
        .query("foods")
        .withIndex("by_mealType", (q: any) => q.eq("mealType", args.mealType!))
        .collect();
    } else {
      foods = await ctx.db.query("foods").collect();
    }

    // ✅ فلاتر الملائمة للفئات
    if (args.isDiabeticFriendly !== undefined) {
      foods = foods.filter((f: any) => f.isDiabeticFriendly === args.isDiabeticFriendly);
    }
    if (args.isSeniorFriendly !== undefined) {
      foods = foods.filter((f: any) => f.isSeniorFriendly === args.isSeniorFriendly);
    }
    if (args.isChildFriendly !== undefined) {
      foods = foods.filter((f: any) => f.isChildFriendly === args.isChildFriendly);
    }

    // ✅ ترتيب ذكي (توحيد أسماء الحقول: sugar / fiber)
    const score = (f: any) => {
      const protein = Number(f.proteinPer100g || 0);
      const carbs = Number(f.carbsPer100g || 0);
      const fat = Number(f.fatPer100g || 0);

      const sugar = Number(f.sugar || 0);
      const fiber = Number(f.fiber || 0);
      const sodium = Number(f.sodium || 0);

      if (args.isDiabeticFriendly) {
        // سكري: سكر أقل + ألياف أعلى + كارب أقل
        return fiber * 3 + protein * 1.5 - sugar * 4 - carbs * 0.7 - fat * 0.1;
      }

      if (args.isSeniorFriendly) {
        // كبار السن: بروتين أعلى + صوديوم أقل
        return protein * 3 + fiber * 1.2 - carbs * 0.6 - sodium * 0.01;
      }

      if (args.isChildFriendly) {
        // أطفال: سكر أقل
        return protein * 2 + fiber * 1 - sugar * 3 - carbs * 0.2;
      }

      // عام: توازن
      return protein * 2 + fiber * 2 - sugar * 2 - carbs * 0.2 - fat * 0.05;
    };

    foods.sort((a, b) => score(b) - score(a));
    return foods;
  },
});

export const addFood = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),

    category: v.string(),
    categoryAr: v.string(),

    mealType: v.optional(MealType),

    caloriesPer100g: v.number(),
    proteinPer100g: v.number(),
    carbsPer100g: v.number(),
    fatPer100g: v.number(),

    // ✅ نفس اللي عندك في DB (fiber/sugar/sodium)
    fiber: v.optional(v.number()),
    sugar: v.optional(v.number()),
    sodium: v.optional(v.number()),

    isDiabeticFriendly: v.boolean(),
    isSeniorFriendly: v.boolean(),
    isChildFriendly: v.boolean(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    return await ctx.db.insert("foods", args);
  },
});

export const updateFood = mutation({
  args: {
    foodId: v.id("foods"),
    patch: v.object({
      name: v.optional(v.string()),
      nameAr: v.optional(v.string()),

      category: v.optional(v.string()),
      categoryAr: v.optional(v.string()),

      mealType: v.optional(MealType),

      caloriesPer100g: v.optional(v.number()),
      proteinPer100g: v.optional(v.number()),
      carbsPer100g: v.optional(v.number()),
      fatPer100g: v.optional(v.number()),

      fiber: v.optional(v.number()),
      sugar: v.optional(v.number()),
      sodium: v.optional(v.number()),

      isDiabeticFriendly: v.optional(v.boolean()),
      isSeniorFriendly: v.optional(v.boolean()),
      isChildFriendly: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    await ctx.db.patch(args.foodId, args.patch);
    return true;
  },
});

export const deleteFood = mutation({
  args: { foodId: v.id("foods") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    await ctx.db.delete(args.foodId);
    return true;
  },
});

/* =========================
   CALCULATIONS
========================= */

export const calculateCalories = query({
  args: {
    foods: v.array(
      v.object({
        foodId: v.id("foods"),
        quantity: v.number(), // grams
      })
    ),
  },
  handler: async (ctx, args) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const item of args.foods) {
      const food = await ctx.db.get(item.foodId);
      if (!food) continue;

      const m = item.quantity / 100;
      totalCalories += food.caloriesPer100g * m;
      totalProtein += food.proteinPer100g * m;
      totalCarbs += food.carbsPer100g * m;
      totalFat += food.fatPer100g * m;
    }

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
    };
  },
});

/* =========================
   NUTRITION PLANS (PUBLIC)
========================= */

export const getNutritionPlans = query({
  args: { targetGroup: v.optional(TargetGroup) },
  handler: async (ctx, args) => {
    if (args.targetGroup) {
      return await ctx.db
        .query("nutritionPlans")
        .withIndex("by_target_group", (q: any) => q.eq("targetGroup", args.targetGroup!))
        .filter((x: any) => x.eq(x.field("isActive"), true))
        .collect();
    }

    return await ctx.db
      .query("nutritionPlans")
      .filter((x: any) => x.eq(x.field("isActive"), true))
      .collect();
  },
});

/* =========================
   NUTRITION PLANS (ADMIN)
========================= */

const MealFood = v.object({
  name: v.string(),
  nameAr: v.string(),
  quantity: v.string(),
  calories: v.number(),
  protein: v.number(),
  carbs: v.number(),
  fat: v.number(),
});

const PlanMeal = v.object({
  name: v.string(),
  nameAr: v.string(),
  time: v.string(),
  foods: v.array(MealFood),
  totalCalories: v.number(),
});

export const adminGetAllPlans = query({
  args: {
    targetGroup: v.optional(TargetGroup),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("nutritionPlans").collect();

    if (!args.includeInactive) {
      items = items.filter((x: any) => x.isActive === true);
    }
    if (args.targetGroup) {
      items = items.filter((x: any) => x.targetGroup === args.targetGroup);
    }

    return items;
  },
});

export const addNutritionPlan = mutation({
  args: {
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    descriptionAr: v.string(),
    targetGroup: TargetGroup,
    meals: v.array(PlanMeal),
    totalDailyCalories: v.number(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    return await ctx.db.insert("nutritionPlans", { ...args, isActive: true });
  },
});

export const updateNutritionPlan = mutation({
  args: {
    planId: v.id("nutritionPlans"),
    patch: v.object({
      name: v.optional(v.string()),
      nameAr: v.optional(v.string()),
      description: v.optional(v.string()),
      descriptionAr: v.optional(v.string()),
      targetGroup: v.optional(TargetGroup),
      meals: v.optional(v.array(PlanMeal)),
      totalDailyCalories: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    await ctx.db.patch(args.planId, args.patch);
    return true;
  },
});

export const deleteNutritionPlan = mutation({
  args: { planId: v.id("nutritionPlans") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    await ctx.db.delete(args.planId);
    return true;
  },
});

/* =========================
   USER NUTRITION LOGS
========================= */

export const getUserNutritionLog = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const date = args.date || new Date().toISOString().split("T")[0];

    return await ctx.db
      .query("nutritionLogs")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", date))
      .first();
  },
});

/* =========================
   DAILY CALORIE NEEDS
========================= */

export const calculateDailyCalorieNeeds = query({
  args: v.object({
    activityLevel: v.union(
      v.literal("sedentary"),
      v.literal("light"),
      v.literal("moderate"),
      v.literal("active"),
      v.literal("very_active")
    ),
    age: v.number(),
    gender: v.union(v.literal("male"), v.literal("female")),
    height: v.number(), // cm
    weight: v.number(), // kg
  }),
  handler: async (_ctx, args) => {
    const { activityLevel, age, gender, height, weight } = args;

    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityFactor =
      activityLevel === "sedentary"
        ? 1.2
        : activityLevel === "light"
        ? 1.375
        : activityLevel === "moderate"
        ? 1.55
        : activityLevel === "active"
        ? 1.725
        : 1.9;

    const maintenance = bmr * activityFactor;

    return {
      ok: true,
      bmr: Math.round(bmr),
      maintenanceCalories: Math.round(maintenance),
      activityFactor,
    };
  },
});
