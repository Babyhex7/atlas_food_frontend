"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Pencil, Trash2, Upload } from "lucide-react";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { uploadFoodPhotoFile } from "../services/foodPhotoService";
import {
  useCreateFoodPhoto,
  useDeleteFoodPhoto,
  useFoodPhotos,
  usePublishFoodPhoto,
  useUnpublishFoodPhoto,
  useUpdateFoodPhoto,
} from "../hooks/useFoodPhotoQueries";
import type { FoodPhoto } from "../types/foodPhoto";

type FoodPhotosSectionProps = {
  foodId: string;
  photoType: "series" | "range";
};

function assetUrl(path: string) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_ASSET_ORIGIN}${path}`;
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("File tidak bisa dibaca sebagai gambar"));
    };
    image.src = objectUrl;
  });
}

/** Satu panel foto: unggah sekali → kartu ringkas (gram + anotasi + final) */
export function FoodPhotosSection({ foodId, photoType }: FoodPhotosSectionProps) {
  const { data, isLoading, error } = useFoodPhotos(foodId);
  const createPhoto = useCreateFoodPhoto(foodId);
  const updatePhoto = useUpdateFoodPhoto(foodId);
  const deletePhoto = useDeleteFoodPhoto(foodId);
  const publishPhoto = usePublishFoodPhoto(foodId);
  const unpublishPhoto = useUnpublishFoodPhoto(foodId);

  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const items = data?.items ?? [];
  const effectiveType = data?.photo_type === "range" || photoType === "range" ? "range" : "series";
  const maxPhotos = data?.max_photos ?? (effectiveType === "range" ? 1 : 10);
  const atLimit = items.length >= maxPhotos;
  const returnTo = encodeURIComponent(`/admin/foods/${foodId}`);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (uploading || createPhoto.isPending) return;
    setFormError(null);

    if (atLimit) {
      setFormError(
        effectiveType === "range"
          ? "Tipe range hanya 1 foto."
          : `Maksimal ${maxPhotos} foto.`
      );
      return;
    }
    if (!file) {
      setFormError("Pilih file gambar");
      return;
    }
    const weightGram = Number(weight);
    if (!Number.isFinite(weightGram) || weightGram <= 0) {
      setFormError("Berat gram wajib > 0");
      return;
    }

    const photoTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");
    setUploading(true);

    try {
      const size = await readImageSize(file);
      const uploaded = await uploadFoodPhotoFile(file);
      await createPhoto.mutateAsync({
        title: photoTitle,
        image_url: uploaded.url,
        width: size.width,
        height: size.height,
        weight_gram: weightGram,
        label: photoTitle,
      });
      setTitle("");
      setWeight("");
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menambah foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary m-0 flex items-center gap-2">
          <ImagePlus size={16} />
          Foto Makanan
        </h2>
        <p className="text-xs text-text-muted m-0 mt-1">
          {effectiveType === "range" ? "Maks 1 foto" : `Maks ${maxPhotos} foto`} · isi gram saat unggah ·
          anotasi lalu finalkan · {items.length}/{maxPhotos}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span className="text-sm">{error instanceof Error ? error.message : "Gagal memuat foto"}</span>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted m-0">Memuat foto…</p>
      ) : (
        <ul className="list-none m-0 p-0 flex flex-col gap-3">
          {items.map((item) => (
            <PhotoCard
              key={item.id}
              photo={item}
              returnTo={returnTo}
              busy={
                updatePhoto.isPending ||
                deletePhoto.isPending ||
                publishPhoto.isPending ||
                unpublishPhoto.isPending
              }
              onSave={async (photoId, nextWeight, nextTitle) => {
                await updatePhoto.mutateAsync({
                  photoId,
                  payload: { weight_gram: nextWeight, title: nextTitle, label: nextTitle },
                });
              }}
              onDelete={async (photoId) => {
                if (!window.confirm("Hapus foto ini?")) return;
                await deletePhoto.mutateAsync(photoId);
              }}
              onPublish={async (photoId) => {
                await publishPhoto.mutateAsync(photoId);
              }}
              onUnpublish={async (photoId) => {
                await unpublishPhoto.mutateAsync(photoId);
              }}
            />
          ))}
        </ul>
      )}

      {!atLimit && (
        <form onSubmit={handleAdd} className="border border-dashed border-border rounded-lg p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-text-primary m-0">+ Tambah foto baru</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="photo-title"
              label="Judul"
              placeholder={effectiveType === "range" ? "Porsi standar" : "mis. Porsi kecil"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              id="photo-weight"
              label="Berat (gram)"
              type="number"
              min={0.01}
              step="any"
              placeholder="100"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <input
            id="photo-file"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              setFile(selected);
              if (preview) URL.revokeObjectURL(preview);
              setPreview(selected ? URL.createObjectURL(selected) : null);
              if (selected && !title.trim()) {
                setTitle(selected.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pratinjau" className="max-h-36 w-auto rounded-md border border-border object-contain" />
          )}
          {formError && (
            <div className="alert alert-danger">
              <span className="text-sm">{formError}</span>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={uploading || createPhoto.isPending}>
              <Upload size={14} />
              Unggah
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

type PhotoCardProps = {
  photo: FoodPhoto;
  returnTo: string;
  busy: boolean;
  onSave: (photoId: string, weight: number, title: string) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  onPublish: (photoId: string) => Promise<void>;
  onUnpublish: (photoId: string) => Promise<void>;
};

function PhotoCard({ photo, returnTo, busy, onSave, onDelete, onPublish, onUnpublish }: PhotoCardProps) {
  const [localTitle, setLocalTitle] = useState(photo.title);
  const [localWeight, setLocalWeight] = useState(
    photo.weight_gram > 0 ? String(photo.weight_gram) : ""
  );
  const [cardError, setCardError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(photo.weight_gram <= 0);

  useEffect(() => {
    setLocalTitle(photo.title);
    setLocalWeight(photo.weight_gram > 0 ? String(photo.weight_gram) : "");
    if (photo.weight_gram > 0) setEditing(false);
  }, [photo.id, photo.title, photo.weight_gram, photo.updated_at]);

  async function handleSave() {
    setCardError(null);
    const weightGram = Number(localWeight);
    if (!Number.isFinite(weightGram) || weightGram <= 0) {
      setCardError("Berat gram harus lebih dari 0");
      return;
    }
    if (!localTitle.trim()) {
      setCardError("Judul wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await onSave(photo.id, weightGram, localTitle.trim());
      setEditing(false);
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="border border-border rounded-lg p-3 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetUrl(photo.thumbnail_url || photo.image_url)}
        alt={photo.title}
        className="w-full sm:w-24 h-24 object-cover rounded-md border border-border shrink-0"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-text-primary m-0 truncate">{photo.title}</p>
          <span className="text-xs text-text-muted">
            {photo.weight_gram > 0 ? `${photo.weight_gram} g` : "berat belum terisi"}
          </span>
          <span
            className={
              photo.status === "published"
                ? "text-xs font-semibold text-primary"
                : "text-xs text-text-muted"
            }
          >
            {photo.status === "published" ? "Final" : "Draft"}
          </span>
          <span className="text-xs text-text-muted">{photo.areas_count} area</span>
        </div>

        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              id={`title-${photo.id}`}
              label="Judul"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
            />
            <Input
              id={`weight-${photo.id}`}
              label="Berat (gram)"
              type="number"
              min={0.01}
              step="any"
              value={localWeight}
              onChange={(e) => setLocalWeight(e.target.value)}
            />
          </div>
        )}

        {cardError && (
          <div className="alert alert-danger">
            <span className="text-sm">{cardError}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {editing ? (
            <Button type="button" size="sm" disabled={busy || saving} isLoading={saving} onClick={handleSave}>
              Simpan gram
            </Button>
          ) : (
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => setEditing(true)}>
              Ubah
            </Button>
          )}
          <Link
            href={`/admin/annotations/${photo.id}?returnTo=${returnTo}`}
            className="btn btn-secondary btn-sm"
          >
            <Pencil size={14} />
            Anotasi
          </Link>
          {photo.status === "published" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setCardError(null);
                try {
                  await onUnpublish(photo.id);
                } catch (err) {
                  setCardError(err instanceof Error ? err.message : "Gagal unpublish");
                }
              }}
            >
              Draft lagi
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={busy || photo.weight_gram <= 0}
              onClick={async () => {
                setCardError(null);
                try {
                  await onPublish(photo.id);
                } catch (err) {
                  setCardError(
                    err instanceof Error
                      ? err.message
                      : "Gagal final — gambar dulu minimal 1 area anotasi"
                  );
                }
              }}
            >
              Finalkan
            </Button>
          )}
          <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => onDelete(photo.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </li>
  );
}
