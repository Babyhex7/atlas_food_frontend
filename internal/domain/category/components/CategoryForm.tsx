"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import {
  useCategoryDetail,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategoryQueries";
import { categoryValidation } from "../schemas/categorySchema";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

type FormValues = {
  code: string;
  name: string;
  icon: string;
  display_order: number;
};

const EMPTY: FormValues = { code: "", name: "", icon: "", display_order: 0 };

/**
 * Form kategori untuk mode tambah maupun ubah.
 *
 * Route /admin/categories/new tidak punya param id sedangkan
 * /admin/categories/[id] punya — satu komponen melayani keduanya agar
 * aturan validasi tidak terduplikasi.
 */
export function CategoryForm() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;
  const isEdit = Boolean(id);

  const { data: existing, isLoading } = useCategoryDetail(id);
  const create = useCreateCategory();
  const update = useUpdateCategory(id ?? "");
  const remove = useDeleteCategory();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  // Isi form saat data kategori tiba. Penyesuaian dilakukan saat render
  // (pola resmi React "adjusting state when props change") — memakai effect
  // di sini akan memicu render bertingkat setiap kali query menyegarkan data.
  if (existing && loadedId !== existing.id) {
    setLoadedId(existing.id);
    setValues({
      code: existing.code,
      name: existing.name,
      icon: existing.icon ?? "",
      display_order: existing.display_order ?? 0,
    });
  }

  const busy = create.isPending || update.isPending || remove.isPending;

  function validate(): string | null {
    const code = values.code.trim();
    const name = values.name.trim();

    if (code.length < categoryValidation.code.minLength) {
      return `Kode minimal ${categoryValidation.code.minLength} karakter`;
    }
    if (code.length > categoryValidation.code.maxLength) {
      return `Kode maksimal ${categoryValidation.code.maxLength} karakter`;
    }
    if (name.length < categoryValidation.name.minLength) {
      return `Nama minimal ${categoryValidation.name.minLength} karakter`;
    }
    if (name.length > categoryValidation.name.maxLength) {
      return `Nama maksimal ${categoryValidation.name.maxLength} karakter`;
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      icon: values.icon.trim(),
      display_order: values.display_order,
    };

    try {
      if (isEdit) await update.mutateAsync(payload);
      else await create.mutateAsync(payload);

      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kategori");
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm(`Hapus kategori "${values.name}"?`)) return;

    setError(null);

    try {
      await remove.mutateAsync(id);
      router.push("/admin/categories");
    } catch (err) {
      // Backend menolak menghapus kategori yang masih dipakai food —
      // pesannya ditampilkan apa adanya agar admin tahu harus berbuat apa.
      setError(err instanceof Error ? err.message : "Gagal menghapus kategori");
    }
  }

  if (isEdit && isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat kategori…</div>;
  }

  return (
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        <PageHeader
          title={isEdit ? "Ubah Kategori" : "Tambah Kategori"}
          description="Kategori mengelompokkan makanan di Find Food dan menjadi saringan di daftar admin."
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className={SECTION}>
            <h2 className="text-base font-semibold text-text-primary m-0">Detail Kategori</h2>

            <Input
              id="code"
              name="code"
              label="Kode"
              placeholder="MP"
              value={values.code}
              onChange={(event) => setValues({ ...values, code: event.target.value })}
              helper="Dipakai di URL Find Food, mis. /find-food/category/MP"
              required
            />

            <Input
              id="name"
              name="name"
              label="Nama Kategori"
              placeholder="Makanan Pokok"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              required
            />

            <Input
              id="icon"
              name="icon"
              label="Ikon (emoji)"
              placeholder="🍚"
              value={values.icon}
              onChange={(event) => setValues({ ...values, icon: event.target.value })}
              helper="Gunakan emoji sebagai ikon kategori, misal: 🍚 🍗 🥬"
            />

            <Input
              id="display_order"
              name="display_order"
              type="number"
              label="Urutan tampil"
              value={String(values.display_order)}
              onChange={(event) =>
                setValues({ ...values, display_order: Number(event.target.value) || 0 })
              }
              helper="Angka kecil tampil lebih dulu"
            />
          </div>

          {error && (
            <div className="alert alert-danger">
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={busy}>
                <Trash2 size={14} />
                Hapus
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/admin/categories")}
              disabled={busy}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={busy}>
              {isEdit ? "Simpan Perubahan" : "Simpan Kategori"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
