"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getSurveySubmissions, submitSurvey } from "../services/submissionService";
import type { CreateSubmissionRequest } from "../types/submission";

export function useSurveySubmissions(surveyId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["survey-submissions", surveyId, page, limit],
    queryFn: () => getSurveySubmissions(surveyId, page, limit),
    enabled: Boolean(surveyId),
    // Pindah halaman tidak boleh mengosongkan daftar dulu.
    placeholderData: (previous) => previous,
  });
}

export function useSubmitSurvey() {
  return useMutation({ mutationFn: (payload: CreateSubmissionRequest) => submitSurvey(payload) });
}
