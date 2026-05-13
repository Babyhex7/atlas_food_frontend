export const categoryValidation = {
  code: { minLength: 2, maxLength: 50 },
  name: { minLength: 2, maxLength: 255 },
} as const;
