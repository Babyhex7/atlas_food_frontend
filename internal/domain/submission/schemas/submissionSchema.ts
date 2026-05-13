export const submissionValidation = {
  respondentName: { maxLength: 255 },
  portionGram: { min: 1, max: 5000 },
} as const;
