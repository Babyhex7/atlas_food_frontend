export interface FoodSearchResult {
  id: string;
  code: string;
  name: string;
  local_name: string;
  photo_type: "series" | "range";
  category: { code: string; name: string; icon: string };
  icon: string;
}

export interface PortionPhoto {
  id: string;
  label: string;
  image_url: string;
  thumbnail_url: string;
  weight_gram: number;
  description: string;
}

export interface FoodDetail {
  id: string;
  code: string;
  name: string;
  local_name: string;
  description: string;
  photo_type: "series" | "range";
  category: { code: string; name: string; icon: string };
  nutrients: {
    energy: { value: number; unit: string };
    protein: { value: number; unit: string };
    carbs: { value: number; unit: string };
    fat: { value: number; unit: string };
  };
  portion_photos: PortionPhoto[];
}
