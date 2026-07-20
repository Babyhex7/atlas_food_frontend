"use client";

import { Download, Eye, Globe, Undo } from "lucide-react";
import Link from "next/link";
import type { AnnotationStatus, DraftArea } from "../types/annotation";
import { ANNOTATION_STATUS_CLASS, ANNOTATION_STATUS_LABEL } from "../constants/annotationStatus";
import { collectPublishIssues } from "../schemas/annotationSchema";

type PublishBarProps = {
  id: string;
  status: AnnotationStatus;
  areas: DraftArea[];
  publishing: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onExport: () => void;
};

/** Aksi Publish / Unpublish / Preview / Export (brief §8.1) */
export function PublishBar({
  id,
  status,
  areas,
  publishing,
  onPublish,
  onUnpublish,
  onExport,
}: PublishBarProps) {
  const issues = collectPublishIssues(areas);
  const canPublish = issues.length === 0;
  const isPublished = status === "published";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={ANNOTATION_STATUS_CLASS[status]}>{ANNOTATION_STATUS_LABEL[status]}</span>

        <div className="ml-auto flex items-center gap-2">
          <Link href={`/admin/annotations/${id}/preview`} className="btn btn-outline btn-sm">
            <Eye size={14} />
            Preview
          </Link>

          <button type="button" onClick={onExport} className="btn btn-outline btn-sm">
            <Download size={14} />
            Export JSON
          </button>

          {isPublished ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={publishing}
              className="btn btn-secondary btn-sm"
            >
              <Undo size={14} />
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={publishing || !canPublish}
              className="btn btn-primary btn-sm"
              title={canPublish ? undefined : issues.join(" · ")}
            >
              <Globe size={14} />
              {publishing ? "Memproses…" : "Publish"}
            </button>
          )}
        </div>
      </div>

      {/* Gambar published yang masih diedit tetap published — perubahan
          langsung terlihat responden, jadi admin perlu tahu. */}
      {isPublished && (
        <div className="alert alert-warning">
          <span className="text-sm">
            Gambar ini sudah published. Setiap perubahan yang tersimpan langsung terlihat oleh
            responden. Klik <strong>Unpublish</strong> dulu bila ingin mengedit diam-diam.
          </span>
        </div>
      )}

      {!isPublished && issues.length > 0 && (
        <div className="alert alert-warning">
          <div className="text-sm">
            <p className="alert-title">Belum bisa dipublish:</p>
            <ul className="list-disc pl-5 m-0">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
