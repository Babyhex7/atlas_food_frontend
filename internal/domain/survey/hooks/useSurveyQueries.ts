"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createSurvey, getPublicSurvey, getSurveyById, getSurveys, joinSurvey } from "../services/surveyService";
import type { CreateSurveyRequest } from "../types/survey";

export function useSurveys(token: string) {
  return useQuery({
    queryKey: ["surveys"],
    queryFn: () => getSurveys(token),
    enabled: Boolean(token),
  });
}

export function useSurvey(id: string, token: string) {
  return useQuery({
    queryKey: ["survey", id],
    queryFn: () => getSurveyById(id, token),
    enabled: Boolean(id && token),
  });
}

export function useCreateSurvey(token: string) {
  return useMutation({
    mutationFn: (payload: CreateSurveyRequest) => createSurvey(payload, token),
  });
}

export function usePublicSurvey(accessToken: string) {
  return useQuery({
    queryKey: ["public-survey", accessToken],
    queryFn: () => getPublicSurvey(accessToken),
    enabled: Boolean(accessToken),
  });
}

export function useJoinSurvey() {
  return useMutation({
    mutationFn: joinSurvey,
  });
}
