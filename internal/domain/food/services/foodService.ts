import { apiClient } from "@/internal/pkg/api";
import type { CreateFoodRequest, Food, UpdateFoodRequest } from "../types/food";

export function searchFoods(query: string) {
  return apiClient<Food[]>(`/foods/search?q=${encodeURIComponent(query)}`);
}

export function getFoodById(id: string) {
  return apiClient<Food>(`/foods/${id}`);
}

export function getAdminFoods(token: string) {
  return apiClient<Food[]>("/admin/foods", { token });
}

export function createFood(payload: CreateFoodRequest, token: string) {
  return apiClient<Food>("/admin/foods", { method: "POST", token, body: JSON.stringify(payload) });
}

export function updateFood(id: string, payload: UpdateFoodRequest, token: string) {
  return apiClient<Food>(`/admin/foods/${id}`, { method: "PUT", token, body: JSON.stringify(payload) });
}

export function deleteFood(id: string, token: string) {
  return apiClient<{ message: string }>(`/admin/foods/${id}`, { method: "DELETE", token });
}
