"use client";

import { usePublishedAnnotation } from "../hooks/useAnnotationQueries";
import { AnnotatedFoodViewer } from "./AnnotatedFoodViewer";

type AnnotationHoverOverlayProps = {
  foodImageId?: string | null;
};

/**
 * Overlay polygon di atas foto gallery — hover hanya di area anotasi.
 * Tidak menampilkan blok "Kenali bagiannya" terpisah.
 */
export function AnnotationHoverOverlay({ foodImageId }: AnnotationHoverOverlayProps) {
  const { data: image } = usePublishedAnnotation(foodImageId || undefined);

  if (!foodImageId || !image || image.status !== "published") return null;
  if (!image.areas || image.areas.length === 0) return null;

  return <AnnotatedFoodViewer image={image} overlay />;
}
