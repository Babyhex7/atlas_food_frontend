import { apiClient } from "@/internal/pkg/api";
import type { NutrientType, NutrientUnit } from "../types/nutrition";

export function getNutrientUnits() {
  return apiClient<NutrientUnit[]>("/nutrient-units");
}

export function getNutrientTypes() {
  return apiClient<NutrientType[]>("/nutrient-types");
}
