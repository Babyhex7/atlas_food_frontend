import { Suspense } from "react";
import { AnnotationList } from "@/internal/domain/annotation/components/AnnotationList";

export default function AdminAnnotationsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-muted">Memuat anotasi…</div>}>
      <AnnotationList />
    </Suspense>
  );
}
