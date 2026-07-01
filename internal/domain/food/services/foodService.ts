import { apiClient } from "@/internal/pkg/api";
import { apiEndpoints } from "@/internal/pkg/api/endpoints";
import type { CreateFoodRequest, Food, UpdateFoodRequest } from "../types/food";
import type { SearchFoodResult, FoodDetail } from "../types/food";

// ============ PUBLIC (Respondent) ============

/**
 * searchFoodsPublic - Free search makanan/minuman untuk Step 2
 * @param query - kata kunci pencarian bebas
 * @param type  - "food" | "drink" | "" (kosong = semua)
 * @param limit - max hasil (default 10)
 */
export function searchFoodsPublic(query: string, type?: "food" | "drink" | "", limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (type) params.set("type", type);
  return apiClient<SearchFoodResult[]>(`${apiEndpoints.public.foodSearch}?${params.toString()}`);
}

/**
 * getFoodPublic - Get detail makanan + portion photos untuk Step 3
 */
export function getFoodPublic(id: string) {
  return apiClient<FoodDetail>(apiEndpoints.public.foodDetail(id));
}

// ============ ADMIN ============

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
