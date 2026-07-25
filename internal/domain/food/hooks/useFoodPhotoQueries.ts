"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFoodPhoto,
  deleteFoodPhoto,
  listFoodPhotos,
  publishFoodPhoto,
  unpublishFoodPhoto,
  updateFoodPhoto,
} from "../services/foodPhotoService";
import type { CreateFoodPhotoPayload, UpdateFoodPhotoPayload } from "../types/foodPhoto";

export const foodPhotoKeys = {
  all: ["food-photos"] as const,
  list: (foodId: string) => ["food-photos", foodId] as const,
};

export function useFoodPhotos(foodId: string | undefined) {
  return useQuery({
    queryKey: foodPhotoKeys.list(foodId ?? ""),
    queryFn: () => listFoodPhotos(foodId as string),
    enabled: Boolean(foodId),
  });
}

function useInvalidatePhotos(foodId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: foodPhotoKeys.list(foodId) });
}

export function useCreateFoodPhoto(foodId: string) {
  const invalidate = useInvalidatePhotos(foodId);
  return useMutation({
    mutationFn: (payload: CreateFoodPhotoPayload) => createFoodPhoto(foodId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateFoodPhoto(foodId: string) {
  const invalidate = useInvalidatePhotos(foodId);
  return useMutation({
    mutationFn: ({ photoId, payload }: { photoId: string; payload: UpdateFoodPhotoPayload }) =>
      updateFoodPhoto(foodId, photoId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteFoodPhoto(foodId: string) {
  const invalidate = useInvalidatePhotos(foodId);
  return useMutation({
    mutationFn: (photoId: string) => deleteFoodPhoto(foodId, photoId),
    onSuccess: invalidate,
  });
}

export function usePublishFoodPhoto(foodId: string) {
  const invalidate = useInvalidatePhotos(foodId);
  return useMutation({
    mutationFn: (photoId: string) => publishFoodPhoto(foodId, photoId),
    onSuccess: invalidate,
  });
}

export function useUnpublishFoodPhoto(foodId: string) {
  const invalidate = useInvalidatePhotos(foodId);
  return useMutation({
    mutationFn: (photoId: string) => unpublishFoodPhoto(foodId, photoId),
    onSuccess: invalidate,
  });
}
