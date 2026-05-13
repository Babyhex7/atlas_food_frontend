import type { CalculatedNutrient } from "../types/nutrition";

export function useNutritionCalculation(nutrientsPer100g: CalculatedNutrient[], portionGram: number) {
  return nutrientsPer100g.map((nutrient) => ({
    ...nutrient,
    value: Math.round((nutrient.value / 100) * portionGram * 10) / 10,
  }));
}
