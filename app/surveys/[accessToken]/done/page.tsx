"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getRecallSession, clearRecallSession } from "@/internal/domain/recall/services/recallStorage";
import type { RecallSession } from "@/internal/domain/recall/types/recall";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { CheckCircle, RefreshCw, Search, User } from "lucide-react";

/* ── Nutrient helpers ──────────────────────────────────── */
type DailyTotals = { energy: number; protein: number; carbs: number; fat: number };

function calcDailyTotals(session: RecallSession | null): DailyTotals {
  const t: DailyTotals = { energy: 0, protein: 0, carbs: 0, fat: 0 };
  if (!session) return t;
  for (const meal of session.meals) {
    for (const rf of meal.foods) {
      const g = rf.portion?.portion_gram ?? 0;
      const n = rf.detail?.nutrients;
      if (n && g > 0) {
        const f = g / 100;
        t.energy  += (n["energy"]?.value  ?? 0) * f;
        t.protein += (n["protein"]?.value ?? 0) * f;
        t.carbs   += (n["carbs"]?.value   ?? 0) * f;
        t.fat     += (n["fat"]?.value     ?? 0) * f;
      }
    }
  }
  return { energy: Math.round(t.energy), protein: Math.round(t.protein * 10) / 10, carbs: Math.round(t.carbs * 10) / 10, fat: Math.round(t.fat * 10) / 10 };
}

/* ── AI Recommendations ────────────────────────────────── */
type Rec = { icon: string; title: string; reason: string; foods: string[]; priority: "high" | "medium" | "low" };

function generateRecs(session: RecallSession | null): Rec[] {
  if (!session) return [];
  const allFoods = session.meals.flatMap((m) => m.foods);
  const names = allFoods.map((f) => f.food.name.toLowerCase());
  let energy = 0, protein = 0, fat = 0;
  for (const rf of allFoods) {
    const g = rf.portion?.portion_gram ?? 0;
    const n = rf.detail?.nutrients;
    if (n && g > 0) {
      const f = g / 100;
      energy  += (n["energy"]?.value  ?? 0) * f;
      protein += (n["protein"]?.value ?? 0) * f;
      fat     += (n["fat"]?.value     ?? 0) * f;
    }
  }
  const recs: Rec[] = [];
  if (protein < 40) recs.push({ icon: "🥩", title: "Tingkatkan Asupan Protein", reason: `Asupan protein Anda sekitar ${protein.toFixed(0)}g, di bawah kebutuhan harian (50–60g).`, foods: ["Ayam Goreng", "Telur Rebus", "Ikan Bandeng", "Tahu", "Tempe"], priority: "high" });
  if (energy > 0 && energy < 1200) recs.push({ icon: "⚡", title: "Tambah Sumber Energi", reason: `Total energi Anda sekitar ${energy.toFixed(0)} kcal. Pertimbangkan menambah porsi makanan pokok.`, foods: ["Nasi Putih", "Kentang Rebus", "Roti Gandum"], priority: "high" });
  const hasVeg = names.some((n) => ["sayur", "kangkung", "bayam", "wortel", "brokoli"].some((v) => n.includes(v)));
  if (!hasVeg) recs.push({ icon: "🥦", title: "Tambahkan Lebih Banyak Sayuran", reason: "Tidak terdeteksi sayuran. Sayuran penting untuk serat, vitamin, dan mineral.", foods: ["Kangkung Rebus", "Bayam Kukus", "Wortel", "Brokoli"], priority: "high" });
  const hasFruit = names.some((n) => ["pisang", "apel", "jeruk", "mangga", "pepaya"].some((v) => n.includes(v)));
  if (!hasFruit) recs.push({ icon: "🍌", title: "Konsumsi Buah Setiap Hari", reason: "Tidak terdeteksi buah. Buah kaya vitamin C, serat, dan antioksidan.", foods: ["Pisang", "Pepaya", "Jeruk", "Apel"], priority: "medium" });
  if (fat > 80) recs.push({ icon: "🫒", title: "Kurangi Asupan Lemak Jenuh", reason: `Asupan lemak Anda sekitar ${fat.toFixed(0)}g, melampaui batas (<65g/hari).`, foods: ["Ikan Kukus", "Ayam Rebus", "Tahu Kukus"], priority: "medium" });
  const hasDrink = allFoods.some((f) => f.food_type === "drink");
  if (!hasDrink) recs.push({ icon: "💧", title: "Jangan Lupa Minum Air", reason: "Tidak terdeteksi minuman. Minum minimal 8 gelas air putih per hari.", foods: ["Air Putih", "Air Kelapa", "Teh Tanpa Gula"], priority: "medium" });
  return recs.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
}

const PRIORITY_BORDER_CLASS: Record<string, string> = { high: "border-danger-border", medium: "border-warning-border", low: "border-info-border" };
const PRIORITY_BG_CLASS:     Record<string, string> = { high: "bg-danger-light",  medium: "bg-warning-light",  low: "bg-info-light"  };
const PRIORITY_BADGE:  Record<string, string> = { high: "badge-danger",               medium: "badge-warning",               low: "badge-info"               };
const PRIORITY_LABEL:  Record<string, string> = { high: "Prioritas Tinggi",           medium: "Prioritas Sedang",            low: "Saran Tambahan"           };

/* ── Page ──────────────────────────────────────────────── */
export default function SurveyDonePage() {
  const router  = useRouter();
  const params  = useParams();
  const accessToken = Array.isArray(params.accessToken) ? params.accessToken[0] : (params.accessToken ?? "");

  const [session,  setSession]  = useState<RecallSession | null>(null);
  const [showRecs, setShowRecs] = useState(false);

  useEffect(() => {
    const stored = getRecallSession();
    // Hidrasi sekali dari localStorage saat mount — sinkronisasi dari sistem eksternal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setSession(stored);
    const t = setTimeout(() => setShowRecs(true), 500);
    return () => clearTimeout(t);
  }, []);

  const totals    = calcDailyTotals(session);
  const recs      = generateRecs(session);
  const hasNutr   = totals.energy > 0 || totals.protein > 0;
  const mealCount = session?.meals.filter((m) => m.foods.length > 0).length ?? 0;
  const foodCount = session?.meals.flatMap((m) => m.foods).length ?? 0;

  const NUTRIENT_TILES = [
    { label: "Energi",      value: totals.energy,  unit: "kcal", icon: "⚡", borderClass: "border-warning-border", bgClass: "bg-warning-light", textClass: "text-warning" },
    { label: "Protein",     value: totals.protein, unit: "g",    icon: "🥩", borderClass: "border-danger-border",  bgClass: "bg-danger-light",  textClass: "text-danger"  },
    { label: "Karbohidrat", value: totals.carbs,   unit: "g",    icon: "🍚", borderClass: "border-warning-border", bgClass: "bg-[#fffbeb]",     textClass: "text-[#b45309]" },
    { label: "Lemak",       value: totals.fat,     unit: "g",    icon: "🫒", borderClass: "border-info-border",    bgClass: "bg-info-light",    textClass: "text-info"    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <AppHeader />

      <div className={cn(CONTAINER_CLASS, "flex-1 pt-10 pb-10")}>

        {/* ── Success banner ── */}
        <div className="bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_100%)] border border-[#bbf7d0] rounded-2xl p-8 text-center mb-6 shadow-sm">
          <CheckCircle size={48} className="text-[#16a34a] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#15803d] mb-2 mt-0">
            Survey Berhasil Dikumpulkan!
          </h1>
          <p className="text-sm text-[#166534] mb-6 mx-auto max-w-[480px]">
            Terima kasih{session?.respondent_name ? `, ${session.respondent_name}` : ""}! Data recall makanan Anda telah berhasil disimpan.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {[{ label: "Waktu Makan", value: mealCount }, { label: "Item Makanan", value: foodCount }, ...(hasNutr ? [{ label: "Total Energi (kcal)", value: totals.energy }] : [])].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-[#15803d]">{stat.value}</div>
                <div className="text-xs text-[#166534]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nutrition summary ── */}
        {hasNutr && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-semibold text-text-primary mb-4 mt-0">
              📊 Ringkasan Gizi Hari Ini
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {NUTRIENT_TILES.map((tile) => (
                <div
                  key={tile.label}
                  className={cn("p-4 rounded-xl text-center border", tile.borderClass, tile.bgClass)}
                >
                  <div className="text-[1.75rem] mb-1">{tile.icon}</div>
                  <div className={cn("text-xl font-bold", tile.textClass)}>{tile.value}</div>
                  <div className={cn("text-xs font-medium", tile.textClass)}>{tile.unit}</div>
                  <div className={cn("text-xs mt-0.5 opacity-75", tile.textClass)}>{tile.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Recommendations ── */}
        <div className={cn("transition-[opacity,transform] duration-500 mb-6", showRecs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3")}>
          {recs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-base">💡</div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary m-0">
                    Rekomendasi Berdasarkan Data Anda
                  </h2>
                  <p className="text-xs text-text-muted m-0">
                    Berdasarkan analisis pola makan Anda hari ini
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {recs.map((rec, i) => (
                  <div
                    key={i}
                    className={cn("border rounded-xl p-5 shadow-xs", PRIORITY_BORDER_CLASS[rec.priority], PRIORITY_BG_CLASS[rec.priority])}
                  >
                    <div className="flex gap-4 items-start">
                      <span className="text-[1.75rem] shrink-0">{rec.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-text-primary m-0">{rec.title}</h3>
                          <span className={`badge ${PRIORITY_BADGE[rec.priority]}`}>{PRIORITY_LABEL[rec.priority]}</span>
                        </div>
                        <p className="text-xs text-text-muted mb-3 leading-relaxed">{rec.reason}</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.foods.map((food) => (
                            <Link
                              key={food}
                              href={`/find-food?q=${encodeURIComponent(food)}`}
                              className="text-xs font-medium py-[3px] px-[10px] rounded-full border border-border bg-surface text-text-secondary no-underline transition-fast hover:bg-primary hover:text-white hover:border-primary"
                            >
                              {food} →
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {recs.length === 0 && session && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 text-center">
              <div className="text-[2rem] mb-2">🎉</div>
              <h3 className="text-base font-semibold text-[#15803d] mb-1 mt-0">Pola Makan Anda Sudah Baik!</h3>
              <p className="text-sm text-[#166534] m-0">Pertahankan pola makan seimbang Anda.</p>
            </div>
          )}
        </div>

        {/* ── Meal detail ── */}
        {session && session.meals.some((m) => m.foods.length > 0) && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-semibold text-text-primary mb-4 mt-0">
              🍱 Detail Waktu Makan
            </h2>
            <div className="flex flex-col gap-3">
              {session.meals.filter((m) => m.foods.length > 0).map((meal) => (
                <div key={meal.name} className="p-4 bg-surface-alt rounded-lg border border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary">{meal.name}</span>
                    <span className="text-xs text-text-muted">{meal.time} · {meal.foods.length} item</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meal.foods.map((rf) => (
                      <span key={rf.food.id} className="badge badge-default">
                        {rf.food.name}{rf.portion ? ` (${rf.portion.portion_gram}g)` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/find-food"
            className="inline-flex items-center gap-2 py-3 px-5 rounded-lg bg-primary-light text-primary font-medium text-sm no-underline border-[1.5px] border-primary-border transition-fast hover:bg-primary-muted"
          >
            <Search size={15} /> Cari Info Makanan
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 py-3 px-5 rounded-lg bg-surface text-text-secondary font-medium text-sm no-underline border-[1.5px] border-border"
          >
            <User size={15} /> Lihat Profil
          </Link>
          <button
            type="button"
            onClick={() => { clearRecallSession(); router.push(`/surveys/${accessToken}/join`); }}
            className="inline-flex items-center gap-2 py-3 px-5 rounded-lg bg-primary text-white font-semibold text-sm border-none cursor-pointer transition-base hover:bg-primary-hover"
          >
            <RefreshCw size={15} /> Isi Survey Lagi
          </button>
        </div>

      </div>
    </div>
  );
}
