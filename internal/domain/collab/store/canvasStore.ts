import { create } from "zustand";
import type { CanvasPoint, CanvasStroke, CanvasTool, LaserPoint } from "../types/collab";

interface CanvasStoreState {
  activeTool: CanvasTool;
  activeColor: string;
  activeWidth: number;
  isDrawingMode: boolean;
  isCanvasVisible: boolean;
  strokes: CanvasStroke[];
  laserPoints: Record<string, LaserPoint>;

  setTool: (tool: CanvasTool) => void;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setDrawingMode: (enabled: boolean) => void;
  toggleCanvasVisible: () => void;
  setCanvasVisible: (visible: boolean) => void;

  upsertStroke: (stroke: CanvasStroke) => void;
  appendPointsToStroke: (strokeId: string, points: CanvasPoint[]) => void;
  setLaserPoint: (laser: LaserPoint) => void;
  removeLaserPoint: (userId: string) => void;
  clearStrokes: (targetImageId?: string) => void;
  syncStrokes: (strokes: CanvasStroke[]) => void;
  resetCanvas: () => void;
}

const initial = {
  activeTool: "pencil" as CanvasTool,
  activeColor: "#EF4444", // Red default for high visibility
  activeWidth: 3,
  isDrawingMode: false,
  isCanvasVisible: true,
  strokes: [] as CanvasStroke[],
  laserPoints: {} as Record<string, LaserPoint>,
};

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  ...initial,

  setTool: (activeTool) => set({ activeTool }),
  setColor: (activeColor) => set({ activeColor }),
  setWidth: (activeWidth) => set({ activeWidth }),
  setDrawingMode: (isDrawingMode) => set({ isDrawingMode }),
  toggleCanvasVisible: () => set((s) => ({ isCanvasVisible: !s.isCanvasVisible })),
  setCanvasVisible: (isCanvasVisible) => set({ isCanvasVisible }),

  upsertStroke: (stroke) =>
    set((s) => {
      const idx = s.strokes.findIndex((st) => st.id === stroke.id);
      if (idx === -1) {
        return { strokes: [...s.strokes, stroke] };
      }
      const updated = [...s.strokes];
      updated[idx] = {
        ...updated[idx],
        ...stroke,
        points: stroke.points.length > 0 ? stroke.points : updated[idx].points,
      };
      return { strokes: updated };
    }),

  appendPointsToStroke: (strokeId, points) =>
    set((s) => {
      const idx = s.strokes.findIndex((st) => st.id === strokeId);
      if (idx === -1) return s;
      const updated = [...s.strokes];
      const existing = updated[idx];
      updated[idx] = {
        ...existing,
        points: [...existing.points, ...points],
      };
      return { strokes: updated };
    }),

  setLaserPoint: (laser) =>
    set((s) => ({
      laserPoints: {
        ...s.laserPoints,
        [laser.userId]: laser,
      },
    })),

  removeLaserPoint: (userId) =>
    set((s) => {
      if (!(userId in s.laserPoints)) return s;
      const next = { ...s.laserPoints };
      delete next[userId];
      return { laserPoints: next };
    }),

  clearStrokes: (targetImageId) =>
    set((s) => {
      if (!targetImageId) return { strokes: [], laserPoints: {} };
      return {
        strokes: s.strokes.filter((st) => st.targetImageId !== targetImageId),
      };
    }),

  syncStrokes: (rawStrokes) => set({ strokes: rawStrokes }),

  resetCanvas: () => set({ ...initial }),
}));
