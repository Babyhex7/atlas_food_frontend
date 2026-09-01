"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import {
  AdminSearchInput,
  AdminSelect,
  AdminToolbar,
} from "@/internal/components/admin/AdminToolbar";
import { AdminPagination } from "@/internal/components/admin/AdminPagination";
import { Plus, ChevronRight, UtensilsCrossed } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import { useAdminFoods } from "../hooks/useFoodQueries";
import { useAdminCategories } from "@/internal/domain/category/hooks/useCategoryQueries";

const PAGE_SIZE = 20;

/**
 * Daftar makanan admin. Pencarian, saringan, dan pagination semuanya dikerjakan
 * backend (GET /admin/foods) — daftar ini hanya memegang satu halaman, bukan
 * memuat seluruh tabel lalu memotongnya di browser.
 */
export function FoodList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = useAdminCategories();

  // Pencarian dari top bar dikirim lewat ?q= supaya hasilnya bisa dibagikan.
  const queryFromUrl = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(queryFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(queryFromUrl);

  // ?q= juga harus mengambil alih saat halaman ini SUDAH terbuka: mencari lewat
  // top bar dari /admin/foods hanya mengganti query string tanpa melepas
  // komponen, jadi nilai awal useState saja tidak pernah ikut berubah.
  const [lastQueryFromUrl, setLastQueryFromUrl] = useState(queryFromUrl);
  if (queryFromUrl !== lastQueryFromUrl) {
    setLastQueryFromUrl(queryFromUrl);
    setSearch(queryFromUrl);
    setDebouncedSearch(queryFromUrl);
  }
  const [category, setCategory] = useState("");
  const [photoType, setPhotoType] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Setiap perubahan saringan harus melempar balik ke halaman 1: bertahan di
  // halaman 5 pada hasil yang cuma 2 halaman membuat daftar tampak kosong.
  const filterKey = `${debouncedSearch}|${category}|${photoType}|${isActive}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const { data, isLoading, isFetching, error } = useAdminFoods({
    page,
    limit: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category ? { category } : {}),
    ...(photoType ? { photo_type: photoType } : {}),
    ...(isActive ? { is_active: isActive } : {}),
  });

  const foods = data?.foods ?? [];
  const total = data?.pagination?.total ?? 0;
  const hasFilter = Boolean(debouncedSearch || category || photoType || isActive);

  return (
    <div className="p-6 px-8">
      <PageHeader
        title="Makanan"
        description={isLoading ? "Memuat…" : `${total} makanan di database`}
        action={
          <Button onClick={() => router.push("/admin/foods/new")}>
            <Plus size={15} /> Tambah Makanan
          </Button>
        }
      />

      <AdminToolbar>
        <AdminSearchInput
          label="Cari makanan"
          placeholder="Cari nama, kode, atau nama lokal…"
          value={search}
          onChange={setSearch}
        />
        <AdminSelect
          label="Kategori"
          value={category}
          onChange={setCategory}
          options={[
            { value: "", label: "Semua" },
            ...(categories ?? []).map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
        />
        <AdminSelect
          label="Tipe foto"
          value={photoType}
          onChange={setPhotoType}
          options={[
            { value: "", label: "Semua" },
            { value: "series", label: "Series" },
            { value: "range", label: "Range" },
          ]}
        />
        <AdminSelect
          label="Status"
          value={isActive}
          onChange={setIsActive}
          options={[
            { value: "", label: "Semua" },
            { value: "true", label: "Aktif" },
            { value: "false", label: "Nonaktif" },
          ]}
        />
        {hasFilter ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("");
              setPhotoType("");
              setIsActive("");
            }}
            className="h-10 cursor-pointer rounded-lg border-none bg-transparent px-2 font-sans text-sm font-medium text-text-muted transition-fast hover:text-primary"
          >
            Reset saringan
          </button>
        ) : null}
      </AdminToolbar>

      {error && (
        <div className="alert alert-danger mb-4">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gagal memuat daftar makanan"}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={40} className="text-text-muted" />}
          title={hasFilter ? "Tidak ada hasil" : "Belum ada makanan"}
          description={
            hasFilter
              ? "Coba ubah kata kunci atau saringan."
              : "Tambahkan makanan ke database Atlas Food."
          }
          action={
            !hasFilter ? (
              <Button onClick={() => router.push("/admin/foods/new")}>
                <Plus size={14} /> Tambah Makanan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Master Data Table Makanan */}
          <div
            aria-busy={isFetching}
            className={cn("table-wrapper bg-surface shadow-xs transition-opacity", isFetching && "opacity-60")}
          >
            <table className="table">
              <thead>
                <tr>
                  <th>Makanan & Kode</th>
                  <th>Kategori</th>
                  <th>Tipe Foto</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id} className="group hover:bg-surface-alt transition-fast">
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg">
                          {food.category?.icon || "🍽️"}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/foods/${food.id}`}
                            className="font-semibold text-text-primary no-underline hover:text-primary hover:underline block truncate"
                          >
                            {food.name}
                          </Link>
                          {food.local_name && (
                            <span className="text-xs text-text-muted block truncate">
                              {food.local_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {food.category?.name ? (
                        <span className="badge badge-primary">{food.category.name}</span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {food.photo_type ? (
                        <span className="badge badge-default uppercase">{food.photo_type}</span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {food.is_active === false ? (
                        <span className="badge badge-danger">Nonaktif</span>
                      ) : (
                        <span className="badge badge-success">Aktif</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/foods/${food.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary no-underline hover:border-primary-border hover:text-primary transition-fast"
                      >
                        Detail <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            unit="makanan"
          />
        </>
      )}
    </div>
  );
}
