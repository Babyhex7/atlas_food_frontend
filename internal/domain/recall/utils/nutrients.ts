import type { FoodDetail } from "@/internal/domain/food/types/food";

export type NutrientValues = {
  energy: number;
  protein: number;
  carbs: number;
  fat: number;
};

function nutrientValue(
  nutrients: FoodDetail["nutrients"],
  code: string
): number {
  return nutrients?.[code]?.value ?? 0;
}

/** Kalkulasi gizi per porsi: (nilai/100) × portionGram, bulatkan 1 desimal (PRD Story 15) */
export function calcNutrientsForPortion(
  nutrients: FoodDetail["nutrients"],
  portionGram: number
): NutrientValues {
  const factor = portionGram / 100;
  const round = (v: number) => Math.round(v * 10) / 10;

  return {
    energy: round(nutrientValue(nutrients, "energy") * factor),
    protein: round(nutrientValue(nutrients, "protein") * factor),
    carbs: round(nutrientValue(nutrients, "carbs") * factor),
    fat: round(nutrientValue(nutrients, "fat") * factor),
  };
}
