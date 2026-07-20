"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/categoryService";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "../types/category";

export const categoryKeys = {
  all: ["categories"] as const,
  public: ["categories", "public"] as const,
  admin: ["categories", "admin"] as const,
  detail: (id: string) => ["categories", "detail", id] as const,
};

/** Kategori publik (Find Food) */
export function useCategories() {
  return useQuery({ queryKey: categoryKeys.public, queryFn: getCategories });
}

/** Kategori untuk panel admin */
export function useAdminCategories() {
  return useQuery({ queryKey: categoryKeys.admin, queryFn: () => getAdminCategories() });
}

export function useCategoryDetail(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? ""),
    queryFn: () => getCategoryById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => createCategory(payload),
    // Invalidasi seluruh cabang "categories": perubahan admin harus langsung
    // tercermin di Find Food juga (brief §11).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCategoryRequest) => updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
