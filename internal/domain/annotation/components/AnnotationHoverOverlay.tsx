"use client";

import { useEffect } from "react";
import { usePublishedAnnotation, usePublishedAnnotationsByFood } from "../hooks/useAnnotationQueries";
import { AnnotatedFoodViewer } from "./AnnotatedFoodViewer";
import type { FoodImage } from "../types/annotation";

type AnnotationHoverOverlayProps = {
  foodImageId?: string | null;
  foodId?: string | null;
  visiblePolygons?: boolean;
  selectedAreaId?: string | null;
  onAreaSelect?: (area: FoodImage["areas"][number]) => void;
  onLoadedAreas?: (areas: FoodImage["areas"]) => void;
};

/**
 * Overlay polygon interaktif di atas foto porsi (Intake24 style).
 * Menampilkan poligon bagian makanan dengan highlight dan badge informatif.
 */
export function AnnotationHoverOverlay({
  foodImageId,
  visiblePolygons = true,
  selectedAreaId,
  onAreaSelect,
  onLoadedAreas,
}: AnnotationHoverOverlayProps) {
  // Ambil detail anotasi terpublikasi khusus foto ini
  const detailQuery = usePublishedAnnotation(foodImageId || undefined);
  const image = foodImageId ? detailQuery.data : null;

  useEffect(() => {
    if (image?.status === "published" && image?.areas) {
      onLoadedAreas?.(image.areas);
    } else {
      onLoadedAreas?.([]);
    }
  }, [image?.status, image?.areas, onLoadedAreas]);

  if (!image || image.status !== "published") return null;
  if (!image.areas || image.areas.length === 0) return null;

  return (
    <AnnotatedFoodViewer
      image={image}
      overlay
      visiblePolygons={visiblePolygons}
      selectedAreaId={selectedAreaId}
      onAreaSelect={onAreaSelect}
    />
  );
}
