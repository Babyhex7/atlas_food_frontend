"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAnnotation,
  deleteAnnotation,
  publishAnnotation,
  unpublishAnnotation,
  updateAnnotation,
  uploadAnnotationImage,
} from "../services/annotationService";
import { annotationKeys } from "./useAnnotationQueries";
import type { CreateFoodImageRequest, UpdateFoodImageRequest } from "../types/annotation";

export function useCreateAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFoodImageRequest) => createAnnotation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationKeys.all });
    },
  });
}

export function useUpdateAnnotation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFoodImageRequest) => updateAnnotation(id, payload),
    onSuccess: (image) => {
      queryClient.setQueryData(annotationKeys.detail(id), image);
      queryClient.invalidateQueries({ queryKey: annotationKeys.all });
    },
  });
}

export function usePublishAnnotation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishAnnotation(id),
    onSuccess: (image) => {
      queryClient.setQueryData(annotationKeys.detail(id), image);
      queryClient.invalidateQueries({ queryKey: annotationKeys.all });
    },
  });
}

export function useUnpublishAnnotation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unpublishAnnotation(id),
    onSuccess: (image) => {
      queryClient.setQueryData(annotationKeys.detail(id), image);
      queryClient.invalidateQueries({ queryKey: annotationKeys.all });
    },
  });
}

export function useDeleteAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAnnotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationKeys.all });
    },
  });
}

export function useUploadAnnotationImage() {
  return useMutation({
    mutationFn: (file: File) => uploadAnnotationImage(file),
  });
}
