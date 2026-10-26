"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { cn } from "@/internal/lib/cn";
import { useAdminCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import { useNutrientTypes, DEFAULT_NUTRIENT_TYPES } from "@/internal/domain/nutrition";
import { useCreateFood, useDeleteFood, useFoodDetail, useUpdateFood } from "../hooks/useFoodQueries";
import type { FoodNutrientInput } from "../types/food";
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
  const { data: nutrientTypesData } = useNutrientTypes();
  const nutrientTypes =
    nutrientTypesData && nutrientTypesData.length > 0
      ? nutrientTypesData
      : DEFAULT_NUTRIENT_TYPES;

  const create = useCreateFood();
  const update = useUpdateFood(foodId);
  const remove = useDeleteFood();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photoType, setPhotoType] = useState<"series" | "range" | "guide">("series");
  const [isActive, setIsActive] = useState(true);
  const [nutrientValues, setNutrientValues] = useState<Record<number, string>>({});
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
    setPhotoType(
      existing.photo_type === "range"
        ? "range"
        : existing.photo_type === "guide"
          ? "guide"
          : "series"
    );
    setIsActive(existing.is_active);

    const initialNutrients: Record<number, string> = {};
    if (existing.nutrients) {
      for (const [codeKey, detail] of Object.entries(existing.nutrients)) {
        let typeId = (detail as any)?.type_id;
        if (!typeId) {
          const match = nutrientTypes.find((t) => t.code.toLowerCase() === codeKey.toLowerCase());
          if (match) typeId = match.id;
        }
        if (typeId) {
          initialNutrients[typeId] = String(detail.value);
        }
      }
    }
    setNutrientValues(initialNutrients);
  }

  const handleFillZero = () => {
    const updated: Record<number, string> = { ...nutrientValues };
    for (const t of nutrientTypes) {
      if (updated[t.id] === undefined || updated[t.id].trim() === "") {
        updated[t.id] = "0";
      }
    }
    setNutrientValues(updated);
  };

  const handleResetNutrients = () => {
    setNutrientValues({});
  };

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

    for (const [typeIdStr, val] of Object.entries(nutrientValues)) {
      if (val.trim() !== "") {
        const num = Number(val);
        if (isNaN(num)) {
          return "Nilai zat gizi harus berupa angka yang valid";
        }
        if (num < 0) {
          const type = nutrientTypes.find((t) => t.id === Number(typeIdStr));
          return `Nilai ${type?.name ?? "zat gizi"} tidak boleh bernilai negatif`;
        }
      }
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

    const nutrientsPayload: FoodNutrientInput[] = Object.entries(nutrientValues)
      .filter(([_, val]) => val.trim() !== "" && !isNaN(Number(val)))
      .map(([typeIdStr, val]) => ({
        type_id: Number(typeIdStr),
        value_per_100g: Number(val),
      }));

    const payload = {
      code: code.trim(),
      name: name.trim(),
      local_name: localName.trim(),
      description: description.trim(),
      photo_type: photoType,
      category_id: categoryId,
      nutrients: nutrientsPayload,
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
      <div className="p-6">
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
                    onChange={(e) =>
                      setPhotoType(e.target.value as "series" | "range" | "guide")
                    }
                    className="w-full rounded-md border-[1.5px] border-border bg-surface py-2.5 px-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:shadow-focus"
                  >
                    <option value="series">Series — Foto porsi terpisah bertahap (A–H)</option>
                    <option value="range">Range — 1 foto rentang tingkatan ukuran (kecil ke besar)</option>
                    <option value="guide">Guide — 1 foto panduan aneka ragam jenis/varian</option>
                  </select>
                  <span className="text-xs text-text-muted">
                    Pilih tipe referensi foto porsi makanan ini
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

            <section className={SECTION}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="m-0 text-base font-semibold text-text-primary">
                      Kandungan Gizi (per 100 gram)
                    </h2>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      DKBM / TKPI
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Nilai zat gizi per 100 gram bahan makanan. Akan dihitung secara proporsional sesuai gram porsi responden di Survey Recall.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillZero}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-fast"
                    title="Isi nilai 0 untuk zat gizi yang belum diisi"
                  >
                    Isi 0 yang kosong
                  </button>
                  <button
                    type="button"
                    onClick={handleResetNutrients}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted hover:border-danger/30 hover:text-danger transition-fast"
                    title="Kosongkan seluruh nilai gizi"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nutrientTypes.map((type) => {
                  const val = nutrientValues[type.id] ?? "";
                  const unitSymbol =
                    type.unit?.symbol ||
                    (type.code === "energy" ? "kkal" : type.id >= 7 ? "mg" : "g");

                  return (
                    <div
                      key={type.id}
                      className="flex flex-col gap-1.5 rounded-lg border border-border/80 bg-surface-alt/30 p-3 hover:border-border transition-base"
                    >
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={`nutrient-${type.id}`}
                          className="text-xs font-semibold text-text-primary cursor-pointer"
                        >
                          {type.name}
                        </label>
                        <span className="font-mono text-[11px] font-medium text-text-muted">
                          {unitSymbol}
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id={`nutrient-${type.id}`}
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0.0"
                          value={val}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setNutrientValues((prev) => ({ ...prev, [type.id]: raw }));
                          }}
                          className="w-full rounded-md border-[1.5px] border-border bg-surface py-2 pl-3 pr-14 font-mono text-sm text-text-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-base focus:border-primary focus:shadow-focus"
                        />
                        <span className="pointer-events-none absolute right-3 text-xs font-medium text-text-muted">
                          {unitSymbol}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
