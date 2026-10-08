"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { offlineDb } from "@/internal/lib/offlineDb";
import { SyncEngine } from "@/internal/lib/syncEngine";
import { useOnlineStatus } from "@/internal/hooks/useOnlineStatus";
import { analyzeNutrition, fetchStoredAnalysis, toAiError } from "../services/aiService";
import type { AiError, AnalysisPhase, NutritionAnalysisResult } from "../types/ai";

export const analysisQueryKey = (submissionId: string) => ["ai", "nutrition-analysis", submissionId];

/**
 * Apakah submission ini masih berada di antrean luring.
 *
 * Laporan yang dikirim tanpa koneksi memakai `localId` sebagai submission_id
 * sementara. Selama masih antre, server belum mengenalnya — meminta analisis
 * hanya akan menghasilkan 404. Status dibaca ulang setiap kali mesin
 * sinkronisasi melaporkan perubahan, sehingga panel terbuka sendiri begitu
 * laporan sampai ke server.
 */
function useIsQueuedOffline(submissionId: string | undefined): boolean | undefined {
  const [queued, setQueued] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!submissionId) return;

    let cancelled = false;
    const check = () => {
      offlineDb.offlineQueue
        .where("localId")
        .equals(submissionId)
        .count()
        .then((count) => {
          if (!cancelled) setQueued(count > 0);
        })
        // IndexedDB tidak tersedia (mode privat tertentu): anggap tidak antre
        // agar panel tidak tertahan selamanya.
        .catch(() => {
          if (!cancelled) setQueued(false);
        });
    };

    // Periksa langsung, jangan hanya menunggu notifikasi mesin sinkronisasi:
    // bila IndexedDB bermasalah mesin itu tidak pernah memanggil listener-nya,
    // dan panel akan tertahan di "memeriksa" selamanya.
    check();
    const unsubscribe = SyncEngine.subscribe(check);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [submissionId]);

  return submissionId ? queued : false;
}

export type UseNutritionAnalysis = {
  phase: AnalysisPhase;
  result: NutritionAnalysisResult | null;
  error: AiError | null;
  /** true selama analisis ulang berjalan di atas hasil yang sedang tampil. */
  isRefreshing: boolean;
  isOnline: boolean;
  /** Jalankan analisis pertama, atau ulangi setelah gagal. */
  analyze: () => void;
  /** Minta analisis baru walaupun hasil sudah ada. */
  refresh: () => void;
};

/**
 * useNutritionAnalysis — seluruh keadaan panel rekomendasi AI untuk satu submission.
 *
 * Dua sumber data digabung:
 * - query: hasil yang sudah tersimpan di server, diambil otomatis saat panel
 *   dibuka (murah, tidak menyentuh LLM), sehingga user yang kembali ke halaman
 *   langsung melihat hasil lamanya;
 * - mutation: pemanggilan LLM, hanya atas aksi user karena berbiaya.
 *
 * Hasil mutation ditulis ke cache query, jadi hanya ada satu sumber kebenaran
 * untuk "hasil yang sedang ditampilkan".
 */
export function useNutritionAnalysis(submissionId: string | undefined): UseNutritionAnalysis {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const isQueued = useIsQueuedOffline(submissionId);

  const canReachServer = Boolean(submissionId) && isOnline && isQueued === false;

  const stored = useQuery({
    queryKey: analysisQueryKey(submissionId ?? ""),
    queryFn: () => fetchStoredAnalysis(submissionId as string),
    enabled: canReachServer,
    // Hasil hanya berubah lewat mutation di bawah, yang menulis langsung ke cache.
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation<NutritionAnalysisResult, unknown, { forceRefresh: boolean }>({
    mutationFn: ({ forceRefresh }) => analyzeNutrition(submissionId as string, { forceRefresh }),
    onSuccess: (result) => {
      if (submissionId) queryClient.setQueryData(analysisQueryKey(submissionId), result);
    },
    // Kegagalan ditampilkan dengan tombol coba lagi; retry otomatis hanya
    // menahan UI lebih lama dan menggandakan pemakaian kuota.
    retry: false,
  });

  const { mutate, isPending } = mutation;
  const run = useCallback(
    (forceRefresh: boolean) => {
      if (!canReachServer || isPending) return;
      mutate({ forceRefresh });
    },
    [canReachServer, isPending, mutate]
  );
  const analyze = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);

  const result = stored.data ?? null;
  const error = mutation.isError ? toAiError(mutation.error) : null;

  return {
    phase: resolvePhase({
      hasSubmission: Boolean(submissionId),
      isQueued,
      isOnline,
      hasResult: result !== null,
      // Gagal memeriksa hasil tersimpan tidak menghalangi user: perlakukan
      // sebagai "belum ada" dan biarkan tombol analisis tampil.
      isChecking: stored.isLoading,
      isAnalyzing: isPending,
      hasError: error !== null,
    }),
    result,
    error,
    isRefreshing: isPending && result !== null,
    isOnline,
    analyze,
    refresh,
  };
}

/**
 * Tentukan tahap tampilan. Urutan pemeriksaan adalah prioritasnya: hasil yang
 * sudah ada selalu ditampilkan — termasuk saat luring atau saat analisis ulang
 * gagal — karena menyembunyikan hasil yang valid lebih merugikan user.
 */
function resolvePhase(s: {
  hasSubmission: boolean;
  isQueued: boolean | undefined;
  isOnline: boolean;
  hasResult: boolean;
  isChecking: boolean;
  isAnalyzing: boolean;
  hasError: boolean;
}): AnalysisPhase {
  if (!s.hasSubmission) return "unavailable";
  if (s.hasResult) return "ready";
  if (s.isQueued === undefined) return "checking";
  if (s.isQueued) return "queued";
  if (!s.isOnline) return "offline";
  if (s.isAnalyzing) return "analyzing";
  if (s.isChecking) return "checking";
  if (s.hasError) return "error";
  return "idle";
}
