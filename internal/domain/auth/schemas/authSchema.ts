export const authValidation = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  password: {
    minLength: 8,
  },
} as const;
