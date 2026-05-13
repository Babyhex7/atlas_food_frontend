import type { Food } from "@/internal/domain/food/types/food";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";

export type RecallStep = "meal" | "food" | "portion" | "review" | "done";

export type RecallMeal = {
  name: string;
  time: string;
  order: number;
  foods: RecallFood[];
};

export type RecallFood = {
  food: Food;
  portion?: SelectedPortion;
};

export type RecallSession = {
  survey_id: string;
  access_token: string;
  current_step: RecallStep;
  meals: RecallMeal[];
};
