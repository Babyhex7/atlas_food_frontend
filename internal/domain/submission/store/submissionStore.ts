import type { SubmissionMeal } from "../types/submission";

export type SubmissionState = {
  meals: SubmissionMeal[];
};

export const initialSubmissionState: SubmissionState = {
  meals: [],
};
