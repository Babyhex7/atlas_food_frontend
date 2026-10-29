"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Info, Lightbulb, Send } from "lucide-react";
import { Step1SelectMeal } from "./Step1SelectMeal";
import { Step2AddFood } from "./Step2AddFood";
import { Step3Portion } from "./Step3Portion";
import { Step4Additional } from "./Step4Additional";
import { Step5Review } from "./Step5Review";
import { useRecallSession } from "../hooks/useRecallSession";
import { getRecallSession } from "../services/recallStorage";
import {
  CollabHeaderControls,
  CollabStatusStrip,
  useCollab,
  useCollabStore,
} from "@/internal/domain/collab";
import { Button } from "./ui/Primitives";
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
  const submitRef = useRef<(() => void) | null>(null);
  const portionNextRef = useRef<(() => void) | null>(null);
  const mainRef = useRef<HTMLElement>(null);

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

  let canContinueHeader = false;
  if (currentStep === "select_meal") {
    canContinueHeader = Boolean(session.current_meal.type);
  } else if (currentStep === "add_food") {
    canContinueHeader = foods.length > 0;
  } else if (currentStep === "portion") {
    const currentFood = foods[session.portion_food_index ?? 0];
    canContinueHeader =
      foods.length > 0 &&
      Boolean(
        (currentFood?.portion && currentFood.portion.portion_gram > 0) ||
        foods.every((f) => f.portion && f.portion.portion_gram > 0)
      );
  } else if (currentStep === "additional") {
    canContinueHeader = true;
  } else if (currentStep === "review") {
    canContinueHeader =
      session.meals.some((m) => m.foods.length > 0) &&
      session.meals.every((m) =>
        m.foods.every((f) => f.portion && f.portion.portion_gram > 0)
      );
  }

  const handleHeaderNext = () => {
    if (currentStep === "review") {
      submitRef.current?.();
    } else if (currentStep === "portion") {
      portionNextRef.current?.();
    } else {
      nextStep();
    }
  };

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
    const scrollY = mainRef.current ? mainRef.current.scrollTop : window.scrollY;
    const scrollX = mainRef.current ? mainRef.current.scrollLeft : window.scrollX;
    send("viewport_update", {
      page: window.location.pathname,
      path: window.location.pathname + window.location.search,
      step: currentStep,
      scroll_x: scrollX,
      scroll_y: scrollY,
    });
  }, [isConnected, isFollowing, currentStep, send]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isFollowing) return;
    const next = asRecallStep(leaderStep);
    if (!next || next === currentStep) return;
    goToStep(next);
  }, [isFollowing, leaderStep, currentStep, goToStep]);

  // Alur langsung: jika status recall mencapai done, arahkan langsung ke halaman hasil detail
  useEffect(() => {
    if (currentStep === "done" && accessToken) {
      router.replace(`/surveys/${accessToken}/done`);
    }
  }, [currentStep, accessToken, router]);

  return (
    <div className="flex h-[100dvh] flex-col bg-background overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border bg-surface z-sticky">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Setelah laporan terkirim tidak ada jalan mundur: kembali ke review
            hanya membuka peluang submit ganda untuk sesi yang sama. */}
        {isDone ? (
          <span />
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() =>
              currentStep === "select_meal"
                ? router.push("/surveys")
                : prevStep()
            }
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            {currentStep === "select_meal" ? "Kembali ke Daftar Survei" : "Kembali"}
          </button>
        )}

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden min-w-28 text-right text-xs font-semibold uppercase tracking-[0.08em] text-text-muted sm:inline">
              {isDone ? "Hasil" : `Langkah ${currentStepNumber} dari ${totalSteps}`}
            </span>
            <CollabHeaderControls />
            {!isDone && (
              <Button
                size="sm"
                icon={isFinalStep ? Send : ArrowRight}
                iconPosition="right"
                onClick={handleHeaderNext}
                disabled={!canContinueHeader}
                className="shrink-0"
              >
                {isFinalStep ? "Kirim" : "Lanjut"}
              </Button>
            )}
          </div>
        </div>

        <CollabStatusStrip />
      </header>

      {guest ? (
        <div className="shrink-0 flex items-start gap-2 border-b border-info-border bg-info-light px-4 py-2 text-xs text-info sm:px-6">
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
        <div className="shrink-0 border-b border-border bg-surface px-4 py-3 sm:px-6">
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
          className="shrink-0 flex gap-3 overflow-x-auto border-b border-border bg-surface px-4 sm:px-6 py-3.5 lg:hidden scrollbar-none"
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
                  "inline-flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-all shadow-2xs",
                  active && "border-primary bg-primary-light font-bold text-primary ring-2 ring-primary/20",
                  done && !active && "border-success-border bg-success-light text-success",
                  !active && !done && "border-border text-text-muted bg-surface-alt/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
                    active && "bg-primary text-white",
                    done && !active && "bg-success text-white",
                    !active && !done && "bg-muted/20 text-text-muted"
                  )}
                >
                  {done ? <Check aria-hidden className="h-3 w-3" /> : num}
                </span>
                <span>{STEP_LABELS[step]}</span>
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Sidebar (desktop) ────────────────────────────────────────────── */}
        {!isDone && (
          <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-surface p-6 lg:flex overflow-y-auto">
            <nav aria-label="Langkah pengisian" className="flex flex-col gap-3">
              {SIDEBAR_STEPS.map((step) => {
                const num = STEP_NUMBERS[step];
                const active = currentStep === step;
                const done = currentStepNumber > num;
                return (
                  <div
                    key={step}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-200",
                      active && "bg-primary-light border border-primary/20 shadow-xs",
                      done && !active && "hover:bg-surface-alt/80",
                      !active && !done && "opacity-80 hover:opacity-100"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-2xs",
                        active && "border-primary bg-primary text-white scale-105 shadow-md shadow-primary/20",
                        done && "border-success bg-success text-white",
                        !active && !done && "border-border-strong text-text-muted bg-surface"
                      )}
                    >
                      {done ? <Check aria-hidden className="h-4 w-4" /> : num}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted leading-none mb-1">
                        Langkah {num}
                      </span>
                      <span
                        className={cn(
                          "text-sm leading-tight",
                          active ? "font-bold text-text-primary" : "font-semibold text-text-muted"
                        )}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </nav>

            {tip ? (
              <div className="mt-8 rounded-xl border border-primary-border bg-primary-light/60 p-4 text-xs leading-relaxed text-primary shadow-2xs">
                <Lightbulb aria-hidden className="mb-1.5 h-4 w-4 text-primary" />
                <strong className="mb-1 block font-bold text-sm text-text-primary">{tip.title}</strong>
                <p className="text-text-muted leading-normal">{tip.body}</p>
              </div>
            ) : null}
          </aside>
        )}

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          {currentStep === "select_meal" && (
            <Step1SelectMeal
              mealType={session.current_meal.type}
              mealTime={session.current_meal.time}
              mealOptions={mealOptions}
              onMealTypeChange={setMealType}
              onMealTimeChange={setMealTime}
              onContinue={nextStep}
              onBack={() => router.push("/surveys")}
              hasExistingMeals={session.meals.length > 0}
              existingMealsCount={session.meals.length}
              onGoToReview={() => goToStep("review")}
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
              portionNextRef={portionNextRef}
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
              submitRef={submitRef}
              onSubmitted={(submissionId) => {
                setSubmissionId(submissionId);
                router.push(`/surveys/${accessToken}/done`);
              }}
              onBack={prevStep}
              onEditPortions={() => goToStep("portion")}
              onAddMealTime={() => goToStep("select_meal")}
            />
          )}

          {currentStep === "done" && (
            <div className="flex h-64 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
