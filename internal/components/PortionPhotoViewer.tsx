"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PortionPhoto } from "@/internal/types/food.types";
import { getImageUrl, isGuideType } from "@/internal/lib/image";
import { Image as ImageIcon, ChevronLeft, ChevronRight, LayoutGrid, Eye, EyeOff, Shapes } from "lucide-react";
import { AnnotationHoverOverlay } from "@/internal/domain/annotation/components/AnnotationHoverOverlay";
import { useCollab, LiveCanvasOverlay } from "@/internal/domain/collab";
import { usePublishedAnnotationsByFood } from "@/internal/domain/annotation/hooks/useAnnotationQueries";
import { areaColor } from "@/internal/domain/annotation/constants/annotationStatus";
import type { FoodImage } from "@/internal/domain/annotation/types/annotation";

interface PortionPhotoViewerProps {
  photos: PortionPhoto[];
  photoType: "series" | "range";
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

// ─── Interactive Detected Area Chips Strip (Intake24 style) ───────────────────
function DetectedAreasStrip({
  areas,
  selectedAreaId,
  onSelectArea,
}: {
  areas: FoodImage["areas"];
  selectedAreaId: string | null;
  onSelectArea: (id: string | null) => void;
}) {
  if (!areas || areas.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-alt p-3.5 flex flex-col gap-2.5 animate-fade-in">
      <div className="flex items-center justify-between text-xs font-medium text-text-muted flex-wrap gap-1">
        <span className="flex items-center gap-1.5 font-semibold text-text-primary">
          <Shapes size={14} className="text-primary" />
          Kenali Bagian Makanan ({areas.length} bagian terdeteksi)
        </span>
        <span className="text-[11px] text-text-muted">Arahkan kursor atau klik untuk sorot area</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {areas.map((area, idx) => {
          const color = areaColor(idx);
          const isSelected = area.id === selectedAreaId;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectArea(isSelected ? null : area.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-fast ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-border bg-surface text-text-secondary hover:border-primary/50 hover:bg-surface-alt"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? "#ffffff" : color }}
              />
              <span>{area.name}</span>
              {area.weight_gram != null && area.weight_gram > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isSelected ? "bg-white/20 text-white" : "bg-surface-alt text-text-muted border border-border"
                  }`}
                >
                  {area.weight_gram}g
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tampilan Guide (range) — 1 foto besar, semua label sebagai overlay pill ──
function GuidePhotoView({
  photos,
  foodId,
  visiblePolygons,
  setVisiblePolygons,
  selectedAreaId,
  setSelectedAreaId,
}: {
  photos: PortionPhoto[];
  foodId?: string;
  visiblePolygons: boolean;
  setVisiblePolygons: (v: boolean) => void;
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
}) {
  const guidePhoto = photos[0];
  const { send } = useCollab();
  const [currentAreas, setCurrentAreas] = useState<FoodImage["areas"]>([]);

  if (!guidePhoto) return null;

  return (
    <div className="space-y-5">
      {/* Badge info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LayoutGrid className="w-4 h-4 text-primary" />
        <span>
          Foto <span className="font-semibold text-primary">Guide</span> — satu gambar
          memuat semua <span className="font-semibold">{photos.length}</span> ukuran porsi
        </span>
      </div>

      {/* Hero foto guide */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="aspect-[4/3] md:aspect-[16/9] bg-muted/10 relative">
          <PhotoImg
            src={guidePhoto.image_url}
            alt="Guide foto — semua porsi"
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

          <LiveCanvasOverlay send={send} targetImageId={guidePhoto.id} />

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

          {/* Overlay semua label porsi */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[60%]">
            {photos.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 bg-black/70 text-white text-[10px] font-bold px-2 py-[3px] rounded-full leading-none"
              >
                <span className="text-primary">{p.label}</span>
                <span className="text-white/70">·</span>
                <span>{p.weight_gram}g</span>
              </span>
            ))}
          </div>

          {/* Badge tipe */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Guide
            </span>
          </div>
        </div>
      </div>

      {/* Bagian makanan terdeteksi (Intake24 style) */}
      <DetectedAreasStrip
        areas={currentAreas}
        selectedAreaId={selectedAreaId}
        onSelectArea={setSelectedAreaId}
      />

      {/* Tabel porsi */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Semua ukuran porsi dalam foto ini:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {photos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-alt"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{p.label}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary m-0 leading-none mb-[3px]">
                  {p.weight_gram}g
                </p>
                {p.description && !p.description.startsWith("food_image:") && (
                  <p className="text-[11px] text-text-muted m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {p.description}
                  </p>
                )}
              </div>
            </div>
          ))}
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

          <LiveCanvasOverlay send={send} targetImageId={activePhoto?.id} />

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
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6">
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

      {/* Bagian makanan terdeteksi (Intake24 style) */}
      <DetectedAreasStrip
        areas={currentAreas}
        selectedAreaId={selectedAreaId}
        onSelectArea={setSelectedAreaId}
      />

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

  // "range" = guide image (satu foto semua ukuran)
  if (isGuideType(photoType)) {
    return (
      <GuidePhotoView
        photos={effectivePhotos}
        foodId={foodId}
        visiblePolygons={visiblePolygons}
        setVisiblePolygons={setVisiblePolygons}
        selectedAreaId={selectedAreaId}
        setSelectedAreaId={setSelectedAreaId}
      />
    );
  }

  // "series" = foto terpisah per ukuran
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
