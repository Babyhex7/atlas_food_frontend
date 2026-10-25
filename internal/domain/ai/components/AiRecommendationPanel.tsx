"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Drumstick,
  Flame,
  HeartPulse,
  Lightbulb,
  Loader2,
  RefreshCw,
  Salad,
  Sparkles,
  Wheat,
  Bot,
} from "lucide-react";
import { useNutritionAnalysis } from "../hooks/useNutritionAnalysis";
import { normalizeStatus, type NutritionStatus } from "../types/ai";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import { cn } from "@/internal/lib/cn";

/**
 * Panel rekomendasi gizi berbasis AI (Groq) untuk ditampilkan setelah submit.
 *
 * Dipicu manual lewat tombol agar tidak membuat user menunggu dan tidak memakai
 * kuota Groq untuk responden yang tidak tertarik.
 */

const STATUS_STYLES: Record<NutritionStatus, { chip: string; dot: string; label: string; border: string; bg: string }> = {
  good: {
    chip: "border-success-border bg-success-light text-success",
    dot: "bg-success",
    label: "Baik & Cukup",
    border: "border-success/30",
    bg: "bg-success-light/30",
  },
  warning: {
    chip: "border-warning-border bg-warning-light text-warning",
    dot: "bg-warning",
    label: "Perlu perhatian",
    border: "border-warning/30",
    bg: "bg-warning-light/30",
  },
  danger: {
    chip: "border-danger-border bg-danger-light text-danger",
    dot: "bg-danger",
    label: "Perlu perbaikan",
    border: "border-danger/30",
    bg: "bg-danger-light/30",
  },
  unknown: {
    chip: "border-border bg-surface-alt text-text-secondary",
    dot: "bg-text-muted",
    label: "Catatan",
    border: "border-border",
    bg: "bg-surface-alt",
  },
};

const STATUS_ICONS: Record<NutritionStatus, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  unknown: Sparkles,
};

function getNutrientIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("energi") || lower.includes("kalori")) return Flame;
  if (lower.includes("protein")) return Drumstick;
  if (lower.includes("karbo")) return Wheat;
  if (lower.includes("lemak")) return Droplets;
  return Salad;
}

export function AiRecommendationPanel({ submissionId }: { submissionId?: string }) {
  const { mutate, data, error, isPending, isSuccess } = useNutritionAnalysis();

  const hasSubmission = Boolean(submissionId);

  return (
    <section className="w-full rounded-2xl border border-border bg-surface p-5 sm:p-7 text-left shadow-sm">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-sm shadow-primary/20">
            <Sparkles aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
                Rekomendasi Gizi Personal AI
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-primary-border bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                <Bot className="h-3 w-3" />
                Groq Llama 3.3
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Analisis cerdas kecukupan asupan nutrisi harian berdasarkan Angka Kecukupan Gizi (AKG).
            </p>
          </div>
        </div>

        {isSuccess && (
          <button
            type="button"
            onClick={() => submissionId && mutate(submissionId)}
            disabled={!hasSubmission || isPending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:border-primary hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RefreshCw aria-hidden className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
            Analisis ulang
          </button>
        )}
      </header>

      {/* ── Belum dianalisis ────────────────────────────────────────────── */}
      {!isSuccess && !isPending ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-alt/50 p-6 sm:p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light mb-3 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-text-primary mb-1">
            Dapatkan Wawasan Gizi dari Laporan Anda
          </h4>
          <p className="max-w-md text-xs text-text-muted mb-4 leading-relaxed">
            AI kami akan mengevaluasi asupan kalori, makronutrien (protein, karbohidrat, lemak), serta menyarankan pilihan makanan sehat yang tepat untuk Anda.
          </p>

          {!hasSubmission ? (
            <p className="flex items-center gap-2 rounded-lg bg-warning-light p-3 text-xs text-warning border border-warning-border">
              <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
              Laporan ini belum tersimpan dengan ID submit aktif. Pastikan recall telah terkirim.
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg bg-danger-light p-3 text-xs text-danger border border-danger-border"
            >
              <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
              {getApiErrorMessage(error, "Analisis AI gagal dijalankan. Silakan coba lagi.")}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!hasSubmission}
            onClick={() => submissionId && mutate(submissionId)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all",
              "hover:bg-primary-hover hover:shadow-md hover:scale-[1.01]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 disabled:hover:shadow-none"
            )}
          >
            {error ? (
              <RefreshCw aria-hidden className="h-4 w-4" />
            ) : (
              <Sparkles aria-hidden className="h-4 w-4" />
            )}
            {error ? "Coba Lagi Sekarang" : "Jalankan Analisis AI Sekarang"}
          </button>
        </div>
      ) : null}

      {/* ── Sedang menganalisis ─────────────────────────────────────────── */}
      {isPending ? <AnalysisSkeleton /> : null}

      {/* ── Hasil ───────────────────────────────────────────────────────── */}
      {isSuccess && data ? (
        <div className="mt-6 flex flex-col gap-6">
          {/* Status Keseluruhan */}
          <OverallStatus
            status={normalizeStatus(data.data.overall_status)}
            message={data.data.overall_message}
          />

          {/* Rincian Gizi Grid */}
          {data.data.nutritional_analysis.length > 0 ? (
            <div className="flex flex-col gap-3">
              <SectionTitle icon={HeartPulse}>Rincian Kebutuhan Gizi</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {data.data.nutritional_analysis.map((item, i) => {
                  const status = normalizeStatus(item.status);
                  const style = STATUS_STYLES[status];
                  const Icon = getNutrientIcon(item.label);
                  return (
                    <div
                      key={`${item.label}-${i}`}
                      className={cn(
                        "flex flex-col justify-between rounded-xl border p-4 transition-all duration-200",
                        style.border,
                        style.bg
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border/60 text-text-primary shadow-2xs">
                              <Icon className="h-4 w-4 text-primary" />
                            </span>
                            <span className="text-sm font-bold text-text-primary">
                              {item.label}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                              style.chip
                            )}
                          >
                            {style.label}
                          </span>
                        </div>
                        {item.description ? (
                          <p className="text-xs leading-relaxed text-text-secondary mt-1">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Rekomendasi Utama */}
          {data.data.ai_recommendation ? (
            <div className="flex flex-col gap-2">
              <SectionTitle icon={Lightbulb}>Rekomendasi Utama</SectionTitle>
              <div className="rounded-xl border border-primary-border bg-gradient-to-br from-primary-light/70 to-emerald-50/50 p-4 sm:p-5 shadow-2xs">
                <p className="text-sm leading-relaxed text-text-primary font-medium">
                  {data.data.ai_recommendation}
                </p>
              </div>
            </div>
          ) : null}

          {/* Makanan yang Disarankan */}
          {data.data.recommended_foods.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <SectionTitle icon={Salad}>Makanan yang Disarankan untuk Anda</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {data.data.recommended_foods.map((food, i) => (
                  <span
                    key={`${food}-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-primary shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <Salad className="h-3.5 w-3.5 text-emerald-600" />
                    {food}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Wawasan Kesehatan & Aktivitas (2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.data.health_insight.title || data.data.health_insight.description ? (
              <div className="rounded-xl border border-info-border bg-info-light/60 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-info shadow-2xs">
                      <Lightbulb aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold text-info">
                      {data.data.health_insight.title || "Wawasan Kesehatan"}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {data.data.health_insight.description}
                  </p>
                </div>
              </div>
            ) : null}

            {data.data.suggested_activities.length > 0 ? (
              <div className="rounded-xl border border-border bg-surface-alt/70 p-4 sm:p-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-primary shadow-2xs">
                    <Activity aria-hidden className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    Aktivitas yang Disarankan
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {data.data.suggested_activities.map((activity, i) => (
                    <li
                      key={`${activity}-${i}`}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-text-secondary"
                    >
                      <CheckCircle2 aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Disclaimer & Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="m-0 max-w-xl text-[11px] leading-relaxed text-text-muted">
              {data.source === "cache"
                ? "Hasil diambil dari cache analisis tersimpan. "
                : "Dihasilkan otomatis oleh Groq Llama AI. "}
              Rekomendasi ini bersifat edukatif dan bukan merupakan diagnosis medis pengganti konsultasi dengan dokter atau ahli gizi teregistrasi.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
      {Icon ? <Icon aria-hidden className="h-3.5 w-3.5 text-primary" /> : null}
      {children}
    </span>
  );
}

function OverallStatus({ status, message }: { status: NutritionStatus; message: string }) {
  const style = STATUS_STYLES[status];
  const Icon = STATUS_ICONS[status];

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-xl border p-4 sm:p-5 shadow-2xs",
        style.chip
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface/80 shadow-2xs">
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider">Status Evaluasi Gizi:</span>
          <span className="text-sm font-extrabold">{style.label}</span>
        </div>
        {message ? (
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed opacity-95 font-medium">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-6 flex flex-col gap-4">
      <div className="flex items-center gap-2.5 text-xs font-semibold text-primary">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        AI sedang menganalisis pola makan Anda… mohon tunggu beberapa saat.
      </div>
      <div className="h-20 animate-pulse rounded-xl bg-surface-alt" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-xl bg-surface-alt" />
        <div className="h-24 animate-pulse rounded-xl bg-surface-alt" />
        <div className="h-24 animate-pulse rounded-xl bg-surface-alt" />
        <div className="h-24 animate-pulse rounded-xl bg-surface-alt" />
      </div>
      <div className="h-16 animate-pulse rounded-xl bg-surface-alt" />
    </div>
  );
}

