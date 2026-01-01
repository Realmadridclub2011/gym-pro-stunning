import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Users, Award, Star, Search, MessageCircle, X } from "lucide-react";
import { useLanguage } from "../lib/i18n"; // ✅ عدّل المسار حسب مشروعك

type Coach = {
  _id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  experience?: string;
  bio?: string;
  bioAr?: string;
  imageResolved?: string | null;
  imageUrl?: string | null;
  imageStorageId?: string | null;
  whatsapp?: string | null;
  rating?: number | null;
  isActive?: boolean;
};

export function Coaches() {
  const { language, dir } = useLanguage(); // ✅ مهم
  const isAr = language === "ar";

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Coach | null>(null);

  const rows = useQuery(api.coaches.listPublic, {
    q: q.trim() ? q.trim() : undefined,
  });

  const coaches: Coach[] = useMemo(() => {
    if (!rows) return [];
    return (rows as any[]).map((c) => ({
      _id: c._id,
      name: c.name || "",
      nameAr: c.nameAr || c.name || "",
      specialty: c.specialty || "",
      specialtyAr: c.specialtyAr || c.specialty || "",
      experience: c.experience || "—",
      bio: c.bio || "",
      bioAr: c.bioAr || c.bio || "",
      imageResolved: c.imageResolved ?? c.imageUrl ?? c.image ?? null,
      imageUrl: c.imageUrl ?? c.image ?? null,
      imageStorageId: c.imageStorageId ?? null,
      whatsapp: c.whatsapp ?? null,
      rating: typeof c.rating === "number" ? c.rating : 5,
      isActive: c.isActive ?? true,
    }));
  }, [rows]);

  const openWhatsApp = (phone?: string | null) => {
    const clean = String(phone || "").replace(/[^\d]/g, "");
    if (!clean) return;
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  const displayName = (c: Coach) => (isAr ? (c.nameAr || c.name || "مدرب") : (c.name || c.nameAr || "Coach"));
  const displaySpecialty = (c: Coach) => (isAr ? (c.specialtyAr || c.specialty || "—") : (c.specialty || c.specialtyAr || "—"));
  const displayBio = (c: Coach) => (isAr ? (c.bioAr || c.bio || "—") : (c.bio || c.bioAr || "—"));

  return (
    <div className="space-y-6" dir={dir} lang={language}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-5 border border-emerald-100 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className={isAr ? "text-right" : "text-left"}>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              {isAr ? "المدربون" : "Coaches"}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {isAr ? "اختر مدربك المناسب وتواصل معه عبر واتساب." : "Pick a coach and contact them on WhatsApp."}
            </p>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search
            className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
              isAr ? "right-3" : "left-3"
            }`}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isAr ? "ابحث عن مدرب…" : "Search coach…"}
            className={`w-full py-3 rounded-2xl border border-emerald-100 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
              isAr ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"
            }`}
          />
        </div>
      </div>

      {/* Loading / Empty */}
      {rows === undefined ? (
        <div className="bg-white/80 backdrop-blur rounded-3xl p-8 border border-emerald-100 shadow-sm text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="font-extrabold text-slate-800">{isAr ? "جاري التحميل..." : "Loading..."}</div>
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-3xl p-8 border border-emerald-100 shadow-sm text-center">
          <div className="text-4xl mb-2">🧑‍🏫</div>
          <div className="font-extrabold text-slate-800">{isAr ? "لا يوجد نتائج" : "No results"}</div>
          <div className="text-sm text-slate-500 mt-1">{isAr ? "جرّب بحث مختلف." : "Try a different search."}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((coach) => (
            <button
              key={coach._id}
              onClick={() => setSelected(coach)}
              className={`bg-white/85 backdrop-blur rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition overflow-hidden ${
                isAr ? "text-right" : "text-left"
              }`}
            >
              <div className="p-4 flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-100 overflow-hidden shrink-0">
                  {coach.imageResolved ? (
                    <img src={coach.imageResolved} alt={displayName(coach)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Users className="w-7 h-7" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-base font-extrabold text-slate-900">{displayName(coach)}</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{displaySpecialty(coach)}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Award className="w-4 h-4" />
                    <span>{coach.experience || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (coach.rating ?? 5) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-emerald-700">{isAr ? "عرض التفاصيل" : "View details"}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-3" dir={dir}>
          <div className="w-full sm:max-w-lg bg-white rounded-3xl p-5 border border-emerald-100 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className={isAr ? "text-right" : "text-left"}>
                <div className="text-xl font-extrabold text-slate-900">{displayName(selected)}</div>
                <div className="text-sm font-bold text-emerald-700">{displaySpecialty(selected)}</div>
                <div className="text-xs text-slate-500 mt-1">{selected.experience || "—"}</div>
              </div>

              <button onClick={() => setSelected(null)} className="p-2 rounded-2xl hover:bg-slate-50" aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {selected.imageResolved ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <img src={selected.imageResolved} alt={displayName(selected)} className="w-full h-48 object-cover" />
              </div>
            ) : null}

            <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-sm font-extrabold text-slate-800 mb-1">{isAr ? "نبذة" : "Bio"}</div>
              <div className={`text-sm text-slate-600 leading-relaxed ${isAr ? "text-right" : "text-left"}`}>
                {displayBio(selected)}
              </div>
            </div>

            <button
              onClick={() => openWhatsApp(selected.whatsapp)}
              disabled={!selected.whatsapp}
              className={`mt-4 w-full h-12 rounded-2xl text-white font-extrabold flex items-center justify-center gap-2 ${
                selected.whatsapp ? "bg-green-500 hover:bg-green-600" : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {isAr ? "تواصل واتساب" : "WhatsApp"}
            </button>

            {!selected.whatsapp && (
              <div className="text-xs text-rose-600 text-center mt-2">
                {isAr ? "رقم واتساب غير موجود لهذا المدرب." : "No WhatsApp number for this coach."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
