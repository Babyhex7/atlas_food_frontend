"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RefreshCw,
  Salad,
  Sparkles,
} from "lucide-react";
import { useNutritionAnalysis } from "../hooks/useNutritionAnalysis";
import { normalizeStatus, type NutritionStatus } from "../types/ai";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import { cn } from "@/internal/lib/cn";

/**
 * Panel rekomendasi gizi berbasis AI (Groq) untuk ditampilkan setelah submit.
 *
 * Dipicu manual lewat tombol agar tidak membuat user menunggu dan tidak memakai
 * kuota Groq untuk responden yang tidak tertarik. Kegagalan analisis tidak
 * pernah merusak halaman hasil — pesan error tampil dengan opsi coba lagi.
 */

const STATUS_STYLES: Record<NutritionStatus, { chip: string; dot: string; label: string }> = {
  good: {
    chip: "border-success-border bg-success-light text-success",
    dot: "bg-success",
    label: "Baik",
  },
  warning: {
    chip: "border-warning-border bg-warning-light text-warning",
    dot: "bg-warning",
    label: "Perlu perhatian",
  },
  danger: {
    chip: "border-danger-border bg-danger-light text-danger",
    dot: "bg-danger",
    label: "Perlu perbaikan",
  },
  // Nilai tak dikenal dari model jatuh ke gaya netral, bukan tanpa gaya.
  unknown: {
    chip: "border-border bg-surface-alt text-text-secondary",
    dot: "bg-text-muted",
    label: "Catatan",
  },
};

const STATUS_ICONS: Record<NutritionStatus, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  unknown: Sparkles,
};

export function AiRecommendationPanel({ submissionId }: { submissionId?: string }) {
  const { mutate, data, error, isPending, isSuccess } = useNutritionAnalysis();

  const hasSubmission = Boolean(submissionId);

  return (
    <section className="w-full rounded-xl border border-border bg-surface p-5 text-left shadow-card">
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
          <Sparkles aria-hidden className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-text-primary">Rekomendasi gizi AI</h3>
          <p className="text-xs text-text-muted">
            Analisis otomatis atas laporan makan Anda, dibuat oleh model bahasa Groq.
          </p>
        </div>
      </header>

      {/* ── Belum dianalisis ────────────────────────────────────────────── */}
      {!isSuccess && !isPending ? (
        <div className="mt-4 flex flex-col gap-3">
          {!hasSubmission ? (
            <p className="flex items-start gap-2 rounded-md bg-surface-alt p-3 text-xs text-text-muted">
              <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" />
              Analisis AI belum tersedia karena laporan ini belum terkirim pada sesi saat ini.
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md bg-danger-light p-3 text-xs text-danger"
            >
              <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" />
              {getApiErrorMessage(error, "Analisis AI gagal. Silakan coba lagi.")}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!hasSubmission}
            onClick={() => submissionId && mutate(submissionId)}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-all",
              "hover:bg-primary-hover hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-primary disabled:hover:shadow-none"
            )}
          >
            {error ? (
              <RefreshCw aria-hidden className="h-4 w-4" />
            ) : (
              <Sparkles aria-hidden className="h-4 w-4" />
            )}
            {error ? "Coba lagi" : "Analisis dengan AI"}
          </button>
        </div>
      ) : null}

      {/* ── Sedang menganalisis ─────────────────────────────────────────── */}
      {isPending ? <AnalysisSkeleton /> : null}

      {/* ── Hasil ───────────────────────────────────────────────────────── */}
      {isSuccess && data ? (
        <div className="mt-5 flex flex-col gap-5">
          <OverallStatus
            status={normalizeStatus(data.data.overall_status)}
            message={data.data.overall_message}
          />

          {data.data.nutritional_analysis.length > 0 ? (
            <div className="flex flex-col gap-2">
              <SectionTitle>Rincian gizi</SectionTitle>
              <ul className="flex flex-col gap-2">
                {data.data.nutritional_analysis.map((item, i) => {
                  const status = normalizeStatus(item.status);
                  const style = STATUS_STYLES[status];
                  return (
                    <li
                      key={`${item.label}-${i}`}
                      className="flex items-start gap-3 rounded-lg border border-border p-3"
                    >
                      <span
                        aria-hidden
                        className={cn("mt-[6px] h-2 w-2 shrink-0 rounded-full", style.dot)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-px text-[10px] font-semibold",
                              style.chip
                            )}
                          >
                            {style.label}
                          </span>
                        </div>
                        {item.description ? (
                          <p className="mt-1 text-xs leading-relaxed text-text-muted">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {data.data.ai_recommendation ? (
            <div className="flex flex-col gap-2">
              <SectionTitle>Rekomendasi</SectionTitle>
              <p className="rounded-lg border border-primary-border bg-primary-light p-4 text-sm leading-relaxed text-primary">
                {data.data.ai_recommendation}
              </p>
            </div>
          ) : null}

          {data.data.recommended_foods.length > 0 ? (
            <div className="flex flex-col gap-2">
              <SectionTitle icon={Salad}>Makanan yang disarankan</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {data.data.recommended_foods.map((food, i) => (
                  <span
                    key={`${food}-${i}`}
                    className="rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-text-secondary"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {data.data.health_insight.title || data.data.health_insight.description ? (
            <div className="rounded-lg border border-info-border bg-info-light p-4">
              <div className="mb-1 flex items-center gap-2">
                <Lightbulb aria-hidden className="h-4 w-4 shrink-0 text-info" />
                <span className="text-sm font-semibold text-info">
                  {data.data.health_insight.title || "Wawasan kesehatan"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                {data.data.health_insight.description}
              </p>
            </div>
          ) : null}

          {data.data.suggested_activities.length > 0 ? (
            <div className="flex flex-col gap-2">
              <SectionTitle icon={Activity}>Aktivitas yang disarankan</SectionTitle>
              <ul className="flex flex-col gap-2">
                {data.data.suggested_activities.map((activity, i) => (
                  <li
                    key={`${activity}-${i}`}
                    className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                  >
                    <CheckCircle2 aria-hidden className="mt-px h-4 w-4 shrink-0 text-success" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <p className="m-0 max-w-lg text-[10px] leading-relaxed text-text-muted">
              {data.source === "cache"
                ? "Diambil dari hasil analisis yang tersimpan. "
                : "Dihasilkan oleh AI. "}
              Rekomendasi ini bersifat informatif dan bukan pengganti nasihat tenaga kesehatan.
            </p>
            {/* Hasil dari cache bisa terasa usang setelah laporan diperiksa ulang,
                dan tanpa tombol ini satu-satunya cara menjalankan ulang adalah
                memuat ulang halaman — yang justru membuang hasil yang sudah ada. */}
            <button
              type="button"
              onClick={() => submissionId && mutate(submissionId)}
              disabled={!hasSubmission}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RefreshCw aria-hidden className="h-3.5 w-3.5" />
              Analisis ulang
            </button>
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
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
      {Icon ? <Icon aria-hidden className="h-4 w-4" /> : null}
      {children}
    </span>
  );
}

function OverallStatus({ status, message }: { status: NutritionStatus; message: string }) {
  const style = STATUS_STYLES[status];
  const Icon = STATUS_ICONS[status];

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4", style.chip)}>
      <Icon aria-hidden className="mt-px h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{style.label}</span>
        {message ? <p className="mt-1 text-xs leading-relaxed opacity-90">{message}</p> : null}
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-5 flex flex-col gap-4">
      <p className="flex items-center gap-2 text-xs font-medium text-primary">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        AI sedang menganalisis laporan Anda… proses ini bisa memakan waktu hingga satu menit.
      </p>
      <div className="h-16 animate-pulse rounded-lg bg-surface-alt" />
      <div className="flex flex-col gap-2">
        <div className="h-12 animate-pulse rounded-lg bg-surface-alt" />
        <div className="h-12 animate-pulse rounded-lg bg-surface-alt" />
        <div className="h-12 animate-pulse rounded-lg bg-surface-alt" />
      </div>
      <div className="h-20 animate-pulse rounded-lg bg-surface-alt" />
    </div>
  );
}
