import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/strokeUtils';

export interface Page {
  id: string;
  name: string;
  sectionId?: string;
  createdAt: number;
}

interface PageStore {
  pages: Page[];
  activePageId: string;
  loadPages: () => Promise<void>;
  addPage: () => void;
  copyPage: (id: string) => void;
  deletePage: (id: string) => void;
  movePageUp: (id: string) => void;
  movePageDown: (id: string) => void;
  setActivePage: (id: string) => void;
  savePages: () => Promise<void>;
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: [{ id: 'page_001', name: 'Page 1', createdAt: Date.now() }],
  activePageId: 'page_001',

  loadPages: async () => {
    try {
      const raw = await AsyncStorage.getItem('zyrox_pages');
      if (raw) {
        const pages = JSON.parse(raw);
        if (pages.length > 0) set({ pages, activePageId: pages[0].id });
      }
    } catch (e) {}
  },

  savePages: async () => {
    try {
      await AsyncStorage.setItem('zyrox_pages', JSON.stringify(get().pages));
    } catch (e) {}
  },

  addPage: () => {
    const newPage: Page = { id: `page_${generateId()}`, name: `Page ${get().pages.length + 1}`, createdAt: Date.now() };
    set((s) => ({ pages: [...s.pages, newPage], activePageId: newPage.id }));
    get().savePages();
  },

  copyPage: (id) => {
    const pages = get().pages;
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const orig = pages[idx];
    const copy: Page = { ...orig, id: `page_${generateId()}`, name: `${orig.name} (Copy)`, createdAt: Date.now() };
    const newPages = [...pages.slice(0, idx + 1), copy, ...pages.slice(idx + 1)];
    set({ pages: newPages, activePageId: copy.id });
    get().savePages();
  },

  deletePage: (id) => {
    const pages = get().pages;
    if (pages.length === 1) return;
    const newPages = pages.filter((p) => p.id !== id);
    set({ pages: newPages, activePageId: newPages[0].id });
    get().savePages();
  },

  movePageUp: (id) => {
    const pages = [...get().pages];
    const idx = pages.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    [pages[idx - 1], pages[idx]] = [pages[idx], pages[idx - 1]];
    set({ pages });
    get().savePages();
  },

  movePageDown: (id) => {
    const pages = [...get().pages];
    const idx = pages.findIndex((p) => p.id === id);
    if (idx >= pages.length - 1) return;
    [pages[idx + 1], pages[idx]] = [pages[idx], pages[idx + 1]];
    set({ pages });
    get().savePages();
  },

  setActivePage: (id) => set({ activePageId: id }),
}));
