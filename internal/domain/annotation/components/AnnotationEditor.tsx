"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAnnotationDetail } from "../hooks/useAnnotationQueries";
import { usePublishAnnotation, useUnpublishAnnotation } from "../hooks/useAnnotationMutations";
import { useAnnotationAutosave } from "../hooks/useAnnotationAutosave";
import { useAnnotationEditorStore } from "../store/annotationEditorStore";
import { usePolygonEditor } from "../hooks/usePolygonEditor";
import { useCanvasTransform } from "../hooks/useCanvasTransform";
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
export function AnnotationEditor({ id }: AnnotationEditorProps) {
  const { data: image, isLoading, error } = useAnnotationDetail(id);

  const loadFromImage = useAnnotationEditorStore((s) => s.loadFromImage);
  const reset = useAnnotationEditorStore((s) => s.reset);
  const renameArea = useAnnotationEditorStore((s) => s.renameArea);
  const setAreaFood = useAnnotationEditorStore((s) => s.setAreaFood);
  const canUndo = useAnnotationEditorStore((s) => s.past.length > 0);
  const canRedo = useAnnotationEditorStore((s) => s.future.length > 0);

  const editor = usePolygonEditor();
  const { transform, zoomIn, zoomOut, zoomAtPoint, panBy, reset: resetView } = useCanvasTransform();
  const autosave = useAnnotationAutosave(id);

  const publish = usePublishAnnotation(id);
  const unpublish = useUnpublishAnnotation(id);

  const [publishError, setPublishError] = useState<string | null>(null);

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
        <Link href="/admin/annotations" className="btn btn-ghost btn-sm btn-icon" title="Kembali">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-primary m-0 truncate">{image.title}</h1>
          <p className="text-xs text-text-muted m-0">
            {image.width} × {image.height} px · {editor.areas.length} area
          </p>
        </div>
        <div className="ml-auto">
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
            onSelect={editor.selectArea}
            onRename={renameArea}
            onLinkFood={setAreaFood}
            onDelete={editor.deleteArea}
          />
        </div>
      </div>
    </div>
  );
}
