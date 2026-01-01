import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

type TabId = "exercises" | "foods" | "plans" | "coaches" | "users";

const TABS = [
  { id: "exercises", label: "التمارين", icon: "💪" },
  { id: "foods", label: "الأطعمة", icon: "🥗" },
  { id: "plans", label: "الخطط الغذائية", icon: "📋" },
  { id: "coaches", label: "المدربون", icon: "🧑‍🏫" }, // ✅ جديد
  { id: "users", label: "المستخدمون", icon: "👤" },
] as const;


function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function Confirm({ open, title, desc, onCancel, onConfirm }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-5">
          <div className="text-lg font-extrabold text-gray-900">{title}</div>
          {desc ? <div className="text-sm text-gray-600 mt-2 leading-relaxed">{desc}</div> : null}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({ open, title, children, onClose }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-200">
          <div className="text-lg font-extrabold text-gray-900">{title}</div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <div className="text-sm font-extrabold text-gray-800 mb-2">{label}</div>
      {children}
    </div>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("exercises");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">لوحة تحكم الإدارة</h2>
          <p className="text-gray-600 mt-1">إدارة المحتوى: إضافة / تعديل / حذف / تفعيل</p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-black text-white">
          <span className="text-green-400">●</span>
          <span className="text-sm font-bold">Admin</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-4 py-3 rounded-xl font-extrabold whitespace-nowrap transition flex items-center gap-2",
                activeTab === t.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-transparent"
              )}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
        {activeTab === "exercises" && <ExercisesAdmin />}
        {activeTab === "foods" && <FoodsAdmin />}
        {activeTab === "plans" && <PlansAdmin />}
				{activeTab === "coaches" && <CoachesAdmin />}
				{activeTab === "users" && <UsersAdmin />}
      </div>

      <StyleBlock />
    </div>
  );
}

/* =========================
   EXERCISES ADMIN
========================= */

function ExercisesAdmin() {
  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const items = useQuery(api.exercises.adminListExercises, {
    q: q.trim() ? q.trim() : undefined,
    includeInactive,
  });

  const addExercise = useMutation(api.exercises.addExercise);
  const updateExercise = useMutation(api.exercises.updateExercise);
  const deleteExercise = useMutation(api.exercises.deleteExercise);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyForm = useMemo(
    () => ({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      muscleGroup: "",
      muscleGroupAr: "",
      difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
      equipment: "" as string,
      instructions: "" as string,
      instructionsAr: "" as string,
      imageUrl: "",
      videoUrl: "",
      duration: "",
      reps: "",
      sets: "",
      caloriesBurned: "",
      targetGender: "both" as "male" | "female" | "both",
      category: "strength" as "strength" | "cardio" | "flexibility" | "balance",
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      description: row.description ?? "",
      descriptionAr: row.descriptionAr ?? "",
      muscleGroup: row.muscleGroup ?? "",
      muscleGroupAr: row.muscleGroupAr ?? "",
      difficulty: row.difficulty ?? "beginner",
      equipment: (row.equipment ?? []).join(", "),
      instructions: (row.instructions ?? []).join("\n"),
      instructionsAr: (row.instructionsAr ?? []).join("\n"),
      imageUrl: row.imageUrl ?? "",
      videoUrl: row.videoUrl ?? "",
      duration: row.duration ? String(row.duration) : "",
      reps: row.reps ?? "",
      sets: row.sets ? String(row.sets) : "",
      caloriesBurned: row.caloriesBurned ? String(row.caloriesBurned) : "",
      targetGender: row.targetGender ?? "both",
      category: row.category ?? "strength",
      isActive: row.isActive ?? true,
    });
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteExercise({ exerciseId: toDelete._id });
      toast.success("تم حذف التمرين");
    } catch (e: any) {
      toast.error(e?.message || "حدث خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const equipmentArr = form.equipment
        ? String(form.equipment).split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const instructionsArr = form.instructions
        ? String(form.instructions).split("\n").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const instructionsArArr = form.instructionsAr
        ? String(form.instructionsAr).split("\n").map((s: string) => s.trim()).filter(Boolean)
        : [];

      if (!form.nameAr || !form.name || !form.muscleGroupAr || !form.muscleGroup) {
        toast.error("أكمل الحقول الأساسية (الأسماء + المجموعة العضلية)");
        return;
      }

      if (!editing) {
        await addExercise({
          name: form.name,
          nameAr: form.nameAr,
          description: form.description || "",
          descriptionAr: form.descriptionAr || "",
          muscleGroup: form.muscleGroup,
          muscleGroupAr: form.muscleGroupAr,
          difficulty: form.difficulty,
          equipment: equipmentArr,
          instructions: instructionsArr,
          instructionsAr: instructionsArArr,
          imageUrl: form.imageUrl || undefined,
          videoUrl: form.videoUrl || undefined,
          duration: form.duration ? parseInt(form.duration) : undefined,
          reps: form.reps || undefined,
          sets: form.sets ? parseInt(form.sets) : undefined,
          caloriesBurned: form.caloriesBurned ? parseInt(form.caloriesBurned) : undefined,
          targetGender: form.targetGender,
          category: form.category,
        });
        toast.success("تم إضافة التمرين");
      } else {
        await updateExercise({
          exerciseId: editing._id,
          name: form.name,
          nameAr: form.nameAr,
          description: form.description,
          descriptionAr: form.descriptionAr,
          muscleGroup: form.muscleGroup,
          muscleGroupAr: form.muscleGroupAr,
          difficulty: form.difficulty,
          equipment: equipmentArr,
          instructions: instructionsArr,
          instructionsAr: instructionsArArr,
          imageUrl: form.imageUrl || undefined,
          videoUrl: form.videoUrl || undefined,
          duration: form.duration ? parseInt(form.duration) : undefined,
          reps: form.reps || undefined,
          sets: form.sets ? parseInt(form.sets) : undefined,
          caloriesBurned: form.caloriesBurned ? parseInt(form.caloriesBurned) : undefined,
          targetGender: form.targetGender,
          category: form.category,
          isActive: !!form.isActive,
        });
        toast.success("تم تحديث التمرين");
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast.error(e?.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updateExercise({ exerciseId: row._id, isActive: !row.isActive });
      toast.success(row.isActive ? "تم إلغاء تفعيل التمرين" : "تم تفعيل التمرين");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل تمرين" : "إضافة تمرين جديد"}
        onClose={() => setOpenForm(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="اسم عربي *">
              <input
                value={form.nameAr}
                onChange={(e) => setForm((p: any) => ({ ...p, nameAr: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="اسم إنجليزي *">
              <input
                value={form.name}
                onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="المجموعة العضلية عربي *">
              <input
                value={form.muscleGroupAr}
                onChange={(e) => setForm((p: any) => ({ ...p, muscleGroupAr: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="المجموعة العضلية إنجليزي *">
              <input
                value={form.muscleGroup}
                onChange={(e) => setForm((p: any) => ({ ...p, muscleGroup: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="الصعوبة">
              <select
                value={form.difficulty}
                onChange={(e) => setForm((p: any) => ({ ...p, difficulty: e.target.value }))}
                className="input"
              >
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </Field>

            <Field label="الجنس المستهدف">
              <select
                value={form.targetGender}
                onChange={(e) => setForm((p: any) => ({ ...p, targetGender: e.target.value }))}
                className="input"
              >
                <option value="both">الجميع</option>
                <option value="male">رجال</option>
                <option value="female">نساء</option>
              </select>
            </Field>

            <Field label="النوع">
              <select
                value={form.category}
                onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))}
                className="input"
              >
                <option value="strength">قوة</option>
                <option value="cardio">كارديو</option>
                <option value="flexibility">مرونة</option>
                <option value="balance">توازن</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="معدات (افصل بفواصل)">
              <input
                value={form.equipment}
                onChange={(e) => setForm((p: any) => ({ ...p, equipment: e.target.value }))}
                className="input"
                placeholder="Dumbbell, Barbell..."
              />
            </Field>
            <Field label="سعرات محروقة (اختياري)">
              <input
                value={form.caloriesBurned}
                onChange={(e) => setForm((p: any) => ({ ...p, caloriesBurned: e.target.value }))}
                className="input"
                inputMode="numeric"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="رابط صورة (اختياري)">
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((p: any) => ({ ...p, imageUrl: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="رابط فيديو (اختياري)">
              <input
                value={form.videoUrl}
                onChange={(e) => setForm((p: any) => ({ ...p, videoUrl: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          <Field label="وصف عربي">
            <textarea
              value={form.descriptionAr}
              onChange={(e) => setForm((p: any) => ({ ...p, descriptionAr: e.target.value }))}
              className="input"
              rows={3}
            />
          </Field>

          <Field label="تعليمات عربي (كل سطر خطوة)">
            <textarea
              value={form.instructionsAr}
              onChange={(e) => setForm((p: any) => ({ ...p, instructionsAr: e.target.value }))}
              className="input"
              rows={4}
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => setForm((p: any) => ({ ...p, isActive: e.target.checked }))}
              />
              تفعيل التمرين
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button type="submit" className="btn-primary">
                حفظ
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input w-full md:w-[360px]"
            placeholder="بحث بالاسم أو العضلة..."
          />
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            عرض غير المفعّل
          </label>
        </div>

        <button onClick={openAdd} className="btn-primary">
          + إضافة تمرين
        </button>
      </div>

      {/* List */}
      {items === undefined ? (
        <div className="py-12 text-center text-gray-500">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-gray-500">لا توجد بيانات</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((x: any) => (
            <div key={x._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-gray-900">{x.nameAr}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {x.muscleGroupAr} • {x.difficulty} • {x.category}
                  </div>
                </div>
                <span className={cn("badge", x.isActive ? "badge-on" : "badge-off")}>
                  {x.isActive ? "مفعّل" : "غير مفعّل"}
                </span>
              </div>

              <div className="text-sm text-gray-600 mt-3 line-clamp-2">
                {x.descriptionAr || "—"}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(x)} className="btn-secondary flex-1">
                  تعديل
                </button>
                <button
                  onClick={() => toggleActive(x)}
                  className="btn-green flex-1"
                >
                  {x.isActive ? "إلغاء تفعيل" : "تفعيل"}
                </button>
                <button onClick={() => askDelete(x)} className="btn-danger">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   FOODS ADMIN (CRUD)
========================= */

function FoodsAdmin() {
  const foods = useQuery(api.nutrition.getAllFoods, {});
  const addFood = useMutation(api.nutrition.addFood);
  const updateFood = useMutation(api.nutrition.updateFood);
  const deleteFood = useMutation(api.nutrition.deleteFood);

  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const [form, setForm] = useState<any>({
    name: "",
    nameAr: "",
    category: "",
    categoryAr: "",
    caloriesPer100g: "",
    proteinPer100g: "",
    carbsPer100g: "",
    fatPer100g: "",
    fiber: "",
    sugar: "",
    sodium: "",
    isDiabeticFriendly: false,
    isSeniorFriendly: false,
    isChildFriendly: false,
  });

  const filtered = useMemo(() => {
    if (!foods) return foods;
    const s = q.trim().toLowerCase();
    if (!s) return foods;
    return foods.filter((f: any) =>
      (f.nameAr || "").toLowerCase().includes(s) ||
      (f.name || "").toLowerCase().includes(s) ||
      (f.categoryAr || "").toLowerCase().includes(s) ||
      (f.category || "").toLowerCase().includes(s)
    );
  }, [foods, q]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      nameAr: "",
      category: "",
      categoryAr: "",
      caloriesPer100g: "",
      proteinPer100g: "",
      carbsPer100g: "",
      fatPer100g: "",
      fiber: "",
      sugar: "",
      sodium: "",
      isDiabeticFriendly: false,
      isSeniorFriendly: false,
      isChildFriendly: false,
    });
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      category: row.category ?? "",
      categoryAr: row.categoryAr ?? "",
      caloriesPer100g: String(row.caloriesPer100g ?? ""),
      proteinPer100g: String(row.proteinPer100g ?? ""),
      carbsPer100g: String(row.carbsPer100g ?? ""),
      fatPer100g: String(row.fatPer100g ?? ""),
      fiber: row.fiber !== undefined ? String(row.fiber) : "",
      sugar: row.sugar !== undefined ? String(row.sugar) : "",
      sodium: row.sodium !== undefined ? String(row.sodium) : "",
      isDiabeticFriendly: !!row.isDiabeticFriendly,
      isSeniorFriendly: !!row.isSeniorFriendly,
      isChildFriendly: !!row.isChildFriendly,
    });
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteFood({ foodId: toDelete._id });
      toast.success("تم حذف الطعام");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.name || !form.categoryAr || !form.category) {
        toast.error("أكمل الحقول الأساسية (الأسماء + التصنيف)");
        return;
      }

      const payload = {
        name: form.name,
        nameAr: form.nameAr,
        category: form.category,
        categoryAr: form.categoryAr,
        caloriesPer100g: Number(form.caloriesPer100g),
        proteinPer100g: Number(form.proteinPer100g),
        carbsPer100g: Number(form.carbsPer100g),
        fatPer100g: Number(form.fatPer100g),
        fiber: form.fiber ? Number(form.fiber) : undefined,
        sugar: form.sugar ? Number(form.sugar) : undefined,
        sodium: form.sodium ? Number(form.sodium) : undefined,
        isDiabeticFriendly: !!form.isDiabeticFriendly,
        isSeniorFriendly: !!form.isSeniorFriendly,
        isChildFriendly: !!form.isChildFriendly,
      };

      if (!editing) {
        await addFood(payload);
        toast.success("تم إضافة الطعام");
      } else {
        await updateFood({ foodId: editing._id, patch: payload });
        toast.success("تم تحديث الطعام");
      }

      setOpenForm(false);
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal open={openForm} title={editing ? "تعديل طعام" : "إضافة طعام"} onClose={() => setOpenForm(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="اسم عربي *">
              <input className="input" value={form.nameAr} onChange={(e) => setForm((p: any) => ({ ...p, nameAr: e.target.value }))} />
            </Field>
            <Field label="اسم إنجليزي *">
              <input className="input" value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="تصنيف عربي *">
              <input className="input" value={form.categoryAr} onChange={(e) => setForm((p: any) => ({ ...p, categoryAr: e.target.value }))} />
            </Field>
            <Field label="تصنيف إنجليزي *">
              <input className="input" value={form.category} onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="سعرات/100g">
              <input className="input" inputMode="numeric" value={form.caloriesPer100g} onChange={(e) => setForm((p: any) => ({ ...p, caloriesPer100g: e.target.value }))} />
            </Field>
            <Field label="بروتين/100g">
              <input className="input" inputMode="numeric" value={form.proteinPer100g} onChange={(e) => setForm((p: any) => ({ ...p, proteinPer100g: e.target.value }))} />
            </Field>
            <Field label="كارب/100g">
              <input className="input" inputMode="numeric" value={form.carbsPer100g} onChange={(e) => setForm((p: any) => ({ ...p, carbsPer100g: e.target.value }))} />
            </Field>
            <Field label="دهون/100g">
              <input className="input" inputMode="numeric" value={form.fatPer100g} onChange={(e) => setForm((p: any) => ({ ...p, fatPer100g: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700">
              <input type="checkbox" checked={!!form.isDiabeticFriendly} onChange={(e) => setForm((p: any) => ({ ...p, isDiabeticFriendly: e.target.checked }))} />
              مناسب للسكري
            </label>
            <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700">
              <input type="checkbox" checked={!!form.isSeniorFriendly} onChange={(e) => setForm((p: any) => ({ ...p, isSeniorFriendly: e.target.checked }))} />
              مناسب لكبار السن
            </label>
            <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700">
              <input type="checkbox" checked={!!form.isChildFriendly} onChange={(e) => setForm((p: any) => ({ ...p, isChildFriendly: e.target.checked }))} />
              مناسب للأطفال
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenForm(false)} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn-primary">
              حفظ
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input className="input w-full md:w-[360px]" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في الأطعمة..." />
        <button onClick={openAdd} className="btn-primary">
          + إضافة طعام
        </button>
      </div>

      {foods === undefined ? (
        <div className="py-12 text-center text-gray-500">جاري التحميل...</div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">لا توجد بيانات</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((f: any) => (
            <div key={f._id} className="card">
              <div className="font-extrabold text-gray-900">{f.nameAr}</div>
              <div className="text-xs text-gray-500 mt-1">{f.categoryAr}</div>

              <div className="mt-3 text-sm text-gray-700">
                <div>سعرات: <b>{f.caloriesPer100g}</b></div>
                <div className="text-xs text-gray-500 mt-1">
                  بروتين {f.proteinPer100g} • كارب {f.carbsPer100g} • دهون {f.fatPer100g}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(f)} className="btn-secondary flex-1">
                  تعديل
                </button>
                <button onClick={() => askDelete(f)} className="btn-danger">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   PLANS ADMIN (FULL CRUD)
========================= */

type PlanTarget = "general" | "diabetes" | "seniors" | "children";

type PlanFood = {
  name: string;
  nameAr: string;
  quantity: string; // نص (زي schema)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type PlanMeal = {
  name: string;
  nameAr: string;
  time: string;
  foods: PlanFood[];
  totalCalories: number;
};

function calcMealTotal(foods: PlanFood[]) {
  return foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
}

function calcPlanTotal(meals: PlanMeal[]) {
  return meals.reduce((sum, m) => sum + (Number(m.totalCalories) || 0), 0);
}
function CoachesAdmin() {
  const coaches = useQuery(api.coaches.adminList) || [];
  const createCoach = useMutation(api.coaches.create);
  const updateCoach = useMutation(api.coaches.update);
  const removeCoach = useMutation(api.coaches.remove);

  // ✅ رفع ملفات
  const genUploadUrl = useMutation(api.files.generateUploadUrl);
  const seedCoaches = useMutation(api.coaches.seedSampleCoaches);

  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let rows = coaches as any[];
    if (!includeInactive) rows = rows.filter((c) => c.isActive);
    if (!s) return rows;
    return rows.filter((c) => {
      const hay = `${c.nameAr || c.name || ""} ${c.specialtyAr || c.specialty || ""} ${c.whatsapp || ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [coaches, q, includeInactive]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyForm = useMemo(
    () => ({
      name: "",
      nameAr: "",
      specialty: "",
      specialtyAr: "",
      experience: "",
      bio: "",
      bioAr: "",
      imageUrl: "", // رابط اختياري
      imageStorageId: undefined as any, // ✅ صورة مرفوعة
      whatsapp: "",
      rating: "5",
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setLocalPreview("");
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      specialty: row.specialty ?? "",
      specialtyAr: row.specialtyAr ?? "",
      experience: row.experience ?? "",
      bio: row.bio ?? "",
      bioAr: row.bioAr ?? "",
      imageUrl: row.imageUrl ?? "",
      imageStorageId: row.imageStorageId ?? undefined,
      whatsapp: row.whatsapp ?? "",
      rating: String(row.rating ?? 5),
      isActive: !!row.isActive,
    });
    setLocalPreview(row.imageResolved || row.imageUrl || "");
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await removeCoach({ id: toDelete._id });
      toast.success("تم حذف المدرب");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحذف");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updateCoach({ id: row._id, isActive: !row.isActive });
      toast.success(row.isActive ? "تم إخفاء المدرب" : "تم إظهار المدرب");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  // ✅ Upload image from computer → storageId
  const onPickFile = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploading(true);

      // preview local
      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);

      // get upload url from convex
      const uploadUrl = await genUploadUrl({});

      // upload to convex
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json(); // { storageId: "..." }
      const storageId = json.storageId;

      setForm((p: any) => ({
        ...p,
        imageStorageId: storageId,
      }));

      toast.success("تم رفع الصورة بنجاح");
    } catch (e: any) {
      toast.error(e?.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.name) {
        toast.error("أكمل اسم المدرب عربي/إنجليزي");
        return;
      }
      if (!form.specialtyAr || !form.specialty) {
        toast.error("أكمل التخصص عربي/إنجليزي");
        return;
      }

      const payload: any = {
        name: form.name,
        nameAr: form.nameAr,
        specialty: form.specialty,
        specialtyAr: form.specialtyAr,
        experience: form.experience || "—",
        bio: form.bio || "",
        bioAr: form.bioAr || "",
        whatsapp: form.whatsapp ? form.whatsapp : undefined,
        rating: Number(form.rating || "5"),
        isActive: !!form.isActive,

        // ✅ الصورة: ممكن رابط أو upload أو الاتنين
        imageUrl: form.imageUrl ? String(form.imageUrl).trim() : undefined,
        imageStorageId: form.imageStorageId || undefined,
      };

      if (!editing) {
        await createCoach(payload);
        toast.success("تم إضافة المدرب");
      } else {
        await updateCoach({ id: editing._id, ...payload });
        toast.success("تم تحديث المدرب");
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      setLocalPreview("");
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  const runSeed = async () => {
    try {
      const r: any = await seedCoaches({});
      if (r?.already) toast.success(`المدربين موجودين بالفعل (${r.count})`);
      else toast.success(`تمت إضافة بيانات فعلية (${r.inserted})`);
    } catch (e: any) {
      toast.error(e?.message || "فشل إضافة البيانات");
    }
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل مدرب" : "إضافة مدرب جديد"}
        onClose={() => setOpenForm(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="اسم عربي *">
              <input className="input" value={form.nameAr} onChange={(e) => setForm((p: any) => ({ ...p, nameAr: e.target.value }))} />
            </Field>
            <Field label="اسم إنجليزي *">
              <input className="input" value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="التخصص عربي *">
              <input className="input" value={form.specialtyAr} onChange={(e) => setForm((p: any) => ({ ...p, specialtyAr: e.target.value }))} />
            </Field>
            <Field label="التخصص إنجليزي *">
              <input className="input" value={form.specialty} onChange={(e) => setForm((p: any) => ({ ...p, specialty: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="الخبرة">
              <input className="input" value={form.experience} onChange={(e) => setForm((p: any) => ({ ...p, experience: e.target.value }))} placeholder="مثال: 7 سنوات" />
            </Field>
            <Field label="واتساب (اختياري)">
              <input className="input" value={form.whatsapp} onChange={(e) => setForm((p: any) => ({ ...p, whatsapp: e.target.value }))} placeholder="9745xxxxxxx" />
            </Field>
          </div>

          {/* ✅ صورة المدرب */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="رابط صورة (اختياري)">
              <input
                className="input"
                value={form.imageUrl}
                onChange={(e) => setForm((p: any) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </Field>

            <Field label="رفع صورة من الكمبيوتر (اختياري)">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => onPickFile(e.target.files?.[0])}
                className="input"
              />
              <div className="text-xs text-gray-500 mt-2">
                {uploading ? "جاري رفع الصورة..." : form.imageStorageId ? `تم رفع الصورة ✅` : "اختياري"}
              </div>
            </Field>
          </div>

          {localPreview ? (
            <div className="rounded-2xl border border-gray-200 p-3 bg-gray-50">
              <div className="text-sm font-extrabold text-gray-800 mb-2">معاينة الصورة</div>
              <img src={localPreview} alt="preview" className="w-full max-h-64 object-cover rounded-xl" />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="نبذة (عربي)">
              <textarea className="input" rows={4} value={form.bioAr} onChange={(e) => setForm((p: any) => ({ ...p, bioAr: e.target.value }))} />
            </Field>
            <Field label="Bio (English)">
              <textarea className="input" rows={4} value={form.bio} onChange={(e) => setForm((p: any) => ({ ...p, bio: e.target.value }))} />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-extrabold text-gray-800">التقييم</label>
              <select className="input !w-[110px]" value={form.rating} onChange={(e) => setForm((p: any) => ({ ...p, rating: e.target.value }))}>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>

              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm((p: any) => ({ ...p, isActive: e.target.checked }))} />
                إظهار المدرب
              </label>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpenForm(false)} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? "انتظر..." : "حفظ"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <input
            className="input w-full md:w-[360px]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم / التخصص / واتساب..."
          />
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 whitespace-nowrap">
            <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
            عرض المخفي
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={runSeed} className="btn-secondary">
            + إضافة بيانات فعلية
          </button>
          <button onClick={openAdd} className="btn-primary">
            + إضافة مدرب
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">لا توجد بيانات</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((c: any) => (
            <div key={c._id} className="card">
              {/* ✅ صورة لو موجودة */}
              {c.imageResolved ? (
                <img
                  src={c.imageResolved}
                  alt={c.nameAr}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              ) : null}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-gray-900">{c.nameAr}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {c.specialtyAr} • {c.experience || "—"} • ⭐ {c.rating ?? 5}
                  </div>
                  {c.whatsapp ? <div className="text-xs text-gray-500 mt-1">WhatsApp: {c.whatsapp}</div> : null}
                </div>
                <span className={cn("badge", c.isActive ? "badge-on" : "badge-off")}>
                  {c.isActive ? "ظاهر" : "مخفي"}
                </span>
              </div>

              <div className="text-sm text-gray-600 mt-3 line-clamp-2">
                {c.bioAr || c.bio || "—"}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-secondary flex-1">تعديل</button>
                <button onClick={() => toggleActive(c)} className="btn-green flex-1">
                  {c.isActive ? "إخفاء" : "إظهار"}
                </button>
                <button onClick={() => askDelete(c)} className="btn-danger">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function PlansAdmin() {
  const [targetGroup, setTargetGroup] = useState<string>("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const plans = useQuery(api.nutrition.adminGetAllPlans, {
    targetGroup: targetGroup ? (targetGroup as any) : undefined,
    includeInactive,
  });

  const addPlan = useMutation(api.nutrition.addNutritionPlan);
  const updatePlan = useMutation(api.nutrition.updateNutritionPlan);
  const deletePlan = useMutation(api.nutrition.deleteNutritionPlan);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const emptyFood = (): PlanFood => ({
    name: "",
    nameAr: "",
    quantity: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const emptyMeal = (): PlanMeal => ({
    name: "",
    nameAr: "",
    time: "",
    foods: [emptyFood()],
    totalCalories: 0,
  });

  const emptyForm = useMemo(
    () => ({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      targetGroup: "general" as PlanTarget,
      meals: [emptyMeal()],
      totalDailyCalories: 0,
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState<any>(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      nameAr: row.nameAr ?? "",
      description: row.description ?? "",
      descriptionAr: row.descriptionAr ?? "",
      targetGroup: (row.targetGroup ?? "general") as PlanTarget,
      meals: (row.meals ?? []).map((m: any) => ({
        name: m.name ?? "",
        nameAr: m.nameAr ?? "",
        time: m.time ?? "",
        foods: (m.foods ?? []).map((f: any) => ({
          name: f.name ?? "",
          nameAr: f.nameAr ?? "",
          quantity: f.quantity ?? "",
          calories: Number(f.calories ?? 0),
          protein: Number(f.protein ?? 0),
          carbs: Number(f.carbs ?? 0),
          fat: Number(f.fat ?? 0),
        })),
        totalCalories: Number(m.totalCalories ?? 0),
      })),
      totalDailyCalories: Number(row.totalDailyCalories ?? 0),
      isActive: !!row.isActive,
    });
    setOpenForm(true);
  };

  const askDelete = (row: any) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePlan({ planId: toDelete._id });
      toast.success("تم حذف الخطة");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updatePlan({ planId: row._id, patch: { isActive: !row.isActive } });
      toast.success(row.isActive ? "تم إلغاء تفعيل الخطة" : "تم تفعيل الخطة");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  const recomputeTotals = (meals: PlanMeal[]) => {
    const newMeals = meals.map((m) => ({
      ...m,
      totalCalories: calcMealTotal(m.foods),
    }));
    const total = calcPlanTotal(newMeals);
    return { newMeals, total };
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.nameAr || !form.name) {
        toast.error("أكمل اسم الخطة عربي/إنجليزي");
        return;
      }
      if (!form.descriptionAr) {
        toast.error("اكتب وصف عربي للخطة");
        return;
      }
      if (!Array.isArray(form.meals) || form.meals.length === 0) {
        toast.error("أضف وجبة واحدة على الأقل");
        return;
      }

      // تنظيف + حساب totals
      const cleanedMeals: PlanMeal[] = form.meals.map((m: PlanMeal) => {
        const foods = (m.foods || [])
          .map((f) => ({
            ...f,
            calories: Number(f.calories) || 0,
            protein: Number(f.protein) || 0,
            carbs: Number(f.carbs) || 0,
            fat: Number(f.fat) || 0,
          }))
          .filter((f) => (f.nameAr || f.name || f.quantity || f.calories || f.protein || f.carbs || f.fat));

        const totalCalories = calcMealTotal(foods);

        return {
          name: m.name || "",
          nameAr: m.nameAr || "",
          time: m.time || "",
          foods,
          totalCalories,
        };
      });

      if (cleanedMeals.some((m) => !m.nameAr || !m.name || !m.time || m.foods.length === 0)) {
        toast.error("تأكد أن كل وجبة فيها اسم عربي/إنجليزي + وقت + عنصر غذائي واحد على الأقل");
        return;
      }

      const totalDailyCalories = calcPlanTotal(cleanedMeals);

      if (!editing) {
        await addPlan({
          name: form.name,
          nameAr: form.nameAr,
          description: form.description || "",
          descriptionAr: form.descriptionAr || "",
          targetGroup: form.targetGroup,
          meals: cleanedMeals,
          totalDailyCalories,
        });
        toast.success("تمت إضافة الخطة");
      } else {
        await updatePlan({
          planId: editing._id,
          patch: {
            name: form.name,
            nameAr: form.nameAr,
            description: form.description || "",
            descriptionAr: form.descriptionAr || "",
            targetGroup: form.targetGroup,
            meals: cleanedMeals,
            totalDailyCalories,
            isActive: !!form.isActive,
          },
        });
        toast.success("تم تحديث الخطة");
      }

      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      toast.error(e?.message || "خطأ أثناء الحفظ");
    }
  };

  // Builder handlers
  const addMeal = () => {
    const meals = [...form.meals, emptyMeal()];
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({ ...p, meals: newMeals, totalDailyCalories: total }));
  };

  const removeMeal = (idx: number) => {
    const meals = form.meals.filter((_: any, i: number) => i !== idx);
    const { newMeals, total } = recomputeTotals(meals.length ? meals : [emptyMeal()]);
    setForm((p: any) => ({ ...p, meals: newMeals, totalDailyCalories: total }));
  };

  const addFoodRow = (mealIdx: number) => {
    const meals = form.meals.map((m: any, i: number) =>
      i === mealIdx ? { ...m, foods: [...(m.foods || []), emptyFood()] } : m
    );
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({ ...p, meals: newMeals, totalDailyCalories: total }));
  };

  const removeFoodRow = (mealIdx: number, foodIdx: number) => {
    const meals = form.meals.map((m: any, i: number) => {
      if (i !== mealIdx) return m;
      const foods = (m.foods || []).filter((_: any, j: number) => j !== foodIdx);
      return { ...m, foods: foods.length ? foods : [emptyFood()] };
    });
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({ ...p, meals: newMeals, totalDailyCalories: total }));
  };

  const updateMealField = (mealIdx: number, key: keyof PlanMeal, value: any) => {
    const meals = form.meals.map((m: any, i: number) => (i === mealIdx ? { ...m, [key]: value } : m));
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({ ...p, meals: newMeals, totalDailyCalories: total }));
  };

  const updateFoodField = (mealIdx: number, foodIdx: number, key: keyof PlanFood, value: any) => {
    const meals = form.meals.map((m: any, i: number) => {
      if (i !== mealIdx) return m;
      const foods = (m.foods || []).map((f: any, j: number) => (j === foodIdx ? { ...f, [key]: value } : f));
      return { ...m, foods };
    });
    const { newMeals, total } = recomputeTotals(meals);
    setForm((p: any) => ({ ...p, meals: newMeals, totalDailyCalories: total }));
  };

  return (
    <div className="space-y-4">
      <Confirm
        open={confirmOpen}
        title="تأكيد الحذف"
        desc={toDelete ? `هل تريد حذف: ${toDelete.nameAr}؟` : ""}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />

      <Modal
        open={openForm}
        title={editing ? "تعديل خطة غذائية" : "إضافة خطة غذائية"}
        onClose={() => setOpenForm(false)}
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="اسم الخطة (عربي) *">
              <input className="input" value={form.nameAr} onChange={(e) => setForm((p: any) => ({ ...p, nameAr: e.target.value }))} />
            </Field>
            <Field label="اسم الخطة (إنجليزي) *">
              <input className="input" value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="الفئة المستهدفة">
              <select
                className="input"
                value={form.targetGroup}
                onChange={(e) => setForm((p: any) => ({ ...p, targetGroup: e.target.value }))}
              >
                <option value="general">عام</option>
                <option value="diabetes">سكري</option>
                <option value="seniors">كبار السن</option>
                <option value="children">أطفال</option>
              </select>
            </Field>

            <Field label="تفعيل الخطة">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => setForm((p: any) => ({ ...p, isActive: e.target.checked }))}
                />
                مفعّلة
              </label>
            </Field>
          </div>

          <Field label="الوصف (عربي) *">
            <textarea className="input" rows={3} value={form.descriptionAr} onChange={(e) => setForm((p: any) => ({ ...p, descriptionAr: e.target.value }))} />
          </Field>

          <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-gray-900">الوجبات</div>
              <button type="button" onClick={addMeal} className="btn-primary">
                + إضافة وجبة
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {form.meals.map((meal: PlanMeal, mi: number) => (
                <div key={mi} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-extrabold text-gray-900">وجبة #{mi + 1}</div>
                    <button type="button" onClick={() => removeMeal(mi)} className="btn-danger">
                      حذف الوجبة
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Field label="اسم الوجبة (عربي) *">
                      <input className="input" value={meal.nameAr} onChange={(e) => updateMealField(mi, "nameAr", e.target.value)} />
                    </Field>
                    <Field label="اسم الوجبة (إنجليزي) *">
                      <input className="input" value={meal.name} onChange={(e) => updateMealField(mi, "name", e.target.value)} />
                    </Field>
                    <Field label="الوقت *">
                      <input className="input" placeholder="مثال: 08:00" value={meal.time} onChange={(e) => updateMealField(mi, "time", e.target.value)} />
                    </Field>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      مجموع سعرات الوجبة: <b>{meal.totalCalories}</b> kcal
                    </div>
                    <button type="button" onClick={() => addFoodRow(mi)} className="btn-secondary">
                      + إضافة عنصر غذائي
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {(meal.foods || []).map((food: PlanFood, fi: number) => (
                      <div key={fi} className="rounded-xl border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-gray-800">عنصر #{fi + 1}</div>
                          <button type="button" onClick={() => removeFoodRow(mi, fi)} className="text-xs font-extrabold text-red-600 hover:text-red-700">
                            حذف
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Field label="اسم عربي *">
                            <input className="input" value={food.nameAr} onChange={(e) => updateFoodField(mi, fi, "nameAr", e.target.value)} />
                          </Field>
                          <Field label="اسم إنجليزي *">
                            <input className="input" value={food.name} onChange={(e) => updateFoodField(mi, fi, "name", e.target.value)} />
                          </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-2">
                          <Field label="الكمية *">
                            <input className="input" placeholder="مثال: 150g" value={food.quantity} onChange={(e) => updateFoodField(mi, fi, "quantity", e.target.value)} />
                          </Field>
                          <Field label="Calories">
                            <input className="input" inputMode="numeric" value={food.calories} onChange={(e) => updateFoodField(mi, fi, "calories", Number(e.target.value || 0))} />
                          </Field>
                          <Field label="Protein">
                            <input className="input" inputMode="numeric" value={food.protein} onChange={(e) => updateFoodField(mi, fi, "protein", Number(e.target.value || 0))} />
                          </Field>
                          <Field label="Carbs">
                            <input className="input" inputMode="numeric" value={food.carbs} onChange={(e) => updateFoodField(mi, fi, "carbs", Number(e.target.value || 0))} />
                          </Field>
                          <Field label="Fat">
                            <input className="input" inputMode="numeric" value={food.fat} onChange={(e) => updateFoodField(mi, fi, "fat", Number(e.target.value || 0))} />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
              <div className="font-extrabold text-gray-900">إجمالي السعرات اليومية</div>
              <div className="text-lg font-extrabold">{calcPlanTotal(form.meals)} kcal</div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenForm(false)} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn-primary">
              حفظ الخطة
            </button>
          </div>
        </form>
      </Modal>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
          <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} className="input">
            <option value="">كل الفئات</option>
            <option value="general">عام</option>
            <option value="diabetes">سكري</option>
            <option value="seniors">كبار السن</option>
            <option value="children">أطفال</option>
          </select>

          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
            عرض غير المفعّل
          </label>
        </div>

        <button onClick={openAdd} className="btn-primary">
          + إضافة خطة
        </button>
      </div>

      {/* List */}
      {plans === undefined ? (
        <div className="py-12 text-center text-gray-500">جاري التحميل...</div>
      ) : plans.length === 0 ? (
        <div className="py-12 text-center text-gray-500">لا توجد خطط</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {plans.map((p: any) => (
            <div key={p._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-gray-900">{p.nameAr}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.targetGroup} • {p.totalDailyCalories} kcal • {Array.isArray(p.meals) ? p.meals.length : 0} وجبات
                  </div>
                </div>
                <span className={cn("badge", p.isActive ? "badge-on" : "badge-off")}>
                  {p.isActive ? "مفعّل" : "غير مفعّل"}
                </span>
              </div>

              <div className="text-sm text-gray-600 mt-3 line-clamp-2">{p.descriptionAr}</div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(p)} className="btn-secondary flex-1">
                  تعديل
                </button>
                <button onClick={() => toggleActive(p)} className="btn-green flex-1">
                  {p.isActive ? "إلغاء تفعيل" : "تفعيل"}
                </button>
                <button onClick={() => askDelete(p)} className="btn-danger">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   Shared Styles
========================= */
function UsersAdmin() {
  const [q, setQ] = useState("");
  const users = useQuery(api.profiles.adminListProfiles, {
    q: q.trim() ? q.trim() : undefined,
  });

  const setRole = useMutation(api.profiles.adminSetUserRole);

  const toggle = async (row: any) => {
    try {
      const nextRole = row.role === "admin" ? "user" : "admin";
      await setRole({ profileId: row._id, role: nextRole });
      toast.success(nextRole === "admin" ? "تم ترقية المستخدم لأدمن" : "تم تحويله لمستخدم عادي");
    } catch (e: any) {
      toast.error(e?.message || "خطأ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          className="input w-full md:w-[360px]"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث بالاسم..."
        />
      </div>

      {users === undefined ? (
        <div className="py-12 text-center text-gray-500">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-gray-500">لا يوجد مستخدمون</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {users.map((u: any) => (
            <div key={u._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-extrabold text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Role: <b>{u.role}</b>
                  </div>
                </div>
                <span className={cn("badge", u.role === "admin" ? "badge-on" : "badge-off")}>
                  {u.role === "admin" ? "Admin" : "User"}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => toggle(u)} className={u.role === "admin" ? "btn-danger flex-1" : "btn-green flex-1"}>
                  {u.role === "admin" ? "إزالة أدمن" : "ترقية لأدمن"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StyleBlock() {
  return (
    <style>{`
      .input{
        width:100%;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        outline: none;
        background: #fff;
      }
      .input:focus{
        border-color:#111827;
        box-shadow: 0 0 0 4px rgba(17,24,39,.08);
      }
      .card{
        border-radius: 16px;
        border: 1px solid #e5e7eb;
        padding: 16px;
        transition: .2s;
        background: #fff;
      }
      .card:hover{ box-shadow: 0 10px 22px rgba(0,0,0,.06); transform: translateY(-1px); }
      .badge{
        font-size: 12px;
        font-weight: 800;
        padding: 6px 10px;
        border-radius: 999px;
      }
      .badge-on{ background:#dcfce7; color:#166534; }
      .badge-off{ background:#f3f4f6; color:#4b5563; }

      .btn-primary{
        padding: 12px 16px;
        border-radius: 14px;
        background: #000;
        color: #fff;
        font-weight: 900;
      }
      .btn-primary:hover{ background:#111827; }

      .btn-secondary{
        padding: 10px 14px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        background:#fff;
        font-weight: 800;
      }
      .btn-secondary:hover{ background:#f9fafb; }

      .btn-danger{
        padding: 10px 14px;
        border-radius: 14px;
        background:#dc2626;
        color:#fff;
        font-weight: 900;
      }
      .btn-danger:hover{ background:#b91c1c; }

      .btn-green{
        padding: 10px 14px;
        border-radius: 14px;
        background:#15803d;
        color:#fff;
        font-weight: 900;
      }
      .btn-green:hover{ background:#166534; }
    `}</style>
  );
}
