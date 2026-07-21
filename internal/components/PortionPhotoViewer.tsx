"use client";

import { useState } from "react";
import { Image as ImageIcon, Info } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import type { PortionPhoto } from "@/internal/types/food.types";
import { getImageUrl, isGuideType, PHOTO_PLACEHOLDER } from "@/internal/lib/image";
import { Image as ImageIcon, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

interface PortionPhotoViewerProps {
  photos: PortionPhoto[];
  photoType: "series" | "range";
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

// ─── Foto tunggal dengan fallback ─────────────────────────────────────────────
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
    />
  );
}

// ─── Tampilan Guide (range) — 1 foto besar, semua label sebagai overlay pill ──
function GuidePhotoView({ photos }: { photos: PortionPhoto[] }) {
  // Foto guide: semua porsi ada dalam 1 gambar, image_url tiap label sama.
  // Tampilkan foto pertama sebagai hero, lalu tabel semua porsi di bawah.
  const guidePhoto = photos[0];

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
            alt={`Guide foto — semua porsi`}
            className="w-full h-full object-contain animate-fade-in"
          />

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
                {p.description && (
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
  activeIndex,
  onSelect,
}: {
  photos: PortionPhoto[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

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

  // Scroll thumbnail aktif ke tengah saat berubah
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

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onSelect?.(index);
  };

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
                    {activePhoto.description || `Porsi ${activePhoto.label}`}
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

      {/* Thumbnail strip */}
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

                  {/* Label + berat */}
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
  activeIndex: controlledIndex,
  onSelect,
}: PortionPhotoViewerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onSelect?.(index);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-sm">Belum ada foto panduan porsi untuk makanan ini.</p>
      </div>
    );
  }

  // "range" = guide image (satu foto semua ukuran)
  if (isGuideType(photoType)) {
    return <GuidePhotoView photos={photos} />;
  }

  // "series" = foto terpisah per ukuran
  return (
    <SeriesPhotoView
      photos={photos}
      activeIndex={activeIndex}
      onSelect={handleSelect}
    />
  );
}
