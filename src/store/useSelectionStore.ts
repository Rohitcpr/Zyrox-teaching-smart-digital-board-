import { create } from 'zustand';
import type { SelectionBox, SelectedItems } from '../types/selection.types';

interface SelectionStore {
  isSelecting: boolean;
  selectionBox: SelectionBox | null;
  selectedItems: SelectedItems;
  startPoint: { x: number; y: number } | null;

  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  setSelectedItems: (items: SelectedItems) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  isSelecting: false,
  selectionBox: null,
  selectedItems: { strokeIds: [], shapeIds: [], textIds: [] },
  startPoint: null,

  startSelection: (x, y) => {
    set({
      isSelecting: true,
      startPoint: { x, y },
      selectionBox: { x, y, width: 0, height: 0 },
    });
  },

  updateSelection: (x, y) => {
    const start = get().startPoint;
    if (!start) return;
    set({
      selectionBox: {
        x: Math.min(start.x, x),
        y: Math.min(start.y, y),
        width: Math.abs(x - start.x),
        height: Math.abs(y - start.y),
      },
    });
  },

  endSelection: () => {
    const { selectionBox } = get();
    set({ isSelecting: false });

    // Find strokes inside selection box
    const { useCanvasStore } = require('./useCanvasStore');
    const { layers } = useCanvasStore.getState();
    const allStrokes = layers.flatMap((l: any) => l.strokes);

    const selectedStrokeIds = allStrokes
      .filter((stroke: any) => {
        if (!selectionBox) return false;
        return stroke.points.some((p: any) =>
          p.x >= selectionBox.x &&
          p.x <= selectionBox.x + selectionBox.width &&
          p.y >= selectionBox.y &&
          p.y <= selectionBox.y + selectionBox.height
        );
      })
      .map((s: any) => s.id);

    set({
      selectedItems: {
        strokeIds: selectedStrokeIds,
        shapeIds: [],
        textIds: [],
      },
    });
  },

  setSelectedItems: (items) => set({ selectedItems: items }),
  clearSelection: () => set({
    selectionBox: null,
    selectedItems: { strokeIds: [], shapeIds: [], textIds: [] },
    startPoint: null,
    isSelecting: false,
  }),
}));
