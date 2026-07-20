"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Images, Trash2 } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import {
  useAsServedSet,
  useCreateAsServedSet,
  useDeleteAsServedSet,
  useUpdateAsServedSet,
} from "../hooks/usePortionQueries";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

type FormValues = {
  code: string;
  name: string;
  description: string;
  category: string;
};

const EMPTY: FormValues = { code: "", name: "", description: "", category: "" };

/** Form set foto porsi — melayani mode tambah dan ubah */
export function AsServedSetForm() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;
  const isEdit = Boolean(id);

  const { data: existing, isLoading } = useAsServedSet(id);
  const create = useCreateAsServedSet();
  const update = useUpdateAsServedSet(id ?? "");
  const remove = useDeleteAsServedSet();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  // Penyesuaian saat render, bukan effect — lihat catatan yang sama di
  // CategoryForm soal render bertingkat.
  if (existing && loadedId !== existing.id) {
    setLoadedId(existing.id);
    setValues({
      code: existing.code,
      name: existing.name,
      description: existing.description ?? "",
      category: existing.category ?? "",
    });
  }

  const busy = create.isPending || update.isPending || remove.isPending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!values.code.trim() || !values.name.trim()) {
      setError("Kode dan nama wajib diisi");
      return;
    }

    setError(null);

    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
    };

    try {
      if (isEdit) {
        await update.mutateAsync(payload);
        router.push("/admin/as-served-sets");
      } else {
        const created = await create.mutateAsync(payload);
        // Set baru belum berguna tanpa foto — langsung antar ke pengelola foto
        router.push(`/admin/as-served-sets/${created.id}/images`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan set");
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm(`Hapus set "${values.name}" beserta seluruh fotonya?`)) return;

    setError(null);

    try {
      await remove.mutateAsync(id);
      router.push("/admin/as-served-sets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus set");
    }
  }

  if (isEdit && isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat set…</div>;
  }

  return (
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <h1 className="text-2xl font-bold text-text-primary m-0">
            {isEdit ? "Ubah Set Foto Porsi" : "Tambah Set Foto Porsi"}
          </h1>
          {isEdit && (
            <Link href={`/admin/as-served-sets/${id}/images`} className="btn btn-outline btn-sm">
              <Images size={14} />
              Kelola foto ({existing?.images?.length ?? 0})
            </Link>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className={SECTION}>
            <h2 className="text-base font-semibold text-text-primary m-0">Detail Set</h2>

            <Input
              id="code"
              name="code"
              label="Kode"
              placeholder="nasi-putih"
              value={values.code}
              onChange={(event) => setValues({ ...values, code: event.target.value })}
              required
            />

            <Input
              id="name"
              name="name"
              label="Nama"
              placeholder="Nasi Putih"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              required
            />

            <Input
              id="category"
              name="category"
              label="Kategori"
              placeholder="makanan-pokok"
              value={values.category}
              onChange={(event) => setValues({ ...values, category: event.target.value })}
            />

            <div className="flex flex-col w-full gap-2">
              <label htmlFor="description" className="form-label text-sm font-medium text-text-secondary">
                Deskripsi
              </label>
              <textarea
                id="description"
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
                className="w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans transition-base focus:border-primary focus:shadow-focus"
              />
            </div>
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
              onClick={() => router.push("/admin/as-served-sets")}
              disabled={busy}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={busy}>
              {isEdit ? "Simpan Perubahan" : "Simpan & Tambah Foto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
