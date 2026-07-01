"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getRecallSession, clearRecallSession } from "@/internal/domain/recall/services/recallStorage";
import type { RecallSession } from "@/internal/domain/recall/types/recall";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

// ── AI Recommendation engine (rule-based, client-side) ───────────────────────

type AIRecommendation = {
  category: string;
  icon: string;
  title: string;
  reason: string;
  foods: string[];
  priority: "high" | "medium" | "low";
};

function generateRecommendations(session: RecallSession | null): AIRecommendation[] {
  if (!session) return [];

  const allFoods = session.meals.flatMap((m) => m.foods);
  const foodNames = allFoods.map((f) => f.food.name.toLowerCase());

  // Rough nutrient sums from portions
  let totalEnergy = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const rf of allFoods) {
    const g = rf.portion?.portion_gram ?? 0;
    const n = rf.detail?.nutrients;
    if (n && g > 0) {
      const factor = g / 100;
      totalEnergy += (n["energy"]?.value ?? 0) * factor;
      totalProtein += (n["protein"]?.value ?? 0) * factor;
      totalCarbs += (n["carbs"]?.value ?? 0) * factor;
      totalFat += (n["fat"]?.value ?? 0) * factor;
    }
  }

  const recs: AIRecommendation[] = [];

  // Low protein check (< 40g/day)
  if (totalProtein < 40) {
    recs.push({
      category: "Protein",
      icon: "🥩",
      title: "Tingkatkan Asupan Protein",
      reason: `Asupan protein Anda sekitar ${totalProtein.toFixed(0)}g, di bawah kebutuhan harian yang dianjurkan (50–60g).`,
      foods: ["Ayam Goreng", "Telur Rebus", "Ikan Bandeng", "Tahu Goreng", "Tempe"],
      priority: "high",
    });
  }

  // Low energy check (< 1200 kcal/day)
  if (totalEnergy > 0 && totalEnergy < 1200) {
    recs.push({
      category: "Energi",
      icon: "⚡",
      title: "Tambah Sumber Energi",
      reason: `Total energi Anda sekitar ${totalEnergy.toFixed(0)} kcal. Pertimbangkan menambah porsi makanan pokok.`,
      foods: ["Nasi Putih", "Kentang Rebus", "Roti Gandum", "Singkong", "Ubi"],
      priority: "high",
    });
  }

  // No vegetables check
  const hasVeg = foodNames.some((n) =>
    ["sayur", "kangkung", "bayam", "wortel", "brokoli", "selada", "kubis", "labu", "oyong", "tomat"].some((v) => n.includes(v))
  );
  if (!hasVeg) {
    recs.push({
      category: "Sayuran",
      icon: "🥦",
      title: "Tambahkan Lebih Banyak Sayuran",
      reason: "Tidak terdeteksi sayuran dalam laporan makan Anda. Sayuran penting untuk serat, vitamin, dan mineral.",
      foods: ["Kangkung Rebus", "Bayam Kukus", "Wortel", "Brokoli", "Lalapan Segar"],
      priority: "high",
    });
  }

  // No fruits check
  const hasFruit = foodNames.some((n) =>
    ["pisang", "apel", "jeruk", "mangga", "pepaya", "semangka", "melon", "buah", "jambu"].some((v) => n.includes(v))
  );
  if (!hasFruit) {
    recs.push({
      category: "Buah",
      icon: "🍌",
      title: "Konsumsi Buah Setiap Hari",
      reason: "Tidak terdeteksi buah dalam laporan makan Anda. Buah kaya akan vitamin C, serat, dan antioksidan.",
      foods: ["Pisang", "Pepaya", "Jeruk", "Apel", "Jambu Biji"],
      priority: "medium",
    });
  }

  // High fat check (> 80g/day)
  if (totalFat > 80) {
    recs.push({
      category: "Lemak",
      icon: "🫒",
      title: "Kurangi Asupan Lemak Jenuh",
      reason: `Asupan lemak Anda sekitar ${totalFat.toFixed(0)}g, melampaui batas yang dianjurkan (<65g/hari).`,
      foods: ["Ikan Kukus", "Ayam Rebus tanpa kulit", "Tahu Kukus", "Tempe Kukus"],
      priority: "medium",
    });
  }

  // Hydration check
  const hasDrink = allFoods.some((f) => f.food_type === "drink");
  if (!hasDrink) {
    recs.push({
      category: "Hidrasi",
      icon: "💧",
      title: "Jangan Lupa Minum Air",
      reason: "Tidak terdeteksi minuman dalam laporan Anda. Pastikan minum minimal 8 gelas air putih per hari.",
      foods: ["Air Putih", "Air Kelapa", "Infused Water", "Teh Tanpa Gula"],
      priority: "medium",
    });
  }

  // Balanced meal check
  const mealCount = session.meals.filter((m) => m.foods.length > 0).length;
  if (mealCount < 3) {
    recs.push({
      category: "Pola Makan",
      icon: "🍽️",
      title: "Perbanyak Frekuensi Makan",
      reason: `Anda hanya merekam ${mealCount} waktu makan. Pola makan 3x sehari membantu menjaga metabolisme.`,
      foods: ["Sarapan pagi", "Snack sehat", "Makan siang", "Makan malam"],
      priority: "low",
    });
  }

  return recs.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

const PRIORITY_COLORS = {
  high: "border-red-200 bg-red-50",
  medium: "border-yellow-200 bg-yellow-50",
  low: "border-blue-200 bg-blue-50",
};

const PRIORITY_BADGE = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

const PRIORITY_LABELS = {
  high: "Prioritas Tinggi",
  medium: "Prioritas Sedang",
  low: "Saran Tambahan",
};

// ── Nutrient summary ─────────────────────────────────────────────────────────

type DailyTotals = { energy: number; protein: number; carbs: number; fat: number };

function calcDailyTotals(session: RecallSession | null): DailyTotals {
  const totals: DailyTotals = { energy: 0, protein: 0, carbs: 0, fat: 0 };
  if (!session) return totals;
  for (const meal of session.meals) {
    for (const rf of meal.foods) {
      const g = rf.portion?.portion_gram ?? 0;
      const n = rf.detail?.nutrients;
      if (n && g > 0) {
        const f = g / 100;
        totals.energy += (n["energy"]?.value ?? 0) * f;
        totals.protein += (n["protein"]?.value ?? 0) * f;
        totals.carbs += (n["carbs"]?.value ?? 0) * f;
        totals.fat += (n["fat"]?.value ?? 0) * f;
      }
    }
  }
  return {
    energy: Math.round(totals.energy),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
}

// ── Page component ────────────────────────────────────────────────────────────

export default function SurveyDonePage() {
  const router = useRouter();
  const params = useParams();
  const accessToken = Array.isArray(params.accessToken) ? params.accessToken[0] : params.accessToken ?? "";

  const [session, setSession] = useState<RecallSession | null>(null);
  const [showRecs, setShowRecs] = useState(false);

  useEffect(() => {
    // Read session BEFORE clearing
    const stored = getRecallSession();
    if (stored) setSession(stored);
    // Delay showing recommendations for UX
    const t = setTimeout(() => setShowRecs(true), 600);
    return () => clearTimeout(t);
  }, []);

  const totals = calcDailyTotals(session);
  const recommendations = generateRecommendations(session);
  const respondentName = session?.respondent_name;
  const mealCount = session?.meals.filter((m) => m.foods.length > 0).length ?? 0;
  const totalFoods = session?.meals.flatMap((m) => m.foods).length ?? 0;
  const hasNutritionData = totals.energy > 0 || totals.protein > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className={`${CONTAINER_CLASS} py-10 flex-1`}>

        {/* Success Banner */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center mb-8 shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
            Survey Berhasil Dikumpulkan!
          </h1>
          <p className="text-green-700 max-w-lg mx-auto">
            Terima kasih{respondentName ? `, ${respondentName}` : ""}! Data recall makanan Anda telah berhasil disimpan dan siap dianalisis.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{mealCount}</div>
              <div className="text-xs text-green-600">Waktu Makan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{totalFoods}</div>
              <div className="text-xs text-green-600">Item Makanan</div>
            </div>
            {hasNutritionData && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{totals.energy}</div>
                <div className="text-xs text-green-600">Total Energi (kcal)</div>
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Summary */}
        {hasNutritionData && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">📊 Ringkasan Gizi Hari Ini</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Energi", value: totals.energy, unit: "kcal", icon: "⚡", color: "bg-orange-50 border-orange-200 text-orange-700" },
                { label: "Protein", value: totals.protein, unit: "g", icon: "🥩", color: "bg-red-50 border-red-200 text-red-700" },
                { label: "Karbohidrat", value: totals.carbs, unit: "g", icon: "🍚", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                { label: "Lemak", value: totals.fat, unit: "g", icon: "🫒", color: "bg-blue-50 border-blue-200 text-blue-700" },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-xl border ${item.color} text-center`}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xl font-bold">{item.value}</div>
                  <div className="text-xs font-medium">{item.unit}</div>
                  <div className="text-xs mt-0.5 opacity-75">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className={`transition-all duration-500 ${showRecs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {recommendations.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm">💡</div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Rekomendasi AI Berbasis Data Anda</h2>
                  <p className="text-xs text-muted">Berdasarkan analisis pola makan Anda hari ini</p>
                </div>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className={`border rounded-2xl p-5 ${PRIORITY_COLORS[rec.priority]} shadow-sm`}>
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">{rec.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[rec.priority]}`}>
                            {PRIORITY_LABELS[rec.priority]}
                          </span>
                        </div>
                        <p className="text-sm text-muted mb-3">{rec.reason}</p>
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1.5">Pilihan Makanan yang Disarankan:</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.foods.map((food) => (
                              <Link
                                key={food}
                                href={`/find-food?q=${encodeURIComponent(food)}`}
                                className="text-xs px-3 py-1.5 bg-white/80 border border-white rounded-full text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all font-medium shadow-sm"
                              >
                                {food} →
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length === 0 && session && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="font-semibold text-green-800 mb-1">Pola Makan Anda Sudah Baik!</h3>
              <p className="text-sm text-green-700">Pertahankan pola makan seimbang Anda. Tidak ada kekurangan gizi signifikan yang terdeteksi.</p>
            </div>
          )}
        </div>

        {/* Meal Summary */}
        {session && session.meals.length > 0 && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">🍱 Detail Waktu Makan</h2>
            <div className="space-y-3">
              {session.meals.filter((m) => m.foods.length > 0).map((meal) => (
                <div key={meal.name} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{meal.name}</span>
                    <span className="text-xs text-muted">{meal.time} · {meal.foods.length} item</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.foods.map((rf) => (
                      <span key={rf.food.id} className="text-xs bg-white border border-border px-2.5 py-1 rounded-full text-muted">
                        {rf.food.name}
                        {rf.portion ? ` (${rf.portion.portion_gram}g)` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/find-food"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
          >
            🔍 Cari Info Makanan
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface border border-border text-foreground hover:border-primary/40 transition-colors font-medium text-sm"
          >
            👤 Lihat Profil
          </Link>
          <button
            type="button"
            onClick={() => {
              clearRecallSession();
              router.push(`/surveys/${accessToken}/join`);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition-colors font-medium text-sm"
          >
            + Isi Survey Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
