import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dumbbell,
  CalendarDays,
  Salad,
  HeartPulse,
  Calculator,
  TrendingUp,
  Flame,
  Timer,
  Users,
} from "lucide-react";
import { useLanguage } from "../lib/i18n"; // ✅ عدّل المسار لو i18n عندك في src/lib

type SectionId =
  | "dashboard"
  | "exercises"
  | "nutrition"
  | "calculator"
  | "health"
  | "admin"
  | "coaches";

export function Dashboard({
  onNavigate,
}: {
  onNavigate?: (section: SectionId) => void;
}) {
  const { t, language, dir } = useLanguage();

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const bmiData = useQuery(api.profiles.calculateBMI);
  const workoutStats = useQuery(api.exercises.getUserWorkoutStats, {});

  const totalSessions = workoutStats?.totalSessions || 0;
  const totalCalories = workoutStats?.totalCaloriesBurned || 0;
  const totalHours = Math.round((workoutStats?.totalDuration || 0) / 60);

  const completion = Math.min(100, Math.max(0, totalSessions * 10));

  // ترجمة مستوى اللياقة
  const fitnessLevelLabel =
    userProfile?.fitnessLevel === "beginner"
      ? t("fitness_beginner" as any)
      : userProfile?.fitnessLevel === "intermediate"
      ? t("fitness_intermediate" as any)
      : userProfile?.fitnessLevel === "advanced"
      ? t("fitness_advanced" as any)
      : t("fitness_unknown" as any);

  return (
    <div className="space-y-6" dir={dir} lang={language}>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-hero p-6 sm:p-8 text-white shadow-sm border border-emerald-100">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {t("dashboard_welcome" as any)} {userProfile?.name || t("you" as any)}{" "}
              {t("in_gympro" as any)}
            </h2>

            <p className="mt-2 text-white/90 text-sm sm:text-base max-w-xl">
              {t("dashboard_subtitle" as any)}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm">
              <span className="opacity-90">{t("fitness_level" as any)}:</span>
              <span className="font-extrabold">{fitnessLevelLabel}</span>
            </div>
          </div>

          <div className="shrink-0">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats (3 cards) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          value={`${completion}%`}
          label={t("completion" as any)}
          iconWrapClass="bg-sky-50 text-sky-700"
          cardClass="bg-sky-50/40 border-sky-100"
        />
        <StatCard
          icon={<Timer className="w-5 h-5" />}
          value={`${totalSessions}`}
          label={t("workout_days" as any)}
          iconWrapClass="bg-violet-50 text-violet-700"
          cardClass="bg-violet-50/40 border-violet-100"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          value={`${totalCalories}`}
          label={t("burned_calories" as any)}
          iconWrapClass="bg-orange-50 text-orange-700"
          cardClass="bg-orange-50/40 border-orange-100"
        />
      </div>

      {/* Main Sections */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
          {t("main_sections" as any)}
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          <Tile
            title={t("schedules" as any)}
            icon={<CalendarDays className="w-6 h-6" />}
            onClick={() => onNavigate?.("dashboard")}
            iconWrapClass="bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100"
            cardClass="bg-indigo-50/35 border-indigo-100"
          />
          <Tile
            title={t("nutrition" as any)}
            icon={<Salad className="w-6 h-6" />}
            onClick={() => onNavigate?.("nutrition")}
            iconWrapClass="bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
            cardClass="bg-emerald-50/35 border-emerald-100"
          />
          <Tile
            title={t("exercises" as any)}
            icon={<Dumbbell className="w-6 h-6" />}
            onClick={() => onNavigate?.("exercises")}
            iconWrapClass="bg-pink-50 text-pink-700 group-hover:bg-pink-100"
            cardClass="bg-pink-50/35 border-pink-100"
          />
          <Tile
            title={t("health" as any)}
            icon={<HeartPulse className="w-6 h-6" />}
            onClick={() => onNavigate?.("health")}
            iconWrapClass="bg-rose-50 text-rose-700 group-hover:bg-rose-100"
            cardClass="bg-rose-50/35 border-rose-100"
          />
          <Tile
            title={t("calculators" as any)}
            icon={<Calculator className="w-6 h-6" />}
            onClick={() => onNavigate?.("calculator")}
            iconWrapClass="bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100"
            cardClass="bg-cyan-50/35 border-cyan-100"
          />
          <Tile
            title={t("coaches" as any)}
            icon={<Users className="w-6 h-6" />}
            onClick={() => onNavigate?.("coaches")}
            iconWrapClass="bg-amber-50 text-amber-800 group-hover:bg-amber-100"
            cardClass="bg-amber-50/35 border-amber-100"
          />
        </div>
      </div>

      {/* BMI / Workout small cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {bmiData && (
          <div className="bg-mint/70 backdrop-blur rounded-3xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-extrabold text-slate-800">
                  {t("bmi_title" as any)}
                </h4>
                <p className="text-xs text-slate-500 mt-1">BMI</p>
              </div>

              <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 text-3xl font-extrabold text-teal-700">
              {bmiData.bmi}
            </div>
            <div className="mt-1 text-sm text-slate-600">{bmiData.category}</div>
          </div>
        )}

        <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl p-5 border border-emerald-100 shadow-sm">
          <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
            ⏱️ {t("workout_summary" as any)}
          </h4>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat
              title={t("sessions" as any)}
              value={`${totalSessions}`}
              tint="bg-sky-50 border-sky-100"
            />
            <MiniStat
              title={t("hours" as any)}
              value={`${totalHours}`}
              tint="bg-violet-50 border-violet-100"
            />
            <MiniStat
              title={t("calories" as any)}
              value={`${totalCalories}`}
              tint="bg-orange-50 border-orange-100"
            />
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-5 border border-emerald-100 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-800 mb-3 flex items-center gap-2">
          🎯 {t("your_goals" as any)}
        </h3>

        {userProfile?.goals && userProfile.goals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userProfile.goals.map((goal, idx) => (
              <span
                key={idx}
                className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm font-extrabold text-slate-800"
              >
                {goal}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            {t("no_goals" as any)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  iconWrapClass,
  cardClass,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  iconWrapClass: string;
  cardClass: string;
}) {
  return (
    <div className={`bg-white/90 backdrop-blur rounded-3xl p-4 border shadow-sm ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${iconWrapClass}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{value}</div>
          <div className="text-xs sm:text-sm text-slate-500 mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function Tile({
  title,
  icon,
  onClick,
  iconWrapClass,
  cardClass,
}: {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  iconWrapClass: string;
  cardClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group bg-white/90 rounded-3xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center justify-center gap-2 ${cardClass}`}
    >
      <div className={`h-12 w-12 rounded-2xl transition flex items-center justify-center ${iconWrapClass}`}>
        {icon}
      </div>
      <div className="text-sm font-extrabold text-slate-800">{title}</div>
    </button>
  );
}

function MiniStat({
  title,
  value,
  tint,
}: {
  title: string;
  value: string;
  tint: string;
}) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${tint}`}>
      <div className="text-xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{title}</div>
    </div>
  );
}
