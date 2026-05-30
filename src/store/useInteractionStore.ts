import { create } from 'zustand';

export type InteractionMode = 'draw' | 'edit';

interface InteractionStore {
  mode: InteractionMode;
  selectedItemId: string | null;
  setMode: (mode: InteractionMode) => void;
  selectItem: (id: string | null) => void;
  releaseAll: () => void;
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  mode: 'draw',
  selectedItemId: null,
  setMode: (mode) => set({ mode }),
  selectItem: (id) => set({ selectedItemId: id }),
  releaseAll: () => set({ mode: 'draw', selectedItemId: null }),
}));
