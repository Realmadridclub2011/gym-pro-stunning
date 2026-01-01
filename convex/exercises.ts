import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

/* =========================
   Helpers
========================= */
async function assertAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("يجب تسجيل الدخول");

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile?.isAdmin) {
    throw new ConvexError("ليس لديك صلاحية الإدارة");
  }
}

/* =========================
   QUERIES
========================= */

// للواجهة العامة
export const getAllExercises = query({
  args: {
    muscleGroup: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))
    ),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    category: v.optional(
      v.union(
        v.literal("strength"),
        v.literal("cardio"),
        v.literal("flexibility"),
        v.literal("balance")
      )
    ),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("exercises")
      .filter((x) => x.eq(x.field("isActive"), true));

    if (args.muscleGroup) {
      q = q.filter((x) => x.eq(x.field("muscleGroup"), args.muscleGroup));
    }

    if (args.difficulty) {
      q = q.filter((x) => x.eq(x.field("difficulty"), args.difficulty));
    }

    if (args.gender) {
      q = q.filter((x) =>
        x.or(
          x.eq(x.field("targetGender"), args.gender),
          x.eq(x.field("targetGender"), "both")
        )
      );
    }

    if (args.category) {
      q = q.filter((x) => x.eq(x.field("category"), args.category));
    }

    return await q.collect();
  },
});

// للـ Admin (بحث + عرض غير المفعّل)
export const adminListExercises = query({
  args: {
    q: v.optional(v.string()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("exercises").collect();

    if (!args.includeInactive) {
      items = items.filter((x: any) => x.isActive);
    }

    if (args.q) {
      const s = args.q.toLowerCase();
      items = items.filter((x: any) =>
        (x.nameAr || "").toLowerCase().includes(s) ||
        (x.name || "").toLowerCase().includes(s) ||
        (x.muscleGroupAr || "").toLowerCase().includes(s)
      );
    }

    return items;
  },
});

/* =========================
   MUTATIONS (ADMIN)
========================= */

export const addExercise = mutation({
  args: {
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
    duration: v.optional(v.number()),
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
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    return await ctx.db.insert("exercises", {
      ...args,
      isActive: true,
    });
  },
});

export const updateExercise = mutation({
  args: {
    exerciseId: v.id("exercises"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    muscleGroup: v.optional(v.string()),
    muscleGroupAr: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))
    ),
    equipment: v.optional(v.array(v.string())),
    instructions: v.optional(v.array(v.string())),
    instructionsAr: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    reps: v.optional(v.string()),
    sets: v.optional(v.number()),
    caloriesBurned: v.optional(v.number()),
    targetGender: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("both"))
    ),
    category: v.optional(
      v.union(
        v.literal("strength"),
        v.literal("cardio"),
        v.literal("flexibility"),
        v.literal("balance")
      )
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const { exerciseId, ...patch } = args;
    await ctx.db.patch(exerciseId, patch);
    return true;
  },
});

export const deleteExercise = mutation({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    await ctx.db.delete(args.exerciseId);
    return true;
  },
});

/* =========================
   USER WORKOUT TRACKING
========================= */

// تسجيل جلسة تمرين للمستخدم
export const logWorkoutSession = mutation({
  args: {
    exerciseId: v.id("exercises"),
    duration: v.number(),
    sets: v.number(),
    reps: v.array(v.number()),
    weight: v.optional(v.array(v.number())),
    caloriesBurned: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db.insert("workoutSessions", {
      userId,
      date: today,
      ...args,
    });
  },
});

// إحصائيات التمارين للمستخدم (التي يتم استدعاؤها في الواجهة)
export const getUserWorkoutStats = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let q = ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (x) => x.eq("userId", userId));

    if (args.startDate) {
      q = q.filter((x) => x.gte(x.field("date"), args.startDate!));
    }
    if (args.endDate) {
      q = q.filter((x) => x.lte(x.field("date"), args.endDate!));
    }

    const sessions = await q.collect();

    const totalSessions = sessions.length;
    const totalCaloriesBurned = sessions.reduce((sum, s: any) => sum + (s.caloriesBurned || 0), 0);
    const totalDuration = sessions.reduce((sum, s: any) => sum + (s.duration || 0), 0);

    return {
      totalSessions,
      totalCaloriesBurned,
      totalDuration,
      averageCaloriesPerSession: totalSessions ? Math.round(totalCaloriesBurned / totalSessions) : 0,
      averageDurationPerSession: totalSessions ? Math.round(totalDuration / totalSessions) : 0,
    };
  },
});
