import { publicApiClient } from "@/internal/lib/axios";
import type { FoodSearchResult, FoodDetail } from "@/internal/types/food.types";

// ── Search makanan (public, no login) ─────────────────────────
export async function searchFoodsPublic(query: string, limit = 20): Promise<FoodSearchResult[]> {
  const { data } = await publicApiClient.get("/public/foods/search", {
    params: { q: query, limit },
  });
  return data.data;
}

// ── Get detail makanan + foto porsi (public) ──────────────────
export async function getFoodDetailPublic(foodId: string): Promise<FoodDetail> {
  const { data } = await publicApiClient.get(`/public/foods/${foodId}`);
  return data.data;
}

// ── List kategori (public) ────────────────────────────────────
export async function getCategoriesPublic() {
  const { data } = await publicApiClient.get("/public/categories");
  return data.data;
}

// ── List makanan per kategori (public) ────────────────────────
export async function getFoodsByCategoryPublic(categoryCode: string, page = 1, limit = 24) {
  const { data } = await publicApiClient.get(`/public/categories/${categoryCode}/foods`, {
    params: { page, limit },
  });
  return data.data;
}
