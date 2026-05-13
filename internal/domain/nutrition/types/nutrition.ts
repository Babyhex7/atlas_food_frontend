export type NutrientUnit = {
  id: number;
  code: string;
  name: string;
  symbol: string;
};

export type NutrientType = {
  id: number;
  code: string;
  name: string;
  unit_id: number;
  display_order: number;
  is_active: boolean;
};

export type FoodNutrient = {
  food_id: string;
  nutrient_type_id: number;
  value_per_100g: number;
};

export type CalculatedNutrient = {
  code: string;
  name: string;
  unit: string;
  value: number;
};

export type NutritionMap = Record<string, CalculatedNutrient>;
