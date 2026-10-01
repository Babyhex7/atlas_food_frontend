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
  foodId,
  visiblePolygons = true,
  selectedAreaId,
  onAreaSelect,
  onLoadedAreas,
}: AnnotationHoverOverlayProps) {
  // Ambil detail berdasarkan foodImageId jika ada
  const detailQuery = usePublishedAnnotation(foodImageId || undefined);

  // Fallback: jika foodImageId tidak ada di photo porsi lama, ambil dari published annotations milik foodId
  const byFoodQuery = usePublishedAnnotationsByFood(!foodImageId && foodId ? foodId : undefined);

  const fallbackImageId = byFoodQuery.data?.[0]?.id;
  const fallbackDetailQuery = usePublishedAnnotation(
    !foodImageId && fallbackImageId ? fallbackImageId : undefined
  );

  const image = foodImageId ? detailQuery.data : fallbackDetailQuery.data;

  useEffect(() => {
    if (image?.areas) {
      onLoadedAreas?.(image.areas);
    }
  }, [image?.areas, onLoadedAreas]);

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
