"use client";

import { useState } from "react";
import { Image as ImageIcon, Info } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import type { PortionPhoto } from "@/internal/types/food.types";

interface PortionPhotoViewerProps {
  photos: PortionPhoto[];
  photoType: "series" | "range";
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

// ── Series layout ────────────────────────────────────────────────────────────
function SeriesViewer({
  photos,
  activeIndex: controlledIndex,
  onSelect,
}: {
  photos: PortionPhoto[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onSelect?.(index);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left — 2×4 photo grid */}
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo, index) => {
            const isActive = index === activeIndex;
            const imgSrc = photo.thumbnail_url || photo.image_url;

            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleSelect(index)}
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden transition-all duration-200 outline-none group bg-surface-alt",
                  "aspect-square w-full",
                  isActive
                    ? "border-primary bg-primary-light shadow-md"
                    : "border-border hover:border-primary/50"
                )}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={`Porsi ${photo.weight_gram}g`}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-text-muted/40" />
                  </div>
                )}

                {/* Weight label */}
                <div
                  className={cn(
                    "absolute bottom-0 inset-x-0 py-1 text-center text-xs font-semibold leading-none",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-black/50 text-white group-hover:bg-primary/80"
                  )}
                >
                  {photo.weight_gram}g
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right — portion data table + tip */}
      <div className="lg:w-64 xl:w-72 flex flex-col gap-4 shrink-0">
        {/* Portion table card */}
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-alt">
            <h3 className="text-sm font-semibold text-text-primary m-0">Data Porsi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted w-8">
                    Kode
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">
                    Berat (g)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {photos.map((photo, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <tr
                      key={photo.id}
                      onClick={() => handleSelect(index)}
                      className={cn(
                        "cursor-pointer transition-colors border-b border-border last:border-0",
                        isActive
                          ? "bg-primary-light"
                          : "hover:bg-surface-alt"
                      )}
                    >
                      <td
                        className={cn(
                          "px-3 py-2 font-mono font-bold text-xs",
                          isActive ? "text-primary" : "text-text-secondary"
                        )}
                      >
                        {photo.label}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-semibold tabular-nums",
                          isActive ? "text-primary" : "text-text-primary"
                        )}
                      >
                        {photo.weight_gram}
                      </td>
                      <td className="px-3 py-2 text-text-secondary text-xs leading-snug">
                        {photo.description || `Porsi ${photo.label}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage tip */}
        <div className="rounded-xl border border-border bg-white shadow-sm p-4 flex gap-3">
          <Info size={16} className="text-primary shrink-0 mt-[1px]" />
          <div>
            <p className="text-xs font-semibold text-text-primary mb-1">
              Cara Menggunakan Foto Series
            </p>
            <p className="text-xs text-text-secondary leading-relaxed m-0">
              Gunakan grid porsi di atas untuk membandingkan porsi aktual yang dikonsumsi dengan
              referensi visual kami, untuk estimasi berat terakurat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Range layout (unchanged scrollable thumbnails) ───────────────────────────
function RangeViewer({
  photos,
  activeIndex: controlledIndex,
  onSelect,
}: {
  photos: PortionPhoto[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const activePhoto = photos[activeIndex];

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onSelect?.(index);
  };

  return (
    <div className="space-y-5">
      {/* Main focus photo */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="aspect-[4/3] md:aspect-[16/9] bg-muted/10 relative">
          {activePhoto.image_url ? (
            <img
              key={activePhoto.id}
              src={activePhoto.image_url}
              alt={activePhoto.label}
              className="w-full h-full object-contain animate-fade-in"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <ImageIcon className="w-16 h-16 mb-2" />
              <span>[Gambar {activePhoto.label} tidak tersedia]</span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6">
            <h3 className="text-white font-bold text-2xl md:text-3xl mb-1">
              {activePhoto.label} · {activePhoto.weight_gram} gram
            </h3>
            <p className="text-white/80 text-sm md:text-base">
              {activePhoto.description || `Porsi ${activePhoto.label}`}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="grid gap-3 grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => handleSelect(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 outline-none",
                isActive
                  ? "border-primary ring-4 ring-primary/20 shadow-md scale-105 z-10"
                  : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
              )}
            >
              {photo.thumbnail_url || photo.image_url ? (
                <img
                  src={photo.thumbnail_url || photo.image_url}
                  alt={photo.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-alt flex items-center justify-center text-xs text-text-muted font-bold">
                  {photo.label}
                </div>
              )}
              {isActive && <div className="absolute inset-0 bg-primary/10" />}
              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center">
                <span className="text-[10px] md:text-xs font-bold text-white leading-none">
                  {photo.weight_gram}g
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export function PortionPhotoViewer({
  photos,
  photoType,
  activeIndex,
  onSelect,
}: PortionPhotoViewerProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>Belum ada foto panduan porsi untuk makanan ini.</p>
      </div>
    );
  }

  if (photoType === "series") {
    return (
      <SeriesViewer photos={photos} activeIndex={activeIndex} onSelect={onSelect} />
    );
  }

  return <RangeViewer photos={photos} activeIndex={activeIndex} onSelect={onSelect} />;
}
