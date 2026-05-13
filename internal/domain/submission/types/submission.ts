import type { NutritionMap } from "@/internal/domain/nutrition/types/nutrition";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";

export type SubmissionFood = {
  food_id: string;
  food_name: string;
  portion_gram: number;
  portion?: SelectedPortion;
  nutrients?: NutritionMap;
};

export type SubmissionMeal = {
  name: string;
  time: string;
  foods: SubmissionFood[];
  meal_total?: NutritionMap;
};

export type MissingFood = {
  name: string;
  description?: string;
};

export type SurveySubmission = {
  id: string;
  survey_id: string;
  participant_id?: string | null;
  respondent_name?: string | null;
  respondent_email?: string | null;
  meals_data: SubmissionMeal[];
  missing_foods?: MissingFood[];
  submitted_at: string;
  created_at: string;
};

export type CreateSubmissionRequest = {
  survey_id: string;
  respondent_name?: string;
  respondent_email?: string;
  meals_data: SubmissionMeal[];
  daily_total?: NutritionMap;
  missing_foods?: MissingFood[];
};
