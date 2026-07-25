import { apiClient, apiUpload } from "@/internal/pkg/api";
import type {
  CreateFoodPhotoPayload,
  FoodPhoto,
  FoodPhotoListResponse,
  UpdateFoodPhotoPayload,
} from "../types/foodPhoto";

export function listFoodPhotos(foodId: string) {
  return apiClient<FoodPhotoListResponse>(`/admin/foods/${foodId}/photos`);
}

export function createFoodPhoto(foodId: string, payload: CreateFoodPhotoPayload) {
  return apiClient<FoodPhoto>(`/admin/foods/${foodId}/photos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateFoodPhoto(foodId: string, photoId: string, payload: UpdateFoodPhotoPayload) {
  return apiClient<FoodPhoto>(`/admin/foods/${foodId}/photos/${photoId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteFoodPhoto(foodId: string, photoId: string) {
  return apiClient<{ message: string }>(`/admin/foods/${foodId}/photos/${photoId}`, {
    method: "DELETE",
  });
}

export function publishFoodPhoto(foodId: string, photoId: string) {
  return apiClient<FoodPhoto>(`/admin/foods/${foodId}/photos/${photoId}/publish`, {
    method: "POST",
  });
}

export function unpublishFoodPhoto(foodId: string, photoId: string) {
  return apiClient<FoodPhoto>(`/admin/foods/${foodId}/photos/${photoId}/unpublish`, {
    method: "POST",
  });
}

/** Upload ke folder annotations — dipakai kartu foto terpadu */
export function uploadFoodPhotoFile(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", "annotations");
  return apiUpload<{ url: string; filename: string }>("/upload", formData);
}
