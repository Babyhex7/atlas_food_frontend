import type { Category } from "@/internal/domain/category/types/category";
import type { NutritionMap } from "@/internal/domain/nutrition/types/nutrition";

export type Food = {
  id: string;
  code: string;
  name: string;
  local_name?: string | null;
  description?: string | null;
  photo_type?: "series" | "range";
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

// ============ Public API Types ============

/** Response dari GET /public/foods/search */
export type SearchFoodResult = {
  id: string;
  code: string;
  name: string;
  local_name?: string | null;
  photo_type?: "series" | "range";
  category?: {
    id: string;
    code: string;
    name: string;
    icon: string;
  } | null;
};

/** Satu foto porsi dalam FoodDetail */
export type PortionPhoto = {
  id: string;
  label: string;
  image_url: string;
  thumbnail_url?: string | null;
  weight_gram: number;
  description?: string | null;
};

/** Response dari GET /public/foods/:id — dengan nutrisi dan portion photos */
export type FoodDetail = SearchFoodResult & {
  description?: string | null;
  nutrients?: Record<string, { value: number; unit: string }>;
  portion_photos?: PortionPhoto[];
};
