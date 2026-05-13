export const portionValidation = {
  weightGram: { min: 1, max: 5000 },
  label: { minLength: 1, maxLength: 255 },
} as const;
