"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { AnnotationEditor } from "@/internal/domain/annotation";

function EditorInner() {
  const params = useParams();
  return <AnnotationEditor id={params.id as string} />;
}

export default function AnnotationEditorPage() {
  return (
    <Suspense fallback={<div className="p-6 px-8 text-sm text-text-muted">Memuat editor…</div>}>
      <EditorInner />
    </Suspense>
  );
}
