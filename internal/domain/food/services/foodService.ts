import { apiClient } from "@/internal/pkg/api";
import { apiEndpoints } from "@/internal/pkg/api/endpoints";
import type { CreateFoodRequest, Food, UpdateFoodRequest, AssociatedFood, SetAssociatedFoodsRequest } from "../types/food";
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

/**
 * getPublicAssociatedFoods - Get pelengkap cepat yang dikaitkan ke makanan
 */
export function getPublicAssociatedFoods(foodId: string) {
  return apiClient<AssociatedFood[]>(apiEndpoints.public.associatedFoods(foodId));
}

// ============ ADMIN ============

export function getAdminAssociatedFoods(foodId: string) {
  return apiClient<AssociatedFood[]>(apiEndpoints.admin.associatedFoods(foodId));
}

export function setAdminAssociatedFoods(foodId: string, payload: SetAssociatedFoodsRequest) {
  return apiClient<AssociatedFood[]>(apiEndpoints.admin.associatedFoods(foodId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function searchFoods(query: string) {
  return apiClient<Food[]>(`/foods/search?q=${encodeURIComponent(query)}`);
}

export function getFoodById(id: string) {
  return apiClient<Food>(`/foods/${id}`);
}

/**
 * Daftar makanan untuk panel admin.
 *
 * Backend membungkus hasilnya sebagai { foods, pagination } — bukan array
 * telanjang. Mengetiknya sebagai Food[] membuat daftar selalu tampak kosong.
 */
export type AdminFoodListResponse = {
  foods: Food[];
  pagination: { page: number; limit: number; total: number };
};

export function getAdminFoods(
  params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    photo_type?: string;
    is_active?: string;
  } = {}
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.photo_type) query.set("photo_type", params.photo_type);
  if (params.is_active) query.set("is_active", params.is_active);

  const qs = query.toString();
  return apiClient<AdminFoodListResponse>(qs ? `/admin/foods?${qs}` : "/admin/foods");
}

export function getAdminFoodById(id: string) {
  return apiClient<Food>(`/admin/foods/${id}`);
}

export function createFood(payload: CreateFoodRequest, token?: string) {
  return apiClient<Food>("/admin/foods", { method: "POST", token, body: JSON.stringify(payload) });
}

export function updateFood(id: string, payload: UpdateFoodRequest, token?: string) {
  return apiClient<Food>(`/admin/foods/${id}`, { method: "PUT", token, body: JSON.stringify(payload) });
}

export function deleteFood(id: string, token?: string) {
  return apiClient<{ message: string }>(`/admin/foods/${id}`, { method: "DELETE", token });
}
