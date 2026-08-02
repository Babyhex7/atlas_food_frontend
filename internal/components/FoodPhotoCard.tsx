"use client";

/**
 * FoodPhotoCard — card makanan dengan foto preview porsi pertama.
 *
 * Dipakai di:
 *   - /find-food/category/[code] (daftar makanan per kategori)
 *   - Hasil pencarian global (opsional)
 *
 * Foto preview diambil dari endpoint GET /public/foods/:id
 * menggunakan lazy fetch — hanya dimuat saat card terlihat (IntersectionObserver).
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, UtensilsCrossed, Image as ImageIcon } from "lucide-react";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { getImageUrl, isGuideType, buildPhotoUrl } from "@/internal/lib/image";
import { cn } from "@/internal/lib/cn";

interface FoodPhotoCardProps {
  food: FoodSearchResult;
  /** href tujuan saat card diklik, default /find-food/:id */
  href?: string;
  /** Tambahkan room param untuk collab session */
  roomParam?: string | null;
  /** Foto pertama dari API — opsional, dikirim dari parent kalau sudah punya data */
  previewImageUrl?: string | null;
}

// ─── Preview foto kecil dengan lazy load & fallback ───────────────────────────
function PreviewPhoto({
  src,
  foodCode,
  categoryCode,
  photoType,
}: {
  src?: string | null;
  foodCode: string;
  categoryCode: string;
  photoType: string;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Kalau src tidak dikirim, coba derive dari naming convention
  const derivedUrl = src
    ? getImageUrl(src)
    : isGuideType(photoType)
      ? buildPhotoUrl(categoryCode, foodCode, "guide")
      : buildPhotoUrl(categoryCode, foodCode, "A");

  if (!derivedUrl || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-primary-light">
        <UtensilsCrossed className="w-6 h-6 text-primary/40" />
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-light animate-pulse">
          <ImageIcon className="w-5 h-5 text-primary/30" />
        </div>
      )}
      <img
        src={derivedUrl}
        alt={`${foodCode} preview`}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        loading="lazy"
      />
    </>
  );
}

// ─── Badge tipe foto ──────────────────────────────────────────────────────────
function PhotoTypeBadge({ photoType }: { photoType: string }) {
  const isGuide = isGuideType(photoType);
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider",
        isGuide
          ? "bg-amber-100 text-amber-700 border border-amber-200"
          : "bg-blue-50 text-blue-600 border border-blue-100"
      )}
    >
      {isGuide ? "Guide" : "Series"}
    </span>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function FoodPhotoCard({ food, href, roomParam, previewImageUrl }: FoodPhotoCardProps) {
  const dest =
    href ??
    (() => {
      const params = new URLSearchParams();
      if (roomParam) params.set("room", roomParam);
      const qs = params.toString();
      return qs ? `/find-food/${food.id}?${qs}` : `/find-food/${food.id}`;
    })();

  const categoryCode = food.category?.code ?? "";

  return (
    <Link
      href={dest}
      className="group flex flex-col rounded-2xl border-[1.5px] border-border bg-surface no-underline overflow-hidden transition-base hover:border-primary-border hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Foto preview */}
      <div className="relative aspect-[4/3] bg-primary-light overflow-hidden">
        <PreviewPhoto
          src={previewImageUrl}
          foodCode={food.code}
          categoryCode={categoryCode}
          photoType={food.photo_type}
        />

        {/* Overlay kode + badge tipe */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <span className="bg-black/60 text-white text-[10px] font-mono font-bold px-2 py-[3px] rounded-md leading-none backdrop-blur-sm">
            {food.code}
          </span>
          <PhotoTypeBadge photoType={food.photo_type} />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 shadow-lg">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-text-primary m-0 leading-snug line-clamp-2">
          {food.name}
        </h3>
        {food.local_name && (
          <p className="text-xs text-text-muted m-0 italic line-clamp-1">{food.local_name}</p>
        )}
        {food.category?.name && (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
              <span className="text-base leading-none">{food.category?.icon ?? "🍽️"}</span>
              {food.category.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
