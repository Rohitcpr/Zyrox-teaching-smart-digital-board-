import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/strokeUtils';

export interface BoardEntry {
  id: string;
  pageId: string;
  name: string;
  savedAt: number;
  folder: string;
  tags: string[];
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  boardIds: string[];
}

interface NotebookStore {
  recentBoards: BoardEntry[];
  notebooks: Notebook[];
  loadRecent: () => Promise<void>;
  saveToRecent: (pageId: string, name?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addNotebook: (name: string, color: string, icon: string) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  addBoardToNotebook: (notebookId: string, boardId: string) => Promise<void>;
}

const formatName = (): string => {
  const now = new Date();
  return `Board ${now.getDate()}/${now.getMonth()+1} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
};

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  recentBoards: [],
  notebooks: [
    { id: 'nb_sci',  name: 'Science',     color: '#10B981', icon: 'flask-outline',     createdAt: Date.now(), boardIds: [] },
    { id: 'nb_math', name: 'Mathematics', color: '#3B82F6', icon: 'calculator-outline', createdAt: Date.now(), boardIds: [] },
    { id: 'nb_lang', name: 'Language',    color: '#F59E0B', icon: 'language-outline',   createdAt: Date.now(), boardIds: [] },
  ],

  loadRecent: async () => {
    try {
      const raw = await AsyncStorage.getItem('zyrox_recent_boards');
      if (raw) set({ recentBoards: JSON.parse(raw) });
      const nbRaw = await AsyncStorage.getItem('zyrox_notebooks');
      if (nbRaw) set({ notebooks: JSON.parse(nbRaw) });
    } catch (e) {}
  },

  saveToRecent: async (pageId, name) => {
    try {
      const entry: BoardEntry = {
        id: generateId(),
        pageId,
        name: name ?? formatName(),
        savedAt: Date.now(),
        folder: 'Recent',
        tags: [],
      };
      const current = get().recentBoards;
      const filtered = current.filter((b) => b.pageId !== pageId);
      const updated = [entry, ...filtered].slice(0, 50);
      set({ recentBoards: updated });
      await AsyncStorage.setItem('zyrox_recent_boards', JSON.stringify(updated));
    } catch (e) {}
  },

  deleteEntry: async (id) => {
    const updated = get().recentBoards.filter((b) => b.id !== id);
    set({ recentBoards: updated });
    await AsyncStorage.setItem('zyrox_recent_boards', JSON.stringify(updated));
  },

  addNotebook: async (name, color, icon) => {
    const nb: Notebook = { id: `nb_${generateId()}`, name, color, icon, createdAt: Date.now(), boardIds: [] };
    const updated = [...get().notebooks, nb];
    set({ notebooks: updated });
    await AsyncStorage.setItem('zyrox_notebooks', JSON.stringify(updated));
  },

  deleteNotebook: async (id) => {
    const updated = get().notebooks.filter((n) => n.id !== id);
    set({ notebooks: updated });
    await AsyncStorage.setItem('zyrox_notebooks', JSON.stringify(updated));
  },

  addBoardToNotebook: async (notebookId, boardId) => {
    const updated = get().notebooks.map((n) =>
      n.id === notebookId ? { ...n, boardIds: [...n.boardIds, boardId] } : n
    );
    set({ notebooks: updated });
    await AsyncStorage.setItem('zyrox_notebooks', JSON.stringify(updated));
  },
}));
