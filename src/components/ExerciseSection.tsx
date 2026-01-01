// src/components/ExerciseSection.tsx
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BodyModel } from "./BodyModel";
import { ExerciseCard } from "./ExerciseCard";
import { useLanguage } from "../lib/i18n";

type Side = "front" | "back";

type Diff = "" | "beginner" | "intermediate" | "advanced";
type Cat = "" | "strength" | "cardio" | "flexibility" | "balance";

export function ExerciseSection() {
  const { t, language, dir } = useLanguage();

  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Diff>("");
  const [selectedCategory, setSelectedCategory] = useState<Cat>("");

  const [bodySide, setBodySide] = useState<Side>("front");
  const [hoveredMuscle, setHoveredMuscle] = useState<{ id: string; name: string } | null>(null);

  // ✅ Query
  const exercises = useQuery(api.exercises.getAllExercises, {
    muscleGroup: selectedMuscleGroup || undefined,
    difficulty: selectedDifficulty
      ? (selectedDifficulty as "beginner" | "intermediate" | "advanced")
      : undefined,
    gender: selectedGender,
    category: selectedCategory
      ? (selectedCategory as "strength" | "cardio" | "flexibility" | "balance")
      : undefined,
  });

  // ✅ Muscle Groups Labels (Front/Back) bilingual
  const muscleGroups = useMemo(() => {
    if (bodySide === "front") {
      return [
        { id: "Traps", name: language === "ar" ? "الترابيس" : "Traps" },
        { id: "shoulders", name: language === "ar" ? "الأكتاف" : "Shoulders" },
        { id: "Chest", name: language === "ar" ? "الصدر" : "Chest" },
        { id: "Biceps", name: language === "ar" ? "البايسبس" : "Biceps" },
        { id: "Forearms", name: language === "ar" ? "السواعد" : "Forearms" },
        { id: "Abs", name: language === "ar" ? "البطن" : "Abs" },
        { id: "Obliques", name: language === "ar" ? "الخواصر" : "Obliques" },
        { id: "Quads", name: language === "ar" ? "الفخذ الأمامي" : "Quads" },
        // ⚠️ انت كنت حاطط Quadriceps = سمانة (ده غلط غالبًا)
        // لو مسارك في SVG اسمه Quadriceps وده فعلاً سمانة عندك خلّيه زي ما هو
        { id: "Quadriceps", name: language === "ar" ? "السمانة" : "Calves" },
      ];
    }

    return [
      { id: "upper_back", name: language === "ar" ? "أعلى الظهر" : "Upper Back" },
      { id: "Lower_Back__Erector_Spinae_", name: language === "ar" ? "أسفل الظهر" : "Lower Back" },
      { id: "Lats", name: language === "ar" ? "اللاتس" : "Lats" },
      { id: "Rear_Shoulder__Rear_Deltoid_", name: language === "ar" ? "الكتف الخلفي" : "Rear Shoulder" },
      { id: "Triceps", name: language === "ar" ? "الترايسبس" : "Triceps" },
      { id: "Forearms", name: language === "ar" ? "السواعد" : "Forearms" },
      { id: "Glutes", name: language === "ar" ? "الأرداف" : "Glutes" },
      { id: "Hamstrings", name: language === "ar" ? "الفخذ الخلفي" : "Hamstrings" },
      { id: "Calf", name: language === "ar" ? "السمانة" : "Calves" },
      { id: "Traps", name: language === "ar" ? "الترابيس" : "Traps" },
    ];
  }, [bodySide, language]);

  const handleMuscleClick = (muscleGroup: string) => setSelectedMuscleGroup(muscleGroup);

  const selectedMuscleLabel =
    muscleGroups.find((m) => m.id === selectedMuscleGroup)?.name || "";

  // ✅ Header title for list
  const listTitle = useMemo(() => {
    if (selectedMuscleLabel) {
      // "Exercises for X" في EN / "تمارين X" في AR (مفتاح exercises_for عندك)
      return language === "ar"
        ? `${t("exercises_for" as any)} ${selectedMuscleLabel}`
        : `${t("exercises_for" as any)} ${selectedMuscleLabel}`;
    }
    return t("exercises" as any);
  }, [selectedMuscleLabel, language]);

  return (
    <div className="space-y-6" dir={dir} lang={language}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {t("exercise_section_title" as any)}
        </h2>
        <p className="text-gray-600">{t("exercise_section_desc" as any)}</p>
      </div>

      {/* Top controls row */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Gender Segmented */}
        <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm w-fit">
          <button
            onClick={() => {
              setSelectedGender("male");
              setSelectedMuscleGroup("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              selectedGender === "male" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
            type="button"
          >
            👨 {t("men" as any)}
          </button>

          <button
            onClick={() => {
              setSelectedGender("female");
              setSelectedMuscleGroup("");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              selectedGender === "female" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
            type="button"
          >
            👩 {t("women" as any)}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Diff)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">{t("all_levels" as any)}</option>
            <option value="beginner">{t("beginner" as any)}</option>
            <option value="intermediate">{t("intermediate" as any)}</option>
            <option value="advanced">{t("advanced" as any)}</option>
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Cat)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">{t("all_types" as any)}</option>
            <option value="strength">{t("strength" as any)}</option>
            <option value="cardio">{t("cardio" as any)}</option>
            <option value="flexibility">{t("flexibility" as any)}</option>
            <option value="balance">{t("balance" as any)}</option>
          </select>
        </div>
      </div>

      {/* Body Model + Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Body Model */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">
                {t("selected_muscle" as any)}
              </h3>

              <div className="inline-flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => {
                    setBodySide("front");
                    setSelectedMuscleGroup("");
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    bodySide === "front" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                  }`}
                  type="button"
                >
                  {t("front_view" as any)}
                </button>

                <button
                  onClick={() => {
                    setBodySide("back");
                    setSelectedMuscleGroup("");
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    bodySide === "back" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                  }`}
                  type="button"
                >
                  {t("back_view" as any)}
                </button>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <BodyModel
                gender={selectedGender}
                side={bodySide}
                selectedMuscle={selectedMuscleGroup}
                onMuscleClick={handleMuscleClick}
                onHoverMuscleChange={setHoveredMuscle}
              />
            </div>

            {/* Selected / Hover display */}
            {selectedMuscleLabel ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 border border-red-200">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-extrabold text-red-900">
                    {selectedMuscleLabel}
                  </span>
                </div>
              </div>
            ) : hoveredMuscle?.name ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm font-extrabold text-gray-800">
                    {hoveredMuscle.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500">
                {t("no_muscle_selected" as any)}
              </div>
            )}
          </div>
        </div>

        {/* Exercises List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">{listTitle}</h3>

            {exercises === undefined ? (
              <div className="py-12 text-center text-gray-500">
                {t("loading" as any)}
              </div>
            ) : exercises.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {t("no_exercises_found" as any)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((ex: any) => (
                  <ExerciseCard key={ex._id} exercise={ex} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
