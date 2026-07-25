import { Suspense } from "react";
import { AsServedImageManager } from "@/internal/domain/portion/components/AsServedImageManager";

export default function AdminAsServedSetImagesPage() {
  return (
    <Suspense fallback={<div className="p-6 px-8 text-sm text-text-muted">Memuat foto porsi…</div>}>
      <AsServedImageManager />
    </Suspense>
  );
}
