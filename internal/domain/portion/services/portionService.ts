import { apiClient } from "@/internal/pkg/api";
import type { AsServedImage, AsServedSet, FoodPortionSizeMethod } from "../types/portion";

export function getFoodPortionMethods(foodId: string) {
  return apiClient<FoodPortionSizeMethod[]>(`/foods/${foodId}/portion-methods`);
}

export function getAdminFoodPortionMethods(foodId: string, token: string) {
  return apiClient<FoodPortionSizeMethod[]>(`/admin/foods/${foodId}/portion-methods`, { token });
}

export function getPortionMethodOptions(methodId: number) {
  return apiClient<{ method: FoodPortionSizeMethod; images: AsServedImage[] }>(`/portion-methods/${methodId}/options`);
}

export function getAsServedSets(token: string) {
  return apiClient<AsServedSet[]>("/admin/as-served-sets", { token });
}

export function getAsServedSetImages(code: string) {
  return apiClient<{ set: AsServedSet; images: AsServedImage[] }>(`/as-served-sets/${code}/images`);
}
