"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PortionPhoto } from "@/internal/types/food.types";
import { getImageUrl, isGuideType, isRangeType, isSeriesType } from "@/internal/lib/image";
import { Image as ImageIcon, ChevronLeft, ChevronRight, LayoutGrid, Eye, EyeOff, Layers, Scale } from "lucide-react";
import { AnnotationHoverOverlay } from "@/internal/domain/annotation/components/AnnotationHoverOverlay";
import { useCollab } from "@/internal/domain/collab";
import { usePublishedAnnotationsByFood } from "@/internal/domain/annotation/hooks/useAnnotationQueries";
import type { FoodImage } from "@/internal/domain/annotation/types/annotation";
import { cn } from "@/internal/lib/cn";

interface PortionPhotoViewerProps {
  photos: PortionPhoto[];
  photoType?: "series" | "range" | "guide" | string;
  foodId?: string;
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

// ─── Foto tunggal dengan fallback (tanpa zoom full-image) ─────────────────────
function PhotoImg({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const resolved = getImageUrl(src);

  if (!resolved || errored) {
    return (
      <div className={`flex flex-col items-center justify-center text-muted-foreground/30 bg-muted/20 ${className ?? ""}`}>
        <ImageIcon className="w-12 h-12 mb-2" />
        <span className="text-xs">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      draggable={false}
    />
  );
}

// ─── Tampilan Range — 1 foto makanan sama, gradasi ukuran kecil ke besar ────
function RangePhotoView({
  photos,
  foodId,
  visiblePolygons,
  setVisiblePolygons,
  selectedAreaId,
  setSelectedAreaId,
  activeIndex,
  onSelect,
}: {
  photos: PortionPhoto[];
  foodId?: string;
  visiblePolygons: boolean;
  setVisiblePolygons: (v: boolean) => void;
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const rangePhoto = photos[0];
  const [currentAreas, setCurrentAreas] = useState<FoodImage["areas"]>([]);
  const maxWeight = Math.max(...photos.map((p) => p.weight_gram || 1), 1);

  if (!rangePhoto) return null;

  return (
    <div className="space-y-5">
      {/* Badge info */}
      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            Foto <span className="font-bold text-emerald-700 dark:text-emerald-300">Range (Rentang Ukuran)</span> — 1 makanan dengan{" "}
            <span className="font-bold">{photos.length}</span> tingkatan ukuran
          </span>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
          <Scale size={13} className="text-emerald-600" /> Gradasi Ukuran
        </span>
      </div>

      {/* Hero foto range */}
      <div className="bg-white dark:bg-card rounded-2xl border border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-sm relative">
        <div className="aspect-[16/9] max-h-[380px] bg-emerald-50/20 relative flex items-center justify-center">
          <PhotoImg
            src={rangePhoto.image_url}
            alt="Range foto — rentang ukuran makanan"
            className="w-full h-full object-contain animate-fade-in"
          />

          {/* Interactive Polygons Overlay */}
          <AnnotationHoverOverlay
            foodImageId={rangePhoto.food_image_id}
            foodId={foodId}
            visiblePolygons={visiblePolygons}
            selectedAreaId={selectedAreaId}
            onAreaSelect={(area) => setSelectedAreaId(area.id)}
            onLoadedAreas={setCurrentAreas}
          />

          {/* Toggle Polygon Visibility */}
          {currentAreas.length > 0 && (
            <button
              type="button"
              onClick={() => setVisiblePolygons(!visiblePolygons)}
              className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 text-text-primary border border-border hover:bg-white transition-fast shadow-xs cursor-pointer"
              title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
            >
              {visiblePolygons ? <Eye size={13} className="text-emerald-600" /> : <EyeOff size={13} className="text-text-muted" />}
              <span>{visiblePolygons ? "Area: ON" : "Area: OFF"}</span>
            </button>
          )}

          {/* Overlay urutan tingkatan ukuran porsi */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end max-w-[60%]">
            {photos.map((p, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all backdrop-blur-md cursor-pointer border",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md scale-105"
                      : "bg-black/70 text-white/90 border-white/20 hover:bg-black/90"
                  )}
                >
                  <span className={isSelected ? "text-white" : "text-emerald-300"}>{p.label}</span>
                  <span className="opacity-50">·</span>
                  <span>{p.weight_gram}g</span>
                </button>
              );
            })}
          </div>

          {/* Badge tipe */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Layers size={11} /> Range
            </span>
          </div>
        </div>
      </div>

      {/* Gradasi Tingkatan Ukuran (Kecil → Besar) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-text-primary m-0">
            Gradasi Tingkatan Ukuran:
          </p>
          <span className="text-xs text-muted-foreground">
            Kecil → Sedang → Besar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {photos.map((p, idx) => {
            const isSelected = activeIndex === idx;
            const percent = Math.round(((p.weight_gram || 0) / maxWeight) * 100);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(idx)}
                className={cn(
                  "flex flex-col gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-border bg-surface-alt hover:border-emerald-300 dark:hover:border-emerald-700"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs",
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                    )}
                  >
                    {p.label}
                  </div>
                  <span className="text-xs font-bold text-text-primary">
                    {p.weight_gram}g
                  </span>
                </div>

                {/* Progress bar visual porsi */}
                <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percent, 12)}%` }}
                  />
                </div>

                {p.description && !p.description.startsWith("food_image:") && (
                  <p className="text-[11px] text-text-muted m-0 truncate">
                    {p.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tampilan Guide — 1 foto panduan komposit memuat berbagai ragam jenis ───
function GuidePhotoView({
  photos,
  foodId,
  visiblePolygons,
  setVisiblePolygons,
  selectedAreaId,
  setSelectedAreaId,
  activeIndex,
  onSelect,
}: {
  photos: PortionPhoto[];
  foodId?: string;
  visiblePolygons: boolean;
  setVisiblePolygons: (v: boolean) => void;
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
  activeIndex?: number;
  onSelect?: (i: number) => void;
}) {
  const guidePhoto = photos[0];
  const { send } = useCollab();
  const [currentAreas, setCurrentAreas] = useState<FoodImage["areas"]>([]);

  if (!guidePhoto) return null;

  return (
    <div className="space-y-5">
      {/* Badge info */}
      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
          <LayoutGrid className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>
            Foto <span className="font-bold text-amber-700 dark:text-amber-300">Guide (Panduan Varian)</span> — memuat{" "}
            <span className="font-bold">{photos.length}</span> ragam jenis/varian berbeda
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Pilih varian pada foto
        </span>
      </div>

      {/* Hero foto guide */}
      <div className="bg-white dark:bg-card rounded-2xl border border-amber-100 dark:border-amber-900/50 overflow-hidden shadow-sm relative">
        <div className="aspect-[16/9] max-h-[380px] bg-amber-50/20 relative flex items-center justify-center">
          <PhotoImg
            src={guidePhoto.image_url}
            alt="Guide foto — aneka ragam varian makanan"
            className="w-full h-full object-contain animate-fade-in"
          />

          {/* Interactive Polygons Overlay */}
          <AnnotationHoverOverlay
            foodImageId={guidePhoto.food_image_id}
            foodId={foodId}
            visiblePolygons={visiblePolygons}
            selectedAreaId={selectedAreaId}
            onAreaSelect={(area) => setSelectedAreaId(area.id)}
            onLoadedAreas={setCurrentAreas}
          />

          {/* Toggle Polygon Visibility */}
          {currentAreas.length > 0 && (
            <button
              type="button"
              onClick={() => setVisiblePolygons(!visiblePolygons)}
              className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 text-text-primary border border-border hover:bg-white transition-fast shadow-xs cursor-pointer"
              title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
            >
              {visiblePolygons ? <Eye size={13} className="text-amber-600" /> : <EyeOff size={13} className="text-text-muted" />}
              <span>{visiblePolygons ? "Area: ON" : "Area: OFF"}</span>
            </button>
          )}

          {/* Overlay semua label porsi */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end max-w-[60%]">
            {photos.map((p, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelect?.(idx)}
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all backdrop-blur-md cursor-pointer border",
                    isSelected
                      ? "bg-amber-600 text-white border-amber-400 shadow-md scale-105"
                      : "bg-black/70 text-white/90 border-white/20 hover:bg-black/90"
                  )}
                >
                  <span className={isSelected ? "text-white" : "text-amber-300"}>{p.label}</span>
                  <span className="opacity-50">·</span>
                  <span>{p.weight_gram}g</span>
                </button>
              );
            })}
          </div>

          {/* Badge tipe */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <LayoutGrid size={11} /> Guide
            </span>
          </div>
        </div>
      </div>

      {/* Tabel ragam varian makanan */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          Ragam jenis/varian makanan dalam foto ini:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {photos.map((p, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect?.(idx)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm ring-2 ring-amber-500/20"
                    : "border-border bg-surface-alt hover:border-amber-300 dark:hover:border-amber-700"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs",
                    isSelected
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                  )}
                >
                  {p.label}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-primary m-0 leading-none mb-[3px]">
                    {p.weight_gram}g
                  </p>
                  {p.description && !p.description.startsWith("food_image:") && (
                    <p className="text-[11px] text-text-muted m-0 truncate">
                      {p.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tampilan Series — foto terpisah per ukuran, thumbnail scrollable ─────────
function SeriesPhotoView({
  photos,
  foodId,
  activeIndex,
  onSelect,
  visiblePolygons,
  setVisiblePolygons,
  selectedAreaId,
  setSelectedAreaId,
}: {
  photos: PortionPhoto[];
  foodId?: string;
  activeIndex: number;
  onSelect: (i: number) => void;
  visiblePolygons: boolean;
  setVisiblePolygons: (v: boolean) => void;
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const { send } = useCollab();
  const [currentAreas, setCurrentAreas] = useState<FoodImage["areas"]>([]);

  const checkArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    checkArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkArrows, { passive: true });
    window.addEventListener("resize", checkArrows);
    return () => {
      el.removeEventListener("scroll", checkArrows);
      window.removeEventListener("resize", checkArrows);
    };
  }, [checkArrows, photos]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const thumb = el.children[activeIndex] as HTMLElement | undefined;
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -(el.clientWidth * 0.6) : el.clientWidth * 0.6, behavior: "smooth" });
  };

  const activePhoto = photos[activeIndex];
  const needsScroll = photos.length > 5;

  useEffect(() => {
    if (currentAreas.length > 0) {
      const match = currentAreas.find(
        (a) =>
          (activePhoto && a.weight_gram && Math.abs(a.weight_gram - activePhoto.weight_gram) < 0.5) ||
          (activePhoto && a.name.toLowerCase().includes(`porsi ${activePhoto.label.toLowerCase()}`))
      );
      setSelectedAreaId(match ? match.id : currentAreas[0].id);
    } else {
      setSelectedAreaId(null);
    }
  }, [currentAreas, activePhoto, setSelectedAreaId]);

  return (
    <div className="space-y-6">
      {/* Main foto aktif */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="aspect-[16/9] min-h-[320px] max-h-[480px] md:max-h-[520px] w-full bg-slate-50/40 relative flex items-center justify-center">
          <PhotoImg
            src={activePhoto?.image_url}
            alt=""
            className="w-full h-full object-contain animate-fade-in"
          />

          {/* Interactive Polygons Overlay */}
          <AnnotationHoverOverlay
            foodImageId={activePhoto?.food_image_id}
            foodId={foodId}
            visiblePolygons={visiblePolygons}
            selectedAreaId={selectedAreaId}
            onAreaSelect={(area) => setSelectedAreaId(area.id)}
            onLoadedAreas={setCurrentAreas}
          />

          {/* Toggle Polygon Visibility */}
          {currentAreas.length > 0 && (
            <button
              type="button"
              onClick={() => setVisiblePolygons(!visiblePolygons)}
              className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/95 text-text-primary border border-border hover:bg-white transition-fast shadow-xs cursor-pointer"
              title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
            >
              {visiblePolygons ? <Eye size={13} className="text-primary" /> : <EyeOff size={13} className="text-text-muted" />}
              <span>{visiblePolygons ? "Area: ON" : "Area: OFF"}</span>
            </button>
          )}

          {/* Navigasi panah kiri/kanan pada foto utama */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => onSelect(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-text-primary border border-border hover:bg-white transition-fast shadow-xs cursor-pointer"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {activeIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={() => onSelect(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-text-primary border border-border hover:bg-white transition-fast shadow-xs cursor-pointer"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean Info Strip di bawah foto (tidak menutupi makanan) */}
        {activePhoto && (
          <div className="px-4 py-2.5 bg-surface border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text-primary">
                Porsi {activePhoto.label}
              </span>
              <span className="text-text-muted">·</span>
              <span className="font-bold text-primary font-mono text-sm">
                {activePhoto.weight_gram} gram
              </span>
              {activePhoto.description && !activePhoto.description.startsWith("food_image:") && (
                <>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted truncate max-w-[200px]">
                    {activePhoto.description}
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] text-text-muted font-medium">
              {activeIndex + 1} dari {photos.length} porsi
            </span>
          </div>
        )}
      </div>


      {/* Thumbnail strip porsi */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-text-secondary">Pilih ukuran porsi:</span>
          <div className="flex items-center gap-1.5">
            {needsScroll && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollBy("left")}
                  disabled={!showLeft}
                  className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Scroll kiri"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-text-primary" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy("right")}
                  disabled={!showRight}
                  className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Scroll kanan"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-text-primary" />
                </button>
              </div>
            )}
            <span className="text-text-muted text-[11px] font-mono">{photos.length} porsi</span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto py-1 px-0.5 snap-x snap-mandatory scroll-smooth hide-scrollbar"
        >
          {photos.map((photo, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "relative shrink-0 snap-center rounded-lg overflow-hidden border transition-fast outline-none w-32 md:w-40 aspect-[16/9] bg-surface-alt cursor-pointer",
                  isActive
                    ? "border-primary ring-2 ring-primary/20 shadow-xs"
                    : "border-border hover:border-text-muted/40 opacity-75 hover:opacity-100"
                )}
                aria-label={`Porsi ${photo.label} — ${photo.weight_gram}g`}
                aria-pressed={isActive}
              >
                <PhotoImg
                  src={photo.thumbnail_url || photo.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-[2px] py-1 px-2 flex items-center justify-between text-[11px] text-white">
                  <span className="font-bold text-white leading-none">
                    Porsi {photo.label}
                  </span>
                  <span className="font-mono text-white/95 font-semibold leading-none">
                    {photo.weight_gram}g
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function PortionPhotoViewer({
  photos,
  photoType,
  foodId,
  activeIndex: controlledIndex,
  onSelect,
}: PortionPhotoViewerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [visiblePolygons, setVisiblePolygons] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  // Fallback: jika photos kosong tapi foodId punya published annotation
  const { data: publishedImages } = usePublishedAnnotationsByFood(
    (!photos || photos.length === 0) && foodId ? foodId : undefined
  );

  // Jika photos kosong tapi ada published images, susun synthetic photos
  const effectivePhotos: PortionPhoto[] =
    photos && photos.length > 0
      ? photos
      : (publishedImages ?? []).map((img, idx) => ({
          id: img.id,
          label: img.title || String.fromCharCode(65 + idx),
          image_url: img.image_url,
          thumbnail_url: img.thumbnail_url || img.image_url,
          weight_gram: 0,
          description: "",
          food_image_id: img.id,
        }));

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    setSelectedAreaId(null);
    onSelect?.(index);
  };

  if (!effectivePhotos || effectivePhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-sm">Belum ada foto panduan porsi untuk makanan ini.</p>
      </div>
    );
  }

  // "range" = 1 foto makanan sama dengan gradasi tingkatan ukuran (kecil -> sedang -> besar)
  if (isRangeType(photoType)) {
    return (
      <RangePhotoView
        photos={effectivePhotos}
        foodId={foodId}
        visiblePolygons={visiblePolygons}
        setVisiblePolygons={setVisiblePolygons}
        selectedAreaId={selectedAreaId}
        setSelectedAreaId={setSelectedAreaId}
        activeIndex={activeIndex}
        onSelect={handleSelect}
      />
    );
  }

  // "guide" = 1 foto panduan komposit memuat berbagai macam ragam varian/jenis makanan
  if (isGuideType(photoType)) {
    return (
      <GuidePhotoView
        photos={effectivePhotos}
        foodId={foodId}
        visiblePolygons={visiblePolygons}
        setVisiblePolygons={setVisiblePolygons}
        selectedAreaId={selectedAreaId}
        setSelectedAreaId={setSelectedAreaId}
        activeIndex={activeIndex}
        onSelect={handleSelect}
      />
    );
  }

  // "series" = foto terpisah per ukuran porsi
  return (
    <SeriesPhotoView
      photos={effectivePhotos}
      foodId={foodId}
      activeIndex={activeIndex}
      onSelect={handleSelect}
      visiblePolygons={visiblePolygons}
      setVisiblePolygons={setVisiblePolygons}
      selectedAreaId={selectedAreaId}
      setSelectedAreaId={setSelectedAreaId}
    />
  );
}
