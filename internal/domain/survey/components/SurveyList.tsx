"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { getAccessToken } from "@/internal/lib/cookies";
import { getSurveys, deleteSurvey } from "../services/surveyService";
import type { Survey } from "../types/survey";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-200",
  draft: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  closed: "bg-gray-100 text-gray-500 border border-gray-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

export function SurveyList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getAccessToken() ?? "";
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const { data: surveys = [], isLoading, isError } = useQuery<Survey[]>({
    queryKey: ["admin-surveys"],
    queryFn: () => getSurveys(token),
    enabled: Boolean(token),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSurvey(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      setConfirmDeleteId(null);
    },
  });

  const handleCopyLink = (survey: Survey) => {
    const url = `${window.location.origin}/surveys/${survey.access_token}/join`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg(survey.id);
      setTimeout(() => setCopyMsg(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <EmptyState
          title="Gagal memuat survey"
          description="Terjadi kesalahan saat mengambil data. Pastikan Anda login sebagai admin."
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Survey</h1>
          <p className="text-sm text-muted mt-1">{surveys.length} survey ditemukan</p>
        </div>
        <Button onClick={() => router.push("/admin/surveys/new")}>
          + Buat Survey
        </Button>
      </div>

      {surveys.length === 0 ? (
        <EmptyState
          title="Belum ada survey"
          description="Buat survey untuk mulai mengumpulkan data recall makanan."
        />
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-surface rounded-xl border border-border p-5 hover:border-primary/30 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-semibold text-foreground truncate">{survey.name}</h2>
                    <StatusBadge status={survey.status} />
                  </div>
                  <p className="text-xs text-muted mt-1 font-mono">
                    slug: {survey.slug}
                  </p>
                  {survey.description && (
                    <p className="text-sm text-muted mt-1 line-clamp-1">{survey.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                    <span>Dibuat: {survey.created_at?.split(" ")[0] ?? "—"}</span>
                    {survey.start_date && <span>Mulai: {survey.start_date}</span>}
                    {survey.end_date && <span>Selesai: {survey.end_date}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {survey.access_token && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(survey)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-muted hover:text-primary transition-all"
                      title="Salin link join"
                    >
                      {copyMsg === survey.id ? "✓ Tersalin" : "🔗 Salin Link"}
                    </button>
                  )}
                  {survey.access_token && (
                    <Link
                      href={`/surveys/${survey.access_token}/join`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium"
                    >
                      Coba Join →
                    </Link>
                  )}
                  <Link
                    href={`/admin/surveys/${survey.id}/submissions`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 text-muted hover:text-primary transition-all"
                  >
                    Submissions
                  </Link>
                  <Link
                    href={`/admin/surveys/${survey.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 text-muted hover:text-primary transition-all"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(survey.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">Hapus Survey?</h3>
            <p className="text-muted text-sm mb-6">
              Tindakan ini tidak dapat dibatalkan. Semua data submission pada survey ini akan ikut terhapus.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-border text-foreground hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
