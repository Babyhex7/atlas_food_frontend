"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { cn } from "@/internal/lib/cn";
import { useAdminCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import { useCreateFood, useDeleteFood, useFoodDetail, useUpdateFood } from "../hooks/useFoodQueries";
import { foodValidation } from "../schemas/foodSchema";
import { FoodPhotosSection } from "./FoodPhotosSection";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

export function FoodForm() {
  const params = useParams();
  const router = useRouter();

  const foodId = (params?.id as string) || "new";
  const isEdit = foodId !== "new" && Boolean(params?.id);

  const { data: existing, isLoading } = useFoodDetail(isEdit ? foodId : undefined);
  const { data: categories } = useAdminCategories();

  const create = useCreateFood();
  const update = useUpdateFood(foodId);
  const remove = useDeleteFood();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photoType, setPhotoType] = useState<"series" | "range">("series");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const busy = create.isPending || update.isPending || remove.isPending;

  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (existing && loadedId !== existing.id) {
    setLoadedId(existing.id);
    setCode(existing.code);
    setName(existing.name);
    setLocalName(existing.local_name ?? "");
    setDescription(existing.description ?? "");
    setCategoryId(existing.category_id ?? "");
    setPhotoType(existing.photo_type === "range" ? "range" : "series");
    setIsActive(existing.is_active);
  }

  function validate(): string | null {
    const trimmedCode = code.trim();
    const trimmedName = name.trim();

    if (trimmedCode.length < foodValidation.code.minLength) {
      return `Kode minimal ${foodValidation.code.minLength} karakter`;
    }
    if (trimmedCode.length > foodValidation.code.maxLength) {
      return `Kode maksimal ${foodValidation.code.maxLength} karakter`;
    }
    if (trimmedName.length < foodValidation.name.minLength) {
      return `Nama minimal ${foodValidation.name.minLength} karakter`;
    }
    if (trimmedName.length > foodValidation.name.maxLength) {
      return `Nama maksimal ${foodValidation.name.maxLength} karakter`;
    }
    if (localName.trim().length > foodValidation.localName.maxLength) {
      return `Nama lokal maksimal ${foodValidation.localName.maxLength} karakter`;
    }
    return null;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    const payload = {
      code: code.trim(),
      name: name.trim(),
      local_name: localName.trim(),
      description: description.trim(),
      photo_type: photoType,
      category_id: categoryId,
    };

    try {
      if (isEdit) {
        await update.mutateAsync({ ...payload, is_active: isActive });
        router.push("/admin/foods");
      } else {
        // Setelah create langsung ke edit agar bisa unggah gambar + anotasi
        const created = await create.mutateAsync(payload);
        router.push(`/admin/foods/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan makanan");
    }
  };

  async function handleDelete() {
    if (!isEdit) return;
    if (!window.confirm(`Hapus makanan "${name}"?`)) return;

    setError(null);

    try {
      await remove.mutateAsync(foodId);
      router.push("/admin/foods");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus makanan");
    }
  }

  if (isEdit && isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat makanan…</div>;
  }

  return (
    <div className="pb-24">
      <div className="p-6 px-8">
        <div className={isEdit ? "max-w-220" : "max-w-160"}>
          <PageHeader
            title={isEdit ? "Edit Makanan" : "Tambah Makanan"}
            description={
              isEdit
                ? "Perubahan langsung tercermin di Find Food dan Survey Recall."
                : "Simpan info dasar dulu — gambar, anotasi area, dan foto porsi dikelola di halaman yang sama setelah tersimpan."
            }
          />

          <form id="food-form" className="flex flex-col gap-5" onSubmit={onSubmit}>
            <section className={SECTION}>
              <h2 className="m-0 text-base font-semibold text-text-primary">Informasi Dasar</h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  id="code"
                  name="code"
                  label="Kode"
                  placeholder="MP-01"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Input
                  id="name"
                  name="name"
                  label="Nama"
                  placeholder="Nasi Putih"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Input
                id="local_name"
                name="local_name"
                label="Nama Lokal"
                placeholder="Sego Putih"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />

              <div className="flex w-full flex-col gap-2">
                <label
                  htmlFor="description"
                  className="form-label text-sm font-medium text-text-secondary"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={description}
                  placeholder="Keterangan singkat yang tampil di Find Food"
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border-[1.5px] border-border bg-surface py-2.5 px-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:shadow-focus"
                />
              </div>
            </section>

            <section className={SECTION}>
              <h2 className="m-0 text-base font-semibold text-text-primary">Pengaturan</h2>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="flex w-full flex-col gap-2">
                  <label
                    htmlFor="category_id"
                    className="form-label text-sm font-medium text-text-secondary"
                  >
                    Kategori
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border-[1.5px] border-border bg-surface py-2.5 px-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:shadow-focus"
                  >
                    <option value="">Tanpa kategori</option>
                    {(categories ?? []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-text-muted">
                    Menentukan pengelompokan di Find Food
                  </span>
                </div>

                <div className="flex w-full flex-col gap-2">
                  <label
                    htmlFor="photo_type"
                    className="form-label text-sm font-medium text-text-secondary"
                  >
                    Tipe foto
                  </label>
                  <select
                    id="photo_type"
                    name="photo_type"
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value === "range" ? "range" : "series")}
                    className="w-full rounded-md border-[1.5px] border-border bg-surface py-2.5 px-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:shadow-focus"
                  >
                    <option value="series">Series — hingga 10 foto</option>
                    <option value="range">Range — 1 foto saja</option>
                  </select>
                  <span className="text-xs text-text-muted">
                    Simpan tipe ini dulu sebelum mengelola foto di bawah
                  </span>
                </div>

                {isEdit && (
                  <div className="flex w-full flex-col gap-2">
                    <span className="form-label text-sm font-medium text-text-secondary">
                      Status aktif
                    </span>
                    <label className="flex cursor-pointer items-start gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        onClick={() => setIsActive(!isActive)}
                        className={cn(
                          "mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-none p-0.5 transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isActive ? "bg-primary" : "bg-border"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "h-5 w-5 rounded-full bg-surface shadow-sm transition-transform",
                            isActive && "translate-x-5"
                          )}
                        />
                      </button>
                      <span className="text-xs leading-relaxed text-text-muted">
                        {isActive
                          ? "Aktif — muncul di pencarian responden"
                          : "Nonaktif — disembunyikan dari pencarian responden"}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </section>

            {error && (
              <div className="alert alert-danger">
                <span className="text-sm">{error}</span>
              </div>
            )}
          </form>

          {isEdit && (
            <div className="mt-8">
              <FoodPhotosSection foodId={foodId} photoType={photoType} />
            </div>
          )}
        </div>
      </div>

      {/* Aksi simpan menempel di bawah: form ini panjang (foto + anotasi di
          bawahnya), jadi tombol yang ikut menggulung membuat admin harus
          menggulir jauh hanya untuk menyimpan. */}
      <div className="sticky bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-3">
          {isEdit ? (
            <Button type="button" variant="danger" onClick={handleDelete} disabled={busy}>
              <Trash2 size={14} />
              Hapus
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => router.push("/admin/foods")}
            >
              Batal
            </Button>
            <Button type="submit" form="food-form" isLoading={busy}>
              {isEdit ? "Simpan Makanan" : "Simpan & lanjut ke foto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
