"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { useCreateAnnotation, useUploadAnnotationImage } from "../hooks/useAnnotationMutations";

/**
 * Baca dimensi asli gambar di browser.
 *
 * Dimensi wajib benar: seluruh koordinat polygon disimpan dalam pixel space
 * gambar asli, dan `viewBox` di sisi responden dibangun dari angka ini.
 * Menebaknya berarti seluruh anotasi meleset.
 */
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

/** Upload foto scene lalu buat draft anotasi (brief §8) */
export function AnnotationUploader() {
  const router = useRouter();
  const upload = useUploadAnnotationImage();
  const create = useCreateAnnotation();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = upload.isPending || create.isPending;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setFile(selected);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);

    // Isi judul dari nama file bila admin belum mengetikkan apa pun
    if (selected && !title.trim()) {
      setTitle(selected.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Pilih file gambar terlebih dahulu");
      return;
    }
    if (!title.trim()) {
      setError("Judul wajib diisi");
      return;
    }

    try {
      // Dimensi dibaca sebelum upload agar kegagalan baca tidak
      // meninggalkan file yatim di server.
      const size = await readImageSize(file);
      const uploaded = await upload.mutateAsync(file);

      const created = await create.mutateAsync({
        title: title.trim(),
        image_url: uploaded.url,
        width: size.width,
        height: size.height,
      });

      router.push(`/admin/annotations/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat anotasi");
    }
  }

  return (
    <div className="p-6 px-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/annotations" className="btn btn-ghost btn-sm btn-icon" title="Kembali">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-bold text-text-primary m-0">Gambar anotasi baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[640px] flex flex-col gap-5">
        <div className="form-group">
          <label className="form-label" htmlFor="annotation-title">
            Judul
          </label>
          <input
            id="annotation-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="mis. Ayam goreng lengkap"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="annotation-file">
            Foto scene
          </label>
          <input
            id="annotation-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            required
          />
          <span className="text-xs text-text-muted">
            Format jpg, png, atau webp. Maksimal 10 MB.
          </span>
        </div>

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Pratinjau"
            className="max-h-64 w-auto rounded-md border border-border object-contain"
          />
        )}

        {error && (
          <div className="alert alert-danger">
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/annotations" className="btn btn-secondary">
            Batal
          </Link>
          <button type="submit" disabled={busy} className="btn btn-primary">
            <Upload size={15} />
            {busy ? "Mengunggah…" : "Unggah & mulai anotasi"}
          </button>
        </div>
      </form>
    </div>
  );
}
