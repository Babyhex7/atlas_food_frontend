"use client";

import { useParams } from "next/navigation";
import { AnnotationEditor } from "@/internal/domain/annotation";

export default function AnnotationEditorPage() {
  const params = useParams();
  return <AnnotationEditor id={params.id as string} />;
}
