import { apiClient } from "@/internal/pkg/api";
import type { ExportFormat } from "../constants/exportFormats";
import type { CreateSubmissionRequest, SurveySubmission } from "../types/submission";

export function submitSurvey(payload: CreateSubmissionRequest, surveyAccessToken: string) {
  return apiClient<{ submission_id: string; message: string }>("/survey/submit", {
    method: "POST",
    token: surveyAccessToken,
    body: JSON.stringify(payload),
  });
}

export function getSurveySubmissions(surveyId: string, token: string) {
  return apiClient<SurveySubmission[]>(`/admin/surveys/${surveyId}/submissions`, { token });
}

export function getSurveyExportUrl(surveyId: string, format: ExportFormat) {
  return `/admin/surveys/${surveyId}/export?format=${format}`;
}
