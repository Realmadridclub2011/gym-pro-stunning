// src/App.tsx
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { StunningBadge } from "./StunningBadge";
import { useMemo, useState } from "react";

import { Dashboard } from "./components/Dashboard";
import { ExerciseSection } from "./components/ExerciseSection";
import { NutritionSection } from "./components/NutritionSection";
import { CalorieCalculator } from "./components/CalorieCalculator";
import { AdminPanel } from "./components/AdminPanel";
import { ProfileSetup } from "./components/ProfileSetup";
import { Coaches } from "./components/Coaches";

import { useLanguage } from "./lib/i18n";

import {
  Home,
  Dumbbell,
  Salad,
  Calculator,
  HeartPulse,
  ShieldCheck,
  LogOut,
  Users,
  Languages,
} from "lucide-react";

type SectionId =
  | "dashboard"
  | "exercises"
  | "nutrition"
  | "calculator"
  | "health"
  | "coaches"
  | "admin";

type HealthSub = "diabetes" | "seniors" | "children";

export default function App() {
  const { t, language, dir, setLanguage } = useLanguage();

  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [healthTab, setHealthTab] = useState<HealthSub>("diabetes");

  const userProfile = useQuery(api.profiles.getCurrentProfile);
  const isAdmin = useQuery(api.profiles.checkAdminStatus);

  const topNavItems = useMemo(
    () => [
      { id: "dashboard" as const, label: t("dashboard"), icon: Home },
      { id: "exercises" as const, label: t("exercises"), icon: Dumbbell },
      { id: "nutrition" as const, label: t("nutrition"), icon: Salad },
      { id: "coaches" as const, label: t("coaches"), icon: Users },
      { id: "calculator" as const, label: t("calculator"), icon: Calculator },
      { id: "health" as const, label: t("health"), icon: HeartPulse },
    ],
    [language]
  );

  const bottomNavItems = useMemo(
    () => [
      { id: "dashboard" as const, label: t("dashboard"), icon: Home },
      { id: "exercises" as const, label: t("exercises"), icon: Dumbbell },
      { id: "nutrition" as const, label: t("nutrition"), icon: Salad },
      { id: "coaches" as const, label: t("coaches"), icon: Users },
      { id: "health" as const, label: t("health"), icon: HeartPulse },
      { id: "calculator" as const, label: t("calculators"), icon: Calculator },
    ],
    [language]
  );

  return (
    <div dir={dir} lang={language} className="min-h-screen bg-app text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg sm:text-xl font-extrabold text-emerald-700">
                Gym Pro
              </h1>
              <p className="text-[11px] text-slate-500 -mt-0.5">
                {t("app_tagline")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <Authenticated>
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="px-3 py-2 rounded-2xl text-sm font-extrabold transition border border-emerald-100 bg-white/70 text-slate-700 hover:bg-emerald-50 flex items-center gap-2"
                title={language === "ar" ? "Switch to English" : "التبديل للعربية"}
                type="button"
              >
                <Languages className="w-4 h-4" />
                {language === "ar" ? "EN" : "AR"}
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveSection("admin")}
                  className={`px-3 py-2 rounded-2xl text-sm font-extrabold transition ${
                    activeSection === "admin"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {t("admin_panel")}
                  </span>
                </button>
              )}

              <div className="hidden sm:block">
                <SignOutButton />
              </div>

              <button
                className="sm:hidden p-2 rounded-2xl text-slate-600 hover:bg-slate-50"
                onClick={() => {}}
                aria-label={t("logout")}
                type="button"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </Authenticated>
        </div>
      </header>

      <main className="flex-1">
        <Authenticated>
          {!userProfile ? (
            <ProfileSetup />
          ) : (
            <>
              {/* Top Navigation (Desktop) */}
              <nav className="hidden md:block bg-white/70 backdrop-blur border-b border-emerald-100 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex gap-2 py-3 overflow-x-auto">
                    {topNavItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold whitespace-nowrap transition-all border ${
                            active
                              ? "bg-emerald-600 text-white border-transparent shadow-sm"
                              : "bg-white/60 text-slate-700 border-emerald-100 hover:bg-emerald-50"
                          }`}
                          type="button"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>

              {/* Content */}
              <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
                {activeSection === "dashboard" && (
                  <Dashboard onNavigate={(id) => setActiveSection(id)} />
                )}

                {activeSection === "exercises" && <ExerciseSection />}
                {activeSection === "nutrition" && <NutritionSection showHeader />}
                {activeSection === "calculator" && <CalorieCalculator />}
                {activeSection === "coaches" && <Coaches />}

                {/* Health */}
                {activeSection === "health" && (
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur rounded-3xl p-4 border border-emerald-100 shadow-sm">
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-emerald-700" />
                        {t("health")}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {t("health_desc")}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Chip
                          active={healthTab === "diabetes"}
                          onClick={() => setHealthTab("diabetes")}
                          label={t("diabetes")}
                        />
                        <Chip
                          active={healthTab === "seniors"}
                          onClick={() => setHealthTab("seniors")}
                          label={t("seniors")}
                        />
                        <Chip
                          active={healthTab === "children"}
                          onClick={() => setHealthTab("children")}
                          label={t("children")}
                        />
                      </div>
                    </div>

                    {/* ✅ مهم: NutritionSection داخل health بدون header */}
                    {healthTab === "diabetes" && (
                      <NutritionSection targetGroup="diabetes" showHeader={false} />
                    )}
                    {healthTab === "seniors" && (
                      <NutritionSection targetGroup="seniors" showHeader={false} />
                    )}
                    {healthTab === "children" && (
                      <NutritionSection targetGroup="children" showHeader={false} />
                    )}
                  </div>
                )}

                {activeSection === "admin" && isAdmin && <AdminPanel />}
              </div>

              {/* Bottom Navigation (Mobile) */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <div className="mx-auto max-w-7xl">
                  <div className="bg-white/92 backdrop-blur border-t border-emerald-100 shadow-[0_-12px_30px_rgba(0,0,0,0.06)]">
                    <div className="px-2 py-2 flex items-stretch justify-between">
                      {bottomNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex-1 rounded-2xl px-2 py-2 transition-all flex flex-col items-center justify-center gap-1 border ${
                              active
                                ? "bg-emerald-600 text-white border-transparent shadow-sm"
                                : "text-slate-600 border-transparent hover:bg-emerald-50"
                            }`}
                            type="button"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-[11px] font-extrabold">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="h-[env(safe-area-inset-bottom)]" />
                  </div>
                </div>
              </nav>
            </>
          )}
        </Authenticated>

        {/* Unauthenticated */}
        <Unauthenticated>
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border border-emerald-100">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-extrabold text-emerald-700 mb-2">
                  Gym Pro
                </h1>
                <p className="text-slate-600">{t("sign_in_sub")}</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>

      <Toaster position="top-center" />
      <StunningBadge />
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-2xl border text-sm font-extrabold transition-all ${
        active
          ? "bg-emerald-600 text-white border-transparent shadow-sm"
          : "bg-white/70 text-slate-700 border-emerald-100 hover:bg-emerald-50"
      }`}
      type="button"
    >
      {label}
    </button>
  );
}
