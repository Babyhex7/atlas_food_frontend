export const nutritionValidation = {
  valuePer100g: { min: 0 },
  portionGram: { min: 1, max: 5000 },
} as const;
