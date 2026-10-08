"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Salad,
  Sparkles,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useNutritionAnalysis } from "../hooks/useNutritionAnalysis";
import type {
  AiError,
  NutrientStatus,
  NutritionAnalysisItem,
  NutritionAnalysisResult,
  OverallStatus,
} from "../types/ai";
import { cn } from "@/internal/lib/cn";

/**
 * Panel rekomendasi gizi berbasis AI untuk satu laporan.
 *
 * Analisis dipicu manual lewat tombol agar tidak menahan user dan tidak memakai
 * kuota LLM untuk responden yang tidak tertarik; hasil yang sudah pernah dibuat
 * dimuat otomatis. Seluruh keadaan ditentukan `useNutritionAnalysis` sebagai
 * satu `phase`, dan kegagalan apa pun tidak pernah merusak halaman pemanggil.
 */
export function AiRecommendationPanel({ submissionId }: { submissionId?: string }) {
  // `key` membuang keadaan lama (error, analisis berjalan) saat panel yang sama
  // dipakai untuk laporan lain, misalnya pada riwayat di halaman profil.
  return <Panel key={submissionId ?? "none"} submissionId={submissionId} />;
}

function Panel({ submissionId }: { submissionId?: string }) {
  const { phase, result, error, isRefreshing, isOnline, analyze, refresh } =
    useNutritionAnalysis(submissionId);

  return (
    <section
      aria-busy={phase === "analyzing" || phase === "checking" || isRefreshing}
      className="w-full rounded-xl border border-border bg-surface p-5 text-left shadow-card"
    >
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
          <Sparkles aria-hidden className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-text-primary">Rekomendasi gizi AI</h3>
          <p className="text-xs text-text-muted">
            Angka dan status dihitung sistem dari laporan Anda; penjelasannya disusun oleh AI.
          </p>
        </div>
      </header>

      {phase === "unavailable" ? (
        <Notice icon={AlertCircle}>
          Analisis AI belum tersedia karena laporan ini belum terkirim pada sesi saat ini.
        </Notice>
      ) : null}

      {phase === "queued" ? (
        <Notice icon={CloudOff} tone="warning">
          Laporan Anda tersimpan di perangkat dan menunggu dikirim ke server. Analisis AI dapat
          dijalankan setelah laporan tersinkron — panel ini akan terbuka dengan sendirinya. Bila
          laporan tidak kunjung terkirim, gunakan tombol sinkronisasi pada bilah status di atas.
        </Notice>
      ) : null}

      {phase === "offline" ? (
        <Notice icon={WifiOff} tone="warning">
          Anda sedang offline. Analisis AI memerlukan koneksi internet.
        </Notice>
      ) : null}

      {phase === "checking" ? (
        <p role="status" className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          Memeriksa hasil analisis sebelumnya…
        </p>
      ) : null}

      {phase === "idle" ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-text-muted">
            Dapatkan ringkasan kecukupan energi, protein, karbohidrat, dan lemak beserta saran
            makanan. Proses ini biasanya selesai dalam beberapa detik.
          </p>
          <PrimaryButton icon={Sparkles} onClick={analyze}>
            Analisis dengan AI
          </PrimaryButton>
        </div>
      ) : null}

      {phase === "analyzing" ? <AnalysisSkeleton /> : null}

      {phase === "error" && error ? (
        <div className="mt-4 flex flex-col gap-3">
          <ErrorMessage error={error} />
          {error.retryable ? (
            <PrimaryButton icon={RefreshCw} onClick={analyze}>
              Coba lagi
            </PrimaryButton>
          ) : null}
        </div>
      ) : null}

      {phase === "ready" && result ? (
        <AnalysisResult
          result={result}
          refreshError={error}
          isRefreshing={isRefreshing}
          canRefresh={isOnline}
          onRefresh={refresh}
        />
      ) : null}
    </section>
  );
}

// ─── Hasil ───────────────────────────────────────────────────────────────────

function AnalysisResult({
  result,
  refreshError,
  isRefreshing,
  canRefresh,
  onRefresh,
}: {
  result: NutritionAnalysisResult;
  refreshError: AiError | null;
  isRefreshing: boolean;
  canRefresh: boolean;
  onRefresh: () => void;
}) {
  const { data } = result;
  const caveats = buildCaveats(result);

  return (
    <div className={cn("mt-5 flex flex-col gap-5 transition-opacity", isRefreshing && "opacity-60")}>
      <OverallBanner status={data.overallStatus} message={data.overallMessage} />

      {caveats.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {caveats.map((text) => (
            <li
              key={text}
              className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-light p-3 text-xs leading-relaxed text-warning"
            >
              <AlertTriangle aria-hidden className="mt-px h-4 w-4 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      ) : null}

      {data.nutritionalAnalysis.length > 0 ? (
        <div className="flex flex-col gap-2">
          <SectionTitle>Rincian gizi</SectionTitle>
          <ul className="flex flex-col gap-2">
            {data.nutritionalAnalysis.map((item, i) => (
              <NutrientRow key={item.key || `${item.label}-${i}`} item={item} />
            ))}
          </ul>
          {data.reference ? (
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-text-muted">
              <Info aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                Pembanding: {data.reference.label}
                {data.reference.source ? ` — ${data.reference.source}` : ""}.
                {data.reference.personalized
                  ? ""
                  : " Lengkapi jenis kelamin dan tanggal lahir di profil agar pembanding sesuai dengan Anda."}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {data.recommendation ? (
        <div className="flex flex-col gap-2">
          <SectionTitle>Rekomendasi</SectionTitle>
          <p className="whitespace-pre-line rounded-lg border border-primary-border bg-primary-light p-4 text-sm leading-relaxed text-primary">
            {data.recommendation}
          </p>
        </div>
      ) : null}

      {data.recommendedFoods.length > 0 ? (
        <div className="flex flex-col gap-2">
          <SectionTitle icon={Salad}>Makanan yang disarankan</SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {data.recommendedFoods.map((food) => (
              <li
                key={food}
                className="rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-text-secondary"
              >
                {food}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.healthInsight.title || data.healthInsight.description ? (
        <div className="rounded-lg border border-info-border bg-info-light p-4">
          <div className="mb-1 flex items-center gap-2">
            <Lightbulb aria-hidden className="h-4 w-4 shrink-0 text-info" />
            <span className="text-sm font-semibold text-info">
              {data.healthInsight.title || "Wawasan kesehatan"}
            </span>
          </div>
          {data.healthInsight.description ? (
            <p className="text-xs leading-relaxed text-text-secondary">
              {data.healthInsight.description}
            </p>
          ) : null}
        </div>
      ) : null}

      {data.suggestedActivities.length > 0 ? (
        <div className="flex flex-col gap-2">
          <SectionTitle icon={Activity}>Aktivitas yang disarankan</SectionTitle>
          <ul className="flex flex-col gap-2">
            {data.suggestedActivities.map((activity) => (
              <li
                key={activity}
                className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
              >
                <CheckCircle2 aria-hidden className="mt-px h-4 w-4 shrink-0 text-success" />
                {activity}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Analisis ulang yang gagal tidak membuang hasil yang sedang tampil. */}
      {refreshError ? <ErrorMessage error={refreshError} /> : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="m-0 max-w-lg text-[10px] leading-relaxed text-text-muted">
          {formatProvenance(result)} Rekomendasi ini bersifat informatif dan bukan pengganti nasihat
          tenaga kesehatan.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={!canRefresh || isRefreshing}
          title={canRefresh ? undefined : "Memerlukan koneksi internet"}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isRefreshing ? (
            <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw aria-hidden className="h-3.5 w-3.5" />
          )}
          {isRefreshing ? "Menganalisis ulang…" : "Buat analisis baru"}
        </button>
      </footer>
    </div>
  );
}

/** Peringatan atas kelengkapan laporan — dasar server, bukan tebakan AI. */
function buildCaveats(result: NutritionAnalysisResult): string[] {
  const coverage = result.data.coverage;
  if (!coverage) return [];

  const caveats: string[] = [];
  if (coverage.isPartialDay) {
    caveats.push(
      `Laporan ini baru memuat ${coverage.mealCount} waktu makan, sehingga perbandingan dengan kebutuhan sehari masih bersifat sementara.`
    );
  }
  if (coverage.missingFoodCount > 0) {
    caveats.push(
      `${coverage.missingFoodCount} makanan yang Anda catat manual belum memiliki nilai gizi dan tidak ikut terhitung.`
    );
  }
  return caveats;
}

function formatProvenance(result: NutritionAnalysisResult): string {
  const parts = [
    result.source === "cache" ? "Hasil analisis tersimpan" : "Baru saja dianalisis",
  ];
  const generated = result.generatedAt ? new Date(result.generatedAt) : null;
  if (result.source === "cache" && generated && !Number.isNaN(generated.getTime())) {
    parts.push(
      `dibuat ${generated.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`
    );
  }
  return `${parts.join(", ")}.`;
}

// ─── Baris zat gizi ──────────────────────────────────────────────────────────

type Tone = "good" | "warning" | "danger" | "neutral";

const TONE_STYLES: Record<Tone, { chip: string; bar: string }> = {
  good: { chip: "border-success-border bg-success-light text-success", bar: "bg-success" },
  warning: { chip: "border-warning-border bg-warning-light text-warning", bar: "bg-warning" },
  danger: { chip: "border-danger-border bg-danger-light text-danger", bar: "bg-danger" },
  // Nilai di luar kontrak jatuh ke gaya netral, bukan tanpa gaya.
  neutral: { chip: "border-border bg-surface-alt text-text-secondary", bar: "bg-text-muted" },
};

const NUTRIENT_STATUS: Record<NutrientStatus, { tone: Tone; label: string }> = {
  low: { tone: "warning", label: "Kurang" },
  good: { tone: "good", label: "Sesuai" },
  high: { tone: "danger", label: "Berlebih" },
  unknown: { tone: "neutral", label: "Catatan" },
};

const OVERALL_STATUS: Record<OverallStatus, { tone: Tone; label: string; icon: LucideIcon }> = {
  good: { tone: "good", label: "Asupan sudah sesuai", icon: CheckCircle2 },
  less: { tone: "warning", label: "Asupan masih kurang", icon: AlertTriangle },
  excess: { tone: "danger", label: "Asupan berlebih", icon: AlertCircle },
  unknown: { tone: "neutral", label: "Ringkasan", icon: Sparkles },
};

const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

function NutrientRow({ item }: { item: NutritionAnalysisItem }) {
  const { tone, label } = NUTRIENT_STATUS[item.status];
  const style = TONE_STYLES[tone];
  const hasNumbers = item.intake !== null && item.reference !== null && item.percent !== null;

  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-text-primary">{item.label}</span>
        <span className={cn("rounded-full border px-2 py-px text-[10px] font-semibold", style.chip)}>
          {label}
        </span>
        {hasNumbers ? (
          <span className="ml-auto font-mono text-xs text-text-secondary">
            {numberFormat.format(item.intake as number)} /{" "}
            {numberFormat.format(item.reference as number)} {item.unit}
          </span>
        ) : null}
      </div>

      {hasNumbers ? (
        <div className="mt-2 flex items-center gap-2">
          <div
            role="progressbar"
            aria-label={`${item.label} terhadap rujukan`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(Math.round(item.percent as number), 100)}
            aria-valuetext={`${numberFormat.format(item.percent as number)} persen dari rujukan`}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-alt"
          >
            <div
              className={cn("h-full rounded-full", style.bar)}
              style={{ width: `${Math.min(Math.max(item.percent as number, 0), 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-[11px] text-text-muted">
            {numberFormat.format(item.percent as number)}%
          </span>
        </div>
      ) : null}

      {item.description ? (
        <p className="mt-2 text-xs leading-relaxed text-text-muted">{item.description}</p>
      ) : null}
    </li>
  );
}

function OverallBanner({ status, message }: { status: OverallStatus; message: string }) {
  const { tone, label, icon: Icon } = OVERALL_STATUS[status];

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4", TONE_STYLES[tone].chip)}>
      <Icon aria-hidden className="mt-px h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        {message ? <p className="mt-1 text-xs leading-relaxed opacity-90">{message}</p> : null}
      </div>
    </div>
  );
}

// ─── Elemen kecil ────────────────────────────────────────────────────────────

function Notice({
  icon: Icon,
  tone = "neutral",
  children,
}: {
  icon: LucideIcon;
  tone?: "neutral" | "warning";
  children: React.ReactNode;
}) {
  return (
    <p
      role="status"
      className={cn(
        "mt-4 flex items-start gap-2 rounded-md p-3 text-xs leading-relaxed",
        tone === "warning"
          ? "border border-warning-border bg-warning-light text-warning"
          : "bg-surface-alt text-text-muted"
      )}
    >
      <Icon aria-hidden className="mt-px h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function ErrorMessage({ error }: { error: AiError }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md bg-danger-light p-3 text-xs leading-relaxed text-danger"
    >
      <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" />
      <span>{error.message}</span>
    </p>
  );
}

function PrimaryButton({
  icon: Icon,
  onClick,
  children,
}: {
  icon: LucideIcon;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-all",
        "hover:bg-primary-hover hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
      <Icon aria-hidden className="h-4 w-4" />
      {children}
    </button>
  );
}

function SectionTitle({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
      {Icon ? <Icon aria-hidden className="h-4 w-4" /> : null}
      {children}
    </span>
  );
}

function AnalysisSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-5 flex flex-col gap-4">
      <p className="flex items-center gap-2 text-xs font-medium text-primary">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        AI sedang menyusun penjelasan atas laporan Anda… biasanya beberapa detik, paling lama satu
        menit.
      </p>
      <div className="h-16 animate-pulse rounded-lg bg-surface-alt" />
      <div className="flex flex-col gap-2">
        <div className="h-14 animate-pulse rounded-lg bg-surface-alt" />
        <div className="h-14 animate-pulse rounded-lg bg-surface-alt" />
        <div className="h-14 animate-pulse rounded-lg bg-surface-alt" />
        <div className="h-14 animate-pulse rounded-lg bg-surface-alt" />
      </div>
      <div className="h-20 animate-pulse rounded-lg bg-surface-alt" />
    </div>
  );
}
