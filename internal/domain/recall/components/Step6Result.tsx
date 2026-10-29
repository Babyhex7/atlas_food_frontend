"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Clock, UtensilsCrossed, Scale, Plus, ArrowRight } from "lucide-react";
import { AiRecommendationPanel } from "@/internal/domain/ai";
import { Button, StepShell } from "./ui/Primitives";
import type { RecallSession } from "../types/recall";

interface Props {
  respondentName?: string;
  /** submission_id dari hasil submit — tanpa ini analisis AI tidak bisa dijalankan. */
  submissionId?: string;
  session?: RecallSession | null;
  onFinish: () => void;
  onFillAgain?: () => void;
}

export function Step6Result({ respondentName, submissionId, session, onFinish, onFillAgain }: Props) {
  // Efek perayaan kembang api / petasan saat berhasil submit
  useEffect(() => {
    const duration = 2.4 * 1000;
    const animationEnd = Date.now() + duration;

    // Ledakan utama pertama
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#059669", "#34d399", "#f59e0b", "#0284c7"],
    });

    // Petasan bertahap dari sisi kiri dan kanan
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });
      confetti({
        particleCount: 25,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  // Hitung data ringkasan asli dari sesi survei (bukan teks generik)
  const totalFoods = session?.meals.flatMap((m) => m.foods).length ?? 0;
  const activeMeals = session?.meals.filter((m) => m.foods.length > 0) ?? [];
  const mealName =
    activeMeals.length > 0
      ? activeMeals.map((m) => m.name).join(", ")
      : session?.current_meal?.type ?? "Waktu Makan";
  const totalGrams =
    session?.meals
      .flatMap((m) => m.foods)
      .reduce((sum, f) => sum + (f.portion?.portion_gram ?? 0), 0) ?? 0;

  const summaryStats = [
    {
      icon: Clock,
      label: "Waktu Makan",
      value: mealName,
      desc: session?.current_meal?.time ? `Pukul ${session.current_meal.time}` : "Tercatat",
    },
    {
      icon: UtensilsCrossed,
      label: "Menu Dicatat",
      value: `${totalFoods} Makanan`,
      desc: "Lengkap dengan porsi",
    },
    {
      icon: Scale,
      label: "Total Berat",
      value: totalGrams > 0 ? `${Math.round(totalGrams)} gram` : "Tervalidasi",
      desc: "Estimasi asupan",
    },
  ];

  return (
    <StepShell maxWidth="normal">
      {/* ── Hero Success Card ────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-surface to-surface p-6 sm:p-8 shadow-xs">
        {/* Animated Checkmark with Ripple Effect */}
        <div className="relative mb-4 flex items-center justify-center">
          <span className="absolute -inset-2 rounded-full border-2 border-emerald-500/30 animate-ping opacity-30" />
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
            className="relative flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/25"
          >
            <motion.svg
              className="h-9 w-9 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M20 6L9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.25 }}
              />
            </motion.svg>
          </motion.div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          Laporan Makan Berhasil Terkirim!
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
          Terima kasih{respondentName ? `, ${respondentName}` : ""}! Catatan recall makanan Anda telah
          berhasil disimpan. Anda dapat melihat evaluasi kecukupan gizi personal berdasarkan standar AKG di bawah.
        </p>

        {/* 3 Real Data Summary Tiles */}
        <div className="mt-6 grid w-full grid-cols-1 sm:grid-cols-3 gap-3">
          {summaryStats.map(({ icon: Icon, label, value, desc }) => (
            <div
              key={label}
              className="flex items-center sm:flex-col sm:justify-center gap-3 rounded-xl border border-border/80 bg-surface/90 px-4 py-3.5 text-left sm:text-center shadow-2xs"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
                <span className="block text-sm font-bold text-text-primary">{value}</span>
                <span className="block text-[11px] text-text-muted">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rekomendasi / Evaluasi AKG ───────────────────────────────────── */}
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
