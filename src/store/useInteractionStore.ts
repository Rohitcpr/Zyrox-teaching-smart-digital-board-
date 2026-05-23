import { create } from 'zustand';

export type InteractionMode = 'draw' | 'edit' | 'pan';

interface InteractionStore {
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  mode: 'draw',
  setMode: (mode) => set({ mode }),
}));
