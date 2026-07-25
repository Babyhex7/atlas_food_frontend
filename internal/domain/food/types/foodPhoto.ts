export type FoodPhoto = {
  id: string;
  title: string;
  label: string;
  image_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  status: "draft" | "published" | "archived" | string;
  areas_count: number;
  weight_gram: number;
  as_served_image_id: string;
  display_order: number;
  published_at: string | null;
  updated_at: string;
};

export type FoodPhotoListResponse = {
  items: FoodPhoto[];
  photo_type: "series" | "range" | string;
  max_photos: number;
  count: number;
};

export type CreateFoodPhotoPayload = {
  title: string;
  image_url: string;
  thumbnail_url?: string;
  width: number;
  height: number;
  weight_gram: number;
  label?: string;
};

export type UpdateFoodPhotoPayload = {
  title?: string;
  label?: string;
  weight_gram?: number;
};
