import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female",
    weight: "",
    height: "",
    fitnessLevel: "beginner" as "beginner" | "intermediate" | "advanced",
    goals: [] as string[],
    medicalConditions: [] as string[],
  });

  const createProfile = useMutation(api.profiles.createOrUpdateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProfile({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        fitnessLevel: formData.fitnessLevel,
        goals: formData.goals,
        medicalConditions: formData.medicalConditions.length > 0 ? formData.medicalConditions : undefined,
      });
      
      toast.success("تم إنشاء الملف الشخصي بنجاح!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ ما";
      toast.error(message);
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleMedicalCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition]
    }));
  };

  const goals = [
    "فقدان الوزن",
    "زيادة الوزن",
    "بناء العضلات",
    "تحسين اللياقة",
    "زيادة القوة",
    "تحسين المرونة",
    "تحسين الصحة العامة"
  ];

  const medicalConditions = [
    "السكري",
    "ضغط الدم",
    "أمراض القلب",
    "مشاكل المفاصل",
    "مشاكل الظهر",
    "الربو",
    "لا يوجد"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">👤</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            إعداد الملف الشخصي
          </h2>
          <p className="text-gray-600">أخبرنا عن نفسك لنقدم لك أفضل تجربة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          {/* العمر والجنس */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العمر
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="العمر بالسنوات"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجنس *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as "male" | "female" }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          {/* الوزن والطول */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوزن (كيلوجرام)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="الوزن الحالي"
                min="1"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الطول (سنتيمتر)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="الطول الحالي"
                min="50"
                max="250"
              />
            </div>
          </div>

          {/* مستوى اللياقة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مستوى اللياقة الحالي *
            </label>
            <select
              required
              value={formData.fitnessLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, fitnessLevel: e.target.value as "beginner" | "intermediate" | "advanced" }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            >
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>

          {/* الأهداف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              أهدافك الرياضية (يمكن اختيار أكثر من هدف)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.goals.includes(goal)
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* الحالات الطبية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              الحالات الطبية (اختياري)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {medicalConditions.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleMedicalCondition(condition)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.medicalConditions.includes(condition)
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
          >
            إنشاء الملف الشخصي
          </button>
        </form>
      </div>
    </div>
  );
}
