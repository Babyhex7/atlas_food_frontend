"use client";

import { useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  CupSoda,
  Loader2,
  Pencil,
  Plus,
  Send,
  UtensilsCrossed,
} from "lucide-react";
import { submitSurvey } from "@/internal/domain/submission/services/submissionService";
import type { CreateSubmissionRequest } from "@/internal/domain/submission/types/submission";
import type { RecallSession, RecallFood, AdditionalItem } from "../types/recall";
import { calcNutrientsForPortion } from "../utils/nutrients";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import { useCollab } from "@/internal/domain/collab";
import { Button, Card, StepHeader, StepNav, StepShell } from "./ui/Primitives";

interface Props {
  session: RecallSession;
  /** Dipanggil dengan submission_id dari backend — dibutuhkan Step 6 untuk analisis AI. */
  onSubmitted: (submissionId: string) => void;
  onBack: () => void;
  onEditPortions: () => void;
  onAddMealTime: () => void;
}

function buildSubmitPayload(session: RecallSession): CreateSubmissionRequest {
  let dailyEnergy = 0;
  let dailyProtein = 0;
  let dailyCarbs = 0;
  let dailyFat = 0;

  const meals_data = session.meals.map((meal) => {
    let mealEnergy = 0;
    let mealProtein = 0;
    let mealCarbs = 0;
    let mealFat = 0;

    const foods = meal.foods.map((rf) => {
      const portionGram = rf.portion?.portion_gram ?? 0;
      const nutrients = calcNutrientsForPortion(rf.detail?.nutrients, portionGram);

      mealEnergy += nutrients.energy;
      mealProtein += nutrients.protein;
      mealCarbs += nutrients.carbs;
      mealFat += nutrients.fat;

      return {
        food_id: rf.food.id,
        food_name: rf.food.name,
        portion_gram: portionGram,
        portion: rf.portion
          ? {
              ...rf.portion,
              custom_weight: rf.portion.method === "input" ? rf.portion.portion_gram : undefined,
            }
          : undefined,
        nutrients: {
          energy: nutrients.energy,
          protein: nutrients.protein,
          carbs: nutrients.carbs,
          fat: nutrients.fat,
        },
        additionals: rf.additionals ?? [],
      };
    });

    dailyEnergy += mealEnergy;
    dailyProtein += mealProtein;
    dailyCarbs += mealCarbs;
    dailyFat += mealFat;

    return {
      name: meal.name,
      time: meal.time,
      foods,
      meal_total: {
        energy: Math.round(mealEnergy * 10) / 10,
        protein: Math.round(mealProtein * 10) / 10,
        carbs: Math.round(mealCarbs * 10) / 10,
        fat: Math.round(mealFat * 10) / 10,
      },
    };
  });

  return {
    survey_id: session.survey_id,
    participant_id: session.participant_id,
    respondent_name: session.respondent_name,
    meals_data,
    daily_total: {
      energy: Math.round(dailyEnergy * 10) / 10,
      protein: Math.round(dailyProtein * 10) / 10,
      carbs: Math.round(dailyCarbs * 10) / 10,
      fat: Math.round(dailyFat * 10) / 10,
    },
    missing_foods: session.missing_foods,
  };
}

function validateSession(session: RecallSession): string | null {
  if (!session.survey_id) {
    return "Survei belum diinisialisasi. Silakan mulai ulang dari halaman join.";
  }
  const filledMeals = session.meals.filter((m) => m.foods.length > 0);
  if (filledMeals.length === 0) {
    return "Minimal satu waktu makan harus diisi sebelum mengirim.";
  }
  const incomplete = filledMeals.some((m) =>
    m.foods.some((f) => !f.portion || f.portion.portion_gram <= 0)
  );
  if (incomplete) {
    return "Semua makanan harus memiliki porsi yang valid sebelum dikirim.";
  }
  return null;
}

export function Step5Review({
  session,
  onSubmitted,
  onBack,
  onEditPortions,
  onAddMealTime,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { send, isConnected } = useCollab();

  // Item di-flatten bersama waktu makannya: makanan yang sama bisa muncul di dua
  // waktu makan, jadi identitas baris harus mencakup meal agar key tetap unik.
  const rows = session.meals.flatMap((meal) => meal.foods.map((food) => ({ meal, food })));

  const allAdditionals: AdditionalItem[] = rows
    .flatMap(({ food }) => food.additionals ?? [])
    .filter((a) => a.amount_value > 0);

  const validationError = validateSession(session);
  const canSubmit = !validationError && rows.length > 0;

  const totals = session.meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((rf: RecallFood) => {
        const n = calcNutrientsForPortion(rf.detail?.nutrients, rf.portion?.portion_gram ?? 0);
        acc.energy += n.energy;
        acc.protein += n.protein;
        acc.carbs += n.carbs;
        acc.fat += n.fat;
      });
      return acc;
    },
    { energy: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleSubmit = async () => {
    const err = validateSession(session);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitSurvey(buildSubmitPayload(session));
      if (isConnected) {
        send("review_submit", { survey_id: session.survey_id });
      }
      // submission_id diteruskan ke atas: tanpa ini Step 6 tidak bisa meminta
      // analisis gizi AI karena endpoint-nya mewajibkan submission_id.
      onSubmitted(result.submission_id);
    } catch (e) {
      setError(getApiErrorMessage(e, "Gagal mengirim. Silakan coba lagi."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepShell>
      <StepHeader
        title="Tinjau laporan Anda"
        subtitle="Rincian makanan dan perkiraan kandungan gizi berdasarkan data yang Anda isi."
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* ── Daftar item ────────────────────────────────────────────── */}
        <Card padded={false}>
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <ClipboardList aria-hidden className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="flex-1 text-base font-semibold text-text-primary">Item makanan</h3>
            <button
              type="button"
              onClick={onEditPortions}
              className="rounded-md text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ubah
            </button>
          </div>

          <ul>
            {rows.map(({ meal, food }) => {
              const ItemIcon = food.food_type === "drink" ? CupSoda : UtensilsCrossed;
              return (
                <li
                  key={`${meal.name}-${food.food.id}`}
                  className="flex items-start gap-3 border-b border-border px-5 py-4 last:border-b-0"
                >
                  <ItemIcon aria-hidden className="mt-px h-4 w-4 shrink-0 text-text-muted" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-text-primary">{food.food.name}</span>
                    <span className="text-xs text-text-muted">
                      {meal.name}
                      {meal.time ? ` · ${meal.time}` : ""}
                    </span>
                    {food.additionals && food.additionals.length > 0 ? (
                      <span className="mt-1 text-xs text-text-muted">
                        dengan {food.additionals.map((a) => a.name.toLowerCase()).join(", ")}
                      </span>
                    ) : null}
                  </div>
                  <span className="whitespace-nowrap font-mono text-sm font-semibold text-text-secondary">
                    {food.portion ? `${food.portion.portion_gram}g` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>

          {allAdditionals.length > 0 ? (
            <div className="border-t border-border bg-surface-alt px-5 py-4">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
                Bahan tambahan
              </span>
              <div className="flex flex-wrap gap-2">
                {allAdditionals.map((a, i) => (
                  <span
                    key={`${a.name}-${i}`}
                    className="flex flex-col items-center rounded-md border border-border bg-surface px-3 py-2 text-center"
                  >
                    <span className="text-[10px] text-text-muted">{a.name}</span>
                    <span className="font-mono text-xs font-bold text-primary">{a.amount}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        {/* ── Ringkasan & aksi ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <Card>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
              Perkiraan total harian
            </span>
            <dl className="grid grid-cols-2 gap-3">
              <NutrientStat label="Energi" value={Math.round(totals.energy)} unit="kkal" />
              <NutrientStat label="Protein" value={Math.round(totals.protein * 10) / 10} unit="g" />
              <NutrientStat
                label="Karbohidrat"
                value={Math.round(totals.carbs * 10) / 10}
                unit="g"
              />
              <NutrientStat label="Lemak" value={Math.round(totals.fat * 10) / 10} unit="g" />
            </dl>
          </Card>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
              Aksi cepat
            </span>
            <Button variant="secondary" fullWidth icon={Pencil} onClick={onEditPortions}>
              Ubah porsi
            </Button>
            <Button variant="secondary" fullWidth icon={Plus} onClick={onAddMealTime}>
              Tambah waktu makan
            </Button>
          </div>

          {error || validationError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md bg-danger-light p-3 text-xs text-danger"
            >
              <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" />
              {error ?? validationError}
            </p>
          ) : null}

          <Button
            size="lg"
            fullWidth
            icon={submitting ? Loader2 : Send}
            iconPosition="right"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className={submitting ? "[&>svg]:animate-spin" : undefined}
          >
            {submitting ? "Mengirim…" : "Kirim laporan"}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted">
        Dengan mengirim, Anda menyetujui Kebijakan Data Gizi Klinis kami.
      </p>

      <StepNav>
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          Kembali
        </Button>
      </StepNav>
    </StepShell>
  );
}

function NutrientStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg bg-surface-alt p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.07em] text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-base font-bold text-text-primary">
        {value}
        <span className="ml-1 text-xs font-medium text-text-muted">{unit}</span>
      </dd>
    </div>
  );
}
