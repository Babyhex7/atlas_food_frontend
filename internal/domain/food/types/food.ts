import type { Category } from "@/internal/domain/category/types/category";
import type { NutritionMap } from "@/internal/domain/nutrition/types/nutrition";

export type Food = {
  id: string;
  code: string;
  name: string;
  local_name?: string | null;
  description?: string | null;
  category_id?: string | null;
  category?: Category;
  nutrients?: NutritionMap;
  is_active: boolean;
  created_at: string;
};

export type CreateFoodRequest = {
  code: string;
  name: string;
  local_name?: string;
  description?: string;
  category_id?: string;
};

export type UpdateFoodRequest = Partial<CreateFoodRequest> & {
  is_active?: boolean;
};

export type AssociatedFood = {
  id: number;
  food_id: string;
  associated_food_id: string;
  priority: number;
  is_default: boolean;
  created_at: string;
};
