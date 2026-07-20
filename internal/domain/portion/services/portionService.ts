import { apiClient, apiUpload } from "@/internal/pkg/api";
import type { AsServedImage, AsServedSet, FoodPortionSizeMethod } from "../types/portion";

/**
 * Klien API porsi.
 *
 * Semua path di sini sudah dicocokkan dengan route yang benar-benar terdaftar
 * di backend. Versi sebelumnya menunjuk endpoint yang tidak ada
 * (/foods/:id/portion-methods, /portion-methods/:id/options), sehingga setiap
 * pemanggilan berakhir 404.
 */

// ============ AS-SERVED SET ============

export type AsServedSetDetail = AsServedSet & { images: AsServedImage[] };

export function getAsServedSets() {
  return apiClient<AsServedSet[]>("/admin/as-served-sets");
}

export function getAsServedSet(id: string) {
  return apiClient<AsServedSetDetail>(`/admin/as-served-sets/${id}`);
}

export type AsServedSetPayload = {
  code: string;
  name: string;
  description?: string;
  category?: string;
  food_id?: string;
};

export function createAsServedSet(payload: AsServedSetPayload) {
  return apiClient<AsServedSet>("/admin/as-served-sets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAsServedSet(id: string, payload: Partial<AsServedSetPayload>) {
  return apiClient<AsServedSet>(`/admin/as-served-sets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAsServedSet(id: string) {
  return apiClient<{ message: string }>(`/admin/as-served-sets/${id}`, { method: "DELETE" });
}

// ============ AS-SERVED IMAGE ============

export type AsServedImagePayload = {
  label: string;
  image_url: string;
  thumbnail_url?: string;
  weight_gram: number;
  description?: string;
  display_order?: number;
};

/** Endpoint menerima array — satu request cukup untuk unggah batch */
export function addAsServedImages(setId: string, images: AsServedImagePayload[]) {
  return apiClient<AsServedImage[]>(`/admin/as-served-sets/${setId}/images`, {
    method: "POST",
    body: JSON.stringify(images),
  });
}

export function updateAsServedImage(imageId: string, payload: Partial<AsServedImagePayload>) {
  return apiClient<AsServedImage>(`/admin/as-served-images/${imageId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAsServedImage(imageId: string) {
  return apiClient<{ message: string }>(`/admin/as-served-images/${imageId}`, { method: "DELETE" });
}

/** Unggah foto porsi ke /uploads/as-served */
export function uploadAsServedPhoto(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", "as-served");
  return apiUpload<{ url: string; filename: string }>("/upload", formData);
}

// ============ PORTION METHOD ============

export function getAdminFoodPortionMethods(foodId: string) {
  return apiClient<FoodPortionSizeMethod[]>(`/admin/foods/${foodId}/portion-methods`);
}

export type PortionMethodPayload = {
  method_type: "as_served" | "guide_image" | "weight";
  label: string;
  description?: string;
  image_url?: string;
  config: unknown;
};

export function addPortionMethod(foodId: string, payload: PortionMethodPayload) {
  return apiClient<FoodPortionSizeMethod>(`/admin/foods/${foodId}/portion-methods`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePortionMethod(methodId: number, payload: Partial<PortionMethodPayload>) {
  return apiClient<FoodPortionSizeMethod>(`/admin/portion-methods/${methodId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePortionMethod(methodId: number) {
  return apiClient<{ message: string }>(`/admin/portion-methods/${methodId}`, { method: "DELETE" });
}
