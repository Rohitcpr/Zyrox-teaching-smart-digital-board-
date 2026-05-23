import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/strokeUtils';

export interface Page {
  id: string;
  name: string;
  createdAt: number;
}

interface PageStore {
  pages: Page[];
  activePageId: string;
  addPage: () => string;
  copyPage: (pageId: string) => Promise<string>;
  deletePage: (id: string) => void;
  reorderPages: (from: number, to: number) => void;
  setActivePage: (id: string) => void;
  loadPages: () => Promise<void>;
  savePages: () => Promise<void>;
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: [{ id: 'page_001', name: 'Page 1', createdAt: Date.now() }],
  activePageId: 'page_001',

  addPage: () => {
    const pages = get().pages;
    const newPage: Page = {
      id: `page_${generateId()}`,
      name: `Page ${pages.length + 1}`,
      createdAt: Date.now(),
    };
    set((s) => ({ pages: [...s.pages, newPage], activePageId: newPage.id }));
    get().savePages();
    return newPage.id;
  },

  copyPage: async (pageId) => {
    try {
      const raw = await AsyncStorage.getItem(`zyrox_canvas_${pageId}`);
      const newId = `page_${generateId()}`;
      const pages = get().pages;
      const srcIndex = pages.findIndex((p) => p.id === pageId);
      const srcPage = pages[srcIndex];

      const newPage: Page = {
        id: newId,
        name: `${srcPage?.name ?? 'Page'} (Copy)`,
        createdAt: Date.now(),
      };

      if (raw) await AsyncStorage.setItem(`zyrox_canvas_${newId}`, raw);

      // Insert copy RIGHT AFTER source page
      const newPages = [...pages];
      newPages.splice(srcIndex + 1, 0, newPage);

      set({ pages: newPages, activePageId: newId });
      get().savePages();
      return newId;
    } catch {
      return get().addPage();
    }
  },

  deletePage: (id) => {
    const { pages, activePageId } = get();
    if (pages.length === 1) return;
    const filtered = pages.filter((p) => p.id !== id);
    const newActive = activePageId === id ? filtered[0].id : activePageId;
    set({ pages: filtered, activePageId: newActive });
    get().savePages();
  },

  reorderPages: (from, to) => {
    const pages = [...get().pages];
    const [moved] = pages.splice(from, 1);
    pages.splice(to, 0, moved);
    set({ pages });
    get().savePages();
  },

  setActivePage: (id) => set({ activePageId: id }),

  savePages: async () => {
    try {
      await AsyncStorage.setItem('zyrox_pages', JSON.stringify(get().pages));
    } catch (e) { console.error(e); }
  },

  loadPages: async () => {
    try {
      const raw = await AsyncStorage.getItem('zyrox_pages');
      if (raw) {
        const pages: Page[] = JSON.parse(raw);
        if (pages.length > 0) set({ pages, activePageId: pages[0].id });
      }
    } catch (e) { console.error(e); }
  },
}));
