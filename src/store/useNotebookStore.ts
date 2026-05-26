import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "../utils/strokeUtils";

export interface BoardEntry {
  id: string;
  pageId: string;
  name: string;
  savedAt: number;
  folder: string;
  chapterId?: string;
  notebookId?: string;
  tags?: string[];
}

export interface Chapter {
  id: string;
  name: string;
  notebookId: string;
  createdAt: number;
  boardCount: number;
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  chapters: Chapter[];
}

interface NotebookStore {
  recentBoards: BoardEntry[];
  notebooks: Notebook[];

  // Recent boards
  loadRecent: () => Promise<void>;
  saveToRecent: (pageId: string, name?: string, notebookId?: string, chapterId?: string, tags?: string[]) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateBoardName: (id: string, name: string) => Promise<void>;

  // Notebooks
  loadNotebooks: () => Promise<void>;
  createNotebook: (name: string, color: string, icon: string) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;

  // Chapters
  createChapter: (notebookId: string, name: string) => Promise<void>;
  deleteChapter: (notebookId: string, chapterId: string) => Promise<void>;

  // Search
  searchBoards: (query: string) => BoardEntry[];
  getBoardsByNotebook: (notebookId: string) => BoardEntry[];
  getBoardsByChapter: (chapterId: string) => BoardEntry[];
  getBoardsByTag: (tag: string) => BoardEntry[];
}

const formatDateTime = (): string => {
  const now = new Date();
  const date = now.getDate().toString().padStart(2, "0") + "/" + (now.getMonth() + 1).toString().padStart(2, "0") + "/" + now.getFullYear();
  const time = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  return date + " " + time;
};

const BOARDS_KEY = "zyrox_recent_boards";
const NOTEBOOKS_KEY = "zyrox_notebooks";

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  recentBoards: [],
  notebooks: [],

  loadRecent: async () => {
    try {
      const raw = await AsyncStorage.getItem(BOARDS_KEY);
      if (raw) set({ recentBoards: JSON.parse(raw) });
    } catch (e) { console.error(e); }
  },

  saveToRecent: async (pageId, name, notebookId, chapterId, tags) => {
    try {
      const entry: BoardEntry = {
        id: generateId(),
        pageId,
        name: name ?? "Board - " + formatDateTime(),
        savedAt: Date.now(),
        folder: "Recent Boards",
        notebookId,
        chapterId,
        tags: tags ?? [],
      };
      const current = get().recentBoards;
      const filtered = current.filter((b) => b.pageId !== pageId);
      const updated = [entry, ...filtered].slice(0, 50);
      set({ recentBoards: updated });
      await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(updated));
    } catch (e) { console.error(e); }
  },

  deleteEntry: async (id) => {
    const updated = get().recentBoards.filter((b) => b.id !== id);
    set({ recentBoards: updated });
    await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(updated));
  },

  updateBoardName: async (id, name) => {
    const updated = get().recentBoards.map((b) => b.id === id ? { ...b, name } : b);
    set({ recentBoards: updated });
    await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(updated));
  },

  loadNotebooks: async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTEBOOKS_KEY);
      if (raw) {
        set({ notebooks: JSON.parse(raw) });
      } else {
        // Default notebooks
        const defaults: Notebook[] = [
          { id: "nb_sci",  name: "Science",     color: "#22C55E", icon: "flask",       createdAt: Date.now(), chapters: [{ id: "ch_001", name: "Chapter 1", notebookId: "nb_sci",  createdAt: Date.now(), boardCount: 0 }] },
          { id: "nb_math", name: "Mathematics", color: "#3B82F6", icon: "calculator",  createdAt: Date.now(), chapters: [{ id: "ch_002", name: "Chapter 1", notebookId: "nb_math", createdAt: Date.now(), boardCount: 0 }] },
          { id: "nb_lang", name: "Language",    color: "#F97316", icon: "language",    createdAt: Date.now(), chapters: [{ id: "ch_003", name: "Chapter 1", notebookId: "nb_lang", createdAt: Date.now(), boardCount: 0 }] },
        ];
        set({ notebooks: defaults });
        await AsyncStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(defaults));
      }
    } catch (e) { console.error(e); }
  },

  createNotebook: async (name, color, icon) => {
    const nb: Notebook = {
      id: "nb_" + generateId(),
      name, color, icon,
      createdAt: Date.now(),
      chapters: [{ id: "ch_" + generateId(), name: "Chapter 1", notebookId: "", createdAt: Date.now(), boardCount: 0 }],
    };
    nb.chapters[0].notebookId = nb.id;
    const updated = [...get().notebooks, nb];
    set({ notebooks: updated });
    await AsyncStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(updated));
  },

  deleteNotebook: async (id) => {
    const updated = get().notebooks.filter((n) => n.id !== id);
    set({ notebooks: updated });
    await AsyncStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(updated));
  },

  createChapter: async (notebookId, name) => {
    const chapter: Chapter = {
      id: "ch_" + generateId(),
      name, notebookId,
      createdAt: Date.now(),
      boardCount: 0,
    };
    const updated = get().notebooks.map((nb) =>
      nb.id === notebookId ? { ...nb, chapters: [...nb.chapters, chapter] } : nb
    );
    set({ notebooks: updated });
    await AsyncStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(updated));
  },

  deleteChapter: async (notebookId, chapterId) => {
    const updated = get().notebooks.map((nb) =>
      nb.id === notebookId ? { ...nb, chapters: nb.chapters.filter((c) => c.id !== chapterId) } : nb
    );
    set({ notebooks: updated });
    await AsyncStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(updated));
  },

  searchBoards: (query) => {
    const q = query.toLowerCase();
    return get().recentBoards.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      (b.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  },

  getBoardsByNotebook: (notebookId) =>
    get().recentBoards.filter((b) => b.notebookId === notebookId),

  getBoardsByChapter: (chapterId) =>
    get().recentBoards.filter((b) => b.chapterId === chapterId),

  getBoardsByTag: (tag) =>
    get().recentBoards.filter((b) => (b.tags ?? []).includes(tag)),
}));
