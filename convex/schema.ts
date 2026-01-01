import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول المستخدمين الإضافي
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    age: v.optional(v.number()),
    gender: v.union(v.literal("male"), v.literal("female")),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    fitnessLevel: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
	    ),
		  role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    goals: v.array(v.string()),
    medicalConditions: v.optional(v.array(v.string())),
    isAdmin: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  // جدول التمارين
  exercises: defineTable({
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    descriptionAr: v.string(),
    muscleGroup: v.string(),
    muscleGroupAr: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    equipment: v.array(v.string()),
    instructions: v.array(v.string()),
    instructionsAr: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()), // بالدقائق
    reps: v.optional(v.string()),
    sets: v.optional(v.number()),
    caloriesBurned: v.optional(v.number()),
    targetGender: v.union(v.literal("male"), v.literal("female"), v.literal("both")),
    category: v.union(
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("flexibility"),
      v.literal("balance")
    ),
    isActive: v.boolean(),
  })
    .index("by_muscle_group", ["muscleGroup"])
    .index("by_difficulty", ["difficulty"])
    .index("by_gender", ["targetGender"])
    .index("by_category", ["category"]),

  // جدول خطط التغذية
  nutritionPlans: defineTable({
    name: v.string(),
    nameAr: v.string(),
    description: v.string(),
    descriptionAr: v.string(),
    targetGroup: v.union(
      v.literal("general"),
      v.literal("diabetes"),
      v.literal("seniors"),
      v.literal("children")
    ),
    meals: v.array(
      v.object({
        name: v.string(),
        nameAr: v.string(),
        time: v.string(),
        foods: v.array(
          v.object({
            name: v.string(),
            nameAr: v.string(),
            quantity: v.string(),
            calories: v.number(),
            protein: v.number(),
            carbs: v.number(),
            fat: v.number(),
          })
        ),
        totalCalories: v.number(),
      })
    ),
    totalDailyCalories: v.number(),
    isActive: v.boolean(),
  }).index("by_target_group", ["targetGroup"]),

  // جدول الأطعمة
 // جدول الأطعمة
foods: defineTable({
  name: v.string(),
  nameAr: v.string(),
  category: v.string(),
  categoryAr: v.string(),

  mealType: v.optional(
    v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    )
  ),

  caloriesPer100g: v.number(),
  proteinPer100g: v.number(),
  carbsPer100g: v.number(),
  fatPer100g: v.number(),
  fiber: v.optional(v.number()),
  sugar: v.optional(v.number()),
  sodium: v.optional(v.number()),
  isDiabeticFriendly: v.boolean(),
  isSeniorFriendly: v.boolean(),
  isChildFriendly: v.boolean(),
})
  .index("by_category", ["category"])
  .index("by_categoryAr", ["categoryAr"]) // ✅ جديد
  .index("by_mealType", ["mealType"])
  .index("by_category_mealType", ["category", "mealType"])
  .index("by_categoryAr_mealType", ["categoryAr", "mealType"]) // ✅ جديد
  .index("by_diabetic_friendly", ["isDiabeticFriendly"])
  .index("by_senior_friendly", ["isSeniorFriendly"])
  .index("by_child_friendly", ["isChildFriendly"]),

  // جدول تتبع التمارين للمستخدمين
  workoutSessions: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    date: v.string(),
    duration: v.number(),
    sets: v.number(),
    reps: v.array(v.number()),
    weight: v.optional(v.array(v.number())),
    caloriesBurned: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_exercise", ["exerciseId"]),
	


  // جدول تتبع التغذية للمستخدمين
  nutritionLogs: defineTable({
    userId: v.id("users"),
    date: v.string(),
    meals: v.array(
      v.object({
        mealType: v.union(
          v.literal("breakfast"),
          v.literal("lunch"),
          v.literal("dinner"),
          v.literal("snack")
        ),
        foods: v.array(
          v.object({
            foodId: v.id("foods"),
            quantity: v.number(), // بالجرام
            calories: v.number(),
          })
        ),
        totalCalories: v.number(),
      })
    ),
    totalDailyCalories: v.number(),
    waterIntake: v.optional(v.number()), // باللتر
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // جدول المقالات والنصائح
  articles: defineTable({
    title: v.string(),
    titleAr: v.string(),
    content: v.string(),
    contentAr: v.string(),
    category: v.union(
      v.literal("fitness"),
      v.literal("nutrition"),
      v.literal("health"),
      v.literal("diabetes"),
      v.literal("seniors"),
      v.literal("children")
    ),
    author: v.string(),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    publishDate: v.string(),
  })
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  // جدول المدربين
    coaches: defineTable({
    name: v.string(),
    nameAr: v.string(),
    specialty: v.string(),
    specialtyAr: v.string(),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    bioAr: v.optional(v.string()),
    image: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    rating: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
			imageStorageId: v.optional(v.id("_storage")),
imageUrl: v.optional(v.string()),

			  })
    .index("by_active", ["isActive"])
    .index("by_createdAt", ["createdAt"]),

};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
