import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/strokeUtils';

export interface BoardEntry {
  id: string;
  pageId: string;
  name: string;
  savedAt: number;
  folder: string;
}

interface NotebookStore {
  recentBoards: BoardEntry[];
  loadRecent: () => Promise<void>;
  saveToRecent: (pageId: string, name?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const formatDateTime = (): string => {
  const now = new Date();
  const date = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;
  const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  return `${date} ${time}`;
};

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  recentBoards: [],

  loadRecent: async () => {
    try {
      const raw = await AsyncStorage.getItem('zyrox_recent_boards');
      if (raw) {
        const boards: BoardEntry[] = JSON.parse(raw);
        set({ recentBoards: boards });
      }
    } catch (e) { console.error(e); }
  },

  saveToRecent: async (pageId, name) => {
    try {
      const entry: BoardEntry = {
        id: generateId(),
        pageId,
        name: name ?? `Board - ${formatDateTime()}`,
        savedAt: Date.now(),
        folder: 'Recent Boards',
      };

      const current = get().recentBoards;
      // Remove duplicate if same pageId exists
      const filtered = current.filter((b) => b.pageId !== pageId);
      const updated = [entry, ...filtered].slice(0, 50); // Max 50 recent

      set({ recentBoards: updated });
      await AsyncStorage.setItem('zyrox_recent_boards', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  },

  deleteEntry: async (id) => {
    const updated = get().recentBoards.filter((b) => b.id !== id);
    set({ recentBoards: updated });
    await AsyncStorage.setItem('zyrox_recent_boards', JSON.stringify(updated));
  },
}));
