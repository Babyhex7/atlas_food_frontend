"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { useAnnotationList } from "../hooks/useAnnotationQueries";
import { useDeleteAnnotation } from "../hooks/useAnnotationMutations";
import { ANNOTATION_STATUS_CLASS, ANNOTATION_STATUS_LABEL } from "../constants/annotationStatus";
import type { AnnotationStatus } from "../types/annotation";

const FILTERS: { value: AnnotationStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

/** Tabel gambar anotasi dengan filter status (brief §8) */
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
    <div className="p-6 px-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Anotasi</h1>
          <p className="text-sm text-text-muted m-0">
            Foto scene dengan area polygon untuk Find Food
          </p>
        </div>

        <Link href="/admin/annotations/new" className="btn btn-primary btn-sm ml-auto">
          <Plus size={15} />
          Gambar baru
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn("btn btn-sm", status === filter.value ? "btn-primary" : "btn-outline")}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari judul…"
          className="text-sm max-w-xs"
        />
      </div>

      {isLoading && <p className="text-sm text-text-muted">Memuat…</p>}

      {error && (
        <div className="alert alert-danger">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gagal memuat daftar anotasi"}
          </span>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="card">
          <div className="card-body text-center">
            <p className="text-sm text-text-muted m-0">
              Belum ada gambar anotasi. Mulai dengan mengunggah foto scene.
            </p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 72 }}>Gambar</th>
                <th>Judul</th>
                <th>Status</th>
                <th>Area</th>
                <th>Diperbarui</th>
                <th style={{ width: 100 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* next/image tidak dipakai: host uploads tidak terdaftar
                        di next.config remotePatterns, sama seperti ProfileCard. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_ASSET_ORIGIN}${item.thumbnail_url || item.image_url}`}
                      alt={item.title}
                      className="w-14 h-10 object-cover rounded-sm border border-border"
                    />
                  </td>
                  <td>
                    <Link href={`/admin/annotations/${item.id}`} className="font-medium">
                      {item.title}
                    </Link>
                    <div className="text-xs text-text-muted">
                      {item.width} × {item.height} px
                    </div>
                  </td>
                  <td>
                    <span className={ANNOTATION_STATUS_CLASS[item.status]}>
                      {ANNOTATION_STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td className="tabular-nums">{item.areas_count}</td>
                  <td className="text-xs text-text-muted">
                    {new Date(item.updated_at).toLocaleString("id-ID")}
                  </td>
                  <td>
                    <div className="flex gap-1 justify-end">
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
                        title="Hapus"
                      >
                        <Trash2 size={13} />
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
