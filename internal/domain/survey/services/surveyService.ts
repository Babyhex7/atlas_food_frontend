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

export function cloneSurvey(id: string, token: string) {
  return apiClient<Survey>(apiEndpoints.admin.cloneSurvey(id), {
    method: "POST",
    token,
  });
}

export function getPublicSurvey(accessToken: string) {
  return apiClient<Survey>(apiEndpoints.publicSurvey.detail(accessToken));
}

export function joinSurvey(accessToken: string) {
  return apiClient<JoinSurveyResponse>(apiEndpoints.publicSurvey.join(accessToken), { method: "POST" });
}
