"use client";

import { useState } from "react";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { areaColor } from "../constants/annotationStatus";
import { toSvgPoints } from "../utils/polygonMath";
import type { FoodImage } from "../types/annotation";

type AnnotatedFoodViewerProps = {
  image: FoodImage;
  /** Mode overlay di gallery: sembunyikan hint/klik, fokusakan hover area */
  overlay?: boolean;
  onAreaSelect?: (area: FoodImage["areas"][number]) => void;
};

/**
 * Tampilan anotasi untuk responden — read-only.
 * Hover hanya di polygon area (bukan full image).
 */
export function AnnotatedFoodViewer({ image, overlay = false, onAreaSelect }: AnnotatedFoodViewerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const src = image.image_url.startsWith("http")
    ? image.image_url
    : `${API_ASSET_ORIGIN}${image.image_url}`;

  const areas = image.areas ?? [];
  const highlightedId = hoverId ?? activeId;
  const highlighted = areas.find((area) => area.id === highlightedId) ?? null;

  function handleSelect(area: FoodImage["areas"][number]) {
    setActiveId(area.id);
    onAreaSelect?.(area);
  }

  return (
    <div className={overlay ? "absolute inset-0 pointer-events-none" : "flex flex-col gap-2"}>
      <div
        className={
          overlay
            ? "absolute inset-0"
            : "relative overflow-hidden rounded-md border border-border bg-surface-alt"
        }
      >
        <svg
          viewBox={`0 0 ${image.width} ${image.height}`}
          preserveAspectRatio="xMidYMid meet"
          className={overlay ? "absolute inset-0 w-full h-full pointer-events-none" : "block w-full h-auto"}
          role="group"
          aria-label={`Area makanan pada ${image.title}`}
        >
          {!overlay && (
            <image href={src} x={0} y={0} width={image.width} height={image.height} />
          )}

          {areas.map((area, index) => {
            const color = areaColor(index);
            const isHot = area.id === highlightedId;

            return (
              <polygon
                key={area.id}
                points={toSvgPoints(area.polygon)}
                fill={color}
                fillOpacity={isHot ? 0.42 : overlay ? 0.08 : 0.12}
                stroke={color}
                strokeWidth={isHot ? 3.5 : 2}
                strokeLinejoin="round"
                className="cursor-pointer transition-[fill-opacity,stroke-width,transform] duration-200 ease-out origin-center pointer-events-auto"
                style={isHot ? { filter: "drop-shadow(0 0 6px rgba(0,0,0,0.25))" } : undefined}
                tabIndex={0}
                role="button"
                aria-label={area.name}
                aria-pressed={area.id === activeId}
                onMouseEnter={() => setHoverId(area.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(area.id)}
                onBlur={() => setHoverId(null)}
                onClick={() => handleSelect(area)}
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

        {overlay && highlighted && (
          <div className="absolute left-3 bottom-3 z-10 pointer-events-none animate-fade-in">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/75 text-white text-sm font-semibold shadow-md">
              {highlighted.name}
            </span>
          </div>
        )}
      </div>

      {!overlay && (
        highlighted ? (
          <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-surface">
            <span className="text-sm font-semibold text-text-primary">{highlighted.name}</span>
            {highlighted.food_id && (
              <a href={`/find-food/${highlighted.food_id}`} className="btn btn-outline btn-xs ml-auto">
                Lihat detail gizi
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-muted m-0">
            Arahkan kursor ke bagian makanan untuk melihat namanya.
          </p>
        )
      )}
    </div>
  );
}
