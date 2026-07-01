import type { SearchFoodResult, FoodDetail, PortionPhoto } from "@/internal/domain/food/types/food";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";

/** Step flow 6 langkah */
export type RecallStep =
  | "select_meal"   // Step 1
  | "add_food"      // Step 2
  | "portion"       // Step 3
  | "additional"    // Step 4
  | "review"        // Step 5
  | "done";         // Step 6

/** Bahan tambahan / topping (Step 4) */
export type AdditionalItem = {
  name: string;
  amount: string;       // display: "3g", "10ml"
  amount_value: number; // numerik
  unit: string;         // "g" | "ml" | "mg" | "sdm"
};

/** Makanan yang tidak ditemukan di DB */
export type MissingFood = {
  name: string;
  description?: string;
};

/** Makanan yang ditambahkan user di Step 2 */
export type RecallFood = {
  food: SearchFoodResult;
  food_type: "food" | "drink";
  // Diisi di Step 3
  portion?: SelectedPortion;
  // Diisi di Step 4
  additionals?: AdditionalItem[];
  // Snapshot detail (nutrisi + portion photos) — diambil saat masuk Step 3
  detail?: FoodDetail;
};

/** Satu sesi waktu makan (Breakfast, Lunch, dll) */
export type RecallMeal = {
  name: string;    // "Breakfast"
  time: string;    // "07:30"
  order?: number;
  foods: RecallFood[];
};

/** Opsi waktu makan dari konfigurasi survey admin */
export type RecallMealOption = {
  name: string;
  time: string;
};

/** State utama seluruh session recall */
export type RecallSession = {
  survey_id: string;
  access_token: string;
  participant_id?: string;
  respondent_name?: string;
  /** Meals dari meals_config survey — dipakai Step 1 */
  available_meals?: RecallMealOption[];
  current_step: RecallStep;
  // Data step 1
  current_meal: {
    type: string;  // "Breakfast"
    time: string;  // "07:00"
  };
  // Makanan yang sedang di-portion (index di current_meal.foods)
  portion_food_index: number;
  // Semua meals yang sudah diisi
  meals: RecallMeal[];
  // Makanan yang tidak ketemu di DB
  missing_foods: MissingFood[];
};
