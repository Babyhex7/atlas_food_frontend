import type { AnnotationStatus } from "../types/annotation";

/** Minimal titik agar polygon punya luas — harus sama dengan MinPolygonPoints di backend */
export const MIN_POLYGON_POINTS = 3;

/** Batas atas titik per polygon — harus sama dengan MaxPolygonPoints di backend */
export const MAX_POLYGON_POINTS = 500;

/** Jeda autosave (ms) sesuai brief §8.2 */
export const AUTOSAVE_DEBOUNCE_MS = 1500;

/** Batas zoom kanvas editor */
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 8;
export const ZOOM_STEP = 1.25;

/** Radius klik vertex dalam pixel layar — dikonversi ke pixel gambar saat hit-test */
export const VERTEX_HIT_RADIUS_PX = 10;

export const ANNOTATION_STATUS_LABEL: Record<AnnotationStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Arsip",
};

/** Kelas badge dari design system (styles/globals.css) — bukan token mentah */
export const ANNOTATION_STATUS_CLASS: Record<AnnotationStatus, string> = {
  draft: "badge badge-warning",
  published: "badge badge-success",
  archived: "badge badge-default",
};

/**
 * Palet warna area. Indeks dipilih dari urutan area agar dua region
 * bertetangga tidak pernah sewarna dan tetap konsisten antar render.
 */
export const AREA_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
] as const;

export function areaColor(index: number): string {
  return AREA_COLORS[index % AREA_COLORS.length];
}
