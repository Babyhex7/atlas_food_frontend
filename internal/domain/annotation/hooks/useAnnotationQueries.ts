"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAnnotation,
  getPublishedAnnotation,
  listAnnotations,
  listPublishedAnnotationsByFood,
  type ListAnnotationsParams,
} from "../services/annotationService";

/** Query key terpusat agar invalidasi di mutation tidak salah tebak */
export const annotationKeys = {
  all: ["annotations"] as const,
  list: (params: ListAnnotationsParams) => ["annotations", "list", params] as const,
  detail: (id: string) => ["annotations", "detail", id] as const,
  published: (id: string) => ["annotations", "published", id] as const,
  byFood: (foodId: string) => ["annotations", "by-food", foodId] as const,
};

export function useAnnotationList(params: ListAnnotationsParams = {}) {
  return useQuery({
    queryKey: annotationKeys.list(params),
    queryFn: () => listAnnotations(params),
  });
}

export function useAnnotationDetail(id: string | undefined) {
  return useQuery({
    queryKey: annotationKeys.detail(id ?? ""),
    queryFn: () => getAnnotation(id as string),
    enabled: Boolean(id),
    // Editor memegang state-nya sendiri di store; refetch otomatis saat
    // fokus kembali akan menimpa pekerjaan yang belum tersimpan.
    refetchOnWindowFocus: false,
  });
}

export function usePublishedAnnotation(id: string | undefined) {
  return useQuery({
    queryKey: annotationKeys.published(id ?? ""),
    queryFn: () => getPublishedAnnotation(id as string),
    enabled: Boolean(id),
  });
}

export function usePublishedAnnotationsByFood(foodId: string | undefined) {
  return useQuery({
    queryKey: annotationKeys.byFood(foodId ?? ""),
    queryFn: () => listPublishedAnnotationsByFood(foodId as string),
    enabled: Boolean(foodId),
  });
}
