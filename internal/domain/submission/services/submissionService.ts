import { apiClient as axiosClient } from "@/internal/lib/axios";
import type { ExportFormat } from "../constants/exportFormats";
import type { CreateSubmissionRequest, SurveySubmission } from "../types/submission";

/**
 * submitSurvey — POST /api/v1/survey/submit
 * Uses Axios client (with auto token refresh) for reliable auth handling.
 */
export async function submitSurvey(payload: CreateSubmissionRequest): Promise<{ submission_id: string; message: string }> {
  const response = await axiosClient.post("/survey/submit", payload);
  return response.data.data;
}

/**
 * getSurveySubmissions — GET /api/v1/admin/surveys/:id/submissions
 */
export async function getSurveySubmissions(surveyId: string): Promise<SurveySubmission[]> {
  const response = await axiosClient.get(`/admin/surveys/${surveyId}/submissions`);
  return response.data.data?.submissions ?? response.data.data ?? [];
}

/**
 * getSurveyExportUrl — returns URL for CSV export download
 */
export function getSurveyExportUrl(surveyId: string, format: ExportFormat): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
  return `${base}/admin/surveys/${surveyId}/export?format=${format}`;
}
