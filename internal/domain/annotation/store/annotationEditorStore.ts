import { create } from "zustand";
import type { AreaInput, DraftArea, EditorMode, FoodImage, Point } from "../types/annotation";
import { MAX_POLYGON_POINTS, MIN_POLYGON_POINTS } from "../constants/annotationStatus";
import { clampPoint } from "../utils/polygonMath";

/**
 * ID untuk area baru.
 *
 * Harus berupa UUID sungguhan, bukan sekadar string unik: id ini dikirim ke
 * server dan disimpan di kolom CHAR(36). Karena FE yang menentukan id,
 * autosave (yang menghapus-lalu-menyisipkan ulang) tidak pernah mengubah id
 * area — referensi di editor tetap stabil lintas penyimpanan.
 */
function newAreaId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 untuk konteks tanpa crypto.randomUUID (http non-localhost)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/** Batas riwayat undo — cukup dalam untuk sesi anotasi, tetap hemat memori */
const MAX_HISTORY = 50;

export type AnnotationEditorState = {
  imageId: string | null;
  width: number;
  height: number;

  areas: DraftArea[];
  selectedLocalId: string | null;
  mode: EditorMode;

  /** Polygon yang sedang digambar; kosong bila tidak dalam proses menggambar */
  drawingPolygon: Point[];

  /** Ada perubahan yang belum tersimpan ke server */
  dirty: boolean;

  past: DraftArea[][];
  future: DraftArea[][];

  loadFromImage: (image: FoodImage) => void;
  reset: () => void;

  setMode: (mode: EditorMode) => void;
  selectArea: (localId: string | null) => void;

  addDrawingPoint: (point: Point) => void;
  undoDrawingPoint: () => void;
  commitDrawing: (name: string) => void;
  cancelDrawing: () => void;

  moveVertex: (localId: string, index: number, point: Point) => void;
  insertVertex: (localId: string, index: number, point: Point) => void;
  deleteVertex: (localId: string, index: number) => void;

  renameArea: (localId: string, name: string) => void;
  setAreaFood: (localId: string, foodId: string | null) => void;
  deleteArea: (localId: string) => void;

  undo: () => void;
  redo: () => void;

  markSaved: () => void;
  toPayload: () => AreaInput[];
};

const initialState = {
  imageId: null as string | null,
  width: 0,
  height: 0,
  areas: [] as DraftArea[],
  selectedLocalId: null as string | null,
  mode: "draw" as EditorMode,
  drawingPolygon: [] as Point[],
  dirty: false,
  past: [] as DraftArea[][],
  future: [] as DraftArea[][],
};

export const useAnnotationEditorStore = create<AnnotationEditorState>((set, get) => {
  /**
   * Terapkan perubahan pada daftar area sambil mencatat riwayat undo.
   * Semua mutasi area harus lewat sini agar undo/redo tidak pernah bolong.
   */
  function commit(mutate: (areas: DraftArea[]) => DraftArea[]) {
    const { areas, past } = get();
    const next = mutate(areas);

    set({
      areas: next,
      past: [...past, areas].slice(-MAX_HISTORY),
      future: [],
      dirty: true,
    });
  }

  return {
    ...initialState,

    loadFromImage: (image) =>
      set({
        ...initialState,
        imageId: image.id,
        width: image.width,
        height: image.height,
        areas: (image.areas ?? []).map((area) => ({
          localId: area.id,
          serverId: area.id,
          name: area.name,
          foodId: area.food_id,
          polygon: area.polygon ?? [],
          zIndex: area.z_index,
        })),
      }),

    reset: () => set({ ...initialState }),

    setMode: (mode) => set({ mode, drawingPolygon: [] }),

    selectArea: (localId) => set({ selectedLocalId: localId }),

    addDrawingPoint: (point) => {
      const { drawingPolygon, width, height } = get();
      if (drawingPolygon.length >= MAX_POLYGON_POINTS) return;
      set({ drawingPolygon: [...drawingPolygon, clampPoint(point, width, height)] });
    },

    // Membatalkan titik terakhir tidak masuk riwayat undo area:
    // polygon yang sedang digambar belum jadi bagian dari data.
    undoDrawingPoint: () => set({ drawingPolygon: get().drawingPolygon.slice(0, -1) }),

    commitDrawing: (name) => {
      const { drawingPolygon, areas } = get();
      if (drawingPolygon.length < MIN_POLYGON_POINTS) return;

      const id = newAreaId();
      const area: DraftArea = {
        localId: id,
        serverId: id,
        name: name.trim() || `Area ${areas.length + 1}`,
        foodId: null,
        polygon: drawingPolygon,
        zIndex: areas.length,
      };

      commit((current) => [...current, area]);
      set({ drawingPolygon: [], selectedLocalId: area.localId, mode: "edit" });
    },

    cancelDrawing: () => set({ drawingPolygon: [] }),

    moveVertex: (localId, index, point) => {
      const { width, height } = get();
      commit((areas) =>
        areas.map((area) =>
          area.localId === localId
            ? {
                ...area,
                polygon: area.polygon.map((p, i) =>
                  i === index ? clampPoint(point, width, height) : p
                ),
              }
            : area
        )
      );
    },

    insertVertex: (localId, index, point) => {
      const { width, height } = get();
      commit((areas) =>
        areas.map((area) => {
          if (area.localId !== localId) return area;
          if (area.polygon.length >= MAX_POLYGON_POINTS) return area;

          const polygon = [...area.polygon];
          polygon.splice(index, 0, clampPoint(point, width, height));
          return { ...area, polygon };
        })
      );
    },

    deleteVertex: (localId, index) => {
      commit((areas) =>
        areas.map((area) => {
          if (area.localId !== localId) return area;

          // Menolak turun di bawah 3 titik: polygon tanpa luas tidak bisa
          // di-publish dan tidak bisa diklik responden.
          if (area.polygon.length <= MIN_POLYGON_POINTS) return area;

          return { ...area, polygon: area.polygon.filter((_, i) => i !== index) };
        })
      );
    },

    renameArea: (localId, name) =>
      commit((areas) =>
        areas.map((area) => (area.localId === localId ? { ...area, name } : area))
      ),

    setAreaFood: (localId, foodId) =>
      commit((areas) =>
        areas.map((area) => (area.localId === localId ? { ...area, foodId } : area))
      ),

    deleteArea: (localId) => {
      commit((areas) =>
        areas
          .filter((area) => area.localId !== localId)
          // Rapatkan kembali z-index agar tidak ada lompatan setelah hapus
          .map((area, index) => ({ ...area, zIndex: index }))
      );

      if (get().selectedLocalId === localId) set({ selectedLocalId: null });
    },

    undo: () => {
      const { past, areas, future } = get();
      if (past.length === 0) return;

      set({
        areas: past[past.length - 1],
        past: past.slice(0, -1),
        future: [areas, ...future].slice(0, MAX_HISTORY),
        dirty: true,
      });
    },

    redo: () => {
      const { future, areas, past } = get();
      if (future.length === 0) return;

      set({
        areas: future[0],
        future: future.slice(1),
        past: [...past, areas].slice(-MAX_HISTORY),
        dirty: true,
      });
    },

    markSaved: () => set({ dirty: false }),

    toPayload: () =>
      get().areas.map((area) => ({
        id: area.serverId,
        name: area.name,
        food_id: area.foodId,
        polygon: area.polygon,
        z_index: area.zIndex,
      })),
  };
});
