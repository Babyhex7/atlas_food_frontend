"use client";

import { useParams } from "next/navigation";
import { AnnotationPreview } from "@/internal/domain/annotation";

export default function AnnotationPreviewPage() {
  const params = useParams();
  return <AnnotationPreview id={params.id as string} />;
}
