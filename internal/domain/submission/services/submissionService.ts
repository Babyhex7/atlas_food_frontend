import { apiClient as axiosClient } from "@/internal/lib/axios";
import type { CreateSubmissionRequest, SurveySubmission } from "../types/submission";

/**
 * submitSurvey — POST /api/v1/survey/submit
 * Uses Axios client (with auto token refresh) for reliable auth handling.
 */
export async function submitSurvey(payload: CreateSubmissionRequest): Promise<{ submission_id: string; message: string }> {
  const response = await axiosClient.post("/survey/submit", payload);
  return response.data.data;
}

export type SubmissionPage = {
  submissions: SurveySubmission[];
  total: number;
};

/**
 * getSurveySubmissions — GET /api/v1/admin/surveys/:id/submissions
 *
 * page & limit wajib dikirim: default backend adalah limit 10, jadi tanpa itu
 * daftar diam-diam terpotong dan jumlah respons yang ditampilkan salah.
 */
export async function getSurveySubmissions(
  surveyId: string,
  page = 1,
  limit = 20
): Promise<SubmissionPage> {
  const response = await axiosClient.get(`/admin/surveys/${surveyId}/submissions`, {
    params: { page, limit },
  });
  const data = response.data?.data ?? {};
  const submissions: SurveySubmission[] = data.submissions ?? [];

  return {
    submissions,
    // Backend lama tanpa envelope pagination tetap dilayani: total mundur ke
    // panjang halaman yang diterima.
    total: data.pagination?.total ?? submissions.length,
  };
}

/**
 * downloadSurveyExport — GET /api/v1/admin/surveys/:id/export
 *
 * Endpoint ini dilindungi AdminOnly, jadi tidak bisa dibuka sebagai href biasa:
 * tautan polos tidak membawa header Authorization dan selalu berakhir 401.
 * Berkasnya diambil lewat klien Axios (header + auto refresh) lalu disimpan
 * dari blob.
 */
export async function downloadSurveyExport(surveyId: string, surveyName?: string): Promise<void> {
  const response = await axiosClient.get(`/admin/surveys/${surveyId}/export`, {
    responseType: "blob",
  });

  const disposition = String(response.headers["content-disposition"] ?? "");
  const match = disposition.match(/filename=(?:"([^"]+)"|([^;]+))/i);
  const fallback = `submissions-${surveyName || surveyId}.csv`;
  const filename = (match?.[1] || match?.[2] || fallback).trim();

  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
