import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Stroke, Layer, Point } from '../types/canvas.types';
import type { Shape } from '../types/shape.types';
import type { TextItem } from '../components/text/TextRenderer';
import { generateId, simplifyPoints } from '../utils/strokeUtils';
import { CANVAS, STORAGE } from '../constants/config';

interface CanvasStore {
  layers: Layer[];
  activeLayerId: string;
  shapes: Shape[];
  textItems: TextItem[];
  undoStack: Layer[][];
  redoStack: Layer[][];
  activeStrokePoints: Point[];
  activeShapeStart: { x: number; y: number } | null;
  activeShapeEnd: { x: number; y: number } | null;
  isDirty: boolean;
  isSaving: boolean;
  initCanvas: () => void;
  beginStroke: (point: Point) => void;
  addPoint: (point: Point) => void;
  endStroke: (data: Pick<Stroke, 'tool' | 'color' | 'size' | 'opacity'>) => void;
  cancelStroke: () => void;
  beginShape: (point: Point) => void;
  updateShape: (point: Point) => void;
  endShape: (shape: Omit<Shape, 'id' | 'createdAt' | 'layerId'>) => void;
  addTextItem: (item: Omit<TextItem, 'id'>) => void;
  undo: () => void;
  redo: () => void;
  saveCanvas: (pageId: string) => Promise<void>;
  loadCanvas: (pageId: string) => Promise<void>;
  clearCanvas: () => void;
}

const makeLayer = (): Layer => ({
  id: generateId(),
  name: CANVAS.DEFAULT_LAYER_NAME,
  visible: true, locked: false, opacity: 1, strokes: [],
});

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  layers: [], activeLayerId: '', shapes: [], textItems: [],
  undoStack: [], redoStack: [], activeStrokePoints: [],
  activeShapeStart: null, activeShapeEnd: null,
  isDirty: false, isSaving: false,

  initCanvas: () => {
    const layer = makeLayer();
    set({ layers: [layer], activeLayerId: layer.id });
  },

  beginStroke: (point) => set({ activeStrokePoints: [point] }),
  addPoint: (point) => set((s) => ({ activeStrokePoints: [...s.activeStrokePoints, point] })),

  endStroke: (data) => {
    const s = get();
    const simplified = simplifyPoints(s.activeStrokePoints);
    if (simplified.length < 2) { set({ activeStrokePoints: [] }); return; }
    const newStroke: Stroke = {
      id: generateId(), points: simplified,
      layerId: s.activeLayerId, createdAt: Date.now(), ...data,
    };
    const snapshot = s.layers.map((l) => ({ ...l, strokes: [...l.strokes] }));
    const cappedUndo = [...s.undoStack.slice(-(CANVAS.MAX_UNDO_STEPS - 1)), snapshot];
    set((st) => ({
      layers: st.layers.map((l) =>
        l.id === st.activeLayerId ? { ...l, strokes: [...l.strokes, newStroke] } : l
      ),
      activeStrokePoints: [], undoStack: cappedUndo, redoStack: [], isDirty: true,
    }));
  },

  cancelStroke: () => set({ activeStrokePoints: [], activeShapeStart: null, activeShapeEnd: null }),
  beginShape: (point) => set({ activeShapeStart: point, activeShapeEnd: point }),
  updateShape: (point) => set({ activeShapeEnd: point }),

  endShape: (shapeData) => {
    const s = get();
    if (!s.activeShapeStart || !s.activeShapeEnd) return;
    const newShape: Shape = {
      id: generateId(), createdAt: Date.now(),
      layerId: s.activeLayerId, ...shapeData,
    };
    set((st) => ({ shapes: [...st.shapes, newShape], activeShapeStart: null, activeShapeEnd: null, isDirty: true }));
  },

  updateTextItem: (id, changes) => {
    set((s) => ({
      textItems: s.textItems.map((t) => t.id === id ? { ...t, ...changes } : t),
    }));
  },
  deleteTextItem: (id) => {
    set((s) => ({ textItems: s.textItems.filter((t) => t.id !== id) }));
  },
  addTextItem: (item) => {
    const newItem: TextItem = { id: generateId(), ...item };
    set((s) => ({ textItems: [...s.textItems, newItem], isDirty: true }));
  },

  undo: () => {
    const { undoStack, layers } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set((s) => ({ redoStack: [...s.redoStack, layers], layers: prev, undoStack: undoStack.slice(0, -1), isDirty: true }));
  },

  redo: () => {
    const { redoStack, layers } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set((s) => ({ undoStack: [...s.undoStack, layers], layers: next, redoStack: redoStack.slice(0, -1), isDirty: true }));
  },

  saveCanvas: async (pageId) => {
    set({ isSaving: true });
    try {
      const key = `${STORAGE.CANVAS_KEY}${pageId}`;
      const { layers, shapes, textItems } = get();
      await AsyncStorage.setItem(key, JSON.stringify({ layers, shapes, textItems }));
      set({ isDirty: false });
    } catch (e) { console.error('[ZYROX] Save error:', e); }
    finally { set({ isSaving: false }); }
  },

  loadCanvas: async (pageId) => {
    try {
      const key = `${STORAGE.CANVAS_KEY}${pageId}`;
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const layers = parsed.layers || parsed;
        const shapes = parsed.shapes || [];
        const textItems = parsed.textItems || [];
        if (layers.length > 0) {
          set({ layers, shapes, textItems, activeLayerId: layers[0].id });
          return;
        }
      }
    } catch (e) { console.error('[ZYROX] Load error:', e); }
    get().initCanvas();
  },

  clearCanvas: () => {
    const layer = makeLayer();
    set({ layers: [layer], activeLayerId: layer.id, shapes: [], textItems: [], undoStack: [], redoStack: [], isDirty: false });
  },
}));
