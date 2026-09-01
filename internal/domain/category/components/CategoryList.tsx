"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { AdminSearchInput, AdminToolbar } from "@/internal/components/admin/AdminToolbar";
import { Plus, ChevronRight, FolderOpen } from "lucide-react";
import { useAdminCategories } from "../hooks/useCategoryQueries";

/**
 * Daftar kategori admin. Endpoint kategori mengembalikan seluruh isinya tanpa
 * pagination — jumlahnya memang belasan — jadi pencarian dikerjakan di klien
 * dan tidak ada kontrol halaman yang perlu ditampilkan.
 */
export function CategoryList() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminCategories();
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const all = data ?? [];
    if (!keyword) return all;
    return all.filter(
      (cat) =>
        cat.name.toLowerCase().includes(keyword) || (cat.code ?? "").toLowerCase().includes(keyword)
    );
  }, [data, search]);

  if (isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat kategori…</div>;
  }

  if (error) {
    return (
      <div className="p-6 px-8">
        <div className="alert alert-danger">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gagal memuat kategori"}
          </span>
        </div>
      </div>
    );
  }

  const hasFilter = Boolean(search.trim());

  return (
    <div className="p-6 px-8">
      <PageHeader
        title="Kategori"
        description={`${(data ?? []).length} kategori mengelompokkan makanan di Find Food`}
        action={
          <Button onClick={() => router.push("/admin/categories/new")}>
            <Plus size={15} /> Tambah Kategori
          </Button>
        }
      />

      <AdminToolbar>
        <AdminSearchInput
          label="Cari kategori"
          placeholder="Cari nama atau kode…"
          value={search}
          onChange={setSearch}
        />
      </AdminToolbar>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={40} className="text-text-muted" />}
          title={hasFilter ? "Tidak ada hasil" : "Belum ada kategori"}
          description={
            hasFilter
              ? "Coba kata kunci lain."
              : "Tambahkan kategori untuk mengelompokkan makanan."
          }
          action={
            !hasFilter ? (
              <Button onClick={() => router.push("/admin/categories/new")}>
                <Plus size={14} /> Tambah Kategori
              </Button>
            ) : undefined
          }
        />
      ) : (
        /* Master Data Table Kategori */
        <div className="table-wrapper bg-surface shadow-xs">
          <table className="table">
            <thead>
              <tr>
                <th>Ikon & Kategori</th>
                <th>Kode</th>
                <th>Urutan Tampilan</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-alt transition-fast">
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg">
                        {cat.icon || "📁"}
                      </span>
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className="font-semibold text-text-primary no-underline hover:text-primary hover:underline truncate"
                      >
                        {cat.name}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-semibold text-text-secondary">{cat.code}</span>
                  </td>
                  <td className="text-xs text-text-muted">
                    {cat.display_order ?? "—"}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary no-underline hover:border-primary-border hover:text-primary transition-fast"
                    >
                      Edit <ChevronRight size={14} />
                    </Link>
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
