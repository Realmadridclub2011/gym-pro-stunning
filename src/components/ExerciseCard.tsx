// src/components/ExerciseCard.tsx
import React, { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";

interface Exercise {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  muscleGroup: string;
  muscleGroupAr: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string[];
  instructions: string[];
  instructionsAr: string[];
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  reps?: string;
  sets?: number;
  caloriesBurned?: number;
  targetGender: "male" | "female" | "both";
  category: "strength" | "cardio" | "flexibility" | "balance";
}

interface ExerciseCardProps {
  exercise: Exercise;
}

function toYouTubeId(url?: string) {
  if (!url) return null;
  const clean = String(url).trim();

  const watch = clean.match(/[?&]v=([^&]+)/);
  if (watch?.[1]) return watch[1];

  const short = clean.match(/youtu\.be\/([^?&]+)/);
  if (short?.[1]) return short[1];

  const shorts = clean.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shorts?.[1]) return shorts[1];

  const embed = clean.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embed?.[1]) return embed[1];

  return null;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { t, language, dir } = useLanguage();

  const [showDetails, setShowDetails] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  const [logData, setLogData] = useState({
    duration: exercise.duration || 30,
    sets: exercise.sets || 3,
    reps: [12, 12, 12],
    weight: [0, 0, 0],
    notes: "",
  });

  const logWorkout = useMutation(api.exercises.logWorkoutSession);

  const videoId = useMemo(() => toYouTubeId(exercise.videoUrl), [exercise.videoUrl]);

  const embedUrl = useMemo(() => {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }, [videoId]);

  const watchUrl = useMemo(() => {
    if (!videoId) return exercise.videoUrl || null;
    return `https://www.youtube.com/watch?v=${videoId}`;
  }, [videoId, exercise.videoUrl]);

  // ✅ اختيار نصوص حسب اللغة
  const title =
    language === "ar"
      ? (exercise.nameAr || exercise.name)
      : (exercise.name || exercise.nameAr);

  const subtitle = language === "ar" ? exercise.name : exercise.nameAr;

  const description =
    language === "ar"
      ? (exercise.descriptionAr || exercise.description)
      : (exercise.description || exercise.descriptionAr);

  const muscleGroup =
    language === "ar"
      ? (exercise.muscleGroupAr || exercise.muscleGroup)
      : (exercise.muscleGroup || exercise.muscleGroupAr);

  const instructions =
    language === "ar"
      ? (exercise.instructionsAr?.length ? exercise.instructionsAr : exercise.instructions)
      : (exercise.instructions?.length ? exercise.instructions : exercise.instructionsAr);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return t("beginner");
      case "intermediate":
        return t("intermediate");
      case "advanced":
        return t("advanced");
      default:
        return difficulty;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength":
        return "💪";
      case "cardio":
        return "❤️";
      case "flexibility":
        return "🤸";
      case "balance":
        return "⚖️";
      default:
        return "🏋️";
    }
  };

  const handleLogWorkout = async () => {
    try {
      const estimatedCalories = exercise.caloriesBurned || Math.round(logData.duration * 5);

      await logWorkout({
        exerciseId: exercise._id as any,
        duration: logData.duration,
        sets: logData.sets,
        reps: logData.reps,
        weight: logData.weight.some((w) => w > 0) ? logData.weight : undefined,
        caloriesBurned: estimatedCalories,
        notes: logData.notes || undefined,
      });

      toast.success(t("workout_logged_success"));
      setIsLogging(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("something_went_wrong");
      toast.error(message);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-all overflow-hidden">
      {/* Video / Image */}
      {embedUrl && !iframeFailed ? (
        <div className="bg-gradient-to-br from-orange-100 to-red-100">
          <div className="w-full aspect-video">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setIframeFailed(true)}
            />
          </div>
        </div>
      ) : watchUrl ? (
        <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4">
          <div className="w-full aspect-video rounded-lg border border-orange-200 bg-white/60 flex flex-col items-center justify-center gap-3">
            <div className="text-orange-800 font-semibold text-sm text-center">
              {t("video_not_working_preview")}
            </div>
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              {t("watch_video")}
            </a>
            <div className="text-xs text-gray-600 text-center px-3">
              {t("opens_youtube_new_tab")}
            </div>
          </div>
        </div>
      ) : exercise.imageUrl ? (
        <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
          <img src={exercise.imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-orange-700/70">
          {t("no_video_or_image")}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={dir === "rtl" ? "text-right" : "text-left"}>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>

            {subtitle ? (
              <p className="text-sm text-gray-500" dir={language === "ar" ? "ltr" : "rtl"}>
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                exercise.difficulty
              )}`}
            >
              {getDifficultyText(exercise.difficulty)}
            </span>
            <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
          </div>
        </div>

        {/* Muscle Group */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            🎯 {muscleGroup}
          </span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          {exercise.duration ? (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-lg font-bold text-gray-800">{exercise.duration}</div>
              <div className="text-xs text-gray-600">{t("minutes")}</div>
            </div>
          ) : null}

          {exercise.sets ? (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-lg font-bold text-gray-800">{exercise.sets}</div>
              <div className="text-xs text-gray-600">{t("sets")}</div>
            </div>
          ) : null}

          {exercise.caloriesBurned ? (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-lg font-bold text-gray-800">{exercise.caloriesBurned}</div>
              <div className="text-xs text-gray-600">{t("kcal")}</div>
            </div>
          ) : null}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Equipment */}
        {exercise.equipment?.length > 0 ? (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t("required_equipment")}
            </h4>
            <div className="flex flex-wrap gap-1">
              {exercise.equipment.map((item, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
            type="button"
          >
            {showDetails ? t("hide_details") : t("show_details")}
          </button>

          <button
            onClick={() => setIsLogging(!isLogging)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            type="button"
          >
            {t("log_workout")}
          </button>
        </div>

        {/* Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">{t("how_to_perform")}</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Logging Form */}
        {isLogging && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <h4 className="font-semibold text-gray-800">{t("log_workout_title")}</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("duration_minutes")}
                </label>
                <input
                  type="number"
                  value={logData.duration}
                  onChange={(e) =>
                    setLogData((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("number_of_sets")}
                </label>
                <input
                  type="number"
                  value={logData.sets}
                  onChange={(e) => {
                    const sets = parseInt(e.target.value) || 1;
                    setLogData((prev) => ({
                      ...prev,
                      sets,
                      reps: Array(sets).fill(12),
                      weight: Array(sets).fill(0),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("reps_and_weight_each_set")}
              </label>

              {Array.from({ length: logData.sets }, (_, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-24">
                    {t("set")} {index + 1}:
                  </span>

                  <input
                    type="number"
                    placeholder={t("reps")}
                    value={logData.reps[index] || 0}
                    onChange={(e) => {
                      const newReps = [...logData.reps];
                      newReps[index] = parseInt(e.target.value) || 0;
                      setLogData((prev) => ({ ...prev, reps: newReps }));
                    }}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                    min="0"
                  />

                  <input
                    type="number"
                    placeholder={t("weight_kg")}
                    value={logData.weight[index] || 0}
                    onChange={(e) => {
                      const newWeight = [...logData.weight];
                      newWeight[index] = parseFloat(e.target.value) || 0;
                      setLogData((prev) => ({ ...prev, weight: newWeight }));
                    }}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                    min="0"
                    step="0.5"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("notes_optional")}
              </label>
              <textarea
                value={logData.notes}
                onChange={(e) => setLogData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                rows={2}
                placeholder={t("notes_placeholder")}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLogWorkout}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                type="button"
              >
                {t("save_workout")}
              </button>
              <button
                onClick={() => setIsLogging(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                type="button"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
