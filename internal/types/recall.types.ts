export interface FoodItem {
  foodId: string;
  foodName: string;
  portionGram: number;
  portion: {
    method: string;
    imageId?: string;
    imageLabel?: string;
    baseWeight?: number;
    quantity?: number;
    fraction?: number;
    totalQuantity?: number;
    customWeight?: number;
  };
  nutrients: {
    energy: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  additionalFoods?: FoodItem[]; // toping/tambahan bebas dari search
}

export interface MealEntry {
  id: string; // uuid local
  name: string; // "Sarapan", "Makan Siang", dll
  time: string; // "07:30"
  foods: FoodItem[];
}
