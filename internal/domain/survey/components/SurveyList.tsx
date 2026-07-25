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
import { Pencil, Trash2, FileText, Plus, AlertTriangle, ClipboardList, X } from "lucide-react";

const STATUS_CLASS: Record<string, string> = {
  active: "badge-success",
  draft:  "badge-warning",
  closed: "badge-default",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] ?? "badge-default"}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function SurveyList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getAccessToken() ?? "";
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <EmptyState icon={<AlertTriangle size={40} className="text-warning" />} title="Gagal memuat survey" description="Terjadi kesalahan. Pastikan Anda login sebagai admin." />
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mt-0 mb-1">
            Survey
          </h1>
          <p className="text-sm text-text-muted m-0">
            {surveys.length} survey ditemukan · Responden login lalu buka menu Survey Recall
          </p>
        </div>
        <Button onClick={() => router.push("/admin/surveys/new")}>
          <Plus size={15} /> Buat Survey
        </Button>
      </div>

      {surveys.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} className="text-text-muted" />}
          title="Belum ada survey"
          description="Buat survey untuk mulai mengumpulkan data recall makanan."
          action={<Button onClick={() => router.push("/admin/surveys/new")}><Plus size={14} /> Buat Survey</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="card p-5 transition-base hover:border-primary-border hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-base font-semibold text-text-primary m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {survey.name}
                    </h2>
                    <StatusBadge status={survey.status} />
                  </div>
                  <p className="text-xs text-text-muted font-mono mb-2 mt-0">
                    slug: {survey.slug}
                  </p>
                  {survey.description && (
                    <p className="text-sm text-text-muted mb-2 mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {survey.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-text-muted flex-wrap">
                    <span>Dibuat: {survey.created_at?.split(" ")[0] ?? "—"}</span>
                    {survey.start_date && <span>Mulai: {survey.start_date}</span>}
                    {survey.end_date   && <span>Selesai: {survey.end_date}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Link
                    href={`/admin/surveys/${survey.id}/submissions`}
                    className="inline-flex items-center gap-1 py-1.5 px-3 rounded-md border-[1.5px] border-border bg-surface text-text-muted text-xs font-medium no-underline transition-fast hover:border-primary-border hover:text-primary"
                  >
                    <FileText size={12} /> Submissions
                  </Link>
                  <Link
                    href={`/admin/surveys/${survey.id}`}
                    className="inline-flex items-center gap-1 py-1.5 px-3 rounded-md border-[1.5px] border-border bg-surface text-text-muted text-xs font-medium no-underline transition-fast hover:border-primary-border hover:text-primary"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(survey.id)}
                    className="inline-flex items-center gap-1 py-1.5 px-3 rounded-md border-[1.5px] border-danger-border bg-surface text-danger text-xs font-medium cursor-pointer transition-fast font-sans hover:bg-danger-light"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeleteId(null); }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <AlertTriangle size={18} className="text-danger" />
              <h3 className="modal-title">Hapus Survey?</h3>
              <button className="modal-close" onClick={() => setConfirmDeleteId(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-text-muted m-0">
                Tindakan ini tidak dapat dibatalkan. Semua data submission pada survey ini akan ikut terhapus.
              </p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
