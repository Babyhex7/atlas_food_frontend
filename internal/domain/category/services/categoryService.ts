import { apiClient } from "@/internal/pkg/api";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/category";

// apiClient mengambil token dari cookie bila argumen token tidak diberikan,
// jadi komponen tidak perlu meneruskan token secara manual.

/** Kategori publik — dipakai Find Food dan filter pencarian */
export function getCategories() {
  return apiClient<Category[]>("/public/categories");
}

/** Daftar kategori untuk panel admin */
export function getAdminCategories(token?: string) {
  return apiClient<Category[]>("/admin/categories", { token });
}

export function getCategoryById(id: string, token?: string) {
  return apiClient<Category>(`/admin/categories/${id}`, { token });
}

export function createCategory(payload: CreateCategoryRequest, token?: string) {
  return apiClient<Category>("/admin/categories", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id: string, payload: UpdateCategoryRequest, token?: string) {
  return apiClient<Category>(`/admin/categories/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id: string, token?: string) {
  return apiClient<{ message: string }>(`/admin/categories/${id}`, {
    method: "DELETE",
    token,
  });
}
