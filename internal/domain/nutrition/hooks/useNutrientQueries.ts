"use client";

import { useQuery } from "@tanstack/react-query";
import { getNutrientTypes, getNutrientUnits } from "../services/nutritionService";

export const nutrientKeys = {
  all: ["nutrients"] as const,
  types: () => ["nutrients", "types"] as const,
  units: () => ["nutrients", "units"] as const,
};

export function useNutrientTypes() {
  return useQuery({
    queryKey: nutrientKeys.types(),
    queryFn: () => getNutrientTypes(),
    staleTime: 1000 * 60 * 30, // 30 menit (tipe nutrisi jarang berubah)
  });
}

export function useNutrientUnits() {
  return useQuery({
    queryKey: nutrientKeys.units(),
    queryFn: () => getNutrientUnits(),
    staleTime: 1000 * 60 * 30,
  });
}
