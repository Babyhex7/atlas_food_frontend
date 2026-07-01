"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSurvey,
  getActiveSurveys,
  getPublicSurveyInfo,
  getSurveyById,
  getSurveys,
} from "../services/surveyService";
import type { CreateSurveyRequest } from "../types/survey";
import { getAccessToken } from "@/internal/lib/cookies";

export function useSurveys() {
  const token = getAccessToken() ?? "";
  return useQuery({
    queryKey: ["admin-surveys"],
    queryFn: () => getSurveys(token),
    enabled: Boolean(token),
  });
}

export function useSurvey(id: string) {
  const token = getAccessToken() ?? "";
  return useQuery({
    queryKey: ["admin-survey", id],
    queryFn: () => getSurveyById(id, token),
    enabled: Boolean(id && token),
  });
}

export function useCreateSurvey() {
  const token = getAccessToken() ?? "";
  return useMutation({
    mutationFn: (payload: CreateSurveyRequest) => createSurvey(payload, token),
  });
}

export function usePublicSurvey(accessToken: string) {
  const jwtToken = getAccessToken() ?? "";
  return useQuery({
    queryKey: ["public-survey", accessToken],
    queryFn: () => getPublicSurveyInfo(accessToken, jwtToken),
    enabled: Boolean(accessToken && jwtToken),
  });
}

export function useActiveSurveys(page = 1, limit = 10) {
  const token = getAccessToken() ?? "";
  return useQuery({
    queryKey: ["active-surveys", page, limit],
    queryFn: () => getActiveSurveys(token, page, limit),
    enabled: Boolean(token),
  });
}
