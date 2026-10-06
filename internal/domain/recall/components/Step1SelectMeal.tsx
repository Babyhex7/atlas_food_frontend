"use client";

import { useEffect } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Clock, Info, UtensilsCrossed } from "lucide-react";
import { getMealIcon } from "../constants/mealIcons";
import {
  Banner,
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
  useEffect(() => {
    if (!mealType && mealOptions.length > 0) {
      onMealTypeChange(mealOptions[0].name);
    }
  }, [mealType, mealOptions, onMealTypeChange]);

  const { hours, minutes } = parseTime(mealTime);
  const display12h = hours % 12 || 12;
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
    onMealTimeChange(formatTime((hours + 12) % 24, minutes));
  };

  const canContinue = Boolean(mealType);

  return (
    <StepShell>
      <StepHeader
        title="Pilih Waktu Makan"
        subtitle="Tentukan kategori waktu makan yang ingin Anda catat beserta jam perkiraan konsumsi."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Jenis Waktu Makan ─────────────────────────────────────────── */}
        <Card>
          <CardLabel icon={UtensilsCrossed}>Kategori Waktu Makan</CardLabel>
          <div
            role="radiogroup"
            aria-label="Kategori waktu makan"
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
                    className={cn("h-5 w-5", active ? "text-primary" : "text-text-muted")}
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

        {/* ── Waktu Konsumsi ────────────────────────────────────────────── */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardLabel icon={Clock}>Jam Konsumsi</CardLabel>

            <div className="flex items-center justify-center gap-3 py-2">
              <TimeSpinner
                label="Jam"
                value={String(display12h).padStart(2, "0")}
                onIncrement={() => shiftHours(1)}
                onDecrement={() => shiftHours(-1)}
              />
              <span className="text-xl font-semibold text-text-muted" aria-hidden>
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
              aria-label="Format AM atau PM"
              className="mx-auto mt-3 flex justify-center rounded-md border border-border p-1 max-w-[120px]"
            >
              {(["AM", "PM"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={period === p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 rounded py-1 text-center text-xs font-semibold transition-colors duration-150",
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

            <p className="mt-3 text-center text-xs text-text-muted">
              Tersimpan format 24 jam:{" "}
              <span className="font-mono font-semibold text-text-primary">{mealTime}</span>
            </p>
          </div>

          <Banner icon={Info} tone="info" className="mt-4">
            Pencatatan jam makan secara konsisten membantu analisis ritme metabolisme harian.
          </Banner>
        </Card>
      </div>

      <StepNav>
        <Button variant="secondary" onClick={onBack ?? (() => window.history.back())}>
          Kembali
        </Button>
        <Button
          icon={ArrowRight}
          iconPosition="right"
          onClick={onContinue}
          disabled={!canContinue}
        >
          Lanjut ke Tambah Makanan
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
        className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronUp aria-hidden className="h-4 w-4" />
      </button>
      <span
        aria-label={label}
        className="min-w-[2.75rem] rounded-md bg-surface-alt py-1.5 text-center font-mono text-xl font-semibold text-text-primary"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`${label} kurang`}
        onClick={onDecrement}
        className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronDown aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

