"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, RotateCcw, Check, Scale, Image as ImageIcon } from "lucide-react";
import type { PortionPhoto } from "@/internal/domain/food/types/food";
import { getImageUrl } from "@/internal/lib/image";
import { cn } from "@/internal/lib/cn";

const PORTION_PRESETS = [
  { label: "¼", name: "Seperempat", totalQty: 0.25, quantity: 0, fraction: 0.25 },
  { label: "½", name: "Setengah", totalQty: 0.5, quantity: 0, fraction: 0.5 },
  { label: "¾", name: "Tiga perempat", totalQty: 0.75, quantity: 0, fraction: 0.75 },
  { label: "1x", name: "Standar", totalQty: 1.0, quantity: 1, fraction: 0 },
  { label: "1½", name: "Satu setengah", totalQty: 1.5, quantity: 1, fraction: 0.5 },
  { label: "2x", name: "Dua porsi", totalQty: 2.0, quantity: 2, fraction: 0 },
] as const;

function formatQuantityLabel(qty: number): string {
  if (qty === 0.25) return "¼ porsi";
  if (qty === 0.5) return "½ porsi";
  if (qty === 0.75) return "¾ porsi";
  if (qty === 1) return "1 porsi (standar)";
  if (qty === 1.25) return "1 ¼ porsi";
  if (qty === 1.5) return "1 ½ porsi";
  if (qty === 1.75) return "1 ¾ porsi";
  if (qty % 1 === 0) return `${qty} porsi`;
  if (qty % 1 === 0.5) return `${Math.floor(qty)} ½ porsi`;
  if (qty % 1 === 0.25) return `${Math.floor(qty)} ¼ porsi`;
  if (qty % 1 === 0.75) return `${Math.floor(qty)} ¾ porsi`;
  return `${qty} porsi`;
}

interface PortionAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: PortionPhoto;
  foodName: string;
  currentTotalQty: number;
  onPresetSelect: (qty: number, frac: number, total: number) => void;
  onStep: (delta: number) => void;
  customGram?: string;
  onCustomGram?: (gram: string) => void;
}

export function PortionAdjustModal({
  isOpen,
  onClose,
  photo,
  foodName,
  currentTotalQty,
  onPresetSelect,
  onStep,
  customGram = "",
  onCustomGram,
}: PortionAdjustModalProps) {
  const [prevPhoto, setPrevPhoto] = useState(photo);
  const [imgErrored, setImgErrored] = useState(false);

  if (photo !== prevPhoto) {
    setPrevPhoto(photo);
    setImgErrored(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedImgUrl = getImageUrl(photo.thumbnail_url || photo.image_url);
  const totalWeight = Math.round(photo.weight_gram * currentTotalQty * 10) / 10;
  const isCustomMode = customGram.trim() !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative flex w-full max-w-4xl max-h-[85vh] flex-col rounded-3xl border border-primary/20 bg-surface shadow-2xl transition-all z-10 overflow-hidden my-auto shrink-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5 bg-surface text-text-primary z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-text-primary leading-tight m-0 truncate">
                Penyesuaian Porsi Makanan
              </h3>
              <p className="text-[11px] sm:text-xs text-text-muted m-0 truncate">
                {foodName} <span className="text-text-placeholder">•</span> Acuan <strong className="text-primary font-semibold">Porsi {photo.label}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch">

            {/* Left Column: Photo Preview & Dominant Calculated Weight Card */}
            <div className="md:col-span-5 flex flex-col justify-between gap-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-sm flex items-center justify-center shrink-0">
                {resolvedImgUrl && !imgErrored ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resolvedImgUrl}
                    alt={`Porsi ${photo.label}`}
                    onError={() => setImgErrored(true)}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center text-text-muted gap-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-text-primary">Porsi {photo.label}</span>
                    <span className="text-[11px] text-text-muted">{photo.weight_gram} gram acuan</span>
                  </div>
                )}

                {/* Floating Photo Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
                  <span className="text-primary-light font-bold">Porsi {photo.label}</span>
                  <span className="text-white/40">•</span>
                  <span>{photo.weight_gram}g</span>
                </div>
              </div>

              {/* Total Calculation Card - Luas, Lebih Tinggi, Lebar & Dominan */}
              <div className="flex flex-col rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-surface p-3.5 space-y-1 shadow-sm shrink-0">
                <div className="text-[11px] font-extrabold text-primary tracking-wider uppercase">
                  Hasil Estimasi Berat
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-xs text-text-muted font-medium">
                    {isCustomMode
                      ? "Gram manual"
                      : `${currentTotalQty}x porsi × ${photo.weight_gram}g`}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">
                    {isCustomMode ? `${customGram}g` : `${totalWeight}g`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Presets (4 Kolom per Baris), Stepper & Custom Input */}
            <div className="md:col-span-7 flex flex-col justify-between gap-3.5 h-full">

              {/* Presets Grid - 4 Kolom per Baris */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">
                    Pilih Kelipatan Porsi:
                  </span>
                  <span className="text-[11px] text-text-muted font-medium">
                    Acuan standar: <strong className="text-text-primary">{photo.weight_gram}g</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PORTION_PRESETS.map((preset) => {
                    const isSelected =
                      !isCustomMode && Math.abs(currentTotalQty - preset.totalQty) < 0.01;
                    const calculatedGram =
                      Math.round(photo.weight_gram * preset.totalQty * 10) / 10;

                    return (
                      <button
                        key={preset.totalQty}
                        type="button"
                        onClick={() => {
                          if (onCustomGram) onCustomGram("");
                          onPresetSelect(preset.quantity, preset.fraction, preset.totalQty);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl border p-2 sm:p-2.5 text-center transition-all cursor-pointer select-none min-h-[68px] sm:min-h-[72px]",
                          "active:scale-95",
                          isSelected
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25 font-bold"
                            : "border-border bg-surface hover:border-primary/40 hover:bg-surface-alt text-text-primary"
                        )}
                      >
                        <span className={cn("text-xs sm:text-sm font-extrabold leading-none mb-0.5", isSelected ? "text-white" : "text-text-primary")}>
                          {preset.label}
                        </span>
                        <span className={cn("text-[10px] sm:text-[11px] leading-tight mb-1 font-semibold text-center leading-none", isSelected ? "text-white/90" : "text-text-muted")}>
                          {preset.name}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-extrabold font-sans leading-none shrink-0",
                            isSelected ? "bg-white/20 text-white" : "bg-primary-light text-primary"
                          )}
                        >
                          {calculatedGram}g
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stepper (+ / -) & Manual Input Side-by-Side Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-auto">
                {/* Stepper (+ / -) */}
                <div className="flex flex-col justify-between gap-2 rounded-2xl border border-border bg-surface-alt/60 p-2.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">
                      Atur Bertahap (+ / −)
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Tambah / kurangi porsi
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onCustomGram) onCustomGram("");
                        onStep(-1);
                      }}
                      disabled={currentTotalQty <= 0.25 || isCustomMode}
                      aria-label="Kurangi porsi"
                      className="w-8 h-8 rounded-lg border border-border bg-surface text-text-primary hover:border-primary hover:bg-primary-light hover:text-primary disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-bold shrink-0"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>

                    <div className="px-1.5 py-1 rounded-lg bg-surface border border-border text-center font-sans text-xs font-bold text-text-primary flex-1 truncate">
                      {formatQuantityLabel(currentTotalQty)}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onCustomGram) onCustomGram("");
                        onStep(1);
                      }}
                      disabled={currentTotalQty >= 10 || isCustomMode}
                      aria-label="Tambah porsi"
                      className="w-8 h-8 rounded-lg border border-border bg-surface text-text-primary hover:border-primary hover:bg-primary-light hover:text-primary disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-bold shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional Custom Gram Input */}
                {onCustomGram && (
                  <div className="flex flex-col justify-between gap-2 rounded-2xl border border-border bg-surface p-2.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary">
                        Atau Isi Berat Manual
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Timbangan gram pasti
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder={`mis. ${photo.weight_gram}`}
                        value={customGram}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                          const parsed = Number.parseInt(cleaned, 10);
                          const clamped = Number.isFinite(parsed) && parsed > 3000 ? "3000" : cleaned;
                          onCustomGram(clamped);
                        }}
                        className={cn(
                          "h-8 flex-1 rounded-lg border bg-surface px-2.5 text-center font-sans text-xs font-bold text-text-primary outline-none transition-all min-w-0",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20",
                          isCustomMode ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border"
                        )}
                      />
                      <span className="text-xs font-bold text-text-muted shrink-0">gram</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3 bg-surface z-20">
          {currentTotalQty !== 1 || isCustomMode ? (
            <button
              type="button"
              onClick={() => {
                if (onCustomGram) onCustomGram("");
                onPresetSelect(1, 0, 1);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset 1x ({photo.weight_gram}g)
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              Simpan &amp; Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
