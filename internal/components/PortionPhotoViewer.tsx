"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PortionPhoto } from "@/internal/types/food.types";
import { Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface PortionPhotoViewerProps {
  photos: PortionPhoto[];
  photoType: "series" | "range";
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

export function PortionPhotoViewer({ photos, photoType, activeIndex: controlledIndex, onSelect }: PortionPhotoViewerProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 8);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
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

  const handleSelect = (index: number) => {
    if (controlledIndex === undefined) setInternalIndex(index);
    onSelect?.(index);
  };

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>Belum ada foto panduan porsi untuk makanan ini.</p>
      </div>
    );
  }

  const activePhoto = photos[activeIndex];
  const needsScroll = photos.length > 5;

  return (
    <div className="space-y-6">
      {/* Main Focus Photo */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="aspect-[4/3] md:aspect-[16/9] bg-muted/10 relative group">
          {activePhoto.image_url ? (
            <img
              key={activePhoto.id}
              src={activePhoto.image_url}
              alt={activePhoto.label}
              className="w-full h-full object-contain animate-fade-in"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 animate-fade-in">
              <ImageIcon className="w-16 h-16 mb-2" />
              <span>[Gambar {activePhoto.label} tidak tersedia]</span>
            </div>
          )}
          
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 animate-slide-up">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-white font-display font-bold text-2xl md:text-3xl mb-1">
                  {activePhoto.label} &middot; {activePhoto.weight_gram} gram
                </h3>
                <p className="text-white/80 text-sm md:text-base">
                  {activePhoto.description || `Porsi ${activePhoto.label}`}
                </p>
              </div>
              <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {photoType}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Pilih variasi ukuran:</p>
        <div className="relative">
          {needsScroll && showLeftArrow && (
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-foreground hover:bg-white transition-colors"
              aria-label="Scroll kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {needsScroll && showRightArrow && (
            <button
              onClick={() => scrollBy("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-foreground hover:bg-white transition-colors"
              aria-label="Scroll kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div
            ref={scrollRef}
            className={
              photoType === "series"
                ? "flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
                : "grid gap-3 grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            }
          >
            {photos.map((photo, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={photo.id}
                  onClick={() => handleSelect(index)}
                  className={`relative shrink-0 snap-center rounded-xl overflow-hidden border-2 transition-all duration-300 outline-none ${
                    photoType === "series" ? "w-24 h-24 md:w-32 md:h-32" : "aspect-square w-full"
                  } ${
                    isActive
                      ? "border-primary ring-4 ring-primary/20 scale-105 z-10 shadow-md"
                      : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
                  }`}
                >
                  {photo.thumbnail_url || photo.image_url ? (
                    <img
                      src={photo.thumbnail_url || photo.image_url}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground/50 font-bold">
                      {photo.label}
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10"></div>
                  )}
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
      </div>
    </div>
  );
}
