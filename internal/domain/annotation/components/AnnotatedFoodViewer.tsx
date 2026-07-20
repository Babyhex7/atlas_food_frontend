"use client";

import { useState } from "react";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { areaColor } from "../constants/annotationStatus";
import { toSvgPoints } from "../utils/polygonMath";
import type { FoodImage } from "../types/annotation";

type AnnotatedFoodViewerProps = {
  image: FoodImage;
  onAreaSelect?: (area: FoodImage["areas"][number]) => void;
};

/**
 * Tampilan anotasi untuk responden — read-only.
 *
 * Murni merender JSON dari public API: tidak ada koordinat yang di-hardcode,
 * sehingga 100 gambar baru tidak butuh perubahan kode apa pun (brief §11).
 * Responden tidak pernah melihat perkakas anotasi.
 */
export function AnnotatedFoodViewer({ image, onAreaSelect }: AnnotatedFoodViewerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const src = image.image_url.startsWith("http")
    ? image.image_url
    : `${API_ASSET_ORIGIN}${image.image_url}`;

  const areas = image.areas ?? [];
  const active = areas.find((area) => area.id === activeId) ?? null;

  function handleSelect(area: FoodImage["areas"][number]) {
    setActiveId(area.id);
    onAreaSelect?.(area);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-md border border-border bg-surface-alt">
        <svg
          viewBox={`0 0 ${image.width} ${image.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto"
          role="group"
          aria-label={`Area makanan pada ${image.title}`}
        >
          <image href={src} x={0} y={0} width={image.width} height={image.height} />

          {areas.map((area, index) => {
            const color = areaColor(index);
            const isActive = area.id === activeId;

            return (
              <polygon
                key={area.id}
                points={toSvgPoints(area.polygon)}
                fill={color}
                fillOpacity={isActive ? 0.4 : 0.12}
                stroke={color}
                strokeWidth={isActive ? 3 : 2}
                strokeLinejoin="round"
                className="cursor-pointer transition-fast focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={area.name}
                aria-pressed={isActive}
                onClick={() => handleSelect(area)}
                // Keyboard: polygon SVG tidak punya aktivasi bawaan seperti
                // <button>, jadi Enter/Space ditangani manual demi a11y.
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelect(area);
                  }
                }}
              />
            );
          })}
        </svg>
      </div>

      {active ? (
        <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-surface">
          <span className="text-sm font-semibold text-text-primary">{active.name}</span>
          {active.food_id && (
            <a href={`/find-food/${active.food_id}`} className="btn btn-outline btn-xs ml-auto">
              Lihat detail gizi
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-muted m-0">
          Klik bagian makanan pada foto untuk melihat namanya.
        </p>
      )}
    </div>
  );
}
