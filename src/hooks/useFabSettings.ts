import { create } from 'zustand';

interface FabSettings {
  fabSize: number;
  fabOpacity: number;
  setFabSize: (size: number) => void;
  setFabOpacity: (opacity: number) => void;
}

export const useFabSettings = create<FabSettings>((set) => ({
  fabSize: 52,
  fabOpacity: 1,
  setFabSize: (fabSize) => set({ fabSize }),
  setFabOpacity: (fabOpacity) => set({ fabOpacity }),
}));
