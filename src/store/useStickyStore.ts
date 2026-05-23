import { create } from 'zustand';
import { generateId } from '../utils/strokeUtils';

interface StickyItem { id: string; }

interface StickyStore {
  stickies: StickyItem[];
  addSticky: () => void;
  removeSticky: (id: string) => void;
}

export const useStickyStore = create<StickyStore>((set) => ({
  stickies: [],
  addSticky: () => set((s) => ({ stickies: [...s.stickies, { id: generateId() }] })),
  removeSticky: (id) => set((s) => ({ stickies: s.stickies.filter((n) => n.id !== id) })),
}));
