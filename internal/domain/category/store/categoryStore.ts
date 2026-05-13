import type { Category } from "../types/category";

export type CategoryState = {
  selectedCategory: Category | null;
};

export const initialCategoryState: CategoryState = {
  selectedCategory: null,
};
