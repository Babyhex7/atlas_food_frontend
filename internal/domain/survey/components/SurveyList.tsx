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
import { Copy, Check, ExternalLink, Pencil, Trash2, FileText, Plus, AlertTriangle } from "lucide-react";

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
      <div style={{ padding: "var(--space-8)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-xl)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "var(--space-8)" }}>
        <EmptyState icon="⚠️" title="Gagal memuat survey" description="Terjadi kesalahan. Pastikan Anda login sebagai admin." />
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-6) var(--space-8)" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-8)", gap: "var(--space-4)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>
            Survey
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
            {surveys.length} survey ditemukan
          </p>
        </div>
        <Button onClick={() => router.push("/admin/surveys/new")}>
          <Plus size={15} /> Buat Survey
        </Button>
      </div>

      {surveys.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Belum ada survey"
          description="Buat survey untuk mulai mengumpulkan data recall makanan."
          action={<Button onClick={() => router.push("/admin/surveys/new")}><Plus size={14} /> Buat Survey</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="card"
              style={{ padding: "var(--space-5)", transition: "var(--transition-base)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-1)" }}>
                    <h2 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {survey.name}
                    </h2>
                    <StatusBadge status={survey.status} />
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", margin: "0 0 var(--space-2)" }}>
                    slug: {survey.slug}
                  </p>
                  {survey.description && (
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {survey.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", flexWrap: "wrap" }}>
                    <span>Dibuat: {survey.created_at?.split(" ")[0] ?? "—"}</span>
                    {survey.start_date && <span>Mulai: {survey.start_date}</span>}
                    {survey.end_date   && <span>Selesai: {survey.end_date}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {survey.access_token && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(survey)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "var(--space-1)",
                        padding: "6px 12px", borderRadius: "var(--radius-md)",
                        border: "1.5px solid var(--color-border)",
                        background: "var(--color-surface)",
                        color: copyMsg === survey.id ? "var(--color-success)" : "var(--color-text-muted)",
                        fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)",
                        cursor: "pointer", transition: "var(--transition-fast)",
                        fontFamily: "var(--font-sans)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-primary-border)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = copyMsg === survey.id ? "var(--color-success)" : "var(--color-text-muted)"; }}
                    >
                      {copyMsg === survey.id ? <><Check size={12} /> Tersalin</> : <><Copy size={12} /> Salin Link</>}
                    </button>
                  )}
                  {survey.access_token && (
                    <Link
                      href={`/surveys/${survey.access_token}/join`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "var(--space-1)",
                        padding: "6px 12px", borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)",
                        border: "1.5px solid var(--color-primary-border)",
                        fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                        textDecoration: "none", transition: "var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-muted)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-primary-light)"; }}
                    >
                      <ExternalLink size={12} /> Coba Join
                    </Link>
                  )}
                  <Link
                    href={`/admin/surveys/${survey.id}/submissions`}
                    style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textDecoration: "none", transition: "var(--transition-fast)" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-primary-border)"; el.style.color = "var(--color-primary)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-border)"; el.style.color = "var(--color-text-muted)"; }}
                  >
                    <FileText size={12} /> Submissions
                  </Link>
                  <Link
                    href={`/admin/surveys/${survey.id}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-muted)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textDecoration: "none", transition: "var(--transition-fast)" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-primary-border)"; el.style.color = "var(--color-primary)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-border)"; el.style.color = "var(--color-text-muted)"; }}
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(survey.id)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-danger-border)", background: "var(--color-surface)", color: "var(--color-danger)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", transition: "var(--transition-fast)", fontFamily: "var(--font-sans)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-danger-light)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-surface)"; }}
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeleteId(null); }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <AlertTriangle size={18} style={{ color: "var(--color-danger)" }} />
              <h3 className="modal-title">Hapus Survey?</h3>
              <button className="modal-close" onClick={() => setConfirmDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
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
