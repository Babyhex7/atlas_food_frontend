"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { useAnnotationDetail } from "../hooks/useAnnotationQueries";
import { usePublishAnnotation, useUnpublishAnnotation } from "../hooks/useAnnotationMutations";
import { useAnnotationAutosave } from "../hooks/useAnnotationAutosave";
import { useAnnotationEditorStore } from "../store/annotationEditorStore";
import { usePolygonEditor } from "../hooks/usePolygonEditor";
import { useCanvasTransform } from "../hooks/useCanvasTransform";
import { useFoodPhotos } from "@/internal/domain/food/hooks/useFoodPhotoQueries";
import { AnnotationCanvas } from "./AnnotationCanvas";
import { AreaSidePanel } from "./AreaSidePanel";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { PublishBar } from "./PublishBar";
import { ZoomToolbar } from "./ZoomToolbar";

type AnnotationEditorProps = {
  id: string;
};

/**
 * Shell Annotation Editor — merangkai kanvas, panel area, autosave, dan publish.
 * Tidak memuat logika polygon maupun penyimpanan; semuanya didelegasikan ke hook.
 */
function safeReturnTo(value: string | null, fallbackFoodId?: string | null): string {
  if (value && value.startsWith("/admin/")) return value;
  if (fallbackFoodId) return `/admin/foods/${fallbackFoodId}`;
  return "/admin/foods";
}

export function AnnotationEditor({ id }: AnnotationEditorProps) {
  const searchParams = useSearchParams();
  const { data: image, isLoading, error } = useAnnotationDetail(id);
  const backHref = safeReturnTo(searchParams.get("returnTo"), image?.primary_food_id);

  const loadFromImage = useAnnotationEditorStore((s) => s.loadFromImage);
  const reset = useAnnotationEditorStore((s) => s.reset);
  const renameArea = useAnnotationEditorStore((s) => s.renameArea);
  const setAreaFood = useAnnotationEditorStore((s) => s.setAreaFood);
  const setAreaWeight = useAnnotationEditorStore((s) => s.setAreaWeight);
  const canUndo = useAnnotationEditorStore((s) => s.past.length > 0);
  const canRedo = useAnnotationEditorStore((s) => s.future.length > 0);

  const editor = usePolygonEditor();
  const { transform, zoomIn, zoomOut, zoomAtPoint, panBy, reset: resetView } = useCanvasTransform();
  const autosave = useAnnotationAutosave(id);

  const publish = usePublishAnnotation(id);
  const unpublish = useUnpublishAnnotation(id);

  const [publishError, setPublishError] = useState<string | null>(null);

  // Ambil daftar foto porsi saudara dari makanan yang sama (untuk navigasi cepat)
  const { data: foodPhotosData } = useFoodPhotos(image?.primary_food_id ?? undefined);
  const siblingPhotos = foodPhotosData?.items ?? [];
  const currentIndex = siblingPhotos.findIndex((p) => p.id === id);
  const prevPhoto = currentIndex > 0 ? siblingPhotos[currentIndex - 1] : null;
  const nextPhoto = currentIndex >= 0 && currentIndex < siblingPhotos.length - 1 ? siblingPhotos[currentIndex + 1] : null;

  // Muat data server ke store sekali per gambar. Sengaja bergantung pada
  // image.id, bukan objek image: refetch yang menghasilkan objek baru tidak
  // boleh menimpa polygon yang sedang dikerjakan admin.
  useEffect(() => {
    if (image) loadFromImage(image);
  }, [image?.id, loadFromImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bersihkan store saat keluar editor agar gambar berikutnya mulai bersih
  useEffect(() => () => reset(), [reset]);

  async function handlePublish() {
    setPublishError(null);
    try {
      // Pastikan area terakhir sudah tersimpan sebelum server memvalidasi
      await autosave.flush();
      await publish.mutateAsync();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Gagal publish");
    }
  }

  async function handleUnpublish() {
    setPublishError(null);
    try {
      await unpublish.mutateAsync();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Gagal unpublish");
    }
  }

  /**
   * Export JSON.
   *
   * Sengaja tidak memakai window.open: endpoint export dilindungi AdminOnly
   * dan navigasi biasa tidak membawa header Authorization, jadi selalu 401.
   * Data diambil lewat apiClient lalu diunduh sebagai blob.
   */
  function handleExport() {
    const payload = {
      ...image,
      areas: editor.areas.map((area) => ({
        id: area.serverId,
        name: area.name,
        food_id: area.foodId,
        polygon: area.polygon,
        z_index: area.zIndex,
        weight_gram: area.weightGram,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `annotation-${id}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return <div className="p-6 px-8 text-sm text-text-muted">Memuat editor…</div>;
  }

  if (error || !image) {
    return (
      <div className="p-6">
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
      <div className="flex flex-wrap items-center gap-3">
        <Link href={backHref} className="btn btn-ghost btn-sm btn-icon" title="Kembali ke makanan">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-primary m-0 truncate">{image.title}</h1>
          <p className="text-xs text-text-muted m-0">
            {image.width} × {image.height} px · {editor.areas.length} area
            {image.weight_gram != null && image.weight_gram > 0 && ` · ${image.weight_gram} gram`}
          </p>
        </div>

        {/* Switcher Antar Foto Porsi Makanan (Zero Context Switch) */}
        {siblingPhotos.length > 1 && (
          <div className="flex items-center gap-1 bg-surface-alt border border-border rounded-lg p-1 text-xs">
            <span className="text-text-muted px-2 font-medium">Porsi:</span>
            {prevPhoto && (
              <button
                type="button"
                onClick={async () => {
                  await autosave.flush();
                  window.location.href = `/admin/annotations/${prevPhoto.id}?returnTo=${encodeURIComponent(backHref)}`;
                }}
                className="btn btn-ghost btn-xs text-text-secondary"
                title={`Pindah ke ${prevPhoto.title}`}
              >
                ← {prevPhoto.title}
              </button>
            )}
            <span className="px-2 py-0.5 rounded bg-surface font-semibold text-primary border border-border shadow-xs">
              {image.title} ({currentIndex + 1}/{siblingPhotos.length})
            </span>
            {nextPhoto && (
              <button
                type="button"
                onClick={async () => {
                  await autosave.flush();
                  window.location.href = `/admin/annotations/${nextPhoto.id}?returnTo=${encodeURIComponent(backHref)}`;
                }}
                className="btn btn-ghost btn-xs text-primary font-semibold"
                title={`Pindah ke ${nextPhoto.title}`}
              >
                {nextPhoto.title} →
              </button>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2.5">
          <Link
            href={`/admin/annotations/${id}/preview`}
            className="btn btn-outline btn-sm text-xs gap-1.5"
            title="Lihat pratinjau seperti tampilan responden"
          >
            <Eye size={13} />
            Pratinjau
          </Link>
          <AutosaveIndicator
            state={autosave.state}
            lastSavedAt={autosave.lastSavedAt}
            error={autosave.error}
          />
        </div>
      </div>

      <PublishBar
        id={id}
        status={image.status}
        areas={editor.areas}
        publishing={publish.isPending || unpublish.isPending}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onExport={handleExport}
      />

      {publishError && (
        <div className="alert alert-danger">
          <span className="text-sm">{publishError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="flex flex-col gap-2 min-w-0">
          <ZoomToolbar
            zoom={transform.zoom}
            mode={editor.mode}
            canUndo={canUndo}
            canRedo={canRedo}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
            onModeChange={editor.setMode}
            onUndo={editor.undo}
            onRedo={editor.redo}
          />

          <AnnotationCanvas
            imageUrl={image.image_url}
            width={image.width}
            height={image.height}
            areas={editor.areas}
            drawingPolygon={editor.drawingPolygon}
            selectedLocalId={editor.selectedLocalId}
            transform={transform}
            editable
            drawing={editor.mode === "draw"}
            isDragging={editor.dragTarget !== null}
            onCanvasClick={editor.handleCanvasClick}
            onSelectArea={editor.selectArea}
            onVertexDragStart={editor.startDrag}
            onVertexDrag={editor.dragTo}
            onVertexDragEnd={editor.endDrag}
            onVertexDoubleClick={editor.deleteVertex}
            onPan={panBy}
            onZoomAtPoint={zoomAtPoint}
          />

          {editor.mode === "draw" && editor.drawingPolygon.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-surface">
              <span className="text-sm text-text-muted">
                {editor.drawingPolygon.length} titik
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={editor.undoDrawingPoint}
                  className="btn btn-outline btn-sm"
                >
                  Hapus titik terakhir
                </button>
                <button type="button" onClick={editor.cancelDrawing} className="btn btn-ghost btn-sm">
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => editor.commitDrawing("")}
                  disabled={!editor.canCommitDrawing}
                  className="btn btn-primary btn-sm"
                >
                  Selesaikan area
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary m-0">Daftar area</h2>
          <AreaSidePanel
            areas={editor.areas}
            selectedLocalId={editor.selectedLocalId}
            targetWeightGram={image.weight_gram ?? undefined}
            onSelect={editor.selectArea}
            onRename={renameArea}
            onLinkFood={setAreaFood}
            onWeightChange={setAreaWeight}
            onDelete={editor.deleteArea}
          />
        </div>
      </div>
    </div>
  );
}
