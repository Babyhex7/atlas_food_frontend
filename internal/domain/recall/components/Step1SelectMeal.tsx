"use client";

import { ArrowRight, ChevronDown, ChevronUp, Clock, Info, Sparkles, UtensilsCrossed } from "lucide-react";
import { getMealIcon } from "../constants/mealIcons";
import {
  Button,
  Card,
  CardLabel,
  SelectTile,
  StepHeader,
  StepNav,
  StepShell,
} from "./ui/Primitives";
import { cn } from "@/internal/lib/cn";

interface MealOption {
  name: string;
}

const DEFAULT_MEAL_OPTIONS: MealOption[] = [
  { name: "Sarapan" },
  { name: "Snack Pagi" },
  { name: "Makan Siang" },
  { name: "Snack Sore" },
  { name: "Makan Malam" },
  { name: "Snack Malam" },
];

interface Props {
  mealType: string;
  mealTime: string;
  mealOptions?: MealOption[];
  onMealTypeChange: (type: string) => void;
  onMealTimeChange: (time: string) => void;
  onContinue: () => void;
  onBack?: () => void;
}

/**
 * Waktu makan disimpan dalam format 24 jam ("07:00", "19:30") karena itulah
 * yang dikirim ke backend. Tampilannya 12 jam + AM/PM, jadi semua konversi
 * dipusatkan di helper berikut supaya tampilan dan nilai tidak pernah berbeda.
 */
function parseTime(value: string): { hours: number; minutes: number } {
  const [rawH, rawM] = value.split(":");
  const hours = Number(rawH);
  const minutes = Number(rawM);
  return {
    hours: Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 7,
    minutes: Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0,
  };
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function Step1SelectMeal({
  mealType,
  mealTime,
  mealOptions = DEFAULT_MEAL_OPTIONS,
  onMealTypeChange,
  onMealTimeChange,
  onContinue,
  onBack,
}: Props) {
  const { hours, minutes } = parseTime(mealTime);
  const display12h = hours % 12 || 12;
  // Periode diturunkan dari jam 24 jam — bukan state terpisah, sehingga tidak
  // mungkin lagi tampil "PM" sementara nilai yang tersimpan masih pagi.
  const period: "AM" | "PM" = hours < 12 ? "AM" : "PM";

  const shiftHours = (delta: number) => {
    onMealTimeChange(formatTime((hours + delta + 24) % 24, minutes));
  };

  const shiftMinutes = (delta: number) => {
    const total = hours * 60 + minutes + delta;
    const wrapped = ((total % 1440) + 1440) % 1440;
    onMealTimeChange(formatTime(Math.floor(wrapped / 60), wrapped % 60));
  };

  const setPeriod = (next: "AM" | "PM") => {
    if (next === period) return;
    // AM ↔ PM adalah pergeseran 12 jam pada nilai sebenarnya.
    onMealTimeChange(formatTime((hours + 12) % 24, minutes));
  };

  const canContinue = Boolean(mealType);

  return (
    <StepShell>
      <StepHeader
        title="Pilih waktu makan"
        subtitle="Tentukan waktu makan yang ingin Anda catat beserta jam kejadiannya."
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Jenis waktu makan ─────────────────────────────────────────── */}
        <Card>
          <CardLabel icon={UtensilsCrossed}>Jenis waktu makan</CardLabel>
          <div
            role="radiogroup"
            aria-label="Jenis waktu makan"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {mealOptions.map((opt) => {
              const Icon = getMealIcon(opt.name);
              const active = mealType === opt.name;
              return (
                <SelectTile
                  key={opt.name}
                  role="radio"
                  aria-checked={active}
                  active={active}
                  onClick={() => onMealTypeChange(opt.name)}
                >
                  <Icon
                    aria-hidden
                    className={cn("h-6 w-6", active ? "text-primary" : "text-text-muted")}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      active ? "font-semibold text-primary" : "font-medium text-text-secondary"
                    )}
                  >
                    {opt.name}
                  </span>
                </SelectTile>
              );
            })}
          </div>
        </Card>

        {/* ── Jam ───────────────────────────────────────────────────────── */}
        <Card className="flex flex-col">
          <CardLabel icon={Clock}>Jam makan</CardLabel>

          <div className="flex items-center justify-center gap-3">
            <TimeSpinner
              label="Jam"
              value={String(display12h).padStart(2, "0")}
              onIncrement={() => shiftHours(1)}
              onDecrement={() => shiftHours(-1)}
            />
            <span className="text-2xl font-bold text-text-muted" aria-hidden>
              :
            </span>
            <TimeSpinner
              label="Menit"
              value={String(minutes).padStart(2, "0")}
              onIncrement={() => shiftMinutes(5)}
              onDecrement={() => shiftMinutes(-5)}
            />
          </div>

          <div
            role="radiogroup"
            aria-label="AM atau PM"
            className="mx-auto mt-4 inline-flex rounded-lg border border-border p-1"
          >
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={period === p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-4 py-1 text-xs font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  period === p
                    ? "bg-primary text-white"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Nilai sebenarnya ditampilkan supaya tidak ada ambiguitas 12/24 jam. */}
          <p className="mt-3 text-center text-xs text-text-muted">
            Tersimpan sebagai{" "}
            <span className="font-mono font-semibold text-text-primary">{mealTime}</span>
          </p>

          <div className="mt-4 flex gap-2 rounded-lg border border-primary-border bg-primary-light p-3 text-xs leading-relaxed text-primary">
            <Info aria-hidden className="mt-px h-4 w-4 shrink-0" />
            Mencatat jam makan dengan tepat membantu kami menganalisis ritme metabolisme tubuh Anda
            secara lebih akurat.
          </div>
        </Card>
      </div>

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-linear-to-br from-primary to-[#7B0011] p-5 text-white">
        <Sparkles aria-hidden className="mb-2 h-5 w-5" />
        <strong className="mb-1 block text-base font-bold">Panduan gizi</strong>
        <p className="text-sm opacity-90">
          Setiap langkah dalam survei ini dirancang bersama ahli gizi agar rekomendasi yang Anda
          terima benar-benar personal.
        </p>
      </div>

      <StepNav>
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            Kembali
          </Button>
        ) : (
          <span />
        )}
        <Button icon={ArrowRight} iconPosition="right" onClick={onContinue} disabled={!canContinue}>
          Lanjut
        </Button>
      </StepNav>
    </StepShell>
  );
}

function TimeSpinner({
  label,
  value,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={`${label} tambah`}
        onClick={onIncrement}
        className="rounded-md p-1 text-text-muted transition-colors hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronUp aria-hidden className="h-5 w-5" />
      </button>
      <span
        aria-label={label}
        className="min-w-[3rem] rounded-lg bg-surface-alt py-2 text-center font-mono text-2xl font-bold text-text-primary"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`${label} kurang`}
        onClick={onDecrement}
        className="rounded-md p-1 text-text-muted transition-colors hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronDown aria-hidden className="h-5 w-5" />
      </button>
    </div>
  );
}
