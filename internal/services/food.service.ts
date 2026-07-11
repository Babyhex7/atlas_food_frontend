import { apiClient } from "@/internal/lib/axios";
import type { FoodSearchResult, FoodDetail } from "@/internal/types/food.types";

/** Search makanan — wajib login (JWT via apiClient) */
export async function searchFoodsPublic(query: string, type?: "food" | "drink" | "", limit = 20): Promise<FoodSearchResult[]> {
  const { data } = await apiClient.get("/public/foods/search", {
    params: { q: query, type, limit },
  });
  return data.data;
}

/** Detail makanan + foto porsi — wajib login */
export async function getFoodDetailPublic(foodId: string): Promise<FoodDetail> {
  const { data } = await apiClient.get(`/public/foods/${foodId}`);
  return data.data;
}

export { getFoodDetailPublic as getFoodPublic };

/** List kategori — wajib login */
export async function getCategoriesPublic() {
  const { data } = await apiClient.get("/public/categories");
  return data.data;
}

/** List makanan per kategori — wajib login */
export async function getFoodsByCategoryPublic(categoryCode: string, page = 1, limit = 24) {
  const { data } = await apiClient.get(`/public/categories/${categoryCode}/foods`, {
    params: { page, limit },
  });
  return data.data;
}
