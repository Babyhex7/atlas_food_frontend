"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFood,
  deleteFood,
  getAdminFoodById,
  getAdminFoods,
  searchFoods,
  updateFood,
} from "../services/foodService";
import type { CreateFoodRequest, UpdateFoodRequest } from "../types/food";

export const foodKeys = {
  all: ["foods"] as const,
  admin: (params: object) => ["foods", "admin", params] as const,
  detail: (id: string) => ["foods", "detail", id] as const,
  search: (query: string) => ["foods", "search", query] as const,
};

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: foodKeys.search(query),
    queryFn: () => searchFoods(query),
    enabled: query.length > 0,
  });
}

export function useAdminFoods(
  params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    photo_type?: string;
    is_active?: string;
  } = {}
) {
  return useQuery({
    queryKey: foodKeys.admin(params),
    queryFn: () => getAdminFoods(params),
  });
}

export function useFoodDetail(id: string | undefined) {
  return useQuery({
    queryKey: foodKeys.detail(id ?? ""),
    queryFn: () => getAdminFoodById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFoodRequest) => createFood(payload),
    // Perubahan food harus langsung tercermin di Find Food & Recall (brief §11)
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodKeys.all }),
  });
}

export function useUpdateFood(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFoodRequest) => updateFood(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodKeys.all }),
  });
}

export function useDeleteFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFood(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodKeys.all }),
  });
}
