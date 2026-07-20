"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAsServedImages,
  addPortionMethod,
  createAsServedSet,
  deleteAsServedImage,
  deleteAsServedSet,
  deletePortionMethod,
  getAdminFoodPortionMethods,
  getAsServedSet,
  getAsServedSets,
  updateAsServedImage,
  updateAsServedSet,
  updatePortionMethod,
  type AsServedImagePayload,
  type AsServedSetPayload,
  type PortionMethodPayload,
} from "../services/portionService";

export const portionKeys = {
  all: ["portion"] as const,
  sets: ["portion", "sets"] as const,
  setDetail: (id: string) => ["portion", "sets", id] as const,
  methods: (foodId: string) => ["portion", "methods", foodId] as const,
};

// ============ AS-SERVED SET ============

export function useAsServedSets() {
  return useQuery({ queryKey: portionKeys.sets, queryFn: getAsServedSets });
}

export function useAsServedSet(id: string | undefined) {
  return useQuery({
    queryKey: portionKeys.setDetail(id ?? ""),
    queryFn: () => getAsServedSet(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAsServedSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AsServedSetPayload) => createAsServedSet(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

export function useUpdateAsServedSet(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<AsServedSetPayload>) => updateAsServedSet(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

export function useDeleteAsServedSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAsServedSet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

// ============ AS-SERVED IMAGE ============

export function useAddAsServedImages(setId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (images: AsServedImagePayload[]) => addAsServedImages(setId, images),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

export function useUpdateAsServedImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AsServedImagePayload> }) =>
      updateAsServedImage(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

export function useDeleteAsServedImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAsServedImage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

// ============ PORTION METHOD ============

export function useFoodPortionMethods(foodId: string | undefined) {
  return useQuery({
    queryKey: portionKeys.methods(foodId ?? ""),
    queryFn: () => getAdminFoodPortionMethods(foodId as string),
    enabled: Boolean(foodId),
  });
}

export function useAddPortionMethod(foodId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PortionMethodPayload) => addPortionMethod(foodId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

export function useUpdatePortionMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PortionMethodPayload> }) =>
      updatePortionMethod(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}

export function useDeletePortionMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePortionMethod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portionKeys.all }),
  });
}
