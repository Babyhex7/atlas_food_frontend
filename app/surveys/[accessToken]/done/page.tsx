"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ArrowDown,
  CheckCircle2,
  Flame,
  Drumstick,
  Wheat,
  Droplets,
  RefreshCw,
  Search,
  User,
  UtensilsCrossed,
} from "lucide-react";
import {
  clearRecallSession,
  getRecallSession,
} from "@/internal/domain/recall/services/recallStorage";
import type { RecallSession } from "@/internal/domain/recall/types/recall";
import { calcNutrientsForPortion } from "@/internal/domain/recall/utils/nutrients";
import {
  Button,
  Card,
  CardLabel,
  StepHeader,
} from "@/internal/domain/recall/components/ui/Primitives";
import { AiRecommendationPanel } from "@/internal/domain/ai";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { getImageUrl } from "@/internal/lib/image";

type DailyTotals = { energy: number; protein: number; carbs: number; fat: number };

function calcDailyTotals(session: RecallSession | null): DailyTotals {
  const t: DailyTotals = { energy: 0, protein: 0, carbs: 0, fat: 0 };
  if (!session) return t;
  for (const meal of session.meals) {
    for (const rf of meal.foods) {
      const n = calcNutrientsForPortion(rf.detail?.nutrients, rf.portion?.portion_gram ?? 0);
      t.energy += n.energy;
      t.protein += n.protein;
      t.carbs += n.carbs;
      t.fat += n.fat;
    }
  }
  return {
    energy: Math.round(t.energy),
    protein: Math.round(t.protein * 10) / 10,
    carbs: Math.round(t.carbs * 10) / 10,
    fat: Math.round(t.fat * 10) / 10,
  };
}

export default function SurveyDonePage() {
  const router = useRouter();
  const [session, setSession] = useState<RecallSession | null>(null);

  useEffect(() => {
    // Hidrasi sekali dari localStorage saat mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(getRecallSession());

    // Efek perayaan kembang api / confetti saat survei berhasil dikumpulkan
    const duration = 2.4 * 1000;
    const animationEnd = Date.now() + duration;

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#059669", "#34d399", "#f59e0b", "#0284c7"],
    });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });
      confetti({
        particleCount: 25,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  const totals = calcDailyTotals(session);
  const hasNutr = totals.energy > 0 || totals.protein > 0;
  const mealCount = session?.meals.filter((m) => m.foods.length > 0).length ?? 0;
  const foodCount = session?.meals.flatMap((m) => m.foods).length ?? 0;
  const filledMeals = session?.meals.filter((m) => m.foods.length > 0) ?? [];

  // Standar AKG Dewasa Rata-Rata Indonesia (Permenkes RI):
  // Energi ~2150 kkal, Protein ~60g, Karbo ~320g, Lemak ~65g
  const nutrientTiles = [
    {
      label: "Energi",
      value: totals.energy,
      unit: "kkal",
      target: 2150,
      icon: Flame,
      tone: "text-amber-500",
      bgTone: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Protein",
      value: totals.protein,
      unit: "g",
      target: 60,
      icon: Drumstick,
      tone: "text-rose-500",
      bgTone: "bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "Karbohidrat",
      value: totals.carbs,
      unit: "g",
      target: 320,
      icon: Wheat,
      tone: "text-emerald-500",
      bgTone: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Lemak",
      value: totals.fat,
      unit: "g",
      target: 65,
      icon: Droplets,
      tone: "text-blue-500",
      bgTone: "bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />

      <div className={cn(CONTAINER_CLASS, "flex-1 py-8 sm:py-12")}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* ── Sukses Hero ────────────────────────────────────────────── */}
          <section className="flex flex-col items-center text-center rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-surface to-surface p-6 sm:p-8 shadow-xs">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 mb-4">
              <CheckCircle2 aria-hidden className="h-9 w-9 stroke-[2.2]" />
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Survei Recall Berhasil Dikumpulkan
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
              Terima kasih{session?.respondent_name ? `, ${session.respondent_name}` : ""}! Laporan
              recall konsumsi makanan Anda telah tersimpan resmi di sistem. Anda dapat melihat ringkasan gizi makro dan rekomendasi AKG di bawah ini.
            </p>

            <dl className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-8 w-full max-w-lg rounded-xl border border-border/80 bg-surface/90 py-3.5 px-6 shadow-2xs">
              {[
                { label: "Waktu Makan", value: `${mealCount} sesi` },
                { label: "Item Makanan", value: `${foodCount} item` },
                ...(hasNutr ? [{ label: "Total Energi", value: `${totals.energy} kkal` }] : []),
              ].map((stat) => (
                <div key={stat.label} className="text-center flex-1 min-w-24">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-bold text-text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>

            {/* Shortcut Tombol Gulir Cepat ke Rekomendasi AI */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("ai-evaluation")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-white hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Lihat Evaluasi Gizi & Rekomendasi AI</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* ── Ringkasan Gizi Makro ─────────────────────────────────────── */}
          {hasNutr ? (
            <Card>
              <CardLabel icon={Flame}>Ringkasan Kecukupan Gizi Hari Ini (Perkiraan)</CardLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {nutrientTiles.map(({ label, value, unit, target, icon: Icon, tone, bgTone }) => {
                  const pct = Math.min(100, Math.round((value / target) * 100));
                  return (
                    <div
                      key={label}
                      className={cn("rounded-xl border p-4 text-center transition-all", bgTone)}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface shadow-2xs mx-auto mb-2.5">
                        <Icon aria-hidden className={cn("h-4 w-4", tone)} />
                      </span>
                      <div className="font-mono text-lg font-bold text-text-primary">
                        {value}
                        <span className="ml-1 text-xs font-semibold text-text-muted">{unit}</span>
                      </div>
                      <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        {label}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-text-muted">
                        <span>AKG: {target}{unit}</span>
                        <span className="font-semibold text-text-primary">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {/* ── Detail Waktu Makan ─────────────────────────────────────── */}
          {filledMeals.length > 0 ? (
            <Card>
              <CardLabel icon={UtensilsCrossed}>Detail Makanan Tercatat</CardLabel>
              <ul className="flex flex-col gap-3">
                {filledMeals.map((meal) => (
                  <li
                    key={`${meal.name}-${meal.time}`}
                    className="rounded-xl border border-border bg-surface-alt/60 p-4 shadow-2xs"
                  >
                    <div className="mb-2.5 flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
                      <span className="text-sm font-bold text-text-primary">{meal.name}</span>
                      <span className="text-xs text-text-muted font-medium">
                        Jam {meal.time} · {meal.foods.length} item
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.foods.map((rf) => {
                        const img = rf.portion?.image_url || rf.food.thumbnail_url || rf.food.image_url;
                        return (
                          <span
                            key={`${meal.name}-${rf.food.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary shadow-2xs"
                          >
                            {img ? (
                              <img
                                src={getImageUrl(img)}
                                alt=""
                                className="h-4 w-4 rounded-full object-cover shrink-0"
                              />
                            ) : null}
                            <span className="font-semibold text-text-primary">{rf.food.name}</span>
                            {rf.portion ? (
                              <span className="font-mono text-primary font-bold">
                                ({rf.portion.portion_gram}g)
                              </span>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {/* ── AI (Evaluasi Kecukupan Gizi AKG) ────────────────────────── */}
          <div id="ai-evaluation" className="scroll-mt-6">
            <AiRecommendationPanel submissionId={session?.submission_id} />
          </div>

          {/* ── Aksi ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/find-food"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text-secondary no-underline transition-all hover:border-primary hover:bg-primary-light hover:text-primary shadow-2xs"
            >
              <Search aria-hidden className="h-4 w-4" />
              Eksplorasi Katalog Makanan
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text-secondary no-underline transition-all hover:border-primary hover:bg-primary-light hover:text-primary shadow-2xs"
            >
              <User aria-hidden className="h-4 w-4" />
              Profil Pengguna
            </Link>
            <Button
              size="lg"
              icon={RefreshCw}
              onClick={() => {
                clearRecallSession();
                router.push("/surveys");
              }}
            >
              Isi Survei Baru
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

