"use client";

import { CheckCircle2, ClipboardList, Database, Plus, Sparkles } from "lucide-react";
import { AiRecommendationPanel } from "@/internal/domain/ai";
import { Button, StepHeader, StepShell } from "./ui/Primitives";

interface Props {
  respondentName?: string;
  /** submission_id dari hasil submit — tanpa ini analisis AI tidak bisa dijalankan. */
  submissionId?: string;
  onFinish: () => void;
  onFillAgain?: () => void;
}

const SUMMARY_ITEMS = [
  { icon: Database, label: "Data Anda sudah tersimpan" },
  { icon: ClipboardList, label: "Laporan siap dianalisis" },
  { icon: Sparkles, label: "Rekomendasi personal tersedia di bawah" },
];

export function Step6Result({ respondentName, submissionId, onFinish, onFillAgain }: Props) {
  return (
    <StepShell centered>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
        <CheckCircle2 aria-hidden className="h-8 w-8 text-success" />
      </span>

      <StepHeader
        centered
        title="Laporan makan terkirim!"
        subtitle={`Terima kasih${
          respondentName ? `, ${respondentName}` : ""
        }! Recall makanan Anda berhasil dicatat. Jalankan analisis AI di bawah untuk melihat rekomendasi gizi personal Anda.`}
      />

      <ul className="flex w-full max-w-96 flex-col gap-3">
        {SUMMARY_ITEMS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left"
          >
            <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm font-medium text-text-secondary">{label}</span>
          </li>
        ))}
      </ul>

      {/* ── Rekomendasi AI ─────────────────────────────────────────────── */}
      <AiRecommendationPanel submissionId={submissionId} />

      <div className="flex flex-wrap justify-center gap-3">
        {onFillAgain ? (
          <Button variant="secondary" icon={Plus} onClick={onFillAgain}>
            Isi waktu makan lain
          </Button>
        ) : null}
        <Button onClick={onFinish}>Selesai</Button>
      </div>
    </StepShell>
  );
}
