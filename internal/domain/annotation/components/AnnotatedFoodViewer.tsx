"use client";

import { useState } from "react";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { areaColor } from "../constants/annotationStatus";
import { polygonCentroid, toSvgPoints } from "../utils/polygonMath";
import type { FoodImage } from "../types/annotation";

type AnnotatedFoodViewerProps = {
  image: FoodImage;
  /** Mode overlay di gallery: sembunyikan border container/klik, fokuskan hover area */
  overlay?: boolean;
  /** Apakah poligon terlihat jelas saat diam (default: true agar tidak membingungkan pengguna) */
  visiblePolygons?: boolean;
  /** Tampilkan label teks di atas poligon (default: true) */
  showLabels?: boolean;
  /** ID area yang sedang disorot/dipilih dari komponen luar (misal chip list) */
  selectedAreaId?: string | null;
  onAreaSelect?: (area: FoodImage["areas"][number]) => void;
};

/**
 * Tampilan anotasi untuk responden dan pratinjau admin — read-only.
 * Poligon kini tampak dengan jelas secara default (bukan 0% transparan).
 */
export function AnnotatedFoodViewer({
  image,
  overlay = false,
  visiblePolygons = true,
  showLabels = true,
  selectedAreaId = null,
  onAreaSelect,
}: AnnotatedFoodViewerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const src = image.image_url.startsWith("http")
    ? image.image_url
    : `${API_ASSET_ORIGIN}${image.image_url}`;

  const areas = image.areas ?? [];
  const highlightedId = hoverId ?? activeId ?? selectedAreaId;
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
            <image href={src} xlinkHref={src} x={0} y={0} width={image.width} height={image.height} />
          )}

          {areas.map((area, index) => {
            const color = areaColor(index);
            const isHot = area.id === highlightedId;

            // Garis tajam dihilangkan total — murni pendaran kabut blur lembut (full blur glow)
            const isVisible = overlay ? (visiblePolygons && isHot) : (visiblePolygons || isHot);
            const strokeOpacity = isVisible ? (isHot ? 0.85 : 0.5) : 0;
            const strokeWidth = isHot ? 5 : 2;

            return (
              <polygon
                key={area.id}
                points={toSvgPoints(area.polygon)}
                fill="transparent"
                fillOpacity={0}
                stroke={color}
                strokeOpacity={strokeOpacity}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="cursor-pointer transition-[stroke-width,stroke-opacity,filter] duration-200 ease-out pointer-events-auto"
                style={{
                  pointerEvents: visiblePolygons ? "all" : "none",
                  filter: isHot
                    ? `blur(4px) drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color})`
                    : isVisible
                    ? `blur(2px) drop-shadow(0 0 6px ${color}88)`
                    : "none",
                }}
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

          {/* Label area di tengah centroid masing-masing poligon (hanya di admin preview jika showLabels aktif) */}
          {showLabels &&
            !overlay &&
            areas.map((area, index) => {
              const centroid = polygonCentroid(area.polygon);
              if (!centroid) return null;
              const isHot = area.id === highlightedId;
              const isLabelVisible = visiblePolygons && (showLabels || isHot);

              if (!isLabelVisible) return null;

              const color = areaColor(index);
              const labelText =
                area.weight_gram != null && area.weight_gram > 0
                  ? `${area.name} (${area.weight_gram}g)`
                  : area.name;
              const pillWidth = Math.max(70, Math.min(150, labelText.length * 7.5 + 24));
              const pillHeight = 24;

              return (
                <g key={`label-${area.id}`} className="pointer-events-none transition-opacity animate-fade-in">
                  <rect
                    x={centroid[0] - pillWidth / 2}
                    y={centroid[1] - pillHeight / 2}
                    width={pillWidth}
                    height={pillHeight}
                    rx={pillHeight / 2}
                    fill="rgba(0, 0, 0, 0.85)"
                    stroke={color}
                    strokeWidth={isHot ? 2 : 1}
                    className="backdrop-blur-sm"
                  />
                  <text
                    x={centroid[0]}
                    y={centroid[1] + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={11}
                    fontWeight="600"
                    className="select-none"
                  >
                    {labelText.length > 18 ? `${labelText.slice(0, 17)}…` : labelText}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {!overlay && (
        highlighted ? (
          <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-surface animate-fade-in">
            <span className="text-sm font-semibold text-text-primary">{highlighted.name}</span>
            {highlighted.weight_gram != null && highlighted.weight_gram > 0 && (
              <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-0.5 rounded-full border border-primary/20">
                {highlighted.weight_gram} gram
              </span>
            )}
            {highlighted.food_id && (
              <a href={`/find-food/${highlighted.food_id}`} className="btn btn-outline btn-xs ml-auto">
                Lihat detail gizi
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs text-text-muted m-0">
            Arahkan kursor atau klik bagian makanan untuk melihat rincian berat gram.
          </p>
        )
      )}
    </div>
  );
}
