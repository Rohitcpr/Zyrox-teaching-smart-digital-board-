export type AppMode = 'teaching' | 'presentation' | 'focus';

export interface AppSettings {
  mode: AppMode;
  autoSave: boolean;
  autoSaveInterval: number;
  hapticFeedback: boolean;
}
