import { apiClient, apiUpload } from "@/internal/pkg/api";
import { annotationEndpoints } from "./annotationEndpoints";
import type {
  CreateFoodImageRequest,
  FoodImage,
  FoodImageListResponse,
  FoodImageSummary,
  ReplaceAreasRequest,
  ReplaceAreasResponse,
  UpdateFoodImageRequest,
  UploadResponse,
  AnnotationStatus,
} from "../types/annotation";

// ============ ADMIN ============

export type ListAnnotationsParams = {
  status?: AnnotationStatus | "";
  search?: string;
  primary_food_id?: string;
  page?: number;
  limit?: number;
};

export function listAnnotations(params: ListAnnotationsParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.primary_food_id) query.set("primary_food_id", params.primary_food_id);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiClient<FoodImageListResponse>(
    qs ? `${annotationEndpoints.admin.list}?${qs}` : annotationEndpoints.admin.list
  );
}

export function getAnnotation(id: string) {
  return apiClient<FoodImage>(annotationEndpoints.admin.detail(id));
}

export function createAnnotation(payload: CreateFoodImageRequest) {
  return apiClient<FoodImage>(annotationEndpoints.admin.list, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAnnotation(id: string, payload: UpdateFoodImageRequest) {
  return apiClient<FoodImage>(annotationEndpoints.admin.detail(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** Dipakai autosave editor — mengirim seluruh state area sekaligus */
export function replaceAreas(id: string, payload: ReplaceAreasRequest) {
  return apiClient<ReplaceAreasResponse>(annotationEndpoints.admin.areas(id), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function publishAnnotation(id: string) {
  return apiClient<FoodImage>(annotationEndpoints.admin.publish(id), { method: "POST" });
}

export function unpublishAnnotation(id: string) {
  return apiClient<FoodImage>(annotationEndpoints.admin.unpublish(id), { method: "POST" });
}

export function deleteAnnotation(id: string) {
  return apiClient<{ message: string }>(annotationEndpoints.admin.detail(id), { method: "DELETE" });
}

/** Upload gambar scene ke /uploads/annotations */
export function uploadAnnotationImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", "annotations");
  return apiUpload<UploadResponse>(annotationEndpoints.upload, formData);
}

// ============ PUBLIC (respondent) ============

export function listPublishedAnnotations(page = 1, limit = 20) {
  return apiClient<FoodImageListResponse>(
    `${annotationEndpoints.public.list}?page=${page}&limit=${limit}`
  );
}

export function getPublishedAnnotation(id: string) {
  return apiClient<FoodImage>(annotationEndpoints.public.detail(id));
}

export function listPublishedAnnotationsByFood(foodId: string) {
  return apiClient<FoodImageSummary[]>(annotationEndpoints.public.byFood(foodId));
}
