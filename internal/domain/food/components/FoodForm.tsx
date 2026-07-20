"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { LockIndicator, useCollab } from "@/internal/domain/collab";
import { useAdminCategories } from "@/internal/domain/category/hooks/useCategoryQueries";
import { useCreateFood, useDeleteFood, useFoodDetail, useUpdateFood } from "../hooks/useFoodQueries";
import { foodValidation } from "../schemas/foodSchema";

const SECTION = "bg-surface border border-border rounded-xl p-6 flex flex-col gap-5";

export function FoodForm() {
  const params = useParams();
  const router = useRouter();

  const foodId = (params?.id as string) || "new";
  const isEdit = foodId !== "new" && Boolean(params?.id);
  const { send, isConnected } = useCollab();

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
  // Backend memvalidasi photo_type dengan oneof=series|range, jadi form harus
  // punya nilai eksplisit — tidak boleh dibiarkan kosong.
  const [photoType, setPhotoType] = useState<"series" | "range">("series");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version] = useState(1);

  const busy = create.isPending || update.isPending || remove.isPending;

  const [loadedId, setLoadedId] = useState<string | null>(null);

  // Isi form dari server saat mode edit. Penyesuaian dilakukan saat render
  // (pola resmi React) agar tidak memicu render bertingkat tiap kali query
  // menyegarkan datanya.
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

  useEffect(() => {
    if (!isEdit || !isConnected) return;
    send("db_edit_start", {
      entity_type: "food",
      entity_id: foodId,
      version,
    });
    return () => {
      // Only cancel if still connected — avoid noisy errors on unmount/nav
      send("db_edit_cancel", { entity_type: "food", entity_id: foodId });
    };
    // intentionally omit `send` identity thrash; room send is stable enough per connection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, isConnected, foodId, version]);

  const onFieldChange = (field: string, value: string) => {
    if (!isEdit || !isConnected) return;
    send("db_edit_field", {
      entity_type: "food",
      entity_id: foodId,
      field,
      value,
      version,
    });
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
      // Dikirim apa adanya, termasuk string kosong: backend memaknainya
      // sebagai "lepaskan kategori". Mengirim undefined membuat pilihan
      // "Tanpa kategori" diam-diam tidak berefek.
      category_id: categoryId,
    };

    try {
      if (isEdit) {
        await update.mutateAsync({ ...payload, is_active: isActive });

        // Beri tahu admin lain di room bahwa perubahan sudah tersimpan
        if (isConnected) {
          send("db_edit_save", {
            entity_type: "food",
            entity_id: foodId,
            version,
            changes: { code: payload.code, name: payload.name, local_name: payload.local_name },
          });
        }
      } else {
        await create.mutateAsync(payload);
      }

      router.push("/admin/foods");
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
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <h1 className="text-2xl font-bold text-text-primary m-0">
            {isEdit ? "Edit Makanan" : "Tambah Makanan"}
          </h1>
          {isEdit ? <LockIndicator entityType="food" entityId={foodId} /> : null}
        </div>

        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className={SECTION}>
            <h2 className="text-base font-semibold text-text-primary m-0">Informasi Dasar</h2>

            <Input
              id="code"
              name="code"
              label="Kode"
              placeholder="MP-01"
              required
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                onFieldChange("code", e.target.value);
              }}
            />
            <Input
              id="name"
              name="name"
              label="Nama"
              placeholder="Nasi Putih"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                onFieldChange("name", e.target.value);
              }}
            />
            <Input
              id="local_name"
              name="local_name"
              label="Nama Lokal"
              placeholder="Sego Putih"
              value={localName}
              onChange={(e) => {
                setLocalName(e.target.value);
                onFieldChange("local_name", e.target.value);
              }}
            />

            <div className="flex flex-col w-full gap-2">
              <label htmlFor="description" className="form-label text-sm font-medium text-text-secondary">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                placeholder="Keterangan singkat yang tampil di Find Food"
                onChange={(e) => {
                  setDescription(e.target.value);
                  onFieldChange("description", e.target.value);
                }}
                className="w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans transition-base focus:border-primary focus:shadow-focus"
              />
            </div>

            <div className="flex flex-col w-full gap-2">
              <label htmlFor="category_id" className="form-label text-sm font-medium text-text-secondary">
                Kategori
              </label>
              <select
                id="category_id"
                name="category_id"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  onFieldChange("category_id", e.target.value);
                }}
                className="w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans transition-base focus:border-primary focus:shadow-focus"
              >
                <option value="">Tanpa kategori</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-text-muted">
                Menentukan pengelompokan di Find Food dan filter pencarian
              </span>
            </div>

            <div className="flex flex-col w-full gap-2">
              <label htmlFor="photo_type" className="form-label text-sm font-medium text-text-secondary">
                Tipe foto porsi
              </label>
              <select
                id="photo_type"
                name="photo_type"
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value === "range" ? "range" : "series")}
                className="w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans transition-base focus:border-primary focus:shadow-focus"
              >
                <option value="series">Series — beberapa foto porsi bertingkat</option>
                <option value="range">Range — rentang berat</option>
              </select>
            </div>

            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Aktif — makanan nonaktif tidak muncul di pencarian responden
              </label>
            )}
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
              disabled={busy}
              onClick={() => {
                if (isEdit && isConnected) {
                  send("db_edit_cancel", { entity_type: "food", entity_id: foodId });
                }
                router.push("/admin/foods");
              }}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={busy}>
              Simpan Makanan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
