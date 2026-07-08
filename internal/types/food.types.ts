export interface FoodSearchResult {
  id: string;
  code: string;
  name: string;
  local_name: string;
  photo_type: "series" | "range";
  category: { id: string; code: string; name: string; icon: string } | null;
  icon: string;
}

export interface PortionPhoto {
  id: string;
  label: string;
  image_url: string;
  thumbnail_url: string | null;
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
  category: { id: string; code: string; name: string; icon: string } | null;
  nutrients: {
    energy: { value: number; unit: string };
    protein: { value: number; unit: string };
    carbs: { value: number; unit: string };
    fat: { value: number; unit: string };
  };
  portion_photos: PortionPhoto[];
}
