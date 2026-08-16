import { apiClient, apiEndpoints } from "@/internal/pkg/api";
import type { CreateSurveyRequest, JoinSurveyResponse, Survey, UpdateSurveyRequest } from "../types/survey";

export async function getSurveys(token: string, limit = 200): Promise<Survey[]> {
  // Backend membungkus list dalam envelope { surveys, total, page, limit } (lihat SurveyListResponse),
  // jadi ambil field surveys-nya — bukan langsung array.
  //
  // limit wajib dikirim: tanpa itu backend memakai default 10, sehingga daftar
  // admin diam-diam terpotong di survey ke-11 dan pencarian tidak pernah
  // menemukan survey lama. Endpoint ini belum punya filter server, jadi seluruh
  // isinya memang diambil sekaligus lalu disaring di klien.
  const res = await apiClient<{ surveys: Survey[]; total: number; page: number; limit: number }>(
    `${apiEndpoints.admin.surveys}?page=1&limit=${limit}`,
    { token }
  );
  return res?.surveys ?? [];
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

/** Join survey aktif setelah login — prefer survey_id (tanpa share link). */
export function joinSurvey(opts: { surveyId?: string; accessToken?: string; alias?: string }) {
  const body: Record<string, string> = {};
  if (opts.surveyId) body.survey_id = opts.surveyId;
  if (opts.accessToken) body.token = opts.accessToken;
  if (opts.alias) body.alias = opts.alias;
  return apiClient<JoinSurveyResponse>(`/survey/access`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
