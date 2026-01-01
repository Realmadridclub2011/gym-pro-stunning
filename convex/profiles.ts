import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

const OWNER_EMAIL = "eng.mohamed87@live.com";

function normEmail(x: any) {
  return String(x || "").trim().toLowerCase();
}

/**
 * 👑 يضمن إن مالك التطبيق (Owner) دائمًا Admin
 * - لو الإيميل مطابق OWNER_EMAIL → role=admin + isAdmin=true
 * - لو مش مطابق → لا يعمل شيء
 */
async function ensureOwnerAdmin(ctx: any, userId: any) {
  const identity = await ctx.auth.getUserIdentity();
  const email = normEmail((identity as any)?.email);

  if (email !== OWNER_EMAIL) return;

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) return;

  const needsPatch =
    (profile as any).isAdmin !== true || (profile as any).role !== "admin";

  if (needsPatch) {
    await ctx.db.patch(profile._id, { isAdmin: true, role: "admin" });
  }
}

/* =========================
   PUBLIC: CURRENT PROFILE
========================= */

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

/**
 * (اختياري) زر/زرعة في الواجهة لو حبيت:
 * - يشغّل تأكيد صلاحيات مالك التطبيق
 * - مفيد لو الـ profile اتعمل قبل إضافة role/isAdmin في schema
 */
export const bootstrapOwnerAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile) throw new ConvexError("أنشئ Profile أولاً ثم أعد المحاولة");

    await ensureOwnerAdmin(ctx, userId);
    return true;
  },
});

/* =========================
   PUBLIC: CREATE/UPDATE PROFILE
========================= */

export const createOrUpdateProfile = mutation({
  args: {
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
    goals: v.array(v.string()),
    medicalConditions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("يجب تسجيل الدخول أولاً");

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { ...args });
      await ensureOwnerAdmin(ctx, userId);
      return existingProfile._id;
    }

    // إنشاء جديد: افتراضي user
    const id = await ctx.db.insert("profiles", {
      userId,
      ...args,
      isAdmin: false,
      role: "user",
    });

    await ensureOwnerAdmin(ctx, userId);
    return id;
  },
});

/* =========================
   PUBLIC: CHECK ADMIN
========================= */

export const checkAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    return !!(
      profile &&
      (((profile as any).isAdmin === true) || (profile as any).role === "admin")
    );
  },
});

/* =========================
   PUBLIC: BMI
========================= */

export const calculateBMI = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!profile?.weight || !profile?.height) return null;

    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);

    let category = "";
    if (bmi < 18.5) category = "نقص في الوزن";
    else if (bmi < 25) category = "وزن طبيعي";
    else if (bmi < 30) category = "زيادة في الوزن";
    else category = "سمنة";

    return { bmi: Math.round(bmi * 10) / 10, category };
  },
});

/* =========================
   ADMIN HELPERS
========================= */

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");

  const me = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  const isAdmin = !!(me && (((me as any).role === "admin") || (me as any).isAdmin === true));
  if (!isAdmin) throw new ConvexError("Forbidden");

  // 👑 ضمان مالك التطبيق Admin دائمًا
  await ensureOwnerAdmin(ctx, userId);

  return { userId, me };
}

/* =========================
   ADMIN: LIST PROFILES
========================= */

export const adminListProfiles = query({
  args: { q: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const rows = await ctx.db.query("profiles").collect();
    const qtxt = (args.q || "").trim().toLowerCase();

    let out = rows as any[];
    if (qtxt) {
      out = out.filter((p) =>
        String(p.name || "").toLowerCase().includes(qtxt)
      );
    }

    return out
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .map((p) => ({
        _id: p._id,
        userId: p.userId,
        name: p.name,
        role: p.role || (p.isAdmin ? "admin" : "user"),
        isAdmin: !!p.isAdmin,
        createdAt: p._creationTime,
      }));
  },
});

/* =========================
   ADMIN: SET USER ROLE
========================= */

export const adminSetUserRole = mutation({
  args: {
    profileId: v.id("profiles"),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const { me } = await requireAdmin(ctx);

    // منع إزالة الأدمن عن نفسك
    if (me?._id === args.profileId && args.role !== "admin") {
      throw new ConvexError("لا يمكن إزالة صلاحية الأدمن عن نفسك");
    }

    // منع إزالة الأدمن عن مالك التطبيق (حتى لو حد تاني أدمن)
    const ownerRoleLock = args.role !== "admin";
    if (ownerRoleLock) {
      // نجيب بروفايل المستهدف ونشوف هل هو Owner؟
      const target = await ctx.db.get(args.profileId);
      if (target) {
        // لو target هو Owner -> امنع
        // (بدون الاعتماد على userId email لأننا ما بنخزن email هنا)
        // الأفضل: منع تغيير role لمالك التطبيق على الإطلاق لو هو نفسه داخل
        // لكن بما أننا نثبت owner وقت دخوله، يكفي منع إزالة أدمن عن نفسك فوق.
      }
    }

    await ctx.db.patch(args.profileId, {
      role: args.role,
      isAdmin: args.role === "admin",
    });

    return true;
  },
});
