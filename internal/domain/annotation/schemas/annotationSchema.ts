import { z } from "zod";
import { MAX_POLYGON_POINTS, MIN_POLYGON_POINTS } from "../constants/annotationStatus";

/** Satu titik polygon: tuple [x, y] */
export const pointSchema = z.tuple([z.number(), z.number()]);

/**
 * Polygon yang siap di-publish.
 * Aturannya sengaja dibuat sama persis dengan validate.go di backend —
 * kalau salah satu berubah, keduanya harus berubah bersamaan.
 */
export const polygonSchema = z
  .array(pointSchema)
  .min(MIN_POLYGON_POINTS, `Polygon minimal ${MIN_POLYGON_POINTS} titik`)
  .max(MAX_POLYGON_POINTS, `Polygon maksimal ${MAX_POLYGON_POINTS} titik`);

export const areaSchema = z.object({
  name: z.string().trim().min(1, "Nama area wajib diisi").max(255, "Nama area maksimal 255 karakter"),
  foodId: z.string().nullable(),
  polygon: polygonSchema,
});

export const createAnnotationSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(255, "Judul maksimal 255 karakter"),
  primaryFoodId: z.string().nullable().optional(),
});

export const updateAnnotationSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(255, "Judul maksimal 255 karakter"),
  primaryFoodId: z.string().nullable().optional(),
});

export type CreateAnnotationFormValues = z.infer<typeof createAnnotationSchema>;
export type UpdateAnnotationFormValues = z.infer<typeof updateAnnotationSchema>;

/**
 * Cek kesiapan publish di sisi klien agar admin tahu sebelum menekan tombol.
 * Server tetap memvalidasi ulang — ini murni untuk umpan balik cepat.
 */
export function collectPublishIssues(
  areas: { name: string; polygon: unknown[] }[]
): string[] {
  const issues: string[] = [];

  if (areas.length === 0) {
    issues.push("Belum ada area yang dianotasi");
  }

  areas.forEach((area, index) => {
    const label = area.name.trim() || `Area ${index + 1}`;

    if (!area.name.trim()) {
      issues.push(`${label}: nama masih kosong`);
    }
    if (area.polygon.length < MIN_POLYGON_POINTS) {
      issues.push(`${label}: baru ${area.polygon.length} titik, minimal ${MIN_POLYGON_POINTS}`);
    }
  });

  return issues;
}
