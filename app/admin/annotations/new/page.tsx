import { Suspense } from "react";
import { AnnotationUploader } from "@/internal/domain/annotation";

export default function NewAnnotationPage() {
  return (
    <Suspense fallback={<div className="p-6 px-8 text-sm text-text-muted">Memuat…</div>}>
      <AnnotationUploader />
    </Suspense>
  );
}
