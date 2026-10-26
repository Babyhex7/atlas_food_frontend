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
        <div className="aspect-[4/3] md:aspect-[16/9] bg-emerald-50/20 relative">
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
              className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-black/75 text-white border border-white/20 hover:bg-black/90 transition-fast shadow-md"
              title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
            >
              {visiblePolygons ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} />}
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
        <div className="aspect-[4/3] md:aspect-[16/9] bg-amber-50/20 relative">
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
              className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-black/75 text-white border border-white/20 hover:bg-black/90 transition-fast shadow-md"
              title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
            >
              {visiblePolygons ? <Eye size={12} className="text-amber-400" /> : <EyeOff size={12} />}
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

  return (
    <div className="space-y-6">
      {/* Main foto aktif */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="aspect-[4/3] md:aspect-[16/9] bg-muted/10 relative">
          <PhotoImg
            src={activePhoto?.image_url}
            alt={activePhoto?.label ?? "foto porsi"}
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
              className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-black/75 text-white border border-white/20 hover:bg-black/90 transition-fast shadow-md"
              title={visiblePolygons ? "Sembunyikan batas area" : "Tampilkan batas area"}
            >
              {visiblePolygons ? <Eye size={12} className="text-primary" /> : <EyeOff size={12} />}
              <span>{visiblePolygons ? "Area: ON" : "Area: OFF"}</span>
            </button>
          )}

          {/* Navigasi panah kiri/kanan pada foto utama */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => onSelect(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white border border-white/20 hover:bg-black/70 transition-colors"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {activeIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={() => onSelect(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white border border-white/20 hover:bg-black/70 transition-colors"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Overlay info porsi aktif */}
          {activePhoto && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 pointer-events-none">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-white font-sans font-bold text-2xl md:text-3xl mb-1">
                    {activePhoto.label} &middot; {activePhoto.weight_gram} gram
                  </h3>
                  <p className="text-white/80 text-sm md:text-base">
                    {activePhoto.description && !activePhoto.description.startsWith("food_image:")
                      ? activePhoto.description
                      : `Porsi ${activePhoto.label}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs">
                    {activeIndex + 1}/{photos.length}
                  </span>
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Series
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Thumbnail strip porsi */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Pilih ukuran porsi:
        </p>
        <div className="relative">
          {needsScroll && showLeft && (
            <button
              type="button"
              onClick={() => scrollBy("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border hover:bg-white transition-colors"
              aria-label="Scroll kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {needsScroll && showRight && (
            <button
              type="button"
              onClick={() => scrollBy("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border hover:bg-white transition-colors"
              aria-label="Scroll kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
          >
            {photos.map((photo, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={`relative shrink-0 snap-center rounded-xl overflow-hidden border-2 transition-all duration-300 outline-none w-24 h-24 md:w-32 md:h-32 ${
                    isActive
                      ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-md"
                      : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Porsi ${photo.label} — ${photo.weight_gram}g`}
                  aria-pressed={isActive}
                >
                  <PhotoImg
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />

                  {isActive && <div className="absolute inset-0 bg-primary/10" />}

                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-[3px] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary leading-none">
                      {photo.label}
                    </span>
                    <span className="text-[10px] font-semibold text-white leading-none">
                      {photo.weight_gram}g
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
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
