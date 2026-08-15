"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Info, Lightbulb } from "lucide-react";
import { Step1SelectMeal } from "./Step1SelectMeal";
import { Step2AddFood } from "./Step2AddFood";
import { Step3Portion } from "./Step3Portion";
import { Step4Additional } from "./Step4Additional";
import { Step5Review } from "./Step5Review";
import { Step6Result } from "./Step6Result";
import { useRecallSession } from "../hooks/useRecallSession";
import { getRecallSession } from "../services/recallStorage";
import { useCollab, useCollabStore } from "@/internal/domain/collab";
import { cn } from "@/internal/lib/cn";
import type { RecallSession, RecallStep } from "../types/recall";

const STEP_LABELS: Record<RecallStep, string> = {
  select_meal: "Waktu Makan",
  add_food: "Tambah Makanan",
  portion: "Estimasi Porsi",
  additional: "Detail Tambahan",
  review: "Tinjau",
  done: "Hasil",
};

const SIDEBAR_STEPS: RecallStep[] = [
  "select_meal",
  "add_food",
  "portion",
  "additional",
  "review",
];

const STEP_NUMBERS: Record<RecallStep, number> = {
  select_meal: 1,
  add_food: 2,
  portion: 3,
  additional: 4,
  review: 5,
  done: 6,
};

/** Tip kontekstual per langkah — ditampilkan di sidebar (desktop). */
const STEP_TIPS: Partial<Record<RecallStep, { title: string; body: string }>> = {
  select_meal: {
    title: "Makan dengan sadar",
    body: "Catat semua yang Anda konsumsi agar hasil analisisnya seakurat mungkin.",
  },
  add_food: {
    title: "Catat selengkapnya",
    body: "Masukkan juga lauk, pelengkap, dan minuman supaya gambaran gizinya utuh.",
  },
  portion: {
    title: "Perkirakan dengan jujur",
    body: "Pilih foto porsi yang paling mendekati, atau isi beratnya secara manual.",
  },
  additional: {
    title: "Jangan lupa bumbu",
    body: "Minyak, gula, dan saus ikut memengaruhi total kalori Anda.",
  },
  review: {
    title: "Periksa sekali lagi",
    body: "Pastikan seluruh detail sudah benar sebelum laporan dikirim.",
  },
};

/** Step yang boleh diterima dari viewport leader — jangan percaya string bebas. */
function asRecallStep(value: string | undefined): RecallStep | null {
  if (!value) return null;
  return (STEP_NUMBERS as Record<string, number>)[value] ? (value as RecallStep) : null;
}

function mealOptionsFromSession(session: RecallSession) {
  if (session.available_meals?.length) {
    return session.available_meals.map((m) => ({ name: m.name }));
  }
  return undefined;
}

type WizardProps = {
  /**
   * true = pengguna masuk lewat link undangan rekan, bukan lewat survei miliknya
   * sendiri. Datanya tetap lokal (recall tidak direplikasi antar peserta), jadi
   * statusnya harus dinyatakan terang-terangan agar tidak terlihat seperti bug.
   */
  guest?: boolean;
};

export function RecallWizard({ guest = false }: WizardProps) {
  const params = useParams();
  const router = useRouter();
  const accessToken = Array.isArray(params.accessToken)
    ? params.accessToken[0]
    : params.accessToken ?? "";

  const storedSession = getRecallSession();
  const surveyId = storedSession?.survey_id ?? "";

  const {
    session,
    stepProgress,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    setMealType,
    setMealTime,
    addFood,
    removeFood,
    addMissingFood,
    removeMissingFood,
    setPortion,
    setPortionFoodIndex,
    setAdditionals,
    setSubmissionId,
    currentMealFoods,
    reset,
  } = useRecallSession(surveyId, accessToken, storedSession);

  const mealOptions = mealOptionsFromSession(session);

  const currentStep = session.current_step;
  const foods = currentMealFoods();
  const currentStepNumber = STEP_NUMBERS[currentStep];
  const isDone = currentStep === "done";
  const isFinalStep = currentStep === "review";
  const tip = STEP_TIPS[currentStep];

  // ── Sinkronisasi langkah antar peserta ────────────────────────────────────
  // Seluruh wizard hidup di satu URL, jadi mirror berbasis path saja tidak cukup:
  // tanpa broadcast `step`, follower ikut ke halaman recall tapi tetap terpaku di
  // langkah miliknya sendiri. Field `step` sudah didukung protokol viewport_update
  // di backend, di sini tinggal diisi dan dipakai.
  const { send, isConnected, isFollowing } = useCollab();
  const leaderStep = useCollabStore((s) => s.leaderViewport?.step);
  const setLocalStep = useCollabStore((s) => s.setLocalStep);

  // Langkah aktif ditaruh di store supaya viewport_update mana pun — termasuk
  // yang dikirim useLiveCursor saat scroll — ikut membawanya.
  useEffect(() => {
    setLocalStep(currentStep);
    return () => setLocalStep(null);
  }, [currentStep, setLocalStep]);

  useEffect(() => {
    // Saat mengikuti orang lain kita bukan sumber kebenaran — jangan pantulkan
    // balik langkah leader, karena itu memicu loop mirror antar dua peserta.
    if (!isConnected || isFollowing) return;
    send("viewport_update", {
      page: window.location.pathname,
      path: window.location.pathname + window.location.search,
      step: currentStep,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
    });
  }, [isConnected, isFollowing, currentStep, send]);

  useEffect(() => {
    if (!isFollowing) return;
    const next = asRecallStep(leaderStep);
    if (!next || next === currentStep) return;
    goToStep(next);
  }, [isFollowing, leaderStep, currentStep, goToStep]);

  return (
    <div className="flex min-h-[100svh] flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-sticky flex h-14 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
        {/* Setelah laporan terkirim tidak ada jalan mundur: kembali ke review
            hanya membuka peluang submit ganda untuk sesi yang sama. */}
        {isDone ? (
          <span />
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => (currentStep === "select_meal" ? router.back() : prevStep())}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Kembali
          </button>
        )}

        <span className="min-w-[7rem] text-right text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
          {isDone ? "Hasil" : `Langkah ${currentStepNumber} dari ${totalSteps}`}
        </span>
      </header>

      {guest ? (
        <div className="flex items-start gap-2 border-b border-info-border bg-info-light px-4 py-2 text-xs text-info sm:px-6">
          <Info aria-hidden className="mt-px h-4 w-4 shrink-0" />
          <span>
            Anda bergabung ke sesi rekan. Kehadiran, kursor, dan langkah aktif tersinkron, tetapi
            isian recall tetap milik masing-masing peserta — laporan hanya bisa dikirim dari survei
            Anda sendiri.
          </span>
        </div>
      ) : null}

      {/* ── Progress ───────────────────────────────────────────────────────── */}
      {!isDone && (
        <div className="border-b border-border bg-surface px-4 py-3 sm:px-6">
          <div
            className="h-[6px] overflow-hidden rounded-full bg-primary-muted"
            role="progressbar"
            aria-valuenow={stepProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progres pengisian recall"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            {isFinalStep ? "Langkah terakhir" : "Progres"} — {stepProgress}% selesai
          </span>
        </div>
      )}

      {/* ── Step rail (mobile) ─────────────────────────────────────────────── */}
      {!isDone && (
        <nav
          aria-label="Langkah pengisian"
          className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-4 py-3 lg:hidden"
        >
          {SIDEBAR_STEPS.map((step) => {
            const num = STEP_NUMBERS[step];
            const active = currentStep === step;
            const done = currentStepNumber > num;
            return (
              <span
                key={step}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                  active && "border-primary bg-primary-light font-semibold text-primary",
                  done && !active && "border-success-border bg-success-light text-success",
                  !active && !done && "border-border text-text-muted"
                )}
              >
                {done ? <Check aria-hidden className="h-3 w-3" /> : <span>{num}</span>}
                {STEP_LABELS[step]}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex min-h-0 flex-1">
        {/* ── Sidebar (desktop) ────────────────────────────────────────────── */}
        {!isDone && (
          <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-5 lg:flex">
            <nav aria-label="Langkah pengisian" className="flex flex-col gap-1">
              {SIDEBAR_STEPS.map((step) => {
                const num = STEP_NUMBERS[step];
                const active = currentStep === step;
                const done = currentStepNumber > num;
                return (
                  <div
                    key={step}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                      active && "bg-primary-light"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-[1.75rem] w-[1.75rem] shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                        active && "border-primary bg-primary text-white",
                        done && "border-success bg-success text-white",
                        !active && !done && "border-border-strong text-text-muted"
                      )}
                    >
                      {done ? <Check aria-hidden className="h-3 w-3" /> : num}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        active ? "font-semibold text-text-primary" : "font-medium text-text-muted"
                      )}
                    >
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </nav>

            {tip ? (
              <div className="mt-auto rounded-lg border border-primary-border bg-primary-light p-3 text-xs leading-relaxed text-primary">
                <Lightbulb aria-hidden className="mb-1 h-4 w-4" />
                <strong className="mb-1 block font-semibold">{tip.title}</strong>
                <p>{tip.body}</p>
              </div>
            ) : null}
          </aside>
        )}

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {currentStep === "select_meal" && (
            <Step1SelectMeal
              mealType={session.current_meal.type}
              mealTime={session.current_meal.time}
              mealOptions={mealOptions}
              onMealTypeChange={setMealType}
              onMealTimeChange={setMealTime}
              onContinue={nextStep}
            />
          )}

          {currentStep === "add_food" && (
            <Step2AddFood
              mealType={session.current_meal.type || "waktu makan ini"}
              addedFoods={foods}
              missingFoods={session.missing_foods}
              onAddFood={addFood}
              onRemoveFood={removeFood}
              onAddMissing={addMissingFood}
              onRemoveMissing={removeMissingFood}
              onContinue={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "portion" && (
            <Step3Portion
              foods={foods}
              foodIndex={session.portion_food_index}
              onPortionSelected={setPortion}
              onFoodIndexChange={setPortionFoodIndex}
              onContinue={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "additional" && (
            <Step4Additional
              foods={foods}
              onSetAdditionals={setAdditionals}
              onContinue={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "review" && (
            <Step5Review
              session={session}
              onSubmitted={(submissionId) => {
                setSubmissionId(submissionId);
                goToStep("done");
              }}
              onBack={prevStep}
              onEditPortions={() => goToStep("portion")}
              onAddMealTime={() => goToStep("select_meal")}
            />
          )}

          {currentStep === "done" && (
            <Step6Result
              respondentName={session.respondent_name}
              submissionId={session.submission_id}
              // Sesi TIDAK direset di sini: halaman /done membaca sesi yang sama
              // untuk menampilkan ringkasan gizi dan menjalankan analisis AI.
              // Mereset lebih dulu membuat halaman terakhir tampil kosong.
              onFinish={() => router.push(`/surveys/${accessToken}/done`)}
              onFillAgain={reset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
