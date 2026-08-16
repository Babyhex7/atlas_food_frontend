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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/admin/categories/${cat.id}`}
              className="flex items-center gap-4 rounded-xl border-[1.5px] border-border bg-surface p-4 no-underline transition-base hover:-translate-y-0.5 hover:border-primary-border hover:bg-primary-light hover:shadow-sm"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-light">
                {cat.icon ? (
                  <span className="text-2xl">{cat.icon}</span>
                ) : (
                  <FolderOpen size={22} className="text-primary" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-0.5 block truncate text-sm font-semibold text-text-primary">
                  {cat.name}
                </span>
                <span className="block truncate font-mono text-xs text-text-muted">{cat.code}</span>
              </span>
              <ChevronRight size={16} aria-hidden className="shrink-0 text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
