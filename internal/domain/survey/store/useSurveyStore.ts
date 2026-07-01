import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FoodItem {
  id: string; // temp id for UI
  foodId: string;
  name: string;
  portionGram?: number;
  portionLabel?: string;
  image?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
}

export interface SurveyState {
  token: string | null;
  alias: string | null;
  surveyId: string | null;
  meals: Meal[];
  
  // Actions
  initSurvey: (token: string, alias: string, surveyId: string, initialMeals: Omit<Meal, 'foods'>[]) => void;
  updateMealTime: (mealId: string, time: string) => void;
  addFoodToMeal: (mealId: string, food: Omit<FoodItem, 'id'>) => void;
  removeFoodFromMeal: (mealId: string, foodId: string) => void;
  setFoodPortion: (mealId: string, foodId: string, portionGram: number, portionLabel: string) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      token: null,
      alias: null,
      surveyId: null,
      meals: [],

      initSurvey: (token, alias, surveyId, initialMeals) => set({ 
        token, 
        alias, 
        surveyId,
        meals: initialMeals.map(m => ({ ...m, foods: [] }))
      }),

      updateMealTime: (mealId, time) => set((state) => ({
        meals: state.meals.map(m => m.id === mealId ? { ...m, time } : m)
      })),

      addFoodToMeal: (mealId, food) => set((state) => ({
        meals: state.meals.map(m => m.id === mealId ? {
          ...m,
          foods: [...m.foods, { ...food, id: Math.random().toString(36).substring(7) }]
        } : m)
      })),

      removeFoodFromMeal: (mealId, foodId) => set((state) => ({
        meals: state.meals.map(m => m.id === mealId ? {
          ...m,
          foods: m.foods.filter(f => f.id !== foodId)
        } : m)
      })),

      setFoodPortion: (mealId, foodId, portionGram, portionLabel) => set((state) => ({
        meals: state.meals.map(m => m.id === mealId ? {
          ...m,
          foods: m.foods.map(f => f.id === foodId ? { ...f, portionGram, portionLabel } : f)
        } : m)
      })),

      reset: () => set({ token: null, alias: null, surveyId: null, meals: [] })
    }),
    {
      name: 'atlas-survey-storage',
    }
  )
);
