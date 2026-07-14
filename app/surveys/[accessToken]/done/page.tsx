"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getRecallSession, clearRecallSession } from "@/internal/domain/recall/services/recallStorage";
import type { RecallSession } from "@/internal/domain/recall/types/recall";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
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

const PRIORITY_BORDER: Record<string, string> = { high: "var(--color-danger-border)", medium: "var(--color-warning-border)", low: "var(--color-info-border)" };
const PRIORITY_BG:     Record<string, string> = { high: "var(--color-danger-light)",  medium: "var(--color-warning-light)",  low: "var(--color-info-light)"  };
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
    { label: "Energi",      value: totals.energy,  unit: "kcal", icon: "⚡", borderColor: "var(--color-warning-border)", bgColor: "var(--color-warning-light)", textColor: "var(--color-warning)" },
    { label: "Protein",     value: totals.protein, unit: "g",    icon: "🥩", borderColor: "var(--color-danger-border)",  bgColor: "var(--color-danger-light)",  textColor: "var(--color-danger)"  },
    { label: "Karbohidrat", value: totals.carbs,   unit: "g",    icon: "🍚", borderColor: "var(--color-warning-border)", bgColor: "#fffbeb",                     textColor: "#b45309"              },
    { label: "Lemak",       value: totals.fat,     unit: "g",    icon: "🫒", borderColor: "var(--color-info-border)",    bgColor: "var(--color-info-light)",    textColor: "var(--color-info)"    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <AppHeader />

      <div className={CONTAINER_CLASS} style={{ flex: 1, paddingTop: "var(--space-10)", paddingBottom: "var(--space-10)" }}>

        {/* ── Success banner ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--radius-2xl)",
            padding: "var(--space-8)",
            textAlign: "center",
            marginBottom: "var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <CheckCircle size={48} style={{ color: "#16a34a", margin: "0 auto var(--space-4)" }} />
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "#15803d", margin: "0 0 var(--space-2)" }}>
            Survey Berhasil Dikumpulkan!
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "#166534", margin: "0 0 var(--space-6)", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Terima kasih{session?.respondent_name ? `, ${session.respondent_name}` : ""}! Data recall makanan Anda telah berhasil disimpan.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-8)", flexWrap: "wrap" }}>
            {[{ label: "Waktu Makan", value: mealCount }, { label: "Item Makanan", value: foodCount }, ...(hasNutr ? [{ label: "Total Energi (kcal)", value: totals.energy }] : [])].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "#15803d" }}>{stat.value}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "#166534" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nutrition summary ── */}
        {hasNutr && (
          <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-4)" }}>
              📊 Ringkasan Gizi Hari Ini
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--space-3)" }}>
              {NUTRIENT_TILES.map((tile) => (
                <div
                  key={tile.label}
                  style={{ padding: "var(--space-4)", borderRadius: "var(--radius-xl)", border: `1px solid ${tile.borderColor}`, backgroundColor: tile.bgColor, textAlign: "center" }}
                >
                  <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-1)" }}>{tile.icon}</div>
                  <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color: tile.textColor }}>{tile.value}</div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: tile.textColor }}>{tile.unit}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: tile.textColor, opacity: 0.75, marginTop: 2 }}>{tile.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Recommendations ── */}
        <div style={{ transition: "opacity 0.5s, transform 0.5s", opacity: showRecs ? 1 : 0, transform: showRecs ? "none" : "translateY(12px)", marginBottom: "var(--space-6)" }}>
          {recs.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>💡</div>
                <div>
                  <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
                    Rekomendasi Berdasarkan Data Anda
                  </h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0 }}>
                    Berdasarkan analisis pola makan Anda hari ini
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {recs.map((rec, i) => (
                  <div
                    key={i}
                    style={{ border: `1px solid ${PRIORITY_BORDER[rec.priority]}`, backgroundColor: PRIORITY_BG[rec.priority], borderRadius: "var(--radius-xl)", padding: "var(--space-5)", boxShadow: "var(--shadow-xs)" }}
                  >
                    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{rec.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-1)" }}>
                          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>{rec.title}</h3>
                          <span className={`badge ${PRIORITY_BADGE[rec.priority]}`}>{PRIORITY_LABEL[rec.priority]}</span>
                        </div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)", lineHeight: "var(--leading-relaxed)" }}>{rec.reason}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                          {rec.foods.map((food) => (
                            <Link
                              key={food}
                              href={`/find-food?q=${encodeURIComponent(food)}`}
                              style={{
                                fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)",
                                padding: "3px 10px", borderRadius: "var(--radius-full)",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)",
                                textDecoration: "none", transition: "var(--transition-fast)",
                              }}
                              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "var(--color-primary)"; el.style.color = "white"; el.style.borderColor = "var(--color-primary)"; }}
                              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "var(--color-surface)"; el.style.color = "var(--color-text-secondary)"; el.style.borderColor = "var(--color-border)"; }}
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
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--radius-xl)", padding: "var(--space-6)", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>🎉</div>
              <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#15803d", margin: "0 0 var(--space-1)" }}>Pola Makan Anda Sudah Baik!</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "#166534", margin: 0 }}>Pertahankan pola makan seimbang Anda.</p>
            </div>
          )}
        </div>

        {/* ── Meal detail ── */}
        {session && session.meals.some((m) => m.foods.length > 0) && (
          <div className="card" style={{ padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-4)" }}>
              🍱 Detail Waktu Makan
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {session.meals.filter((m) => m.foods.length > 0).map((meal) => (
                <div key={meal.name} style={{ padding: "var(--space-4)", backgroundColor: "var(--color-surface-alt)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>{meal.name}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{meal.time} · {meal.foods.length} item</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", justifyContent: "center" }}>
          <Link href="/find-food" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)", textDecoration: "none", border: "1.5px solid var(--color-primary-border)", transition: "var(--transition-fast)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-muted)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-light)"; }}
          >
            <Search size={15} /> Cari Info Makanan
          </Link>
          <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface)", color: "var(--color-text-secondary)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)", textDecoration: "none", border: "1.5px solid var(--color-border)", transition: "var(--transition-fast)" }}>
            <User size={15} /> Lihat Profil
          </Link>
          <button
            type="button"
            onClick={() => { clearRecallSession(); router.push(`/surveys/${accessToken}/join`); }}
            style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-primary)", color: "white", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)", border: "none", cursor: "pointer", transition: "var(--transition-base)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
          >
            <RefreshCw size={15} /> Isi Survey Lagi
          </button>
        </div>

      </div>
    </div>
  );
}
