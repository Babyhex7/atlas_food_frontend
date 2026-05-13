export type PortionMethodType = "as_served" | "guide_image" | "weight";
export type PortionSelectionType = "simple_grid" | "as_served_quantity" | "counter" | "input";

export type PortionMethodConfig = {
  selectionType: PortionSelectionType;
  setCode?: string;
  maxQuantity?: number;
  allowFractions?: boolean;
  fractionOptions?: number[];
  defaultQuantity?: number;
  defaultFraction?: number;
  showCalculation?: boolean;
  unit?: string;
  placeholder?: string;
};

export type FoodPortionSizeMethod = {
  id: number;
  food_id: string;
  method_type: PortionMethodType;
  label: string;
  description?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  config?: PortionMethodConfig;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type AsServedSet = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  food_id?: string | null;
  category?: string | null;
  created_at: string;
};

export type AsServedImage = {
  id: string;
  set_id: string;
  label: string;
  image_url: string;
  thumbnail_url?: string | null;
  weight_gram: number;
  description?: string | null;
  display_order: number;
  created_at: string;
};

export type SelectedPortion = {
  method: PortionSelectionType;
  image_id?: string;
  image_label?: string;
  base_weight?: number;
  quantity: number;
  fraction: number;
  total_quantity: number;
  portion_gram: number;
};
