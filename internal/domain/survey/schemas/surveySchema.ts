export const surveyValidation = {
  slug: {
    minLength: 3,
    maxLength: 100,
  },
  name: {
    minLength: 3,
    maxLength: 255,
  },
  description: {
    maxLength: 1000,
  },
  mealName: {
    minLength: 2,
    maxLength: 100,
  },
} as const;
