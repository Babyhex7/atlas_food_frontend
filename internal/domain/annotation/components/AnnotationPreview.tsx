"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAnnotationDetail } from "../hooks/useAnnotationQueries";
import { ANNOTATION_STATUS_CLASS, ANNOTATION_STATUS_LABEL } from "../constants/annotationStatus";
import { AnnotatedFoodViewer } from "./AnnotatedFoodViewer";

type AnnotationPreviewProps = {
  id: string;
};

/**
 * Pratinjau admin memakai komponen yang sama persis dengan responden.
 *
 * Sengaja tidak dibuat komponen pratinjau tersendiri: kalau preview memakai
 * kode berbeda dari yang dilihat user, preview berhenti membuktikan apa pun.
 */
export function AnnotationPreview({ id }: AnnotationPreviewProps) {
  const { data: image, isLoading, error } = useAnnotationDetail(id);

  if (isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat pratinjau…</div>;
  }

  if (error || !image) {
    return (
      <div className="p-6 px-8">
        <div className="alert alert-danger">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gambar anotasi tidak ditemukan"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/annotations/${id}`}
          className="btn btn-ghost btn-sm btn-icon"
          title="Kembali ke editor"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-bold text-text-primary m-0">{image.title}</h1>
        <span className={ANNOTATION_STATUS_CLASS[image.status]}>
          {ANNOTATION_STATUS_LABEL[image.status]}
        </span>
      </div>

      <p className="text-sm text-text-muted m-0">
        Tampilan ini identik dengan yang dilihat responden di Find Food.
      </p>

      <div className="max-w-3xl">
        <AnnotatedFoodViewer image={image} />
      </div>
    </div>
  );
}
