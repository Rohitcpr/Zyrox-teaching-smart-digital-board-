import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { useAppStore } from '../store/useAppStore';

export const useAutoSave = (pageId: string) => {
  const isDirty = useCanvasStore((s) => s.isDirty);
  const saveCanvas = useCanvasStore((s) => s.saveCanvas);
  const autoSave = useAppStore((s) => s.settings.autoSave);
  const interval = useAppStore((s) => s.settings.autoSaveInterval);
  const showToast = useAppStore((s) => s.showToast);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoSave || !isDirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveCanvas(pageId);
      showToast('✓ Saved');
    }, interval);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isDirty, autoSave, interval, pageId, saveCanvas, showToast]);
};
