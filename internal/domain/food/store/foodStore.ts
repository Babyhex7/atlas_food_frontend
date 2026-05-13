import type { Food } from "../types/food";

export type FoodState = {
  selectedFood: Food | null;
  keyword: string;
};

export const initialFoodState: FoodState = {
  selectedFood: null,
  keyword: "",
};
