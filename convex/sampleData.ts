import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إضافة بيانات تجريبية للتمارين
export const addSampleExercises = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من صلاحيات الإدارة
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile?.isAdmin) {
      throw new ConvexError("ليس لديك صلاحية لإضافة البيانات التجريبية");
    }

    const sampleExercises = [
      {
        name: "Bench Press",
        nameAr: "ضغط البنش",
        description: "Compound exercise targeting chest, shoulders, and triceps with barbell",
        descriptionAr: "تمرين مركب يستهدف الصدر والأكتاف والترايسبس باستخدام البار",
        muscleGroup: "chest",
        muscleGroupAr: "الصدر",
        difficulty: "intermediate" as const,
        equipment: ["Barbell", "Bench"],
        instructions: [
          "Lie flat on bench with feet on ground",
          "Grip barbell wider than shoulder-width",
          "Lower bar to mid-chest slowly",
          "Press back up to starting position"
        ],
        instructionsAr: [
          "استلقِ على البنش مع تثبيت القدمين",
          "أمسك البار بقبضة أوسع من الكتفين",
          "اخفض البار ببطء إلى منتصف الصدر",
          "ادفع البار للأعلى للوضعية الأولى"
        ],
        videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
        duration: 45,
        reps: "8-12",
        sets: 4,
        caloriesBurned: 150,
        targetGender: "male" as const,
        category: "strength" as const,
        isActive: true,
      },
      {
        name: "Push-ups",
        nameAr: "تمرين الضغط",
        description: "Classic bodyweight exercise for chest, shoulders, and triceps",
        descriptionAr: "تمرين كلاسيكي لتقوية عضلات الصدر والأكتاف والذراعين",
        muscleGroup: "chest",
        muscleGroupAr: "الصدر",
        difficulty: "beginner" as const,
        equipment: ["لا يحتاج معدات"],
        instructions: [
          "Start in plank position",
          "Lower your body until chest nearly touches floor",
          "Push back up to starting position"
        ],
        instructionsAr: [
          "ابدأ في وضعية البلانك",
          "اخفض جسمك حتى يلامس صدرك الأرض تقريباً",
          "ادفع جسمك للأعلى للعودة للوضعية الأولى"
        ],
        videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
        duration: 15,
        reps: "10-15",
        sets: 3,
        caloriesBurned: 50,
        targetGender: "both" as const,
        category: "strength" as const,
        isActive: true,
      },
      {
        name: "Squats",
        nameAr: "تمرين القرفصاء",
        description: "Fundamental lower body exercise targeting quads, glutes, and hamstrings",
        descriptionAr: "تمرين أساسي للجزء السفلي يستهدف عضلات الفخذ والمؤخرة",
        muscleGroup: "legs",
        muscleGroupAr: "الأرجل",
        difficulty: "beginner" as const,
        equipment: ["لا يحتاج معدات"],
        instructions: [
          "Stand with feet shoulder-width apart",
          "Lower your body as if sitting back into a chair",
          "Keep your chest up and knees behind toes",
          "Return to standing position"
        ],
        instructionsAr: [
          "قف مع جعل قدميك بعرض الكتفين",
          "اخفض جسمك كما لو كنت تجلس على كرسي",
          "حافظ على صدرك مرفوعاً وركبتيك خلف أصابع القدمين",
          "عد للوضعية الأولى"
        ],
        videoUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
        duration: 20,
        reps: "12-20",
        sets: 3,
        caloriesBurned: 60,
        targetGender: "both" as const,
        category: "strength" as const,
        isActive: true,
      },
      {
        name: "Plank",
        nameAr: "تمرين البلانك",
        description: "Core strengthening exercise that targets abs and stabilizing muscles",
        descriptionAr: "تمرين لتقوية عضلات البطن والعضلات المثبتة",
        muscleGroup: "abs",
        muscleGroupAr: "البطن",
        difficulty: "beginner" as const,
        equipment: ["لا يحتاج معدات"],
        instructions: [
          "Start in push-up position",
          "Lower to forearms",
          "Keep body straight from head to heels",
          "Hold the position"
        ],
        instructionsAr: [
          "ابدأ في وضعية تمرين الضغط",
          "انزل على ساعديك",
          "حافظ على جسمك مستقيماً من الرأس للكعبين",
          "حافظ على هذه الوضعية"
        ],
        videoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
        duration: 30,
        reps: "30-60 ثانية",
        sets: 3,
        caloriesBurned: 25,
        targetGender: "both" as const,
        category: "strength" as const,
        isActive: true,
      },
      {
        name: "Jumping Jacks",
        nameAr: "تمرين النط المفتوح",
        description: "Full-body cardio exercise that increases heart rate",
        descriptionAr: "تمرين كارديو للجسم كاملاً يزيد من معدل ضربات القلب",
        muscleGroup: "full-body",
        muscleGroupAr: "الجسم كاملاً",
        difficulty: "beginner" as const,
        equipment: ["لا يحتاج معدات"],
        instructions: [
          "Start standing with feet together",
          "Jump while spreading legs and raising arms overhead",
          "Jump back to starting position",
          "Repeat continuously"
        ],
        instructionsAr: [
          "ابدأ واقفاً مع ضم القدمين",
          "انط مع فتح الساقين ورفع الذراعين فوق الرأس",
          "انط للعودة للوضعية الأولى",
          "كرر بشكل مستمر"
        ],
        videoUrl: "https://www.youtube.com/watch?v=c4DAnQ6DtF8",
        duration: 30,
        reps: "20-30",
        sets: 3,
        caloriesBurned: 80,
        targetGender: "both" as const,
        category: "cardio" as const,
        isActive: true,
      },
      {
        name: "Lunges",
        nameAr: "تمرين الطعن",
        description: "Lower body exercise targeting quads, glutes, and hamstrings",
        descriptionAr: "تمرين للجزء السفلي يستهدف عضلات الفخذ والمؤخرة",
        muscleGroup: "legs",
        muscleGroupAr: "الأرجل",
        difficulty: "intermediate" as const,
        equipment: ["لا يحتاج معدات"],
        instructions: [
          "Stand with feet hip-width apart",
          "Step forward with one leg",
          "Lower your hips until both knees are bent at 90 degrees",
          "Push back to starting position"
        ],
        instructionsAr: [
          "قف مع جعل قدميك بعرض الوركين",
          "اخط خطوة للأمام بساق واحدة",
          "اخفض وركيك حتى تنثني الركبتان بزاوية 90 درجة",
          "ادفع للعودة للوضعية الأولى"
        ],
        videoUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
        duration: 20,
        reps: "10-12 لكل ساق",
        sets: 3,
        caloriesBurned: 70,
        targetGender: "both" as const,
        category: "strength" as const,
        isActive: true,
      },
      {
        name: "Mountain Climbers",
        nameAr: "تمرين متسلق الجبال",
        description: "High-intensity cardio exercise that works the entire body",
        descriptionAr: "تمرين كارديو عالي الكثافة يعمل على الجسم كاملاً",
        muscleGroup: "full-body",
        muscleGroupAr: "الجسم كاملاً",
        difficulty: "intermediate" as const,
        equipment: ["لا يحتاج معدات"],
        instructions: [
          "Start in plank position",
          "Bring one knee toward chest",
          "Quickly switch legs",
          "Continue alternating rapidly"
        ],
        instructionsAr: [
          "ابدأ في وضعية البلانك",
          "اجلب ركبة واحدة نحو الصدر",
          "بدل الساقين بسرعة",
          "استمر في التبديل بسرعة"
        ],
        videoUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM",
        duration: 30,
        reps: "20-30",
        sets: 3,
        caloriesBurned: 100,
        targetGender: "both" as const,
        category: "cardio" as const,
        isActive: true,
      }
    ];

    for (const exercise of sampleExercises) {
      await ctx.db.insert("exercises", exercise);
    }

    return { message: "تم إضافة التمارين التجريبية بنجاح", count: sampleExercises.length };
  },
});

// إضافة بيانات تجريبية للأطعمة
export const addSampleFoods = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من صلاحيات الإدارة
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile?.isAdmin) {
      throw new ConvexError("ليس لديك صلاحية لإضافة البيانات التجريبية");
    }

    const sampleFoods = [
      {
        name: "Chicken Breast",
        nameAr: "صدر الدجاج",
        category: "بروتينات",
        categoryAr: "بروتينات",
        caloriesPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Brown Rice",
        nameAr: "الأرز البني",
        category: "حبوب",
        categoryAr: "حبوب",
        caloriesPer100g: 111,
        proteinPer100g: 2.6,
        carbsPer100g: 23,
        fatPer100g: 0.9,
        fiber: 1.8,
        sugar: 0.4,
        sodium: 5,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Broccoli",
        nameAr: "البروكلي",
        category: "خضروات",
        categoryAr: "خضروات",
        caloriesPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 7,
        fatPer100g: 0.4,
        fiber: 2.6,
        sugar: 1.5,
        sodium: 33,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Banana",
        nameAr: "الموز",
        category: "فواكه",
        categoryAr: "فواكه",
        caloriesPer100g: 89,
        proteinPer100g: 1.1,
        carbsPer100g: 23,
        fatPer100g: 0.3,
        fiber: 2.6,
        sugar: 12,
        sodium: 1,
        isDiabeticFriendly: false,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Greek Yogurt",
        nameAr: "الزبادي اليوناني",
        category: "منتجات الألبان",
        categoryAr: "منتجات الألبان",
        caloriesPer100g: 59,
        proteinPer100g: 10,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiber: 0,
        sugar: 3.6,
        sodium: 36,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Almonds",
        nameAr: "اللوز",
        category: "مكسرات",
        categoryAr: "مكسرات",
        caloriesPer100g: 579,
        proteinPer100g: 21,
        carbsPer100g: 22,
        fatPer100g: 50,
        fiber: 12,
        sugar: 4.4,
        sodium: 1,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: false,
      },
      {
        name: "Salmon",
        nameAr: "السلمون",
        category: "بروتينات",
        categoryAr: "بروتينات",
        caloriesPer100g: 208,
        proteinPer100g: 20,
        carbsPer100g: 0,
        fatPer100g: 13,
        fiber: 0,
        sugar: 0,
        sodium: 59,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Sweet Potato",
        nameAr: "البطاطا الحلوة",
        category: "خضروات",
        categoryAr: "خضروات",
        caloriesPer100g: 86,
        proteinPer100g: 1.6,
        carbsPer100g: 20,
        fatPer100g: 0.1,
        fiber: 3,
        sugar: 4.2,
        sodium: 54,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Spinach",
        nameAr: "السبانخ",
        category: "خضروات",
        categoryAr: "خضروات",
        caloriesPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        fiber: 2.2,
        sugar: 0.4,
        sodium: 79,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      },
      {
        name: "Oats",
        nameAr: "الشوفان",
        category: "حبوب",
        categoryAr: "حبوب",
        caloriesPer100g: 389,
        proteinPer100g: 17,
        carbsPer100g: 66,
        fatPer100g: 7,
        fiber: 11,
        sugar: 0.99,
        sodium: 2,
        isDiabeticFriendly: true,
        isSeniorFriendly: true,
        isChildFriendly: true,
      }
    ];

    for (const food of sampleFoods) {
      await ctx.db.insert("foods", food);
    }

    return { message: "تم إضافة الأطعمة التجريبية بنجاح", count: sampleFoods.length };
  },
});

// جعل المستخدم الأول إدارياً
export const makeFirstUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { isAdmin: true });
      return { message: "تم منحك صلاحيات الإدارة بنجاح!" };
    } else {
      throw new ConvexError("يجب إنشاء الملف الشخصي أولاً");
    }
  },
});
// ⚠️ مؤقت للاختبار فقط - بدون تسجيل دخول
export const seedExercisesNoAuth = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleExercises = [
      {
        name: "Bench Press",
        nameAr: "ضغط البنش",
        description:
          "Compound exercise targeting chest, shoulders, and triceps with barbell",
        descriptionAr:
          "تمرين مركب يستهدف الصدر والأكتاف والترايسبس باستخدام البار",
        muscleGroup: "chest",
        muscleGroupAr: "الصدر",
        difficulty: "intermediate" as const,
        equipment: ["Barbell", "Bench"] as string[],
        instructions: [
          "Lie flat on bench with feet on ground",
          "Grip barbell wider than shoulder-width",
          "Lower bar to mid-chest slowly",
          "Press back up to starting position",
        ] as string[],
        instructionsAr: [
          "استلقِ على البنش مع تثبيت القدمين",
          "أمسك البار بقبضة أوسع من الكتفين",
          "اخفض البار ببطء إلى منتصف الصدر",
          "ادفع البار للأعلى للوضعية الأولى",
        ] as string[],
        videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
        duration: 45,
        reps: "8-12",
        sets: 4,
        caloriesBurned: 150,
        targetGender: "both" as const,
        category: "strength" as const,
        isActive: true,
      },
      {
        name: "Push-ups",
        nameAr: "تمرين الضغط",
        description: "Classic bodyweight exercise for chest, shoulders, and triceps",
        descriptionAr: "تمرين كلاسيكي لتقوية عضلات الصدر والأكتاف والذراعين",
        muscleGroup: "chest",
        muscleGroupAr: "الصدر",
        difficulty: "beginner" as const,
        equipment: ["لا يحتاج معدات"] as string[],
        instructions: [
          "Start in plank position",
          "Lower your body until chest nearly touches floor",
          "Push back up to starting position",
        ] as string[],
        instructionsAr: [
          "ابدأ في وضعية البلانك",
          "اخفض جسمك حتى يلامس صدرك الأرض تقريباً",
          "ادفع جسمك للأعلى للعودة للوضعية الأولى",
        ] as string[],
        videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
        duration: 15,
        reps: "10-15",
        sets: 3,
        caloriesBurned: 50,
        targetGender: "both" as const,
        category: "strength" as const,
        isActive: true,
      },
    ];

    for (const ex of sampleExercises) {
      await ctx.db.insert("exercises", ex);
    }

    return { ok: true, count: sampleExercises.length };
  },
});
