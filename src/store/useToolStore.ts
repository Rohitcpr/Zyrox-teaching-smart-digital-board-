import { create } from 'zustand';
import type { ToolType } from '../types/canvas.types';
import type { ShapeType } from '../types/shape.types';

interface ToolStore {
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  activeShape: ShapeType;
  setTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  setActiveShape: (shape: ShapeType) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  tool: 'pen',
  color: '#FFFFFF',
  size: 3,
  opacity: 1,
  activeShape: 'rectangle',
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setSize: (size) => set({ size }),
  setOpacity: (opacity) => set({ opacity }),
  setActiveShape: (activeShape) => set({ activeShape, tool: 'shape' as ToolType }),
}));
