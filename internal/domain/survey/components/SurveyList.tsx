"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import {
  AdminSearchInput,
  AdminSelect,
  AdminToolbar,
} from "@/internal/components/admin/AdminToolbar";
import { AdminPagination } from "@/internal/components/admin/AdminPagination";
import { getAccessToken } from "@/internal/lib/cookies";
import { getSurveys, deleteSurvey } from "../services/surveyService";
import type { Survey } from "../types/survey";
import { Pencil, Trash2, FileText, Plus, AlertTriangle, ClipboardList, X } from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_CLASS: Record<string, string> = {
  active: "badge-success",
  draft: "badge-warning",
  closed: "badge-default",
};

const SORTERS: Record<string, (a: Survey, b: Survey) => number> = {
  newest: (a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  oldest: (a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""),
  name: (a, b) => a.name.localeCompare(b.name, "id"),
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

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const {
    data: surveys = [],
    isLoading,
    isError,
  } = useQuery<Survey[]>({
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

  // Endpoint daftar survey belum punya parameter pencarian/status/urutan, jadi
  // penyaringan dikerjakan di sini. Aman karena satu admin hanya memegang
  // puluhan survey, bukan ribuan.
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return surveys
      .filter((survey) => {
        if (status && survey.status !== status) return false;
        if (!keyword) return true;
        return (
          survey.name.toLowerCase().includes(keyword) ||
          (survey.slug ?? "").toLowerCase().includes(keyword) ||
          (survey.description ?? "").toLowerCase().includes(keyword)
        );
      })
      .sort(SORTERS[sort] ?? SORTERS.newest);
  }, [surveys, search, status, sort]);

  const filterKey = `${search}|${status}|${sort}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  // Halaman bisa jadi tidak valid lagi setelah survey dihapus (mis. menghapus
  // satu-satunya item di halaman terakhir) — turunkan ke halaman terakhir yang
  // masih punya data, bukan dibiarkan menampilkan daftar kosong.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (page > totalPages) {
    setPage(totalPages);
  }

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilter = Boolean(search.trim() || status);

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
        <EmptyState
          icon={<AlertTriangle size={40} className="text-warning" />}
          title="Gagal memuat survey"
          description="Terjadi kesalahan. Pastikan Anda login sebagai admin."
        />
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      <PageHeader
        title="Survey"
        description={`${surveys.length} survey · Responden login lalu buka menu Survey Recall`}
        action={
          <Button onClick={() => router.push("/admin/surveys/new")}>
            <Plus size={15} /> Buat Survey
          </Button>
        }
      />

      <AdminToolbar>
        <AdminSearchInput
          label="Cari survey"
          placeholder="Cari nama, slug, atau deskripsi…"
          value={search}
          onChange={setSearch}
        />
        <AdminSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: "Semua" },
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <AdminSelect
          label="Urutkan"
          value={sort}
          onChange={setSort}
          options={[
            { value: "newest", label: "Terbaru" },
            { value: "oldest", label: "Terlama" },
            { value: "name", label: "Nama A–Z" },
          ]}
        />
      </AdminToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} className="text-text-muted" />}
          title={hasFilter ? "Tidak ada hasil" : "Belum ada survey"}
          description={
            hasFilter
              ? "Coba ubah kata kunci atau status."
              : "Buat survey untuk mulai mengumpulkan data recall makanan."
          }
          action={
            !hasFilter ? (
              <Button onClick={() => router.push("/admin/surveys/new")}>
                <Plus size={14} /> Buat Survey
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visible.map((survey) => (
              <div
                key={survey.id}
                className="card p-5 transition-base hover:border-primary-border hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h2 className="m-0 truncate text-base font-semibold text-text-primary">
                        {survey.name}
                      </h2>
                      <StatusBadge status={survey.status} />
                    </div>
                    <p className="mb-2 mt-0 font-mono text-xs text-text-muted">
                      slug: {survey.slug}
                    </p>
                    {survey.description && (
                      <p className="mb-2 mt-0 truncate text-sm text-text-muted">
                        {survey.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                      <span>Dibuat: {survey.created_at?.split(" ")[0] ?? "—"}</span>
                      {survey.start_date && <span>Mulai: {survey.start_date}</span>}
                      {survey.end_date && <span>Selesai: {survey.end_date}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <Link
                      href={`/admin/surveys/${survey.id}/submissions`}
                      className="inline-flex items-center gap-1 rounded-md border-[1.5px] border-border bg-surface py-1.5 px-3 text-xs font-medium text-text-muted no-underline transition-fast hover:border-primary-border hover:text-primary"
                    >
                      <FileText size={12} /> Submissions
                    </Link>
                    <Link
                      href={`/admin/surveys/${survey.id}`}
                      className="inline-flex items-center gap-1 rounded-md border-[1.5px] border-border bg-surface py-1.5 px-3 text-xs font-medium text-text-muted no-underline transition-fast hover:border-primary-border hover:text-primary"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(survey.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border-[1.5px] border-danger-border bg-surface py-1.5 px-3 font-sans text-xs font-medium text-danger transition-fast hover:bg-danger-light"
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            page={page}
            limit={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
            unit="survey"
          />
        </>
      )}

      {confirmDeleteId && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDeleteId(null);
          }}
        >
          <div className="modal modal-sm">
            <div className="modal-header">
              <AlertTriangle size={18} className="text-danger" />
              <h3 className="modal-title">Hapus Survey?</h3>
              <button className="modal-close" onClick={() => setConfirmDeleteId(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="modal-body">
              <p className="m-0 text-sm text-text-muted">
                Tindakan ini tidak dapat dibatalkan. Semua data submission pada survey ini akan ikut
                terhapus.
              </p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteId(null)}>
                Batal
              </Button>
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
