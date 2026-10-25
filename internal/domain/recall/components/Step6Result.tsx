"use client";

import { CheckCircle2, ClipboardCheck, Database, Plus, Sparkles, ArrowRight } from "lucide-react";
import { AiRecommendationPanel } from "@/internal/domain/ai";
import { Button, StepShell } from "./ui/Primitives";

interface Props {
  respondentName?: string;
  /** submission_id dari hasil submit — tanpa ini analisis AI tidak bisa dijalankan. */
  submissionId?: string;
  onFinish: () => void;
  onFillAgain?: () => void;
}

const SUMMARY_ITEMS = [
  {
    icon: Database,
    title: "Data Tersimpan",
    desc: "Tercatat aman di sistem cloud",
  },
  {
    icon: ClipboardCheck,
    title: "Laporan Tervalidasi",
    desc: "Siap dievaluasi oleh ahli gizi",
  },
  {
    icon: Sparkles,
    title: "Rekomendasi AI Siap",
    desc: "Model Groq siap menganalisis",
  },
];

export function Step6Result({ respondentName, submissionId, onFinish, onFillAgain }: Props) {
  return (
    <StepShell maxWidth="normal">
      {/* ── Hero Success Card ────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-surface to-surface p-6 sm:p-8 shadow-xs">
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 mb-4">
          <CheckCircle2 aria-hidden className="h-9 w-9 stroke-[2.2]" />
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          Laporan Makan Berhasil Terkirim!
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
          Terima kasih{respondentName ? `, ${respondentName}` : ""}! Catatan recall makanan Anda telah
          berhasil disimpan. Silakan jalankan analisis AI di bawah untuk melihat evaluasi kecukupan
          gizi personal Anda.
        </p>

        {/* 3 Status Badges */}
        <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-3 gap-3">
          {SUMMARY_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center sm:flex-col sm:justify-center gap-3 rounded-xl border border-border/80 bg-surface/90 px-4 py-3.5 text-left sm:text-center shadow-2xs"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-xs font-bold text-text-primary">{title}</span>
                <span className="block text-[11px] text-text-muted">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rekomendasi AI ─────────────────────────────────────────────── */}
      <AiRecommendationPanel submissionId={submissionId} />

      {/* ── Action Buttons ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        {onFillAgain ? (
          <Button variant="secondary" icon={Plus} onClick={onFillAgain}>
            Isi waktu makan lain
          </Button>
        ) : (
          <div />
        )}
        <Button icon={ArrowRight} iconPosition="right" onClick={onFinish}>
          Lihat Ringkasan Lengkap
        </Button>
      </div>
    </StepShell>
  );
}

