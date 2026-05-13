"use client";

import { useQuery } from "@tanstack/react-query";
import { getFoodPortionMethods, getPortionMethodOptions } from "../services/portionService";

export function useFoodPortionMethods(foodId: string) {
  return useQuery({ queryKey: ["portion-methods", foodId], queryFn: () => getFoodPortionMethods(foodId), enabled: Boolean(foodId) });
}

export function usePortionMethodOptions(methodId?: number) {
  return useQuery({ queryKey: ["portion-method-options", methodId], queryFn: () => getPortionMethodOptions(methodId as number), enabled: Boolean(methodId) });
}
