import { apiClient, apiEndpoints } from "@/internal/pkg/api";
import type { CreateSurveyRequest, JoinSurveyResponse, Survey, UpdateSurveyRequest } from "../types/survey";

export function getSurveys(token: string) {
  return apiClient<Survey[]>(apiEndpoints.admin.surveys, { token });
}

export function createSurvey(payload: CreateSurveyRequest, token: string) {
  return apiClient<Survey>(apiEndpoints.admin.surveys, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function getSurveyById(id: string, token: string) {
  return apiClient<Survey>(apiEndpoints.admin.surveyDetail(id), { token });
}

export function updateSurvey(id: string, payload: UpdateSurveyRequest, token: string) {
  return apiClient<Survey>(apiEndpoints.admin.surveyDetail(id), {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteSurvey(id: string, token: string) {
  return apiClient<{ message: string }>(apiEndpoints.admin.surveyDetail(id), {
    method: "DELETE",
    token,
  });
}

export function cloneSurvey(id: string, payload: { new_name: string; new_slug: string }, token: string) {
  return apiClient<Survey>(apiEndpoints.admin.cloneSurvey(id), {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

/** Public survey info by access token — GET /survey/:token/info */
export function getPublicSurveyInfo(accessToken: string, token: string) {
  return apiClient<Survey>(`/survey/${accessToken}/info`, { token });
}

/** List active surveys for respondents */
export function getActiveSurveys(token: string, page = 1, limit = 10) {
  return apiClient<{ surveys: Survey[]; total: number; page: number; limit: number }>(
    `/survey/active?page=${page}&limit=${limit}`,
    { token }
  );
}

// Legacy stubs kept for query hook compatibility
export function getPublicSurvey(accessToken: string) {
  return apiClient<Survey>(`/survey/${accessToken}/info`);
}

export function joinSurvey(accessToken: string) {
  return apiClient<JoinSurveyResponse>(`/survey/access`, { method: "POST", body: JSON.stringify({ token: accessToken }) });
}
