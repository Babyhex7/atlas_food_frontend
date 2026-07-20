"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { uploadAsServedPhoto } from "../services/portionService";
import {
  useAddAsServedImages,
  useAsServedSet,
  useDeleteAsServedImage,
  useUpdateAsServedImage,
} from "../hooks/usePortionQueries";

/**
 * Kelola foto porsi dalam sebuah set.
 *
 * Berat gram adalah inti fitur ini: nilainya yang dipakai Recall untuk
 * menghitung asupan, jadi setiap foto wajib punya berat > 0.
 */
export function AsServedImageManager() {
  const params = useParams();
  const setId = typeof params?.id === "string" ? params.id : "";

  const { data: set, isLoading } = useAsServedSet(setId);
  const addImages = useAddAsServedImages(setId);
  const updateImage = useUpdateAsServedImage();
  const deleteImage = useDeleteAsServedImage();

  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = set?.images ?? [];

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const weightGram = Number(weight);

    if (!file) {
      setError("Pilih file foto terlebih dahulu");
      return;
    }
    if (!label.trim()) {
      setError("Label wajib diisi");
      return;
    }
    if (!Number.isFinite(weightGram) || weightGram <= 0) {
      setError("Berat gram harus lebih dari 0");
      return;
    }

    setUploading(true);

    try {
      const uploaded = await uploadAsServedPhoto(file);

      await addImages.mutateAsync([
        {
          label: label.trim(),
          image_url: uploaded.url,
          weight_gram: weightGram,
          display_order: images.length,
        },
      ]);

      setFile(null);
      setLabel("");
      setWeight("");
      // Input file tidak terkontrol React — harus dikosongkan lewat ref,
      // kalau tidak nama file lama tetap tertulis di form.
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah foto");
    } finally {
      setUploading(false);
    }
  }

  async function handleWeightChange(id: string, value: string) {
    const weightGram = Number(value);
    if (!Number.isFinite(weightGram) || weightGram <= 0) return;

    try {
      await updateImage.mutateAsync({ id, payload: { weight_gram: weightGram } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui berat");
    }
  }

  async function handleDelete(id: string, imageLabel: string) {
    if (!window.confirm(`Hapus foto "${imageLabel}"?`)) return;

    try {
      await deleteImage.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus foto");
    }
  }

  if (isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat foto porsi…</div>;
  }

  return (
    <div className="p-6 px-8 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/as-served-sets/${setId}`}
          className="btn btn-ghost btn-sm btn-icon"
          title="Kembali ke set"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary m-0">{set?.name ?? "Set"}</h1>
          <p className="text-xs text-text-muted m-0">{images.length} foto porsi</p>
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4 max-w-[640px]"
      >
        <h2 className="text-base font-semibold text-text-primary m-0">Tambah foto porsi</h2>

        <div className="flex flex-col w-full gap-2">
          <label htmlFor="as-served-file" className="form-label text-sm font-medium text-text-secondary">
            Foto
          </label>
          <input
            id="as-served-file"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <Input
          id="label"
          label="Label"
          placeholder="A"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          helper="Label pendek yang tampil di bawah foto, mis. A, B, C"
        />

        <Input
          id="weight"
          type="number"
          step="0.01"
          min="0.01"
          label="Berat (gram)"
          placeholder="150"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          helper="Dipakai Recall untuk menghitung asupan — wajib lebih dari 0"
        />

        {error && (
          <div className="alert alert-danger">
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={uploading || addImages.isPending}>
            <Upload size={14} />
            Tambah foto
          </Button>
        </div>
      </form>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div key={image.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_ASSET_ORIGIN}${image.thumbnail_url || image.image_url}`}
                alt={image.label}
                className="w-full h-28 object-cover"
              />
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{image.label}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id, image.label)}
                    className="btn btn-ghost btn-xs btn-icon ml-auto"
                    title="Hapus foto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <label className="text-xs text-text-muted flex items-center gap-2">
                  Gram
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={image.weight_gram}
                    onBlur={(event) => handleWeightChange(image.id, event.target.value)}
                    className="w-full text-xs py-1 px-2"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
