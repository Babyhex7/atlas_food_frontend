import { apiClient } from "@/internal/pkg/api";

export interface MissingFoodSummary {
  name: string;
  description: string;
  report_count: number;
  last_reported_at: string;
  is_in_catalog: boolean;
  catalog_food_id?: string;
}

export interface GeneratedPortionView {
  code: string;
  label: string;
  weight_gram: number;
  description: string;
  visual_prompt: string;
  image_url: string;
}

export interface GenerateFoodAIResponse {
  food_name: string;
  local_name: string;
  description: string;
  category_id?: string;
  category_name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  portions: GeneratedPortionView[];
}

export interface PublishFoodAIRequest {
  food_name: string;
  local_name: string;
  description: string;
  category_id?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  portions: GeneratedPortionView[];
}

export interface PublishFoodAIResponse {
  food_id: string;
  food_code: string;
  food_name: string;
  set_id: string;
  total_image: number;
  message: string;
}

export async function fetchMissingFoods(): Promise<MissingFoodSummary[]> {
  return apiClient<MissingFoodSummary[]>("/admin/ai/missing-foods");
}

export async function generateFoodAI(payload: {
  food_name: string;
  description?: string;
  category_id?: string;
}): Promise<GenerateFoodAIResponse> {
  return apiClient<GenerateFoodAIResponse>("/admin/ai/generate-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function publishFoodAI(payload: PublishFoodAIRequest): Promise<PublishFoodAIResponse> {
  return apiClient<PublishFoodAIResponse>("/admin/ai/publish-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
