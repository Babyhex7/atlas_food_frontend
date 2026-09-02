import { apiClient as axiosClient } from "@/internal/lib/axios";
import type { CreateSubmissionRequest, SurveySubmission } from "../types/submission";

import { v4 as uuidv4 } from "uuid";
import { OfflineSubmissionService } from "@/internal/domain/survey/services/offlineService";

// ─── Batch Sync Types ──────────────────────────────────────────────────────────

export type BatchSyncResultItem = {
  local_id: string;
  status: "SYNCED" | "SKIPPED" | "FAILED";
  server_id?: string;
  message?: string;
};

export type BatchSyncResponseData = {
  results: BatchSyncResultItem[];
  synced_count: number;
  failed_count: number;
};

// ─── Submit Survey (Offline-First + Idempotency) ───────────────────────────────

/**
 * submitSurvey — POST /api/v1/survey/submit
 * Selalu generate localId (UUID) sebagai Idempotency-Key.
 * Jika offline, data disimpan ke IndexedDB dan dikirim otomatis saat online kembali.
 */
export async function submitSurvey(
  payload: CreateSubmissionRequest
): Promise<{ submission_id: string; message: string }> {
  const localId = payload.local_id || uuidv4();
  const payloadWithLocalId = { ...payload, local_id: localId };

  // 1. Jika sedang offline — queue ke IndexedDB
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await OfflineSubmissionService.enqueueSubmission(
      payload.survey_id,
      payloadWithLocalId,
      localId
    );
    return {
      submission_id: localId,
      message:
        "Data survei berhasil disimpan secara lokal (Offline Mode). Akan dikirim otomatis saat terhubung ke internet.",
    };
  }

  // 2. Jika online — kirim ke backend dengan Idempotency-Key header
  try {
    const response = await axiosClient.post("/survey/submit", payloadWithLocalId, {
      headers: {
        "Idempotency-Key": localId,
      },
    });
    return response.data.data;
  } catch (error: any) {
    // 3. Network drop saat request berjalan — fallback ke offline queue
    if (!error.response && typeof navigator !== "undefined") {
      await OfflineSubmissionService.enqueueSubmission(
        payload.survey_id,
        payloadWithLocalId,
        localId
      );
      return {
        submission_id: localId,
        message:
          "Koneksi terputus saat pengiriman. Data survei Anda telah disimpan secara lokal & akan disinkronkan otomatis.",
      };
    }
    throw error;
  }
}

/**
 * submitBatchSurveys — POST /api/v1/survey/sync/batch
 * Mengirim banyak submission offline sekaligus dalam 1 request.
 */
export async function submitBatchSurveys(
  items: CreateSubmissionRequest[]
): Promise<BatchSyncResponseData> {
  const response = await axiosClient.post("/survey/sync/batch", { items });
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

/**
 * getMySubmissions — GET /api/v1/survey/my-submissions
 * Ambil daftar riwayat recall milik user yang sedang login.
 */
export async function getMySubmissions(
  page = 1,
  limit = 20
): Promise<SubmissionPage> {
  const response = await axiosClient.get("/survey/my-submissions", {
    params: { page, limit },
  });
  const data = response.data?.data ?? {};
  const submissions: SurveySubmission[] = data.submissions ?? [];

  return {
    submissions,
    total: data.pagination?.total ?? submissions.length,
  };
}

/**
 * getMySubmissionDetail — GET /api/v1/survey/my-submissions/:id
 * Ambil detail 1 riwayat recall milik user.
 */
export async function getMySubmissionDetail(id: string): Promise<SurveySubmission> {
  const response = await axiosClient.get(`/survey/my-submissions/${id}`);
  return response.data?.data;
}
