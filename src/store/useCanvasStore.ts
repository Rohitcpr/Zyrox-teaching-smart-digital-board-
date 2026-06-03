import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId, pointsToSvgPath } from '../utils/strokeUtils';
import type { Stroke, Layer, Point } from '../types/canvas.types';

interface CanvasState {
  layers: Layer[];
  activeLayerId: string;
  activeStrokePoints: Point[];
  shapes: any[];
  textItems: any[];
  activeShapeStart: { x: number; y: number } | null;
  activeShapeEnd: { x: number; y: number } | null;
  undoStack: any[];
  redoStack: any[];
  isDirty: boolean;
  isSaving: boolean;

  beginStroke: (point: Point) => void;
  addPoint: (point: Point) => void;
  endStroke: (opts: { tool: string; color: string; size: number; opacity: number }) => void;
  cancelStroke: () => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  saveCanvas: (pageId: string) => Promise<void>;
  loadCanvas: (pageId: string) => Promise<void>;
  initCanvas: () => void;
  beginShape: (point: { x: number; y: number }) => void;
  updateShape: (point: { x: number; y: number }) => void;
  endShape: (opts: any) => void;
  addTextItem: (item: any) => void;
}

const DEFAULT_LAYER: Layer = {
  id: 'layer_001',
  name: 'Layer 1',
  visible: true,
  locked: false,
  opacity: 1,
  strokes: [],
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  layers: [{ ...DEFAULT_LAYER }],
  activeLayerId: 'layer_001',
  activeStrokePoints: [],
  shapes: [],
  textItems: [],
  activeShapeStart: null,
  activeShapeEnd: null,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  isSaving: false,

  beginStroke: (point) => {
    set({ activeStrokePoints: [point] });
  },

  addPoint: (point) => {
    set((s) => ({ activeStrokePoints: [...s.activeStrokePoints, point] }));
  },

  endStroke: ({ tool, color, size, opacity }) => {
    const { activeStrokePoints, layers, activeLayerId, undoStack } = get();
    if (activeStrokePoints.length < 2) {
      set({ activeStrokePoints: [] });
      return;
    }
    const newStroke: Stroke = {
      id: generateId(),
      points: [...activeStrokePoints],
      tool: tool as any,
      color, size, opacity,
      layerId: activeLayerId,
      createdAt: Date.now(),
    };
    const updatedLayers = layers.map((l) =>
      l.id === activeLayerId ? { ...l, strokes: [...l.strokes, newStroke] } : l
    );
    set({
      layers: updatedLayers,
      activeStrokePoints: [],
      undoStack: [...undoStack.slice(-49), { type: 'stroke', layerId: activeLayerId, strokeId: newStroke.id }],
      redoStack: [],
      isDirty: true,
    });
  },

  // CRITICAL: Never throw, just reset
  cancelStroke: () => {
    set({ activeStrokePoints: [] });
  },

  undo: () => {
    const { undoStack, layers, redoStack } = get();
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    if (last.type === 'stroke') {
      const updatedLayers = layers.map((l) =>
        l.id === last.layerId
          ? { ...l, strokes: l.strokes.filter((s) => s.id !== last.strokeId) }
          : l
      );
      set({
        layers: updatedLayers,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, last],
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { redoStack, undoStack } = get();
    if (redoStack.length === 0) return;
    set({ redoStack: redoStack.slice(0, -1), undoStack: [...undoStack, redoStack[redoStack.length - 1]] });
  },

  clearCanvas: () => {
    set({
      layers: [{ ...DEFAULT_LAYER, id: 'layer_001', strokes: [] }],
      activeStrokePoints: [],
      shapes: [],
      textItems: [],
      undoStack: [],
      redoStack: [],
      isDirty: true,
    });
  },

  initCanvas: () => {
    set({
      layers: [{ ...DEFAULT_LAYER, id: 'layer_001', strokes: [] }],
      activeLayerId: 'layer_001',
      activeStrokePoints: [],
      shapes: [],
      textItems: [],
      undoStack: [],
      redoStack: [],
      isDirty: false,
    });
  },

  saveCanvas: async (pageId) => {
    const { layers, shapes, textItems } = get();
    set({ isSaving: true });
    try {
      await AsyncStorage.setItem(`zyrox_canvas_${pageId}`, JSON.stringify({ layers, shapes, textItems }));
      set({ isDirty: false });
    } catch (e) {}
    set({ isSaving: false });
  },

  loadCanvas: async (pageId) => {
    try {
      const raw = await AsyncStorage.getItem(`zyrox_canvas_${pageId}`);
      if (raw) {
        const { layers, shapes, textItems } = JSON.parse(raw);
        set({ layers: layers || [{ ...DEFAULT_LAYER }], shapes: shapes || [], textItems: textItems || [], activeStrokePoints: [] });
      }
    } catch (e) {}
  },

  beginShape: (point) => {
    set({ activeShapeStart: point, activeShapeEnd: point });
  },

  updateShape: (point) => {
    set({ activeShapeEnd: point });
  },

  endShape: ({ type, startX, startY, endX, endY, color, size, opacity }) => {
    const { shapes } = get();
    const newShape = { id: generateId(), type, startX, startY, endX, endY, color, size, opacity };
    set({ shapes: [...shapes, newShape], activeShapeStart: null, activeShapeEnd: null, isDirty: true });
  },

  addTextItem: (item) => {
    const { textItems } = get();
    set({ textItems: [...textItems, { ...item, id: generateId() }], isDirty: true });
  },
}));
