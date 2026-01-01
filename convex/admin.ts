import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// يجعل مستخدم Admin حسب الإيميل (تشغيل مرة واحدة ثم احذفها)
export const makeAdminByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) throw new ConvexError("لم يتم العثور على مستخدم بهذا الإيميل");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) {
      throw new ConvexError("لا يوجد Profile لهذا المستخدم. افتح التطبيق وسوِّ ProfileSetup أولاً ثم جرّب مرة ثانية");
    }

    await ctx.db.patch(profile._id, { isAdmin: true });
    return { ok: true, userId: user._id, profileId: profile._id };
  },
});
