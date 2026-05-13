import { apiClient } from "@/internal/pkg/api";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/category";

export function getCategories() {
  return apiClient<Category[]>("/categories");
}

export function createCategory(payload: CreateCategoryRequest, token: string) {
  return apiClient<Category>("/admin/categories", { method: "POST", token, body: JSON.stringify(payload) });
}

export function updateCategory(id: string, payload: UpdateCategoryRequest, token: string) {
  return apiClient<Category>(`/admin/categories/${id}`, { method: "PUT", token, body: JSON.stringify(payload) });
}
