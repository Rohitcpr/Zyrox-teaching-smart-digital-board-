import { create } from 'zustand';
import type { AppSettings } from '../types/app.types';

type GridType = 'none' | 'dots' | 'lines' | 'squares';

interface AppStore {
  settings: AppSettings;
  isColorPaletteOpen: boolean;
  isSizeSliderOpen: boolean;
  isOpacitySliderOpen: boolean;
  isGridPanelOpen: boolean;
  isShapePanelOpen: boolean;
  isBgPanelOpen: boolean;
  toastMessage: string;
  toastVisible: boolean;
  gridType: GridType;
  bgColor: string;
  toggleColorPalette: () => void;
  toggleSizeSlider: () => void;
  toggleOpacitySlider: () => void;
  toggleGridPanel: () => void;
  toggleShapePanel: () => void;
  toggleBgPanel: () => void;
  closeAllPanels: () => void;
  showToast: (message: string) => void;
  setGridType: (type: GridType) => void;
  setBgColor: (color: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  settings: {
    mode: 'teaching',
    autoSave: true,
    autoSaveInterval: 30000,
    hapticFeedback: true,
  },
  isColorPaletteOpen: false,
  isSizeSliderOpen: false,
  isOpacitySliderOpen: false,
  isGridPanelOpen: false,
  isShapePanelOpen: false,
  isBgPanelOpen: false,
  toastMessage: '',
  toastVisible: false,
  gridType: 'none',
  bgColor: '#0A0A0F',

  toggleColorPalette: () => set((s) => ({ isColorPaletteOpen: !s.isColorPaletteOpen, isSizeSliderOpen: false, isOpacitySliderOpen: false, isGridPanelOpen: false, isShapePanelOpen: false, isBgPanelOpen: false })),
  toggleSizeSlider: () => set((s) => ({ isSizeSliderOpen: !s.isSizeSliderOpen, isColorPaletteOpen: false, isOpacitySliderOpen: false, isGridPanelOpen: false, isShapePanelOpen: false, isBgPanelOpen: false })),
  toggleOpacitySlider: () => set((s) => ({ isOpacitySliderOpen: !s.isOpacitySliderOpen, isColorPaletteOpen: false, isSizeSliderOpen: false, isGridPanelOpen: false, isShapePanelOpen: false, isBgPanelOpen: false })),
  toggleGridPanel: () => set((s) => ({ isGridPanelOpen: !s.isGridPanelOpen, isColorPaletteOpen: false, isSizeSliderOpen: false, isOpacitySliderOpen: false, isShapePanelOpen: false, isBgPanelOpen: false })),
  toggleShapePanel: () => set((s) => ({ isShapePanelOpen: !s.isShapePanelOpen, isColorPaletteOpen: false, isSizeSliderOpen: false, isOpacitySliderOpen: false, isGridPanelOpen: false, isBgPanelOpen: false })),
  toggleBgPanel: () => set((s) => ({ isBgPanelOpen: !s.isBgPanelOpen, isColorPaletteOpen: false, isSizeSliderOpen: false, isOpacitySliderOpen: false, isGridPanelOpen: false, isShapePanelOpen: false })),
  closeAllPanels: () => set({ isColorPaletteOpen: false, isSizeSliderOpen: false, isOpacitySliderOpen: false, isGridPanelOpen: false, isShapePanelOpen: false, isBgPanelOpen: false }),
  showToast: (message) => { set({ toastMessage: message, toastVisible: true }); setTimeout(() => set({ toastVisible: false }), 2000); },
  setGridType: (type) => set({ gridType: type }),
  setBgColor: (color) => set({ bgColor: color }),
  updateSettings: (partial) => set((s) => ({ settings: { ...s.settings, ...partial } })),
}));
