"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
  }, []);

  const totals = calcDailyTotals(session);
  const hasNutr = totals.energy > 0 || totals.protein > 0;
  const mealCount = session?.meals.filter((m) => m.foods.length > 0).length ?? 0;
  const foodCount = session?.meals.flatMap((m) => m.foods).length ?? 0;
  const filledMeals = session?.meals.filter((m) => m.foods.length > 0) ?? [];

  const nutrientTiles = [
    { label: "Energi", value: totals.energy, unit: "kkal", icon: Flame, tone: "text-warning" },
    { label: "Protein", value: totals.protein, unit: "g", icon: Drumstick, tone: "text-danger" },
    { label: "Karbohidrat", value: totals.carbs, unit: "g", icon: Wheat, tone: "text-primary" },
    { label: "Lemak", value: totals.fat, unit: "g", icon: Droplets, tone: "text-info" },
  ];

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />

      <div className={cn(CONTAINER_CLASS, "flex-1 py-8 sm:py-10")}>
        <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-6">
          {/* ── Sukses ─────────────────────────────────────────────────── */}
          <section className="flex flex-col items-center gap-4 rounded-xl border border-success-border bg-success-light px-5 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
              <CheckCircle2 aria-hidden className="h-7 w-7 text-success" />
            </span>
            <StepHeader
              centered
              title="Survey berhasil dikumpulkan"
              subtitle={`Terima kasih${
                session?.respondent_name ? `, ${session.respondent_name}` : ""
              }! Data recall makanan Anda sudah tersimpan.`}
            />
            <dl className="flex flex-wrap justify-center gap-6">
              {[
                { label: "Waktu makan", value: mealCount },
                { label: "Item makanan", value: foodCount },
                ...(hasNutr ? [{ label: "Energi (kkal)", value: totals.energy }] : []),
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-success">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-bold text-success">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── Ringkasan gizi ─────────────────────────────────────────── */}
          {hasNutr ? (
            <Card>
              <CardLabel>Ringkasan gizi hari ini</CardLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {nutrientTiles.map(({ label, value, unit, icon: Icon, tone }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border bg-surface-alt p-3 text-center"
                  >
                    <Icon aria-hidden className={cn("mx-auto mb-2 h-4 w-4", tone)} />
                    <div className="font-mono text-base font-bold text-text-primary">
                      {value}
                      <span className="ml-1 text-xs font-medium text-text-muted">{unit}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-text-muted">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {/* ── Detail waktu makan ─────────────────────────────────────── */}
          {filledMeals.length > 0 ? (
            <Card>
              <CardLabel icon={UtensilsCrossed}>Detail waktu makan</CardLabel>
              <ul className="flex flex-col gap-3">
                {filledMeals.map((meal) => (
                  <li
                    key={`${meal.name}-${meal.time}`}
                    className="rounded-lg border border-border bg-surface-alt p-4"
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-text-primary">{meal.name}</span>
                      <span className="text-xs text-text-muted">
                        {meal.time} · {meal.foods.length} item
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.foods.map((rf) => (
                        <span
                          key={`${meal.name}-${rf.food.id}`}
                          className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary"
                        >
                          {rf.food.name}
                          {rf.portion ? ` (${rf.portion.portion_gram}g)` : ""}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {/* ── AI (sama komponen dengan Step 6 wizard) ────────────────── */}
          <AiRecommendationPanel submissionId={session?.submission_id} />

          {/* ── Aksi ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/find-food"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-text-secondary no-underline transition-all hover:border-primary hover:bg-primary-light hover:text-primary"
            >
              <Search aria-hidden className="h-4 w-4" />
              Cari makanan
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-text-secondary no-underline transition-all hover:border-primary hover:bg-primary-light hover:text-primary"
            >
              <User aria-hidden className="h-4 w-4" />
              Profil
            </Link>
            <Button
              icon={RefreshCw}
              onClick={() => {
                clearRecallSession();
                router.push("/surveys");
              }}
            >
              Isi survey lagi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
