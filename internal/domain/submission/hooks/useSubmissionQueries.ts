"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getSurveySubmissions, submitSurvey } from "../services/submissionService";
import type { CreateSubmissionRequest } from "../types/submission";

export function useSurveySubmissions(surveyId: string) {
  return useQuery({
    queryKey: ["survey-submissions", surveyId],
    queryFn: () => getSurveySubmissions(surveyId),
    enabled: Boolean(surveyId),
  });
}

export function useSubmitSurvey() {
  return useMutation({ mutationFn: (payload: CreateSubmissionRequest) => submitSurvey(payload) });
}
