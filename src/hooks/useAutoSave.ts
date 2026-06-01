import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export const useAutoSave = (pageId: string) => {
  const saveCanvas = useCanvasStore((s) => s.saveCanvas);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (isDirty) {
        try {
          await saveCanvas(pageId);
        } catch (e) {}
      }
    }, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pageId, isDirty]);
};
