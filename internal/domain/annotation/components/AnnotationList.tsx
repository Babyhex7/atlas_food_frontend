"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { useAnnotationList } from "../hooks/useAnnotationQueries";
import { useDeleteAnnotation } from "../hooks/useAnnotationMutations";
import { ANNOTATION_STATUS_CLASS, ANNOTATION_STATUS_LABEL } from "../constants/annotationStatus";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import {
  AdminSearchInput,
  AdminSelect,
  AdminToolbar,
} from "@/internal/components/admin/AdminToolbar";
import type { AnnotationStatus } from "../types/annotation";

const FILTERS: { value: AnnotationStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

/** Tabel gambar anotasi dengan filter status */
export function AnnotationList() {
  const [status, setStatus] = useState<AnnotationStatus | "">("");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useAnnotationList({ status, search });
  const deleteAnnotation = useDeleteAnnotation();

  const items = data?.items ?? [];

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Hapus anotasi "${title}" beserta seluruh areanya?`)) return;
    deleteAnnotation.mutate(id);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Anotasi"
        description="Foto scene dengan area poligon untuk Find Food"
        action={
          <Link href="/admin/annotations/new" className="btn btn-primary btn-sm">
            <Plus size={13} aria-hidden /> Gambar baru
          </Link>
        }
      />

      <AdminToolbar>
        <AdminSearchInput
          label="Cari anotasi"
          placeholder="Cari judul…"
          value={search}
          onChange={setSearch}
        />
        <AdminSelect
          label="Status"
          value={status}
          onChange={(val) => setStatus(val as AnnotationStatus | "")}
          options={FILTERS.map((f) => ({ value: f.value, label: f.label }))}
        />
      </AdminToolbar>

      {error && (
        <div className="alert alert-danger mb-4">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gagal memuat daftar anotasi"}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="skeleton h-14 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon size={32} className="text-text-muted" />}
          title={search || status ? "Tidak ada hasil" : "Belum ada anotasi"}
          description={
            search || status
              ? "Coba ubah kata kunci atau filter."
              : "Unggah foto scene untuk memulai anotasi poligon."
          }
          action={
            !search && !status ? (
              <Link href="/admin/annotations/new" className="btn btn-primary btn-sm">
                <Plus size={13} aria-hidden /> Gambar baru
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 68 }}>Gambar</th>
                <th>Judul</th>
                <th>Status</th>
                <th>Area</th>
                <th>Diperbarui</th>
                <th style={{ width: 96 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_ASSET_ORIGIN}${item.thumbnail_url || item.image_url}`}
                      alt={item.title}
                      className="h-9 w-12 rounded border border-border object-cover"
                    />
                  </td>
                  <td>
                    <Link
                      href={`/admin/annotations/${item.id}`}
                      className="block font-medium text-text-primary no-underline hover:text-primary hover:underline"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[11px] text-text-muted">
                      {item.width} × {item.height} px
                    </span>
                  </td>
                  <td>
                    <span className={cn(ANNOTATION_STATUS_CLASS[item.status], "text-[11px]")}>
                      {ANNOTATION_STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td className="tabular-nums text-sm">{item.areas_count}</td>
                  <td className="text-xs text-text-muted">
                    {new Date(item.updated_at).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/annotations/${item.id}`}
                        className="btn btn-outline btn-xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deleteAnnotation.isPending}
                        className="btn btn-ghost btn-xs btn-icon"
                        title="Hapus anotasi"
                        aria-label="Hapus anotasi"
                      >
                        <Trash2 size={13} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
