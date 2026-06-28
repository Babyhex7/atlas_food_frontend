import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FoodItem, MealEntry } from "@/internal/types/recall.types";

interface RecallStore {
  // State
  currentStep: number; // 1-5
  currentMeal: Partial<MealEntry>;
  meals: MealEntry[];
  surveyId: string | null;

  // Actions
  setStep: (step: number) => void;
  setCurrentMealName: (name: string) => void;
  setCurrentMealTime: (time: string) => void;
  addFoodToCurrentMeal: (food: FoodItem) => void;
  removeFoodFromCurrentMeal: (foodId: string) => void;
  updatePortionInCurrentMeal: (foodId: string, portion: FoodItem["portion"], portionGram: number) => void;
  commitCurrentMeal: () => void;
  removeMeal: (mealId: string) => void;
  setSurveyId: (id: string) => void;
  resetRecall: () => void;
}

const initialMeal: Partial<MealEntry> = {
  name: "",
  time: "",
  foods: [],
};

export const useRecallStore = create<RecallStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      currentMeal: initialMeal,
      meals: [],
      surveyId: null,

      setStep: (step) => set({ currentStep: step }),

      setCurrentMealName: (name) =>
        set((state) => ({
          currentMeal: { ...state.currentMeal, name },
        })),

      setCurrentMealTime: (time) =>
        set((state) => ({
          currentMeal: { ...state.currentMeal, time },
        })),

      addFoodToCurrentMeal: (food) =>
        set((state) => ({
          currentMeal: {
            ...state.currentMeal,
            foods: [...(state.currentMeal.foods ?? []), food],
          },
        })),

      removeFoodFromCurrentMeal: (foodId) =>
        set((state) => ({
          currentMeal: {
            ...state.currentMeal,
            foods: (state.currentMeal.foods ?? []).filter(
              (f) => f.foodId !== foodId
            ),
          },
        })),

      updatePortionInCurrentMeal: (foodId, portion, portionGram) =>
        set((state) => ({
          currentMeal: {
            ...state.currentMeal,
            foods: (state.currentMeal.foods ?? []).map((f) =>
              f.foodId === foodId ? { ...f, portion, portionGram } : f
            ),
          },
        })),

      commitCurrentMeal: () =>
        set((state) => ({
          meals: [
            ...state.meals,
            {
              id: crypto.randomUUID(),
              name: state.currentMeal.name ?? "",
              time: state.currentMeal.time ?? "",
              foods: state.currentMeal.foods ?? [],
            },
          ],
          currentMeal: initialMeal,
          currentStep: 1,
        })),

      removeMeal: (mealId) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== mealId),
        })),

      setSurveyId: (id) => set({ surveyId: id }),

      resetRecall: () =>
        set({ currentStep: 1, currentMeal: initialMeal, meals: [], surveyId: null }),
    }),
    {
      name: "atlas-food-recall",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        meals: state.meals,
        currentMeal: state.currentMeal,
        surveyId: state.surveyId,
      }),
    }
  )
);
