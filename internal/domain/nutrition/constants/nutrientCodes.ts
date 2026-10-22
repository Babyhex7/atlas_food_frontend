import type { NutrientType } from "../types/nutrition";

export const nutrientCodes = {
  energy: "energy",
  protein: "protein",
  carbs: "carbs",
  fat: "fat",
  fiber: "fiber",
  sugar: "sugar",
  sodium: "sodium",
  calcium: "calcium",
  iron: "iron",
  vitaminC: "vit_c",
} as const;

export const DEFAULT_NUTRIENT_TYPES: NutrientType[] = [
  { id: 1, code: "energy", name: "Energi", unit_id: 1, unit: { id: 1, code: "kcal", name: "Kilokalori", symbol: "kkal" }, display_order: 1, is_active: true },
  { id: 2, code: "protein", name: "Protein", unit_id: 2, unit: { id: 2, code: "g", name: "Gram", symbol: "g" }, display_order: 2, is_active: true },
  { id: 3, code: "carbs", name: "Karbohidrat", unit_id: 2, unit: { id: 2, code: "g", name: "Gram", symbol: "g" }, display_order: 3, is_active: true },
  { id: 4, code: "fat", name: "Lemak Total", unit_id: 2, unit: { id: 2, code: "g", name: "Gram", symbol: "g" }, display_order: 4, is_active: true },
  { id: 5, code: "fiber", name: "Serat", unit_id: 2, unit: { id: 2, code: "g", name: "Gram", symbol: "g" }, display_order: 5, is_active: true },
  { id: 6, code: "sugar", name: "Gula", unit_id: 2, unit: { id: 2, code: "g", name: "Gram", symbol: "g" }, display_order: 6, is_active: true },
  { id: 7, code: "sodium", name: "Natrium", unit_id: 3, unit: { id: 3, code: "mg", name: "Miligram", symbol: "mg" }, display_order: 7, is_active: true },
  { id: 8, code: "calcium", name: "Kalsium", unit_id: 3, unit: { id: 3, code: "mg", name: "Miligram", symbol: "mg" }, display_order: 8, is_active: true },
  { id: 9, code: "iron", name: "Zat Besi", unit_id: 3, unit: { id: 3, code: "mg", name: "Miligram", symbol: "mg" }, display_order: 9, is_active: true },
  { id: 10, code: "vit_c", name: "Vitamin C", unit_id: 3, unit: { id: 3, code: "mg", name: "Miligram", symbol: "mg" }, display_order: 10, is_active: true },
];

